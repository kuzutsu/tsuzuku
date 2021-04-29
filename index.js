import {
    db2,
    focused,
    params,
    r,
    selected,
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
        params.randomValue = Math.round(Math.abs(Number(document.querySelector('#number').value))) || 1;
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

    if (document.querySelector(`[data-query="${query}"]`)) {
        document.querySelector(`[data-query="${query}"]`).classList.add('selected-tab');
    }

    if (document.querySelector('.importing')) {
        document.querySelector('#search-container').style.display = 'inline-flex';
        document.querySelector('.importing').remove();
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

    document.querySelector('main').insertAdjacentHTML('beforeend',
        '<div id="searching">' +
            '<div id="progress" style="position: absolute; top: 0; left: 0;"></div>' +
            '<span>Searching...</span>' +
        '</span>'
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
                    }

                    if (!params.alt) {
                        url.searchParams.set('alt', '0');
                    }

                    if (params.random) {
                        url.searchParams.set('random', params.randomValue);
                    }

                    table.setSort('alternative', 'asc');

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
                    index.query = event.data.query;
                    table.setFilter('sources', 'in', event.data.filter);
                    worker.terminate();
                    worker = null;

                    const url = new URL(location.href.replace(location.search, ''));

                    if (params.regex) {
                        url.searchParams.set('regex', '1');
                        table.setSort('alternative', 'asc');
                    } else {
                        if (event.data.query) {
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

document.querySelector('#banner').addEventListener('click', () => {
    document.body.classList.toggle('show');
    document.querySelector('#banner svg').classList.toggle('disabled');

    t.redraw();
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

    selected.s = false;
    selected.ss.splice(0);
});

document.querySelector('#search').addEventListener('keyup', (e) => {
    if (e.key !== 'Enter') {
        return;
    }

    e.target.blur();
    searchFunction();
});

document.querySelector('#enter').addEventListener('click', () => {
    if (document.querySelector('#default').style.display === 'contents') {
        document.querySelector('#default').style.display = 'none';
        document.querySelector('.tabs').style.display = 'contents';
        document.querySelector('#enter svg').style.fill = '#aaa';

        if (!document.querySelector('.settings-container').style.display) {
            document.querySelector('.settings-container').style.display = 'none';
            document.querySelector('#settings svg').style.fill = '#aaa';
            document.querySelector('#database-container').style.maxHeight = '';

            t.redraw();
        }
    } else {
        document.querySelector('#default').style.display = 'contents';
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
    if (document.querySelector('.settings-container').style.display) {
        document.querySelector('.settings-container').style.display = '';
        document.querySelector('#settings svg').style.fill = '';
        document.querySelector('#database-container').style.maxHeight = 'calc(100% - 208px)';
    } else {
        document.querySelector('.settings-container').style.display = 'none';
        document.querySelector('#settings svg').style.fill = '#aaa';
        document.querySelector('#database-container').style.maxHeight = '';
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
    focused.f = true;

    if (e.target.value) {
        document.querySelector('#clear').style.visibility = 'visible';
        document.querySelector('#clear').style.display = 'inline-flex';
    }
});

document.querySelector('#search').addEventListener('blur', () => {
    focused.f = false;
});

document.querySelectorAll('.tab').forEach((element) => {
    element.addEventListener('click', () => {
        if (document.querySelector('.selected-tab')) {
            document.querySelector('.selected-tab').classList.remove('selected-tab');
        }

        element.classList.add('selected-tab');
        document.querySelector('#search').value = element.dataset.query;
        searchFunction(null, element.dataset.query, null, true);
    });
});

document.querySelector('#header-title').addEventListener('click', (e) => {
    if (e.target.parentNode.classList[0] !== 'header-tabulator-selected') {
        return;
    }

    document.querySelector('#search').value = 'is:selected';

    searchFunction();
});

document.querySelector('.import').addEventListener('click', () => {
    const input = document.createElement('input');

    input.type = 'file';
    input.accept = 'application/json,application/xml';
    input.addEventListener('change', (e) => {
        const
            file = e.target.files[0],
            reader = new FileReader();

        reader.readAsText(file);
        reader.onload = (event) => {
            function parse(value, element) {
                if (value.querySelector(element)) {
                    return value.querySelector(element).textContent;
                }

                return '';
            }

            function status(s, r2, t2) {
                switch (s) {
                    case 2:
                    case 'Completed':
                        if (r2) {
                            return 'Rewatching';
                        }

                        return 'Completed';

                    case 3:
                    case 'Dropped':
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

            if (document.querySelector('#nothing')) {
                document.querySelector('#nothing').remove();
            }

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
                    // invalid xml
                    return;
                }

                document.querySelector('#search-container').style.display = 'none';
                document.querySelector('.tabulator').style.display = 'none';
                document.querySelector('main').insertAdjacentHTML('beforeend',
                    '<div class="importing"><span>Importing...</span></div>'
                );

                for (const value of a.lists) {
                    const
                        s = `https://anilist.co/anime/${value.series_id}`,
                        ss = t.searchRows((d, dd) => d.sources2[2] === dd.v, {
                            v: s
                        })[0];

                    if (ss) {
                        const d = db2().add({
                            episodes: ss._row.data.episodes,
                            progress: value.progress || 0,
                            season: ss._row.data.season,
                            source: ss._row.data.sources,
                            status: status(value.status),
                            title: ss._row.data.title,
                            type: ss._row.data.type
                        });

                        d.onsuccess = () => {
                            ss.update({
                                progress: value.progress || 0,
                                status: status(value.status)
                            });

                            count++;

                            if (count === a.lists.length) {
                                setTimeout(() => {
                                    if (document.querySelector('.importing')) {
                                        document.querySelector('.importing').remove();
                                    }

                                    document.querySelector('#search-container').style.display = 'inline-flex';
                                    document.querySelector('.tabulator').style.display = '';

                                    searchFunction(null, null, true);
                                }, 100);
                            }
                        };

                        d.onerror = () => {
                            db2().get(ss._row.data.sources).onsuccess = (event2) => {
                                const result = event2.target.result;

                                result.progress = value.progress || 0;
                                result.status = status(value.status);

                                db2().put(result).onsuccess = () => {
                                    ss.update({
                                        progress: value.progress || 0,
                                        status: status(value.status)
                                    });

                                    count++;

                                    if (count === a.lists.length) {
                                        setTimeout(() => {
                                            if (document.querySelector('.importing')) {
                                                document.querySelector('.importing').remove();
                                            }

                                            document.querySelector('#search-container').style.display = 'inline-flex';
                                            document.querySelector('.tabulator').style.display = '';

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

                                document.querySelector('#search-container').style.display = 'inline-flex';
                                document.querySelector('.tabulator').style.display = '';

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
                        return;
                    }
                } else {
                    return;
                }

                document.querySelector('#search-container').style.display = 'none';
                document.querySelector('.tabulator').style.display = 'none';
                document.querySelector('main').insertAdjacentHTML('beforeend',
                    '<div class="importing">' +
                        '<div id="progress" class="found" style="position: absolute; top: 0; left: 0;"></div>' +
                        '<span>Importing...</span>' +
                    '</span>'
                );

                for (const value of a2) {
                    const
                        s = Number(parse(value, 'series_animedb_id'))
                            ? `https://myanimelist.net/anime/${parse(value, 'series_animedb_id')}`
                            : parse(value, 'series_animedb_id'),
                        ss = t.searchRows('sources', '=', s)[0];

                    if (ss) {
                        const d = db2().add({
                            episodes: ss._row.data.episodes,
                            progress: parse(value, 'my_watched_episodes') || 0,
                            season: ss._row.data.season,
                            source: s,
                            status: status(parse(value, 'my_status'), Number(parse(value, 'my_rewatching')), Number(parse(value, 'my_times_watched'))),
                            title: ss._row.data.title,
                            type: ss._row.data.type
                        });

                        d.onsuccess = () => {
                            ss.update({
                                progress: parse(value, 'my_watched_episodes') || 0,
                                status: status(parse(value, 'my_status'), Number(parse(value, 'my_rewatching')), Number(parse(value, 'my_times_watched')))
                            });

                            count++;

                            if (count === a2.length) {
                                setTimeout(() => {
                                    if (document.querySelector('.importing')) {
                                        document.querySelector('.importing').remove();
                                    }

                                    document.querySelector('#search-container').style.display = 'inline-flex';
                                    document.querySelector('.tabulator').style.display = '';

                                    searchFunction(null, null, true);
                                }, 100);
                            }
                        };

                        d.onerror = () => {
                            db2().get(s).onsuccess = (event2) => {
                                const result = event2.target.result;

                                result.progress = parse(value, 'my_watched_episodes') || 0;
                                result.status = status(parse(value, 'my_status'), Number(parse(value, 'my_rewatching')), Number(parse(value, 'my_times_watched')));

                                db2().put(result).onsuccess = () => {
                                    ss.update({
                                        progress: parse(value, 'my_watched_episodes') || 0,
                                        status: status(parse(value, 'my_status'), Number(parse(value, 'my_rewatching')), Number(parse(value, 'my_times_watched')))
                                    });

                                    count++;

                                    if (count === a2.length) {
                                        setTimeout(() => {
                                            if (document.querySelector('.importing')) {
                                                document.querySelector('.importing').remove();
                                            }

                                            document.querySelector('#search-container').style.display = 'inline-flex';
                                            document.querySelector('.tabulator').style.display = '';

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

                                document.querySelector('#search-container').style.display = 'inline-flex';
                                document.querySelector('.tabulator').style.display = '';

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
    let xml =
            '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<myanimelist>\n' +
            '    <myinfo>\n' +
            '        <user_export_type>1</user_export_type>\n' +
            '    </myinfo>\n';

    db2().openCursor().onsuccess = (event) => {
        const cursor = event.target.result;

        if (cursor) {
            let rewatching = 0,
                status = null;

            switch (cursor.value.status) {
                case 'Paused':
                    status = 'On-Hold';
                    break;

                case 'Planning':
                    status = 'Plan to Watch';
                    break;

                case 'Rewatching':
                    status = 'Completed';
                    rewatching = 1;
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
            //
            // tsuzuku
            //      series_episodes
            //      series_season
            //      series_title
            //      series_type
            //
            // anilist
            //      my_finish_date
            //      my_score
            //      my_start_date
            xml +=
            '    <anime>\n' +
            '        <my_finish_date>0000-00-00</my_finish_date>\n' +
            `        <my_rewatching>${rewatching}</my_rewatching>\n` +
            '        <my_score>0</my_score>\n' +
            '        <my_start_date>0000-00-00</my_start_date>\n' +
            `        <my_status>${status}</my_status>\n` +
            `        <my_times_watched>${rewatching}</my_times_watched>\n` +
            `        <my_watched_episodes>${cursor.value.progress}</my_watched_episodes>\n` +
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

            a.download = 'export.xml';
            a.click();
        }
    };
});

// chromium bug when using change to cell.getRow().update(progress)
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
    } else {
        document.querySelector('#regex').checked = false;
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
        document.querySelector('#number').value = Math.round(Math.abs(Number(new URLSearchParams(location.search).get('random'))));
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