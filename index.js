import {
    params,
    r,
    svg,
    t,
    title
} from './fetchFunction.js';

const index = {
    dimension: null,
    lastRow: null
};

let worker = null;

function searchFunction(tt, qq, p, s) {
    const
        query = qq || document.querySelector('#search').value,
        table = tt || t;

    if (document.querySelector('#regex').checked) {
        params.regex = true;
    } else {
        params.regex = false;
    }

    if (document.querySelector('#alt').checked) {
        params.alt = true;
    } else {
        params.alt = false;
    }

    if (document.querySelector('#random').checked) {
        params.random = true;
        params.randomValue = Math.round(Math.abs(document.querySelector('#number').value)) || 1;
    } else {
        params.random = false;
        params.randomValue = 1;
    }

    if (document.querySelector('#nothing')) {
        document.querySelector('#nothing').remove();
    } else {
        document.querySelector('.tabulator').style.display = 'none';
    }

    if (document.querySelector('#search').value) {
        document.querySelector('#clear').style.visibility = 'visible';
        document.querySelector('#clear').style.display = 'inline-flex';
    }

    if (!s && document.querySelector('.selected-tab')) {
        document.querySelector('.selected-tab').classList.remove('selected-tab');
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

    if (r) {
        for (const value of r) {
            value.update({
                alternative: value.getData().title,
                relevancy: 1
            });
        }
    }

    worker = new Worker('worker.js');

    worker.postMessage({
        alt: params.alt,
        data: table.getData(),
        random: params.random,
        randomValue: params.randomValue,
        regex: params.regex,
        selected: table.getSelectedData(),
        value: query
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
                    worker.terminate();
                    worker = null;

                    const url = new URL(location.href.replace(location.search, ''));

                    if (params.regex) {
                        url.searchParams.set('regex', '1');
                        table.setSort('alternative', 'asc');
                    } else {
                        if (query) {
                            table.setSort('relevancy', 'desc');
                        } else {
                            table.setSort('alternative', 'asc');
                        }
                    }

                    if (!params.alt) {
                        url.searchParams.set('alt', '0');
                    }

                    if (params.random) {
                        url.searchParams.set('random', params.randomValue);
                    }

                    if (!p) {
                        history.pushState({}, '', url);
                    }

                    document.title = title;
                }, 100);
                break;

            case 'done':
                // delay to extend progress to 100%
                setTimeout(() => {
                    index.dimension = event.data.update;
                    table.setFilter('sources', 'in', event.data.filter);
                    worker.terminate();
                    worker = null;

                    const url = new URL(location.href.replace(location.search, ''));

                    if (params.regex) {
                        url.searchParams.set('regex', '1');
                        table.setSort('alternative', 'asc');
                    } else {
                        if (query) {
                            table.setSort('relevancy', 'desc');
                        } else {
                            table.setSort('alternative', 'asc');
                        }
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

                    if (!p) {
                        history.pushState({}, '', url);
                    }

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

document.querySelector('#clear').addEventListener('click', () => {
    document.querySelector('#clear').style.display = 'none';
    document.querySelector('#search').value = '';
    document.querySelector('#search').focus();

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
    index.lastRow = null;

    document.querySelector('#header-title').innerHTML = 'Tsuzuku';
    document.querySelector('.header-tabulator-selected').classList.remove('header-tabulator-selected');
    document.querySelector('#header-status').remove();
    document.querySelectorAll('.separator-selected').forEach((element) => {
        element.remove();
    });

    if (localStorage.getItem('theme') === 'dark') {
        document.head.querySelector('[name="theme-color"]').content = '#000';
    } else {
        document.head.querySelector('[name="theme-color"]').content = '#fff';
    }

    t.getColumn('picture')._column.titleElement.children[0].innerHTML = svg.blank;
    t.deselectRow();
});

document.querySelector('#search').addEventListener('keyup', (e) => {
    if (e.key !== 'Enter') {
        return;
    }

    e.target.blur();
    searchFunction();
});

document.querySelector('#enter').addEventListener('click', () => {
    if (document.querySelector('#default').style.display === 'inline-flex') {
        document.querySelector('#default').style.display = 'none';
        document.querySelector('.tabs').style.display = 'inline-flex';
        document.querySelector('#enter svg').style.fill = '#aaa';

        if (document.querySelector('.settings-container').style.display === 'inline-flex') {
            document.querySelector('.settings-container').style.display = 'none';
            document.querySelector('#settings svg').style.fill = '#aaa';
            document.querySelector('#database-container').style.maxHeight = 'calc(100% - 48px)';

            t.redraw();
        }
    } else {
        document.querySelector('#default').style.display = 'inline-flex';
        document.querySelector('#search').focus();
        document.querySelector('.tabs').style.display = 'none';
        document.querySelector('#enter svg').style.fill = '';
    }
});

document.querySelector('#enter2').addEventListener('click', () => {
    searchFunction();
});

document.querySelector('#random').addEventListener('change', (e) => {
    if (e.target.checked) {
        document.querySelector('[for="number"]').style.color = '';
        document.querySelector('#number').removeAttribute('disabled');
    } else {
        document.querySelector('[for="number"]').style.color = '#aaa';
        document.querySelector('#number').setAttribute('disabled', '');
    }
});

document.querySelector('#settings').addEventListener('click', () => {
    if (document.querySelector('.settings-container').style.display === 'inline-flex') {
        document.querySelector('.settings-container').style.display = 'none';
        document.querySelector('#settings svg').style.fill = '#aaa';
        document.querySelector('#database-container').style.maxHeight = 'calc(100% - 48px)';
    } else {
        document.querySelector('.settings-container').style.display = 'inline-flex';
        document.querySelector('#settings svg').style.fill = '';
        document.querySelector('#database-container').style.maxHeight = 'calc(100% - 208px)';
    }

    t.redraw();
});

document.querySelector('#search').addEventListener('input', (e) => {
    if (e.target.value) {
        document.querySelector('#clear').style.visibility = 'visible';
        document.querySelector('#clear').style.display = 'inline-flex';
    } else {
        document.querySelector('#clear').style.display = 'none';
    }
});

document.querySelector('#search').addEventListener('focus', (e) => {
    if (e.target.value) {
        document.querySelector('#clear').style.visibility = 'visible';
        document.querySelector('#clear').style.display = 'inline-flex';
    }
});

document.querySelectorAll('.tab').forEach((element) => {
    element.addEventListener('click', (e) => {
        if (document.querySelector('.selected-tab')) {
            document.querySelector('.selected-tab').classList.remove('selected-tab');
        }

        e.target.classList.add('selected-tab');
        document.querySelector('#search').value = e.target.dataset.query;
        searchFunction(null, e.target.dataset.query, null, true);
    });
});

document.querySelector('#header-title').addEventListener('click', (e) => {
    if (e.target.parentNode.classList[0] !== 'header-tabulator-selected') {
        return;
    }

    document.querySelector('#search').value = 'is:selected';

    searchFunction();
});

// chromium bug when using change
onbeforeunload = () => {
    document.activeElement.blur();
};

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
        document.querySelector('#regex').checked = true;

        t.setSort('alternative', 'asc');
    } else {
        document.querySelector('#regex').checked = false;

        if (new URLSearchParams(location.search).get('query')) {
            t.setSort('relevancy', 'desc');
        } else {
            t.setSort('alternative', 'asc');
        }
    }

    if (new URLSearchParams(location.search).get('alt') === '0') {
        document.querySelector('#alt').checked = false;
    } else {
        document.querySelector('#alt').checked = true;
    }

    if (Math.round(Math.abs(Number(new URLSearchParams(location.search).get('random'))))) {
        document.querySelector('#random').checked = true;
        document.querySelector('[for="number"]').style.color = '';
        document.querySelector('#number').removeAttribute('disabled');
        document.querySelector('#number').value = params.randomValue;
    } else {
        document.querySelector('#random').checked = false;
        document.querySelector('[for="number"]').style.color = '#aaa';
        document.querySelector('#number').setAttribute('disabled', '');
    }

    searchFunction(null, null, true);
};

export {
    index,
    searchFunction
};