self.addEventListener('install', (event) => {
    console.log('Service worker installing');

    event.waitUntil(
        caches.open('v1')
            .then((cache) => cache.addAll([
                'index.html',
                'worker.js',
                'fetchFunction.js',
                'index.js',
                'index.css',
                'https://cdn.jsdelivr.net/npm/jquery/dist/jquery.slim.min.js',
                'https://cdn.jsdelivr.net/npm/tabulator-tables/dist/js/tabulator.min.js',
                'https://cdn.jsdelivr.net/npm/fuse.js/dist/fuse.basic.min.js',
                //'https://cdn.jsdelivr.net/npm/markdown-it/dist/markdown-it.min.js',
                'https://cdn.jsdelivr.net/npm/tabulator-tables/dist/css/tabulator_simple.min.css',
                'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap'
            ])
        )
    );
});

self.addEventListener('activate', () => {
    console.log('Service worker activating');
});

function cache(request, response) {
    if (response.type === 'error' || response.type === 'opaque') {
        return Promise.resolve();
    }

    return caches.open('v1').then((cache) => cache.put(request, response.clone()));
}

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches
            .match(event.request)
            .then((cached) => cached || fetch(event.request))
            .then((response) =>
                cache(event.request, response)
                    .then(() => response)
            )
    );
});
