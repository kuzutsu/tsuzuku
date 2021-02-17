import {
    params,
    r,
    svg,
    t,
    title
} from './fetchFunction.js';

const index = {
    dimension: null
};

let worker = null;

function searchFunction(tt) {
    const
        query = document.querySelector('#search').value,
        table = tt || t;

    params.randomValue = Math.round(Math.abs(document.querySelector('#number').value)) || 1;

    if (document.querySelector('#nothing')) {
        document.querySelector('#nothing').remove();
    } else {
        document.querySelector('.tabulator').style.display = 'none';
    }

    if (worker) {
        worker.terminate();
        worker = null;
        document.querySelector('#progress').remove();
        document.querySelector('#searching').remove();
    }

    if (document.querySelector('#enter .disabled')) {
        document.querySelector('#enter .disabled').classList.remove('disabled');
        document.querySelector('#default').style.display = 'inline-flex';
        document.querySelector('#related').style.display = 'none';
        document.querySelector('#related-title').innerHTML = '';
    }

    document.querySelector('#search-container').insertAdjacentHTML('afterend',
        '<div id="progress"></div>'
    );

    document.querySelector('main').insertAdjacentHTML('beforeend',
        '<span id="searching">Searching...</span>'
    );

    table.blockRedraw();

    if (r) {
        for (const value of r) {
            value.update({
                alternative: value.getData().title,
                relevancy: 1
            });
        }
    }

    document.querySelector('#search').focus();

    worker = new Worker('worker.js');

    worker.postMessage({
        alt: params.alt,
        data: table.getData(),
        random: params.random,
        randomValue: params.randomValue,
        regex: params.regex,
        selected: table.getSelectedData(),
        value: document.querySelector('#search').value
    });

    worker.addEventListener('message', (event) => {
        switch (event.data.message) {
            case 'clear':
                // fake load
                document.querySelector('#progress').classList.add('found');
                document.querySelector('#progress').style.width = '100%';

                setTimeout(() => {
                    index.dimension = null;
                    table.clearFilter();
                    table.restoreRedraw();
                    worker.terminate();
                    worker = null;

                    const url = new URL(location.href.replace(location.search, ''));

                    if (params.regex) {
                        url.searchParams.set('regex', '1');
                    }

                    if (!params.alt) {
                        url.searchParams.set('alt', '0');
                    }

                    if (params.random) {
                        url.searchParams.set('random', params.randomValue);
                    }

                    history.pushState({}, '', url);

                    document.title = title;
                }, 100);
                break;

            case 'done':
                // delay to extend progress to 100%
                setTimeout(() => {
                    index.dimension = event.data.update;
                    table.setFilter('sources', 'in', event.data.filter);
                    table.restoreRedraw();
                    worker.terminate();
                    worker = null;

                    const url = new URL(location.href.replace(location.search, ''));

                    if (params.regex) {
                        url.searchParams.set('regex', '1');
                    }

                    if (!params.alt) {
                        url.searchParams.set('alt', '0');
                    }

                    if (params.random) {
                        url.searchParams.set('random', params.randomValue);
                    }

                    if (query) {
                        url.searchParams.set('query', encodeURIComponent(query));
                    }

                    history.pushState({}, '', url);

                    if (query) {
                        document.title = `${query} - ${title}`;
                    } else {
                        document.title = title;
                    }
                }, 100);
                break;

            case 'found':
                document.querySelector('#progress').classList.add('found');
                break;

            case 'progress':
                document.querySelector('#progress').style.width = event.data.progress;
                break;

            default:
                break;
        }
    });
}

if (document.querySelector('#search').value) {
    document.querySelector('#clear').style.visibility = 'visible';
    document.querySelector('#clear').style.display = 'inline-flex';
}

document.querySelector('#update').addEventListener('click', () => {
    document.querySelector('body').insertAdjacentHTML('beforeend',
        '<span id="full">Updating...</span>'
    );

    caches.open('tsuzuku')
        .then((cache) => {
            cache.keys().then((keys) => {
                keys.forEach((request) => {
                    cache.delete(request);
                });
            });
        })
        .then(() => {
            location.reload(true);
        });
});

document.querySelector('#clear').addEventListener('click', () => {
    document.querySelector('#clear').style.display = 'none';
    document.querySelector('#search').value = '';

    searchFunction();
});

document.querySelector('#theme').addEventListener('click', () => {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.remove('dark');
        document.body.classList.add('light');
        document.head.querySelector('[name="theme-color"]').content = '#fff';
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.remove('light');
        document.body.classList.add('dark');
        document.head.querySelector('[name="theme-color"]').content = '#000';
        localStorage.setItem('theme', 'dark');
    }
});

document.querySelector('#close').addEventListener('click', () => {
    document.querySelector('#header-title').innerHTML = 'Tsuzuku';
    document.querySelector('.header-tabulator-selected').classList.remove('header-tabulator-selected');
    document.querySelector('#header-score').remove();
    document.querySelector('#header-status').remove();

    if (localStorage.getItem('theme') === 'dark') {
        document.head.querySelector('[name="theme-color"]').content = '#000';
    } else {
        document.head.querySelector('[name="theme-color"]').content = '#fff';
    }

    t.getColumn('picture')._column.titleElement.children[0].innerHTML = svg.blank;
    t.deselectRow();
});

document.querySelector('#random').addEventListener('click', () => {
    if (params.random) {
        document.querySelector('#number').setAttribute('disabled', '');
        document.querySelector('#random svg').classList.add('disabled');
        params.random = false;
    } else {
        document.querySelector('#number').removeAttribute('disabled');
        document.querySelector('#random svg').classList.remove('disabled');
        params.random = true;
    }

    searchFunction();
});

document.querySelector('#regex').addEventListener('click', () => {
    if (params.regex) {
        document.querySelector('#regex svg').classList.add('disabled');
        params.regex = false;
    } else {
        document.querySelector('#regex svg').classList.remove('disabled');
        params.regex = true;
    }

    searchFunction();
});

document.querySelector('#alt').addEventListener('click', () => {
    if (params.alt) {
        document.querySelector('#alt svg').classList.add('disabled');
        params.alt = false;
    } else {
        document.querySelector('#alt svg').classList.remove('disabled');
        params.alt = true;
    }

    searchFunction();
});

document.querySelector('#search').addEventListener('keyup', (e) => {
    if (e.key !== 'Enter') {
        return;
    }

    searchFunction();
});

document.querySelector('#number').addEventListener('keyup', (e) => {
    if (e.key !== 'Enter') {
        return;
    }

    searchFunction();
});

document.querySelector('#enter').addEventListener('click', () => {
    searchFunction();
});

document.querySelector('#search').addEventListener('input', (e) => {
    if (e.target.value) {
        document.querySelector('#clear').style.visibility = 'visible';
        document.querySelector('#clear').style.display = 'inline-flex';
    } else {
        document.querySelector('#clear').style.display = 'none';
    }

    searchFunction();
});

document.querySelector('#search').addEventListener('focus', (e) => {
    if (e.target.value) {
        document.querySelector('#clear').style.visibility = 'visible';
        document.querySelector('#clear').style.display = 'inline-flex';
    }
});

document.querySelector('#header-title').addEventListener('click', (e) => {
    if (e.target.parentNode.classList[0] !== 'header-tabulator-selected') {
        return;
    }

    document.querySelector('#search').value = 'is:selected';

    searchFunction();
});

onpopstate = () => {
    if (new URLSearchParams(location.search).get('query')) {
        document.querySelector('#search').value = decodeURIComponent(new URLSearchParams(location.search).get('query'));
        document.querySelector('#clear').style.visibility = 'visible';
        document.querySelector('#clear').style.display = 'inline-flex';
    } else {
        document.querySelector('#search').value = '';
        document.querySelector('#clear').style.display = 'none';
    }

    if (new URLSearchParams(location.search).get('regex') === '1') {
        params.regex = true;
        document.querySelector('#regex svg').classList.remove('disabled');
    } else {
        params.regex = false;
        document.querySelector('#regex svg').classList.add('disabled');
    }

    if (new URLSearchParams(location.search).get('alt') === '0') {
        params.alt = false;
        document.querySelector('#alt svg').classList.add('disabled');
    } else {
        params.alt = true;
        document.querySelector('#alt svg').classList.remove('disabled');
    }

    if (Math.round(Math.abs(Number(new URLSearchParams(location.search).get('random')))) > 0) {
        params.random = true;
        document.querySelector('#number').removeAttribute('disabled');
        document.querySelector('#number').value = Math.round(Math.abs(Number(new URLSearchParams(location.search).get('random'))));
        document.querySelector('#random svg').classList.remove('disabled');
        params.randomValue = document.querySelector('#number').value;
    } else {
        params.random = false;
        document.querySelector('#number').setAttribute('disabled', '');
        document.querySelector('#random svg').classList.add('disabled');
    }

    searchFunction();
};

export {
    index,
    searchFunction
};