/**
 * Service Worker pour optimisation et cache
 * La Manufacture de Laurence v2.0.0
 */

const CACHE_NAME = 'manufacture-v2.0.0';
const STATIC_CACHE = 'static-v2.0.0';
const DYNAMIC_CACHE = 'dynamic-v2.0.0';

// Fichiers à mettre en cache immédiatement
const STATIC_FILES = [
    '/',
    '/index.html',
    '/css/optimized/main.min.css',
    '/css/style.css',
    '/js/config.js',
    '/js/storage-manager.js',
    '/js/utils/date-utils.js',
    '/js/utils/validation-utils.js',
    '/js/utils/dom-utils.js',
    '/pages/mobile/agenda-mobile.html',
    '/pages/desktop/agenda.html',
    '/images/laurence.jpg',
    '/images/adrien.jpg',
    '/images/ilan.jpg'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installation');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Cache des fichiers statiques');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => self.skipWaiting())
    );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activation');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('Service Worker: Suppression ancien cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Stratégie de cache avec fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Cache first pour les ressources statiques
    if (STATIC_FILES.some(file => url.pathname === file)) {
        event.respondWith(
            caches.match(request)
                .then(response => response || fetch(request))
        );
        return;
    }

    // Network first pour les API et données dynamiques
    if (url.pathname.includes('/api/') || request.method !== 'GET') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE)
                            .then(cache => cache.put(request, responseClone));
                    }
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // Cache with fallback pour les autres ressources
    event.respondWith(
        caches.match(request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(request)
                    .then(response => {
                        if (response.ok) {
                            const responseClone = response.clone();
                            caches.open(DYNAMIC_CACHE)
                                .then(cache => cache.put(request, responseClone));
                        }
                        return response;
                    });
            })
    );
});

// Gestion des messages depuis l'application
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

// Notification de mise à jour disponible
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CHECK_UPDATE') {
        // Vérifier s'il y a une nouvelle version
        caches.keys().then(cacheNames => {
            const hasUpdate = !cacheNames.includes(CACHE_NAME);
            event.ports[0].postMessage({ hasUpdate });
        });
    }
});
