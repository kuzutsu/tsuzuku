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
    status = ['', 'Completed', 'Dropped', 'Paused', 'Planning', 'Rewatching', 'Watching'],
    svg = {
        arrow: '<path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"></path>',
        blank: '<path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>',
        check: '<path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>',
        globe: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path>',
        indeterminate: '<path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1 0.9 2 2 2h14c1.1 0 2-0.9 2-2V5C21 3.9 20.1 3 19 3z M17 13H7v-2h10V13z"></path>',
        picture: '<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"></path>',
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
                            anilist[0] || ''
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

            // disable edit module dependency
            Tabulator.prototype.registerModule('edit', function () {
                this.cancelEdit = function () {
                    // empty
                };

                this.currentCell = true;
            });

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

                                    while (prevRow.getPosition(true) > lastPosition) {
                                        prevRow.toggleSelect();
                                        prevRow = prevRow.getPrevRow();
                                    }
                                } else {
                                    let nextRow = cell.getRow().getNextRow();

                                    while (nextRow.getPosition(true) < lastPosition) {
                                        nextRow.toggleSelect();
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
                                document.querySelector('.header-title').innerHTML = `${cell.getTable().getSelectedRows().length} selected`;

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
                                        if (hstatus.value) {
                                            const d2 = db2().add({
                                                episodes: value._row.data.episodes,
                                                progress:
                                                    hstatus.value === 'Completed' && value._row.data.episodes
                                                        ? value._row.data.episodes
                                                        : '0',
                                                season: value._row.data.season,
                                                source: value._row.data.sources,
                                                status: hstatus.value,
                                                title: value._row.data.title,
                                                type: value._row.data.type
                                            });

                                            d2.onsuccess = () => {
                                                if (hstatus.value === 'Completed' && value._row.data.episodes) {
                                                    value.update({
                                                        progress: value._row.data.episodes,
                                                        status: hstatus.value
                                                    });
                                                } else {
                                                    value.update({
                                                        progress: '0',
                                                        status: hstatus.value
                                                    });
                                                }
                                            };

                                            d2.onerror = () => {
                                                db2().get(value._row.data.sources).onsuccess = (event) => {
                                                    const result = event.target.result;

                                                    if (hstatus.value === 'Completed' && value._row.data.episodes) {
                                                        result.progress = value._row.data.episodes;
                                                    }

                                                    result.status = hstatus.value;

                                                    db2().put(result).onsuccess = () => {
                                                        if (hstatus.value === 'Completed' && value._row.data.episodes) {
                                                            value.update({
                                                                progress: value._row.data.episodes,
                                                                status: hstatus.value
                                                            });
                                                        } else {
                                                            value.update({
                                                                status: hstatus.value
                                                            });
                                                        }
                                                    };
                                                };
                                            };
                                        } else {
                                            db2().delete(value._row.data.sources).onsuccess = () => {
                                                value.update({
                                                    progress: '',
                                                    status: ''
                                                });
                                            };
                                        }
                                    }
                                });

                                document.querySelector('.close').insertAdjacentHTML('afterend', '<span class="separator-selected"></span>');
                                document.querySelector('.header-container').insertAdjacentElement('beforeend', hstatus);

                                if (localStorage.getItem('theme') === 'dark') {
                                    document.head.querySelector('[name="theme-color"]').content = '#fff';
                                } else {
                                    document.head.querySelector('[name="theme-color"]').content = '#000';
                                }

                                if (selected.s) {
                                    cell.getColumn()._column.titleElement.children[0].innerHTML = svg.check;
                                } else {
                                    cell.getColumn()._column.titleElement.children[0].innerHTML = svg.indeterminate;
                                }
                            } else {
                                index.lastRow = null;

                                document.querySelector('header').classList.remove('header-selected');
                                document.querySelector('.header-title').innerHTML = 'Tsuzuku';
                                document.querySelector('.header-status').remove();
                                document.querySelectorAll('.separator-selected').forEach((element) => {
                                    element.remove();
                                });

                                cell.getColumn()._column.titleElement.children[0].innerHTML = svg.blank;

                                if (localStorage.getItem('theme') === 'dark') {
                                    document.head.querySelector('[name="theme-color"]').content = '#000';
                                } else {
                                    document.head.querySelector('[name="theme-color"]').content = '#fff';
                                }
                            }
                        },
                        field: 'picture',
                        formatter: function (cell) {
                            return (
                                `<svg viewBox="0 0 24 24" width="17" height="17">${svg.check}</svg>` +
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
                                document.querySelector('.header-title').innerHTML = `${column.getTable().getSelectedRows().length} selected`;

                                if (selected.s) {
                                    column._column.titleElement.children[0].innerHTML = svg.check;
                                } else {
                                    column._column.titleElement.children[0].innerHTML = svg.blank;
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
                                        if (hstatus.value) {
                                            const d2 = db2().add({
                                                episodes: value._row.data.episodes,
                                                progress:
                                                    hstatus.value === 'Completed' && value._row.data.episodes
                                                        ? value._row.data.episodes
                                                        : '0',
                                                season: value._row.data.season,
                                                source: value._row.data.sources,
                                                status: hstatus.value,
                                                title: value._row.data.title,
                                                type: value._row.data.type
                                            });

                                            d2.onsuccess = () => {
                                                if (hstatus.value === 'Completed' && value._row.data.episodes) {
                                                    value.update({
                                                        progress: value._row.data.episodes,
                                                        status: hstatus.value
                                                    });
                                                } else {
                                                    value.update({
                                                        progress: '0',
                                                        status: hstatus.value
                                                    });
                                                }
                                            };

                                            d2.onerror = () => {
                                                db2().get(value._row.data.sources).onsuccess = (event) => {
                                                    const result = event.target.result;

                                                    if (hstatus.value === 'Completed' && value._row.data.episodes) {
                                                        result.progress = value._row.data.episodes;
                                                    }

                                                    result.status = hstatus.value;

                                                    db2().put(result).onsuccess = () => {
                                                        if (hstatus.value === 'Completed' && value._row.data.episodes) {
                                                            value.update({
                                                                progress: value._row.data.episodes,
                                                                status: hstatus.value
                                                            });
                                                        } else {
                                                            value.update({
                                                                status: hstatus.value
                                                            });
                                                        }
                                                    };
                                                };
                                            };
                                        } else {
                                            db2().delete(value._row.data.sources).onsuccess = () => {
                                                value.update({
                                                    progress: '',
                                                    status: ''
                                                });
                                            };
                                        }
                                    }
                                });

                                document.querySelector('.close').insertAdjacentHTML('afterend', '<span class="separator-selected"></span>');
                                document.querySelector('.header-container').insertAdjacentElement('beforeend', hstatus);

                                if (localStorage.getItem('theme') === 'dark') {
                                    document.head.querySelector('[name="theme-color"]').content = '#fff';
                                } else {
                                    document.head.querySelector('[name="theme-color"]').content = '#000';
                                }
                            } else {
                                document.querySelector('header').classList.remove('header-selected');
                                column._column.titleElement.children[0].innerHTML = svg.blank;
                                document.querySelector('.header-title').innerHTML = 'Tsuzuku';
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
                            column.getTable().redraw();
                        },
                        headerHozAlign: 'center',
                        headerSort: false,
                        hozAlign: 'center',
                        titleFormatter: function () {
                            return `<svg viewBox="0 0 24 24" width="17" height="17">${svg.globe}</svg>`;
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
                            column.getTable().redraw();
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
                            return `<span>${cell.getValue()}</span><div class="indicator" style="position: absolute; bottom: 0; height: 2px; max-width: 100%;"></div>`;
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
                        cellClick: function (e, cell) {
                            const value = cell.getValue();

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
                        },
                        field: 'season',
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
                        field: 'progress',
                        formatter: function (cell) {
                            const input = document.createElement('input');

                            input.type = 'number';
                            input.disabled = true;
                            input.min = 0;
                            input.max = cell.getRow().getData().episodes;
                            input.autocomplete = 'off';
                            input.value = cell.getValue();
                            input.title = 'Progress';

                            input.addEventListener('input', () => {
                                if (!cell.getRow().getData().episodes) {
                                    return;
                                }

                                cell.getRow().getCell('alternative').getElement().querySelector('.indicator').style.width = `${input.value / cell.getRow().getData().episodes * 100}%`;

                                if (input.value < cell.getRow().getData().episodes) {
                                    if (cell.getRow().getData().status === 'Rewatching' || cell.getRow().getData().status === 'Watching') {
                                        return;
                                    }

                                    db2().get(cell.getRow().getData().sources).onsuccess = (event) => {
                                        const result = event.target.result;
                                        result.status = 'Watching';
                                        db2().put(result).onsuccess = () => {
                                            cell.getRow().update({
                                                status: 'Watching'
                                            });
                                        };
                                    };
                                } else {
                                    if (cell.getRow().getData().status === 'Completed') {
                                        return;
                                    }

                                    db2().get(cell.getRow().getData().sources).onsuccess = (event) => {
                                        const result = event.target.result;
                                        result.status = 'Completed';
                                        db2().put(result).onsuccess = () => {
                                            cell.getRow().update({
                                                status: 'Completed'
                                            });
                                        };
                                    };
                                }
                            });

                            // chromium bug when using change to cell.getRow().update(progress)
                            input.addEventListener('blur', () => {
                                db2().get(cell.getRow().getData().sources).onsuccess = (event) => {
                                    const result = event.target.result;
                                    result.progress = input.value;
                                    db2().put(result).onsuccess = () => {
                                        cell.getRow().update({
                                            progress: input.value
                                        });
                                    };
                                };
                            });

                            input.addEventListener('keyup', (e) => {
                                if (e.key !== 'Enter') {
                                    return;
                                }

                                e.target.blur();
                            });

                            return input;
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
                                if (select.value) {
                                    const d2 = db2().add({
                                        episodes: cell.getRow().getData().episodes,
                                        progress:
                                            select.value === 'Completed' && cell.getRow().getData().episodes
                                                ? cell.getRow().getData().episodes
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
                                        } else {
                                            cell.getRow().update({
                                                progress: '0',
                                                status: select.value
                                            });
                                        }
                                    };

                                    d2.onerror = () => {
                                        db2().get(cell.getRow().getData().sources).onsuccess = (event) => {
                                            const result = event.target.result;

                                            if (select.value === 'Completed' && cell.getRow().getData().episodes) {
                                                result.progress = cell.getRow().getData().episodes;
                                            }

                                            result.status = select.value;

                                            db2().put(result).onsuccess = () => {
                                                if (select.value === 'Completed' && cell.getRow().getData().episodes) {
                                                    cell.getRow().update({
                                                        progress: cell.getRow().getData().episodes,
                                                        status: select.value
                                                    });
                                                } else {
                                                    cell.getRow().update({
                                                        status: select.value
                                                    });
                                                }
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
                        cellClick: function (e, cell) {
                            if (!cell.getValue()) {
                                return;
                            }

                            document.querySelector('.search').value = 'is:ongoing';

                            searchFunction(cell.getTable());
                        },
                        field: 'ongoing',
                        formatter: function (cell) {
                            if (!cell.getValue()) {
                                return '';
                            }

                            return (
                                '<span title="Ongoing" style="line-height: 0;">' +
                                    `<svg viewBox="3 2 20 20" width="17" height="17">${svg.play}</svg>` +
                                '</span>'
                            );
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
                        this.getColumn('picture')._column.titleElement.children[0].innerHTML = svg.check;
                    } else {
                        if (selected.ss.length) {
                            this.getColumn('picture')._column.titleElement.children[0].innerHTML = svg.indeterminate;
                        } else {
                            this.getColumn('picture')._column.titleElement.children[0].innerHTML = svg.blank;
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

                    this.redraw();
                },
                dataLoaded: function () {
                    document.querySelector('.tabulator').style.display = 'none';
                    document.querySelector('.loading').innerHTML = 'Loading personal list...';

                    if (new URLSearchParams(location.search).get('query')) {
                        const value = decodeURIComponent(new URLSearchParams(location.search).get('query'));

                        document.querySelector('.search').value = value;
                        document.querySelector('.clear').style.visibility = 'visible';
                        document.querySelector('.clear').style.display = 'inline-flex';

                        if (!document.querySelector(`[data-query="${value}"]`)) {
                            document.querySelector('.default').style.display = 'contents';
                            document.querySelector('.tabs').style.display = 'none';
                            document.querySelector('.enter svg').style.fill = '';
                        }
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
                            this.searchRows('sources', '=', cursor.key)[0].update({
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

                    this.redraw();
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
                    if (row.getData().status) {
                        row.getCell('progress').getElement().querySelector('input').disabled = false;
                    } else {
                        row.getCell('progress').getElement().querySelector('input').disabled = true;
                    }

                    row.getElement().dataset.status = row.getData().status;

                    switch (row.getData().status) {
                        case 'Completed':
                        case 'Dropped':
                        case 'Paused':
                        case 'Rewatching':
                        case 'Watching':
                            row.getCell('alternative').getElement().querySelector('.indicator').style.width = `${row.getCell('progress').getElement().querySelector('input').value / row.getData().episodes * 100}%`;
                            break;

                        default:
                            row.getCell('alternative').getElement().querySelector('.indicator').style.width = '0%';
                            break;
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