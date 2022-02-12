import {
    index,
    searchFunction
} from './index.js';

const
    channel =
        'BroadcastChannel' in window
            ? new BroadcastChannel('tsuzuku')
            : null,
    data5 = [],
    database = [],
    database2 = {},
    map4 = new Map(),
    selected = {
        s: true,
        ss: []
    },
    sorted = {
        s: 'relevancy',
        ss: false
    },
    status = ['', 'Completed', 'Dropped', 'Paused', 'Planning', 'Rewatching', 'Skipping', 'Watching'],
    svg = {
        arrow: '<path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"></path>',
        blank: '<path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>',
        check: '<path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>',
        indeterminate: '<path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1 0.9 2 2 2h14c1.1 0 2-0.9 2-2V5C21 3.9 20.1 3 19 3z M17 13H7v-2h10V13z"></path>',
        play: '<path d="M8 5v14l11-7z"></path>'
    },
    // tags = new Set(),
    title = document.title,
    years = new Set();

let db2 = null,
    disableSelection = false,
    error = false,
    error2 = false,
    r = null,
    statuses = '',
    t = null;

function channelMessage() {
    if (channel) {
        channel.postMessage(true);
    }
}

function clickCell(e, cell, shift) {
    if (disableSelection) {
        return;
    }

    getSelection().removeAllRanges();
    cell.getRow().toggleSelect();

    if (shift && index.lastRow) {
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
                        if (prevRow.isSelected()) {
                            prevRow.toggleSelect();
                        }
                    }
                } else {
                    if (cell.getRow().isSelected()) {
                        if (!prevRow.isSelected()) {
                            // if (prevRow.getPosition(true) !== lastPosition || index.lastRow.getPrevRow().isSelected()) {
                            prevRow.toggleSelect();
                            // }
                        }
                    } else {
                        if (prevRow.getPosition(true) !== lastPosition) {
                            if (prevRow.isSelected()) {
                                prevRow.toggleSelect();
                            }
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
                        if (nextRow.isSelected()) {
                            nextRow.toggleSelect();
                        }
                    }
                } else {
                    if (cell.getRow().isSelected()) {
                        if (!nextRow.isSelected()) {
                            // if (nextRow.getPosition(true) !== lastPosition || index.lastRow.getNextRow().isSelected()) {
                            nextRow.toggleSelect();
                            // }
                        }
                    } else {
                        if (nextRow.getPosition(true) !== lastPosition) {
                            if (nextRow.isSelected()) {
                                nextRow.toggleSelect();
                            }
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
        let active = 0;

        index.lastRow = cell.getRow();

        document.querySelector('header').classList.add('header-selected');

        for (const value of r) {
            if (value.isSelected()) {
                active += 1;
            }
        }

        if (cell.getTable().getSelectedRows().length > active) {
            document.querySelector('.selected-count').innerHTML = `${cell.getTable().getSelectedRows().length} selected (${active} active)`;
        } else {
            document.querySelector('.selected-count').innerHTML = `${cell.getTable().getSelectedRows().length} selected`;
        }

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

            const ddd = [];

            channelMessage();
            disableSelection = true;
            document.querySelector('.changing').style.display = '';
            hstatus.style.display = 'none';

            for (const value of cell.getTable().getSelectedRows()) {
                ddd.push(
                    new Promise((resolve2) => {
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
                                if (hstatus.value === 'Completed' && value.getData().episodes) {
                                    value.update({
                                        progress: value.getData().episodes,
                                        status: hstatus.value
                                    });

                                    resolve2();
                                    return;
                                }

                                if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                    value.update({
                                        progress: '',
                                        status: hstatus.value
                                    });

                                    resolve2();
                                    return;
                                }

                                value.update({
                                    progress: '0',
                                    status: hstatus.value
                                });

                                resolve2();
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

                                            resolve2();
                                            return;
                                        }

                                        if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                            value.getElement().dataset.progress = '';

                                            value.update({
                                                progress: '',
                                                status: hstatus.value
                                            });

                                            resolve2();
                                            return;
                                        }

                                        if (status2 === 'Planning' || status2 === 'Skipping') {
                                            value.update({
                                                progress: '0',
                                                status: hstatus.value
                                            });

                                            resolve2();
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

                                        resolve2();
                                    };
                                };
                            };
                        } else {
                            db2().delete(value.getData().sources).onsuccess = () => {
                                value.getElement().dataset.progress = '';

                                value.update({
                                    progress: '',
                                    status: ''
                                });

                                resolve2();
                            };
                        }
                    })
                );
            }

            Promise.all(ddd).then(() => {
                disableSelection = false;
                document.querySelector('.changing').style.display = 'none';
                hstatus.style.display = '';
            });
        });

        document.querySelector('header').insertAdjacentElement('beforeend', hstatus);
        document.head.querySelector('[name="theme-color"]').content = '#4065ba';

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
        document.head.querySelector('[name="theme-color"]').content = '#000';

        cell.getColumn().getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
    }
}

function clickHeader(e, column) {
    if (disableSelection) {
        return;
    }

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
        let active = 0;

        document.querySelector('header').classList.add('header-selected');

        for (const value of r) {
            if (value.isSelected()) {
                active += 1;
            }
        }

        if (column.getTable().getSelectedRows().length > active) {
            document.querySelector('.selected-count').innerHTML = `${column.getTable().getSelectedRows().length} selected (${active} active)`;
        } else {
            document.querySelector('.selected-count').innerHTML = `${column.getTable().getSelectedRows().length} selected`;
        }

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

            const ddd = [];

            channelMessage();
            disableSelection = true;
            document.querySelector('.changing').style.display = '';
            hstatus.style.display = 'none';

            for (const value of column.getTable().getSelectedRows()) {
                ddd.push(
                    new Promise((resolve2) => {
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
                                if (hstatus.value === 'Completed' && value.getData().episodes) {
                                    value.update({
                                        progress: value.getData().episodes,
                                        status: hstatus.value
                                    });

                                    resolve2();
                                    return;
                                }

                                if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                    value.update({
                                        progress: '',
                                        status: hstatus.value
                                    });

                                    resolve2();
                                    return;
                                }

                                value.update({
                                    progress: '0',
                                    status: hstatus.value
                                });

                                resolve2();
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

                                            resolve2();
                                            return;
                                        }

                                        if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                            value.getElement().dataset.progress = '';

                                            value.update({
                                                progress: '',
                                                status: hstatus.value
                                            });

                                            resolve2();
                                            return;
                                        }

                                        if (status2 === 'Planning' || status2 === 'Skipping') {
                                            value.update({
                                                progress: '0',
                                                status: hstatus.value
                                            });

                                            resolve2();
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

                                        resolve2();
                                    };
                                };
                            };
                        } else {
                            db2().delete(value.getData().sources).onsuccess = () => {
                                value.getElement().dataset.progress = '';

                                value.update({
                                    progress: '',
                                    status: ''
                                });

                                resolve2();
                            };
                        }
                    })
                );
            }

            Promise.all(ddd).then(() => {
                disableSelection = false;
                document.querySelector('.changing').style.display = 'none';
                hstatus.style.display = '';
            });
        });

        document.querySelector('header').insertAdjacentElement('beforeend', hstatus);
        document.head.querySelector('[name="theme-color"]').content = '#4065ba';
    } else {
        document.querySelector('header').classList.remove('header-selected');
        column.getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
        document.querySelector('.header-status').remove();
        document.querySelector('header .menu').style.display = 'inline-flex';
        document.head.querySelector('[name="theme-color"]').content = '#000';
    }
}

function customSort(e, column) {
    const custom = [];
    let direction = '';

    e.stopImmediatePropagation();

    if (sorted.s === column.getField()) {
        if (sorted.ss) {
            sorted.s = 'alternative';
            sorted.ss = false;
            column.getTable().clearSort();
            return;
        }

        sorted.ss = true;
        direction = 'desc';
    } else {
        sorted.s = column.getField();
        sorted.ss = false;
        direction = 'asc';
    }

    custom.push({
        column: column.getField(),
        dir: direction
    });

    if (column.getField() !== 'alternative') {
        custom.push({
            column: 'alternative',
            dir: 'asc'
        });
    }

    column.getTable().setSort(custom);
}

if (channel) {
    channel.onmessage = () => {
        error = true;

        document.querySelectorAll('select[title="Status"]').forEach((element) => {
            element.disabled = true;
        });
    };
}

fetch('https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database-minified.json')
// fetch('anime-offline-database.json')
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
                const
                    source = /myanimelist\.net/gu,
                    ss = d[i].animeSeason.season,
                    tt = d[i].tags.map((tags2) => tags2.replace(/\s/gu, '_')),
                    value = d[i].sources.filter((sources) => sources.match(source))[0];

                let n2 = false,
                    p2 = '',
                    s = '',
                    s2 = '',
                    ttt = '';

                if (!d[i].sources.filter((sources) => sources.match(/myanimelist\.net/gu)).length) {
                    continue;
                }

                if (d[i].picture === 'https://cdn.myanimelist.net/images/qm_50.gif') {
                    continue;
                }

                if (d[i].tags.indexOf('anime influenced') > -1) {
                    continue;
                }

                // if (data5.indexOf(value) > -1) {
                //     continue;
                // }

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

                if (map4.has(value)) {
                    p2 = map4.get(value).progress;
                    s2 = map4.get(value).status;

                    map4.delete(value);
                }

                if (d[i].type !== 'UNKNOWN') {
                    if (['MOVIE', 'SPECIAL'].indexOf(d[i].type) > -1) {
                        ttt = d[i].type.replace(d[i].type.substr(1), d[i].type.substr(1).toLowerCase());
                    } else {
                        ttt = d[i].type;
                    }
                }

                // for (const value2 of d[i].tags) {
                //     tags.add(value2);
                // }

                years.add(d[i].animeSeason.year);

                database.push({
                    alternative: d[i].title,
                    dead: false,
                    episodes: d[i].episodes || '',
                    new: n2,
                    ongoing: d[i].status === 'ONGOING',
                    picture: d[i].picture,
                    progress: p2,
                    r18: tt.indexOf('hentai') > -1,
                    relations: [
                        ...d[i].sources.filter((sources) => sources.match(source) && sources !== value),
                        ...d[i].relations.filter((relations) => relations.match(/myanimelist\.net/gu))
                    ],
                    relevancy: 1,
                    season: s,
                    sources: value,
                    status: s2,
                    synonyms: d[i].synonyms,
                    tags: tt,
                    title: d[i].title,
                    type: ttt
                });

                data5.push(value);
            }

            for (const value of Array.from(years).sort()) {
                document.querySelector('.year').innerHTML += `<option>${value || 'TBA'}</option>`;
            }

            // for (const value of Array.from(tags).sort()) {
            //     document.querySelector('.season-container .tag').innerHTML += `<option>${value}</option>`;
            // }

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
                    relations: [],
                    relevancy: 1,
                    season: value.season,
                    sources: key,
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
                            clickCell(e, cell, e.shiftKey);
                        },
                        cellTapHold: function (e, cell) {
                            clickCell(e, cell, true);
                        },
                        field: 'picture',
                        formatter: function (cell) {
                            cell.getElement().tabIndex = 0;

                            return (
                                `<svg class="blank" viewBox="0 0 24 24" width="17" height="17">${svg.blank}</svg>` +
                                `<svg class="check" viewBox="0 0 24 24" width="17" height="17">${svg.check}</svg>` +
                                `<img src="${cell.getValue()}" loading="lazy" alt style="height: 40px; object-fit: cover; user-select: none; width: 40px;">`
                            );
                        },
                        frozen: true,
                        headerClick: function (e, column) {
                            clickHeader(e, column);
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
                            clickCell(e, cell, e.shiftKey);
                        },
                        cellTapHold: function (e, cell) {
                            clickCell(e, cell, true);
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
                        headerClick: function (e, cell) {
                            clickHeader(e, cell);
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
                        minWidth: 17,
                        titleFormatter: function () {
                            return `<svg viewBox="3 2 20 20" width="17" height="17">${svg.play}</svg>`;
                        },
                        vertAlign: 'middle',
                        width: 17
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
                                span = document.createElement('span'),
                                span2 = document.createElement('span');

                            span.innerHTML = `<span>${cell.getValue()}</span>`;

                            div.classList.add('indicator');
                            div.style.position = 'absolute';
                            div.style.bottom = 0;
                            div.style.height = '2px';
                            div.style.maxWidth = '100%';

                            if (cell.getRow().getData().r18) {
                                const
                                    r18 = document.createElement('a'),
                                    v = 'tag:hentai ';

                                r18.classList.add('r18');
                                r18.href = `./?query=${escape(encodeURIComponent(v))}`;
                                r18.style.color = 'var(--r18)';
                                r18.style.fontWeight = 500;
                                r18.style.userSelect = 'none';
                                r18.innerHTML = 'R18+';
                                r18.addEventListener('click', (e) => {
                                    e.preventDefault();

                                    document.querySelector('.search').value = v;
                                    searchFunction(cell.getTable());
                                });

                                span.innerHTML += '<span style="user-select: none;">&nbsp;</span>';
                                span.appendChild(r18);
                            }

                            if (cell.getRow().getData().new) {
                                const
                                    n = document.createElement('a'),
                                    v = 'is:new ';

                                n.classList.add('new');
                                n.href = `./?query=${escape(encodeURIComponent(v))}`;
                                n.style.color = 'var(--new)';
                                n.style.fontWeight = 500;
                                n.style.userSelect = 'none';
                                n.innerHTML = 'New';
                                n.addEventListener('click', (e) => {
                                    e.preventDefault();

                                    document.querySelector('.search').value = v;
                                    searchFunction(cell.getTable());
                                });

                                span.innerHTML += '<span style="user-select: none;">&nbsp;</span>';
                                span.appendChild(n);
                            }

                            span2.classList.add('myanimelist');
                            span2.innerHTML =
                                '<span style="user-select: none;">&nbsp;</span>' +
                                `<a href="${cell.getRow().getData().sources}" target="_blank" rel="noreferrer" title="MyAnimeList" style="align-items: center; display: inline-flex;">` +
                                    '<svg viewBox="0 0 24 24" height="17" width="17">' +
                                        '<path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"></path>' +
                                    '</svg>' +
                                '</a>';

                            span.appendChild(span2);

                            fragment.appendChild(span);
                            fragment.appendChild(div);

                            return fragment;
                        },
                        headerClick: function (e, column) {
                            customSort(e, column);
                        },
                        minWidth: 200,
                        sorter: function (a, b) {
                            function slice(n) {
                                const s = '<span class="title">';

                                if (n.indexOf('&nbsp;') > -1) {
                                    return `${n.slice(0, n.indexOf('&nbsp;'))} ${n.slice(n.indexOf(s) + s.length, n.indexOf('</span>'))}`;
                                }

                                return n;
                            }

                            return slice(a).localeCompare(slice(b));
                        },
                        title: 'Title',
                        vertAlign: 'middle'
                    },
                    {
                        field: 'type',
                        headerClick: function (e, column) {
                            customSort(e, column);
                        },
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
                        headerClick: function (e, column) {
                            customSort(e, column);
                        },
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
                        headerClick: function (e, column) {
                            customSort(e, column);
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
                        formatter: function (cell) {
                            const relations = document.createElement('span');

                            relations.classList.add('relations');
                            relations.style.fontWeight = 500;
                            relations.style.userSelect = 'none';
                            relations.tabIndex = 0;
                            relations.innerHTML = 'Relations';
                            relations.addEventListener('click', () => {
                                const
                                    temp = [cell.getRow().getData().sources, ...cell.getRow().getData().relations],
                                    temp2 = [];

                                if (document.querySelector('.search-container').style.display === 'inline-flex') {
                                    document.querySelector('.search-container').style.display = 'none';
                                    document.querySelector('.related-container').style.display = 'inline-flex';
                                }

                                document.querySelector('.related-title').innerHTML = cell.getRow().getData().title;
                                document.querySelector('.tabulator').style.display = 'none';

                                if (document.querySelector('.searching')) {
                                    document.querySelector('.searching').remove();
                                }

                                document.querySelector('main').insertAdjacentHTML('beforeend',
                                    '<div class="searching">' +
                                        '<div class="progress" style="left: 0; position: absolute; top: 0;"></div>' +
                                        '<span>Searching...</span>' +
                                    '</div>'
                                );

                                function tempFunction() {
                                    temp.forEach((ttt) => {
                                        const m = cell.getTable().getData().filter((i) => {
                                            if (i.relations.indexOf(ttt) > -1) {
                                                return true;
                                            }

                                            return false;
                                        });

                                        m.forEach((mm) => {
                                            if (temp2.indexOf(mm.sources) === -1) {
                                                temp.push(mm.sources);
                                                temp2.push(mm.sources);
                                            }

                                            mm.relations.forEach((mmm) => {
                                                if (temp2.indexOf(mmm) === -1) {
                                                    temp.push(mmm);
                                                    temp2.push(mmm);
                                                }
                                            });
                                        });

                                        temp.splice(temp.indexOf(ttt), 1);
                                    });

                                    if (temp.length) {
                                        tempFunction();
                                    } else {
                                        if (r) {
                                            for (const value of r) {
                                                value.update({
                                                    alternative: value.getData().title,
                                                    relevancy: 1
                                                });
                                            }
                                        }

                                        index.dimension = null;

                                        if (temp2.length) {
                                            document.querySelector('.progress').classList.add('found');
                                        }

                                        document.querySelector('.progress').style.width = '100%';

                                        if (document.querySelector('.searching')) {
                                            document.querySelector('.searching span').innerHTML = 'Filtering table...';
                                        }

                                        setTimeout(() => {
                                            cell.getTable().setFilter('sources', 'in',
                                                temp2.length
                                                    ? temp2
                                                    : ['']
                                            );
                                        }, 100);
                                    }
                                }

                                setTimeout(tempFunction, 100);
                            });

                            return relations;
                        },
                        headerSort: false,
                        hozAlign: 'center',
                        vertAlign: 'middle',
                        width: 100
                    },

                    /*
                    {
                        field: 'watched',
                        formatter: function (cell) {
                            if (cell.getRow().getData().status === 'Completed') {
                                return '1';
                            }

                            return '';
                        },
                        headerHozAlign: 'center',
                        headerSort: false,
                        hozAlign: 'center',
                        titleFormatter: function () {
                            return 'Watched';
                        },
                        vertAlign: 'middle',
                        width: 100
                    },
                    */

                    {
                        editable: function () {
                            return false;
                        },
                        editor: function (cell, rendered, success) {
                            if (error) {
                                return false;
                            }

                            const input = document.createElement('input');

                            input.type = 'number';
                            input.min = 0;
                            input.max = 9999;
                            input.placeholder = 0;
                            input.autocomplete = 'off';
                            input.value = cell.getValue();
                            input.title = 'Enter progress';

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
                                    d2.onsuccess = () => resolve();
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
                                            channelMessage();

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
                                                    };
                                                };
                                            } else {
                                                if (['Completed', 'Rewatching', 'Watching'].indexOf(cell.getRow().getData().status) > -1) {
                                                    return;
                                                }

                                                db2().get(cell.getRow().getData().sources).onsuccess = (event2) => {
                                                    const result2 = event2.target.result;
                                                    result2.status = 'Watching';

                                                    db2().put(result2).onsuccess = () => {
                                                        cell.getRow().update({
                                                            status: 'Watching'
                                                        });
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

                                cell.getElement().querySelector('span:not(.add)').title = `${Math.round(input.value / cell.getRow().getData().episodes * 100)}%`;
                            });

                            rendered(() => {
                                input.focus();
                            });

                            return input;
                        },
                        field: 'progress',
                        formatter: function (cell) {
                            const
                                a = document.createElement('a'),
                                fragment = new DocumentFragment(),
                                span = document.createElement('span'),
                                span2 = document.createElement('span'),
                                v = 'is:mismatched ';

                            cell.getElement().tabIndex = -1;

                            if (['Completed', 'Dropped', 'Paused', 'Rewatching', 'Watching'].indexOf(cell.getRow().getData().status) > -1) {
                                span.tabIndex = 0;
                            }

                            span.innerHTML = cell.getValue();
                            span.addEventListener('click', () => {
                                if (error) {
                                    return;
                                }

                                if (['', 'Planning', 'Skipping'].indexOf(cell.getRow().getData().status) > -1) {
                                    return;
                                }

                                cell.edit(true);
                            });

                            span2.classList.add('add');
                            span2.tabIndex = 0;
                            span2.title = '+1';
                            span2.style.display = 'inline-flex';
                            span2.style.marginLeft = '2.125px';
                            span2.innerHTML = '<svg viewBox="0 0 24 24" height="17" width="17"><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"></path></svg>';

                            span2.addEventListener('dblclick', () => {
                                getSelection().removeAllRanges();
                            });

                            span2.addEventListener('click', () => {
                                if (error) {
                                    return;
                                }

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
                                    d2.onsuccess = () => resolve();
                                }).then(() => {
                                    db2().get(cell.getRow().getData().sources).onsuccess = (event) => {
                                        const result = event.target.result;
                                        result.progress++;

                                        if (result.progress > 9999) {
                                            return;
                                        }

                                        db2().put(result).onsuccess = () => {
                                            let value = cell.getValue();

                                            channelMessage();
                                            value++;

                                            cell.getRow().update({
                                                progress: value
                                            });

                                            if (!cell.getRow().getData().episodes) {
                                                return;
                                            }

                                            cell.getRow().getElement().dataset.progress = value;
                                            cell.getRow().getCell('alternative').getElement().querySelector('.indicator').style.width = `${value / cell.getRow().getData().episodes * 100}%`;
                                            cell.getElement().querySelector('span:not(.add)').title = `${Math.round(value / cell.getRow().getData().episodes * 100)}%`;

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
                                                    };
                                                };
                                            } else {
                                                if (['Completed', 'Rewatching', 'Watching'].indexOf(cell.getRow().getData().status) > -1) {
                                                    return;
                                                }

                                                db2().get(cell.getRow().getData().sources).onsuccess = (event2) => {
                                                    const result2 = event2.target.result;
                                                    result2.status = 'Watching';

                                                    db2().put(result2).onsuccess = () => {
                                                        cell.getRow().update({
                                                            status: 'Watching'
                                                        });
                                                    };
                                                };
                                            }
                                        };
                                    };
                                });
                            });

                            a.href = `./?query=${escape(encodeURIComponent(v))}`;
                            a.title = 'Mismatched';
                            a.style.display = 'inline-flex';
                            a.style.alignItems = 'center';
                            a.style.marginLeft = '2.125px';
                            a.innerHTML = '<svg viewBox="0 0 24 24" height="17" width="17"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"></path></svg>';

                            a.addEventListener('click', (e) => {
                                e.preventDefault();

                                document.querySelector('.search').value = v;
                                searchFunction(cell.getTable());
                            });

                            fragment.appendChild(span);

                            if (['Dropped', 'Paused', 'Rewatching', 'Watching'].indexOf(cell.getRow().getData().status) > -1) {
                                fragment.appendChild(span2);
                            }

                            if (cell.getRow().getData().status === 'Completed' && Number(cell.getRow().getData().progress) !== Number(cell.getRow().getData().episodes)) {
                                fragment.appendChild(a);
                            }

                            return fragment;
                        },
                        headerClick: function (e, column) {
                            customSort(e, column);
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
                                        channelMessage();

                                        if (select.value === 'Completed' && cell.getRow().getData().episodes) {
                                            cell.getRow().update({
                                                progress: cell.getRow().getData().episodes,
                                                status: select.value
                                            });

                                            return;
                                        }

                                        if (select.value === 'Planning' || select.value === 'Skipping') {
                                            cell.getRow().update({
                                                progress: '',
                                                status: select.value
                                            });

                                            return;
                                        }

                                        cell.getRow().update({
                                            progress: '0',
                                            status: select.value
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
                                                channelMessage();

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

                                                    return;
                                                }

                                                if (select.value === 'Planning' || select.value === 'Skipping') {
                                                    cell.getRow().getElement().dataset.progress = '';

                                                    cell.getRow().update({
                                                        progress: '',
                                                        status: select.value
                                                    });

                                                    return;
                                                }

                                                if (status2 === 'Planning' || status2 === 'Skipping') {
                                                    cell.getRow().update({
                                                        progress: '0',
                                                        status: select.value
                                                    });

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
                                            };
                                        };
                                    };
                                } else {
                                    db2().delete(cell.getRow().getData().sources).onsuccess = () => {
                                        cell.getRow().getElement().dataset.progress = '';

                                        cell.getRow().update({
                                            progress: '',
                                            status: ''
                                        });

                                        channelMessage();
                                    };
                                }
                            });

                            return select;
                        },
                        headerClick: function (e, column) {
                            customSort(e, column);
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
                    sorted.ss = false;
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

                    if (this.getSelectedRows().length > selected.ss.length) {
                        document.querySelector('.selected-count').innerHTML = `${this.getSelectedRows().length} selected (${selected.ss.length} active)`;
                    } else {
                        document.querySelector('.selected-count').innerHTML = `${this.getSelectedRows().length} selected`;
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
                            `<div class="nothing">${
                                index.error
                                    ? 'Invalid regular expression'
                                    : 'Nothing found'
                            }</div>`
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

                    document.querySelector('.loading').remove();
                    document.querySelector('.top-container').style.display = 'inline-flex';

                    searchFunction(this, null, true);
                },
                dataSorted: function (sorters) {
                    if (sorters.length) {
                        if (sorters[0].field === 'alternative') {
                            document.body.classList.add('alt-sorted');
                        } else {
                            document.body.classList.remove('alt-sorted');
                        }

                        return;
                    }

                    sorted.s = 'relevancy';
                    sorted.ss = false;

                    this.setSort([
                        {
                            column: 'relevancy',
                            dir: 'desc'
                        },
                        {
                            column: 'alternative',
                            dir: 'asc'
                        }
                    ]);
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
                            width = (row.getElement().dataset.progress || row.getData().progress) / row.getData().episodes * 100;
                            break;

                        default:
                            width = 0;
                            break;
                    }

                    row.getCell('alternative').getElement().querySelector('.indicator').style.width = `${width}%`;
                    row.getCell('progress').getElement().querySelector('span:not(.add)').title = `${Math.round(width)}%`;
                },
                sortOrderReverse: true,
                tableBuilt: function () {
                    document.querySelector('.tabulator-tableHolder').tabIndex = -1;

                    const columns = ['picture', 'picture2', 'alternative', 'type', 'episodes', 'season'];

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

            document.querySelector('.loading').innerHTML += '<span class="export2">Export personal list</span>';

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
    disableSelection,
    error,
    error2,
    r,
    selected,
    sorted,
    svg,
    t,
    title,
    years
};