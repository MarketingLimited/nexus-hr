import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  Fingerprint, 
  MapPin, 
  Wifi, 
  WifiOff,
  CheckCircle,
  AlertCircle,
  Camera,
  Smartphone
} from 'lucide-react';

interface BiometricData {
  type: 'fingerprint' | 'face' | 'card' | 'geolocation';
  confidence: number;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  timestamp: string;
  type: 'check-in' | 'check-out' | 'break-start' | 'break-end';
  method: 'biometric' | 'geolocation' | 'manual';
  location?: string;
  isOfflineSync?: boolean;
}

export const BiometricClockIn: React.FC = () => {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isProcessing, setBiometricProcessing] = useState(false);
  const [biometricProgress, setBiometricProgress] = useState(0);
  const [lastAction, setLastAction] = useState<AttendanceRecord | null>(null);
  const [pendingRecords, setPendingRecords] = useState<AttendanceRecord[]>([]);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingRecords();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load pending records from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('pendingAttendanceRecords');
    if (stored) {
      setPendingRecords(JSON.parse(stored));
    }
  }, []);

  const simulateBiometricScan = async (type: 'fingerprint' | 'face' | 'card'): Promise<BiometricData> => {
    setBiometricProcessing(true);
    setBiometricProgress(0);

    // Simulate biometric scanning progress
    for (let i = 0; i <= 100; i += 10) {
      setBiometricProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const confidence = Math.random() * 30 + 70; // 70-100% confidence
    setBiometricProcessing(false);
    
    return {
      type,
      confidence,
    };
  };

  const getGeolocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  const createAttendanceRecord = (
    type: AttendanceRecord['type'],
    method: AttendanceRecord['method'],
    biometricData?: BiometricData
  ): AttendanceRecord => {
    return {
      id: `attendance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      employeeId: 'current-user', // This would come from auth context
      timestamp: new Date().toISOString(),
      type,
      method,
      location: biometricData?.location ? 
        `${biometricData.location.latitude.toFixed(6)}, ${biometricData.location.longitude.toFixed(6)}` : 
        undefined,
      isOfflineSync: !isOnline,
    };
  };

  const saveToLocalStorage = (record: AttendanceRecord) => {
    const updated = [...pendingRecords, record];
    setPendingRecords(updated);
    localStorage.setItem('pendingAttendanceRecords', JSON.stringify(updated));
  };

  const syncPendingRecords = async () => {
    if (pendingRecords.length === 0) return;

    try {
      // Simulate API sync
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear pending records after successful sync
      setPendingRecords([]);
      localStorage.removeItem('pendingAttendanceRecords');
      
      toast({
        title: "Sync Complete",
        description: `${pendingRecords.length} offline records synced successfully.`,
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync offline records. Will retry when connection is restored.",
        variant: "destructive",
      });
    }
  };

  const handleClockAction = async (
    actionType: AttendanceRecord['type'],
    method: 'biometric' | 'geolocation' | 'manual' = 'manual'
  ) => {
    try {
      let biometricData: BiometricData | undefined;

      if (method === 'biometric') {
        // For demo, we'll simulate fingerprint scan
        biometricData = await simulateBiometricScan('fingerprint');
        
        if (biometricData.confidence < 75) {
          toast({
            title: "Biometric Scan Failed",
            description: `Low confidence (${biometricData.confidence.toFixed(1)}%). Please try again.`,
            variant: "destructive",
          });
          return;
        }
      }

      if (method === 'geolocation') {
        try {
          const position = await getGeolocation();
          biometricData = {
            type: 'geolocation',
            confidence: 100,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            }
          };
        } catch (error) {
          toast({
            title: "Location Access Failed",
            description: "Unable to get your location. Using manual check-in instead.",
            variant: "destructive",
          });
          method = 'manual';
        }
      }

      const record = createAttendanceRecord(actionType, method, biometricData);
      setLastAction(record);

      if (isOnline) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        toast({
          title: "Success",
          description: `${actionType.replace('-', ' ')} recorded successfully.`,
        });
      } else {
        saveToLocalStorage(record);
        toast({
          title: "Offline Mode",
          description: `${actionType.replace('-', ' ')} saved locally. Will sync when online.`,
        });
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record attendance. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Real-time Clock */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <div className="text-4xl font-mono font-bold text-primary">
              {formatTime(currentTime)}
            </div>
            <div className="text-muted-foreground">
              {formatDate(currentTime)}
            </div>
            <div className="flex items-center justify-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-orange-500">Offline Mode</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Biometric Scanner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5" />
            Biometric Clock-In/Out
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isProcessing && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Scanning biometric data...</div>
              <Progress value={biometricProgress} className="w-full" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleClockAction('check-in', 'biometric')}
              disabled={isProcessing}
              className="h-16 flex flex-col gap-1"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Clock In</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleClockAction('check-out', 'biometric')}
              disabled={isProcessing}
              className="h-16 flex flex-col gap-1"
            >
              <Clock className="w-5 h-5" />
              <span>Clock Out</span>
            </Button>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={() => handleClockAction('break-start', 'biometric')}
              disabled={isProcessing}
              className="h-12 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              Start Break
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleClockAction('break-end', 'biometric')}
              disabled={isProcessing}
              className="h-12 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              End Break
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alternative Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Alternative Methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            onClick={() => handleClockAction('check-in', 'geolocation')}
            className="w-full justify-start gap-2"
          >
            <MapPin className="w-4 h-4" />
            Geolocation Check-In
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleClockAction('check-in', 'manual')}
            className="w-full justify-start gap-2"
          >
            <Smartphone className="w-4 h-4" />
            Manual Check-In
          </Button>
        </CardContent>
      </Card>

      {/* Last Action */}
      {lastAction && (
        <Card>
          <CardHeader>
            <CardTitle>Last Action</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">
                  {lastAction.type.replace('-', ' ').toUpperCase()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(lastAction.timestamp).toLocaleString()}
                </div>
                <Badge variant={lastAction.method === 'biometric' ? 'default' : 'secondary'}>
                  {lastAction.method}
                </Badge>
              </div>
              {lastAction.isOfflineSync && (
                <Badge variant="outline" className="text-orange-500">
                  Pending Sync
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Offline Records */}
      {pendingRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pending Sync ({pendingRecords.length})</span>
              {isOnline && (
                <Button size="sm" onClick={syncPendingRecords}>
                  Sync Now
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingRecords.slice(-3).map((record) => (
                <div key={record.id} className="flex justify-between items-center text-sm">
                  <span>{record.type.replace('-', ' ')}</span>
                  <span className="text-muted-foreground">
                    {new Date(record.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};