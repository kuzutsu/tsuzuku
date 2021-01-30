import {
    dimension,
    searchFunction
} from './index.js';

const
    database = [],
    params = {
        alt: true,
        random: false,
        randomValue: 1,
        regex: false
    },
    score = ['', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    status = ['', 'Completed', 'Dropped', 'Paused', 'Planning', 'Rewatching', 'Watching'],
    title = document.title;

let lastRow = false,
    r = null,
    s = null,
    scores = '',
    statuses = '',
    t = null;

for (let i = 0; i < score.length; i++) {
    scores += `<option>${score[i]}</option>`;
}

for (let ii = 0; ii < status.length; ii++) {
    statuses += `<option>${status[ii]}</option>`;
}

fetch('https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database.json')
    .then((response) => response.json())
    .then((data) => {
        const d = data.data;

        for (let i = 0; i < d.length; i++) {
            const m = d[i].sources.filter((sources) => sources.match(/kitsu\.io|myanimelist\.net/gu));
            let source = null;

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

                if (d[i].sources.filter((sources) => sources.match(/myanimelist\.net/gu)).length) {
                    source = /myanimelist\.net/gu;
                } else {
                    source = /kitsu\.io/gu;
                }

                for (const value of d[i].sources.filter((sources) => sources.match(source))) {
                    database.push({
                        airing: d[i].status === 'CURRENTLY',
                        alternative: d[i].title,
                        episodes: d[i].episodes || '',
                        picture:
                            d[i].picture.match(/myanimelist\.net/gu)
                                ? d[i].picture.replace(d[i].picture.substr(d[i].picture.lastIndexOf('.')), '.webp')
                                : d[i].picture,
                        relevancy: 1,
                        score: '',
                        season: s + (d[i].animeSeason.year || ''),
                        sources: value,
                        status: '',
                        synonyms: d[i].synonyms,
                        tags: d[i].tags.map((tags) => tags.replace(/\s/gu, '_')),
                        title: d[i].title,
                        type: d[i].type
                    });
                }
            }
        }

        t = new Tabulator('#database-container', {
            columns: [
                {
                    field: 'color',
                    headerSort: false,
                    minWidth: 8,
                    width: 8
                },
                {
                    cellClick(e, cell) {
                        getSelection().removeAllRanges();
                        cell.getRow().toggleSelect();

                        if (e.shiftKey) {
                            if (!lastRow) {
                                lastRow = cell.getRow();

                                cell.getColumn()._column.titleElement.children[0].innerHTML = '<path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1 0.9 2 2 2h14c1.1 0 2-0.9 2-2V5C21 3.9 20.1 3 19 3z M17 13H7v-2h10V13z"></path>';
                                return;
                            }

                            const
                                lastPosition = lastRow.getPosition(true),
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

                        lastRow = cell.getRow();

                        if (cell.getTable().getSelectedRows().length) {
                            document.querySelector('header').classList.add('header-tabulator-selected');
                            document.querySelector('#header-title').innerHTML = `${cell.getTable().getSelectedRows().length} selected`;

                            if (document.querySelector('#header-score')) {
                                document.querySelector('#header-score').remove();
                            }

                            if (document.querySelector('#header-status')) {
                                document.querySelector('#header-status').remove();
                            }

                            const
                                hscore = document.createElement('div'),
                                hstatus = document.createElement('div');

                            hscore.id = 'header-score';
                            hscore.innerHTML =
                                '<select>' +
                                    `<option selected disabled>Score</option>${scores}` +
                                '</select>';
                            hscore.addEventListener('change', (event) => {
                                for (const value of cell.getTable().getSelectedRows()) {
                                    value.update({
                                        score: event.target.value
                                    });
                                }
                            });

                            hstatus.id = 'header-status';
                            hstatus.style.padding = '0 19px 0 19px';
                            hstatus.innerHTML =
                                '<select>' +
                                    `<option selected disabled>Status</option>${statuses}` +
                                '</select>';
                            hstatus.addEventListener('change', (event) => {
                                for (const value of cell.getTable().getSelectedRows()) {
                                    value.update({
                                        status: event.target.value
                                    });
                                }
                            });

                            document.querySelector('header').insertAdjacentElement('beforeend', hscore);
                            document.querySelector('header').insertAdjacentElement('beforeend', hstatus);

                            if (localStorage.getItem('theme') === 'dark') {
                                document.head.querySelector('[name="theme-color"]').content = '#fff';
                            } else {
                                document.head.querySelector('[name="theme-color"]').content = '#000';
                            }

                            if (cell.getTable().getSelectedRows().length === cell.getTable().getRows().length) {
                                cell.getColumn()._column.titleElement.children[0].innerHTML = '<path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>';
                            } else {
                                cell.getColumn()._column.titleElement.children[0].innerHTML = '<path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1 0.9 2 2 2h14c1.1 0 2-0.9 2-2V5C21 3.9 20.1 3 19 3z M17 13H7v-2h10V13z"></path>';
                            }
                        } else {
                            document.querySelector('header').classList.remove('header-tabulator-selected');
                            document.querySelector('#header-title').innerHTML = 'Tsuzuku';
                            document.querySelector('#header-score').remove();
                            document.querySelector('#header-status').remove();

                            cell.getColumn()._column.titleElement.children[0].innerHTML = '<path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>';

                            if (localStorage.getItem('theme') === 'dark') {
                                document.head.querySelector('[name="theme-color"]').content = '#000';
                            } else {
                                document.head.querySelector('[name="theme-color"]').content = '#fff';
                            }
                        }
                    },
                    field: 'picture',
                    formatter(cell) {
                        return (
                            '<svg viewBox="0 0 24 24" width="17" height="17">' +
                                '<path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>' +
                            '</svg>' +
                            `<img src="${cell.getValue()}" loading="lazy" style="height: 40px; width: 40px; object-fit: cover; user-select: none;">`
                        );
                    },
                    headerClick(e, column) {
                        if (column.getTable().getSelectedRows().length) {
                            document.querySelector('header').classList.remove('header-tabulator-selected');
                            column._column.titleElement.children[0].innerHTML = '<path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>';
                            column.getTable().deselectRow();
                            document.querySelector('#header-title').innerHTML = 'Tsuzuku';
                            document.querySelector('#header-score').remove();
                            document.querySelector('#header-status').remove();

                            if (localStorage.getItem('theme') === 'dark') {
                                document.head.querySelector('[name="theme-color"]').content = '#000';
                            } else {
                                document.head.querySelector('[name="theme-color"]').content = '#fff';
                            }
                        } else {
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

                            document.querySelector('#header-title').innerHTML = `${column.getTable().getSelectedRows().length} selected`;

                            if (document.querySelector('#header-score')) {
                                document.querySelector('#header-score').remove();
                            }

                            if (document.querySelector('#header-status')) {
                                document.querySelector('#header-status').remove();
                            }

                            const
                                hscore = document.createElement('div'),
                                hstatus = document.createElement('div');

                            hscore.id = 'header-score';
                            hscore.innerHTML =
                                '<select>' +
                                    `<option selected disabled>Score</option>${scores}` +
                                '</select>';
                            hscore.addEventListener('change', (event) => {
                                for (const value of column.getTable().getSelectedRows()) {
                                    value.update({
                                        score: event.target.value
                                    });
                                }
                            });

                            hstatus.id = 'header-status';
                            hstatus.style.padding = '0 19px 0 19px';
                            hstatus.innerHTML =
                                '<select>' +
                                    `<option selected disabled>Status</option>${statuses}` +
                                '</select>';
                            hstatus.addEventListener('change', (event) => {
                                for (const value of column.getTable().getSelectedRows()) {
                                    value.update({
                                        status: event.target.value
                                    });
                                }
                            });

                            document.querySelector('header').insertAdjacentElement('beforeend', hscore);
                            document.querySelector('header').insertAdjacentElement('beforeend', hstatus);

                            if (localStorage.getItem('theme') === 'dark') {
                                document.head.querySelector('[name="theme-color"]').content = '#fff';
                            } else {
                                document.head.querySelector('[name="theme-color"]').content = '#000';
                            }
                        }
                    },
                    headerHozAlign: 'center',
                    headerSort: false,
                    hozAlign: 'center',
                    titleFormatter() {
                        return (
                            '<svg viewBox="0 0 24 24" width="17" height="17">' +
                                '<path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>' +
                            '</svg>'
                        );
                    },
                    vertAlign: 'middle',
                    width: 50
                },
                {
                    field: 'sources',
                    formatter(cell) {
                        let sources = '<img src="';

                        if (cell.getValue().match(/myanimelist\.net/gu)) {
                            sources += 'https://myanimelist.net/img/common/pwa/launcher-icon-4x.png';
                        } else {
                            sources += 'https://kitsu.io/favicon-194x194-2f4dbec5ffe82b8f61a3c6d28a77bc6e.png';
                        }

                        return `${sources}" loading="lazy" style="user-select: none; height: 17px; width: 17px;">`;
                    },
                    headerHozAlign: 'center',
                    headerSort: false,
                    hozAlign: 'center',
                    titleFormatter() {
                        return (
                            '<svg viewBox="0 0 24 24" width="17" height="17">' +
                                '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path>' +
                            '</svg>'
                        );
                    },
                    vertAlign: 'middle',
                    width: 50
                },
                {
                    cellClick(e, cell) {
                        if (!cell.getValue()) {
                            return;
                        }

                        document.querySelector('#search').value = 'is:airing';

                        searchFunction(cell.getTable());
                    },
                    field: 'airing',
                    formatter(cell) {
                        if (!cell.getValue()) {
                            return '';
                        }

                        return (
                            '<svg viewBox="3 2 20 20" width="17" height="17">' +
                                '<path d="M8 5v14l11-7z"></path>' +
                            '</svg>'
                        );
                    },
                    headerHozAlign: 'center',
                    headerSort: false,
                    hozAlign: 'center',
                    titleFormatter() {
                        return (
                            '<svg viewBox="3 2 20 20" width="17" height="17">' +
                                '<path d="M8 5v14l11-7z"></path>' +
                            '</svg>'
                        );
                    },
                    vertAlign: 'middle',
                    width: 50
                },
                {
                    field: 'alternative',
                    formatter(cell) {
                        return `<a href="${cell.getRow().getData().sources}" target="_blank" rel="noreferrer">${cell.getValue()}</a>`;
                    },
                    minWidth: 100,
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
                    sorterParams: {
                        alignEmptyValues: 'bottom'
                    },
                    title: 'Episodes',
                    vertAlign: 'middle',
                    width: 100
                },
                {
                    cellClick(e, cell) {
                        const value = cell.getValue();

                        if (value) {
                            if (value.indexOf(' ') > -1) {
                                const split = value.split(' ');

                                document.querySelector('#search').value = `season:${split[0].toLowerCase()} year:${split[1]}`;
                            } else {
                                document.querySelector('#search').value = `season:tba year:${value}`;
                            }
                        } else {
                            document.querySelector('#search').value = 'year:tba';
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
                    field: 'score',
                    formatter(cell) {
                        const select = document.createElement('select');

                        select.innerHTML = scores;
                        select.value = cell.getValue();
                        select.addEventListener('change', () => {
                            cell.getRow().update({
                                score: select.value
                            });
                        });

                        return select;
                    },
                    headerHozAlign: 'center',
                    hozAlign: 'center',
                    sorter: 'number',
                    sorterParams: {
                        alignEmptyValues: 'bottom'
                    },
                    title: 'Score',
                    vertAlign: 'middle',
                    width: 100
                },
                {
                    field: 'status',
                    formatter(cell) {
                        const select = document.createElement('select');

                        select.innerHTML = statuses;
                        select.value = cell.getValue();
                        select.addEventListener('change', () => {
                            cell.getRow().update({
                                status: select.value
                            });
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
                    formatter(cell) {
                        return `${Number(cell.getValue() * 100).toFixed(1)}%`;
                    },
                    headerHozAlign: 'center',
                    hozAlign: 'center',
                    title: 'Relevancy',
                    vertAlign: 'middle',
                    width: 100
                }
            ],
            data: database,
            dataFiltered(filters, rows) {
                if (dimension) {
                    r = rows;

                    for (const value of rows) {
                        value.update({
                            alternative: dimension[dimension.findIndex((i) => i.source === value.getData().sources)].alternative,
                            relevancy: dimension[dimension.findIndex((i) => i.source === value.getData().sources)].relevancy
                        });
                    }
                }

                if (document.querySelector('#progress')) {
                    document.querySelector('#progress').remove();
                }

                if (document.querySelector('#searching')) {
                    document.querySelector('#searching').remove();
                }

                if (rows.length) {
                    document.querySelector('.tabulator-tableHolder').style.display = '';
                } else {
                    document.querySelector('main').insertAdjacentHTML('beforeend',
                        '<span id="nothing">Nothing found</span>'
                    );

                }
            },
            dataLoaded() {
                document.querySelector('#loading').remove();
                document.querySelector('#search-container').style.display = 'flex';

                if (new URLSearchParams(location.search).get('query')) {
                    document.querySelector('#search').value = decodeURIComponent(new URLSearchParams(location.search).get('query'));
                    document.querySelector('#clear').style.visibility = 'visible';
                    document.querySelector('#clear').style.display = 'inline-flex';
                }

                if (new URLSearchParams(location.search).get('regex') === '1') {
                    params.regex = true;
                    document.querySelector('#regex svg').classList.remove('disabled');
                }

                if (new URLSearchParams(location.search).get('alt') === '0') {
                    params.alt = false;
                    document.querySelector('#alt svg').classList.add('disabled');
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
            dataLoading() {
                document.head.insertAdjacentHTML('beforeend',
                    '<style>' +
                        '@import url(https://cdn.jsdelivr.net/npm/tabulator-tables/dist/css/tabulator_simple.min.css);' +
                    '</style>'
                );
            },
            dataSorted() {
                if (this.getSorters().length) {
                    return;
                }

                this.setSort('relevancy', 'desc');
            },
            headerSortElement:
                '<svg viewBox="0 0 24 24" width="17" height="17">' +
                    '<path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"></path>' +
                '</svg>',
            headerSortTristate: true,
            initialSort: [
                {
                    column: 'relevancy',
                    dir: 'desc'
                }
            ],
            layout: 'fitColumns',
            resizableColumns: false,
            rowFormatter(row) {
                row.getElement().dataset.status = row.getData().status;
            },
            sortOrderReverse: true
        });
    });

export {
    r,
    t,
    title,
    params
};