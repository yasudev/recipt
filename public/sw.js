const CACHE_NAME = 'yuminventory-pos-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(['/']))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            caches
                .keys()
                .then((keys) =>
                    Promise.all(
                        keys
                            .filter((key) => key !== CACHE_NAME)
                            .map((key) => caches.delete(key))
                    )
                ),
            self.clients.claim(),
        ])
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    // API requests go to the network only (offline data is handled by IndexedDB)
    if (url.pathname.startsWith('/api')) return;

    // Navigations: network first, fall back to the cached app shell
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    return response;
                })
                .catch(async () => {
                    const cachedShell = await caches.match('/');
                    if (cachedShell) return cachedShell;
                    return new Response('Offline', { status: 503 });
                })
        );
        return;
    }

    // Assets: cache first, then network (and cache for next time)
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((response) => {
                if (response.ok && response.status === 200) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                }
                return response;
            });
        })
    );
});