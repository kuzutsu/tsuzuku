import {
    table
} from './fetchFunction.js';

'use strict';

let over = false,
    random = false,
    regex = false,
    dark = false,
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
    $('#search').val(decodeURIComponent(new URLSearchParams(location.search).get('query')));
}

if (new URLSearchParams(location.search).get('regex') === '1') {
    regex = true;
    document.querySelector('#regex svg').style.fill = '#000';
}

if (Number(new URLSearchParams(location.search).get('random')) > 0) {
    random = true;
    document.querySelector('#random svg').style.fill = '#000';
    $('#number').removeAttr('disabled');
    $('#number').val(Number(new URLSearchParams(location.search).get('random')));
}

if ($('#search').val()) {
    document.querySelector('#clear').style.visibility = 'visible';
    document.querySelector('#clear').style.display = 'inline-flex';
}

document.querySelector('#clear').addEventListener('click', () => {
    document.querySelector('#clear').style.display = 'none';
    $('#search').val('');
    $('#search').focus();
});

document.querySelector('#theme').addEventListener('click', () => {
    if (dark) {
        document.body.classList.remove('dark');
        document.body.classList.add('light');
        document.head.querySelector('[name="theme-color"]').content = '#fff';
        dark = false;
    } else {
        document.body.classList.remove('light');
        document.body.classList.add('dark');
        document.head.querySelector('[name="theme-color"]').content = '#000';
        dark = true;
    }
});

document.querySelector('#close').addEventListener('click', () => {
    document.querySelector('#header-title').innerHTML = 'Tsuzuku';
    document.querySelector('.header-tabulator-selected').classList.remove('header-tabulator-selected');
    document.querySelector('#header-version').style.display = 'block';

    if (dark) {
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
        $('#search').focus();
    } else {
        document.querySelector('#number').removeAttribute('disabled');
        document.querySelector('#random svg').classList.remove('disabled');
        random = true;
        $('#number').focus();
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

    $('#search').focus();
});

$('body').on('keydown', '#search, #number', function (e) {
    if (e.key !== 'Enter') {
        return;
    }

    if (last === $('#search').val() && !lastRandom && !random && lastRegex === regex) {
        return;
    }

    last = $('#search').val();
    lastRandom = random;
    lastRegex = regex;

    document.querySelector('.tabulator-tableHolder').style.display = 'none';

    if (worker) {
        worker.terminate();
        worker = null;
        document.querySelector('#progress').remove();
    }

    $('.tabulator-header').after(
        '<div id="progress">' +
            '<div id="indicator"></div>' +
        '</div>'
    );

    worker = new Worker('worker.js');

    worker.postMessage({
        data: table.getData(),
        random: random,
        randomValue: Math.round(Math.abs($('#number').val())) || 1,
        regex: regex,
        value: $('#search').val()
    });

    worker.addEventListener('message', function (event) {
        switch (event.data.message) {
            case 'progress':
                document.querySelector('#indicator').style.width = event.data.progress;
                break;
            case 'found':
                document.querySelector('#indicator').classList.add('found');
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
            default:
                break;
        }
    });

}).on('input', '#search', function (e) {
    if ($(this).val()) {
        document.querySelector('#clear').style.visibility = 'visible';
        document.querySelector('#clear').style.display = 'inline-flex';
    } else {
        document.querySelector('#clear').style.display = 'none';
    }

}).on('focus', '#search', function () {
    if ($(this).val()) {
        document.querySelector('#clear').style.visibility = 'visible';
        document.querySelector('#clear').style.display = 'inline-flex';
    } else {
        document.querySelector('#clear').style.display = 'none';
    }

}).on('blur', '#search', function () {
    if (!$('#search').val()) {
        return;
    }

    if (over) {
        return;
    }
    
    document.querySelector('#clear').style.visibility = 'hidden';

}).on('mouseover', '#search-container', function () {
    if (!$('#search').val()) {
        return;
    }

    over = true;

    document.querySelector('#clear').style.visibility = 'visible';

}).on('mouseout', '#search-container', function () {
    over = false;

    if ($('#search').is(':focus')) {
        return;
    }

    document.querySelector('#clear').style.visibility = 'hidden';
});

export {
    dark,
    dimension
};