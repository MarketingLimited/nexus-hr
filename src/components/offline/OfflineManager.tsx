import { useState, useEffect } from 'react';
import { WifiOff, Wifi, Download, Upload, Database, AlertTriangle, CheckCircle, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import useOffline from '@/hooks/useOffline';

interface SyncConflict {
  key: string;
  localData: any;
  remoteData: any;
  lastLocalUpdate: number;
  lastRemoteUpdate: number;
}

const OfflineManager = () => {
  const { toast } = useToast();
  const {
    isOnline,
    isInitialized,
    syncInProgress,
    queuedRequests,
    pendingConflicts,
    lastSyncTime,
    syncStats,
    syncData,
    getPendingConflicts,
    resolveConflict,
    getStorageStats,
    clearOfflineData
  } = useOffline({ module: 'offline-manager', autoSync: true });

  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [storageStats, setStorageStats] = useState<any>(null);
  const [selectedConflict, setSelectedConflict] = useState<SyncConflict | null>(null);

  // Load conflicts and storage stats
  useEffect(() => {
    const loadData = async () => {
      const [conflictsResult, statsResult] = await Promise.all([
        getPendingConflicts(),
        getStorageStats()
      ]);

      if (conflictsResult.conflicts) {
        setConflicts(conflictsResult.conflicts);
      }

      if (statsResult.stats) {
        setStorageStats(statsResult.stats);
      }
    };

    if (isInitialized) {
      loadData();
    }
  }, [isInitialized, pendingConflicts, getPendingConflicts, getStorageStats]);

  const handleSync = async () => {
    const result = await syncData();
    
    if (result.success) {
      toast({
        title: "Sync Completed",
        description: `Successfully synced ${result.result?.success || 0} requests.`,
      });
    } else {
      toast({
        title: "Sync Failed",
        description: result.error?.message || "Failed to sync data.",
        variant: "destructive",
      });
    }
  };

  const handleResolveConflict = async (conflict: SyncConflict, resolution: 'local' | 'remote') => {
    const dataToUse = resolution === 'local' ? conflict.localData : conflict.remoteData;
    
    const result = await resolveConflict(conflict.key, dataToUse);
    
    if (result.success) {
      setConflicts(prev => prev.filter(c => c.key !== conflict.key));
      setSelectedConflict(null);
      
      toast({
        title: "Conflict Resolved",
        description: `Used ${resolution} version of the data.`,
      });
    } else {
      toast({
        title: "Resolution Failed",
        description: result.error?.message || "Failed to resolve conflict.",
        variant: "destructive",
      });
    }
  };

  const handleClearOfflineData = async () => {
    const result = await clearOfflineData();
    
    if (result.success) {
      setStorageStats(null);
      
      toast({
        title: "Data Cleared",
        description: "All offline data has been cleared.",
      });
    } else {
      toast({
        title: "Clear Failed",
        description: result.error?.message || "Failed to clear offline data.",
        variant: "destructive",
      });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!isInitialized) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-3">Initializing offline capabilities...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
            Offline Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {isOnline ? (
                  <span className="text-green-600">Online</span>
                ) : (
                  <span className="text-red-600">Offline</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Connection Status</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">{queuedRequests}</div>
              <p className="text-sm text-muted-foreground">Queued Requests</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">{pendingConflicts}</div>
              <p className="text-sm text-muted-foreground">Pending Conflicts</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">
                {lastSyncTime ? formatTimestamp(lastSyncTime).split(' ')[1] : 'Never'}
              </div>
              <p className="text-sm text-muted-foreground">Last Sync</p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button 
              onClick={handleSync} 
              disabled={!isOnline || syncInProgress}
              className="gap-2"
            >
              {syncInProgress ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Syncing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Sync Now
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={handleClearOfflineData} className="gap-2">
              <Database className="h-4 w-4" />
              Clear Offline Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Offline Alerts */}
      {!isOnline && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            <strong>Working Offline:</strong> Your changes are being saved locally and will sync when you're back online.
          </AlertDescription>
        </Alert>
      )}

      {pendingConflicts > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Sync Conflicts Detected:</strong> {pendingConflicts} data conflicts need your attention.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="storage" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          <TabsTrigger value="sync-stats">Sync Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Offline Storage Usage</CardTitle>
            </CardHeader>
            <CardContent>
              {storageStats ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Storage Used</span>
                    <span className="text-lg font-bold">{formatBytes(storageStats.totalSize)}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold">Storage by Module</h4>
                    {Object.entries(storageStats.modulesSizes).map(([module, size]) => (
                      <div key={module} className="flex justify-between items-center">
                        <span className="capitalize">{module}</span>
                        <Badge variant="outline">{formatBytes(size as number)}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Loading storage statistics...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Conflicts</CardTitle>
            </CardHeader>
            <CardContent>
              {conflicts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-muted-foreground">No conflicts to resolve</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conflicts.map((conflict) => (
                    <div key={conflict.key} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{conflict.key}</h4>
                          <p className="text-sm text-muted-foreground">
                            Local: {formatTimestamp(conflict.lastLocalUpdate)} | 
                            Remote: {formatTimestamp(conflict.lastRemoteUpdate)}
                          </p>
                        </div>
                        <Badge variant="destructive">Conflict</Badge>
                      </div>
                      
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedConflict(conflict)}>
                              Resolve
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Resolve Data Conflict</DialogTitle>
                            </DialogHeader>
                            
                            {selectedConflict && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-3">
                                    <h4 className="font-semibold">Local Version</h4>
                                    <div className="p-3 bg-muted rounded-lg">
                                      <pre className="text-sm overflow-auto max-h-60">
                                        {JSON.stringify(selectedConflict.localData, null, 2)}
                                      </pre>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      Last modified: {formatTimestamp(selectedConflict.lastLocalUpdate)}
                                    </p>
                                    <Button 
                                      className="w-full"
                                      onClick={() => handleResolveConflict(selectedConflict, 'local')}
                                    >
                                      Use Local Version
                                    </Button>
                                  </div>
                                  
                                  <div className="space-y-3">
                                    <h4 className="font-semibold">Remote Version</h4>
                                    <div className="p-3 bg-muted rounded-lg">
                                      <pre className="text-sm overflow-auto max-h-60">
                                        {JSON.stringify(selectedConflict.remoteData, null, 2)}
                                      </pre>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      Last modified: {formatTimestamp(selectedConflict.lastRemoteUpdate)}
                                    </p>
                                    <Button 
                                      variant="outline"
                                      className="w-full"
                                      onClick={() => handleResolveConflict(selectedConflict, 'remote')}
                                    >
                                      Use Remote Version
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync-stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Synchronization Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{syncStats.success}</div>
                  <p className="text-sm text-muted-foreground">Successful Syncs</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{syncStats.failed}</div>
                  <p className="text-sm text-muted-foreground">Failed Syncs</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold">{syncStats.total}</div>
                  <p className="text-sm text-muted-foreground">Total Attempts</p>
                </div>
              </div>

              {syncStats.total > 0 && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Success Rate</span>
                    <span className="text-sm">
                      {Math.round((syncStats.success / syncStats.total) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(syncStats.success / syncStats.total) * 100} 
                    className="h-2"
                  />
                </div>
              )}

              {lastSyncTime && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Last Sync</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatTimestamp(lastSyncTime)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OfflineManager;