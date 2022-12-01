const source = 'https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database-minified.json';

function removeReserved(text) {
    return text.replace(/</gu, '&lt;').replace(/>/gu, '&gt;');
}

document.body.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.repeat) {
        return;
    }

    if (e.target.tabIndex === 0 || e.target.type === 'checkbox') {
        e.target.click();
    }
});

if ('serviceWorker' in navigator) {
    navigator
        .serviceWorker
        .register('https://kuzutsu.github.io/tsuzuku/sw.js')
        .then((registration) => {
            registration.addEventListener('updatefound', () => {
                const r = registration.installing;

                r.addEventListener('statechange', () => {
                    if (r.state === 'installed') {
                        r.postMessage({
                            update: true
                        });
                    }
                });
            });
        });
}

export {
    removeReserved,
    source
};