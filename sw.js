// GreenHabit Service Worker
const CACHE_NAME = 'greenhabit-v2.0.0';
const OFFLINE_URL = '/offline.html';

// Assets to cache for offline functionality
const CACHE_ASSETS = [
    '/',
    '/index-new.html',
    '/css/main.css',
    '/css/header.css',
    '/css/dashboard.css',
    '/css/components.css',
    '/css/meal-planner.css',
    '/css/carbon-calculator.css',
    '/js/app.js',
    '/js/meal-planner.js',
    '/js/carbon-calculator.js',
    '/components/meal-planner.html',
    '/components/carbon-calculator.html',
    '/manifest.json',
    OFFLINE_URL
];

// Install event - cache assets
self.addEventListener('install', event => {
    console.log('🌱 Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('🌱 Service Worker: Caching files');
                return cache.addAll(CACHE_ASSETS);
            })
            .then(() => {
                console.log('🌱 Service Worker: All files cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('🚨 Service Worker: Cache failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('🌱 Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('🌱 Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('🌱 Service Worker: Activated successfully');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip Chrome extensions and other non-http(s) requests
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Return cached version if available
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Try to fetch from network
                return fetch(event.request)
                    .then(networkResponse => {
                        // Check if response is valid
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // Clone the response for caching
                        const responseToCache = networkResponse.clone();

                        // Cache the new response for future use
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                // Only cache GET requests to same origin
                                if (event.request.url.startsWith(self.location.origin)) {
                                    cache.put(event.request, responseToCache);
                                }
                            });

                        return networkResponse;
                    })
                    .catch(() => {
                        // If network fails, try to serve offline page
                        if (event.request.destination === 'document') {
                            return caches.match(OFFLINE_URL);
                        }
                        
                        // For other requests, we might want to serve a fallback
                        if (event.request.destination === 'image') {
                            return new Response(
                                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#e8f5e8"/><text x="100" y="100" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#4caf50">🌱 Offline</text></svg>',
                                { headers: { 'Content-Type': 'image/svg+xml' } }
                            );
                        }
                        
                        // Return a simple offline response for other resources
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
    console.log('🌱 Service Worker: Background sync triggered', event.tag);
    
    if (event.tag === 'background-sync-carbon-data') {
        event.waitUntil(syncCarbonData());
    }
    
    if (event.tag === 'background-sync-meal-data') {
        event.waitUntil(syncMealData());
    }
    
    if (event.tag === 'background-sync-inventory-data') {
        event.waitUntil(syncInventoryData());
    }
});

// Push notifications
self.addEventListener('push', event => {
    console.log('🌱 Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'GreenHabit notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'greenhabit-notification',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'view',
                title: 'View',
                icon: '/icons/action-view.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icons/action-close.png'
            }
        ]
    };

    if (event.data) {
        const payload = event.data.json();
        options.body = payload.body || options.body;
        options.icon = payload.icon || options.icon;
        options.tag = payload.tag || options.tag;
    }

    event.waitUntil(
        self.registration.showNotification('GreenHabit', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    console.log('🌱 Service Worker: Notification clicked', event.action);
    
    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling (for communication with main app)
self.addEventListener('message', event => {
    console.log('🌱 Service Worker: Message received', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.delete(CACHE_NAME).then(() => {
                event.ports[0].postMessage({ success: true });
            })
        );
    }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
    console.log('🌱 Service Worker: Periodic sync triggered', event.tag);
    
    if (event.tag === 'eco-tips-sync') {
        event.waitUntil(syncEcoTips());
    }
    
    if (event.tag === 'local-stores-sync') {
        event.waitUntil(syncLocalStores());
    }
});

// Helper functions for background sync
async function syncCarbonData() {
    try {
        const carbonData = await getStoredData('carbonData');
        if (carbonData && carbonData.length > 0) {
            const response = await fetch('/api/carbon/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(carbonData)
            });
            
            if (response.ok) {
                await clearStoredData('carbonData');
                console.log('🌱 Carbon data synced successfully');
            }
        }
    } catch (error) {
        console.error('🚨 Carbon data sync failed:', error);
    }
}

async function syncMealData() {
    try {
        const mealData = await getStoredData('mealData');
        if (mealData && mealData.length > 0) {
            const response = await fetch('/api/meals/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mealData)
            });
            
            if (response.ok) {
                await clearStoredData('mealData');
                console.log('🌱 Meal data synced successfully');
            }
        }
    } catch (error) {
        console.error('🚨 Meal data sync failed:', error);
    }
}

async function syncInventoryData() {
    try {
        const inventoryData = await getStoredData('inventoryData');
        if (inventoryData && inventoryData.length > 0) {
            const response = await fetch('/api/inventory/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inventoryData)
            });
            
            if (response.ok) {
                await clearStoredData('inventoryData');
                console.log('🌱 Inventory data synced successfully');
            }
        }
    } catch (error) {
        console.error('🚨 Inventory data sync failed:', error);
    }
}

async function syncEcoTips() {
    try {
        const response = await fetch('/api/eco-tips/latest');
        if (response.ok) {
            const tips = await response.json();
            await storeData('ecoTips', tips);
            console.log('🌱 Eco tips synced successfully');
        }
    } catch (error) {
        console.error('🚨 Eco tips sync failed:', error);
    }
}

async function syncLocalStores() {
    try {
        const position = await getCurrentPosition();
        const response = await fetch(`/api/stores/nearby?lat=${position.coords.latitude}&lng=${position.coords.longitude}`);
        if (response.ok) {
            const stores = await response.json();
            await storeData('localStores', stores);
            console.log('🌱 Local stores synced successfully');
        }
    } catch (error) {
        console.error('🚨 Local stores sync failed:', error);
    }
}

// Utility functions for IndexedDB operations
async function getStoredData(key) {
    return new Promise((resolve) => {
        const request = indexedDB.open('GreenHabitDB', 1);
        
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['syncData'], 'readonly');
            const objectStore = transaction.objectStore('syncData');
            const getRequest = objectStore.get(key);
            
            getRequest.onsuccess = () => {
                resolve(getRequest.result ? getRequest.result.data : null);
            };
            
            getRequest.onerror = () => {
                resolve(null);
            };
        };
        
        request.onerror = () => {
            resolve(null);
        };
    });
}

async function storeData(key, data) {
    return new Promise((resolve) => {
        const request = indexedDB.open('GreenHabitDB', 1);
        
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('syncData')) {
                db.createObjectStore('syncData', { keyPath: 'key' });
            }
        };
        
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['syncData'], 'readwrite');
            const objectStore = transaction.objectStore('syncData');
            
            objectStore.put({ key, data, timestamp: Date.now() });
            
            transaction.oncomplete = () => {
                resolve(true);
            };
            
            transaction.onerror = () => {
                resolve(false);
            };
        };
        
        request.onerror = () => {
            resolve(false);
        };
    });
}

async function clearStoredData(key) {
    return new Promise((resolve) => {
        const request = indexedDB.open('GreenHabitDB', 1);
        
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['syncData'], 'readwrite');
            const objectStore = transaction.objectStore('syncData');
            
            objectStore.delete(key);
            
            transaction.oncomplete = () => {
                resolve(true);
            };
            
            transaction.onerror = () => {
                resolve(false);
            };
        };
        
        request.onerror = () => {
            resolve(false);
        };
    });
}

async function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
        });
    });
} 