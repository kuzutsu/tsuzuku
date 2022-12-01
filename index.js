import {
    built,
    db2,
    disableSelection,
    error,
    error2,
    selected,
    svg,
    t,
    title,
    updated,
    years2
} from './fetchFunction.js';

const
    index = {
        count: false,
        dimension: null,
        lastRow: null,
        message: null,
        qualifiers: 0,
        quick: false,
        random: 0,
        related: false
    },
    seasons = ['winter', 'spring', 'summer', 'fall', 'tba'];

let help = false,
    timeout = null,
    worker = null;

function searchFunction(tt, qq, p) {
    const
        query = qq || document.querySelector('.search').value,
        table = tt || t;

    if (timeout) {
        clearTimeout(timeout);
    }

    if (document.querySelector('.search').value) {
        document.querySelector('.clear').style.display = 'inline-flex';
    }

    index.related = false;
    index.count = false;

    document.querySelector('.tabulator').style.display = 'none';

    // simplify
    if (['Checking file<span class="el">.</span><span class="lip">.</span><span class="sis">.</span>', 'Importing<span class="el">.</span><span class="lip">.</span><span class="sis">.</span>'].indexOf(document.querySelector('.loading').innerHTML) > -1) {
        document.querySelector('main').style.display = '';
        document.querySelector('.loading').innerHTML = `Database as of ${updated}`;
    }

    if (document.querySelector('.related-container').style.display === 'inline-flex') {
        document.querySelector('.related-container').style.display = 'none';
        document.querySelector('.search-container').style.display = 'inline-flex';
        document.querySelector('.related-title').innerHTML = '';
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
        document.querySelector('.nothing .enter').style.display = '';
    }

    if (document.querySelector('.seasonal')) {
        document.querySelector('.seasonal .previous').style.display = '';
        document.querySelector('.seasonal .next').style.display = '';
    }

    if (document.querySelector('.return')) {
        document.querySelector('.return').style.display = '';
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
                    table.redraw(true);

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
                    index.message = event.data.message2;

                    if (event.data.seasonal && event.data.seasonal.count === 3) {
                        const
                            nextSeason = seasons.indexOf(event.data.seasonal.season) + 1,
                            nextYear = years2.indexOf(event.data.seasonal.year) + 1,
                            prevSeason = seasons.indexOf(event.data.seasonal.season) - 1,
                            prevYear = years2.indexOf(event.data.seasonal.year) - 1;

                        let n2 = '',
                            p2 = '';

                        index.count = true;

                        if (seasons[prevSeason] && event.data.seasonal.year !== 'tba') {
                            p2 = `season:${seasons[prevSeason]} year:${event.data.seasonal.year} `;
                        } else {
                            if (years2[prevYear]) {
                                p2 = `season:${seasons[seasons.length - 1]} year:${years2[prevYear]} `;
                            }
                        }

                        if (seasons[nextSeason]) {
                            n2 = `season:${seasons[nextSeason]} year:${event.data.seasonal.year} `;
                        } else {
                            if (years2[nextYear]) {
                                if (years2[nextYear] === 'tba') {
                                    n2 = 'season:tba year:tba ';
                                } else {
                                    n2 = `season:${seasons[0]} year:${years2[nextYear]} `;
                                }
                            }
                        }

                        document.querySelector('.seasonal .previous').dataset.value = p2;
                        document.querySelector('.seasonal .next').dataset.value = n2;
                    } else {
                        document.querySelector('.seasonal .previous').dataset.value = '';
                        document.querySelector('.seasonal .next').dataset.value = '';
                    }

                    table.setFilter('sources', 'in', event.data.filter);
                    table.redraw(true);

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
    let q = 0;

    if ((/\bepisodes:(?:&?(?:<=|>=|<|>)?(?:0|[1-9][0-9]*)\b)+/giu).test(v)) {
        q += 1;
    }

    if ((/\bprogress:(?:&?(?:<=|>=|<|>)?(?:0|[1-9][0-9]*)(?:%\B|\b))+/giu).test(v)) {
        q += 1;
    }

    if ((/\byear:(?:tba\b|(?:&?(?:<=|>=|<|>)?[1-9][0-9]{3}\b)+)/giu).test(v)) {
        q += 1;
    }

    if ((/\btype:(?:\|?(?:tv|movie|ova|ona|special|tba)\b)+/giu).test(v)) {
        q += 1;
    }

    if ((/\bstatus:(?:\|?(?:all|none|watching|completed|paused|dropped|planning|rewatching|skipping)\b)+/giu).test(v)) {
        q += 1;
    }

    if ((/\bseason:(?:\|?(?:winter|spring|summer|fall|tba)\b)+/giu).test(v)) {
        q += 1;
    }

    if ((/\btag:\S+\b/giu).test(v)) {
        q += 1;
    }

    if ((/\brewatched:(?:&?(?:<=|>=|<|>)?(?:0|[1-9][0-9]*)\b)+/giu).test(v)) {
        q += 1;
    }

    if ((/\bis:selected\b/giu).test(v)) {
        q += 1;
    }

    if ((/\bis:ongoing\b/giu).test(v)) {
        q += 1;
    }

    if ((/\bis:new\b/giu).test(v)) {
        q += 1;
    }

    if ((/\bis:dead\b/giu).test(v)) {
        q += 1;
    }

    if ((/\bis:mismatched\b/giu).test(v)) {
        q += 1;
    }

    if ((/\bregex:true\b/giu).test(v)) {
        q += 1;
    }

    if ((/\balt:false\b/giu).test(v)) {
        q += 1;
    }

    if ((/\bcase:true\b/giu).test(v)) {
        q += 1;
    }

    if ((/\brandom:[1-9][0-9]*\b/giu).test(v)) {
        q += 1;
    }

    return q;
}

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

    t.redraw(true);
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

document.querySelector('header .menu').addEventListener('click', () => {
    if (error || error2 || !db2) {
        return;
    }

    const map = new Map();
    let total = 0;

    db2().openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        let mismatched = null;

        if (cursor) {
            map.set(cursor.value.status.toLowerCase(), (map.get(cursor.value.status.toLowerCase()) || 0) + 1);
            total += 1;

            cursor.continue();
        } else {
            if (document.querySelector('.side').style.display === '') {
                document.querySelector('.side').style.display = 'flex';
                document.querySelector('.overlay').style.display = 'block';
            }

            for (const value of ['completed', 'dropped', 'paused', 'planning', 'rewatching', 'skipping', 'watching']) {
                if (map.has(value)) {
                    document.querySelector(`.${value}`).innerHTML = map.get(value);
                } else {
                    document.querySelector(`.${value}`).innerHTML = 0;
                }
            }

            mismatched = t.getData().filter((i) => {
                if (i.status === 'Completed' && Number(i.progress) !== Number(i.episodes)) {
                    return true;
                }

                return false;
            });

            if (mismatched.length) {
                document.querySelector('[data-query="status:completed"]').style.marginRight = '9.5px';
                document.querySelector('.mismatched').style.display = 'inline-flex';
                document.querySelector('.mismatched').title = `${mismatched.length} mismatched`;
            } else {
                document.querySelector('[data-query="status:completed"]').style.marginRight = 'auto';
                document.querySelector('.mismatched').style.display = 'none';
                document.querySelector('.mismatched').title = 'Mismatched';
            }

            document.querySelector('.all').innerHTML = total;

            for (const value of [
                ':not(.side) > :not(div) > .menu',
                'div[tabindex]:not(.menu):not(.overlay):not(.tabulator-tableholder):not(.tabulator-cell[tabulator-field="progress"]):not(.tabulator-cell[tabulator-field="rewatched"])',
                ':not(.tab) > a',
                'input',
                'select',
                ':not(.export):not(.import):not(.reset) > span[tabindex]',
                'code'
            ]) {
                document.querySelectorAll(value).forEach((element) => {
                    element.classList.add('no-tab');
                    element.setAttribute('tabindex', -1);
                });
            }
        }
    };
});

document.querySelector('.overlay').addEventListener('click', () => {
    if (document.querySelector('.side').style.display === 'flex') {
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
    document.querySelector('.seasonal .previous').dataset.value = '';
    document.querySelector('.seasonal .next').dataset.value = '';

    if (timeout) {
        clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
        const url = new URL(location.href.replace(location.search, '').replace(location.hash, ''));

        index.dimension = null;
        index.qualifiers = qualifiers(document.querySelector('.search').value);
        index.quick = true;

        t.setFilter('title', 'like', document.querySelector('.search').value);
        t.redraw(true);

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

document.querySelector('.clear').addEventListener('dragenter', () => {
    document.querySelector('.clear').style.display = 'none';
    document.querySelector('.search').value = '';
    document.querySelector('.search').focus();
    document.querySelector('.blur').style.display = '';
    document.querySelector('.seasonal .previous').dataset.value = '';
    document.querySelector('.seasonal .next').dataset.value = '';

    if (timeout) {
        clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
        const url = new URL(location.href.replace(location.search, '').replace(location.hash, ''));

        index.dimension = null;
        index.qualifiers = qualifiers(document.querySelector('.search').value);
        index.quick = true;

        t.setFilter('title', 'like', document.querySelector('.search').value);
        t.redraw(true);

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

document.querySelector('.enter').addEventListener('click', () => {
    index.quick = false;
    document.querySelector('.blur').style.display = 'none';
    searchFunction();
});

document.querySelector('.current').addEventListener('click', () => {
    let season = null,
        year = new Date().getFullYear();

    switch (new Date().getMonth()) {
        case 0:
        case 1:
            season = 'winter';
            break;
        case 2:
        case 3:
        case 4:
            season = 'spring';
            break;
        case 5:
        case 6:
        case 7:
            season = 'summer';
            break;
        case 8:
        case 9:
        case 10:
            season = 'fall';
            break;
        case 11:
            season = 'winter';
            year += 1;
            break;
        default:
            break;
    }

    document.querySelector('.search').value = `season:${season} year:${year} `;
    searchFunction();
});

document.querySelectorAll('.seasonal span').forEach((element) => {
    element.addEventListener('click', (e) => {
        if (!e.currentTarget.dataset.value) {
            return;
        }

        document.querySelector('.search').value = e.currentTarget.dataset.value;
        searchFunction();
    });
});

// same as onpopstate, separate
document.querySelector('.return').addEventListener('click', () => {
    index.related = false;

    if (document.querySelector('.related-container').style.display === 'inline-flex') {
        document.querySelector('.related-container').style.display = 'none';
        document.querySelector('.search-container').style.display = 'inline-flex';
        document.querySelector('.related-title').innerHTML = '';
    }

    if (document.querySelector('.return')) {
        document.querySelector('.return').style.display = '';
    }

    if (location.hash) {
        document.querySelector('.search').value = decodeURIComponent(location.hash.slice(1));
        document.querySelector('.clear').style.display = 'inline-flex';
        document.querySelector('.blur').style.display = '';

        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            index.dimension = null;
            index.quick = true;

            t.setFilter('title', 'like', document.querySelector('.search').value);
            t.redraw(true);

            if (worker) {
                worker.terminate();
                worker = null;
            }

            document.querySelector('.blur').style.display = 'none';

            if (document.querySelector('.search').value) {
                document.title = `${document.querySelector('.search').value} - ${title} (quick search)`;
            } else {
                document.title = title;
            }
        }, 300);

        return;
    }

    if (new URLSearchParams(location.search).get('query')) {
        document.querySelector('.search').value = decodeURIComponent(new URLSearchParams(location.search).get('query'));
        document.querySelector('.clear').style.display = 'inline-flex';
    } else {
        document.querySelector('.search').value = '';
        document.querySelector('.clear').style.display = 'none';
    }

    document.querySelector('.tabulator').style.display = 'none';

    if (document.querySelector('.searching')) {
        document.querySelector('.searching').remove();
    }

    searchFunction(null, null, true);
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
    document.querySelector('.seasonal .previous').dataset.value = '';
    document.querySelector('.seasonal .next').dataset.value = '';

    if (timeout) {
        clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
        const url = new URL(location.href.replace(location.search, '').replace(location.hash, ''));

        index.dimension = null;
        index.qualifiers = qualifiers(e.target.value);
        index.quick = true;

        t.setFilter('title', 'like', e.target.value);
        t.redraw(true);

        if (worker) {
            worker.terminate();
            worker = null;
        }

        document.querySelector('.blur').style.display = 'none';

        url.hash = e.target.value;
        history.pushState({}, '', url);

        if (e.target.value) {
            document.title = `${e.target.value} - ${title} (quick search)`;
        } else {
            document.title = title;
        }
    }, 300);
});

document.querySelectorAll('code').forEach((element) => {
    element.addEventListener('click', (e) => {
        if ((/^$|\s$/giu).test(document.querySelector('.search').value)) {
            if (e.currentTarget.dataset.value2) {
                document.querySelector('.search').value += `${e.currentTarget.dataset.value2}`;
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
            t.redraw(true);

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

        if (document.querySelector('.side').style.display === 'flex') {
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

document.querySelector('.selected-count').addEventListener('click', () => {
    document.querySelector('.search').value = 'is:selected ';
    searchFunction();
});

document.querySelector('.mismatched').addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();

    const q = 'is:mismatched ';

    if (document.querySelector('.side').style.display === 'flex') {
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

document.querySelector('.import span').addEventListener('click', () => {
    if (error) {
        return;
    }

    const input = document.createElement('input');

    input.type = 'file';
    input.accept = 'application/xml';
    input.addEventListener('change', (e) => {
        const
            file = e.target.files[0],
            reader = new FileReader();

        if (document.querySelector('.side').style.display === 'flex') {
            document.querySelector('.side').style.display = '';
            document.querySelector('.overlay').style.display = '';
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

            function status(s, r2, t2, s2) {
                switch (s) {
                    case 'Completed':
                        if (r2) {
                            return 'Rewatching';
                        }

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
                        if (t2) {
                            return 'Rewatching';
                        }

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
                    s2 = status(parse(value, 'my_status'), Number(parse(value, 'my_rewatching')), Number(parse(value, 'my_times_watched')), Number(parse(value, 'my_skipping'))),
                    s3 = s2 === 'Planning' || s2 === 'Skipping'
                        ? ''
                        : parse(value, 'my_watched_episodes') || '0',
                    s4 = parse(value, 'my_times_watched'),
                    ss = t.searchRows('sources', '=', s)[0];

                if (ss) {
                    const d = db2().add({
                        episodes: ss.getData().episodes,
                        progress: s3,
                        rewatched: s4,
                        season: ss.getData().season,
                        source: s,
                        status: s2,
                        title: ss.getData().title,
                        type: ss.getData().type
                    });

                    d.onsuccess = () => {
                        ss.update({
                            progress: s3,
                            rewatched: s4,
                            status: s2
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
                            result.rewatched = s4;
                            result.status = s2;

                            db2().put(result).onsuccess = () => {
                                ss.update({
                                    progress: s3,
                                    rewatched: s4,
                                    status: s2
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
    if (error) {
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

                case 'Rewatching':
                    status = 'Completed';
                    rewatching = 1;
                    break;

                case 'Skipping':
                    status = 'Dropped';
                    skipping = 1;
                    progress = 0;
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
            `        <my_times_watched>${cursor.value.rewatched}</my_times_watched>\n` +
            `        <my_watched_episodes>${progress}</my_watched_episodes>\n` +
            `        <series_animedb_id>${
                cursor.key.match(/myanimelist/gu)
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
            const a = document.createElement('a');

            a.href = URL.createObjectURL(new Blob([`${xml}</myanimelist>`]), {
                type: 'application/xml'
            });

            a.download = `tsuzuku_${new Date().toISOString()}.xml`;
            a.click();
            a.remove();
        }
    };
});

document.querySelector('.reset span').addEventListener('click', () => {
    db2().clear().onsuccess = () => {
        location.reload();
    };
});

onpopstate = () => {
    index.related = false;

    if (document.querySelector('.related-container').style.display === 'inline-flex') {
        document.querySelector('.related-container').style.display = 'none';
        document.querySelector('.search-container').style.display = 'inline-flex';
        document.querySelector('.related-title').innerHTML = '';
    }

    if (document.querySelector('.return')) {
        document.querySelector('.return').style.display = '';
    }

    if (location.hash) {
        document.querySelector('.search').value = decodeURIComponent(location.hash.slice(1));
        document.querySelector('.clear').style.display = 'inline-flex';
        document.querySelector('.blur').style.display = '';

        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            index.dimension = null;
            index.quick = true;

            t.setFilter('title', 'like', document.querySelector('.search').value);
            t.redraw(true);

            if (worker) {
                worker.terminate();
                worker = null;
            }

            document.querySelector('.blur').style.display = 'none';

            if (document.querySelector('.search').value) {
                document.title = `${document.querySelector('.search').value} - ${title} (quick search)`;
            } else {
                document.title = title;
            }
        }, 300);

        return;
    }

    if (new URLSearchParams(location.search).get('query')) {
        document.querySelector('.search').value = decodeURIComponent(new URLSearchParams(location.search).get('query'));
        document.querySelector('.clear').style.display = 'inline-flex';
    } else {
        document.querySelector('.search').value = '';
        document.querySelector('.clear').style.display = 'none';
    }

    document.querySelector('.tabulator').style.display = 'none';

    if (document.querySelector('.searching')) {
        document.querySelector('.searching').remove();
    }

    searchFunction(null, null, true);
};

export {
    index,
    qualifiers,
    searchFunction
};