import {
    table
} from './fetchFunction.js';

'use strict';

let over = false,
    random = false,
    regex = false,
    last = '',
    lastRegex = false,
    lastRandom = false,
    worker = null,
    dimension = null;

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('sw.js')
        .then(sw => {
            console.log('Service worker registered: ' + sw);
        })
        .catch(error => {
            console.error('Error registering service worker: ' + error);
        });
}

if (new URLSearchParams(location.search).get('query')) {
    document.querySelector('#search').value = decodeURIComponent(new URLSearchParams(location.search).get('query'));
}

if (new URLSearchParams(location.search).get('regex') === '1') {
    regex = true;
    document.querySelector('#regex svg').style.fill = '#000';
}

if (Number(new URLSearchParams(location.search).get('random')) > 0) {
    random = true;
    document.querySelector('#random svg').style.fill = '#000';
    document.querySelector('#number').removeAttribute('disabled');
    document.querySelector('#number').value = Number(new URLSearchParams(location.search).get('random'));
}

if (document.querySelector('#search').value) {
    document.querySelector('#clear').style.visibility = 'visible';
    document.querySelector('#clear').style.display = 'inline-flex';
}

document.querySelector('#clear').addEventListener('click', () => {
    document.querySelector('#clear').style.display = 'none';
    document.querySelector('#search').value = '';
    document.querySelector('#search').focus();
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
    document.querySelector('#header-version').style.display = 'block';

    if (localStorage.getItem('theme') === 'dark') {
        document.head.querySelector('[name="theme-color"]').content = '#000';
    } else {
        document.head.querySelector('[name="theme-color"]').content = '#fff';
    }

    table.getColumn('picture')._column.titleElement.children[0].innerHTML = '<path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>';
    table.deselectRow();
});

document.querySelector('#random').addEventListener('click', () => {
    if (random) {
        document.querySelector('#number').setAttribute('disabled', '');
        document.querySelector('#random svg').classList.add('disabled');
        random = false;
        document.querySelector('#search').focus();
    } else {
        document.querySelector('#number').removeAttribute('disabled');
        document.querySelector('#random svg').classList.remove('disabled');
        random = true;
        document.querySelector('#number').focus();
    }
});

document.querySelector('#regex').addEventListener('click', () => {
    if (regex) {
        document.querySelector('#regex svg').classList.add('disabled');
        regex = false;
    } else {
        document.querySelector('#regex svg').classList.remove('disabled');
        regex = true;
    }

    document.querySelector('#search').focus();
});

function searchFunction() {
    if (last === document.querySelector('#search').value && !lastRandom && !random && lastRegex === regex) {
        return;
    }

    last = document.querySelector('#search').value;
    lastRandom = random;
    lastRegex = regex;

    document.querySelector('.tabulator-tableHolder').style.display = 'none';

    if (worker) {
        worker.terminate();
        worker = null;
        document.querySelector('#progress').remove();
    }

    document.querySelector('.tabulator-header').insertAdjacentHTML('afterend',
        '<div id="progress">' +
            '<div id="indicator"></div>' +
        '</div>'
    );

    worker = new Worker('worker.js');

    worker.postMessage({
        data: table.getData(),
        random: random,
        randomValue: Math.round(Math.abs(document.querySelector('#number').value)) || 1,
        regex: regex,
        value: document.querySelector('#search').value
    });

    worker.addEventListener('message', function (event) {
        switch (event.data.message) {
            case 'clear':
                // fake load
                document.querySelector('#indicator').classList.add('found');
                document.querySelector('#indicator').style.width = '100%';

                setTimeout(() => {
                    dimension = null;
                    table.clearFilter();
                    worker.terminate();
                    worker = null;
                }, 100);
                break;

            case 'done':
                // delay to extend indicator to 100%
                setTimeout(() => {
                    dimension = event.data.update;
                    table.setFilter('sources', 'in', event.data.filter);
                    worker.terminate();
                    worker = null;
                }, 100);
                break;

            case 'found':
                document.querySelector('#indicator').classList.add('found');
                break;

            case 'progress':
                document.querySelector('#indicator').style.width = event.data.progress;
                break;

            default:
                break;
        }
    });
}

document.querySelector('#search').addEventListener('keyup', (e) => {
    if (e.key !== 'Enter') {
        return;
    }

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
    } else {
        document.querySelector('#clear').style.display = 'none';
    }
});

document.querySelector('#search').addEventListener('blur', () => {
    if (!document.querySelector('#search').value) {
        return;
    }

    if (over) {
        return;
    }
    
    document.querySelector('#clear').style.visibility = 'hidden';
});

document.querySelector('#search-container').addEventListener('mouseover', () => {
    if (!document.querySelector('#search').value) {
        return;
    }

    over = true;

    document.querySelector('#clear').style.visibility = 'visible';
});

document.querySelector('#search-container').addEventListener('mouseout', () => {
    over = false;

    if (document.querySelector('#search:focus')) {
        return;
    }

    document.querySelector('#clear').style.visibility = 'hidden';
});

export {
    dimension
};