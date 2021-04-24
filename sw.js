addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open('tsuzuku')
            .then((c) => c.addAll([
                // local
                './',
                './fetchFunction.js',
                './index.css',
                './index.js',
                './logo.svg',
                './logo-180.png',
                './logo-192.png',
                './logo-512.png',
                './logo-maskable-192.png',
                './logo-maskable-512.png',
                './manifest.webmanifest',
                './worker.js',

                // games
                './games/',
                './games/index.css',
                './games/index.js',

                // third-party
                'https://cdn.jsdelivr.net/npm/fuse.js/dist/fuse.min.js',
                'https://cdn.jsdelivr.net/npm/tabulator-tables/dist/js/modules/filter.min.js',
                'https://cdn.jsdelivr.net/npm/tabulator-tables/dist/js/modules/format.min.js',
                'https://cdn.jsdelivr.net/npm/tabulator-tables/dist/js/modules/frozen_columns.min.js',
                'https://cdn.jsdelivr.net/npm/tabulator-tables/dist/js/modules/resize_table.min.js',
                'https://cdn.jsdelivr.net/npm/tabulator-tables/dist/js/modules/select_row.min.js',
                'https://cdn.jsdelivr.net/npm/tabulator-tables/dist/js/modules/sort.min.js',
                'https://cdn.jsdelivr.net/npm/tabulator-tables/dist/js/tabulator_core.min.js',
                'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
                'https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmEU9fBBc4AMP6lQ.woff2',
                'https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database.json'
            ]))
    );
});

addEventListener('message', (event) => {
    if (event.data.update) {
        self.skipWaiting();
    }
});

addEventListener('fetch', (event) => {
    event.respondWith(
        caches
            .match(event.request, {
                ignoreSearch: true
            })
            .then((cached) => cached || fetch(event.request))
    );

    event.waitUntil(
        fetch(event.request)
            .then((response) => {
                if (response.type === 'error' || response.type === 'opaque') {
                    return Promise.resolve();
                }

                return caches.open('tsuzuku').then((cache) => cache.put(event.request, response.clone()));
            })
            .catch(() => Promise.resolve())
    );
});