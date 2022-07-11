import {
    EditModule,
    FilterModule,
    FormatModule,
    FrozenColumnsModule,
    InteractionModule,
    ResizeTableModule,
    SelectRowModule,
    SortModule,
    Tabulator
} from 'https://cdn.jsdelivr.net/npm/tabulator-tables@5.3.0/dist/js/tabulator_esm.js';

Tabulator.registerModule(
    [
        EditModule,
        FilterModule,
        FormatModule,
        FrozenColumnsModule,
        InteractionModule,
        ResizeTableModule,
        SelectRowModule,
        SortModule
    ]
);

import {
    index,
    searchFunction
} from './index.js';

import {
    source
} from './global.js';

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
        arrow: '<path d="M11 20V7.825L5.4 13.425L4 12L12 4L20 12L18.6 13.425L13 7.825V20Z"></path>',
        blank: '<path d="M5 21Q4.175 21 3.587 20.413Q3 19.825 3 19V5Q3 4.175 3.587 3.587Q4.175 3 5 3H19Q19.825 3 20.413 3.587Q21 4.175 21 5V19Q21 19.825 20.413 20.413Q19.825 21 19 21ZM5 19H19Q19 19 19 19Q19 19 19 19V5Q19 5 19 5Q19 5 19 5H5Q5 5 5 5Q5 5 5 5V19Q5 19 5 19Q5 19 5 19Z"></path>',
        check: '<path d="M5 21Q4.175 21 3.587 20.413Q3 19.825 3 19V5Q3 4.175 3.587 3.587Q4.175 3 5 3H19Q19.825 3 20.413 3.587Q21 4.175 21 5V19Q21 19.825 20.413 20.413Q19.825 21 19 21ZM10.6 16.2 17.65 9.15 16.25 7.75 10.6 13.4 7.75 10.55 6.35 11.95Z"></path>',
        helpClose: '<path d="M11.95 18Q12.475 18 12.838 17.637Q13.2 17.275 13.2 16.75Q13.2 16.225 12.838 15.863Q12.475 15.5 11.95 15.5Q11.425 15.5 11.062 15.863Q10.7 16.225 10.7 16.75Q10.7 17.275 11.062 17.637Q11.425 18 11.95 18ZM11.05 14.15H12.9Q12.9 13.325 13.088 12.85Q13.275 12.375 14.15 11.55Q14.8 10.9 15.175 10.312Q15.55 9.725 15.55 8.9Q15.55 7.5 14.525 6.75Q13.5 6 12.1 6Q10.675 6 9.788 6.75Q8.9 7.5 8.55 8.55L10.2 9.2Q10.325 8.75 10.763 8.225Q11.2 7.7 12.1 7.7Q12.9 7.7 13.3 8.137Q13.7 8.575 13.7 9.1Q13.7 9.6 13.4 10.037Q13.1 10.475 12.65 10.85Q11.55 11.825 11.3 12.325Q11.05 12.825 11.05 14.15ZM12 22Q9.95 22 8.125 21.212Q6.3 20.425 4.938 19.075Q3.575 17.725 2.788 15.9Q2 14.075 2 12Q2 9.925 2.788 8.1Q3.575 6.275 4.938 4.925Q6.3 3.575 8.125 2.787Q9.95 2 12 2Q14.1 2 15.925 2.787Q17.75 3.575 19.1 4.925Q20.45 6.275 21.225 8.1Q22 9.925 22 12Q22 14.075 21.225 15.9Q20.45 17.725 19.1 19.075Q17.75 20.425 15.925 21.212Q14.1 22 12 22ZM12 12Q12 12 12 12Q12 12 12 12Q12 12 12 12Q12 12 12 12Q12 12 12 12Q12 12 12 12Q12 12 12 12Q12 12 12 12ZM12 20Q15.35 20 17.675 17.663Q20 15.325 20 12Q20 8.675 17.675 6.337Q15.35 4 12 4Q8.725 4 6.362 6.337Q4 8.675 4 12Q4 15.325 6.362 17.663Q8.725 20 12 20Z"></path>',
        helpOpen: '<path d="M12 22Q9.95 22 8.125 21.212Q6.3 20.425 4.938 19.075Q3.575 17.725 2.788 15.9Q2 14.075 2 12Q2 9.925 2.788 8.1Q3.575 6.275 4.938 4.925Q6.3 3.575 8.125 2.787Q9.95 2 12 2Q14.1 2 15.925 2.787Q17.75 3.575 19.1 4.925Q20.45 6.275 21.225 8.1Q22 9.925 22 12Q22 14.075 21.225 15.9Q20.45 17.725 19.1 19.075Q17.75 20.425 15.925 21.212Q14.1 22 12 22ZM11.05 14.15H12.9Q12.9 13.325 13.088 12.85Q13.275 12.375 14.15 11.55Q14.8 10.9 15.175 10.312Q15.55 9.725 15.55 8.9Q15.55 7.5 14.525 6.75Q13.5 6 12.1 6Q10.675 6 9.788 6.75Q8.9 7.5 8.55 8.55L10.2 9.2Q10.325 8.75 10.763 8.225Q11.2 7.7 12.1 7.7Q12.9 7.7 13.3 8.137Q13.7 8.575 13.7 9.1Q13.7 9.6 13.4 10.037Q13.1 10.475 12.65 10.85Q11.55 11.825 11.3 12.325Q11.05 12.825 11.05 14.15ZM11.95 18Q12.475 18 12.838 17.637Q13.2 17.275 13.2 16.75Q13.2 16.225 12.838 15.863Q12.475 15.5 11.95 15.5Q11.425 15.5 11.062 15.863Q10.7 16.225 10.7 16.75Q10.7 17.275 11.062 17.637Q11.425 18 11.95 18Z"></path>',
        indeterminate: '<path d="M7 13H17V11H7ZM5 21Q4.175 21 3.587 20.413Q3 19.825 3 19V5Q3 4.175 3.587 3.587Q4.175 3 5 3H19Q19.825 3 20.413 3.587Q21 4.175 21 5V19Q21 19.825 20.413 20.413Q19.825 21 19 21Z"></path>',
        play: '<path d="M8 19V5L19 12Z"></path>'
    },
    title = document.title;

let db2 = null,
    dimension2 = null,
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

        document.querySelector('.selected-count').innerHTML = `<span>${cell.getTable().getSelectedRows().length} selected</span>`;

        if (cell.getTable().getSelectedRows().length > active) {
            document.querySelector('.selected-count').innerHTML += `<span>${active} active</span>`;
        }

        if (document.querySelector('header .menu')) {
            document.querySelector('header .menu').style.display = 'none';
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

            for (const value of cell.getTable().getSelectedRows()) {
                ddd.push(
                    new Promise((resolve2) => {
                        const
                            p = value.getData().progress || '0',
                            r2 = value.getData().rewatched || '0';

                        if (hstatus.value) {
                            const d2 = db2().add({
                                episodes: value.getData().episodes,
                                progress:
                                    hstatus.value === 'Completed' && value.getData().episodes
                                        ? value.getData().episodes
                                        : ['Planning', 'Skipping'].indexOf(hstatus.value) > -1
                                            ? ''
                                            : '0',
                                rewatched:
                                    ['Planning', 'Skipping'].indexOf(hstatus.value) > -1
                                        ? ''
                                        : '0',
                                season: value.getData().season,
                                source: value.getData().sources,
                                status: hstatus.value,
                                title: value.getData().title,
                                type: value.getData().type
                            });

                            d2.onsuccess = () => {
                                if (hstatus.value === 'Completed') {
                                    value.update({
                                        progress: value.getData().episodes || '0',
                                        rewatched: '0',
                                        status: hstatus.value
                                    });

                                    resolve2();
                                    return;
                                }

                                if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                    value.update({
                                        progress: '',
                                        rewatched: '',
                                        status: hstatus.value
                                    });

                                    resolve2();
                                    return;
                                }

                                value.update({
                                    progress: '0',
                                    rewatched: '0',
                                    status: hstatus.value
                                });

                                resolve2();
                            };

                            d2.onerror = () => {
                                db2().get(value.getData().sources).onsuccess = (event) => {
                                    const
                                        result = event.target.result,
                                        status2 = result.status;

                                    if (hstatus.value === 'Completed') {
                                        result.progress = value.getData().episodes || '0';
                                        result.rewatched =
                                            status2 === 'Rewatching'
                                                ? Number(value.getData().rewatched) + 1
                                                : value.getData().rewatched;
                                    } else {
                                        if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                            result.progress = '';
                                            result.rewatched = '';
                                        } else {
                                            if (status2 === 'Planning' || status2 === 'Skipping') {
                                                result.progress = '0';
                                                result.rewatched = '0';
                                            }
                                        }
                                    }

                                    result.status = hstatus.value;

                                    db2().put(result).onsuccess = () => {
                                        if (hstatus.value === 'Completed') {
                                            value.getElement().dataset.progress = '';

                                            // force update
                                            value.update({
                                                progress: ''
                                            });

                                            value.update({
                                                progress: value.getData().episodes || '0',
                                                rewatched:
                                                    status2 === 'Rewatching'
                                                        ? Number(value.getData().rewatched) + 1
                                                        : value.getData().rewatched,
                                                status: hstatus.value
                                            });

                                            resolve2();
                                            return;
                                        }

                                        if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                            value.getElement().dataset.progress = '';

                                            value.update({
                                                progress: '',
                                                rewatched: '',
                                                status: hstatus.value
                                            });

                                            resolve2();
                                            return;
                                        }

                                        if (status2 === 'Planning' || status2 === 'Skipping') {
                                            value.update({
                                                progress: '0',
                                                rewatched: '0',
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
                                            rewatched: r2,
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
                                    rewatched: '',
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
        document.head.querySelector('[name="theme-color"]').content = '#a6c6f7';

        if (selected.s) {
            cell.getColumn().getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.check;
            cell.getColumn().getElement().querySelector('.tabulator-col-title svg').style.fill = 'var(--selected-header)';
        } else {
            if (selected.ss.length) {
                cell.getColumn().getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.indeterminate;
                cell.getColumn().getElement().querySelector('.tabulator-col-title svg').style.fill = 'var(--selected-header)';
            } else {
                cell.getColumn().getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
                cell.getColumn().getElement().querySelector('.tabulator-col-title svg').style.fill = '';
            }
        }
    } else {
        index.lastRow = null;

        document.querySelector('header').classList.remove('header-selected');

        if (document.querySelector('.header-status')) {
            document.querySelector('.header-status').remove();
        }

        if (document.querySelector('header .menu')) {
            document.querySelector('header .menu').style.display = 'inline-flex';
        }

        document.head.querySelector('[name="theme-color"]').content = '#000';

        cell.getColumn().getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
        cell.getColumn().getElement().querySelector('.tabulator-col-title svg').style.fill = '';
    }
}

function clickHeader(e, column) {
    if (disableSelection) {
        return;
    }

    e.stopImmediatePropagation();
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

        document.querySelector('.selected-count').innerHTML = `<span>${column.getTable().getSelectedRows().length} selected</span>`;

        if (column.getTable().getSelectedRows().length > active) {
            document.querySelector('.selected-count').innerHTML += `<span>${active} active</span>`;
        }

        if (document.querySelector('header .menu')) {
            document.querySelector('header .menu').style.display = 'none';
        }

        if (selected.s) {
            column.getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.check;
            column.getElement().querySelector('.tabulator-col-title svg').style.fill = 'var(--selected-header)';
        } else {
            column.getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
            column.getElement().querySelector('.tabulator-col-title svg').style.fill = '';
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
                        const
                            p = value.getData().progress || '0',
                            r2 = value.getData().rewatched || '0';

                        if (hstatus.value) {
                            const d2 = db2().add({
                                episodes: value.getData().episodes,
                                progress:
                                    hstatus.value === 'Completed' && value.getData().episodes
                                        ? value.getData().episodes
                                        : ['Planning', 'Skipping'].indexOf(hstatus.value) > -1
                                            ? ''
                                            : '0',
                                rewatched:
                                    ['Planning', 'Skipping'].indexOf(hstatus.value) > -1
                                        ? ''
                                        : '0',
                                season: value.getData().season,
                                source: value.getData().sources,
                                status: hstatus.value,
                                title: value.getData().title,
                                type: value.getData().type
                            });

                            d2.onsuccess = () => {
                                if (hstatus.value === 'Completed') {
                                    value.update({
                                        progress: value.getData().episodes || '0',
                                        rewatched: '0',
                                        status: hstatus.value
                                    });

                                    resolve2();
                                    return;
                                }

                                if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                    value.update({
                                        progress: '',
                                        rewatched: '',
                                        status: hstatus.value
                                    });

                                    resolve2();
                                    return;
                                }

                                value.update({
                                    progress: '0',
                                    rewatched: '0',
                                    status: hstatus.value
                                });

                                resolve2();
                            };

                            d2.onerror = () => {
                                db2().get(value.getData().sources).onsuccess = (event) => {
                                    const
                                        result = event.target.result,
                                        status2 = result.status;

                                    if (hstatus.value === 'Completed') {
                                        result.progress = value.getData().episodes || '0';
                                        result.rewatched =
                                            status2 === 'Rewatching'
                                                ? Number(value.getData().rewatched) + 1
                                                : value.getData().rewatched;
                                    } else {
                                        if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                            result.progress = '';
                                            result.rewatched = '';
                                        } else {
                                            if (status2 === 'Planning' || status2 === 'Skipping') {
                                                result.progress = '0';
                                                result.rewatched = '0';
                                            }
                                        }
                                    }

                                    result.status = hstatus.value;

                                    db2().put(result).onsuccess = () => {
                                        if (hstatus.value === 'Completed') {
                                            value.getElement().dataset.progress = '';

                                            // force update
                                            value.update({
                                                progress: ''
                                            });

                                            value.update({
                                                progress: value.getData().episodes || '0',
                                                rewatched:
                                                    status2 === 'Rewatching'
                                                        ? Number(value.getData().rewatched) + 1
                                                        : value.getData().rewatched,
                                                status: hstatus.value
                                            });

                                            resolve2();
                                            return;
                                        }

                                        if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                            value.getElement().dataset.progress = '';

                                            value.update({
                                                progress: '',
                                                rewatched: '',
                                                status: hstatus.value
                                            });

                                            resolve2();
                                            return;
                                        }

                                        if (status2 === 'Planning' || status2 === 'Skipping') {
                                            value.update({
                                                progress: '0',
                                                rewatched: '0',
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
                                            rewatched: r2,
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
                                    rewatched: '',
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
        document.head.querySelector('[name="theme-color"]').content = '#a6c6f7';
    } else {
        document.querySelector('header').classList.remove('header-selected');
        column.getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
        column.getElement().querySelector('.tabulator-col-title svg').style.fill = '';

        if (document.querySelector('.header-status')) {
            document.querySelector('.header-status').remove();
        }

        if (document.querySelector('header .menu')) {
            document.querySelector('header .menu').style.display = 'inline-flex';
        }

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

fetch(source)
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
                        'rewatched',
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
                            rewatched: cursor.value.rewatched,
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
                document.querySelector('header .menu').remove();

                /* document.querySelector('header .menu').title = 'Can\'t track, import, or export without IndexedDB'; */
            }

            for (const ii of status) {
                statuses += `<option>${ii}</option>`;
            }

            for (const i of d) {
                const
                    source2 = /myanimelist\.net/gu,
                    ss = i.animeSeason.season,
                    tt = i.tags.map((tags2) => tags2.replace(/\s/gu, '_')),
                    value = i.sources.filter((sources) => sources.match(source2))[0];

                let n2 = false,
                    p2 = '',
                    r2 = '',
                    s = '',
                    s2 = '',
                    ttt = '';

                if (!i.sources.filter((sources) => sources.match(/myanimelist\.net/gu)).length) {
                    continue;
                }

                if (i.picture === 'https://cdn.myanimelist.net/images/qm_50.gif') {
                    continue;
                }

                if (i.tags.indexOf('anime influenced') > -1) {
                    continue;
                }

                // if (data5.indexOf(value) > -1) {
                //     continue;
                // }

                if (ss !== 'UNDEFINED') {
                    s = `${ss.replace(ss.substr(1), ss.substr(1).toLowerCase())} `;
                }

                if (i.animeSeason.year) {
                    s += i.animeSeason.year;
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
                    r2 = map4.get(value).rewatched;
                    s2 = map4.get(value).status;

                    map4.delete(value);
                }

                if (i.type !== 'UNKNOWN') {
                    if (['MOVIE', 'SPECIAL'].indexOf(i.type) > -1) {
                        ttt = i.type.replace(i.type.substr(1), i.type.substr(1).toLowerCase());
                    } else {
                        ttt = i.type;
                    }
                }

                database.push({
                    alternative: i.title,
                    dead: false,
                    episodes: i.episodes || '',
                    new: n2,
                    ongoing: i.status === 'ONGOING',
                    picture: i.picture,
                    progress: p2,
                    r18: tt.indexOf('hentai') > -1,
                    relations: [
                        ...i.sources.filter((sources) => sources.match(source2) && sources !== value),
                        ...i.relations.filter((relations) => relations.match(/myanimelist\.net/gu))
                    ],
                    relevancy: 1,
                    rewatched: r2,
                    season: s,
                    sources: value,
                    status: s2,
                    synonyms: i.synonyms,
                    tags: tt,
                    title: i.title,
                    type: ttt
                });

                data5.push(value);
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
                    relations: [],
                    relevancy: 1,
                    rewatched: value.rewatched,
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

            // tabulator tweak to fix incorrect behavior when scrolling
            /*
            RowManager.prototype.initialize = function () {
                const self = this;

                self.setRenderMode();
                self.element.appendChild(self.tableElement);
                self.firstRender = true;

                self.element.addEventListener('scroll', () => {
                    const
                        dir = self.scrollTop > self.element.scrollTop,
                        left = self.element.scrollLeft,
                        top = self.element.scrollTop;

                    if (self.scrollLeft !== left) {
                        self.table.options.scrollHorizontal(left);
                    }

                    self.scrollLeft = left;

                    if (self.scrollTop !== top) {
                        self.scrollTop = top;
                        self.scrollVertical(dir);
                        self.table.options.scrollVertical(top);
                    }
                });
            };

            Row.prototype.setCellHeight = function () {
                // error if set to null
            };
            */

            t = new Tabulator('.database-container', {
                columnDefaults: {
                    headerSortTristate: true,
                    vertAlign: 'middle'
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
                        visible: JSON.parse(localStorage.getItem('tsuzuku')).thumbnails,
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
                        visible: !JSON.parse(localStorage.getItem('tsuzuku')).thumbnails,
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

                            a.href = `/?query=${escape(encodeURIComponent(v))}`;
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
                                r18.href = `/?query=${escape(encodeURIComponent(v))}`;
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
                                n.href = `/?query=${escape(encodeURIComponent(v))}`;
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
                                        '<path d="M21 12V19Q21 19.825 20.413 20.413Q19.825 21 19 21H5Q4.175 21 3.587 20.413Q3 19.825 3 19V5Q3 4.175 3.587 3.587Q4.175 3 5 3H12V5H5Q5 5 5 5Q5 5 5 5V19Q5 19 5 19Q5 19 5 19H19Q19 19 19 19Q19 19 19 19V12ZM9.7 15.7 8.3 14.3 17.6 5H14V3H21V10H19V6.4Z"></path>' +
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
                        title: 'Title'
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

                            a.href = `/?query=${escape(encodeURIComponent(v))}`;
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
                        width: 100
                    },
                    {
                        formatter: function (cell) {
                            const relations = document.createElement('span');

                            if (index.related) {
                                return '';
                            }

                            relations.classList.add('relations');
                            relations.style.fontWeight = 500;
                            relations.style.userSelect = 'none';
                            relations.tabIndex = 0;
                            relations.innerHTML = 'Relations';
                            relations.addEventListener('click', () => {
                                const
                                    temp = [cell.getRow().getData().sources, ...cell.getRow().getData().relations],
                                    temp2 = [];

                                index.related = true;

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
                                    '</div>'
                                );

                                document.querySelector('.nothing .results').innerHTML = 'Searching...';
                                document.querySelector('.nothing .enter').style.display = '';

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
                                        index.dimension = null;

                                        if (temp2.length) {
                                            document.querySelector('.progress').classList.add('found');
                                        }

                                        document.querySelector('.progress').style.width = '100%';

                                        if (document.querySelector('.searching')) {
                                            document.querySelector('.nothing .results').innerHTML = 'Filtering table...';
                                        }

                                        setTimeout(() => {
                                            cell.getTable().setFilter('sources', 'in',
                                                temp2.length
                                                    ? temp2
                                                    : ['']
                                            );

                                            cell.getTable().redraw(true);
                                        }, 100);
                                    }
                                }

                                setTimeout(tempFunction, 100);
                            });

                            return relations;
                        },
                        headerSort: false,
                        hozAlign: 'center',
                        width: 100
                    },
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
                            input.title = 'Enter times rewatched';

                            input.addEventListener('input', () => {
                                new Promise((resolve) => {
                                    const d2 = db2().add({
                                        episodes: cell.getRow().getData().episodes,
                                        progress: cell.getRow().getData().progress,
                                        rewatched: cell.getRow().getData().watched,
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
                                            result.rewatched = '0';
                                        } else if (input.value >= 9999) {
                                            result.rewatched = 9999;
                                        } else {
                                            result.rewatched = input.value;
                                        }

                                        db2().put(result).onsuccess = () => {
                                            channelMessage();
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
                        field: 'rewatched',
                        formatter: function (cell) {
                            const span = document.createElement('span');

                            cell.getElement().tabIndex = -1;

                            if (['Completed', 'Dropped', 'Paused', 'Watching'].indexOf(cell.getRow().getData().status) > -1) {
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

                            return span;
                        },
                        headerClick: function (e, column) {
                            customSort(e, column);
                        },
                        headerHozAlign: 'center',
                        hozAlign: 'center',
                        sorter: 'number',
                        sorterParams: {
                            alignEmptyValues: 'bottom'
                        },
                        title: 'Rewatched',
                        width: 100
                    },
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
                                        type: cell.getRow().getData().type,
                                        watched: cell.getRow().getData().watched
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
                            span2.innerHTML = '<svg viewBox="0 0 24 24" height="17" width="17"><path d="M11 17H13V13H17V11H13V7H11V11H7V13H11ZM5 21Q4.175 21 3.587 20.413Q3 19.825 3 19V5Q3 4.175 3.587 3.587Q4.175 3 5 3H19Q19.825 3 20.413 3.587Q21 4.175 21 5V19Q21 19.825 20.413 20.413Q19.825 21 19 21Z"></path></svg>';

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
                                        type: cell.getRow().getData().type,
                                        watched: cell.getRow().getData().watched
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

                            a.href = `/?query=${escape(encodeURIComponent(v))}`;
                            a.title = 'Mismatched';
                            a.style.display = 'inline-flex';
                            a.style.alignItems = 'center';
                            a.style.marginLeft = '2.125px';
                            a.innerHTML = '<svg viewBox="0 0 24 24" height="17" width="17" style="fill: var(--mismatched) !important;"><path d="M1 21 12 2 23 21ZM11 15H13V10H11ZM12 18Q12.425 18 12.713 17.712Q13 17.425 13 17Q13 16.575 12.713 16.288Q12.425 16 12 16Q11.575 16 11.288 16.288Q11 16.575 11 17Q11 17.425 11.288 17.712Q11.575 18 12 18Z"></path></svg>';

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

                                const
                                    p = cell.getRow().getData().progress || '0',
                                    r2 = cell.getRow().getData().rewatched || '0';

                                if (select.value) {
                                    const d2 = db2().add({
                                        episodes: cell.getRow().getData().episodes,
                                        progress:
                                            select.value === 'Completed' && cell.getRow().getData().episodes
                                                ? cell.getRow().getData().episodes
                                                : ['Planning', 'Skipping'].indexOf(select.value) > -1
                                                    ? ''
                                                    : '0',
                                        rewatched:
                                            ['Planning', 'Skipping'].indexOf(select.value) > -1
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

                                        if (select.value === 'Completed') {
                                            cell.getRow().update({
                                                progress: cell.getRow().getData().episodes || '0',
                                                rewatched: '0',
                                                status: select.value
                                            });

                                            return;
                                        }

                                        if (select.value === 'Planning' || select.value === 'Skipping') {
                                            cell.getRow().update({
                                                progress: '',
                                                rewatched: '',
                                                status: select.value
                                            });

                                            return;
                                        }

                                        cell.getRow().update({
                                            progress: '0',
                                            rewatched: '0',
                                            status: select.value
                                        });
                                    };

                                    d2.onerror = () => {
                                        db2().get(cell.getRow().getData().sources).onsuccess = (event) => {
                                            const
                                                result = event.target.result,
                                                status2 = result.status;

                                            if (select.value === 'Completed') {
                                                result.progress = cell.getRow().getData().episodes || '0';
                                                result.rewatched =
                                                    status2 === 'Rewatching'
                                                        ? Number(cell.getRow().getData().rewatched) + 1
                                                        : cell.getRow().getData().rewatched;
                                            } else {
                                                if (select.value === 'Planning' || select.value === 'Skipping') {
                                                    result.progress = '';
                                                    result.rewatched = '';
                                                } else {
                                                    if (status2 === 'Planning' || status2 === 'Skipping') {
                                                        result.progress = '0';
                                                        result.rewatched = '0';
                                                    }
                                                }
                                            }

                                            result.status = select.value;

                                            db2().put(result).onsuccess = () => {
                                                channelMessage();

                                                if (select.value === 'Completed') {
                                                    cell.getRow().getElement().dataset.progress = '';

                                                    // force update
                                                    cell.getRow().update({
                                                        progress: ''
                                                    });

                                                    cell.getRow().update({
                                                        progress: cell.getRow().getData().episodes || '0',
                                                        rewatched:
                                                            status2 === 'Rewatching'
                                                                ? Number(cell.getRow().getData().rewatched) + 1
                                                                : cell.getRow().getData().rewatched,
                                                        status: select.value
                                                    });

                                                    return;
                                                }

                                                if (select.value === 'Planning' || select.value === 'Skipping') {
                                                    cell.getRow().getElement().dataset.progress = '';

                                                    cell.getRow().update({
                                                        progress: '',
                                                        rewatched: '',
                                                        status: select.value
                                                    });

                                                    return;
                                                }

                                                if (status2 === 'Planning' || status2 === 'Skipping') {
                                                    cell.getRow().update({
                                                        progress: '0',
                                                        rewatched: '0',
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
                                                    rewatched: r2,
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
                                            rewatched: '',
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
                debugInitialization: false,
                headerSortElement: `<svg viewBox="0 0 24 24" width="17" height="17">${svg.arrow}</svg>`,
                index: 'sources',
                initialSort: [
                    {
                        column: 'alternative',
                        dir: 'asc'
                    }
                ],
                layout: 'fitColumns',
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
                sortOrderReverse: true
            });

            t.on('cellDblClick', () => false);

            t.on('dataFiltered', (filters, rows) => {
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

                document.querySelector('.selected-count').innerHTML = `<span>${t.getSelectedRows().length} selected</span>`;

                if (t.getSelectedRows().length > selected.ss.length) {
                    document.querySelector('.selected-count').innerHTML += `<span>${selected.ss.length} active</span>`;
                }

                if (selected.s) {
                    t.getColumn('picture').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.check;
                    t.getColumn('picture').getElement().querySelector('.tabulator-col-title svg').style.fill = 'var(--selected-header)';
                } else {
                    if (selected.ss.length) {
                        t.getColumn('picture').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.indeterminate;
                        t.getColumn('picture').getElement().querySelector('.tabulator-col-title svg').style.fill = 'var(--selected-header)';
                    } else {
                        t.getColumn('picture').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
                        t.getColumn('picture').getElement().querySelector('.tabulator-col-title svg').style.fill = '';
                    }
                }

                if (index.dimension) {
                    if (index.quick) {
                        if (dimension2) {
                            for (const value of dimension2) {
                                value.update({
                                    alternative: value.getData().title,
                                    relevancy: 1
                                });
                            }

                            dimension2 = null;
                        }
                    } else {
                        for (const value of rows) {
                            value.update({
                                alternative: index.dimension.find((i) => i.source === value.getData().sources).alternative,
                                relevancy: index.dimension.find((i) => i.source === value.getData().sources).relevancy
                            });
                        }

                        dimension2 = rows;
                    }
                } else {
                    if (dimension2) {
                        for (const value of dimension2) {
                            value.update({
                                alternative: value.getData().title,
                                relevancy: 1
                            });
                        }

                        dimension2 = null;
                    }
                }

                if (document.querySelector('.searching')) {
                    document.querySelector('.searching').remove();
                }

                document.querySelector('.nothing .enter').innerHTML = 'Show more';

                if (index.quick) {
                    if (rows.length) {
                        document.querySelector('.tabulator').style.display = '';
                        document.querySelector('.nothing .results').innerHTML =
                            rows.length === 1
                                ? '1 result'
                                : `${rows.length} results`;

                        if (filters.length && filters[0].value) {
                            document.querySelector('.nothing .enter').style.display = 'inline-flex';
                        } else {
                            document.querySelector('.nothing .enter').style.display = '';
                        }
                    } else {
                        document.querySelector('.tabulator').style.display = 'none';
                        document.querySelector('.nothing .results').innerHTML = '0 results';
                        document.querySelector('.nothing .enter').style.display = 'inline-flex';
                    }
                } else {
                    if (rows.length) {
                        document.querySelector('.tabulator').style.display = '';
                        document.querySelector('.nothing .results').innerHTML =
                            index.random
                                ? `${rows.length} of ${index.random} results`
                                : rows.length === 1
                                    ? '1 result'
                                    : `${rows.length} results`;

                        if (index.random) {
                            document.querySelector('.nothing .enter').innerHTML = 'Randomize';
                            document.querySelector('.nothing .enter').style.display = 'inline-flex';
                        } else {
                            document.querySelector('.nothing .enter').style.display = '';
                        }
                    } else {
                        document.querySelector('.tabulator').style.display = 'none';
                        document.querySelector('.nothing .results').innerHTML =
                            index.error
                                ? 'Invalid regular expression'
                                : '0 results';
                        document.querySelector('.nothing .enter').style.display = '';
                    }
                }

                if (index.related) {
                    document.querySelector('.nothing .enter').style.display = '';
                }
            });

            t.on('dataProcessed', () => {
                document.querySelector('.tabulator').style.display = 'none';
                document.querySelector('.nothing').style.display = '';

                if (new URLSearchParams(location.search).get('query')) {
                    const value = decodeURIComponent(new URLSearchParams(location.search).get('query'));
                    document.querySelector('.search').value = value;
                } else {
                    document.querySelector('.search').value = '';
                }

                document.querySelector('.loading').remove();
                document.querySelector('.top-container').style.display = 'inline-flex';

                searchFunction(t, null, true);
            });

            t.on('dataSorted', (sorters) => {
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

                setTimeout(() => {
                    t.setSort([
                        {
                            column: 'relevancy',
                            dir: 'desc'
                        },
                        {
                            column: 'alternative',
                            dir: 'asc'
                        }
                    ]);
                }, 0);
            });

            t.on('tableBuilt', () => {
                document.querySelector('.tabulator-tableholder').tabIndex = -1;

                const
                    columns = ['picture', 'picture2', 'alternative', 'type', 'episodes', 'season'],
                    header = document.querySelector('.tabulator-header');

                if (!error) {
                    columns.push(...['progress', 'status']);
                }

                for (const value of columns) {
                    document.querySelector(`.tabulator-col[tabulator-field="${value}"]`).tabIndex = 0;
                }

                document.querySelector('.tabulator-header').remove();
                document.querySelector('.tabulator-tableholder').prepend(header);
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
                        'rewatched',
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
                            rewatched: cursor.value.rewatched,
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

            document.querySelector('.loading').innerHTML += '<span class="export2" tabindex="0">Export personal list</span>';

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
        });
    });

export {
    db2,
    disableSelection,
    error,
    error2,
    selected,
    sorted,
    svg,
    t,
    title
};