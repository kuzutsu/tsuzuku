const sw = '2.3.13';

addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(sw)
            .then((c) => c.addAll([
                // local
                './',
                './fetchFunction.js',
                './global.css',
                './global.js',
                './index.css',
                './index.js',
                './manifest.webmanifest',
                './worker.js',

                // games
                '../tsuzuku-games/',
                '../tsuzuku-games/index.css',
                '../tsuzuku-games/odd-one-out/',
                '../tsuzuku-games/odd-one-out/index.css',
                '../tsuzuku-games/odd-one-out/index.js',
                '../tsuzuku-games/quiz/',
                '../tsuzuku-games/quiz/index.css',
                '../tsuzuku-games/quiz/index.js',

                // images
                './images/anilist.png',
                './images/kitsu.png',
                './images/logo.svg',
                './images/logo-180.png',
                './images/logo-192.png',
                './images/logo-512.png',
                './images/logo-maskable-192.png',
                './images/logo-maskable-512.png',
                './images/myanimelist.png',

                // third-party
                'https://cdn.jsdelivr.net/npm/fuse.js@6.4.6/dist/fuse.min.js',
                'https://cdn.jsdelivr.net/npm/tabulator-tables@4.9.3/dist/js/modules/edit.min.js',
                'https://cdn.jsdelivr.net/npm/tabulator-tables@4.9.3/dist/js/modules/filter.min.js',
                'https://cdn.jsdelivr.net/npm/tabulator-tables@4.9.3/dist/js/modules/format.min.js',
                'https://cdn.jsdelivr.net/npm/tabulator-tables@4.9.3/dist/js/modules/frozen_columns.min.js',
                'https://cdn.jsdelivr.net/npm/tabulator-tables@4.9.3/dist/js/modules/resize_table.min.js',
                'https://cdn.jsdelivr.net/npm/tabulator-tables@4.9.3/dist/js/modules/select_row.min.js',
                'https://cdn.jsdelivr.net/npm/tabulator-tables@4.9.3/dist/js/modules/sort.min.js',
                'https://cdn.jsdelivr.net/npm/tabulator-tables@4.9.3/dist/js/tabulator_core.min.js',
                'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxK.woff2',
                'https://fonts.gstatic.com/s/roboto/v27/KFOlCnqEu92Fr1MmEU9fBBc4.woff2',
                'https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database.json'
            ]))
    );
});

addEventListener('activate', (event) => {
    const cache = [sw];

    event.waitUntil(
        caches.keys().then((keys) => Promise.all(keys.map((key) => {
            if (cache.indexOf(key) > -1) {
                return Promise.resolve();
            }

            return caches.delete(key);
        })))
    );
});

addEventListener('message', (event) => {
    if (event.data.update) {
        self.skipWaiting();
    }
});

addEventListener('fetch', (event) => {
    event.respondWith(
        caches.open(sw).then((cache) => cache.match(event.request, {
            ignoreSearch: true
        }).then((cached) => {
            const fetched = fetch(event.request).then((response) => {
                if (response.ok) {
                    cache.put(event.request.url.replace(new URL(event.request.url).search, ''), response.clone());
                }

                return response;
            });

            return cached || fetched;
        }))
    );
});