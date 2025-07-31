import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Database, 
  Upload,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  HardDrive
} from 'lucide-react';

interface OfflineRecord {
  id: string;
  type: 'attendance' | 'leave' | 'timesheet';
  action: string;
  data: any;
  timestamp: string;
  synced: boolean;
  retryCount: number;
  lastError?: string;
}

interface SyncStats {
  totalRecords: number;
  pendingSync: number;
  syncedToday: number;
  lastSyncTime?: string;
  storageUsed: number;
  storageLimit: number;
}

export const OfflineAttendanceSync: React.FC = () => {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineRecords, setOfflineRecords] = useState<OfflineRecord[]>([]);
  const [syncStats, setSyncStats] = useState<SyncStats>({
    totalRecords: 0,
    pendingSync: 0,
    syncedToday: 0,
    storageUsed: 0,
    storageLimit: 5 * 1024 * 1024 // 5MB limit
  });
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

  // Load offline records from localStorage
  useEffect(() => {
    loadOfflineRecords();
    calculateSyncStats();
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (autoSyncEnabled) {
        setTimeout(() => syncOfflineRecords(), 1000); // Delay to ensure connection is stable
      }
      toast({
        title: "Connection Restored",
        description: "Back online. Syncing pending records...",
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Connection Lost",
        description: "Working in offline mode. Data will sync when connection is restored.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [autoSyncEnabled]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && autoSyncEnabled && offlineRecords.some(r => !r.synced)) {
      const timer = setTimeout(() => {
        syncOfflineRecords();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, autoSyncEnabled, offlineRecords]);

  const loadOfflineRecords = () => {
    const storedRecords = localStorage.getItem('offlineAttendanceRecords');
    if (storedRecords) {
      try {
        const records = JSON.parse(storedRecords);
        setOfflineRecords(records);
      } catch (error) {
        console.error('Failed to load offline records:', error);
        localStorage.removeItem('offlineAttendanceRecords');
      }
    }
  };

  const saveOfflineRecords = (records: OfflineRecord[]) => {
    try {
      localStorage.setItem('offlineAttendanceRecords', JSON.stringify(records));
      setOfflineRecords(records);
      calculateSyncStats();
    } catch (error) {
      console.error('Failed to save offline records:', error);
      toast({
        title: "Storage Error",
        description: "Failed to save offline data. Storage may be full.",
        variant: "destructive",
      });
    }
  };

  const calculateSyncStats = useCallback(() => {
    const totalRecords = offlineRecords.length;
    const pendingSync = offlineRecords.filter(r => !r.synced).length;
    const today = new Date().toDateString();
    const syncedToday = offlineRecords.filter(r => 
      r.synced && new Date(r.timestamp).toDateString() === today
    ).length;
    
    const storageUsed = new Blob([JSON.stringify(offlineRecords)]).size;
    const lastSyncTime = offlineRecords
      .filter(r => r.synced)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]?.timestamp;

    setSyncStats({
      totalRecords,
      pendingSync,
      syncedToday,
      lastSyncTime,
      storageUsed,
      storageLimit: 5 * 1024 * 1024
    });
  }, [offlineRecords]);

  useEffect(() => {
    calculateSyncStats();
  }, [offlineRecords, calculateSyncStats]);

  const addOfflineRecord = (type: OfflineRecord['type'], action: string, data: any) => {
    const newRecord: OfflineRecord = {
      id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      action,
      data,
      timestamp: new Date().toISOString(),
      synced: false,
      retryCount: 0
    };

    const updatedRecords = [...offlineRecords, newRecord];
    saveOfflineRecords(updatedRecords);

    toast({
      title: "Data Saved Offline",
      description: `${action} saved locally. Will sync when online.`,
    });
  };

  const syncOfflineRecords = async () => {
    if (!isOnline || isSyncing) return;

    const pendingRecords = offlineRecords.filter(r => !r.synced);
    if (pendingRecords.length === 0) {
      toast({
        title: "All Synced",
        description: "No pending records to sync.",
      });
      return;
    }

    setIsSyncing(true);
    setSyncProgress(0);

    try {
      for (let i = 0; i < pendingRecords.length; i++) {
        const record = pendingRecords[i];
        setSyncProgress(((i + 1) / pendingRecords.length) * 100);

        try {
          // Simulate API sync with retry logic
          await new Promise((resolve, reject) => {
            setTimeout(() => {
              // Simulate occasional failures for demo
              if (Math.random() < 0.1 && record.retryCount < 3) {
                reject(new Error('Network timeout'));
              } else {
                resolve(true);
              }
            }, 500 + Math.random() * 1000);
          });

          // Mark as synced
          const recordIndex = offlineRecords.findIndex(r => r.id === record.id);
          if (recordIndex !== -1) {
            const updatedRecords = [...offlineRecords];
            updatedRecords[recordIndex] = { ...record, synced: true };
            saveOfflineRecords(updatedRecords);
          }

        } catch (error) {
          // Handle sync failure
          const recordIndex = offlineRecords.findIndex(r => r.id === record.id);
          if (recordIndex !== -1) {
            const updatedRecords = [...offlineRecords];
            updatedRecords[recordIndex] = { 
              ...record, 
              retryCount: record.retryCount + 1,
              lastError: error instanceof Error ? error.message : 'Sync failed'
            };
            saveOfflineRecords(updatedRecords);
          }
        }
      }

      const successCount = offlineRecords.filter(r => r.synced).length - 
                          (offlineRecords.length - pendingRecords.length);
      
      toast({
        title: "Sync Complete",
        description: `${successCount} records synced successfully.`,
      });

    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync offline records. Will retry automatically.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  const clearSyncedRecords = () => {
    const unsyncedRecords = offlineRecords.filter(r => !r.synced);
    saveOfflineRecords(unsyncedRecords);
    toast({
      title: "Storage Cleaned",
      description: "Synced records have been cleared from local storage.",
    });
  };

  const retryFailedRecords = async () => {
    const failedRecords = offlineRecords.filter(r => !r.synced && r.retryCount > 0);
    if (failedRecords.length === 0) return;

    // Reset retry count for failed records
    const updatedRecords = offlineRecords.map(r => 
      !r.synced && r.retryCount > 0 ? { ...r, retryCount: 0, lastError: undefined } : r
    );
    saveOfflineRecords(updatedRecords);

    // Trigger sync
    await syncOfflineRecords();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <>
                  <Wifi className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="font-medium text-green-700">Online</div>
                    <div className="text-sm text-muted-foreground">Connected and ready to sync</div>
                  </div>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="font-medium text-orange-700">Offline Mode</div>
                    <div className="text-sm text-muted-foreground">Data will sync when connection is restored</div>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
              >
                Auto-sync: {autoSyncEnabled ? 'ON' : 'OFF'}
              </Button>
              {isOnline && (
                <Button
                  size="sm"
                  onClick={syncOfflineRecords}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Sync Now
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Progress */}
      {isSyncing && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Syncing offline records...</span>
                <span>{Math.round(syncProgress)}%</span>
              </div>
              <Progress value={syncProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Database className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{syncStats.totalRecords}</div>
            <div className="text-sm text-muted-foreground">Total Records</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{syncStats.pendingSync}</div>
            <div className="text-sm text-muted-foreground">Pending Sync</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{syncStats.syncedToday}</div>
            <div className="text-sm text-muted-foreground">Synced Today</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <HardDrive className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div className="text-lg font-bold">
              {formatBytes(syncStats.storageUsed)}
            </div>
            <div className="text-sm text-muted-foreground">
              of {formatBytes(syncStats.storageLimit)} used
            </div>
            <Progress 
              value={(syncStats.storageUsed / syncStats.storageLimit) * 100} 
              className="w-full mt-2 h-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Offline Records */}
      {offlineRecords.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Offline Records ({offlineRecords.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryFailedRecords}
                  disabled={!offlineRecords.some(r => !r.synced && r.retryCount > 0)}
                >
                  Retry Failed
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSyncedRecords}
                  disabled={!offlineRecords.some(r => r.synced)}
                >
                  Clear Synced
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {offlineRecords.slice().reverse().map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {record.synced ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : record.lastError ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-orange-500" />
                    )}
                    <div>
                      <div className="font-medium">{record.action}</div>
                      <div className="text-sm text-muted-foreground">
                        {record.type} • {formatTime(record.timestamp)}
                      </div>
                      {record.lastError && (
                        <div className="text-xs text-red-500">
                          Error: {record.lastError} (Retry {record.retryCount}/3)
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={record.synced ? 'default' : record.lastError ? 'destructive' : 'secondary'}>
                      {record.synced ? 'Synced' : record.lastError ? 'Failed' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Sync Info */}
      {syncStats.lastSyncTime && (
        <Card>
          <CardContent className="p-4">
            <div className="text-center text-sm text-muted-foreground">
              Last successful sync: {formatTime(syncStats.lastSyncTime)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demo Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            onClick={() => addOfflineRecord('attendance', 'Clock In Demo', { location: 'Office' })}
            className="w-full"
          >
            Simulate Offline Clock-In
          </Button>
          <Button
            variant="outline"
            onClick={() => addOfflineRecord('leave', 'Leave Request Demo', { days: 2 })}
            className="w-full"
          >
            Simulate Offline Leave Request
          </Button>
          <Button
            variant="outline"
            onClick={() => addOfflineRecord('timesheet', 'Timesheet Update Demo', { hours: 8 })}
            className="w-full"
          >
            Simulate Offline Timesheet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};