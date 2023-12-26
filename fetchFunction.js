import {
    ClipboardModule,
    EditModule,
    ExportModule,
    FilterModule,
    FormatModule,
    FrozenColumnsModule,
    InteractionModule,
    ResizeTableModule,
    SelectRowModule,
    SortModule,
    Tabulator
} from 'https://cdn.jsdelivr.net/npm/tabulator-tables@5.4.4/dist/js/tabulator_esm.min.js';

Tabulator.registerModule(
    [
        ClipboardModule,
        EditModule,
        ExportModule,
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
    addCommas,
    removeReserved,
    searchReplace,
    source,
    svg,
    tagsDelisted
} from './global.js';

import {
    index,
    qualifiers,
    searchFunction
} from './index.js';

import {
    message
} from './message.js';

const
    channel =
        'BroadcastChannel' in window
            ? new BroadcastChannel('tsuzuku')
            : null,
    data4 = [],
    data5 = [],
    database = [],
    database2 = new Map(),
    map4 = new Map(),
    selected = {
        s: true,
        ss: []
    },
    sorted2 = {
        dir: 'desc',
        field: 'relevancy'
    },
    status = ['', 'Completed', 'Dropped', 'Paused', 'Planning', 'Skipping', 'Watching'],
    title = document.title,
    years = new Set(),
    years2 = [];

let built = false,
    db2 = null,
    dimension2 = null,
    disableSelection = false,
    error = false,
    error2 = false,
    f = null,
    hasProgress = false,
    r = null,
    statuses = '',
    t = null,
    updated = '???',
    updated2 = false;

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
        const
            hstatus = document.createElement('select'),
            ids = [];

        let active = 0;

        index.lastRow = cell.getRow();

        document.querySelector('header').classList.add('header-selected');

        for (const value of r) {
            if (value.isSelected()) {
                active += 1;
            }
        }

        for (const value of cell.getTable().getSelectedRows()) {
            ids.push(value.getData().sources.slice('https://myanimelist.net/anime/'.length));
        }

        document.querySelector('.count-selected').href = `./?query=${escape(encodeURIComponent(`id:${ids.join('|')} `))}`;
        document.querySelector('.count-selected').innerHTML = `${addCommas(cell.getTable().getSelectedRows().length)} selected`;

        if (cell.getTable().getSelectedRows().length > active) {
            document.querySelector('.selected-count span').innerHTML = `${addCommas(active)} from search results`;
        } else {
            document.querySelector('.selected-count span').innerHTML = '';
        }

        if (document.querySelector('header .menu')) {
            document.querySelector('header .menu').style.display = 'none';
        }

        if (document.querySelector('.header-status')) {
            document.querySelector('.header-status').remove();
        }

        if (document.querySelector('.copy')) {
            document.querySelector('.copy').style.display = 'inline-flex';
        }

        if (error) {
            hstatus.disabled = true;
        }

        hstatus.classList.add('header-status');
        hstatus.title = 'Status';
        hstatus.innerHTML = `<option selected disabled>Status</option>${statuses}`;
        hstatus.addEventListener('change', () => {
            if (disableSelection || error) {
                return;
            }

            const ddd = [];

            channelMessage();
            disableSelection = true;

            document.body.classList.add('error');
            document.querySelector('.changing').style.display = '';
            document.querySelector('.copy').style.display = 'none';

            hstatus.style.display = 'none';

            for (const value of cell.getTable().getSelectedRows()) {
                ddd.push(
                    new Promise((resolve2) => {
                        const
                            p = value.getData().progress || '0',
                            w2 = value.getData().watched || '0';

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
                                type: value.getData().type,
                                watched:
                                    hstatus.value === 'Completed'
                                        ? 1
                                        : ['Planning', 'Skipping'].indexOf(hstatus.value) > -1
                                            ? ''
                                            : '0'
                            });

                            d2.onsuccess = () => {
                                if (hstatus.value === 'Completed') {
                                    value.update({
                                        progress: value.getData().episodes || '0',
                                        status: hstatus.value,
                                        watched: 1
                                    });

                                    resolve2();
                                    return;
                                }

                                if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                    value.update({
                                        progress: '',
                                        status: hstatus.value,
                                        watched: ''
                                    });

                                    resolve2();
                                    return;
                                }

                                value.update({
                                    progress: '0',
                                    status: hstatus.value,
                                    watched: '0'
                                });

                                resolve2();
                            };

                            d2.onerror = () => {
                                db2().get(value.getData().sources).onsuccess = (event) => {
                                    const
                                        result = event.target.result,
                                        status2 = result.status;

                                    if (hstatus.value === 'Completed') {
                                        result.progress =
                                            Number(value.getData().progress) === Number(value.getData().episodes)
                                                ? value.getData().episodes
                                                : value.getData().progress || '0';
                                        result.watched =
                                            status2 === 'Completed'
                                                ? value.getData().watched
                                                : Number(value.getData().watched) + 1;
                                    } else {
                                        if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                            result.progress = '';
                                            result.watched = '';
                                        } else {
                                            if (status2 === 'Planning' || status2 === 'Skipping') {
                                                result.progress = '0';
                                                result.watched = '0';
                                            }
                                        }
                                    }

                                    result.status = hstatus.value;

                                    db2().put(result).onsuccess = () => {
                                        if (hstatus.value === 'Completed') {
                                            value.getElement().dataset.progress = '';
                                            value.getElement().dataset.mismatched = value.getData().episodes && value.getData().status === 'Completed' && Number(value.getElement().dataset.progress || value.getData().progress) !== Number(value.getData().episodes);

                                            // force update
                                            value.update({
                                                progress: ''
                                            });

                                            value.update({
                                                progress:
                                                    Number(value.getData().progress) === Number(value.getData().episodes)
                                                        ? value.getData().episodes
                                                        : result.progress || '0',
                                                status: hstatus.value,
                                                watched:
                                                    status2 === 'Completed'
                                                        ? value.getData().watched
                                                        : Number(value.getData().watched) + 1
                                            });

                                            resolve2();
                                            return;
                                        }

                                        if (hstatus.value === 'Watching' && status2 === 'Completed') {
                                            value.getElement().dataset.progress = '';
                                            value.getElement().dataset.mismatched = value.getData().episodes && value.getData().status === 'Completed' && Number(value.getElement().dataset.progress || value.getData().progress) !== Number(value.getData().episodes);

                                            // force update
                                            value.update({
                                                progress: ''
                                            });

                                            value.update({
                                                progress: '0',
                                                status: hstatus.value
                                            });

                                            resolve2();
                                            return;
                                        }

                                        if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                            value.getElement().dataset.progress = '';
                                            value.getElement().dataset.mismatched = value.getData().episodes && value.getData().status === 'Completed' && Number(value.getElement().dataset.progress || value.getData().progress) !== Number(value.getData().episodes);

                                            value.update({
                                                progress: '',
                                                status: hstatus.value,
                                                watched: ''
                                            });

                                            resolve2();
                                            return;
                                        }

                                        if (status2 === 'Planning' || status2 === 'Skipping') {
                                            value.update({
                                                progress: '0',
                                                status: hstatus.value,
                                                watched: '0'
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
                                            status: hstatus.value,
                                            watched: w2
                                        });

                                        resolve2();
                                    };
                                };
                            };
                        } else {
                            db2().delete(value.getData().sources).onsuccess = () => {
                                value.getElement().dataset.progress = '';
                                value.getElement().dataset.mismatched = value.getData().episodes && value.getData().status === 'Completed' && Number(value.getElement().dataset.progress || value.getData().progress) !== Number(value.getData().episodes);

                                value.update({
                                    progress: '',
                                    status: '',
                                    watched: ''
                                });

                                resolve2();
                            };
                        }
                    })
                );
            }

            Promise.all(ddd).then(() => {
                disableSelection = false;

                document.body.classList.remove('error');
                document.querySelector('.changing').style.display = 'none';
                document.querySelector('.copy').style.display = 'inline-flex';

                hstatus.style.display = '';
            });
        });

        document.querySelector('.copy').insertAdjacentElement('afterend', hstatus);
        document.head.querySelector('[name="theme-color"]').content = '#a6c6f7';

        if (selected.s) {
            cell.getTable().getColumn('picture').getElement().querySelector('.tabulator-col-title').title = 'Deselect all search results';
            cell.getTable().getColumn('picture').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.check;
            cell.getTable().getColumn('picture').getElement().querySelector('.tabulator-col-title svg').style.fill = 'var(--selected-header)';

            cell.getTable().getColumn('picture2').getElement().querySelector('.tabulator-col-title').title = 'Deselect all search results';
            cell.getTable().getColumn('picture2').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.check;
            cell.getTable().getColumn('picture2').getElement().querySelector('.tabulator-col-title svg').style.fill = 'var(--selected-header)';
        } else {
            if (selected.ss.length) {
                cell.getTable().getColumn('picture').getElement().querySelector('.tabulator-col-title').title = 'Deselect all search results';
                cell.getTable().getColumn('picture').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.indeterminate;
                cell.getTable().getColumn('picture').getElement().querySelector('.tabulator-col-title svg').style.fill = 'var(--selected-header)';

                cell.getTable().getColumn('picture2').getElement().querySelector('.tabulator-col-title').title = 'Deselect all search results';
                cell.getTable().getColumn('picture2').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.indeterminate;
                cell.getTable().getColumn('picture2').getElement().querySelector('.tabulator-col-title svg').style.fill = 'var(--selected-header)';
            } else {
                cell.getTable().getColumn('picture').getElement().querySelector('.tabulator-col-title').title = 'Select all search results';
                cell.getTable().getColumn('picture').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
                cell.getTable().getColumn('picture').getElement().querySelector('.tabulator-col-title svg').style.fill = '';

                cell.getTable().getColumn('picture2').getElement().querySelector('.tabulator-col-title').title = 'Select all search results';
                cell.getTable().getColumn('picture2').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
                cell.getTable().getColumn('picture2').getElement().querySelector('.tabulator-col-title svg').style.fill = '';
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

        if (document.querySelector('.copy')) {
            document.querySelector('.copy').style.display = 'none';
        }

        document.head.querySelector('[name="theme-color"]').content = '#000';

        cell.getTable().getColumn('picture').getElement().querySelector('.tabulator-col-title').title = 'Select all search results';
        cell.getTable().getColumn('picture').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
        cell.getTable().getColumn('picture').getElement().querySelector('.tabulator-col-title svg').style.fill = '';

        cell.getTable().getColumn('picture2').getElement().querySelector('.tabulator-col-title').title = 'Select all search results';
        cell.getTable().getColumn('picture2').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
        cell.getTable().getColumn('picture2').getElement().querySelector('.tabulator-col-title svg').style.fill = '';
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
        const
            hstatus = document.createElement('select'),
            ids = [];

        let active = 0;

        document.querySelector('header').classList.add('header-selected');

        for (const value of r) {
            if (value.isSelected()) {
                active += 1;
            }
        }

        for (const value of column.getTable().getSelectedRows()) {
            ids.push(value.getData().sources.slice('https://myanimelist.net/anime/'.length));
        }

        document.querySelector('.count-selected').href = `./?query=${escape(encodeURIComponent(`id:${ids.join('|')} `))}`;
        document.querySelector('.count-selected').innerHTML = `${addCommas(column.getTable().getSelectedRows().length)} selected`;

        if (column.getTable().getSelectedRows().length > active) {
            document.querySelector('.selected-count span').innerHTML = `${addCommas(active)} from search results`;
        } else {
            document.querySelector('.selected-count span').innerHTML = '';
        }

        if (document.querySelector('header .menu')) {
            document.querySelector('header .menu').style.display = 'none';
        }

        if (selected.s) {
            column.getTable().getColumn('picture').getElement().querySelector('.tabulator-col-title').title = 'Deselect all search results';
            column.getTable().getColumn('picture').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.check;
            column.getTable().getColumn('picture').getElement().querySelector('.tabulator-col-title svg').style.fill = 'var(--selected-header)';

            column.getTable().getColumn('picture2').getElement().querySelector('.tabulator-col-title').title = 'Deselect all search results';
            column.getTable().getColumn('picture2').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.check;
            column.getTable().getColumn('picture2').getElement().querySelector('.tabulator-col-title svg').style.fill = 'var(--selected-header)';
        } else {
            column.getTable().getColumn('picture').getElement().querySelector('.tabulator-col-title').title = 'Select all search results';
            column.getTable().getColumn('picture').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
            column.getTable().getColumn('picture').getElement().querySelector('.tabulator-col-title svg').style.fill = '';

            column.getTable().getColumn('picture2').getElement().querySelector('.tabulator-col-title').title = 'Select all search results';
            column.getTable().getColumn('picture2').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
            column.getTable().getColumn('picture2').getElement().querySelector('.tabulator-col-title svg').style.fill = '';
        }

        if (document.querySelector('.header-status')) {
            document.querySelector('.header-status').remove();
        }

        if (document.querySelector('.copy')) {
            document.querySelector('.copy').style.display = 'inline-flex';
        }

        if (error) {
            hstatus.disabled = true;
        }

        hstatus.classList.add('header-status');
        hstatus.title = 'Status';
        hstatus.innerHTML = `<option selected disabled>Status</option>${statuses}`;
        hstatus.addEventListener('change', () => {
            if (disableSelection || error) {
                return;
            }

            const ddd = [];

            channelMessage();
            disableSelection = true;

            document.body.classList.add('error');
            document.querySelector('.changing').style.display = '';
            document.querySelector('.copy').style.display = 'none';

            hstatus.style.display = 'none';

            for (const value of column.getTable().getSelectedRows()) {
                ddd.push(
                    new Promise((resolve2) => {
                        const
                            p = value.getData().progress || '0',
                            w2 = value.getData().watched || '0';

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
                                type: value.getData().type,
                                watched:
                                    hstatus.value === 'Completed'
                                        ? 1
                                        : ['Planning', 'Skipping'].indexOf(hstatus.value) > -1
                                            ? ''
                                            : '0'
                            });

                            d2.onsuccess = () => {
                                if (hstatus.value === 'Completed') {
                                    value.update({
                                        progress: value.getData().episodes || '0',
                                        status: hstatus.value,
                                        watched: 1
                                    });

                                    resolve2();
                                    return;
                                }

                                if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                    value.update({
                                        progress: '',
                                        status: hstatus.value,
                                        watched: ''
                                    });

                                    resolve2();
                                    return;
                                }

                                value.update({
                                    progress: '0',
                                    status: hstatus.value,
                                    watched: '0'
                                });

                                resolve2();
                            };

                            d2.onerror = () => {
                                db2().get(value.getData().sources).onsuccess = (event) => {
                                    const
                                        result = event.target.result,
                                        status2 = result.status;

                                    if (hstatus.value === 'Completed') {
                                        result.progress =
                                            Number(value.getData().progress) === Number(value.getData().episodes)
                                                ? value.getData().episodes
                                                : value.getData().progress || '0';
                                        result.watched =
                                            status2 === 'Completed'
                                                ? value.getData().watched
                                                : Number(value.getData().watched) + 1;
                                    } else {
                                        if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                            result.progress = '';
                                            result.watched = '';
                                        } else {
                                            if (status2 === 'Planning' || status2 === 'Skipping') {
                                                result.progress = '0';
                                                result.watched = '0';
                                            }
                                        }
                                    }

                                    result.status = hstatus.value;

                                    db2().put(result).onsuccess = () => {
                                        if (hstatus.value === 'Completed') {
                                            value.getElement().dataset.progress = '';
                                            value.getElement().dataset.mismatched = value.getData().episodes && value.getData().status === 'Completed' && Number(value.getElement().dataset.progress || value.getData().progress) !== Number(value.getData().episodes);

                                            // force update
                                            value.update({
                                                progress: ''
                                            });

                                            value.update({
                                                progress:
                                                    Number(value.getData().progress) === Number(value.getData().episodes)
                                                        ? value.getData().episodes
                                                        : result.progress || '0',
                                                status: hstatus.value,
                                                watched:
                                                    status2 === 'Completed'
                                                        ? value.getData().watched
                                                        : Number(value.getData().watched) + 1
                                            });

                                            resolve2();
                                            return;
                                        }

                                        if (hstatus.value === 'Watching' && status2 === 'Completed') {
                                            value.getElement().dataset.progress = '';
                                            value.getElement().dataset.mismatched = value.getData().episodes && value.getData().status === 'Completed' && Number(value.getElement().dataset.progress || value.getData().progress) !== Number(value.getData().episodes);

                                            // force update
                                            value.update({
                                                progress: ''
                                            });

                                            value.update({
                                                progress: '0',
                                                status: hstatus.value
                                            });

                                            resolve2();
                                            return;
                                        }

                                        if (hstatus.value === 'Planning' || hstatus.value === 'Skipping') {
                                            value.getElement().dataset.progress = '';
                                            value.getElement().dataset.mismatched = value.getData().episodes && value.getData().status === 'Completed' && Number(value.getElement().dataset.progress || value.getData().progress) !== Number(value.getData().episodes);

                                            value.update({
                                                progress: '',
                                                status: hstatus.value,
                                                watched: ''
                                            });

                                            resolve2();
                                            return;
                                        }

                                        if (status2 === 'Planning' || status2 === 'Skipping') {
                                            value.update({
                                                progress: '0',
                                                status: hstatus.value,
                                                watched: '0'
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
                                            status: hstatus.value,
                                            watched: w2
                                        });

                                        resolve2();
                                    };
                                };
                            };
                        } else {
                            db2().delete(value.getData().sources).onsuccess = () => {
                                value.getElement().dataset.progress = '';
                                value.getElement().dataset.mismatched = value.getData().episodes && value.getData().status === 'Completed' && Number(value.getElement().dataset.progress || value.getData().progress) !== Number(value.getData().episodes);

                                value.update({
                                    progress: '',
                                    status: '',
                                    watched: ''
                                });

                                resolve2();
                            };
                        }
                    })
                );
            }

            Promise.all(ddd).then(() => {
                disableSelection = false;

                document.body.classList.remove('error');
                document.querySelector('.changing').style.display = 'none';
                document.querySelector('.copy').style.display = 'inline-flex';

                hstatus.style.display = '';
            });
        });

        document.querySelector('.copy').insertAdjacentElement('afterend', hstatus);
        document.head.querySelector('[name="theme-color"]').content = '#a6c6f7';
    } else {
        document.querySelector('header').classList.remove('header-selected');

        column.getTable().getColumn('picture').getElement().querySelector('.tabulator-col-title').title = 'Select all search results';
        column.getTable().getColumn('picture').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
        column.getTable().getColumn('picture').getElement().querySelector('.tabulator-col-title svg').style.fill = '';

        column.getTable().getColumn('picture2').getElement().querySelector('.tabulator-col-title').title = 'Select all search results';
        column.getTable().getColumn('picture2').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
        column.getTable().getColumn('picture2').getElement().querySelector('.tabulator-col-title svg').style.fill = '';

        if (document.querySelector('.header-status')) {
            document.querySelector('.header-status').remove();
        }

        if (document.querySelector('header .menu')) {
            document.querySelector('header .menu').style.display = 'inline-flex';
        }

        if (document.querySelector('.copy')) {
            document.querySelector('.copy').style.display = 'none';
        }

        document.head.querySelector('[name="theme-color"]').content = '#000';
    }
}

function customSort(e, column) {
    e.stopImmediatePropagation();

    if (sorted2.dir === 'asc') {
        if (column.getField() === sorted2.field) {
            if (column.getField() === 'alternative') {
                setTimeout(() => {
                    column.getTable().setSort([
                        {
                            column: 'alternative',
                            dir: 'desc'
                        }
                    ]);
                }, 0);
            } else {
                setTimeout(() => {
                    column.getTable().setSort([
                        {
                            column: column.getField(),
                            dir: 'desc'
                        },
                        {
                            column: 'alternative',
                            dir: 'asc'
                        }
                    ]);
                }, 0);
            }
        } else {
            if (column.getField() === 'alternative') {
                setTimeout(() => {
                    column.getTable().setSort([
                        {
                            column: 'alternative',
                            dir: 'asc'
                        }
                    ]);
                }, 0);
            } else {
                setTimeout(() => {
                    column.getTable().setSort([
                        {
                            column: column.getField(),
                            dir: 'asc'
                        },
                        {
                            column: 'alternative',
                            dir: 'asc'
                        }
                    ]);
                }, 0);
            }
        }
    }

    if (sorted2.dir === 'desc') {
        if (column.getField() === sorted2.field) {
            setTimeout(() => {
                column.getTable().setSort([
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
        } else {
            if (column.getField() === 'alternative') {
                setTimeout(() => {
                    column.getTable().setSort([
                        {
                            column: 'alternative',
                            dir: 'asc'
                        }
                    ]);
                }, 0);
            } else {
                setTimeout(() => {
                    column.getTable().setSort([
                        {
                            column: column.getField(),
                            dir: 'asc'
                        },
                        {
                            column: 'alternative',
                            dir: 'asc'
                        }
                    ]);
                }, 0);
            }
        }
    }
}

function quick() {
    if (index.quick) {
        return ' (quick)';
    }

    return '';
}

if (channel) {
    channel.onmessage = () => {
        error = true;
        document.body.classList.add('.error');
    };
}

new Promise((resolve) => {
    const db = indexedDB.open('tsuzuku', 1);

    db.onupgradeneeded = (event) => {
        // const
        //     index2 = [
        //         'episodes',
        //         'progress',
        //         'season',
        //         'status',
        //         'title',
        //         'type',
        //         'watched'
        //     ],
        //     storage = event.target.result.createObjectStore('tsuzuku', {
        //         keyPath: 'source'
        //     });

        // for (const value of index2) {
        //     storage.createIndex(value, value, {
        //         unique: false
        //     });
        // }

        event.target.result.createObjectStore('tsuzuku', {
            keyPath: 'source'
        });
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
                    type: cursor.value.type,
                    watched: cursor.value.watched
                });

                cursor.continue();
            } else {
                return resolve('success');
            }

            return null;
        };
    };
}).then((value6) => {
    document.querySelector('.loading').innerHTML = 'Fetching database<span class="el">.</span><span class="lip">.</span><span class="sis">.</span>';

    fetch(source)
        .then((response) => response.json())
        .then((data) => {
            document.querySelector('.loading').innerHTML = 'Building table<span class="el">.</span><span class="lip">.</span><span class="sis">.</span>';

            const
                d = data.data,
                set4 = localStorage.getItem('data')
                    ? new Set(JSON.parse(localStorage.getItem('data')))
                    : new Set(),
                set5 = localStorage.getItem('new')
                    ? new Set(JSON.parse(localStorage.getItem('new')))
                    : new Set(),
                set6 = new Set();

            updated = data.lastUpdate;

            if (localStorage.getItem('updated') && localStorage.getItem('updated') !== updated) {
                updated2 = true;
            }

            localStorage.setItem('updated', updated);

            if (value6 === 'error') {
                error = true;
                document.body.classList.add('error');
            }

            for (const ii of status) {
                statuses += `<option>${ii}</option>`;
            }

            if ([...map4].length) {
                hasProgress = true;
            }

            for (const i of d) {
                const
                    source2 = /myanimelist\.net/giv,
                    ss = i.animeSeason.season,
                    tt = new Set(i.tags.map((tags2) => tags2.replace(/&/giv, 'and').replace(/\s/giv, ' ').replace(/-/giv, ' ').replace(/,$/giv, ''))),
                    value = i.sources.filter((sources) => sources.match(source2))[0];

                let c = false,
                    n2 = false,
                    p2 = '',
                    r3 = false,
                    s = '',
                    s2 = '',
                    ttt = '',
                    w2 = '';

                if (!i.sources.filter((sources) => sources.match(source2)).length) {
                    continue;
                }

                if (set6.has(value)) {
                    continue;
                }

                if (!JSON.parse(localStorage.getItem('tsuzuku')).delisted) {
                    if (i.picture === 'https://cdn.myanimelist.net/images/qm_50.gif') {
                        continue;
                    }

                    for (const td of tagsDelisted) {
                        if ([...tt].indexOf(td) > -1) {
                            c = true;
                            break;
                        }
                    }

                    if (c) {
                        continue;
                    }
                }

                if (ss !== 'UNDEFINED') {
                    s = `${ss.replace(ss.substr(1), ss.substr(1).toLowerCase())} `;
                }

                if (i.animeSeason.year) {
                    s += i.animeSeason.year;
                } else {
                    s = '';
                }

                for (const value2 of [...tt]) {
                    if (database2.has(value2)) {
                        database2.set(value2, database2.get(value2) + 1);
                    } else {
                        database2.set(value2, 1);
                    }

                    if (['borderline h', 'hentai'].indexOf(value2) > -1) {
                        r3 = true;
                    }
                }

                if (updated2) {
                    if (!set4.has(value)) {
                        n2 = true;
                        data5.push(value);
                    }
                } else {
                    if (set5.has(value)) {
                        n2 = true;
                    }
                }

                if (map4.has(value)) {
                    p2 = map4.get(value).progress;
                    s2 = map4.get(value).status;
                    w2 = map4.get(value).watched;

                    map4.delete(value);
                }

                if (i.type !== 'UNKNOWN') {
                    if (['MOVIE', 'SPECIAL'].indexOf(i.type) > -1) {
                        ttt = i.type.replace(i.type.substr(1), i.type.substr(1).toLowerCase());
                    } else {
                        ttt = i.type;
                    }
                }

                years.add((i.animeSeason.year || 'tba').toString());

                database.push({
                    alternative: i.title,
                    deleted: false,
                    episodes: i.episodes || '',
                    new: n2,
                    ongoing: i.status === 'ONGOING',
                    picture: i.picture.replace(i.picture.substr(i.picture.lastIndexOf('.')), '.webp'),
                    progress: p2,
                    r18: r3,
                    relations: [
                        ...i.sources.filter((sources) => sources.match(source2) && sources !== value),
                        ...i.relations.filter((relations) => relations.match(source2))
                    ],
                    relevancy: 1,
                    season: s,
                    sources: value,
                    status: s2,
                    synonyms: i.synonyms,
                    tags: [...tt],
                    title: i.title,
                    type: ttt,
                    watched: w2
                });

                data4.push(value);
                set6.add(value);
            }

            for (const [key, value] of map4.entries()) {
                database.push({
                    alternative: value.title,
                    deleted: true,
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
                    type: value.type,
                    watched: value.watched
                });
            }

            localStorage.setItem('data', JSON.stringify(data4));

            if (updated2) {
                localStorage.setItem('new', JSON.stringify(data5));
            }

            years2.push(...years);
            years2.sort();

            // tabulator tweak to fix incorrect behavior when scrolling
            // doesn't work starting 66

            // RowManager.prototype.initialize = function () {
            //     const self = this;

            //     self.setRenderMode();
            //     self.element.appendChild(self.tableElement);
            //     self.firstRender = true;

            //     self.element.addEventListener('scroll', () => {
            //         const
            //             dir = self.scrollTop > self.element.scrollTop,
            //             left = self.element.scrollLeft,
            //             top = self.element.scrollTop;

            //         if (self.scrollLeft !== left) {
            //             self.table.options.scrollHorizontal(left);
            //         }

            //         self.scrollLeft = left;

            //         if (self.scrollTop !== top) {
            //             self.scrollTop = top;
            //             self.scrollVertical(dir);
            //             self.table.options.scrollVertical(top);
            //         }
            //     });
            // };

            // Row.prototype.setCellHeight = function () {
            //     // error if set to null
            // };

            t = new Tabulator('.database-container', {
                clipboard: 'copy',
                clipboardCopyConfig: {
                    formatCells: false
                },
                clipboardCopyRowRange: 'selected',
                clipboardCopyStyled: false,
                columnDefaults: {
                    headerSortTristate: true,
                    vertAlign: 'middle'
                },
                columnHeaderSortMulti: false,
                columns: [
                    {
                        // padding
                        clipboard: false,
                        field: 'color',
                        frozen: true,
                        headerSort: false,
                        minWidth: 4,
                        width: 4
                    },
                    {
                        // padding
                        clipboard: false,
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
                        clipboard: false,
                        field: 'picture',
                        formatter: function (cell) {
                            cell.getElement().tabIndex = 0;

                            return (
                                // `<svg class="blank" viewBox="${svg.viewBox}" width="17" height="17">${svg.blank}</svg>` +
                                `<svg class="check" viewBox="${svg.viewBox}" width="17" height="17">${svg.check}</svg>` +
                                // replace with document.createElement('img')
                                // `<img src="${cell.getValue().replace(cell.getValue().substr(cell.getValue().lastIndexOf('.')), '.webp')}" loading="lazy" alt style="height: 40px; object-fit: cover; user-select: none; width: 40px;" onerror="this.src = &quot;${cell.getValue()}&quot;;">`
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
                        titleFormatter: function (h) {
                            h.getElement().title = 'Select all search results';

                            return `<svg viewBox="${svg.viewBox}" width="17" height="17">${svg.blank}</svg>`;

                            // return (
                            //     '<div title="Select all search results">' +
                            //         `<svg viewBox="${svg.viewBox}" width="17" height="17">${svg.blank}</svg>` +
                            //     '</div>'
                            // );
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
                        clipboard: false,
                        field: 'picture2',
                        formatter: function (cell) {
                            cell.getElement().tabIndex = 0;

                            return (
                                '<span class="blank" title="Select">' +
                                    `<svg viewBox="${svg.viewBox}" width="17" height="17">${svg.blank}</svg>` +
                                '</span>' +
                                '<span class="check" title="Deselect">' +
                                    `<svg viewBox="${svg.viewBox}" width="17" height="17">${svg.check}</svg>` +
                                '</span>'
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
                        titleFormatter: function (h) {
                            h.getElement().title = 'Select all search results';

                            return `<svg viewBox="${svg.viewBox}" width="17" height="17">${svg.blank}</svg>`;

                            // return (
                            //     '<div title="Select all search results">' +
                            //         `<svg viewBox="${svg.viewBox}" width="17" height="17">${svg.blank}</svg>` +
                            //     '</div>'
                            // );
                        },
                        visible: !JSON.parse(localStorage.getItem('tsuzuku')).thumbnails,
                        width: 17
                    },
                    {
                        // padding
                        cellClick: function (e, cell) {
                            const div = document.createElement('div');

                            let s2 = '',
                                ttt = '';

                            for (const s of [cell.getRow().getData().title, ...cell.getRow().getData().synonyms]) {
                                s2 += `<div>${removeReserved(s)}</div>`;
                            }

                            for (const tt of cell.getRow().getData().tags) {
                                ttt += `<div data-value="${tt}"><a href="../?query=${escape(encodeURIComponent(`tag:${tt.replace(/\s/giv, '_')} `))}">${tt}</a><span style="color: var(--disabled);">${addCommas(database2.get(tt))}</span></div>`;
                            }

                            div.id = 'popup';
                            div.style.alignItems = 'center';
                            div.style.display = 'flex';
                            div.style.height = '100%';
                            div.style.justifyContent = 'center';
                            div.style.position = 'absolute';
                            div.style.width = '100%';
                            div.style.zIndex = 6;
                            div.innerHTML =
                                '<div id="overlay3" style="background: var(--background); height: 100%; opacity: 0.8; width: 100%;"></div>' +
                                '<div id="popup-main">' +
                                    '<div id="popup-visual">' +
                                        '<div>' +
                                            '<div class="popup-header">Visual</div>' +
                                            `<div><img src="${cell.getRow().getData().picture}"></div>` +
                                        '</div>' +
                                    '</div>' +
                                    '<div id="popup-synonyms">' +
                                        '<div>' +
                                            `<div class="popup-header">Synonyms</div>${s2}` +
                                        '</div>' +
                                    '</div>' +
                                    '<div id="popup-tags">' +
                                        '<div>' +
                                            `<div class="popup-header">Tags</div>${ttt}` +
                                        '</div>' +
                                    '</div>' +
                                '</div>';

                            div.addEventListener('click', (e2) => {
                                if (e2.target.id) {
                                    div.remove();
                                }
                            });

                            div.querySelectorAll('#popup-tags > div > div:not(.popup-header)').forEach((element) => {
                                element.addEventListener('click', () => {
                                    document.querySelector('.search').value = `tag:${element.dataset.value.replace(/\s/giv, '_')} `;
                                    searchFunction(cell.getTable());

                                    div.remove();
                                });

                                element.querySelector('a').addEventListener('click', (e2) => {
                                    e2.preventDefault();
                                });
                            });

                            document.body.appendChild(div);
                        },
                        clipboard: false,
                        frozen: true,
                        headerSort: false,
                        minWidth: 19,
                        width: 19
                    },
                    {
                        // padding
                        clipboard: false,
                        headerSort: false,
                        minWidth: 19,
                        width: 19
                    },
                    {
                        clipboard: false,
                        field: 'alternative',
                        formatter: function (cell) {
                            const
                                div = document.createElement('div'),
                                fragment = new DocumentFragment(),
                                m = document.createElement('a'),
                                m2 = 'is:mismatched ',
                                span = document.createElement('span');

                            if (!f.length || (f.length && f[0].field === 'title')) {
                                span.innerHTML = removeReserved(cell.getValue());
                            } else {
                                span.innerHTML = cell.getValue();
                            }

                            m.classList.add('mismatched');
                            m.href = `./?query=${escape(encodeURIComponent(m2))}`;
                            m.innerHTML = 'Mismatched';
                            m.addEventListener('click', (e) => {
                                e.preventDefault();

                                document.querySelector('.search').value = m2;
                                searchFunction(cell.getTable());
                            });

                            div.classList.add('indicator');
                            div.style.position = 'absolute';
                            div.style.bottom = 0;
                            div.style.height = '2px';
                            div.style.maxWidth = '100%';

                            if (cell.getRow().getData().r18) {
                                const
                                    r18 = document.createElement('a'),
                                    v2 = 'is:r18 ';

                                r18.classList.add('r18');
                                r18.href = `./?query=${escape(encodeURIComponent(v2))}`;
                                r18.innerHTML = 'R18';
                                r18.addEventListener('click', (e) => {
                                    e.preventDefault();

                                    document.querySelector('.search').value = v2;
                                    searchFunction(cell.getTable());
                                });

                                span.appendChild(r18);
                            }

                            if (cell.getRow().getData().ongoing) {
                                const
                                    o = document.createElement('a'),
                                    v2 = 'is:ongoing ';

                                o.classList.add('ongoing');
                                o.href = `./?query=${escape(encodeURIComponent(v2))}`;
                                o.innerHTML = 'Ongoing';
                                o.addEventListener('click', (e) => {
                                    e.preventDefault();

                                    document.querySelector('.search').value = v2;
                                    searchFunction(cell.getTable());
                                });

                                span.appendChild(o);
                            }

                            if (cell.getRow().getData().new) {
                                const
                                    n = document.createElement('a'),
                                    v2 = 'is:new ';

                                n.classList.add('new');
                                n.href = `./?query=${escape(encodeURIComponent(v2))}`;
                                n.innerHTML = 'New';
                                n.addEventListener('click', (e) => {
                                    e.preventDefault();

                                    document.querySelector('.search').value = v2;
                                    searchFunction(cell.getTable());
                                });

                                span.appendChild(n);
                            }

                            if (cell.getRow().getData().deleted) {
                                const
                                    d2 = document.createElement('a'),
                                    v2 = 'is:deleted ';

                                d2.classList.add('deleted');
                                d2.href = `./?query=${escape(encodeURIComponent(v2))}`;
                                d2.innerHTML = 'Deleted';
                                d2.addEventListener('click', (e) => {
                                    e.preventDefault();

                                    document.querySelector('.search').value = v2;
                                    searchFunction(cell.getTable());
                                });

                                span.appendChild(d2);
                            }

                            span.appendChild(m);

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
                        clipboard: true,
                        field: 'title',
                        titleClipboard: 'Title',
                        visible: false
                    },
                    {
                        clipboard: true,
                        field: 'r18',
                        titleClipboard: 'R18',
                        visible: false
                    },
                    {
                        clipboard: true,
                        field: 'ongoing',
                        titleClipboard: 'Ongoing',
                        visible: false
                    },
                    {
                        // padding
                        clipboard: false,
                        headerSort: false,
                        minWidth: 19,
                        width: 19
                    },
                    {
                        field: 'sources',
                        formatter: function (cell) {
                            const a = document.createElement('a');

                            a.href = cell.getValue();
                            a.classList.add('source');
                            a.title = 'Go to external database';
                            a.rel = 'noreferrer';
                            a.target = '_blank';
                            a.innerHTML = `<svg viewBox="${svg.viewBox}" width="17" height="17">${svg.link}</svg>`;

                            return a;
                        },
                        headerHozAlign: 'center',
                        headerSort: false,
                        hozAlign: 'center',
                        minWidth: 17,
                        titleClipboard: 'Source',
                        width: 17
                    },
                    {
                        // padding
                        clipboard: false,
                        headerSort: false,
                        minWidth: 19,
                        width: 19
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
                        formatter: function (cell) {
                            return addCommas(cell.getValue());
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
                                v = 'season:tba year:tba';
                            }

                            v += ' ';

                            a.href = `./?query=${escape(encodeURIComponent(v))}`;
                            a.innerHTML = value
                                ? cell.getValue()
                                : 'TBA';
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
                        // padding
                        clipboard: false,
                        headerSort: false,
                        minWidth: 19,
                        width: 19
                    },
                    {
                        clipboard: false,
                        formatter: function (cell) {
                            const
                                relations = document.createElement('a'),
                                v = `related:${cell.getRow().getData().sources.slice('https://myanimelist.net/anime/'.length)} `;

                            relations.classList.add('relations');
                            relations.href = `./?query=${escape(encodeURIComponent(v))}`;
                            relations.title = 'Relations';
                            relations.innerHTML = `<svg viewBox="${svg.viewBox}" width="17" height="17">${svg.relations}</svg>`;
                            relations.addEventListener('click', (e) => {
                                e.preventDefault();

                                document.querySelector('.search').value = v;
                                searchFunction(cell.getTable());
                            });

                            return relations;
                        },
                        headerHozAlign: 'center',
                        headerSort: false,
                        hozAlign: 'center',
                        minWidth: 17,
                        width: 17
                    },
                    {
                        // padding
                        clipboard: false,
                        headerSort: false,
                        minWidth: 19,
                        width: 19
                    },
                    {
                        clipboard: false,
                        formatter: function (cell) {
                            const
                                similar = document.createElement('a'),
                                v = `similar:${cell.getRow().getData().sources.slice('https://myanimelist.net/anime/'.length)} `;

                            similar.classList.add('similar');
                            similar.href = `./?query=${escape(encodeURIComponent(v))}`;
                            similar.title = 'Similarities';
                            similar.innerHTML = `<svg viewBox="${svg.viewBox}" width="17" height="17">${svg.similar}</svg>`;
                            similar.addEventListener('click', (e) => {
                                e.preventDefault();

                                document.querySelector('.search').value = v;
                                searchFunction(cell.getTable());
                            });

                            return similar;
                        },
                        headerHozAlign: 'center',
                        headerSort: false,
                        hozAlign: 'center',
                        minWidth: 17,
                        width: 17
                    },
                    {
                        // padding
                        clipboard: false,
                        headerSort: false,
                        minWidth: 19,
                        width: 19
                    },
                    {
                        editable: function () {
                            return false;
                        },
                        editor: function (cell, rendered, success) {
                            if (disableSelection || error) {
                                return false;
                            }

                            const input = document.createElement('input');

                            input.type = 'number';
                            input.min = 0;
                            input.max = 9999;
                            input.placeholder = 0;
                            input.autocomplete = 'off';
                            input.value = cell.getValue();
                            input.title = 'Enter times watched';

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
                                            result.watched = '0';
                                        } else if (input.value >= 9999) {
                                            result.watched = 9999;
                                        } else {
                                            result.watched = input.value;
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
                        field: 'watched',
                        formatter: function (cell) {
                            const span = document.createElement('span');

                            cell.getElement().tabIndex = -1;

                            if (['Completed', 'Dropped', 'Paused', 'Watching'].indexOf(cell.getRow().getData().status) > -1) {
                                span.tabIndex = 0;
                            }

                            span.innerHTML = addCommas(cell.getValue());
                            span.addEventListener('click', () => {
                                if (disableSelection || error) {
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
                        title: 'Watched',
                        width: 100
                    },
                    {
                        editable: function () {
                            return false;
                        },
                        editor: function (cell, rendered, success) {
                            if (disableSelection || error) {
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
                                            cell.getRow().getCell('alternative').getElement().querySelector('.mismatched').style.display =
                                                cell.getRow().getData().status === 'Completed' && Number(input.value) !== Number(cell.getRow().getData().episodes)
                                                    ? ''
                                                    : 'none';

                                            if (Number(input.value) === cell.getRow().getData().episodes) {
                                                if (cell.getRow().getData().status === 'Completed') {
                                                    cell.getRow().getElement().dataset.mismatched = false;
                                                    return;
                                                }

                                                if (!cell.getRow().getData().ongoing) {
                                                    db2().get(cell.getRow().getData().sources).onsuccess = (event2) => {
                                                        const result2 = event2.target.result;

                                                        result2.status = 'Completed';
                                                        result2.watched = Number(result2.watched) + 1;

                                                        db2().put(result2).onsuccess = () => {
                                                            cell.getRow().update({
                                                                status: 'Completed',
                                                                watched: Number(cell.getRow().getData().watched) + 1
                                                            });
                                                        };
                                                    };
                                                }
                                            } else {
                                                if (['Completed', 'Watching'].indexOf(cell.getRow().getData().status) > -1) {
                                                    cell.getRow().getElement().dataset.mismatched = cell.getRow().getData().status === 'Completed' && Number(cell.getRow().getElement().dataset.progress || cell.getRow().getData().progress) !== Number(cell.getRow().getData().episodes);
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

                                cell.getElement().querySelector('span:not(.add)').title = `${addCommas(input.value / cell.getRow().getData().episodes, 'percent')}`;
                            });

                            rendered(() => {
                                input.focus();
                            });

                            return input;
                        },
                        field: 'progress',
                        formatter: function (cell) {
                            const
                                div = document.createElement('div'),
                                div2 = document.createElement('div'),
                                fragment = new DocumentFragment(),
                                separator = document.createElement('div'),
                                span = document.createElement('span'),
                                span2 = document.createElement('span');

                            cell.getElement().tabIndex = -1;

                            if (['Completed', 'Dropped', 'Paused', 'Watching'].indexOf(cell.getRow().getData().status) > -1) {
                                span.tabIndex = 0;
                            }

                            span.innerHTML = addCommas(cell.getValue());
                            span.addEventListener('click', () => {
                                if (disableSelection || error) {
                                    return;
                                }

                                if (['', 'Planning', 'Skipping'].indexOf(cell.getRow().getData().status) > -1) {
                                    return;
                                }

                                cell.edit(true);
                            });

                            div.style.alignItems = 'center';
                            div.style.display = 'inline-flex';
                            div.appendChild(span);

                            fragment.appendChild(div);

                            if (cell.getRow().getData().status === 'Watching') {
                                span2.classList.add('add');
                                span2.tabIndex = 0;
                                span2.title = '+1';
                                span2.innerHTML = `<svg viewBox="${svg.viewBox}" height="17" width="17">${svg.add}</svg>`;

                                span2.querySelector('svg').addEventListener('dblclick', () => {
                                    getSelection().removeAllRanges();
                                });

                                span2.querySelector('svg').addEventListener('click', () => {
                                    if (disableSelection || error) {
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
                                                cell.getElement().querySelector('span:not(.add)').title = `${addCommas(value / cell.getRow().getData().episodes, 'percent')}`;

                                                if (value === cell.getRow().getData().episodes) {
                                                    if (cell.getRow().getData().status === 'Completed') {
                                                        cell.getRow().getElement().dataset.mismatched = false;
                                                        return;
                                                    }

                                                    if (!cell.getRow().getData().ongoing) {
                                                        db2().get(cell.getRow().getData().sources).onsuccess = (event2) => {
                                                            const result2 = event2.target.result;

                                                            result2.status = 'Completed';
                                                            result2.watched = Number(result2.watched) + 1;

                                                            db2().put(result2).onsuccess = () => {
                                                                // force update
                                                                cell.getRow().update({
                                                                    progress: ''
                                                                });

                                                                cell.getRow().update({
                                                                    progress: value,
                                                                    status: 'Completed',
                                                                    watched: Number(cell.getRow().getData().watched) + 1
                                                                });
                                                            };
                                                        };
                                                    }
                                                } else {
                                                    if (['Completed', 'Watching'].indexOf(cell.getRow().getData().status) > -1) {
                                                        cell.getRow().getElement().dataset.mismatched = cell.getRow().getData().status === 'Completed' && Number(cell.getRow().getElement().dataset.progress || cell.getRow().getData().progress) !== Number(cell.getRow().getData().episodes);
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

                                div.style.width = 'calc((100% - 9.5px) / 2)';
                                separator.style.width = '9.5px';

                                div2.style.alignItems = 'center';
                                div2.style.display = 'inline-flex';
                                div2.style.width = 'calc((100% - 9.5px) / 2)';
                                div2.appendChild(span2);

                                fragment.appendChild(separator);
                                fragment.appendChild(div2);
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

                            select.innerHTML = statuses;
                            select.value = cell.getValue();
                            select.title = 'Status';

                            select.addEventListener('mouseenter', () => {
                                select.disabled = disableSelection || error;
                            });

                            select.addEventListener('change', () => {
                                if (disableSelection || error) {
                                    return;
                                }

                                const
                                    p = cell.getRow().getData().progress || '0',
                                    w2 = cell.getRow().getData().watched || '0';

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
                                        type: cell.getRow().getData().type,
                                        watched:
                                            select.value === 'Completed'
                                                ? 1
                                                : ['Planning', 'Skipping'].indexOf(select.value) > -1
                                                    ? ''
                                                    : '0'
                                    });

                                    d2.onsuccess = () => {
                                        channelMessage();

                                        if (select.value === 'Completed') {
                                            cell.getRow().update({
                                                progress: cell.getRow().getData().episodes || '0',
                                                status: select.value,
                                                watched: 1
                                            });

                                            return;
                                        }

                                        if (select.value === 'Planning' || select.value === 'Skipping') {
                                            cell.getRow().update({
                                                progress: '',
                                                status: select.value,
                                                watched: ''
                                            });

                                            return;
                                        }

                                        cell.getRow().update({
                                            progress: '0',
                                            status: select.value,
                                            watched: '0'
                                        });
                                    };

                                    d2.onerror = () => {
                                        db2().get(cell.getRow().getData().sources).onsuccess = (event) => {
                                            const
                                                result = event.target.result,
                                                status2 = result.status;

                                            if (select.value === 'Completed') {
                                                result.progress =
                                                    Number(cell.getRow().getData().progress) === Number(cell.getRow().getData().episodes)
                                                        ? cell.getRow().getData().episodes
                                                        : cell.getRow().getData().progress || '0';
                                                result.watched =
                                                    status2 === 'Completed'
                                                        ? cell.getRow().getData().watched
                                                        : Number(cell.getRow().getData().watched) + 1;
                                            } else {
                                                if (select.value === 'Planning' || select.value === 'Skipping') {
                                                    result.progress = '';
                                                    result.watched = '';
                                                } else {
                                                    if (status2 === 'Planning' || status2 === 'Skipping') {
                                                        result.progress = '0';
                                                        result.watched = '0';
                                                    }
                                                }
                                            }

                                            result.status = select.value;

                                            db2().put(result).onsuccess = () => {
                                                channelMessage();

                                                if (select.value === 'Completed') {
                                                    cell.getRow().getElement().dataset.progress = '';
                                                    cell.getRow().getElement().dataset.mismatched = cell.getRow().getData().episodes && cell.getRow().getData().status === 'Completed' && Number(cell.getRow().getElement().dataset.progress || cell.getRow().getData().progress) !== Number(cell.getRow().getData().episodes);

                                                    // force update
                                                    cell.getRow().update({
                                                        progress: ''
                                                    });

                                                    cell.getRow().update({
                                                        progress:
                                                            Number(cell.getRow().getData().progress) === Number(cell.getRow().getData().episodes)
                                                                ? cell.getRow().getData().episodes
                                                                : result.progress || '0',
                                                        status: select.value,
                                                        watched:
                                                            status2 === 'Completed'
                                                                ? cell.getRow().getData().watched
                                                                : Number(cell.getRow().getData().watched) + 1
                                                    });

                                                    return;
                                                }

                                                if (select.value === 'Watching' && status2 === 'Completed') {
                                                    cell.getRow().getElement().dataset.progress = '';
                                                    cell.getRow().getElement().dataset.mismatched = cell.getRow().getData().episodes && cell.getRow().getData().status === 'Completed' && Number(cell.getRow().getElement().dataset.progress || cell.getRow().getData().progress) !== Number(cell.getRow().getData().episodes);

                                                    // force update
                                                    cell.getRow().update({
                                                        progress: ''
                                                    });

                                                    cell.getRow().update({
                                                        progress: '0',
                                                        status: select.value
                                                    });

                                                    return;
                                                }

                                                if (select.value === 'Planning' || select.value === 'Skipping') {
                                                    cell.getRow().getElement().dataset.progress = '';
                                                    cell.getRow().getElement().dataset.mismatched = cell.getRow().getData().episodes && cell.getRow().getData().status === 'Completed' && Number(cell.getRow().getElement().dataset.progress || cell.getRow().getData().progress) !== Number(cell.getRow().getData().episodes);

                                                    cell.getRow().update({
                                                        progress: '',
                                                        status: select.value,
                                                        watched: ''
                                                    });

                                                    return;
                                                }

                                                if (status2 === 'Planning' || status2 === 'Skipping') {
                                                    cell.getRow().update({
                                                        progress: '0',
                                                        status: select.value,
                                                        watched: '0'
                                                    });

                                                    return;
                                                }

                                                // force update
                                                cell.getRow().update({
                                                    progress: ''
                                                });

                                                cell.getRow().update({
                                                    progress: p,
                                                    status: select.value,
                                                    watched: w2
                                                });
                                            };
                                        };
                                    };
                                } else {
                                    db2().delete(cell.getRow().getData().sources).onsuccess = () => {
                                        cell.getRow().getElement().dataset.progress = '';
                                        cell.getRow().getElement().dataset.mismatched = cell.getRow().getData().episodes && cell.getRow().getData().status === 'Completed' && Number(cell.getRow().getElement().dataset.progress || cell.getRow().getData().progress) !== Number(cell.getRow().getData().episodes);

                                        cell.getRow().update({
                                            progress: '',
                                            status: '',
                                            watched: ''
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
                        clipboard: false,
                        field: 'relevancy',
                        visible: false
                    },
                    {
                        // padding
                        clipboard: false,
                        headerSort: false,
                        minWidth: 19,
                        width: 19
                    }
                ],
                data: database,
                debugInitialization: false,
                headerSortClickElement: 'icon',
                headerSortElement: '',
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

                    row.getElement().dataset.deleted = row.getData().deleted;
                    row.getElement().dataset.mismatched = row.getData().episodes && row.getData().status === 'Completed' && Number(row.getElement().dataset.progress || row.getData().progress) !== Number(row.getData().episodes);
                    row.getElement().dataset.status = row.getData().status;

                    switch (row.getData().status) {
                        case 'Completed':
                        case 'Dropped':
                        case 'Paused':
                        case 'Watching':
                            width = Number(row.getElement().dataset.progress || row.getData().progress) / Number(row.getData().episodes);
                            break;

                        default:
                            width = 0;
                            break;
                    }

                    row.getCell('alternative').getElement().querySelector('.indicator').style.width = `${width * 100}%`;
                    row.getCell('alternative').getElement().querySelector('.mismatched').style.display =
                        row.getElement().dataset.mismatched === 'true'
                            ? ''
                            : 'none';

                    if (row.getCell('progress').getElement().querySelector('span:not(.add)')) {
                        row.getCell('progress').getElement().querySelector('span:not(.add)').title = `${addCommas(width, 'percent')}`;
                    }
                },
                sortOrderReverse: true
            });

            t.on('dataFiltered', (filters, rows) => {
                const ids = [];

                f = filters;
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

                if (t.getSelectedRows().length) {
                    for (const value of t.getSelectedRows()) {
                        ids.push(value.getData().sources.slice('https://myanimelist.net/anime/'.length));
                    }

                    document.querySelector('.count-selected').href = `./?query=${escape(encodeURIComponent(`id:${ids.join('|')} `))}`;
                    document.querySelector('.count-selected').innerHTML = `${addCommas(t.getSelectedRows().length)} selected`;
                }

                if (t.getSelectedRows().length > selected.ss.length) {
                    document.querySelector('.selected-count span').innerHTML = `${addCommas(selected.ss.length)} from search results`;
                } else {
                    document.querySelector('.selected-count span').innerHTML = '';
                }

                if (selected.s) {
                    t.getColumn('picture').getElement().querySelector('.tabulator-col-title').title = 'Deselect all search results';
                    t.getColumn('picture').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.check;
                    t.getColumn('picture').getElement().querySelector('.tabulator-col-title svg').style.fill = 'var(--selected-header)';

                    t.getColumn('picture2').getElement().querySelector('.tabulator-col-title').title = 'Deselect all search results';
                    t.getColumn('picture2').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.check;
                    t.getColumn('picture2').getElement().querySelector('.tabulator-col-title svg').style.fill = 'var(--selected-header)';
                } else {
                    if (selected.ss.length) {
                        t.getColumn('picture').getElement().querySelector('.tabulator-col-title').title = 'Deselect all search results';
                        t.getColumn('picture').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.indeterminate;
                        t.getColumn('picture').getElement().querySelector('.tabulator-col-title svg').style.fill = 'var(--selected-header)';

                        t.getColumn('picture2').getElement().querySelector('.tabulator-col-title').title = 'Deselect all search results';
                        t.getColumn('picture2').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.indeterminate;
                        t.getColumn('picture2').getElement().querySelector('.tabulator-col-title svg').style.fill = 'var(--selected-header)';
                    } else {
                        t.getColumn('picture').getElement().querySelector('.tabulator-col-title').title = 'Select all search results';
                        t.getColumn('picture').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
                        t.getColumn('picture').getElement().querySelector('.tabulator-col-title svg').style.fill = '';

                        t.getColumn('picture2').getElement().querySelector('.tabulator-col-title').title = 'Select all search results';
                        t.getColumn('picture2').getElement().querySelector('.tabulator-col-title svg').innerHTML = svg.blank;
                        t.getColumn('picture2').getElement().querySelector('.tabulator-col-title svg').style.fill = '';
                    }
                }

                if (index.dimension) {
                    if (index.quick) {
                        // if (dimension2) {
                        //     for (const value of dimension2) {
                        //         value.update({
                        //             alternative: value.getData().title,
                        //             relevancy: 1
                        //         });
                        //     }

                        //     dimension2 = null;
                        // }

                        if (dimension2) {
                            for (const value of dimension2) {
                                if (value.getData().alternative === value.getData().title && value.getData().relevancy === 1) {
                                    continue;
                                }

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

                        // dimension2 = rows;
                        dimension2 = t.getRows();
                    }
                } else {
                    // if (dimension2) {
                    //     for (const value of dimension2) {
                    //         value.update({
                    //             alternative: value.getData().title,
                    //             relevancy: 1
                    //         });
                    //     }

                    //     dimension2 = null;
                    // }

                    if (dimension2) {
                        for (const value of dimension2) {
                            if (value.getData().alternative === value.getData().title && value.getData().relevancy === 1) {
                                continue;
                            }

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

                document.querySelector('.nothing .enter').href = `./?query=${escape(encodeURIComponent(document.querySelector('.search').value))}`;
                document.querySelector('.nothing .enter').innerHTML = 'Show full results';

                if (index.quick) {
                    document.querySelector('.nothing .related').style.display = '';

                    if (rows.length) {
                        document.querySelector('.tabulator').style.display = '';
                        document.querySelector('.nothing .results').innerHTML =
                            rows.length === 1
                                ? `1 result${quick()}`
                                : `${addCommas(rows.length)} results${quick()}`;

                        if (filters.length && filters[0].value) {
                            document.querySelector('.nothing .current').style.display = '';

                            document.querySelector('.nothing .enter').href = `./?query=${escape(encodeURIComponent(document.querySelector('.search').value))}`;
                            document.querySelector('.nothing .enter').innerHTML = 'Show full results';
                            document.querySelector('.nothing .enter').style.display = 'inline-flex';
                        } else {
                            document.querySelector('.nothing .results').innerHTML = `${addCommas(rows.length)} results`;
                            document.querySelector('.nothing .current').style.display = 'inline-flex';

                            document.querySelector('.nothing .enter').href = './';
                            document.querySelector('.nothing .enter').innerHTML = '';
                            document.querySelector('.nothing .enter').style.display = '';
                        }
                    } else {
                        document.querySelector('.tabulator').style.display = 'none';

                        if (index.qualifiers) {
                            document.querySelector('.nothing .results').innerHTML = 'Press Enter to use search filters';
                        } else {
                            document.querySelector('.nothing .results').innerHTML = `0 results${quick()}`;
                        }

                        document.querySelector('.nothing .current').style.display = '';

                        document.querySelector('.nothing .enter').href = `./?query=${escape(encodeURIComponent(document.querySelector('.search').value))}`;
                        document.querySelector('.nothing .enter').innerHTML = 'Show full results';
                        document.querySelector('.nothing .enter').style.display = 'inline-flex';
                    }

                    document.querySelector('.seasonal .previous').style.display = '';
                    document.querySelector('.seasonal .next').style.display = '';
                } else {
                    if (rows.length) {
                        document.querySelector('.tabulator').style.display = '';
                        document.querySelector('.nothing .results').innerHTML =
                            index.random
                                ? `${addCommas(rows.length)} of ${addCommas(index.random)} results`
                                : rows.length === 1
                                    ? '1 result'
                                    : `${addCommas(rows.length)} results`;

                        if (index.random) {
                            document.querySelector('.nothing .current').style.display = '';

                            document.querySelector('.nothing .enter').href = `./?query=${escape(encodeURIComponent(document.querySelector('.search').value))}`;
                            document.querySelector('.nothing .enter').innerHTML = 'Randomize';
                            document.querySelector('.nothing .enter').style.display = 'inline-flex';
                        } else {
                            if (filters.length && filters[0].value) {
                                document.querySelector('.nothing .current').style.display = '';

                                document.querySelector('.nothing .enter').href = './';
                                document.querySelector('.nothing .enter').innerHTML = '';
                                document.querySelector('.nothing .enter').style.display = '';
                            } else {
                                document.querySelector('.nothing .current').style.display = 'inline-flex';

                                document.querySelector('.nothing .enter').href = './';
                                document.querySelector('.nothing .enter').innerHTML = '';
                                document.querySelector('.nothing .enter').style.display = '';
                            }
                        }

                        if ([4, 5].indexOf(index.related) > -1) {
                            document.querySelector('.nothing .current').style.display = '';

                            document.querySelector('.nothing .related').style.display = 'inline-flex';

                            if (index.related === 4) {
                                document.querySelector('.nothing .related').href = `./?query=${escape(encodeURIComponent(document.querySelector('.search').value))}`;
                                document.querySelector('.nothing .related').innerHTML = 'Show also indirect';
                            } else {
                                document.querySelector('.nothing .related').href = `./?query=${escape(encodeURIComponent(searchReplace(document.querySelector('.search').value, '(?:^|\\s)related2:[1-9][0-9]*(?:\\s|$)', 'related2', 'related')))}`;
                                document.querySelector('.nothing .related').innerHTML = 'Show only direct';
                            }

                            document.querySelector('.nothing .enter').href = './';
                            document.querySelector('.nothing .enter').innerHTML = '';
                            document.querySelector('.nothing .enter').style.display = '';

                            document.querySelector('.seasonal .previous').style.display = '';
                            document.querySelector('.seasonal .next').style.display = '';
                        }
                    } else {
                        document.querySelector('.tabulator').style.display = 'none';
                        document.querySelector('.nothing .related').style.display = '';

                        if (index.message) {
                            document.querySelector('.nothing .results').innerHTML = index.message;
                        } else {
                            document.querySelector('.nothing .results').innerHTML = '0 results';
                        }

                        document.querySelector('.nothing .current').style.display = '';

                        document.querySelector('.nothing .enter').href = './';
                        document.querySelector('.nothing .enter').innerHTML = '';
                        document.querySelector('.nothing .enter').style.display = '';

                        document.querySelector('.seasonal .previous').style.display = '';
                        document.querySelector('.seasonal .next').style.display = '';
                    }

                    if (index.previous) {
                        document.querySelector('.seasonal .previous').style.display = 'inline-flex';
                    }

                    if (index.next) {
                        document.querySelector('.seasonal .next').style.display = 'inline-flex';
                    }
                }
            });

            t.on('dataProcessed', () => {
                document.querySelector('.tabulator').style.display = 'none';
                document.querySelector('.nothing').style.display = '';
                document.querySelector('.loading').innerHTML = `Database as of ${updated}`;
                document.querySelector('.reload').style.display = 'inline-flex';
                document.querySelector('.top-container').style.display = 'inline-flex';

                if (location.hash) {
                    document.querySelector('.search').value = decodeURIComponent(location.hash.slice(1));
                    document.querySelector('.clear').style.display = 'inline-flex';
                    document.querySelector('.blur').style.display = '';

                    index.dimension = null;
                    index.qualifiers = qualifiers(document.querySelector('.search').value.trim());
                    index.quick = true;

                    t.setFilter('title', 'like', document.querySelector('.search').value.trim());
                    t.redraw();
                    t.rowManager.resetScroll();

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

                    document.querySelector('.blur').style.display = 'none';

                    if (document.querySelector('.search').value.trim()) {
                        document.title = `${document.querySelector('.search').value.trim()} - ${title} (quick search)`;
                    } else {
                        document.title = title;
                    }

                    return;
                }

                if (new URLSearchParams(location.search).get('query')) {
                    const value = decodeURIComponent(new URLSearchParams(location.search).get('query'));
                    document.querySelector('.search').value = value;
                } else {
                    document.querySelector('.search').value = '';
                }

                searchFunction(t, null, true);
            });

            t.on('dataSorted', (sorters) => {
                if (sorters.length) {
                    if (sorters[0].field === 'alternative') {
                        t.getColumn('alternative').getElement().dataset.sorted = '';
                    } else {
                        t.getColumn('alternative').getElement().dataset.sorted = 'sorted';
                    }

                    sorted2.dir = sorters[0].dir;
                    sorted2.field = sorters[0].field;
                } else {
                    sorted2.dir = 'relevancy';
                    sorted2.field = 'desc';
                }
            });

            t.on('tableBuilding', () => {
                message();

                document.querySelector('.database-container').addEventListener('dblclick', (e) => {
                    e.stopImmediatePropagation();
                });
            });

            t.on('tableBuilt', () => {
                document.querySelector('.tabulator-tableholder').tabIndex = -1;

                const
                    columns = ['picture', 'picture2', 'alternative', 'type', 'episodes', 'season'],
                    header = document.querySelector('.tabulator-header');

                if (!error) {
                    columns.push(...['watched', 'progress', 'status']);
                }

                for (const value of columns) {
                    document.querySelector(`.tabulator-col[tabulator-field="${value}"]`).tabIndex = 0;
                }

                document.querySelector('.tabulator-header').remove();
                document.querySelector('.tabulator-tableholder').prepend(header);

                document.querySelectorAll('.tabulator-col-sorter-element').forEach((element) => {
                    element.parentElement.insertAdjacentHTML('beforeend',
                        '<div class="tabulator-col-sorter">' +
                            `<svg viewBox="${svg.viewBox}" width="17" height="17">${svg.arrow}</svg>` +
                        '</div>'
                    );

                    element.remove();
                });

                built = true;
            });
        })
        .catch(() => {
            error2 = true;

            document.body.classList.add('error2');
            document.querySelector('.loading').innerHTML = 'Database not found';
        });
});

export {
    built,
    db2,
    disableSelection,
    error,
    error2,
    hasProgress,
    selected,
    svg,
    t,
    title,
    updated,
    years2
};