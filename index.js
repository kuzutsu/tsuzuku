import {
    db2,
    disableSelection,
    error,
    error2,
    r,
    selected,
    sorted,
    svg,
    t,
    title
} from './fetchFunction.js';

const index = {
    dimension: null,
    error: false,
    lastRow: null
};

let help = false,
    worker = null;

function searchFunction(tt, qq, p) {
    const
        query = qq || document.querySelector('.search').value,
        table = tt || t;

    if (document.querySelector('.nothing')) {
        document.querySelector('.nothing').remove();
    } else {
        document.querySelector('.tabulator').style.display = 'none';
    }

    if (document.querySelector('.search').value) {
        document.querySelector('.clear').style.display = 'inline-flex';
    }

    if (document.querySelector('.importing')) {
        document.querySelector('.top-container').style.display = 'inline-flex';
        document.querySelector('.importing').remove();
    }

    if (document.querySelector('.related-container').style.display === 'inline-flex') {
        document.querySelector('.related-container').style.display = 'none';
        document.querySelector('.search-container').style.display = 'inline-flex';
        document.querySelector('.related-title').innerHTML = '';
    }

    if (document.querySelector('.qualifiers').style.display) {
        document.querySelector('.qualifiers').style.display = '';
    }

    if (document.querySelector('.searching')) {
        document.querySelector('.searching').remove();
    }

    document.querySelector('main').insertAdjacentHTML('beforeend',
        '<div class="searching">' +
            '<div class="progress" style="left: 0; position: absolute; top: 0;"></div>' +
            '<span>Searching...</span>' +
        '</div>'
    );

    if (r) {
        for (const value of r) {
            value.update({
                alternative: value.getData().title,
                relevancy: 1
            });
        }
    }

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
        const url = new URL(location.href.replace(location.search, ''));

        switch (event.data.message) {
            case 'clear':
                if (document.querySelector('.searching')) {
                    document.querySelector('.searching span').innerHTML = 'Filtering table...';
                }

                setTimeout(() => {
                    index.dimension = null;

                    table.clearFilter();
                    table.redraw(true);

                    sorted.s = 'relevancy';
                    sorted.ss = false;

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

            case 'error':
                if (document.querySelector('.searching')) {
                    document.querySelector('.searching span').innerHTML = 'Filtering table...';
                }

                setTimeout(() => {
                    index.dimension = null;
                    index.query = event.data.query;
                    index.error = true;

                    table.setFilter('sources', 'in', event.data.filter);
                    table.redraw(true);

                    sorted.s = 'relevancy';
                    sorted.ss = false;

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
                        document.title = `${query} - ${title}`;
                    } else {
                        document.title = title;
                    }
                }, 100);

                break;

            case 'found':
                document.querySelector('.progress').classList.add('found');
                break;

            case 'progress':
                document.querySelector('.progress').style.width = event.data.progress;
                break;

            case 'success':
                if (document.querySelector('.searching')) {
                    document.querySelector('.searching span').innerHTML = 'Filtering table...';
                }

                setTimeout(() => {
                    index.dimension = event.data.update;
                    index.query = event.data.query;
                    index.error = false;

                    table.setFilter('sources', 'in', event.data.filter);
                    table.redraw(true);

                    sorted.s = 'relevancy';
                    sorted.ss = false;

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
                        document.title = `${query} - ${title}`;
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

document.querySelector('.thumbnails').addEventListener('click', () => {
    if (!t) {
        return;
    }

    const c = JSON.parse(localStorage.getItem('tsuzuku'));

    if (c.thumbnails) {
        document.body.classList.add('hide');
        t.getColumn('picture').hide();
        t.getColumn('picture2').show();
        document.querySelector('.thumbnails path').setAttribute('d', 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z');
        c.thumbnails = false;
    } else {
        document.body.classList.remove('hide');
        t.getColumn('picture').show();
        t.getColumn('picture2').hide();
        document.querySelector('.thumbnails path').setAttribute('d', 'M21.9 21.9l-8.49-8.49l0 0L3.59 3.59l0 0L2.1 2.1L0.69 3.51L3 5.83V19c0 1.1 0.9 2 2 2h13.17l2.31 2.31L21.9 21.9z M5 18 l3.5-4.5l2.5 3.01L12.17 15l3 3H5z M21 18.17L5.83 3H19c1.1 0 2 0.9 2 2V18.17z');
        c.thumbnails = true;
    }

    localStorage.setItem('tsuzuku', JSON.stringify(c));

    t.redraw(true);
});

document.querySelector('.close').addEventListener('click', () => {
    if (disableSelection) {
        return;
    }

    index.lastRow = null;

    document.querySelector('.header-selected').classList.remove('header-selected');
    document.querySelector('.header-status').remove();
    document.querySelector('header .menu').style.display = 'inline-flex';
    document.head.querySelector('[name="theme-color"]').content = '#000';

    t.getColumn('picture').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
    t.getColumn('picture2').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
    t.deselectRow();

    selected.s = false;
    selected.ss.splice(0);
});

document.querySelector('.search').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.repeat) {
        return;
    }

    e.target.blur();
    searchFunction();
});

document.querySelector('.help').addEventListener('click', () => {
    if (document.querySelector('.qualifiers').style.display) {
        help = false;

        document.querySelector('.qualifiers').style.display = '';

        for (const value of ['a.no-tab, select.no-tab']) {
            document.querySelectorAll(value).forEach((element) => {
                element.classList.remove('no-tab');
                element.removeAttribute('tabindex');
            });
        }

        document.querySelectorAll('.no-tab').forEach((element) => {
            element.classList.remove('no-tab');
            element.setAttribute('tabindex', 0);
        });
    } else {
        help = true;

        document.querySelector('.qualifiers').style.display = 'block';

        for (const value of ['.tabulator-cell[tabindex]:not([tabulator-field="progress"]), .tabulator-cell a, .tabulator-cell select, .tabulator-cell span[tabindex], .tabulator-col[tabindex]']) {
            document.querySelectorAll(value).forEach((element) => {
                element.classList.add('no-tab');
                element.setAttribute('tabindex', -1);
            });
        }
    }
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

                document.querySelector('header .menu').blur();
                document.querySelector('.side .menu').focus();
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

            for (const value of [':not(.side) > :not(div) > .menu', 'div[tabindex]:not(.menu):not(.overlay):not(.tabulator-tableHolder):not(.tabulator-cell[tabulator-field="progress"])', ':not(.import):not(.stats):not(.tab) > a', 'input', 'select', ':not(.export):not(.import) > span[tabindex], code']) {
                document.querySelectorAll(value).forEach((element) => {
                    element.classList.add('no-tab');
                    element.setAttribute('tabindex', -1);
                });
            }
        }
    };
});

document.querySelector('.side .menu').addEventListener('click', () => {
    if (document.querySelector('.side').style.display === 'flex') {
        document.querySelector('.side').style.display = '';
        document.querySelector('.overlay').style.display = '';

        document.querySelector('header .menu').focus();
        document.querySelector('.side .menu').blur();
    }

    for (const value of ['a.no-tab, input.no-tab, select.no-tab']) {
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

    for (const value of ['.tabulator-cell[tabindex]:not([tabulator-field="progress"]), .tabulator-cell a, .tabulator-cell select, .tabulator-cell span[tabindex], .tabulator-col[tabindex]']) {
        document.querySelectorAll(value).forEach((element) => {
            element.classList.add('no-tab');
            element.setAttribute('tabindex', -1);
        });
    }
});

document.querySelector('.overlay').addEventListener('click', () => {
    if (document.querySelector('.side').style.display === 'flex') {
        document.querySelector('.side').style.display = '';
        document.querySelector('.overlay').style.display = '';
    }

    for (const value of ['a.no-tab, input.no-tab, select.no-tab']) {
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

    for (const value of ['.tabulator-cell[tabindex]:not([tabulator-field="progress"]), .tabulator-cell a, .tabulator-cell select, .tabulator-cell span[tabindex], .tabulator-col[tabindex]']) {
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
});

document.querySelector('.enter').addEventListener('click', () => {
    searchFunction();
});

document.querySelector('.return').addEventListener('click', () => {
    if (document.querySelector('.related-container').style.display === 'inline-flex') {
        document.querySelector('.related-container').style.display = 'none';
        document.querySelector('.search-container').style.display = 'inline-flex';
        document.querySelector('.related-title').innerHTML = '';
    }

    document.querySelector('.tabulator').style.display = 'none';

    if (document.querySelector('.searching')) {
        document.querySelector('.searching').remove();
    }

    searchFunction();
});

document.querySelector('.clear').addEventListener('dragenter', () => {
    document.querySelector('.clear').style.display = 'none';
    document.querySelector('.search').value = '';
    document.querySelector('.search').focus();
});

document.querySelector('.search').addEventListener('focus', (e) => {
    if (e.target.value) {
        document.querySelector('.clear').style.display = 'inline-flex';
    }
});

document.querySelector('.search').addEventListener('input', (e) => {
    if (e.target.value) {
        document.querySelector('.clear').style.display = 'inline-flex';
    } else {
        document.querySelector('.clear').style.display = 'none';
    }
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

        for (const value of ['a.no-tab, input.no-tab, select.no-tab']) {
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

    for (const value of ['a.no-tab, input.no-tab, select.no-tab']) {
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

document.querySelector('.import').addEventListener('click', () => {
    if (error) {
        return;
    }

    const input = document.createElement('input');

    input.type = 'file';
    input.accept = 'application/json,application/xml';
    input.addEventListener('change', (e) => {
        const
            file = e.target.files[0],
            reader = new FileReader();

        if (document.querySelector('.side').style.display === 'flex') {
            document.querySelector('.side').style.display = '';
            document.querySelector('.overlay').style.display = '';
        }

        if (document.querySelector('.nothing')) {
            document.querySelector('.nothing').remove();
        }

        document.querySelector('.top-container').style.display = 'none';
        document.querySelector('.tabulator').style.display = 'none';
        document.querySelector('main').insertAdjacentHTML('beforeend',
            '<div class="importing">' +
                '<span>Checking file...</span>' +
            '</div>'
        );

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
                    case 2:
                    case 'Completed':
                        if (r2) {
                            return 'Rewatching';
                        }

                        return 'Completed';

                    case 3:
                    case 'Dropped':
                        if (s2) {
                            return 'Skipping';
                        }

                        return 'Dropped';

                    case 4:
                    case 'On-Hold':
                        return 'Paused';

                    case 1:
                    case 'Plan to Watch':
                        return 'Planning';

                    case 5:
                        return 'Rewatching';

                    case 0:
                    case 'Watching':
                    default:
                        if (t2) {
                            return 'Rewatching';
                        }

                        return 'Watching';
                }
            }

            let count = 0;

            // anilist
            //      0 = watching
            //      1 = planning
            //      2 = completed
            //      3 = dropped
            //      4 = paused
            //      5 = rewatching
            try {
                const a = JSON.parse(event.target.result);

                if (!a.lists) {
                    if (document.querySelector('.importing')) {
                        document.querySelector('.importing').remove();
                    }

                    document.querySelector('.top-container').style.display = 'inline-flex';
                    document.querySelector('.tabulator').style.display = '';

                    input.remove();

                    searchFunction(null, null, true);

                    return;
                }

                if (document.querySelector('.importing span')) {
                    document.querySelector('.importing span').innerHTML = 'Importing...';
                }

                for (const value of a.lists) {
                    const
                        s = `https://anilist.co/anime/${value.series_id}`,
                        s2 = status(value.status),
                        s3 = s2 === 'Planning'
                            ? ''
                            : value.progress || '0',
                        ss = t.searchRows((d, dd) => d.sources2[2] === dd.v, {
                            v: s
                        })[0];

                    if (ss) {
                        const d = db2().add({
                            episodes: ss.getData().episodes,
                            progress: s3,
                            season: ss.getData().season,
                            source: ss.getData().sources,
                            status: s2,
                            title: ss.getData().title,
                            type: ss.getData().type
                        });

                        d.onsuccess = () => {
                            ss.update({
                                progress: s3,
                                status: s2
                            });

                            count++;

                            if (count === a.lists.length) {
                                setTimeout(() => {
                                    if (document.querySelector('.importing')) {
                                        document.querySelector('.importing').remove();
                                    }

                                    document.querySelector('.top-container').style.display = 'inline-flex';
                                    document.querySelector('.tabulator').style.display = '';

                                    input.remove();

                                    searchFunction(null, null, true);
                                }, 100);
                            }
                        };

                        d.onerror = () => {
                            db2().get(ss.getData().sources).onsuccess = (event2) => {
                                const result = event2.target.result;

                                result.progress = s3;
                                result.status = s2;

                                db2().put(result).onsuccess = () => {
                                    ss.update({
                                        progress: s3,
                                        status: s2
                                    });

                                    count++;

                                    if (count === a.lists.length) {
                                        setTimeout(() => {
                                            if (document.querySelector('.importing')) {
                                                document.querySelector('.importing').remove();
                                            }

                                            document.querySelector('.top-container').style.display = 'inline-flex';
                                            document.querySelector('.tabulator').style.display = '';

                                            input.remove();

                                            searchFunction(null, null, true);
                                        }, 100);
                                    }
                                };
                            };
                        };
                    } else {
                        count++;

                        if (count === a.lists.length) {
                            setTimeout(() => {
                                if (document.querySelector('.importing')) {
                                    document.querySelector('.importing').remove();
                                }

                                document.querySelector('.top-container').style.display = 'inline-flex';
                                document.querySelector('.tabulator').style.display = '';

                                input.remove();

                                searchFunction(null, null, true);
                            }, 100);
                        }
                    }
                }
            // myanimelist
            } catch {
                const a = new DOMParser().parseFromString(event.target.result, 'application/xml').querySelector('myanimelist');
                let a2 = null;

                if (a) {
                    a2 = a.querySelectorAll('anime');

                    if (!a2.length) {
                        if (document.querySelector('.importing')) {
                            document.querySelector('.importing').remove();
                        }

                        document.querySelector('.top-container').style.display = 'inline-flex';
                        document.querySelector('.tabulator').style.display = '';

                        input.remove();

                        searchFunction(null, null, true);

                        return;
                    }
                } else {
                    if (document.querySelector('.importing')) {
                        document.querySelector('.importing').remove();
                    }

                    document.querySelector('.top-container').style.display = 'inline-flex';
                    document.querySelector('.tabulator').style.display = '';

                    input.remove();

                    searchFunction(null, null, true);

                    return;
                }

                if (document.querySelector('.importing span')) {
                    document.querySelector('.importing span').innerHTML = 'Importing...';
                }

                for (const value of a2) {
                    const
                        s = Number(parse(value, 'series_animedb_id'))
                            ? `https://myanimelist.net/anime/${parse(value, 'series_animedb_id')}`
                            : parse(value, 'series_animedb_id'),
                        s2 = status(parse(value, 'my_status'), Number(parse(value, 'my_rewatching')), Number(parse(value, 'my_times_watched')), Number(parse(value, 'my_skipping'))),
                        s3 = s2 === 'Planning' || s2 === 'Skipping'
                            ? ''
                            : parse(value, 'my_watched_episodes') || '0',
                        ss = t.searchRows('sources', '=', s)[0];

                    if (ss) {
                        const d = db2().add({
                            episodes: ss.getData().episodes,
                            progress: s3,
                            season: ss.getData().season,
                            source: s,
                            status: s2,
                            title: ss.getData().title,
                            type: ss.getData().type
                        });

                        d.onsuccess = () => {
                            ss.update({
                                progress: s3,
                                status: s2
                            });

                            count++;

                            if (count === a2.length) {
                                setTimeout(() => {
                                    if (document.querySelector('.importing')) {
                                        document.querySelector('.importing').remove();
                                    }

                                    document.querySelector('.top-container').style.display = 'inline-flex';
                                    document.querySelector('.tabulator').style.display = '';

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

                                db2().put(result).onsuccess = () => {
                                    ss.update({
                                        progress: s3,
                                        status: s2
                                    });

                                    count++;

                                    if (count === a2.length) {
                                        setTimeout(() => {
                                            if (document.querySelector('.importing')) {
                                                document.querySelector('.importing').remove();
                                            }

                                            document.querySelector('.top-container').style.display = 'inline-flex';
                                            document.querySelector('.tabulator').style.display = '';

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
                                if (document.querySelector('.importing')) {
                                    document.querySelector('.importing').remove();
                                }

                                document.querySelector('.top-container').style.display = 'inline-flex';
                                document.querySelector('.tabulator').style.display = '';

                                input.remove();

                                searchFunction(null, null, true);
                            }, 100);
                        }
                    }
                }
            }
        };
    });

    input.click();
});

document.querySelector('.export').addEventListener('click', () => {
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

            // kitsu
            //      my_status
            //      my_times_watched
            //      my_watched_episodes
            //      series_animedb_id
            //      update_on_import
            //
            // myanimelist
            //      my_rewatching
            //      series_episodes
            //      series_title
            //      series_type
            //
            // anilist
            //      my_finish_date
            //      my_score
            //      my_start_date
            //
            // tsuzuku
            //      my_skipping
            //      series_season
            xml +=
            '    <anime>\n' +
            '        <my_finish_date>0000-00-00</my_finish_date>\n' +
            `        <my_rewatching>${rewatching}</my_rewatching>\n` +
            '        <my_score>0</my_score>\n' +
            `        <my_skipping>${skipping}</my_skipping>\n` +
            '        <my_start_date>0000-00-00</my_start_date>\n' +
            `        <my_status>${status}</my_status>\n` +
            `        <my_times_watched>${rewatching}</my_times_watched>\n` +
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

onpopstate = () => {
    if (new URLSearchParams(location.search).get('query')) {
        document.querySelector('.search').value = decodeURIComponent(new URLSearchParams(location.search).get('query'));
        document.querySelector('.clear').style.display = 'inline-flex';
    } else {
        document.querySelector('.search').value = '';
        document.querySelector('.clear').style.display = 'none';
    }

    if (document.querySelector('.related-container').style.display === 'inline-flex') {
        document.querySelector('.related-container').style.display = 'none';
        document.querySelector('.search-container').style.display = 'inline-flex';
        document.querySelector('.related-title').innerHTML = '';
    }

    document.querySelector('.tabulator').style.display = 'none';

    if (document.querySelector('.searching')) {
        document.querySelector('.searching').remove();
    }

    searchFunction(null, null, true);
};

export {
    index,
    searchFunction
};