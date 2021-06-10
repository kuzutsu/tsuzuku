import {
    db2,
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
        query = qq || document.querySelector('.search').value,
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

    if (document.querySelector('.nothing')) {
        document.querySelector('.nothing').remove();
    } else {
        document.querySelector('.tabulator').style.display = 'none';
    }

    if (document.querySelector('.search').value) {
        document.querySelector('.clear').style.display = 'inline-flex';
        document.querySelector('.clear-separator').style.display = '';
    }

    if (!s && document.querySelector('.selected-tab')) {
        document.querySelector('.selected-tab').classList.remove('selected-tab');
    }

    if (document.querySelector(`[data-query="${query}"]`)) {
        document.querySelector(`[data-query="${query}"]`).classList.add('selected-tab');
    }

    if (document.querySelector('.importing')) {
        document.querySelector('.search-container').style.display = 'inline-flex';
        document.querySelector('.importing').remove();
    }

    if (document.querySelector('.searching')) {
        document.querySelector('.searching').remove();
    }

    document.querySelector('main').insertAdjacentHTML('beforeend',
        '<div class="searching">' +
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
        const url = new URL(location.href.replace(location.search, ''));

        document.querySelector('.searching span').innerHTML = 'Filtering table...';

        worker.terminate();
        worker = null;

        setTimeout(() => {
            switch (event.data.message) {
                case 'clear':
                    index.dimension = null;
                    table.clearFilter();

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

                    break;

                case 'success':
                    index.dimension = event.data.update;
                    index.query = event.data.query;
                    table.setFilter('sources', 'in', event.data.filter);

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

                    break;

                default:
                    break;
            }
        }, 100);
    });
}

document.querySelector('.clear').addEventListener('click', () => {
    document.querySelector('.clear').style.display = 'none';
    document.querySelector('.clear-separator').style.display = 'none';
    document.querySelector('.search').value = '';
    document.querySelector('.search').focus();
});

document.querySelector('.thumbnails').addEventListener('click', () => {
    if (localStorage.getItem('thumbnails') === 'hide') {
        document.body.classList.remove('hide');
        document.querySelector('.thumbnails path').setAttribute('d', 'M21.9 21.9l-8.49-8.49l0 0L3.59 3.59l0 0L2.1 2.1L0.69 3.51L3 5.83V19c0 1.1 0.9 2 2 2h13.17l2.31 2.31L21.9 21.9z M5 18 l3.5-4.5l2.5 3.01L12.17 15l3 3H5z M21 18.17L5.83 3H19c1.1 0 2 0.9 2 2V18.17z');
        localStorage.setItem('thumbnails', 'show');
    } else {
        document.body.classList.add('hide');
        document.querySelector('.thumbnails path').setAttribute('d', 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z');
        localStorage.setItem('thumbnails', 'hide');
    }

    t.redraw(true);
});

document.querySelector('.close').addEventListener('click', () => {
    index.lastRow = null;

    document.querySelector('.header-selected').classList.remove('header-selected');
    document.querySelector('.header-status').remove();
    document.querySelectorAll('.separator-selected').forEach((element) => {
        element.remove();
    });

    if (localStorage.getItem('theme') === 'dark') {
        document.head.querySelector('[name="theme-color"]').content = '#000';
    } else {
        document.head.querySelector('[name="theme-color"]').content = '#fff';
    }

    t.getColumn('picture').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
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

document.querySelector('.enter').addEventListener('click', () => {
    if (document.querySelector('.default').style.display === 'contents') {
        document.querySelector('.default').style.display = 'none';
        document.querySelector('.tabs').style.display = 'contents';
        document.querySelector('.enter svg').style.fill = '#a7abb7';

        if (!document.querySelector('.settings-container').style.display) {
            document.querySelector('.settings-container').style.display = 'none';
            document.querySelector('.settings svg').style.fill = '#a7abb7';
            document.querySelector('.database-container').style.maxHeight = '';

            t.redraw(true);
        }
    } else {
        document.querySelector('.default').style.display = 'contents';
        document.querySelector('.search').focus();
        document.querySelector('.tabs').style.display = 'none';
        document.querySelector('.enter svg').style.fill = '';
    }
});

document.querySelector('.search-container').addEventListener('dragenter', () => {
    if (document.querySelector('.default').style.display === 'contents') {
        return;
    }

    document.querySelector('.default').style.display = 'contents';
    document.querySelector('.search').focus();
    document.querySelector('.tabs').style.display = 'none';
    document.querySelector('.enter svg').style.fill = '';
});

document.querySelector('.enter2').addEventListener('click', () => {
    searchFunction();
});

document.querySelector('#random').addEventListener('change', (e) => {
    if (e.target.checked) {
        document.querySelector('[for="number"]').style.color = '';
        document.querySelector('#number').removeAttribute('disabled');
    } else {
        document.querySelector('[for="number"]').style.color = '#a7abb7';
        document.querySelector('#number').setAttribute('disabled', '');
    }
});

document.querySelector('.settings').addEventListener('click', () => {
    if (document.querySelector('.settings-container').style.display) {
        document.querySelector('.settings-container').style.display = '';
        document.querySelector('.settings svg').style.fill = '';
        document.querySelector('.database-container').style.maxHeight = 'calc(100% - 208px)';
    } else {
        document.querySelector('.settings-container').style.display = 'none';
        document.querySelector('.settings svg').style.fill = '#a7abb7';
        document.querySelector('.database-container').style.maxHeight = '';
    }

    t.redraw(true);
});

document.querySelector('.search').addEventListener('input', (e) => {
    if (e.target.value) {
        document.querySelector('.clear').style.display = 'inline-flex';
        document.querySelector('.clear-separator').style.display = '';
    } else {
        document.querySelector('.clear').style.display = 'none';
        document.querySelector('.clear-separator').style.display = 'none';
    }
});

document.querySelector('.search').addEventListener('focus', (e) => {
    if (e.target.value) {
        document.querySelector('.clear').style.display = 'inline-flex';
        document.querySelector('.clear-separator').style.display = '';
    }
});

document.querySelectorAll('.tab').forEach((element) => {
    element.addEventListener('click', () => {
        if (document.querySelector('.selected-tab')) {
            document.querySelector('.selected-tab').classList.remove('selected-tab');
        }

        element.classList.add('selected-tab');
        document.querySelector('.search').value = element.dataset.query;
        searchFunction(null, element.dataset.query, null, true);
    });
});

document.querySelector('.selected-count').addEventListener('click', () => {
    document.querySelector('.search').value = 'is:selected';

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

            if (document.querySelector('.nothing')) {
                document.querySelector('.nothing').remove();
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

                document.querySelector('.search-container').style.display = 'none';
                document.querySelector('.tabulator').style.display = 'none';
                document.querySelector('main').insertAdjacentHTML('beforeend',
                    '<div class="importing">' +
                        '<span>Importing...</span>' +
                    '</div>'
                );

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

                                    document.querySelector('.search-container').style.display = 'inline-flex';
                                    document.querySelector('.tabulator').style.display = '';

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

                                            document.querySelector('.search-container').style.display = 'inline-flex';
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

                                document.querySelector('.search-container').style.display = 'inline-flex';
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

                document.querySelector('.search-container').style.display = 'none';
                document.querySelector('.tabulator').style.display = 'none';
                document.querySelector('main').insertAdjacentHTML('beforeend',
                    '<div class="importing">' +
                        '<span>Importing...</span>' +
                    '</div>'
                );

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

                                    document.querySelector('.search-container').style.display = 'inline-flex';
                                    document.querySelector('.tabulator').style.display = '';

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

                                            document.querySelector('.search-container').style.display = 'inline-flex';
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

                                document.querySelector('.search-container').style.display = 'inline-flex';
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
        }
    };
});

onpopstate = () => {
    if (new URLSearchParams(location.search).get('query')) {
        document.querySelector('.search').value = decodeURIComponent(new URLSearchParams(location.search).get('query'));
        document.querySelector('.clear').style.display = 'inline-flex';
        document.querySelector('.clear-separator').style.display = '';
    } else {
        document.querySelector('.search').value = '';
        document.querySelector('.clear').style.display = 'none';
        document.querySelector('.clear-separator').style.display = 'none';
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
        document.querySelector('[for="number"]').style.color = '#a7abb7';
        document.querySelector('#number').setAttribute('disabled', '');
    }

    searchFunction(null, null, true);
};

export {
    index,
    searchFunction
};