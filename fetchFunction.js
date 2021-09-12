import {
    index,
    searchFunction
} from './index.js';

const
    channel = new BroadcastChannel('tsuzuku'),
    data5 = [],
    database = [],
    database2 = {},
    map4 = new Map(),
    params = {
        alt: true,
        random: false,
        randomValue: 1,
        regex: false
    },
    selected = {
        s: true,
        ss: []
    },
    status = ['', 'Completed', 'Dropped', 'Paused', 'Planning', 'Rewatching', 'Skipping', 'Watching'],
    svg = {
        arrow: '<path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"></path>',
        blank: '<path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>',
        check: '<path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>',
        earth: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path>',
        indeterminate: '<path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1 0.9 2 2 2h14c1.1 0 2-0.9 2-2V5C21 3.9 20.1 3 19 3z M17 13H7v-2h10V13z"></path>',
        play: '<path d="M8 5v14l11-7z"></path>'
    },
    title = document.title;

let db2 = null,
    error = false,
    error2 = false,
    r = null,
    statuses = '',
    t = null;

channel.onmessage = () => {
    location.reload();
};

fetch('https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database.json')
    .then((response) => response.json())
    .then((data) => {
        const d = data.data;

        document.querySelector('.loading').innerHTML = 'Building table...';

        new Promise((resolve) => {
            const db = indexedDB.open('tsuzuku', 1);

            db.onupgradeneeded = (event) => {
                const
                    index2 = [
                        'episodes',
                        'progress',
                        'season',
                        'status',
                        'title',
                        'type'
                    ],
                    storage = event.target.result.createObjectStore('tsuzuku', {
                        keyPath: 'source'
                    });

                for (const value of index2) {
                    storage.createIndex(value, value, {
                        unique: false
                    });
                }
            };

            db.onerror = () => resolve('error');

            db.onsuccess = (event3) => {
                db2 = () => event3.target.result.transaction('tsuzuku', 'readwrite').objectStore('tsuzuku');

                db2().openCursor().onsuccess = (event5) => {
                    const cursor = event5.target.result;

                    if (cursor) {
                        map4.set(cursor.key, {
                            episodes: cursor.value.episodes,
                            progress: cursor.value.progress,
                            season: cursor.value.season,
                            status: cursor.value.status,
                            title: cursor.value.title,
                            type: cursor.value.type
                        });

                        cursor.continue();
                    } else {
                        return resolve('success');
                    }

                    return null;
                };
            };
        }).then((value6) => {
            const set4 = localStorage.getItem('new')
                ? new Set(JSON.parse(localStorage.getItem('new')))
                : new Set();

            if (value6 === 'error') {
                error = true;
                document.body.classList.add('error');
                document.querySelector('header .menu').title = 'Can\'t track, import, or export without IndexedDB';
            }

            for (let ii = 0; ii < status.length; ii++) {
                statuses += `<option>${status[ii]}</option>`;
            }

            for (let i = 0; i < d.length; i++) {
                let source = null,
                    source2 = null;

                if (d[i].sources.filter((sources) => sources.match(/myanimelist\.net/gu)).length) {
                    source = /myanimelist\.net/gu;
                } else if (d[i].sources.filter((sources) => sources.match(/kitsu\.io/gu)).length) {
                    source = /kitsu\.io/gu;
                } else if (d[i].sources.filter((sources) => sources.match(/anilist\.co/gu)).length) {
                    source = /anilist\.co/gu;
                } else {
                    continue;
                }

                // https://anime-planet.com/inc/img/blank_main.jpg
                // https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/default.jpg
                if (d[i].picture === 'https://cdn.myanimelist.net/images/qm_50.gif') {
                    continue;
                }

                if (d[i].tags.indexOf('anime influenced') > -1) {
                    continue;
                }

                for (const value of d[i].sources.filter((sources) => sources.match(source))) {
                    const
                        anilist = d[i].sources.filter((sources) => sources.match(/anilist\.co/gu)),
                        anilist2 = '',
                        kitsu = d[i].sources.filter((sources) => sources.match(/kitsu\.io/gu)),
                        kitsu2 = '',
                        ss = d[i].animeSeason.season,
                        tt = d[i].tags.map((tags) => tags.replace(/\s/gu, '_'));

                    let n2 = false,
                        p2 = '',
                        s = '',
                        s2 = '',
                        ttt = '';

                    if (d[i].sources.filter((sources) => sources.match(/myanimelist\.net/gu)).length) {
                        source2 = [
                            value,
                            kitsu[0] || kitsu2,
                            anilist[0] || anilist2
                        ];
                    } else if (d[i].sources.filter((sources) => sources.match(/kitsu\.io/gu)).length) {
                        source2 = [
                            '',
                            value,
                            anilist[0] || anilist2
                        ];
                    } else {
                        source2 = [
                            '',
                            '',
                            value
                        ];
                    }

                    if (ss !== 'UNDEFINED') {
                        s = `${ss.replace(ss.substr(1), ss.substr(1).toLowerCase())} `;
                    }

                    if (d[i].animeSeason.year) {
                        s += d[i].animeSeason.year;
                    } else {
                        s = '';
                    }

                    for (const value2 of tt) {
                        if (database2[value2]) {
                            database2[value2] += 1;
                        } else {
                            database2[value2] = 1;
                        }
                    }

                    if (set4.has(value)) {
                        n2 = true;
                    }

                    for (const value2 of source2) {
                        if (!map4.has(value2)) {
                            continue;
                        }

                        p2 = map4.get(value2).progress;
                        s2 = map4.get(value2).status;

                        map4.delete(value2);
                        break;
                    }

                    if (d[i].type !== 'UNKNOWN') {
                        if (['MOVIE', 'SPECIAL'].indexOf(d[i].type) > -1) {
                            ttt = d[i].type.replace(d[i].type.substr(1), d[i].type.substr(1).toLowerCase());
                        } else {
                            ttt = d[i].type;
                        }
                    }

                    database.push({
                        alternative: d[i].title,
                        dead: false,
                        episodes: d[i].episodes || '',
                        new: n2,
                        ongoing: d[i].status === 'ONGOING',
                        picture: d[i].picture,
                        progress: p2,
                        r18: tt.indexOf('hentai') > -1,
                        // relations: [
                        //     ...d[i].sources.filter((sources) => sources.match(source) && sources !== value),
                        //     ...d[i].relations.filter((relations) => relations.match(/anilist\.co|kitsu\.io|myanimelist\.net/gu))
                        // ],
                        relevancy: 1,
                        season: s,
                        sources: value,
                        sources2: source2,
                        status: s2,
                        synonyms: d[i].synonyms,
                        tags: tt,
                        title: d[i].title,
                        type: ttt
                    });

                    data5.push(value);
                }
            }

            for (const [key, value] of map4.entries()) {
                database.push({
                    alternative: value.title,
                    dead: true,
                    episodes: value.episodes,
                    new: false,
                    ongoing: false,
                    picture: '',
                    progress: value.progress,
                    r18: false,
                    // relations: [],
                    relevancy: 1,
                    season: value.season,
                    sources: key,
                    sources2:
                        key.match(/myanimelist\.net/gu)
                            ? [key, '', '']
                            : key.match(/kitsu\.io/gu)
                                ? ['', key, '']
                                : ['', '', key],
                    status: value.status,
                    synonyms: [],
                    tags: [],
                    title: value.title,
                    type: value.type
                });
            }

            if (localStorage.getItem('data')) {
                const
                    set = new Set(data5),
                    set2 = new Set(JSON.parse(localStorage.getItem('data'))),
                    set3 = [];

                for (const value of set) {
                    if (set2.has(value)) {
                        continue;
                    }

                    set3.push(value);
                }

                if (set3[0]) {
                    localStorage.setItem('new', JSON.stringify(set3));
                }
            }

            localStorage.setItem('data', JSON.stringify(data5));

            t = new Tabulator('.database-container', {
                cellDblClick: function () {
                    return false;
                },
                columnHeaderSortMulti: false,
                columns: [
                    {
                        // padding
                        field: 'color',
                        frozen: true,
                        headerSort: false,
                        minWidth: 4,
                        width: 4
                    },
                    {
                        // padding
                        frozen: true,
                        headerSort: false,
                        minWidth: 15,
                        width: 15
                    },
                    {
                        cellClick: function (e, cell) {
                            getSelection().removeAllRanges();
                            cell.getRow().toggleSelect();

                            if (e.shiftKey && index.lastRow) {
                                const
                                    lastPosition = index.lastRow.getPosition(true),
                                    position = cell.getRow().getPosition(true);

                                if (lastPosition < position) {
                                    let prevRow = cell.getRow().getPrevRow();

                                    while (prevRow && prevRow.getPosition(true) >= lastPosition) {
                                        if (index.lastRow.isSelected()) {
                                            if (cell.getRow().isSelected()) {
                                                if (prevRow.getPosition(true) !== lastPosition) {
                                                    if (!prevRow.isSelected()) {
                                                        prevRow.toggleSelect();
                                                    }
                                                }
                                            } else {
                                                prevRow.toggleSelect();
                                            }
                                        } else {
                                            if (cell.getRow().isSelected()) {
                                                if (!prevRow.isSelected()) {
                                                    if (prevRow.getPosition(true) !== lastPosition || index.lastRow.getPrevRow().isSelected()) {
                                                        prevRow.toggleSelect();
                                                    }
                                                }
                                            } else {
                                                if (prevRow.getPosition(true) !== lastPosition) {
                                                    prevRow.toggleSelect();
                                                }
                                            }
                                        }

                                        prevRow = prevRow.getPrevRow();
                                    }
                                } else {
                                    let nextRow = cell.getRow().getNextRow();

                                    while (nextRow && nextRow.getPosition(true) <= lastPosition) {
                                        if (index.lastRow.isSelected()) {
                                            if (cell.getRow().isSelected()) {
                                                if (nextRow.getPosition(true) !== lastPosition) {
                                                    if (!nextRow.isSelected()) {
                                                        nextRow.toggleSelect();
                                                    }
                                                }
                                            } else {
                                                nextRow.toggleSelect();
                                            }
                                        } else {
                                            if (cell.getRow().isSelected()) {
                                                if (!nextRow.isSelected()) {
                                                    if (nextRow.getPosition(true) !== lastPosition || index.lastRow.getNextRow().isSelected()) {
                                                        nextRow.toggleSelect();
                                                    }
                                                }
                                            } else {
                                                if (nextRow.getPosition(true) !== lastPosition) {
                                                    nextRow.toggleSelect();
                                                }
                                            }
                                        }

                                        nextRow = nextRow.getNextRow();
                                    }
                                }
                            }

                            selected.s = true;
                            selected.ss.splice(0);

                            for (const value of r) {
                                if (value.isSelected()) {
                                    selected.ss.push(value);
                                } else {
                                    if (selected.s) {
                                        selected.s = false;
                                    }
                                }
                            }

                            if (cell.getTable().getSelectedRows().length) {
                                index.lastRow = cell.getRow();

                                document.querySelector('header').classList.add('header-selected');
                                document.querySelector('.selected-count').innerHTML = `${cell.getTable().getSelectedRows().length} selected`;
                                document.querySelector('header .menu').style.display = 'none';

                                if (document.querySelector('.header-status')) {
                                    document.querySelector('.header-status').remove();
                                }

                                const hstatus = document.createElement('select');

                                if (error) {
                                    hstatus.disabled = true;
                                }

                                hstatus.classList.add('header-status');
                                hstatus.title = 'Status';
                                hstatus.innerHTML = `<option selected disabled>Status</option>${statuses}`;
                                hstatus.addEventListener('change', () => {
                                    if (error) {
                                        return;
                                    }

                                    for (const value of cell.getTable().getSelectedRows()) {
                                        const p = value.getData().progress;

                                        if (hstatus.value) {
                                            const d2 = db2().add({
                                                episodes: value.getData().episodes,
                                                progress:
                                                    hstatus.value === 'Completed' && value.getData().episodes
                                                        ? value.getData().episodes
                                                        : ['Planning', 'Skipping'].indexOf(hstatus.value) > -1
                                                            ? ''
                                                            : '0',
                                                season: value.getData().season,
                                                source: value.getData().sources,
                                                status: hstatus.value,
                                                title: value.getData().title,
                                                type: value.getData().type
                                            });

                                            d2.onsuccess = () => {
                                                const dd = [];

                                                for (const value2 of value.getData().sources2) {
                                                    if (!value2 || value2 === value.getData().sources) {
                                                        continue;
                                                    }

                                                    dd.push(
                                                        new Promise((resolve) => {
                                                            db2().delete(value2).onsuccess = () => resolve();
                                                        })
                                                    );
                                                }

                                                Promise.all(dd).then(() => {
                                                    if (hstatus.value === 'Completed' && value.getData().episodes) {
                                                        value.update({
                                                            progress: value.getData().episodes,
                                                            status: hstatus.value
                                                        });

                                                        channel.postMessage(true);

                                                        return;
                                                    }

                                                    if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                                        value.update({
                                                            progress: '',
                                                            status: hstatus.value
                                                        });

                                                        channel.postMessage(true);

                                                        return;
                                                    }

                                                    value.update({
                                                        progress: '0',
                                                        status: hstatus.value
                                                    });

                                                    channel.postMessage(true);
                                                });
                                            };

                                            d2.onerror = () => {
                                                db2().get(value.getData().sources).onsuccess = (event) => {
                                                    const
                                                        result = event.target.result,
                                                        status2 = result.status;

                                                    if (hstatus.value === 'Completed' && value.getData().episodes) {
                                                        result.progress = value.getData().episodes;
                                                    } else {
                                                        if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                                            result.progress = '';
                                                        } else {
                                                            if (status2 === 'Planning' || status2 === 'Skipping') {
                                                                result.progress = '0';
                                                            }
                                                        }
                                                    }

                                                    result.status = hstatus.value;

                                                    db2().put(result).onsuccess = () => {
                                                        if (hstatus.value === 'Completed' && value.getData().episodes) {
                                                            value.getElement().dataset.progress = '';

                                                            // force update
                                                            value.update({
                                                                progress: ''
                                                            });

                                                            value.update({
                                                                progress: value.getData().episodes,
                                                                status: hstatus.value
                                                            });

                                                            channel.postMessage(true);

                                                            return;
                                                        }

                                                        if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                                            value.getElement().dataset.progress = '';

                                                            value.update({
                                                                progress: '',
                                                                status: hstatus.value
                                                            });

                                                            channel.postMessage(true);

                                                            return;
                                                        }

                                                        if (status2 === 'Planning' || status2 === 'Skipping') {
                                                            value.update({
                                                                progress: '0',
                                                                status: hstatus.value
                                                            });

                                                            channel.postMessage(true);

                                                            return;
                                                        }

                                                        // force update
                                                        value.update({
                                                            progress: ''
                                                        });

                                                        value.update({
                                                            progress: p,
                                                            status: hstatus.value
                                                        });

                                                        channel.postMessage(true);
                                                    };
                                                };
                                            };
                                        } else {
                                            const dd = [];

                                            for (const value2 of value.getData().sources2) {
                                                if (!value2) {
                                                    continue;
                                                }

                                                dd.push(
                                                    new Promise((resolve) => {
                                                        db2().delete(value2).onsuccess = () => resolve();
                                                    })
                                                );
                                            }

                                            Promise.all(dd).then(() => {
                                                value.getElement().dataset.progress = '';

                                                value.update({
                                                    progress: '',
                                                    status: ''
                                                });

                                                channel.postMessage(true);
                                            });
                                        }
                                    }
                                });

                                document.querySelector('header').insertAdjacentElement('beforeend', hstatus);

                                if (localStorage.getItem('theme') === 'dark') {
                                    document.head.querySelector('[name="theme-color"]').content = '#fff';
                                } else {
                                    document.head.querySelector('[name="theme-color"]').content = '#000';
                                }

                                if (selected.s) {
                                    cell.getColumn().getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.check;
                                } else {
                                    if (selected.ss.length) {
                                        cell.getColumn().getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.indeterminate;
                                    } else {
                                        cell.getColumn().getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
                                    }
                                }
                            } else {
                                index.lastRow = null;

                                document.querySelector('header').classList.remove('header-selected');
                                document.querySelector('.header-status').remove();
                                document.querySelector('header .menu').style.display = 'inline-flex';

                                cell.getColumn().getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;

                                if (localStorage.getItem('theme') === 'dark') {
                                    document.head.querySelector('[name="theme-color"]').content = '#000';
                                } else {
                                    document.head.querySelector('[name="theme-color"]').content = '#fff';
                                }
                            }
                        },
                        field: 'picture',
                        formatter: function (cell) {
                            cell.getElement().tabIndex = 0;

                            return (
                                `<svg class="blank" viewBox="0 0 24 24" width="17" height="17">${svg.blank}</svg>` +
                                `<svg class="check" viewBox="0 0 24 24" width="17" height="17">${svg.check}</svg>` +
                                `<img src="${cell.getValue()}" loading="lazy" alt style="height: 40px; width: 40px; object-fit: cover; user-select: none;">`
                            );
                        },
                        frozen: true,
                        headerClick: function (e, column) {
                            index.lastRow = null;

                            if (selected.ss.length) {
                                if (selected.ss.length === column.getTable().getRows().length) {
                                    column.getTable().deselectRow();
                                } else {
                                    for (const value of selected.ss) {
                                        value.toggleSelect();
                                    }
                                }

                                selected.s = false;
                                selected.ss.splice(0);
                            } else {
                                selected.s = true;
                                selected.ss.splice(0);

                                column.getTable().selectRow('active');

                                for (const value of r) {
                                    selected.ss.push(value);
                                }
                            }

                            if (column.getTable().getSelectedRows().length) {
                                document.querySelector('header').classList.add('header-selected');
                                document.querySelector('.selected-count').innerHTML = `${column.getTable().getSelectedRows().length} selected`;
                                document.querySelector('header .menu').style.display = 'none';

                                if (selected.s) {
                                    column.getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.check;
                                } else {
                                    column.getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
                                }

                                if (document.querySelector('.header-status')) {
                                    document.querySelector('.header-status').remove();
                                }

                                const hstatus = document.createElement('select');

                                if (error) {
                                    hstatus.disabled = true;
                                }

                                hstatus.classList.add('header-status');
                                hstatus.title = 'Status';
                                hstatus.innerHTML = `<option selected disabled>Status</option>${statuses}`;
                                hstatus.addEventListener('change', () => {
                                    if (error) {
                                        return;
                                    }

                                    for (const value of column.getTable().getSelectedRows()) {
                                        const p = value.getData().progress;

                                        if (hstatus.value) {
                                            const d2 = db2().add({
                                                episodes: value.getData().episodes,
                                                progress:
                                                    hstatus.value === 'Completed' && value.getData().episodes
                                                        ? value.getData().episodes
                                                        : ['Planning', 'Skipping'].indexOf(hstatus.value) > -1
                                                            ? ''
                                                            : '0',
                                                season: value.getData().season,
                                                source: value.getData().sources,
                                                status: hstatus.value,
                                                title: value.getData().title,
                                                type: value.getData().type
                                            });

                                            d2.onsuccess = () => {
                                                const dd = [];

                                                for (const value2 of value.getData().sources2) {
                                                    if (!value2 || value2 === value.getData().sources) {
                                                        continue;
                                                    }

                                                    dd.push(
                                                        new Promise((resolve) => {
                                                            db2().delete(value2).onsuccess = () => resolve();
                                                        })
                                                    );
                                                }

                                                Promise.all(dd).then(() => {
                                                    if (hstatus.value === 'Completed' && value.getData().episodes) {
                                                        value.update({
                                                            progress: value.getData().episodes,
                                                            status: hstatus.value
                                                        });

                                                        channel.postMessage(true);

                                                        return;
                                                    }

                                                    if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                                        value.update({
                                                            progress: '',
                                                            status: hstatus.value
                                                        });

                                                        channel.postMessage(true);

                                                        return;
                                                    }

                                                    value.update({
                                                        progress: '0',
                                                        status: hstatus.value
                                                    });

                                                    channel.postMessage(true);
                                                });
                                            };

                                            d2.onerror = () => {
                                                db2().get(value.getData().sources).onsuccess = (event) => {
                                                    const
                                                        result = event.target.result,
                                                        status2 = result.status;

                                                    if (hstatus.value === 'Completed' && value.getData().episodes) {
                                                        result.progress = value.getData().episodes;
                                                    } else {
                                                        if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                                            result.progress = '';
                                                        } else {
                                                            if (status2 === 'Planning' || status2 === 'Skipping') {
                                                                result.progress = '0';
                                                            }
                                                        }
                                                    }

                                                    result.status = hstatus.value;

                                                    db2().put(result).onsuccess = () => {
                                                        if (hstatus.value === 'Completed' && value.getData().episodes) {
                                                            value.getElement().dataset.progress = '';

                                                            // force update
                                                            value.update({
                                                                progress: ''
                                                            });

                                                            value.update({
                                                                progress: value.getData().episodes,
                                                                status: hstatus.value
                                                            });

                                                            channel.postMessage(true);

                                                            return;
                                                        }

                                                        if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                                            value.getElement().dataset.progress = '';

                                                            value.update({
                                                                progress: '',
                                                                status: hstatus.value
                                                            });

                                                            channel.postMessage(true);

                                                            return;
                                                        }

                                                        if (status2 === 'Planning' || status2 === 'Skipping') {
                                                            value.update({
                                                                progress: '0',
                                                                status: hstatus.value
                                                            });

                                                            channel.postMessage(true);

                                                            return;
                                                        }

                                                        // force update
                                                        value.update({
                                                            progress: ''
                                                        });

                                                        value.update({
                                                            progress: p,
                                                            status: hstatus.value
                                                        });

                                                        channel.postMessage(true);
                                                    };
                                                };
                                            };
                                        } else {
                                            const dd = [];

                                            for (const value2 of value.getData().sources2) {
                                                if (!value2) {
                                                    continue;
                                                }

                                                dd.push(
                                                    new Promise((resolve) => {
                                                        db2().delete(value2).onsuccess = () => resolve();
                                                    })
                                                );
                                            }

                                            Promise.all(dd).then(() => {
                                                value.getElement().dataset.progress = '';

                                                value.update({
                                                    progress: '',
                                                    status: ''
                                                });

                                                channel.postMessage(true);
                                            });
                                        }
                                    }
                                });

                                document.querySelector('header').insertAdjacentElement('beforeend', hstatus);

                                if (localStorage.getItem('theme') === 'dark') {
                                    document.head.querySelector('[name="theme-color"]').content = '#fff';
                                } else {
                                    document.head.querySelector('[name="theme-color"]').content = '#000';
                                }
                            } else {
                                document.querySelector('header').classList.remove('header-selected');
                                column.getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
                                document.querySelector('.header-status').remove();
                                document.querySelector('header .menu').style.display = 'inline-flex';

                                if (localStorage.getItem('theme') === 'dark') {
                                    document.head.querySelector('[name="theme-color"]').content = '#000';
                                } else {
                                    document.head.querySelector('[name="theme-color"]').content = '#fff';
                                }
                            }
                        },
                        headerHozAlign: 'center',
                        headerSort: false,
                        hozAlign: 'center',
                        titleFormatter: function () {
                            return `<svg viewBox="0 0 24 24" width="17" height="17">${svg.blank}</svg>`;
                        },
                        vertAlign: 'middle',
                        visible: localStorage.getItem('thumbnails') === 'show',
                        width: 40
                    },
                    {
                        cellClick: function (e, cell) {
                            getSelection().removeAllRanges();
                            cell.getRow().toggleSelect();

                            if (e.shiftKey && index.lastRow) {
                                const
                                    lastPosition = index.lastRow.getPosition(true),
                                    position = cell.getRow().getPosition(true);

                                if (lastPosition < position) {
                                    let prevRow = cell.getRow().getPrevRow();

                                    while (prevRow && prevRow.getPosition(true) >= lastPosition) {
                                        if (index.lastRow.isSelected()) {
                                            if (cell.getRow().isSelected()) {
                                                if (prevRow.getPosition(true) !== lastPosition) {
                                                    if (!prevRow.isSelected()) {
                                                        prevRow.toggleSelect();
                                                    }
                                                }
                                            } else {
                                                prevRow.toggleSelect();
                                            }
                                        } else {
                                            if (cell.getRow().isSelected()) {
                                                if (!prevRow.isSelected()) {
                                                    if (prevRow.getPosition(true) !== lastPosition || index.lastRow.getPrevRow().isSelected()) {
                                                        prevRow.toggleSelect();
                                                    }
                                                }
                                            } else {
                                                if (prevRow.getPosition(true) !== lastPosition) {
                                                    prevRow.toggleSelect();
                                                }
                                            }
                                        }

                                        prevRow = prevRow.getPrevRow();
                                    }
                                } else {
                                    let nextRow = cell.getRow().getNextRow();

                                    while (nextRow && nextRow.getPosition(true) <= lastPosition) {
                                        if (index.lastRow.isSelected()) {
                                            if (cell.getRow().isSelected()) {
                                                if (nextRow.getPosition(true) !== lastPosition) {
                                                    if (!nextRow.isSelected()) {
                                                        nextRow.toggleSelect();
                                                    }
                                                }
                                            } else {
                                                nextRow.toggleSelect();
                                            }
                                        } else {
                                            if (cell.getRow().isSelected()) {
                                                if (!nextRow.isSelected()) {
                                                    if (nextRow.getPosition(true) !== lastPosition || index.lastRow.getNextRow().isSelected()) {
                                                        nextRow.toggleSelect();
                                                    }
                                                }
                                            } else {
                                                if (nextRow.getPosition(true) !== lastPosition) {
                                                    nextRow.toggleSelect();
                                                }
                                            }
                                        }

                                        nextRow = nextRow.getNextRow();
                                    }
                                }
                            }

                            selected.s = true;
                            selected.ss.splice(0);

                            for (const value of r) {
                                if (value.isSelected()) {
                                    selected.ss.push(value);
                                } else {
                                    if (selected.s) {
                                        selected.s = false;
                                    }
                                }
                            }

                            if (cell.getTable().getSelectedRows().length) {
                                index.lastRow = cell.getRow();

                                document.querySelector('header').classList.add('header-selected');
                                document.querySelector('.selected-count').innerHTML = `${cell.getTable().getSelectedRows().length} selected`;
                                document.querySelector('header .menu').style.display = 'none';

                                if (document.querySelector('.header-status')) {
                                    document.querySelector('.header-status').remove();
                                }

                                const hstatus = document.createElement('select');

                                if (error) {
                                    hstatus.disabled = true;
                                }

                                hstatus.classList.add('header-status');
                                hstatus.title = 'Status';
                                hstatus.innerHTML = `<option selected disabled>Status</option>${statuses}`;
                                hstatus.addEventListener('change', () => {
                                    if (error) {
                                        return;
                                    }

                                    for (const value of cell.getTable().getSelectedRows()) {
                                        const p = value.getData().progress;

                                        if (hstatus.value) {
                                            const d2 = db2().add({
                                                episodes: value.getData().episodes,
                                                progress:
                                                    hstatus.value === 'Completed' && value.getData().episodes
                                                        ? value.getData().episodes
                                                        : ['Planning', 'Skipping'].indexOf(hstatus.value) > -1
                                                            ? ''
                                                            : '0',
                                                season: value.getData().season,
                                                source: value.getData().sources,
                                                status: hstatus.value,
                                                title: value.getData().title,
                                                type: value.getData().type
                                            });

                                            d2.onsuccess = () => {
                                                const dd = [];

                                                for (const value2 of value.getData().sources2) {
                                                    if (!value2 || value2 === value.getData().sources) {
                                                        continue;
                                                    }

                                                    dd.push(
                                                        new Promise((resolve) => {
                                                            db2().delete(value2).onsuccess = () => resolve();
                                                        })
                                                    );
                                                }

                                                Promise.all(dd).then(() => {
                                                    if (hstatus.value === 'Completed' && value.getData().episodes) {
                                                        value.update({
                                                            progress: value.getData().episodes,
                                                            status: hstatus.value
                                                        });

                                                        channel.postMessage(true);

                                                        return;
                                                    }

                                                    if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                                        value.update({
                                                            progress: '',
                                                            status: hstatus.value
                                                        });

                                                        channel.postMessage(true);

                                                        return;
                                                    }

                                                    value.update({
                                                        progress: '0',
                                                        status: hstatus.value
                                                    });

                                                    channel.postMessage(true);
                                                });
                                            };

                                            d2.onerror = () => {
                                                db2().get(value.getData().sources).onsuccess = (event) => {
                                                    const
                                                        result = event.target.result,
                                                        status2 = result.status;

                                                    if (hstatus.value === 'Completed' && value.getData().episodes) {
                                                        result.progress = value.getData().episodes;
                                                    } else {
                                                        if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                                            result.progress = '';
                                                        } else {
                                                            if (status2 === 'Planning' || status2 === 'Skipping') {
                                                                result.progress = '0';
                                                            }
                                                        }
                                                    }

                                                    result.status = hstatus.value;

                                                    db2().put(result).onsuccess = () => {
                                                        if (hstatus.value === 'Completed' && value.getData().episodes) {
                                                            value.getElement().dataset.progress = '';

                                                            // force update
                                                            value.update({
                                                                progress: ''
                                                            });

                                                            value.update({
                                                                progress: value.getData().episodes,
                                                                status: hstatus.value
                                                            });

                                                            channel.postMessage(true);

                                                            return;
                                                        }

                                                        if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                                            value.getElement().dataset.progress = '';

                                                            value.update({
                                                                progress: '',
                                                                status: hstatus.value
                                                            });

                                                            channel.postMessage(true);

                                                            return;
                                                        }

                                                        if (status2 === 'Planning' || status2 === 'Skipping') {
                                                            value.update({
                                                                progress: '0',
                                                                status: hstatus.value
                                                            });

                                                            channel.postMessage(true);

                                                            return;
                                                        }

                                                        // force update
                                                        value.update({
                                                            progress: ''
                                                        });

                                                        value.update({
                                                            progress: p,
                                                            status: hstatus.value
                                                        });

                                                        channel.postMessage(true);
                                                    };
                                                };
                                            };
                                        } else {
                                            const dd = [];

                                            for (const value2 of value.getData().sources2) {
                                                if (!value2) {
                                                    continue;
                                                }

                                                dd.push(
                                                    new Promise((resolve) => {
                                                        db2().delete(value2).onsuccess = () => resolve();
                                                    })
                                                );
                                            }

                                            Promise.all(dd).then(() => {
                                                value.getElement().dataset.progress = '';

                                                value.update({
                                                    progress: '',
                                                    status: ''
                                                });

                                                channel.postMessage(true);
                                            });
                                        }
                                    }
                                });

                                document.querySelector('header').insertAdjacentElement('beforeend', hstatus);

                                if (localStorage.getItem('theme') === 'dark') {
                                    document.head.querySelector('[name="theme-color"]').content = '#fff';
                                } else {
                                    document.head.querySelector('[name="theme-color"]').content = '#000';
                                }

                                if (selected.s) {
                                    cell.getColumn().getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.check;
                                } else {
                                    if (selected.ss.length) {
                                        cell.getColumn().getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.indeterminate;
                                    } else {
                                        cell.getColumn().getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
                                    }
                                }
                            } else {
                                index.lastRow = null;

                                document.querySelector('header').classList.remove('header-selected');
                                document.querySelector('.header-status').remove();
                                document.querySelector('header .menu').style.display = 'inline-flex';

                                cell.getColumn().getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;

                                if (localStorage.getItem('theme') === 'dark') {
                                    document.head.querySelector('[name="theme-color"]').content = '#000';
                                } else {
                                    document.head.querySelector('[name="theme-color"]').content = '#fff';
                                }
                            }
                        },
                        field: 'picture2',
                        formatter: function (cell) {
                            cell.getElement().tabIndex = 0;

                            return (
                                `<svg class="blank" viewBox="0 0 24 24" width="17" height="17">${svg.blank}</svg>` +
                                `<svg class="check" viewBox="0 0 24 24" width="17" height="17">${svg.check}</svg>`
                            );
                        },
                        frozen: true,
                        headerClick: function (e, column) {
                            index.lastRow = null;

                            if (selected.ss.length) {
                                if (selected.ss.length === column.getTable().getRows().length) {
                                    column.getTable().deselectRow();
                                } else {
                                    for (const value of selected.ss) {
                                        value.toggleSelect();
                                    }
                                }

                                selected.s = false;
                                selected.ss.splice(0);
                            } else {
                                selected.s = true;
                                selected.ss.splice(0);

                                column.getTable().selectRow('active');

                                for (const value of r) {
                                    selected.ss.push(value);
                                }
                            }

                            if (column.getTable().getSelectedRows().length) {
                                document.querySelector('header').classList.add('header-selected');
                                document.querySelector('.selected-count').innerHTML = `${column.getTable().getSelectedRows().length} selected`;
                                document.querySelector('header .menu').style.display = 'none';

                                if (selected.s) {
                                    column.getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.check;
                                } else {
                                    column.getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
                                }

                                if (document.querySelector('.header-status')) {
                                    document.querySelector('.header-status').remove();
                                }

                                const hstatus = document.createElement('select');

                                if (error) {
                                    hstatus.disabled = true;
                                }

                                hstatus.classList.add('header-status');
                                hstatus.title = 'Status';
                                hstatus.innerHTML = `<option selected disabled>Status</option>${statuses}`;
                                hstatus.addEventListener('change', () => {
                                    if (error) {
                                        return;
                                    }

                                    for (const value of column.getTable().getSelectedRows()) {
                                        const p = value.getData().progress;

                                        if (hstatus.value) {
                                            const d2 = db2().add({
                                                episodes: value.getData().episodes,
                                                progress:
                                                    hstatus.value === 'Completed' && value.getData().episodes
                                                        ? value.getData().episodes
                                                        : ['Planning', 'Skipping'].indexOf(hstatus.value) > -1
                                                            ? ''
                                                            : '0',
                                                season: value.getData().season,
                                                source: value.getData().sources,
                                                status: hstatus.value,
                                                title: value.getData().title,
                                                type: value.getData().type
                                            });

                                            d2.onsuccess = () => {
                                                const dd = [];

                                                for (const value2 of value.getData().sources2) {
                                                    if (!value2 || value2 === value.getData().sources) {
                                                        continue;
                                                    }

                                                    dd.push(
                                                        new Promise((resolve) => {
                                                            db2().delete(value2).onsuccess = () => resolve();
                                                        })
                                                    );
                                                }

                                                Promise.all(dd).then(() => {
                                                    if (hstatus.value === 'Completed' && value.getData().episodes) {
                                                        value.update({
                                                            progress: value.getData().episodes,
                                                            status: hstatus.value
                                                        });

                                                        channel.postMessage(true);

                                                        return;
                                                    }

                                                    if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                                        value.update({
                                                            progress: '',
                                                            status: hstatus.value
                                                        });

                                                        channel.postMessage(true);

                                                        return;
                                                    }

                                                    value.update({
                                                        progress: '0',
                                                        status: hstatus.value
                                                    });

                                                    channel.postMessage(true);
                                                });
                                            };

                                            d2.onerror = () => {
                                                db2().get(value.getData().sources).onsuccess = (event) => {
                                                    const
                                                        result = event.target.result,
                                                        status2 = result.status;

                                                    if (hstatus.value === 'Completed' && value.getData().episodes) {
                                                        result.progress = value.getData().episodes;
                                                    } else {
                                                        if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                                            result.progress = '';
                                                        } else {
                                                            if (status2 === 'Planning' || status2 === 'Skipping') {
                                                                result.progress = '0';
                                                            }
                                                        }
                                                    }

                                                    result.status = hstatus.value;

                                                    db2().put(result).onsuccess = () => {
                                                        if (hstatus.value === 'Completed' && value.getData().episodes) {
                                                            value.getElement().dataset.progress = '';

                                                            // force update
                                                            value.update({
                                                                progress: ''
                                                            });

                                                            value.update({
                                                                progress: value.getData().episodes,
                                                                status: hstatus.value
                                                            });

                                                            channel.postMessage(true);

                                                            return;
                                                        }

                                                        if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                                            value.getElement().dataset.progress = '';

                                                            value.update({
                                                                progress: '',
                                                                status: hstatus.value
                                                            });

                                                            channel.postMessage(true);

                                                            return;
                                                        }

                                                        if (status2 === 'Planning' || status2 === 'Skipping') {
                                                            value.update({
                                                                progress: '0',
                                                                status: hstatus.value
                                                            });

                                                            channel.postMessage(true);

                                                            return;
                                                        }

                                                        // force update
                                                        value.update({
                                                            progress: ''
                                                        });

                                                        value.update({
                                                            progress: p,
                                                            status: hstatus.value
                                                        });

                                                        channel.postMessage(true);
                                                    };
                                                };
                                            };
                                        } else {
                                            const dd = [];

                                            for (const value2 of value.getData().sources2) {
                                                if (!value2) {
                                                    continue;
                                                }

                                                dd.push(
                                                    new Promise((resolve) => {
                                                        db2().delete(value2).onsuccess = () => resolve();
                                                    })
                                                );
                                            }

                                            Promise.all(dd).then(() => {
                                                value.getElement().dataset.progress = '';

                                                value.update({
                                                    progress: '',
                                                    status: ''
                                                });

                                                channel.postMessage(true);
                                            });
                                        }
                                    }
                                });

                                document.querySelector('header').insertAdjacentElement('beforeend', hstatus);

                                if (localStorage.getItem('theme') === 'dark') {
                                    document.head.querySelector('[name="theme-color"]').content = '#fff';
                                } else {
                                    document.head.querySelector('[name="theme-color"]').content = '#000';
                                }
                            } else {
                                document.querySelector('header').classList.remove('header-selected');
                                column.getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
                                document.querySelector('.header-status').remove();
                                document.querySelector('header .menu').style.display = 'inline-flex';

                                if (localStorage.getItem('theme') === 'dark') {
                                    document.head.querySelector('[name="theme-color"]').content = '#000';
                                } else {
                                    document.head.querySelector('[name="theme-color"]').content = '#fff';
                                }
                            }
                        },
                        headerHozAlign: 'center',
                        headerSort: false,
                        hozAlign: 'center',
                        minWidth: 17,
                        titleFormatter: function () {
                            return `<svg viewBox="0 0 24 24" width="17" height="17">${svg.blank}</svg>`;
                        },
                        vertAlign: 'middle',
                        visible: localStorage.getItem('thumbnails') !== 'show',
                        width: 17
                    },
                    {
                        // padding
                        frozen: true,
                        headerSort: false,
                        minWidth: 19,
                        width: 19
                    },
                    {
                        field: 'sources',
                        formatter: function (cell) {
                            let sources = null,
                                ss = null;

                            if (cell.getValue().match(/myanimelist\.net/gu)) {
                                sources = './images/myanimelist.png';
                                ss = 'MyAnimeList';
                            } else if (cell.getValue().match(/kitsu\.io/gu)) {
                                sources = './images/kitsu.png';
                                ss = 'Kitsu';
                            } else {
                                sources = './images/anilist.png';
                                ss = 'AniList';
                            }

                            return `<a href="${cell.getValue()}" target="_blank" rel="noreferrer" title="${ss}" style="background: url(${sources}); background-size: contain; height: 17px; width: 17px;"></a>`;
                        },
                        headerClick: function (e, column) {
                            column.hide();
                            column.getTable().getColumn('sources2').show();
                            column.getTable().redraw(true);
                        },
                        headerHozAlign: 'center',
                        headerSort: false,
                        hozAlign: 'center',
                        minWidth: 17,
                        titleFormatter: function () {
                            return `<svg viewBox="0 0 24 24" width="17" height="17">${svg.earth}</svg>`;
                        },
                        vertAlign: 'middle',
                        width: 17
                    },
                    {
                        field: 'sources2',
                        formatter: function (cell) {
                            let sources = '';

                            if (cell.getValue()[0]) {
                                sources += `<a href="${cell.getValue()[0]}" target="_blank" rel="noreferrer" title="MyAnimeList" style="background: url(./images/myanimelist.png); background-size: contain; height: 17px; width: 17px; margin-right: 19px;"></a>`;
                            } else {
                                sources += '<span style="height: 17px; width: 17px; margin-right: 19px;"></span>';
                            }

                            if (cell.getValue()[1]) {
                                sources += `<a href="${cell.getValue()[1]}" target="_blank" rel="noreferrer" title="Kitsu" style="background: url(./images/kitsu.png); background-size: contain; height: 17px; width: 17px; margin-right: 19px;"></a>`;
                            } else {
                                sources += '<span style="height: 17px; width: 17px; margin-right: 19px;"></span>';
                            }

                            if (cell.getValue()[2]) {
                                sources += `<a href="${cell.getValue()[2]}" target="_blank" rel="noreferrer" title="AniList" style="background: url(./images/anilist.png); background-size: contain; height: 17px; width: 17px;"></a>`;
                            } else {
                                sources += '<span style="height: 17px; width: 17px;"></span>';
                            }

                            return sources;
                        },
                        headerClick: function (e, column) {
                            column.hide();
                            column.getTable().getColumn('sources').show();
                            column.getTable().redraw(true);
                        },
                        headerHozAlign: 'center',
                        headerSort: false,
                        hozAlign: 'center',
                        minWidth: 89,
                        title: 'Source',
                        vertAlign: 'middle',
                        visible: false,
                        width: 89
                    },
                    {
                        // padding
                        headerSort: false,
                        minWidth: 19,
                        width: 19
                    },
                    {
                        field: 'alternative',
                        formatter: function (cell) {
                            const
                                div = document.createElement('div'),
                                fragment = new DocumentFragment(),
                                span = document.createElement('span');

                            span.innerHTML = cell.getValue();

                            div.classList.add('indicator');
                            div.style.position = 'absolute';
                            div.style.bottom = 0;
                            div.style.height = '2px';
                            div.style.maxWidth = '100%';

                            if (cell.getRow().getData().r18) {
                                const
                                    r18 = document.createElement('a'),
                                    v = 'tag:hentai ';

                                r18.href = `./?query=${escape(encodeURIComponent(v))}`;
                                r18.style.color = '#f44336';
                                r18.style.fontWeight = 500;
                                r18.innerHTML = 'R18+';
                                r18.addEventListener('click', (e) => {
                                    e.preventDefault();

                                    document.querySelector('.search').value = v;
                                    searchFunction(cell.getTable());
                                });

                                span.innerHTML += '&nbsp;';
                                span.appendChild(r18);
                            }

                            if (cell.getRow().getData().new) {
                                const
                                    n = document.createElement('a'),
                                    v = 'is:new ';

                                n.href = `./?query=${escape(encodeURIComponent(v))}`;
                                n.style.color = '#8bc34a';
                                n.style.fontWeight = 500;
                                n.innerHTML = 'New';
                                n.addEventListener('click', (e) => {
                                    e.preventDefault();

                                    document.querySelector('.search').value = v;
                                    searchFunction(cell.getTable());
                                });

                                span.innerHTML += '&nbsp;';
                                span.appendChild(n);
                            }

                            fragment.appendChild(span);
                            fragment.appendChild(div);

                            return fragment;
                        },
                        minWidth: 200,
                        title: 'Title',
                        vertAlign: 'middle'
                    },
                    {
                        field: 'type',
                        headerHozAlign: 'center',
                        hozAlign: 'center',
                        sorterParams: {
                            alignEmptyValues: 'bottom'
                        },
                        title: 'Type',
                        vertAlign: 'middle',
                        width: 100
                    },
                    {
                        field: 'episodes',
                        headerHozAlign: 'center',
                        hozAlign: 'center',
                        sorter: 'number',
                        sorterParams: {
                            alignEmptyValues: 'bottom'
                        },
                        title: 'Episodes',
                        vertAlign: 'middle',
                        width: 100
                    },
                    {
                        field: 'season',
                        formatter: function (cell) {
                            const
                                a = document.createElement('a'),
                                value = cell.getValue();

                            let v = null;

                            if (value) {
                                if (value.indexOf(' ') > -1) {
                                    const split = value.split(' ');

                                    v = `season:${split[0].toLowerCase()} year:${split[1]}`;
                                } else {
                                    v = `season:tba year:${value}`;
                                }
                            } else {
                                v = 'year:tba';
                            }

                            v += ' ';

                            a.href = `./?query=${escape(encodeURIComponent(v))}`;
                            a.innerHTML = cell.getValue();
                            a.addEventListener('click', (e) => {
                                e.preventDefault();

                                document.querySelector('.search').value = v;
                                searchFunction(cell.getTable());
                            });

                            return a;
                        },
                        headerHozAlign: 'center',
                        hozAlign: 'center',
                        sorter: function (a, b) {
                            function convert(n) {
                                if (n) {
                                    if (n.indexOf(' ') > -1) {
                                        const split = n.split(' ');

                                        switch (split[0]) {
                                            case 'Winter':
                                                return Number(`${split[1]}1`);
                                            case 'Spring':
                                                return Number(`${split[1]}2`);
                                            case 'Summer':
                                                return Number(`${split[1]}3`);
                                            case 'Fall':
                                                return Number(`${split[1]}4`);
                                            default:
                                                return Number(`${split[1]}5`);
                                        }
                                    } else {
                                        return Number(`${n}5`);
                                    }
                                } else {
                                    return 99999;
                                }
                            }

                            return convert(a) - convert(b);
                        },
                        sorterParams: {
                            alignEmptyValues: 'bottom'
                        },
                        title: 'Season',
                        vertAlign: 'middle',
                        width: 100
                    },
                    {
                        field: 'ongoing',
                        formatter: function (cell) {
                            if (!cell.getValue()) {
                                return '';
                            }

                            const
                                a = document.createElement('a'),
                                v = 'is:ongoing ';

                            a.href = `./?query=${escape(encodeURIComponent(v))}`;
                            a.title = 'Ongoing';
                            a.innerHTML = `<svg viewBox="3 2 20 20" width="17" height="17">${svg.play}</svg>`;
                            a.style.display = 'inline-flex';
                            a.style.alignItems = 'center';
                            a.addEventListener('click', (e) => {
                                e.preventDefault();

                                document.querySelector('.search').value = v;
                                searchFunction(cell.getTable());
                            });

                            return a;
                        },
                        headerHozAlign: 'center',
                        headerSort: false,
                        hozAlign: 'center',
                        titleFormatter: function () {
                            return `<svg viewBox="3 2 20 20" width="17" height="17">${svg.play}</svg>`;
                        },
                        vertAlign: 'middle',
                        width: 50
                    },
                    {
                        editable: function () {
                            return false;
                        },
                        editor: function (cell, rendered, success) {
                            const input = document.createElement('input');

                            input.type = 'number';
                            input.min = 0;
                            input.max = 9999;
                            input.placeholder = 0;
                            input.autocomplete = 'off';
                            input.value = cell.getValue();
                            input.title = 'Progress';

                            input.addEventListener('input', () => {
                                new Promise((resolve) => {
                                    const d2 = db2().add({
                                        episodes: cell.getRow().getData().episodes,
                                        progress: cell.getRow().getData().progress,
                                        season: cell.getRow().getData().season,
                                        source: cell.getRow().getData().sources,
                                        status: cell.getRow().getData().status,
                                        title: cell.getRow().getData().title,
                                        type: cell.getRow().getData().type
                                    });

                                    d2.onerror = () => resolve();

                                    d2.onsuccess = () => {
                                        const dd = [];

                                        for (const value2 of cell.getRow().getData().sources2) {
                                            if (!value2 || value2 === cell.getRow().getData().sources) {
                                                continue;
                                            }

                                            dd.push(
                                                new Promise((resolve2) => {
                                                    db2().delete(value2).onsuccess = () => resolve2();
                                                })
                                            );
                                        }

                                        Promise.all(dd).then(() => resolve());
                                    };
                                }).then(() => {
                                    db2().get(cell.getRow().getData().sources).onsuccess = (event) => {
                                        const result = event.target.result;

                                        if (input.value <= 0) {
                                            result.progress = '0';
                                        } else if (input.value >= 9999) {
                                            result.progress = 9999;
                                        } else {
                                            result.progress = input.value;
                                        }

                                        db2().put(result).onsuccess = () => {
                                            if (!cell.getRow().getData().episodes) {
                                                return;
                                            }

                                            cell.getRow().getElement().dataset.progress = input.value;
                                            cell.getRow().getCell('alternative').getElement().querySelector('.indicator').style.width = `${input.value / cell.getRow().getData().episodes * 100}%`;

                                            if (Number(input.value) === cell.getRow().getData().episodes) {
                                                if (cell.getRow().getData().status === 'Completed') {
                                                    return;
                                                }

                                                db2().get(cell.getRow().getData().sources).onsuccess = (event2) => {
                                                    const result2 = event2.target.result;
                                                    result2.status = 'Completed';

                                                    db2().put(result2).onsuccess = () => {
                                                        cell.getRow().update({
                                                            status: 'Completed'
                                                        });

                                                        channel.postMessage(true);
                                                    };
                                                };
                                            } else {
                                                if (cell.getRow().getData().status === 'Rewatching' || cell.getRow().getData().status === 'Watching') {
                                                    return;
                                                }

                                                db2().get(cell.getRow().getData().sources).onsuccess = (event2) => {
                                                    const result2 = event2.target.result;
                                                    result2.status = 'Watching';

                                                    db2().put(result2).onsuccess = () => {
                                                        cell.getRow().update({
                                                            status: 'Watching'
                                                        });

                                                        channel.postMessage(true);
                                                    };
                                                };
                                            }
                                        };
                                    };
                                });
                            });

                            input.addEventListener('keydown', (e) => {
                                if (e.key !== 'Enter' || e.repeat) {
                                    return;
                                }

                                input.blur();
                            });

                            input.addEventListener('blur', () => {
                                if (input.value <= 0) {
                                    success('0');
                                } else if (input.value >= 9999) {
                                    success(9999);
                                } else {
                                    success(input.value);
                                }
                            });

                            rendered(() => {
                                input.focus();
                            });

                            return input;
                        },
                        field: 'progress',
                        formatter: function (cell) {
                            const
                                fragment = new DocumentFragment(),
                                span = document.createElement('span'),
                                span2 = document.createElement('span');

                            cell.getElement().removeAttribute('tabindex');

                            if (['Completed', 'Dropped', 'Paused', 'Rewatching', 'Watching'].indexOf(cell.getRow().getData().status) > -1) {
                                span.tabIndex = 0;
                            }

                            span.innerHTML = cell.getValue();
                            span.addEventListener('click', () => {
                                if (['', 'Planning', 'Skipping'].indexOf(cell.getRow().getData().status) > -1) {
                                    return;
                                }

                                cell.edit(true);
                            });

                            span2.classList.add('add');
                            span2.tabIndex = 0;
                            span2.style.display = 'inline-flex';
                            span2.style.marginLeft = '2.125px';
                            span2.innerHTML = '<svg viewBox="0 0 24 24" height="17" width="17"><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"></path></svg>';

                            span2.addEventListener('dblclick', () => {
                                getSelection().removeAllRanges();
                            });

                            span2.addEventListener('click', () => {
                                new Promise((resolve) => {
                                    const d2 = db2().add({
                                        episodes: cell.getRow().getData().episodes,
                                        progress: cell.getRow().getData().progress,
                                        season: cell.getRow().getData().season,
                                        source: cell.getRow().getData().sources,
                                        status: cell.getRow().getData().status,
                                        title: cell.getRow().getData().title,
                                        type: cell.getRow().getData().type
                                    });

                                    d2.onerror = () => resolve();

                                    d2.onsuccess = () => {
                                        const dd = [];

                                        for (const value2 of cell.getRow().getData().sources2) {
                                            if (!value2 || value2 === cell.getRow().getData().sources) {
                                                continue;
                                            }

                                            dd.push(
                                                new Promise((resolve2) => {
                                                    db2().delete(value2).onsuccess = () => resolve2();
                                                })
                                            );
                                        }

                                        Promise.all(dd).then(() => resolve());
                                    };
                                }).then(() => {
                                    db2().get(cell.getRow().getData().sources).onsuccess = (event) => {
                                        const result = event.target.result;
                                        result.progress++;

                                        if (result.progress > 9999) {
                                            return;
                                        }

                                        db2().put(result).onsuccess = () => {
                                            let value = cell.getValue();
                                            value++;

                                            cell.getRow().update({
                                                progress: value
                                            });

                                            if (!cell.getRow().getData().episodes) {
                                                return;
                                            }

                                            cell.getRow().getElement().dataset.progress = value;
                                            cell.getRow().getCell('alternative').getElement().querySelector('.indicator').style.width = `${value / cell.getRow().getData().episodes * 100}%`;

                                            if (value === cell.getRow().getData().episodes) {
                                                if (cell.getRow().getData().status === 'Completed') {
                                                    return;
                                                }

                                                db2().get(cell.getRow().getData().sources).onsuccess = (event2) => {
                                                    const result2 = event2.target.result;
                                                    result2.status = 'Completed';

                                                    db2().put(result2).onsuccess = () => {
                                                        // force update
                                                        cell.getRow().update({
                                                            progress: ''
                                                        });

                                                        cell.getRow().update({
                                                            progress: value,
                                                            status: 'Completed'
                                                        });

                                                        channel.postMessage(true);
                                                    };
                                                };
                                            } else {
                                                if (cell.getRow().getData().status === 'Rewatching' || cell.getRow().getData().status === 'Watching') {
                                                    return;
                                                }

                                                db2().get(cell.getRow().getData().sources).onsuccess = (event2) => {
                                                    const result2 = event2.target.result;
                                                    result2.status = 'Watching';

                                                    db2().put(result2).onsuccess = () => {
                                                        cell.getRow().update({
                                                            status: 'Watching'
                                                        });

                                                        channel.postMessage(true);
                                                    };
                                                };
                                            }
                                        };
                                    };
                                });
                            });

                            fragment.appendChild(span);

                            if (['Dropped', 'Paused', 'Rewatching', 'Watching'].indexOf(cell.getRow().getData().status) > -1) {
                                fragment.appendChild(span2);
                            }

                            return fragment;
                        },
                        headerHozAlign: 'center',
                        headerSort: !error,
                        hozAlign: 'center',
                        sorter: 'number',
                        sorterParams: {
                            alignEmptyValues: 'bottom'
                        },
                        title: 'Progress',
                        vertAlign: 'middle',
                        width: 100
                    },
                    {
                        field: 'status',
                        formatter: function (cell) {
                            const select = document.createElement('select');

                            if (error) {
                                select.disabled = true;
                            }

                            select.innerHTML = statuses;
                            select.value = cell.getValue();
                            select.title = 'Status';
                            select.addEventListener('change', () => {
                                if (error) {
                                    return;
                                }

                                const p = cell.getRow().getData().progress;

                                if (select.value) {
                                    const d2 = db2().add({
                                        episodes: cell.getRow().getData().episodes,
                                        progress:
                                            select.value === 'Completed' && cell.getRow().getData().episodes
                                                ? cell.getRow().getData().episodes
                                                : ['Planning', 'Skipping'].indexOf(select.value) > -1
                                                    ? ''
                                                    : '0',
                                        season: cell.getRow().getData().season,
                                        source: cell.getRow().getData().sources,
                                        status: select.value,
                                        title: cell.getRow().getData().title,
                                        type: cell.getRow().getData().type
                                    });

                                    d2.onsuccess = () => {
                                        const dd = [];

                                        for (const value2 of cell.getRow().getData().sources2) {
                                            if (!value2 || value2 === cell.getRow().getData().sources) {
                                                continue;
                                            }

                                            dd.push(
                                                new Promise((resolve) => {
                                                    db2().delete(value2).onsuccess = () => resolve();
                                                })
                                            );
                                        }

                                        Promise.all(dd).then(() => {
                                            if (select.value === 'Completed' && cell.getRow().getData().episodes) {
                                                cell.getRow().update({
                                                    progress: cell.getRow().getData().episodes,
                                                    status: select.value
                                                });

                                                channel.postMessage(true);

                                                return;
                                            }

                                            if (select.value === 'Planning' || select.value === 'Skipping') {
                                                cell.getRow().update({
                                                    progress: '',
                                                    status: select.value
                                                });

                                                channel.postMessage(true);

                                                return;
                                            }

                                            cell.getRow().update({
                                                progress: '0',
                                                status: select.value
                                            });

                                            channel.postMessage(true);
                                        });
                                    };

                                    d2.onerror = () => {
                                        db2().get(cell.getRow().getData().sources).onsuccess = (event) => {
                                            const
                                                result = event.target.result,
                                                status2 = result.status;

                                            if (select.value === 'Completed' && cell.getRow().getData().episodes) {
                                                result.progress = cell.getRow().getData().episodes;
                                            } else {
                                                if (select.value === 'Planning' || select.value === 'Skipping') {
                                                    result.progress = '';
                                                } else {
                                                    if (status2 === 'Planning' || status2 === 'Skipping') {
                                                        result.progress = '0';
                                                    }
                                                }
                                            }

                                            result.status = select.value;

                                            db2().put(result).onsuccess = () => {
                                                if (select.value === 'Completed' && cell.getRow().getData().episodes) {
                                                    cell.getRow().getElement().dataset.progress = '';

                                                    // force update
                                                    cell.getRow().update({
                                                        progress: ''
                                                    });

                                                    cell.getRow().update({
                                                        progress: cell.getRow().getData().episodes,
                                                        status: select.value
                                                    });

                                                    channel.postMessage(true);

                                                    return;
                                                }

                                                if (select.value === 'Planning' || select.value === 'Skipping') {
                                                    cell.getRow().getElement().dataset.progress = '';

                                                    cell.getRow().update({
                                                        progress: '',
                                                        status: select.value
                                                    });

                                                    channel.postMessage(true);

                                                    return;
                                                }

                                                if (status2 === 'Planning' || status2 === 'Skipping') {
                                                    cell.getRow().update({
                                                        progress: '0',
                                                        status: select.value
                                                    });

                                                    channel.postMessage(true);

                                                    return;
                                                }

                                                // force update
                                                cell.getRow().update({
                                                    progress: ''
                                                });

                                                cell.getRow().update({
                                                    progress: p,
                                                    status: select.value
                                                });

                                                channel.postMessage(true);
                                            };
                                        };
                                    };
                                } else {
                                    const dd = [];

                                    for (const value2 of cell.getRow().getData().sources2) {
                                        if (!value2) {
                                            continue;
                                        }

                                        dd.push(
                                            new Promise((resolve) => {
                                                db2().delete(value2).onsuccess = () => resolve();
                                            })
                                        );
                                    }

                                    Promise.all(dd).then(() => {
                                        cell.getRow().getElement().dataset.progress = '';

                                        cell.getRow().update({
                                            progress: '',
                                            status: ''
                                        });

                                        channel.postMessage(true);
                                    });
                                }
                            });

                            return select;
                        },
                        headerHozAlign: 'center',
                        headerSort: !error,
                        hozAlign: 'center',
                        sorterParams: {
                            alignEmptyValues: 'bottom'
                        },
                        title: 'Status',
                        vertAlign: 'middle',
                        width: 100
                    },
                    {
                        field: 'relevancy',
                        visible: false
                    },
                    {
                        // padding
                        headerSort: false,
                        minWidth: 19,
                        width: 19
                    }
                ],
                data: database,
                dataFiltered: function (filters, rows) {
                    r = rows;
                    selected.s = true;

                    selected.ss.splice(0);

                    for (const value of rows) {
                        if (value.isSelected()) {
                            selected.ss.push(value);
                        } else {
                            if (selected.s) {
                                selected.s = false;
                            }
                        }
                    }

                    if (selected.s) {
                        this.getColumn('picture').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.check;
                    } else {
                        if (selected.ss.length) {
                            this.getColumn('picture').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.indeterminate;
                        } else {
                            this.getColumn('picture').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
                        }
                    }

                    if (index.dimension) {
                        for (const value of rows) {
                            value.update({
                                alternative: index.dimension.find((i) => i.source === value.getData().sources).alternative,
                                relevancy: index.dimension.find((i) => i.source === value.getData().sources).relevancy
                            });
                        }
                    }

                    if (document.querySelector('.searching')) {
                        document.querySelector('.searching').remove();
                    }

                    if (rows.length) {
                        document.querySelector('.tabulator').style.display = '';
                    } else {
                        document.querySelector('main').insertAdjacentHTML('beforeend',
                            '<div class="nothing">Nothing found</div>'
                        );

                    }
                },
                dataLoaded: function () {
                    document.querySelector('.tabulator').style.display = 'none';

                    if (new URLSearchParams(location.search).get('query')) {
                        const value = decodeURIComponent(new URLSearchParams(location.search).get('query'));

                        document.querySelector('.search').value = value;
                        document.querySelector('.clear').style.display = 'inline-flex';
                    } else {
                        document.querySelector('.search').value = '';
                        document.querySelector('.clear').style.display = 'none';
                    }

                    if (new URLSearchParams(location.search).get('regex') === '1') {
                        document.querySelector('#regex').checked = true;
                    } else {
                        document.querySelector('#regex').checked = false;
                    }

                    if (new URLSearchParams(location.search).get('alt') === '0') {
                        document.querySelector('#alt').checked = true;
                    } else {
                        document.querySelector('#alt').checked = false;
                    }

                    if (Math.round(Math.abs(Number(new URLSearchParams(location.search).get('random'))))) {
                        document.querySelector('#random').checked = true;
                        document.querySelector('[for="number"]').style.color = '';
                        document.querySelector('#number').removeAttribute('disabled');
                        document.querySelector('#number').value = Math.round(Math.abs(Number(new URLSearchParams(location.search).get('random'))));
                        document.querySelector('.enter path').setAttribute('d', 'M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z');
                        document.querySelector('.search').setAttribute('placeholder', 'Search or show random anime');
                    } else {
                        document.querySelector('#random').checked = false;
                        document.querySelector('[for="number"]').style.color = '#a7abb7';
                        document.querySelector('#number').setAttribute('disabled', '');
                        document.querySelector('.enter path').setAttribute('d', 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z');
                        document.querySelector('.search').setAttribute('placeholder', 'Search or show all anime');
                    }

                    document.querySelector('.loading').remove();
                    document.querySelector('.search-container').style.display = 'inline-flex';

                    searchFunction(this);
                },
                dataSorted: function (sorters) {
                    if (sorters.length) {
                        return;
                    }

                    if (new URLSearchParams(location.search).get('regex') === '1') {
                        this.setSort('alternative', 'asc');
                    } else {
                        if (index.query) {
                            this.setSort('relevancy', 'desc');
                        } else {
                            this.setSort('alternative', 'asc');
                        }
                    }

                    this.redraw(true);
                },
                headerSortElement: `<svg viewBox="0 0 24 24" width="17" height="17">${svg.arrow}</svg>`,
                headerSortTristate: true,
                index: 'sources',
                initialSort: [
                    {
                        column: 'alternative',
                        dir: 'asc'
                    }
                ],
                layout: 'fitColumns',
                resizableColumns: false,
                rowFormatter: function (row) {
                    let width = null;

                    row.getElement().dataset.dead = row.getData().dead;
                    row.getElement().dataset.status = row.getData().status;

                    switch (row.getData().status) {
                        case 'Completed':
                        case 'Dropped':
                        case 'Paused':
                        case 'Rewatching':
                        case 'Watching':
                            width = `${(row.getElement().dataset.progress || row.getData().progress) / row.getData().episodes * 100}%`;
                            break;

                        default:
                            width = '0%';
                            break;
                    }

                    row.getCell('alternative').getElement().querySelector('.indicator').style.width = width;
                },
                tableBuilt: function () {
                    document.querySelector('.tabulator-tableHolder').setAttribute('tabindex', -1);

                    const columns = ['picture', 'sources', 'sources2', 'alternative', 'type', 'episodes', 'season'];

                    if (!error) {
                        columns.push(...['progress', 'status']);
                    }

                    for (const value of columns) {
                        document.querySelector(`.tabulator-col[tabulator-field="${value}"]`).tabIndex = 0;
                    }
                }
            });
        });
    })
    .catch(() => {
        new Promise((resolve) => {
            const db = indexedDB.open('tsuzuku', 1);

            db.onupgradeneeded = (event) => {
                const
                    index2 = [
                        'episodes',
                        'progress',
                        'season',
                        'status',
                        'title',
                        'type'
                    ],
                    storage = event.target.result.createObjectStore('tsuzuku', {
                        keyPath: 'source'
                    });

                for (const value of index2) {
                    storage.createIndex(value, value, {
                        unique: false
                    });
                }
            };

            db.onerror = () => resolve('error');

            db.onsuccess = (event3) => {
                db2 = () => event3.target.result.transaction('tsuzuku', 'readwrite').objectStore('tsuzuku');

                db2().openCursor().onsuccess = (event5) => {
                    const cursor = event5.target.result;

                    if (cursor) {
                        map4.set(cursor.key, {
                            episodes: cursor.value.episodes,
                            progress: cursor.value.progress,
                            season: cursor.value.season,
                            status: cursor.value.status,
                            title: cursor.value.title,
                            type: cursor.value.type
                        });

                        cursor.continue();
                    } else {
                        return resolve('success');
                    }

                    return null;
                };
            };
        }).then(() => {
            document.querySelector('.thumbnails').remove();
            document.querySelector('.loading').innerHTML = 'Database not found';

            error2 = true;

            if (error) {
                return;
            }

            document.querySelector('.loading').innerHTML += '<span class="export2" style="display: inline-flex; margin-top: 11.5px;">Export personal list</span>';

            document.querySelector('.export2').addEventListener('click', () => {
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
                            status2 = null;

                        switch (cursor.value.status) {
                            case 'Paused':
                                status2 = 'On-Hold';
                                break;

                            case 'Planning':
                                status2 = 'Plan to Watch';
                                progress = 0;
                                break;

                            case 'Rewatching':
                                status2 = 'Completed';
                                rewatching = 1;
                                break;

                            case 'Skipping':
                                status2 = 'Dropped';
                                skipping = 1;
                                progress = 0;
                                break;

                            default:
                                status2 = cursor.value.status;
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
                        `        <my_status>${status2}</my_status>\n` +
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
        });
    });

export {
    db2,
    error,
    error2,
    params,
    r,
    selected,
    svg,
    t,
    title
};