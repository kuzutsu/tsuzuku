import {
    index,
    searchFunction
} from './index.js';

const
    database = [],
    database2 = {},
    db = indexedDB.open('tsuzuku', 1),
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
    r = null,
    s = null,
    statuses = '',
    t = null;

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

db.onsuccess = (event3) => {
    fetch('https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database.json')
        .then((response) => response.json())
        .then((data) => {
            const d = data.data;

            db2 = function () {
                return event3.target.result.transaction('tsuzuku', 'readwrite').objectStore('tsuzuku');
            };

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

                for (const value of d[i].sources.filter((sources) => sources.match(source))) {
                    const
                        anilist = d[i].sources.filter((sources) => sources.match(/anilist\.co/gu)),
                        kitsu = d[i].sources.filter((sources) => sources.match(/kitsu\.io/gu)),
                        ss = d[i].animeSeason.season,
                        tt = d[i].tags.map((tags) => tags.replace(/\s/gu, '_'));

                    if (d[i].sources.filter((sources) => sources.match(/myanimelist\.net/gu)).length) {
                        source2 = [
                            value,
                            kitsu[0] || '',
                            anilist[0] || ''
                        ];
                    } else if (d[i].sources.filter((sources) => sources.match(/kitsu\.io/gu)).length) {
                        source2 = [
                            '',
                            value,
                            anilist[0] || ''
                        ];
                    } else {
                        source2 = [
                            '',
                            '',
                            value
                        ];
                    }

                    if (ss === 'UNDEFINED') {
                        s = '';
                    } else {
                        s = `${ss.replace(ss.substr(1), ss.substr(1).toLowerCase())} `;
                    }

                    for (const value2 of tt) {
                        if (database2[value2]) {
                            database2[value2] += 1;
                        } else {
                            database2[value2] = 1;
                        }
                    }

                    database.push({
                        alternative: d[i].title,
                        episodes: d[i].episodes || '',
                        ongoing: d[i].status === 'CURRENTLY',
                        picture: d[i].picture,
                        progress: '',
                        r18: tt.indexOf('hentai') > -1,
                        relations: [
                            ...d[i].sources.filter((sources) => sources.match(source) && sources !== value),
                            ...d[i].relations.filter((relations) => relations.match(/anilist\.co|kitsu\.io|myanimelist\.net/gu))
                        ],
                        relevancy: 1,
                        season: s + (d[i].animeSeason.year || ''),
                        sources: value,
                        sources2: source2,
                        status: '',
                        synonyms: d[i].synonyms,
                        tags: tt,
                        title: d[i].title,
                        type: d[i].type
                    });
                }
            }

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

                                if (document.querySelector('.header-status')) {
                                    document.querySelector('.header-status').remove();
                                }

                                if (document.querySelector('.separator-selected')) {
                                    document.querySelectorAll('.separator-selected').forEach((element) => {
                                        element.remove();
                                    });
                                }

                                const hstatus = document.createElement('select');

                                hstatus.classList.add('header-status');
                                hstatus.title = 'Status';
                                hstatus.innerHTML = `<option selected disabled>Status</option>${statuses}`;
                                hstatus.addEventListener('change', () => {
                                    for (const value of cell.getTable().getSelectedRows()) {
                                        const p = value.getData().progress;

                                        if (hstatus.value) {
                                            const d2 = db2().add({
                                                episodes: value.getData().episodes,
                                                progress:
                                                    hstatus.value === 'Completed' && value.getData().episodes
                                                        ? value.getData().episodes
                                                        : hstatus.value === 'Planning' || hstatus.value === 'Skipping'
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

                                                    return;
                                                }

                                                if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                                    value.update({
                                                        progress: '',
                                                        status: hstatus.value
                                                    });

                                                    return;
                                                }

                                                value.update({
                                                    progress: '0',
                                                    status: hstatus.value
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

                                                            return;
                                                        }

                                                        if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                                            value.getElement().dataset.progress = '';

                                                            value.update({
                                                                progress: '',
                                                                status: hstatus.value
                                                            });

                                                            return;
                                                        }

                                                        if (status2 === 'Planning' || status2 === 'Skipping') {
                                                            value.update({
                                                                progress: '0',
                                                                status: hstatus.value
                                                            });

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
                                                    };
                                                };
                                            };
                                        } else {
                                            db2().delete(value.getData().sources).onsuccess = () => {
                                                value.update({
                                                    progress: '',
                                                    status: ''
                                                });
                                            };
                                        }
                                    }
                                });

                                document.querySelector('.close').insertAdjacentHTML('afterend', '<span class="separator-selected"></span>');
                                document.querySelector('header').insertAdjacentElement('beforeend', hstatus);

                                if (localStorage.getItem('theme') === 'dark') {
                                    document.head.querySelector('[name="theme-color"]').content = '#fff';
                                } else {
                                    document.head.querySelector('[name="theme-color"]').content = '#000';
                                }

                                if (selected.s) {
                                    cell.getColumn().getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.check;
                                } else {
                                    cell.getColumn().getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.indeterminate;
                                }
                            } else {
                                index.lastRow = null;

                                document.querySelector('header').classList.remove('header-selected');
                                document.querySelector('.header-status').remove();
                                document.querySelectorAll('.separator-selected').forEach((element) => {
                                    element.remove();
                                });

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

                                if (selected.s) {
                                    column.getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.check;
                                } else {
                                    column.getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
                                }

                                if (document.querySelector('.header-status')) {
                                    document.querySelector('.header-status').remove();
                                }

                                if (document.querySelector('.separator-selected')) {
                                    document.querySelectorAll('.separator-selected').forEach((element) => {
                                        element.remove();
                                    });
                                }

                                const hstatus = document.createElement('select');

                                hstatus.classList.add('header-status');
                                hstatus.title = 'Status';
                                hstatus.innerHTML = `<option selected disabled>Status</option>${statuses}`;
                                hstatus.addEventListener('change', () => {
                                    for (const value of column.getTable().getSelectedRows()) {
                                        const p = value.getData().progress;

                                        if (hstatus.value) {
                                            const d2 = db2().add({
                                                episodes: value.getData().episodes,
                                                progress:
                                                    hstatus.value === 'Completed' && value.getData().episodes
                                                        ? value.getData().episodes
                                                        : hstatus.value === 'Planning' || hstatus.value === 'Skipping'
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

                                                    return;
                                                }

                                                if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                                    value.update({
                                                        progress: '',
                                                        status: hstatus.value
                                                    });

                                                    return;
                                                }

                                                value.update({
                                                    progress: '0',
                                                    status: hstatus.value
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

                                                            return;
                                                        }

                                                        if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                                            value.getElement().dataset.progress = '';

                                                            value.update({
                                                                progress: '',
                                                                status: hstatus.value
                                                            });

                                                            return;
                                                        }

                                                        if (status2 === 'Planning' || status2 === 'Skipping') {
                                                            value.update({
                                                                progress: '0',
                                                                status: hstatus.value
                                                            });

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
                                                    };
                                                };
                                            };
                                        } else {
                                            db2().delete(value.getData().sources).onsuccess = () => {
                                                value.update({
                                                    progress: '',
                                                    status: ''
                                                });
                                            };
                                        }
                                    }
                                });

                                document.querySelector('.close').insertAdjacentHTML('afterend', '<span class="separator-selected"></span>');
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
                                document.querySelectorAll('.separator-selected').forEach((element) => {
                                    element.remove();
                                });

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
                        width: 40
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
                        titleFormatter: function () {
                            return `<svg viewBox="0 0 24 24" width="17" height="17">${svg.earth}</svg>`;
                        },
                        vertAlign: 'middle',
                        width: 55
                    },
                    {
                        field: 'sources2',
                        formatter: function (cell) {
                            let sources = '';

                            if (cell.getValue()[0]) {
                                sources += `<a href="${cell.getValue()[0]}" target="_blank" rel="noreferrer" title="MyAnimeList" style="background: url(./images/myanimelist.png); background-size: contain; height: 17px; width: 17px;"></a>`;
                            } else {
                                sources += '<span style="height: 17px; width: 17px;"></span>';
                            }

                            sources += '<span class="separator "></span>';

                            if (cell.getValue()[1]) {
                                sources += `<a href="${cell.getValue()[1]}" target="_blank" rel="noreferrer" title="Kitsu" style="background: url(./images/kitsu.png); background-size: contain; height: 17px; width: 17px;"></a>`;
                            } else {
                                sources += '<span style="height: 17px; width: 17px;"></span>';
                            }

                            sources += '<span class="separator"></span>';

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
                        title: 'Source',
                        vertAlign: 'middle',
                        visible: false,
                        width: 127
                    },
                    {
                        field: 'alternative',
                        formatter: function (cell) {
                            let r18 = '';

                            if (cell.getRow().getData().r18) {
                                r18 = '&nbsp;<span style="color: #f44336;">R18+</span>';
                            }

                            return `<span>${cell.getValue() + r18}</span><div class="indicator" style="position: absolute; bottom: 0; height: 2px; max-width: 100%;"></div>`;
                        },
                        minWidth: 200,
                        title: 'Title',
                        vertAlign: 'middle'
                    },
                    {
                        field: 'type',
                        headerHozAlign: 'center',
                        hozAlign: 'center',
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
                                span = document.createElement('span'),
                                value = cell.getValue();

                            span.tabIndex = 0;
                            span.innerHTML = cell.getValue();
                            span.addEventListener('click', () => {
                                if (value) {
                                    if (value.indexOf(' ') > -1) {
                                        const split = value.split(' ');

                                        document.querySelector('.search').value = `season:${split[0].toLowerCase()} year:${split[1]}`;
                                    } else {
                                        document.querySelector('.search').value = `season:tba year:${value}`;
                                    }
                                } else {
                                    document.querySelector('.search').value = 'year:tba';
                                }

                                searchFunction(cell.getTable());
                            });

                            return span;
                        },
                        headerHozAlign: 'center',
                        hozAlign: 'center',
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

                            const span = document.createElement('span');

                            span.tabIndex = 0;
                            span.title = 'Ongoing';
                            span.style.lineHeight = 0;
                            span.innerHTML = `<svg viewBox="3 2 20 20" width="17" height="17">${svg.play}</svg>`;
                            span.addEventListener('click', () => {
                                document.querySelector('.search').value = 'is:ongoing';

                                searchFunction(cell.getTable());
                            });

                            return span;
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
                                                };
                                            };
                                        }
                                    };
                                };
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

                            span.innerHTML = `${cell.getValue()}&nbsp;`;
                            span.addEventListener('click', () => {
                                if (['', 'Planning', 'Skipping'].indexOf(cell.getRow().getData().status) > -1) {
                                    return;
                                }

                                cell.edit(true);
                            });

                            span2.classList.add('add');
                            span2.tabIndex = 0;
                            span2.style.display = 'inline-flex';
                            span2.innerHTML = '<svg viewBox="0 0 24 24" height="17" width="17"><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"></path></svg>';
                            span2.addEventListener('click', () => {
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
                                                };
                                            };
                                        }
                                    };
                                };
                            });

                            fragment.appendChild(span);

                            if (['Dropped', 'Paused', 'Rewatching', 'Watching'].indexOf(cell.getRow().getData().status) > -1) {
                                fragment.appendChild(span2);
                            }

                            return fragment;
                        },
                        headerHozAlign: 'center',
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

                            select.innerHTML = statuses;
                            select.value = cell.getValue();
                            select.title = 'Status';
                            select.addEventListener('change', () => {
                                const p = cell.getRow().getData().progress;

                                if (select.value) {
                                    const d2 = db2().add({
                                        episodes: cell.getRow().getData().episodes,
                                        progress:
                                            select.value === 'Completed' && cell.getRow().getData().episodes
                                                ? cell.getRow().getData().episodes
                                                : select.value === 'Planning' || select.value === 'Skipping'
                                                    ? ''
                                                    : '0',
                                        season: cell.getRow().getData().season,
                                        source: cell.getRow().getData().sources,
                                        status: select.value,
                                        title: cell.getRow().getData().title,
                                        type: cell.getRow().getData().type
                                    });

                                    d2.onsuccess = () => {
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
                                        cell.getRow().update({
                                            progress: '',
                                            status: ''
                                        });
                                    };
                                }
                            });

                            return select;
                        },
                        headerHozAlign: 'center',
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

                    if (document.querySelector('.progress')) {
                        document.querySelector('.progress').remove();
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

                    this.redraw(true);
                },
                dataLoaded: function () {
                    document.querySelector('.tabulator').style.display = 'none';
                    document.querySelector('.loading').innerHTML = 'Loading personal list...';

                    if (new URLSearchParams(location.search).get('query')) {
                        const value = decodeURIComponent(new URLSearchParams(location.search).get('query'));

                        document.querySelector('.search').value = value;
                        document.querySelector('.clear').style.display = 'inline-flex';
                        document.querySelector('.clear-separator').style.display = '';

                        if (!document.querySelector(`[data-query="${value}"]`)) {
                            document.querySelector('.default').style.display = 'contents';
                            document.querySelector('.tabs').style.display = 'none';
                            document.querySelector('.enter svg').style.fill = '';
                        }
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
                        document.querySelector('[for="number"]').style.color = '#aaa';
                        document.querySelector('#number').setAttribute('disabled', '');
                    }

                    db2().openCursor().onsuccess = (event) => {
                        const cursor = event.target.result;

                        if (cursor) {
                            this.searchRows((d2) => d2.sources2.indexOf(cursor.key) > -1)[0].update({
                                progress: cursor.value.progress,
                                status: cursor.value.status
                            });

                            cursor.continue();
                        } else {
                            document.querySelector('.loading').remove();
                            document.querySelector('.search-container').style.display = 'inline-flex';
                            searchFunction(this);
                        }
                    };
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
                    document.querySelector('.tabulator-tableHolder').removeAttribute('tabindex');

                    for (const value of ['picture', 'sources', 'sources2', 'alternative', 'type', 'episodes', 'season', 'progress', 'status']) {
                        document.querySelector(`.tabulator-col[tabulator-field="${value}"]`).tabIndex = 0;
                    }
                }
            });
        });
};

export {
    db2,
    params,
    r,
    selected,
    svg,
    t,
    title
};