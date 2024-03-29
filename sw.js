const sw = '69';

addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(sw)
            .then((c) => c.addAll([
                // main
                './',
                './fetchFunction.js',
                './global.css',
                './global.js',
                './index.css',
                './index.js',
                './manifest.webmanifest',
                './message.js',
                './worker.js',

                // games
                './games/',
                './games/index.css',
                './games/odd-one-out/',
                './games/odd-one-out/index.css',
                './games/odd-one-out/index.js',
                './games/crop/',
                './games/crop/index.css',
                './games/crop/index.js',
                './games/quiz/',
                './games/quiz/index.css',
                './games/quiz/index.js',

                // images
                './images/logo.svg',
                './images/logo-180.png',
                './images/logo-192.png',
                './images/logo-512.png',
                './images/logo-maskable-192.png',
                './images/logo-maskable-512.png',

                // tags
                './tags/',
                './tags/index.css',
                './tags/index.js',

                // third-party
                'https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.min.js',
                'https://cdn.jsdelivr.net/npm/tabulator-tables@5.4.4/dist/js/tabulator_esm.min.js',
                'https://fonts.gstatic.com/s/roboto/v29/KFOmCnqEu92Fr1Mu4mxK.woff2',
                'https://fonts.gstatic.com/s/roboto/v29/KFOlCnqEu92Fr1MmEU9fBBc4.woff2',
                'https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database-minified.json'
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
            }).catch(() => cached);

            return cached || fetched;
        }))
    );
});