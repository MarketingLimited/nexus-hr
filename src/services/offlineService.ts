// Offline Service for local data management and synchronization
interface OfflineData {
  key: string;
  module: string;
  data: any;
  lastSync: number;
  version: number;
  encrypted: boolean;
}

interface SyncConflict {
  key: string;
  localData: any;
  remoteData: any;
  lastLocalUpdate: number;
  lastRemoteUpdate: number;
}

interface QueuedRequest {
  id?: number;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
  retryCount: number;
  module: string;
}

class OfflineService {
  private db: IDBDatabase | null = null;
  private syncInProgress = false;
  private eventListeners: { [key: string]: Function[] } = {};

  async initialize(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open('HROfflineDB', 2);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.setupAutoSync();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Requests store for offline queue
        if (!db.objectStoreNames.contains('requests')) {
          const requestStore = db.createObjectStore('requests', {
            keyPath: 'id',
            autoIncrement: true
          });
          requestStore.createIndex('timestamp', 'timestamp');
          requestStore.createIndex('module', 'module');
        }

        // Data store for cached data
        if (!db.objectStoreNames.contains('data')) {
          const dataStore = db.createObjectStore('data', { keyPath: 'key' });
          dataStore.createIndex('module', 'module');
          dataStore.createIndex('lastSync', 'lastSync');
        }

        // Conflicts store for sync conflicts
        if (!db.objectStoreNames.contains('conflicts')) {
          const conflictStore = db.createObjectStore('conflicts', { keyPath: 'key' });
          conflictStore.createIndex('module', 'module');
        }

        // Settings store for offline configuration
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  // Store data locally with optional encryption
  async storeData(module: string, key: string, data: any, encrypt = false): Promise<void> {
    if (!this.db) await this.initialize();

    const processedData = encrypt ? await this.encryptData(data) : data;
    
    const offlineData: OfflineData = {
      key: `${module}:${key}`,
      module,
      data: processedData,
      lastSync: Date.now(),
      version: 1,
      encrypted: encrypt
    };

    const transaction = this.db!.transaction(['data'], 'readwrite');
    const store = transaction.objectStore('data');
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(offlineData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    this.emit('dataStored', { module, key, data });
  }

  // Retrieve data from local storage
  async getData(module: string, key: string): Promise<any> {
    if (!this.db) await this.initialize();

    const transaction = this.db!.transaction(['data'], 'readonly');
    const store = transaction.objectStore('data');
    
    return new Promise((resolve, reject) => {
      const request = store.get(`${module}:${key}`);
      
      request.onsuccess = async () => {
        const result = request.result as OfflineData | undefined;
        
        if (!result) {
          resolve(null);
          return;
        }

        const data = result.encrypted 
          ? await this.decryptData(result.data)
          : result.data;
          
        resolve(data);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Get all data for a module
  async getModuleData(module: string): Promise<{ [key: string]: any }> {
    if (!this.db) await this.initialize();

    const transaction = this.db!.transaction(['data'], 'readonly');
    const store = transaction.objectStore('data');
    const index = store.index('module');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(module);
      
      request.onsuccess = async () => {
        const results = request.result as OfflineData[];
        const moduleData: { [key: string]: any } = {};
        
        for (const item of results) {
          const key = item.key.replace(`${module}:`, '');
          moduleData[key] = item.encrypted 
            ? await this.decryptData(item.data)
            : item.data;
        }
        
        resolve(moduleData);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Queue request for offline sync
  async queueRequest(
    url: string, 
    method: string, 
    body?: any, 
    headers: Record<string, string> = {},
    module = 'general'
  ): Promise<void> {
    if (!this.db) await this.initialize();

    const queuedRequest: QueuedRequest = {
      url,
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      timestamp: Date.now(),
      retryCount: 0,
      module
    };

    const transaction = this.db!.transaction(['requests'], 'readwrite');
    const store = transaction.objectStore('requests');
    
    await new Promise<void>((resolve, reject) => {
      const request = store.add(queuedRequest);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    this.emit('requestQueued', queuedRequest);
  }

  // Sync queued requests when online
  async syncQueuedRequests(): Promise<{ success: number; failed: number }> {
    if (!this.db || this.syncInProgress) return { success: 0, failed: 0 };

    this.syncInProgress = true;
    let success = 0;
    let failed = 0;

    try {
      const transaction = this.db.transaction(['requests'], 'readwrite');
      const store = transaction.objectStore('requests');
      
      const allRequests = await new Promise<QueuedRequest[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      for (const queuedRequest of allRequests) {
        try {
          const response = await fetch(queuedRequest.url, {
            method: queuedRequest.method,
            headers: queuedRequest.headers,
            body: queuedRequest.body
          });

          if (response.ok) {
            // Remove successful request from queue
            await new Promise<void>((resolve, reject) => {
              const deleteRequest = store.delete(queuedRequest.id!);
              deleteRequest.onsuccess = () => resolve();
              deleteRequest.onerror = () => reject(deleteRequest.error);
            });
            success++;
            this.emit('requestSynced', queuedRequest);
          } else {
            // Increment retry count
            queuedRequest.retryCount++;
            if (queuedRequest.retryCount < 3) {
              await new Promise<void>((resolve, reject) => {
                const updateRequest = store.put(queuedRequest);
                updateRequest.onsuccess = () => resolve();
                updateRequest.onerror = () => reject(updateRequest.error);
              });
            } else {
              // Remove after 3 failed attempts
              await new Promise<void>((resolve, reject) => {
                const deleteRequest = store.delete(queuedRequest.id!);
                deleteRequest.onsuccess = () => resolve();
                deleteRequest.onerror = () => reject(deleteRequest.error);
              });
            }
            failed++;
          }
        } catch (error) {
          console.error('Sync failed for request:', queuedRequest.url, error);
          failed++;
        }
      }
    } finally {
      this.syncInProgress = false;
    }

    this.emit('syncCompleted', { success, failed });
    return { success, failed };
  }

  // Handle sync conflicts with resolution strategies
  async handleSyncConflict(
    key: string, 
    localData: any, 
    remoteData: any, 
    strategy: 'local' | 'remote' | 'merge' | 'prompt' = 'prompt'
  ): Promise<any> {
    const conflict: SyncConflict = {
      key,
      localData,
      remoteData,
      lastLocalUpdate: localData.lastModified || Date.now(),
      lastRemoteUpdate: remoteData.lastModified || Date.now()
    };

    switch (strategy) {
      case 'local':
        return localData;
      
      case 'remote':
        return remoteData;
      
      case 'merge':
        return this.mergeData(localData, remoteData);
      
      case 'prompt':
      default:
        // Store conflict for user resolution
        await this.storeConflict(conflict);
        this.emit('conflictDetected', conflict);
        return localData; // Keep local until resolved
    }
  }

  // Store sync conflict for user resolution
  private async storeConflict(conflict: SyncConflict): Promise<void> {
    if (!this.db) await this.initialize();

    const transaction = this.db!.transaction(['conflicts'], 'readwrite');
    const store = transaction.objectStore('conflicts');
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(conflict);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get pending conflicts
  async getPendingConflicts(): Promise<SyncConflict[]> {
    if (!this.db) await this.initialize();

    const transaction = this.db!.transaction(['conflicts'], 'readonly');
    const store = transaction.objectStore('conflicts');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Resolve conflict
  async resolveConflict(key: string, resolvedData: any): Promise<void> {
    if (!this.db) await this.initialize();

    const transaction = this.db!.transaction(['conflicts', 'data'], 'readwrite');
    const conflictStore = transaction.objectStore('conflicts');
    const dataStore = transaction.objectStore('data');
    
    // Remove conflict
    await new Promise<void>((resolve, reject) => {
      const deleteRequest = conflictStore.delete(key);
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    });

    // Update data
    const [module, dataKey] = key.split(':');
    await this.storeData(module, dataKey, resolvedData);
    
    this.emit('conflictResolved', { key, resolvedData });
  }

  // Simple data merging strategy
  private mergeData(localData: any, remoteData: any): any {
    if (typeof localData !== 'object' || typeof remoteData !== 'object') {
      // For non-objects, prefer remote if more recent
      return remoteData.lastModified > localData.lastModified ? remoteData : localData;
    }

    // Merge objects, preferring non-null values
    const merged = { ...localData };
    
    for (const [key, value] of Object.entries(remoteData)) {
      if (value !== null && value !== undefined) {
        if (merged[key] === null || merged[key] === undefined) {
          merged[key] = value;
        } else if (Array.isArray(value) && Array.isArray(merged[key])) {
          // Merge arrays by combining unique values
          merged[key] = [...new Set([...merged[key], ...value])];
        } else if (typeof value === 'object' && typeof merged[key] === 'object') {
          // Recursively merge nested objects
          merged[key] = this.mergeData(merged[key], value);
        } else {
          // For primitives, prefer the more recent value
          const localTime = localData.lastModified || 0;
          const remoteTime = remoteData.lastModified || 0;
          merged[key] = remoteTime > localTime ? value : merged[key];
        }
      }
    }

    merged.lastModified = Math.max(
      localData.lastModified || 0,
      remoteData.lastModified || 0
    );

    return merged;
  }

  // Set up automatic sync when online
  private setupAutoSync(): void {
    // Sync when online
    window.addEventListener('online', () => {
      this.syncQueuedRequests();
      this.emit('networkStatusChanged', { online: true });
    });

    window.addEventListener('offline', () => {
      this.emit('networkStatusChanged', { online: false });
    });

    // Periodic sync every 5 minutes when online
    setInterval(() => {
      if (navigator.onLine) {
        this.syncQueuedRequests();
      }
    }, 5 * 60 * 1000);
  }

  // Encrypt sensitive data
  private async encryptData(data: any): Promise<string> {
    const key = await this.getEncryptionKey();
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: crypto.getRandomValues(new Uint8Array(12)) },
      key,
      dataBuffer
    );

    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }

  // Decrypt sensitive data
  private async decryptData(encryptedData: string): Promise<any> {
    try {
      const key = await this.getEncryptionKey();
      const encrypted = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: encrypted.slice(0, 12) },
        key,
        encrypted.slice(12)
      );

      const decoder = new TextDecoder();
      return JSON.parse(decoder.decode(decrypted));
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  // Get or generate encryption key
  private async getEncryptionKey(): Promise<CryptoKey> {
    let keyData = localStorage.getItem('hr-encryption-key');
    
    if (!keyData) {
      const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      
      const exported = await crypto.subtle.exportKey('jwk', key);
      localStorage.setItem('hr-encryption-key', JSON.stringify(exported));
      return key;
    }

    const keyObject = JSON.parse(keyData);
    return crypto.subtle.importKey(
      'jwk',
      keyObject,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Event system for offline service
  on(event: string, callback: Function): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  off(event: string, callback: Function): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data?: any): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  // Get offline storage statistics
  async getStorageStats(): Promise<{
    totalSize: number;
    modulesSizes: { [module: string]: number };
    queuedRequests: number;
    pendingConflicts: number;
  }> {
    if (!this.db) await this.initialize();

    const [moduleData, queuedRequests, conflicts] = await Promise.all([
      this.getAllModuleData(),
      this.getQueuedRequests(),
      this.getPendingConflicts()
    ]);

    const modulesSizes: { [module: string]: number } = {};
    let totalSize = 0;

    for (const [module, data] of Object.entries(moduleData)) {
      const size = new Blob([JSON.stringify(data)]).size;
      modulesSizes[module] = size;
      totalSize += size;
    }

    return {
      totalSize,
      modulesSizes,
      queuedRequests: queuedRequests.length,
      pendingConflicts: conflicts.length
    };
  }

  private async getAllModuleData(): Promise<{ [module: string]: any }> {
    const transaction = this.db!.transaction(['data'], 'readonly');
    const store = transaction.objectStore('data');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const results = request.result as OfflineData[];
        const moduleData: { [module: string]: any } = {};
        
        results.forEach(item => {
          if (!moduleData[item.module]) {
            moduleData[item.module] = {};
          }
          moduleData[item.module][item.key] = item.data;
        });
        
        resolve(moduleData);
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async getQueuedRequests(): Promise<QueuedRequest[]> {
    const transaction = this.db!.transaction(['requests'], 'readonly');
    const store = transaction.objectStore('requests');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Clear all offline data
  async clearOfflineData(): Promise<void> {
    if (!this.db) await this.initialize();

    const transaction = this.db!.transaction(['data', 'requests', 'conflicts'], 'readwrite');
    
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore('data').clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore('requests').clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore('conflicts').clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })
    ]);

    this.emit('dataCleared');
  }
}

export const offlineService = new OfflineService();
export default offlineService;