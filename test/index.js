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

$(function () {
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
        $('#regex svg').css('fill', '#000');
    }

    if (Number(new URLSearchParams(location.search).get('random')) > 0) {
        random = true;
        $('#random svg').css('fill', '#000');
        $('#number').removeAttr('disabled');
        $('#number').val(Number(new URLSearchParams(location.search).get('random')));
    }

    if ($('#search').val()) {
        $('#clear').css('visibility', 'visible');
        $('#clear').show();
    }

    document.querySelector('#clear').addEventListener('click', (e) => {
        $('#clear').hide();
        $('#search').val('');
        $('#search').focus();
    });

    document.querySelector('#theme').addEventListener('click', (e) => {
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

    document.querySelector('#close').addEventListener('click', (e) => {
        document.querySelector('#header-title').innerHTML = 'Tsuzuku';
        document.querySelector('.header-tabulator-selected').classList.remove('header-tabulator-selected');
        document.querySelector('#header-version').style.display = 'block';

        if (dark) {
            document.head.querySelector('[name="theme-color"]').content = '#000';
        } else {
            document.head.querySelector('[name="theme-color"]').content = '#fff';
        }

        table.getColumn('picture')._column.titleElement.children[0].innerHTML = 'check_box_outline_blank';
        table.deselectRow();
    });

    document.querySelector('#random').addEventListener('click', (e) => {
        if (random) {
            document.querySelector('#number').setAttribute('disabled', '');
            $('#random svg').addClass('disabled');
            random = false;
            $('#search').focus();
        } else {
            document.querySelector('#number').removeAttribute('disabled');
            $('#random svg').removeClass('disabled');
            random = true;
            $('#number').focus();
        }
    });

    document.querySelector('#regex').addEventListener('click', (e) => {
        if (regex) {
            $('#regex svg').addClass('disabled');
            regex = false;
        } else {
            $('#regex svg').removeClass('disabled');
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

        $('.tabulator-tableHolder').hide();

        if (worker) {
            worker.terminate();
            worker = null;
            $('#progress').remove();
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
            $('#clear').css('visibility', 'visible');
            $('#clear').show();
        } else {
            $('#clear').hide();
        }
    
    }).on('focus', '#search', function () {
        if ($(this).val()) {
            $('#clear').css('visibility', 'visible');
            $('#clear').show();
        } else {
            $('#clear').hide();
        }

    }).on('blur', '#search', function () {
        if (!$('#search').val()) {
            return;
        }

        if (over) {
            return;
        }
        
        $('#clear').css('visibility', 'hidden');

    }).on('mouseover', '#search-container', function () {
        if (!$('#search').val()) {
            return;
        }

        over = true;

        $('#clear').css('visibility', 'visible');

    }).on('mouseout', '#search-container', function () {
        over = false;

        if ($('#search').is(':focus')) {
            return;
        }

        $('#clear').css('visibility', 'hidden');
    });
});

export {
    dark,
    dimension
};
