
import {
    addCommas,
    searchReplace,
    svg,
    tagsDelisted
} from './global.js';

import {
    built,
    db2,
    disableSelection,
    error,
    error2,
    selected,
    t,
    title,
    updated,
    years2
} from './fetchFunction.js';

const
    index = {
        dimension: null,
        lastRow: null,
        message: null,
        next: false,
        previous: false,
        qualifiers: 0,
        quick: false,
        random: 0,
        related: 0
    },
    seasons = ['winter', 'spring', 'summer', 'fall', 'tba'];

let help = false,
    target = false,
    target2 = false,
    timeout = null,
    worker = null;

document.querySelector('label[for="toggle-delisted"]').title =
    'Entries that are delisted are:\n' +
    '  (1) those without a visual; or\n' +
    '  (2) those with at least one of the following tags:';

for (const td of tagsDelisted) {
    document.querySelector('label[for="toggle-delisted"]').title += `\n    - ${td}`;
}

function searchFunction(tt, qq, p) {
    const
        query = qq || document.querySelector('.search').value,
        table = tt || t;

    if (timeout) {
        clearTimeout(timeout);
    }

    if (document.querySelector('.search').value) {
        document.querySelector('.clear').style.display = 'inline-flex';
    } else {
        document.querySelector('.clear').style.display = 'none';
    }

    index.related = 0;
    index.previous = false;
    index.next = false;

    document.querySelector('.tabulator').style.display = 'none';

    // simplify
    if (['Checking file<span class="el">.</span><span class="lip">.</span><span class="sis">.</span>', 'Importing<span class="el">.</span><span class="lip">.</span><span class="sis">.</span>'].indexOf(document.querySelector('.loading').innerHTML) > -1) {
        document.querySelector('main').style.display = '';
        document.querySelector('.loading').innerHTML = `Database as of ${updated}`;
        document.querySelector('.reload').style.display = 'inline-flex';
    }

    if (document.querySelector('.qualifiers').style.display) {
        document.querySelector('.help svg').innerHTML = svg.helpClose;
        document.querySelector('.qualifiers').style.display = '';
        document.querySelector('.overlay2').style.display = '';
    }

    if (document.querySelector('.searching')) {
        document.querySelector('.searching').remove();
    }

    if (document.querySelector('.nothing')) {
        document.querySelector('.nothing .results').innerHTML = 'Searching<span class="el">.</span><span class="lip">.</span><span class="sis">.</span>';
        document.querySelector('.nothing .current').style.display = '';
        document.querySelector('.nothing .related').style.display = '';
        document.querySelector('.nothing .enter').style.display = '';
    }

    if (document.querySelector('.seasonal')) {
        document.querySelector('.seasonal .previous').style.display = '';
        document.querySelector('.seasonal .next').style.display = '';
    }

    document.querySelector('main').insertAdjacentHTML('beforeend',
        '<div class="searching">' +
            '<div class="progress" style="left: 0; position: absolute; top: 0;"></div>' +
        '</div>'
    );

    index.qualifiers = 0;
    index.quick = false;
    index.random = 0;

    if (worker) {
        worker.terminate();
        worker = null;
    }

    worker = new Worker('./worker.js');

    worker.postMessage({
        data: table.getData(),
        selected: table.getSelectedData(),
        value: query
    });

    worker.addEventListener('message', (event) => {
        const url = new URL(location.href.replace(location.search, '').replace(location.hash, ''));

        switch (event.data.message) {
            case 'clear':
                if (document.querySelector('.searching')) {
                    document.querySelector('.nothing .results').innerHTML = 'Filtering table<span class="el">.</span><span class="lip">.</span><span class="sis">.</span>';
                }

                timeout = setTimeout(() => {
                    index.dimension = null;

                    table.clearFilter();
                    table.redraw();
                    table.rowManager.resetScroll();

                    table.setSort([
                        {
                            column: 'relevancy',
                            dir: 'desc'
                        },
                        {
                            column: 'alternative',
                            dir: 'asc'
                        }
                    ]);

                    worker.terminate();
                    worker = null;

                    if (!p) {
                        history.pushState({}, '', url);
                    }

                    document.title = title;
                }, 100);

                break;

            case 'found':
                document.querySelector('.progress').classList.add('found');
                break;

            case 'progress':
                document.querySelector('.progress').style.width = event.data.progress;
                break;

            case 'random':
                index.random = event.data.all;
                break;

            case 'success':
                if (document.querySelector('.searching')) {
                    document.querySelector('.nothing .results').innerHTML = 'Filtering table<span class="el">.</span><span class="lip">.</span><span class="sis">.</span>';
                }

                timeout = setTimeout(() => {
                    index.dimension = event.data.update;
                    index.query = event.data.query;
                    index.related = event.data.related;
                    index.message = event.data.message2;

                    // 10 = 1 + 9
                    // 15 = 1 + 5 + 9
                    if (event.data.seasonal && [10, 15].indexOf(event.data.seasonal.count) > -1) {
                        const
                            nextSeason = seasons.indexOf(event.data.seasonal.season) + 1,
                            nextYear = years2.indexOf(event.data.seasonal.year) + 1,
                            prevSeason = seasons.indexOf(event.data.seasonal.season) - 1,
                            prevYear = years2.indexOf(event.data.seasonal.year) - 1;

                        let n2 = '',
                            n3 = '',
                            p2 = '',
                            p3 = '';

                        if (event.data.seasonal.count === 10) {
                            if (years2[prevYear]) {
                                p2 = `year:${years2[prevYear]} `;
                                p3 = years2[prevYear];
                            }

                            if (years2[nextYear]) {
                                n2 = `year:${years2[nextYear]} `;

                                if (years2[nextYear] === 'tba') {
                                    n3 = 'TBA';
                                } else {
                                    n3 = years2[nextYear];
                                }
                            }
                        } else {
                            if (seasons[prevSeason] && event.data.seasonal.year !== 'tba') {
                                p2 = `season:${seasons[prevSeason]} year:${event.data.seasonal.year} `;
                                p3 = `${seasons[prevSeason][0].toUpperCase() + seasons[prevSeason].slice(1)} ${event.data.seasonal.year}`;
                            } else {
                                if (years2[prevYear]) {
                                    p2 = `season:${seasons[seasons.length - 1]} year:${years2[prevYear]} `;

                                    if (seasons[seasons.length - 1] === 'tba') {
                                        p3 = `TBA ${years2[prevYear]}`;
                                    } else {
                                        p3 = `${seasons[seasons.length - 1][0].toUpperCase() + seasons[seasons.length - 1].slice(1)} ${years2[prevYear]}`;
                                    }
                                }
                            }

                            if (seasons[nextSeason]) {
                                n2 = `season:${seasons[nextSeason]} year:${event.data.seasonal.year} `;

                                if (seasons[nextSeason] === 'tba') {
                                    n3 = `TBA ${event.data.seasonal.year}`;
                                } else {
                                    n3 = `${seasons[nextSeason][0].toUpperCase() + seasons[nextSeason].slice(1)} ${event.data.seasonal.year}`;
                                }
                            } else {
                                if (years2[nextYear]) {
                                    if (years2[nextYear] === 'tba') {
                                        n2 = 'season:tba year:tba ';
                                        n3 = 'TBA';
                                    } else {
                                        n2 = `season:${seasons[0]} year:${years2[nextYear]} `;
                                        n3 = `${seasons[0][0].toUpperCase() + seasons[0].slice(1)} ${years2[nextYear]}`;
                                    }
                                }
                            }
                        }

                        if (p2 && years2.indexOf(event.data.seasonal.year) > -1) {
                            index.previous = true;

                            document.querySelector('.seasonal .previous').href = `./?query=${escape(encodeURIComponent(p2))}`;
                            document.querySelector('.seasonal .previous').innerHTML = `← ${p3}`;
                        } else {
                            document.querySelector('.seasonal .previous').href = './';
                            document.querySelector('.seasonal .previous').innerHTML = '';
                        }

                        if (n2 && years2.indexOf(event.data.seasonal.year) > -1) {
                            index.next = true;

                            document.querySelector('.seasonal .next').href = `./?query=${escape(encodeURIComponent(n2))}`;
                            document.querySelector('.seasonal .next').innerHTML = `${n3} →`;
                        } else {
                            document.querySelector('.seasonal .next').href = './';
                            document.querySelector('.seasonal .next').innerHTML = '';
                        }
                    } else {
                        document.querySelector('.seasonal .previous').href = './';
                        document.querySelector('.seasonal .previous').innerHTML = '';

                        document.querySelector('.seasonal .next').href = './';
                        document.querySelector('.seasonal .next').innerHTML = '';
                    }

                    table.setFilter('sources', 'in', event.data.filter);
                    table.redraw();
                    table.rowManager.resetScroll();

                    table.setSort([
                        {
                            column: 'relevancy',
                            dir: 'desc'
                        },
                        {
                            column: 'alternative',
                            dir: 'asc'
                        }
                    ]);

                    worker.terminate();
                    worker = null;

                    if (query) {
                        url.searchParams.set('query', encodeURIComponent(query));
                    }

                    if (!p) {
                        history.pushState({}, '', url);
                    }

                    if (query) {
                        document.title = `${query} - ${title} (full search)`;
                    } else {
                        document.title = title;
                    }
                }, 100);

                break;

            default:
                break;
        }
    });
}

function qualifiers(v) {
    for (const value of [
        'alt:false',
        'case:true',
        'eps:(?:tba|(?:<=|>=|<|>)?(?:0|[1-9][0-9]*)(?:&(?:<=|>=|<|>)?(?:0|[1-9][0-9]*))*)',
        'id:(?:[1-9][0-9]*)(?:\\|[1-9][0-9]*)*',
        'is:deleted',
        'is:mismatched',
        'is:new',
        'is:now',
        'is:ongoing',
        'is:r18',
        'is:selected',
        'progress:(?:<=|>=|<|>)?(?:0|[1-9][0-9]*)%?(?:&(?:<=|>=|<|>)?(?:0|[1-9][0-9]*)%?)*',
        'random:(?:true|[1-9][0-9]*)',
        'regex:true',
        'related2:[1-9][0-9]*',
        'related:[1-9][0-9]*',
        'season:(?:winter|spring|summer|fall|now|tba)(?:\\|(?:winter|spring|summer|fall|now|tba))*',
        'similar:[1-9][0-9]*',
        'status:(?:all|none|watching|completed|paused|dropped|planning|skipping)(?:\\|(?:all|none|watching|completed|paused|dropped|planning|skipping))*',
        'tag:\\S+(?:\\|\\S+)*',
        'type:(?:tv|movie|ova|ona|special|tba)(?:\\|(?:tv|movie|ova|ona|special|tba))*',
        'watched:(?:<=|>=|<|>)?(?:0|[1-9][0-9]*)(?:&(?:<=|>=|<|>)?(?:0|[1-9][0-9]*))*',
        'year:(?:now|tba|(?:<=|>=|<|>)?[1-9][0-9]{3}(?:&(?:<=|>=|<|>)?[1-9][0-9]{3})*)'
    ]) {
        if (RegExp(`(?<=^|\\s)${value}(?=\\s|$)`, 'giv').test(v)) {
            return true;
        }
    }

    return false;
}

document.querySelector('#toggle-delisted').addEventListener('change', () => {
    if (!built) {
        return;
    }

    const c = JSON.parse(localStorage.getItem('tsuzuku'));

    if (c.delisted) {
        c.delisted = false;
    } else {
        c.delisted = true;
    }

    localStorage.setItem('tsuzuku', JSON.stringify(c));
});

document.querySelector('#toggle-thumbnails').addEventListener('change', () => {
    if (!built) {
        return;
    }

    const c = JSON.parse(localStorage.getItem('tsuzuku'));

    if (c.thumbnails) {
        document.body.classList.add('hide');
        t.getColumn('picture').hide();
        t.getColumn('picture2').show();
        c.thumbnails = false;
    } else {
        document.body.classList.remove('hide');
        t.getColumn('picture').show();
        t.getColumn('picture2').hide();
        c.thumbnails = true;
    }

    localStorage.setItem('tsuzuku', JSON.stringify(c));

    t.redraw();
    // t.rowManager.resetScroll();
});

document.querySelector('#toggle-progress').addEventListener('change', () => {
    if (!built) {
        return;
    }

    const c = JSON.parse(localStorage.getItem('tsuzuku'));

    if (c.progress) {
        document.body.classList.add('hide2');
        c.progress = false;
    } else {
        document.body.classList.remove('hide2');
        c.progress = true;
    }

    localStorage.setItem('tsuzuku', JSON.stringify(c));
});

document.querySelector('#dim-skipping').addEventListener('change', () => {
    if (!built) {
        return;
    }

    const c = JSON.parse(localStorage.getItem('tsuzuku'));

    if (c.dimSkipping) {
        document.body.classList.remove('dim');
        c.dimSkipping = false;
    } else {
        document.body.classList.add('dim');
        c.dimSkipping = true;
    }

    localStorage.setItem('tsuzuku', JSON.stringify(c));
});

document.querySelector('header').addEventListener('dblclick', () => {
    if (t) {
        t.rowManager.resetScroll();
    }
});

document.querySelector('.close').addEventListener('click', () => {
    if (disableSelection) {
        return;
    }

    index.lastRow = null;

    document.querySelector('.header-selected').classList.remove('header-selected');

    if (document.querySelector('.header-status')) {
        document.querySelector('.header-status').remove();
    }

    if (document.querySelector('header .menu')) {
        document.querySelector('header .menu').style.display = 'inline-flex';
    }

    if (document.querySelector('.copy')) {
        document.querySelector('.copy').style.display = 'none';
    }

    document.head.querySelector('[name="theme-color"]').content = '#000';

    t.getColumn('picture').getElement().querySelector('.tabulator-col-title').title = 'Select all search results';
    t.getColumn('picture').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
    t.getColumn('picture').getElement().querySelector('.tabulator-col-title svg').style.fill = '';

    t.getColumn('picture2').getElement().querySelector('.tabulator-col-title').title = 'Select all search results';
    t.getColumn('picture2').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
    t.getColumn('picture2').getElement().querySelector('.tabulator-col-title svg').style.fill = '';

    t.deselectRow();

    selected.s = false;
    selected.ss.splice(0);
});

document.querySelector('.copy').addEventListener('click', () => {
    if (disableSelection) {
        return;
    }

    t.copyToClipboard('selected');
});

document.querySelector('.help').addEventListener('click', () => {
    if (document.querySelector('.qualifiers').style.display) {
        help = false;

        document.querySelector('.help svg').innerHTML = svg.helpClose;
        document.querySelector('.qualifiers').style.display = '';
        document.querySelector('.overlay2').style.display = '';

        for (const value of ['a.no-tab', 'select.no-tab']) {
            document.querySelectorAll(value).forEach((element) => {
                element.classList.remove('no-tab');
                element.removeAttribute('tabindex');
            });
        }

        document.querySelectorAll('.no-tab').forEach((element) => {
            element.classList.remove('no-tab');
            element.setAttribute('tabindex', 0);
        });

        document.querySelector('.search').focus();
    } else {
        help = true;

        document.querySelector('.help svg').innerHTML = svg.helpOpen;
        document.querySelector('.qualifiers').style.display = 'block';
        document.querySelector('.overlay2').style.display = 'block';

        for (const value of [
            '.tabulator-cell[tabindex]:not([tabulator-field="progress"])',
            '.tabulator-cell a',
            '.tabulator-cell select',
            '.tabulator-cell span[tabindex]',
            '.tabulator-col[tabindex]'
        ]) {
            document.querySelectorAll(value).forEach((element) => {
                element.classList.add('no-tab');
                element.setAttribute('tabindex', -1);
            });
        }
    }
});

document.querySelector('.overlay2').addEventListener('click', () => {
    help = false;

    document.querySelector('.help svg').innerHTML = svg.helpClose;
    document.querySelector('.qualifiers').style.display = '';
    document.querySelector('.overlay2').style.display = '';

    for (const value of ['a.no-tab', 'select.no-tab']) {
        document.querySelectorAll(value).forEach((element) => {
            element.classList.remove('no-tab');
            element.removeAttribute('tabindex');
        });
    }

    document.querySelectorAll('.no-tab').forEach((element) => {
        element.classList.remove('no-tab');
        element.setAttribute('tabindex', 0);
    });
});

document.querySelectorAll('.menu').forEach((element) => {
    element.addEventListener('click', () => {
        const map = new Map();
        let total = 0;

        if (document.querySelector('.side').style.display !== 'flex') {
            document.querySelector('.side').style.display = 'flex';
            document.querySelector('.overlay').style.display = 'block';
        }

        for (const value of [
            ':not(.side) > :not(div) > .menu',
            'div[tabindex]:not(.menu):not(.overlay):not(.tabulator-tableholder):not(.tabulator-cell[tabulator-field="progress"]):not(.tabulator-cell[tabulator-field="watched"])',
            ':not(.tab) > a',
            'input',
            'select',
            ':not(.export):not(.import):not(.reset) > span[tabindex]',
            'code'
        ]) {
            document.querySelectorAll(value).forEach((element2) => {
                element2.classList.add('no-tab');
                element2.setAttribute('tabindex', -1);
            });
        }

        db2().openCursor().onsuccess = (event) => {
            const cursor = event.target.result;

            if (cursor) {
                map.set(cursor.value.status.toLowerCase(), (map.get(cursor.value.status.toLowerCase()) || 0) + 1);
                total += 1;

                cursor.continue();
            } else {
                for (const value of ['completed', 'dropped', 'paused', 'planning', 'skipping', 'watching']) {
                    if (map.has(value)) {
                        document.querySelector(`#${value} span`).innerHTML = addCommas(map.get(value));
                    } else {
                        document.querySelector(`#${value} span`).innerHTML = 0;
                    }
                }

                document.querySelector('#all span').innerHTML = addCommas(total);

                if (error2) {
                    return;
                }

                let deleted = null,
                    mismatched = null;

                mismatched = t.getData().filter((i) => {
                    if (i.episodes && i.status === 'Completed' && Number(i.progress) !== Number(i.episodes)) {
                        return true;
                    }

                    return false;
                });

                if (mismatched.length) {
                    document.querySelector('#mismatched').style.display = '';
                    document.querySelector('#mismatched span').innerHTML = addCommas(mismatched.length);
                } else {
                    document.querySelector('#mismatched').style.display = 'none';
                    document.querySelector('#mismatched span').innerHTML = 0;
                }

                deleted = t.getData().filter((i) => i.deleted);

                if (deleted.length) {
                    document.querySelector('#deleted').style.display = '';
                    document.querySelector('#deleted span').innerHTML = addCommas(deleted.length);
                } else {
                    document.querySelector('#deleted').style.display = 'none';
                    document.querySelector('#deleted span').innerHTML = 0;
                }
            }
        };
    });
});

document.querySelector('.overlay').addEventListener('click', () => {
    if (document.querySelector('.side').style.display) {
        document.querySelector('.side').style.display = '';
        document.querySelector('.overlay').style.display = '';
    }

    for (const value of ['a.no-tab', 'input.no-tab', 'select.no-tab']) {
        document.querySelectorAll(value).forEach((element) => {
            element.classList.remove('no-tab');
            element.removeAttribute('tabindex');
        });
    }

    document.querySelectorAll('.no-tab').forEach((element) => {
        element.classList.remove('no-tab');
        element.setAttribute('tabindex', 0);
    });

    if (!help) {
        return;
    }

    for (const value of [
        '.tabulator-cell[tabindex]:not([tabulator-field="progress"])',
        '.tabulator-cell a',
        '.tabulator-cell select',
        '.tabulator-cell span[tabindex]',
        '.tabulator-col[tabindex]'
    ]) {
        document.querySelectorAll(value).forEach((element) => {
            element.classList.add('no-tab');
            element.setAttribute('tabindex', -1);
        });
    }
});

document.querySelector('.clear').addEventListener('click', () => {
    document.querySelector('.clear').style.display = 'none';
    document.querySelector('.search').value = '';
    document.querySelector('.search').focus();
    document.querySelector('.blur').style.display = '';
    document.querySelector('.seasonal .previous').href = './';
    document.querySelector('.seasonal .next').href = './';

    if (timeout) {
        clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
        const url = new URL(location.href.replace(location.search, '').replace(location.hash, ''));

        index.dimension = null;
        index.qualifiers = qualifiers(document.querySelector('.search').value);
        index.quick = true;

        t.setFilter('title', 'like', document.querySelector('.search').value);
        t.redraw();
        t.rowManager.resetScroll();

        if (worker) {
            worker.terminate();
            worker = null;
        }

        document.querySelector('.blur').style.display = 'none';

        url.hash = '';
        history.pushState({}, '', url);

        document.title = title;
    }, 300);
});

document.querySelector('.clear').addEventListener('dragenter', (e) => {
    e.preventDefault();

    if (target) {
        target2 = true;
    }

    target = true;
    document.querySelector('.search-container').classList.add('over');
});

document.querySelector('.clear').addEventListener('dragleave', () => {
    if (target2) {
        target2 = false;
    } else {
        target = false;
        target2 = false;
        document.querySelector('.search-container').classList.remove('over');
    }
});

document.querySelector('.clear').addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.querySelector('.clear').addEventListener('drop', (e) => {
    e.preventDefault();

    target = false;
    target2 = false;

    document.querySelector('.search-container').classList.remove('over');
    document.querySelector('.clear').style.display = 'none';
    document.querySelector('.search').value = e.dataTransfer.getData('text/plain');
    document.querySelector('.search').focus();
    document.querySelector('.blur').style.display = '';
    document.querySelector('.seasonal .previous').href = './';
    document.querySelector('.seasonal .next').href = './';

    if (timeout) {
        clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
        const url = new URL(location.href.replace(location.search, '').replace(location.hash, ''));

        index.dimension = null;
        index.qualifiers = qualifiers(document.querySelector('.search').value);
        index.quick = true;

        t.setFilter('title', 'like', document.querySelector('.search').value);
        t.redraw();
        t.rowManager.resetScroll();

        if (worker) {
            worker.terminate();
            worker = null;
        }

        document.querySelector('.blur').style.display = 'none';

        url.hash = document.querySelector('.search').value;
        history.pushState({}, '', url);

        document.title = title;
    }, 300);
});

document.querySelector('.search').addEventListener('focus', (e) => {
    if (e.target.value) {
        document.querySelector('.clear').style.display = 'inline-flex';
    }
});

document.querySelector('.enter').addEventListener('click', (e) => {
    e.preventDefault();

    index.quick = false;
    document.querySelector('.blur').style.display = 'none';
    searchFunction();
});

document.querySelector('.current').addEventListener('click', (e) => {
    e.preventDefault();

    document.querySelector('.search').value = 'is:now ';
    searchFunction();
});

document.querySelector('.related').addEventListener('click', (e) => {
    e.preventDefault();

    // 4 = 1 + 3
    // 5 = 2 + 3
    switch (index.related) {
        case 5:
            document.querySelector('.search').value = searchReplace(document.querySelector('.search').value, '(?:^|\\s)related2:[1-9][0-9]*(?:\\s|$)', 'related2', 'related');
            break;

        default:
            document.querySelector('.search').value = searchReplace(document.querySelector('.search').value, '(?:^|\\s)related:[1-9][0-9]*(?:\\s|$)', 'related', 'related2');
            break;
    }

    searchFunction();
});

document.querySelectorAll('.seasonal a').forEach((element) => {
    element.addEventListener('click', (e) => {
        const u = '/?query=';

        e.preventDefault();

        document.querySelector('.search').value = decodeURIComponent(unescape(element.href.slice(element.href.indexOf(u) + u.length)));
        searchFunction();
    });
});

document.querySelector('.search').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.repeat) {
        return;
    }

    index.quick = false;
    e.target.blur();
    document.querySelector('.blur').style.display = 'none';
    searchFunction();
});

document.querySelector('.search').addEventListener('input', (e) => {
    if (e.target.value) {
        document.querySelector('.clear').style.display = 'inline-flex';
    } else {
        document.querySelector('.clear').style.display = 'none';
    }

    document.querySelector('.blur').style.display = '';
    document.querySelector('.seasonal .previous').href = './';
    document.querySelector('.seasonal .next').href = './';

    if (timeout) {
        clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
        const url = new URL(location.href.replace(location.search, '').replace(location.hash, ''));

        index.dimension = null;
        index.qualifiers = qualifiers(e.target.value.trim());
        index.quick = true;

        t.setFilter('title', 'like', e.target.value.trim());
        t.redraw();
        t.rowManager.resetScroll();

        if (worker) {
            worker.terminate();
            worker = null;
        }

        url.hash = e.target.value;

        if (location.hash) {
            history.replaceState({}, '', url);
        } else {
            history.pushState({}, '', url);
        }

        document.querySelector('.blur').style.display = 'none';

        if (e.target.value.trim()) {
            document.title = `${e.target.value.trim()} - ${title} (quick search)`;
        } else {
            document.title = title;
        }
    }, 300);
});

document.querySelectorAll('code').forEach((element) => {
    element.addEventListener('click', (e) => {
        if ((/^$|\s$/giv).test(document.querySelector('.search').value)) {
            if (e.currentTarget.dataset.value2) {
                document.querySelector('.search').value += e.currentTarget.dataset.value2;
            } else {
                document.querySelector('.search').value += `${e.currentTarget.dataset.value} `;
            }
        } else {
            if (e.currentTarget.dataset.value2) {
                document.querySelector('.search').value += ` ${e.currentTarget.dataset.value2}`;
            } else {
                document.querySelector('.search').value += ` ${e.currentTarget.dataset.value} `;
            }
        }

        document.querySelector('.search').focus();
        document.querySelector('.blur').style.display = '';

        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            const url = new URL(location.href.replace(location.search, '').replace(location.hash, ''));

            index.dimension = null;
            index.qualifiers = qualifiers(document.querySelector('.search').value);
            index.quick = true;

            t.setFilter('title', 'like', document.querySelector('.search').value);
            t.redraw();
            t.rowManager.resetScroll();

            if (worker) {
                worker.terminate();
                worker = null;
            }

            document.querySelector('.blur').style.display = 'none';

            url.hash = document.querySelector('.search').value;
            history.pushState({}, '', url);
        }, 300);
    });
});

document.querySelectorAll('.tab').forEach((element) => {
    element.addEventListener('click', (e) => {
        e.preventDefault();

        const q = `${element.querySelector('a').dataset.query} `;

        if (document.querySelector('.side').style.display) {
            document.querySelector('.side').style.display = '';
            document.querySelector('.overlay').style.display = '';
        }

        for (const value of ['a.no-tab', 'input.no-tab', 'select.no-tab']) {
            document.querySelectorAll(value).forEach((element2) => {
                element2.classList.remove('no-tab');
                element2.removeAttribute('tabindex');
            });
        }

        document.querySelectorAll('.no-tab').forEach((element2) => {
            element2.classList.remove('no-tab');
            element2.setAttribute('tabindex', 0);
        });

        document.querySelector('.search').value = q;
        searchFunction(null, q, null);
    });

    element.querySelector('a').addEventListener('click', (e) => {
        e.preventDefault();
    });
});

document.querySelector('.count-selected').addEventListener('click', (e) => {
    e.preventDefault();

    document.querySelector('.search').value = 'is:selected ';
    searchFunction();
});

document.querySelector('.import span').addEventListener('click', () => {
    if (disableSelection || error || error2) {
        return;
    }

    const input = document.createElement('input');

    input.type = 'file';
    input.accept = 'application/xml';
    input.addEventListener('change', (e) => {
        const
            file = e.target.files[0],
            reader = new FileReader();

        if (document.querySelector('.side').style.display) {
            document.querySelector('.side').style.display = '';
            document.querySelector('.overlay').style.display = '';
        }

        if (document.querySelector('.reload').style.display !== 'none') {
            document.querySelector('.reload').style.display = 'none';
        }

        document.querySelector('main').style.display = 'none';
        document.querySelector('.loading').innerHTML = 'Checking file<span class="el">.</span><span class="lip">.</span><span class="sis">.</span>';

        reader.readAsText(file);
        reader.onload = (event) => {
            function parse(value, element) {
                if (value.querySelector(element)) {
                    return value.querySelector(element).textContent;
                }

                return '';
            }

            function status(s, s2) {
                switch (s) {
                    case 'Completed':
                        return 'Completed';

                    case 'Dropped':
                        if (s2) {
                            return 'Skipping';
                        }

                        return 'Dropped';

                    case 'On-Hold':
                        return 'Paused';

                    case 'Plan to Watch':
                        return 'Planning';

                    default:
                        return 'Watching';
                }
            }

            let a2 = null,
                count = 0;

            const a = new DOMParser().parseFromString(event.target.result, 'application/xml').querySelector('myanimelist');

            if (a) {
                a2 = a.querySelectorAll('anime');

                if (!a2.length) {
                    input.remove();
                    searchFunction(null, null, true);

                    return;
                }
            } else {
                input.remove();
                searchFunction(null, null, true);

                return;
            }

            document.querySelector('.loading').innerHTML = 'Importing<span class="el">.</span><span class="lip">.</span><span class="sis">.</span>';

            for (const value of a2) {
                const
                    s = Number(parse(value, 'series_animedb_id'))
                        ? `https://myanimelist.net/anime/${parse(value, 'series_animedb_id')}`
                        : parse(value, 'series_animedb_id'),
                    s2 = status(parse(value, 'my_status'), Number(parse(value, 'my_skipping'))),
                    s3 = s2 === 'Planning' || s2 === 'Skipping'
                        ? ''
                        : parse(value, 'my_watched_episodes') || '0',
                    s4 = parse(value, 'my_times_watched'),
                    ss = t.searchRows('sources', '=', s)[0];

                if (ss) {
                    const d = db2().add({
                        episodes: ss.getData().episodes,
                        progress: s3,
                        season: ss.getData().season,
                        source: s,
                        status: s2,
                        title: ss.getData().title,
                        type: ss.getData().type,
                        watched: s4
                    });

                    d.onsuccess = () => {
                        ss.update({
                            progress: s3,
                            status: s2,
                            watched: s4
                        });

                        count++;

                        if (count === a2.length) {
                            setTimeout(() => {
                                input.remove();
                                searchFunction(null, null, true);
                            }, 100);
                        }
                    };

                    d.onerror = () => {
                        db2().get(s).onsuccess = (event2) => {
                            const result = event2.target.result;

                            result.progress = s3;
                            result.status = s2;
                            result.watched = s4;

                            db2().put(result).onsuccess = () => {
                                ss.update({
                                    progress: s3,
                                    status: s2,
                                    watched: s4
                                });

                                count++;

                                if (count === a2.length) {
                                    setTimeout(() => {
                                        input.remove();
                                        searchFunction(null, null, true);
                                    }, 100);
                                }
                            };
                        };
                    };
                } else {
                    count++;

                    if (count === a2.length) {
                        setTimeout(() => {
                            input.remove();
                            searchFunction(null, null, true);
                        }, 100);
                    }
                }
            }
        };
    });

    input.click();
});

document.querySelector('.export span').addEventListener('click', () => {
    if (disableSelection || error) {
        return;
    }

    let xml =
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<myanimelist>\n' +
        '    <myinfo>\n' +
        '        <user_export_type>1</user_export_type>\n' +
        '    </myinfo>\n';

    db2().openCursor().onsuccess = (event) => {
        const cursor = event.target.result;

        if (cursor) {
            let progress = cursor.value.progress,
                rewatching = 0,
                skipping = 0,
                status = null;

            switch (cursor.value.status) {
                case 'Paused':
                    status = 'On-Hold';
                    break;

                case 'Planning':
                    status = 'Plan to Watch';
                    progress = 0;
                    break;

                case 'Skipping':
                    status = 'Dropped';
                    skipping = 1;
                    progress = 0;
                    break;

                case 'Watching':
                    status = 'Watching';

                    if (Number(cursor.value.watched) > 0) {
                        rewatching = 1;
                    }

                    break;

                default:
                    status = cursor.value.status;
                    break;
            }

            xml +=
            '    <anime>\n' +
            '        <my_finish_date>0000-00-00</my_finish_date>\n' +
            `        <my_rewatching>${rewatching}</my_rewatching>\n` +
            '        <my_score>0</my_score>\n' +
            `        <my_skipping>${skipping}</my_skipping>\n` +
            '        <my_start_date>0000-00-00</my_start_date>\n' +
            `        <my_status>${status}</my_status>\n` +
            `        <my_times_watched>${cursor.value.watched}</my_times_watched>\n` +
            `        <my_watched_episodes>${progress}</my_watched_episodes>\n` +
            `        <series_animedb_id>${
                cursor.key.match(/myanimelist/giv)
                    ? cursor.key.substring('https://myanimelist.net/anime/'.length)
                    : cursor.key
            }</series_animedb_id>\n` +
            `        <series_episodes>${cursor.value.episodes}</series_episodes>\n` +
            `        <series_season>${cursor.value.season}</series_season>\n` +
            `        <series_title><![CDATA[${cursor.value.title}]]></series_title>\n` +
            `        <series_type>${cursor.value.type}</series_type>\n` +
            '        <update_on_import>1</update_on_import>\n' +
            '    </anime>\n';

            cursor.continue();
        } else {
            const
                a = document.createElement('a'),
                d = new Date().toISOString().split('T'),
                d2 = d[0].split('-'),
                d3 = d[1].split(':'),
                d4 = d3[2].split('.');

            a.href = URL.createObjectURL(new Blob([`${xml}</myanimelist>`]), {
                type: 'application/xml'
            });

            a.download = `tsuzuku-${d2[0]}-${d2[1]}-${d2[2]}-${d3[0]}h${d3[1]}m${d4[0]}s${d4[1].slice(0, 3)}.xml`;
            a.click();
            a.remove();
        }
    };
});

document.querySelector('.reset span').addEventListener('click', () => {
    indexedDB.deleteDatabase('tsuzuku');
    location.reload();
});

onpopstate = () => {
    if (location.search) {
        document.querySelector('.search').value = decodeURIComponent(new URLSearchParams(location.search).get('query'));
        searchFunction(null, null, true);

        return;
    }

    document.querySelector('.search').value = decodeURIComponent(location.hash.slice(1));
    document.querySelector('.clear').style.display = 'inline-flex';
    document.querySelector('.blur').style.display = '';
    document.querySelector('.seasonal .previous').href = './';
    document.querySelector('.seasonal .next').href = './';

    if (timeout) {
        clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
        index.dimension = null;
        index.qualifiers = qualifiers(document.querySelector('.search').value.trim());
        index.quick = true;

        t.setFilter('title', 'like', document.querySelector('.search').value.trim());
        t.redraw();
        t.rowManager.resetScroll();

        if (worker) {
            worker.terminate();
            worker = null;
        }

        document.querySelector('.blur').style.display = 'none';

        if (document.querySelector('.search').value.trim()) {
            document.title = `${document.querySelector('.search').value.trim()} - ${title} (quick search)`;
        } else {
            document.title = title;
        }
    }, 300);
};

export {
    index,
    qualifiers,
    searchFunction
};