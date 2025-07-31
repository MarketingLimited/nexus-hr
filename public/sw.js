// Service Worker for HR System PWA
const CACHE_NAME = 'hr-system-v1.0.0';
const STATIC_CACHE = 'hr-static-v1.0.0';
const DYNAMIC_CACHE = 'hr-dynamic-v1.0.0';
const API_CACHE = 'hr-api-v1.0.0';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  // Add critical CSS and JS files here
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/employees',
  '/api/attendance',
  '/api/leave',
  '/api/performance',
  '/api/payroll',
  '/api/documents',
  '/api/notifications'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(API_CACHE).then(cache => {
        console.log('[SW] Pre-caching API endpoints');
        return Promise.allSettled(
          API_ENDPOINTS.map(endpoint => 
            fetch(endpoint)
              .then(response => response.ok ? cache.put(endpoint, response) : null)
              .catch(() => null) // Ignore failures during install
          )
        );
      })
    ]).then(() => {
      console.log('[SW] Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== API_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return handleNonGetRequest(event);
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else if (STATIC_ASSETS.some(asset => url.pathname === asset)) {
    event.respondWith(handleStaticRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// Handle API requests with cache-first strategy for offline support
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const cache = await caches.open(API_CACHE);
  
  try {
    // Try network first for fresh data
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      await cache.put(request, networkResponse.clone());
      
      // Store offline queue status
      await updateOfflineStatus(true);
      
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('[SW] Network failed, serving from cache:', url.pathname);
    
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      await updateOfflineStatus(false);
      return cachedResponse;
    }
    
    // Return offline fallback for critical endpoints
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This data is not available offline',
        cached: false
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static assets with cache-first strategy
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return fallback for HTML pages
    if (request.headers.get('Accept')?.includes('text/html')) {
      return cache.match('/');
    }
    throw error;
  }
}

// Handle dynamic content with network-first strategy
async function handleDynamicRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Handle POST/PUT/DELETE requests - queue for later sync
async function handleNonGetRequest(event) {
  const { request } = event;
  
  try {
    // Try network first
    const response = await fetch(request.clone());
    return response;
  } catch (error) {
    // Queue request for background sync
    if (request.url.includes('/api/')) {
      await queueOfflineRequest(request);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Request queued for sync when online',
          queued: true
        }),
        {
          status: 202,
          statusText: 'Accepted',
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    throw error;
  }
}

// Queue offline requests for background sync
async function queueOfflineRequest(request) {
  const requestData = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: await request.text(),
    timestamp: Date.now()
  };
  
  // Store in IndexedDB for persistence
  const db = await openOfflineDB();
  const transaction = db.transaction(['requests'], 'readwrite');
  const store = transaction.objectStore('requests');
  
  await store.add(requestData);
  
  console.log('[SW] Queued offline request:', request.url);
}

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'offline-sync') {
    event.waitUntil(syncOfflineRequests());
  }
});

// Sync queued offline requests
async function syncOfflineRequests() {
  console.log('[SW] Syncing offline requests...');
  
  const db = await openOfflineDB();
  const transaction = db.transaction(['requests'], 'readwrite');
  const store = transaction.objectStore('requests');
  
  const requests = await store.getAll();
  
  for (const requestData of requests) {
    try {
      const response = await fetch(requestData.url, {
        method: requestData.method,
        headers: requestData.headers,
        body: requestData.body || undefined
      });
      
      if (response.ok) {
        await store.delete(requestData.id);
        console.log('[SW] Synced offline request:', requestData.url);
      }
    } catch (error) {
      console.log('[SW] Failed to sync request:', requestData.url, error);
    }
  }
}

// Notification event for background updates
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      if (clients.length > 0) {
        return clients[0].focus();
      }
      return self.clients.openWindow('/');
    })
  );
});

// Update offline status
async function updateOfflineStatus(isOnline) {
  const clients = await self.clients.matchAll({ type: 'window' });
  
  clients.forEach(client => {
    client.postMessage({
      type: 'NETWORK_STATUS',
      isOnline
    });
  });
}

// Open IndexedDB for offline storage
function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('HROfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('requests')) {
        const store = db.createObjectStore('requests', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        store.createIndex('timestamp', 'timestamp');
      }
      
      if (!db.objectStoreNames.contains('data')) {
        const dataStore = db.createObjectStore('data', { keyPath: 'key' });
        dataStore.createIndex('module', 'module');
        dataStore.createIndex('lastSync', 'lastSync');
      }
    };
  });
}

console.log('[SW] Service Worker script loaded');