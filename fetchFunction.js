import {
    dimension,
    searchFunction
} from './index.js';

let r = null,
    s = null,
    t = null,
    title = document.title,
    params = {
        random: false,
        randomValue: 1,
        regex: false
    };

fetch('https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database.json')
    .then(response => response.json())
    .then(data => {
        const d = data.data;
        
        let database = [],
            lastRow = false;

        for (var i = 0; i < d.length; i++) {
            var m = d[i].sources.filter(s => s.match(/kitsu\.io|myanimelist\.net/g)),
                source = null;

            if (m.length) {
                switch (d[i].animeSeason.season) {
                    case 'FALL':
                        s = 'Fall ';
                        break;
                    case 'SPRING':
                        s = 'Spring ';
                        break;
                    case 'SUMMER':
                        s = 'Summer ';
                        break;
                    case 'WINTER':
                        s = 'Winter ';
                        break;
                    default:
                        s = '';
                        break;
                }

                if (d[i].sources.filter(s => s.match(/myanimelist\.net/g)).length) {
                    source = /myanimelist\.net/g;
                } else {
                    source = /kitsu\.io/g;
                }

                for (const value of d[i].sources.filter(s => s.match(source))) {
                    database.push({
                        alternative: d[i].title,
                        episodes: d[i].episodes || '',
                        picture: d[i].picture.match(/myanimelist\.net/g) ? d[i].picture.replace(d[i].picture.substr(d[i].picture.lastIndexOf('.')), '.webp') : d[i].picture,
                        relevancy: 1,
                        score: '',
                        season: s + (d[i].animeSeason.year || ''),
                        sources: value,
                        status: '',
                        synonyms: d[i].synonyms,
                        tags: d[i].tags.map((t) => t.replace(/\s/g, '_')),
                        title: d[i].title,
                        type: d[i].type
                    });
                }
            }
        }

        document.querySelector('#loading').remove();
        document.querySelector('#search-container').style.display = 'flex';
        document.querySelector('#search').focus();

        t = new Tabulator('#database-container', {
            data: database,
            layout: 'fitColumns',
            sortOrderReverse: true,
            resizableColumns: false,
            dataLoaded: function () {
                if (new URLSearchParams(location.search).get('query')) {
                    document.querySelector('#search').value = decodeURIComponent(new URLSearchParams(location.search).get('query'));
                    document.querySelector('#clear').style.visibility = 'visible';
                    document.querySelector('#clear').style.display = 'inline-flex';
                }

                if (new URLSearchParams(location.search).get('regex') === '1') {
                    params.regex = true;
                    document.querySelector('#regex svg').classList.remove('disabled');
                }

                if (Math.round(Math.abs(Number(new URLSearchParams(location.search).get('random')))) > 0) {
                    params.random = true;
                    document.querySelector('#random svg').classList.remove('disabled');
                    document.querySelector('#number').removeAttribute('disabled');
                    document.querySelector('#number').value = Math.round(Math.abs(Number(new URLSearchParams(location.search).get('random'))));
                    params.randomValue = document.querySelector('#number').value;
                }

                searchFunction(this);
            },
            dataLoading: function () {
                document.head.insertAdjacentHTML('beforeend',
                    '<style>' +
                        '@import url(https://cdn.jsdelivr.net/npm/tabulator-tables/dist/css/tabulator_simple.min.css);' +
                    '</style>'
                );
            },
            dataFiltered: function (filters, rows) {
                if (dimension) {
                    r = rows;

                    for (const value of rows) {
                        value.update({
                            relevancy: dimension[dimension.findIndex((i) => i.source === value.getData().sources)].relevancy,
                            alternative: dimension[dimension.findIndex((i) => i.source === value.getData().sources)].alternative
                        });
                    }
                }

                if (document.querySelector('#progress')) {
                    document.querySelector('#progress').remove();
                }

                if (document.querySelector('#searching')) {
                    document.querySelector('#searching').remove();
                }

                document.querySelector('.tabulator-tableHolder').style.display = '';
            },
            initialSort: [
                {
                    column: 'relevancy',
                    dir: 'desc'
                },
                {
                    column: 'alternative',
                    dir: 'asc'
                }
            ],
            rowFormatter: function (row) {
                row.getElement().dataset.status = row.getData().status;
            },
            headerSortElement:
                '<svg viewBox="0 0 24 24" width="17" height="17">' +
                    '<path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"></path>' +
                '</svg>',
            columns: [
                {
                    field: 'color',
                    headerSort: false,
                    minWidth: 8,
                    width: 8
                },
                {
                    titleFormatter: function () {
                        return (
                            '<svg viewBox="0 0 24 24" width="17" height="17">' +
                                '<path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>' +
                            '</svg>'
                        );
                    },
                    field: 'picture',
                    headerHozAlign: 'center',
                    hozAlign: 'center',
                    vertAlign: 'middle',
                    headerSort: false,
                    width: 50,
                    formatter: function (cell) {
                        return (
                            '<svg viewBox="0 0 24 24" width="17" height="17">' +
                                '<path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>' +
                            '</svg>' +
                            '<img src="' + cell.getValue() + '" loading="lazy" style="height: 40px; width: 40px; object-fit: cover; user-select: none;">'
                        );
                    },
                    headerClick: function (e, column) {
                        if (!column.getTable().getSelectedRows().length) {
                            column.getTable().selectRow('active');

                            if (!column.getTable().getSelectedRows().length) {
                                return;
                            }

                            document.querySelector('header').classList.add('header-tabulator-selected');

                            if (column.getTable().getSelectedRows().length === column.getTable().getRows().length) {
                                column._column.titleElement.children[0].innerHTML = '<path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>';
                            } else {
                                column._column.titleElement.children[0].innerHTML = '<path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1 0.9 2 2 2h14c1.1 0 2-0.9 2-2V5C21 3.9 20.1 3 19 3z M17 13H7v-2h10V13z"></path>';
                            }

                            document.querySelector('#header-title').innerHTML = column.getTable().getSelectedRows().length + ' selected';
                            document.querySelector('#header-version').style.display = 'none';
                            document.head.querySelector('[name="theme-color"]').content = '#769bcc';
                        } else {
                            document.querySelector('header').classList.remove('header-tabulator-selected');
                            column._column.titleElement.children[0].innerHTML = '<path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>';
                            column.getTable().deselectRow();
                            document.querySelector('#header-title').innerHTML = 'Tsuzuku';
                            document.querySelector('#header-version').style.display = 'block';

                            if (localStorage.getItem('theme') === 'dark') {
                                document.head.querySelector('[name="theme-color"]').content = '#000';
                            } else {
                                document.head.querySelector('[name="theme-color"]').content = '#fff';
                            }
                        }
                    },
                    cellClick: function (e, cell) {
                        getSelection().removeAllRanges();
                        cell.getRow().toggleSelect();

                        if (e.shiftKey) {
                            if (!lastRow) {
                                lastRow = cell.getRow();

                                cell.getColumn()._column.titleElement.children[0].innerHTML = '<path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1 0.9 2 2 2h14c1.1 0 2-0.9 2-2V5C21 3.9 20.1 3 19 3z M17 13H7v-2h10V13z"></path>';
                                return;
                            }

                            let position = cell.getRow().getPosition(true),
                                lastPosition = lastRow.getPosition(true);

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

                        lastRow = cell.getRow();

                        if (!cell.getTable().getSelectedRows().length) {
                            document.querySelector('header').classList.remove('header-tabulator-selected');
                            document.querySelector('#header-title').innerHTML = 'Tsuzuku';
                            document.querySelector('#header-version').style.display = 'block';
                            cell.getColumn()._column.titleElement.children[0].innerHTML = '<path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>';

                            if (localStorage.getItem('theme') === 'dark') {
                                document.head.querySelector('[name="theme-color"]').content = '#000';
                            } else {
                                document.head.querySelector('[name="theme-color"]').content = '#fff';
                            }
                        } else {
                            document.querySelector('header').classList.add('header-tabulator-selected');
                            document.querySelector('#header-title').innerHTML = cell.getTable().getSelectedRows().length + ' selected';
                            document.querySelector('#header-version').style.display = 'none';
                            document.head.querySelector('[name="theme-color"]').content = '#769bcc';

                            if (cell.getTable().getSelectedRows().length === cell.getTable().getRows().length) {
                                cell.getColumn()._column.titleElement.children[0].innerHTML = '<path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>';
                            } else {
                                cell.getColumn()._column.titleElement.children[0].innerHTML = '<path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1 0.9 2 2 2h14c1.1 0 2-0.9 2-2V5C21 3.9 20.1 3 19 3z M17 13H7v-2h10V13z"></path>';
                            }
                        }
                    }
                },
                {
                    titleFormatter: function () {
                        return (
                            '<svg viewBox="0 0 24 24" width="17" height="17">' +
                                '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path>' +
                            '</svg>'
                        );
                    },
                    field: 'sources',
                    headerHozAlign: 'center',
                    hozAlign: 'center',
                    vertAlign: 'middle',
                    headerSort: false,
                    width: 50,
                    formatter: function (cell) {
                        let sources = '<img src="';

                        if (cell.getValue().match(/myanimelist\.net/g)) {
                            sources += 'https://myanimelist.net/img/common/pwa/launcher-icon-4x.png';
                        } else {
                            sources += 'https://kitsu.io/favicon-194x194-2f4dbec5ffe82b8f61a3c6d28a77bc6e.png';
                        }

                        return sources + '" loading="lazy" style="user-select: none; height: 17px; width: 17px;">';
                    }
                },
                {
                    title: 'Title',
                    vertAlign: 'middle',
                    field: 'alternative',
                    minWidth: 100,
                    formatter: function (cell) {
                        return '<a href="' + cell.getRow().getData().sources + '" target="_blank" rel="noreferrer">' + cell.getValue() + '</a>';
                    }
                },
                {
                    title: 'Type',
                    headerHozAlign: 'center',
                    hozAlign: 'center',
                    vertAlign: 'middle',
                    field: 'type',
                    width: 100
                },
                {
                    title: 'Episodes',
                    headerHozAlign: 'center',
                    hozAlign: 'center',
                    vertAlign: 'middle',
                    field: 'episodes',
                    width: 100,
                    sorterParams: {
                        alignEmptyValues: 'bottom'
                    }
                },
                {
                    title: 'Season',
                    headerHozAlign: 'center',
                    hozAlign: 'center',
                    vertAlign: 'middle',
                    field: 'season',
                    width: 100,
                    sorterParams: {
                        alignEmptyValues: 'bottom'
                    }
                },
                {
                    title: 'Score',
                    headerHozAlign: 'center',
                    hozAlign: 'center',
                    vertAlign: 'middle',
                    field: 'score',
                    width: 100,
                    sorterParams: {
                        alignEmptyValues: 'bottom'
                    },
                    editor: 'select',
                    editorParams: {
                        values: [
                            '',
                            1,
                            2,
                            3,
                            4,
                            5,
                            6,
                            7,
                            8,
                            9,
                            10
                        ]
                    }
                },
                {
                    title: 'Status',
                    headerHozAlign: 'center',
                    hozAlign: 'center',
                    vertAlign: 'middle',
                    field: 'status',
                    width: 100,
                    sorterParams: {
                        alignEmptyValues: 'bottom'
                    },
                    editor: 'select',
                    editorParams: {
                        values: [
                            '',
                            'Watching',
                            'Rewatching',
                            'Completed',
                            'Paused',
                            'Dropped',
                            'Planning'
                        ]
                    },
                    cellEdited: function (cell) {
                        cell.getRow().getElement().dataset.status = cell.getValue();
                    }
                },
                {
                    title: 'Relevancy',
                    field: 'relevancy',
                    headerHozAlign: 'center',
                    hozAlign: 'center',
                    vertAlign: 'middle',
                    width: 100,
                    formatter: function (cell) {
                        return Number(cell.getValue() * 100).toFixed(1) + '%';
                    }
                }
            ]
        });
    });

export {
    r,
    t,
    title,
    params
};