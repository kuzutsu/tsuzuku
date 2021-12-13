let t2 = null;

fetch('https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database-minified.json')
    .then((response) => response.json())
    .then((data) => {
        const
            d = data.data,
            d2 = [],
            m = new Map(),
            m2 = [];

        for (const value of d) {
            const t = value.tags.map((tags2) => tags2.replace(/\s/gu, '_'));

            if (!value.sources.filter((sources2) => sources2.match(/myanimelist\.net/gu)).length) {
                continue;
            }

            if (value.picture === 'https://cdn.myanimelist.net/images/qm_50.gif') {
                continue;
            }

            if (value.tags.indexOf('anime influenced') > -1) {
                continue;
            }

            for (const value2 of t) {
                if (m.has(value2)) {
                    m.set(value2, {
                        all: m.get(value2).all + 1,
                        movie:
                            value.type === 'MOVIE'
                                ? m.get(value2).movie + 1
                                : m.get(value2).movie,
                        ona:
                            value.type === 'ONA'
                                ? m.get(value2).ona + 1
                                : m.get(value2).ona,
                        ova:
                            value.type === 'OVA'
                                ? m.get(value2).ova + 1
                                : m.get(value2).ova,
                        special:
                            value.type === 'SPECIAL'
                                ? m.get(value2).special + 1
                                : m.get(value2).special,
                        tba:
                            value.type === 'TBA'
                                ? m.get(value2).tba + 1
                                : m.get(value2).tba,
                        tv:
                            value.type === 'TV'
                                ? m.get(value2).tv + 1
                                : m.get(value2).tv
                    });
                } else {
                    m.set(value2, {
                        all: 1,
                        movie:
                            value.type === 'MOVIE'
                                ? 1
                                : 0,
                        ona:
                            value.type === 'ONA'
                                ? 1
                                : 0,
                        ova:
                            value.type === 'OVA'
                                ? 1
                                : 0,
                        special:
                            value.type === 'SPECIAL'
                                ? 1
                                : 0,
                        tba:
                            value.type === 'TBA'
                                ? 1
                                : 0,
                        tv:
                            value.type === 'TV'
                                ? 1
                                : 0
                    });
                }
            }
        }

        m2.push(...m.keys());
        m2.sort();

        for (const value of m2) {
            d2.push({
                all: m.get(value).all,
                movie: m.get(value).movie || '',
                ona: m.get(value).ona || '',
                ova: m.get(value).ova || '',
                special: m.get(value).special || '',
                tag: value,
                tba: m.get(value).tba || '',
                tv: m.get(value).tv || ''
            });
        }

        t2 = new Tabulator('.database-container', {
            cellDblClick: function () {
                return false;
            },
            columnHeaderSortMulti: false,
            columns: [
                {
                    // padding
                    frozen: true,
                    headerSort: false,
                    minWidth: 19,
                    width: 19
                },
                {
                    field: 'tag',
                    frozen: true,
                    minWidth: 200,
                    sorterParams: {
                        alignEmptyValues: 'bottom'
                    },
                    title: 'Tag',
                    vertAlign: 'middle'
                },
                {
                    field: 'all',
                    formatter: function (cell) {
                        const a = document.createElement('a');

                        a.href = `../?query=${escape(encodeURIComponent(`tag:${cell.getRow().getData().tag} `))}`;
                        a.innerHTML = cell.getValue();
                        a.rel = 'noreferrer';

                        return a;
                    },
                    headerHozAlign: 'center',
                    hozAlign: 'center',
                    sorterParams: {
                        alignEmptyValues: 'bottom'
                    },
                    title: 'All',
                    vertAlign: 'middle',
                    width: 100
                },
                {
                    field: 'tv',
                    formatter: function (cell) {
                        const a = document.createElement('a');

                        a.href = `../?query=${escape(encodeURIComponent(`tag:${cell.getRow().getData().tag} type:${cell.getColumn().getField()} `))}`;
                        a.innerHTML = cell.getValue();
                        a.rel = 'noreferrer';

                        return a;
                    },
                    headerHozAlign: 'center',
                    hozAlign: 'center',
                    sorterParams: {
                        alignEmptyValues: 'bottom'
                    },
                    title: 'TV',
                    vertAlign: 'middle',
                    width: 100
                },
                {
                    field: 'movie',
                    formatter: function (cell) {
                        const a = document.createElement('a');

                        a.href = `../?query=${escape(encodeURIComponent(`tag:${cell.getRow().getData().tag} type:${cell.getColumn().getField()} `))}`;
                        a.innerHTML = cell.getValue();
                        a.rel = 'noreferrer';

                        return a;
                    },
                    headerHozAlign: 'center',
                    hozAlign: 'center',
                    sorterParams: {
                        alignEmptyValues: 'bottom'
                    },
                    title: 'Movie',
                    vertAlign: 'middle',
                    width: 100
                },
                {
                    field: 'ova',
                    formatter: function (cell) {
                        const a = document.createElement('a');

                        a.href = `../?query=${escape(encodeURIComponent(`tag:${cell.getRow().getData().tag} type:${cell.getColumn().getField()} `))}`;
                        a.innerHTML = cell.getValue();
                        a.rel = 'noreferrer';

                        return a;
                    },
                    headerHozAlign: 'center',
                    hozAlign: 'center',
                    sorterParams: {
                        alignEmptyValues: 'bottom'
                    },
                    title: 'OVA',
                    vertAlign: 'middle',
                    width: 100
                },
                {
                    field: 'ona',
                    formatter: function (cell) {
                        const a = document.createElement('a');

                        a.href = `../?query=${escape(encodeURIComponent(`tag:${cell.getRow().getData().tag} type:${cell.getColumn().getField()} `))}`;
                        a.innerHTML = cell.getValue();
                        a.rel = 'noreferrer';

                        return a;
                    },
                    headerHozAlign: 'center',
                    hozAlign: 'center',
                    sorterParams: {
                        alignEmptyValues: 'bottom'
                    },
                    title: 'ONA',
                    vertAlign: 'middle',
                    width: 100
                },
                {
                    field: 'special',
                    formatter: function (cell) {
                        const a = document.createElement('a');

                        a.href = `../?query=${escape(encodeURIComponent(`tag:${cell.getRow().getData().tag} type:${cell.getColumn().getField()} `))}`;
                        a.innerHTML = cell.getValue();
                        a.rel = 'noreferrer';

                        return a;
                    },
                    headerHozAlign: 'center',
                    hozAlign: 'center',
                    sorterParams: {
                        alignEmptyValues: 'bottom'
                    },
                    title: 'Special',
                    vertAlign: 'middle',
                    width: 100
                },
                {
                    field: 'tba',
                    formatter: function (cell) {
                        const a = document.createElement('a');

                        a.href = `../?query=${escape(encodeURIComponent(`tag:${cell.getRow().getData().tag} type:${cell.getColumn().getField()} `))}`;
                        a.innerHTML = cell.getValue();
                        a.rel = 'noreferrer';

                        return a;
                    },
                    headerHozAlign: 'center',
                    hozAlign: 'center',
                    sorterParams: {
                        alignEmptyValues: 'bottom'
                    },
                    title: 'TBA',
                    vertAlign: 'middle',
                    width: 100
                },
                {
                    // padding
                    headerSort: false,
                    minWidth: 19,
                    width: 19
                }
            ],
            data: d2,
            dataSorted: function (sorters) {
                if (sorters.length) {
                    return;
                }

                this.setSort('tag', 'asc');
                this.redraw(true);
            },
            headerSortElement: '<svg viewBox="0 0 24 24" width="17" height="17"><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"></path></svg>',
            headerSortTristate: true,
            index: 'tag',
            initialSort: [
                {
                    column: 'tag',
                    dir: 'asc'
                }
            ],
            layout: 'fitColumns',
            resizableColumns: false
        });
    })
    .catch(() => {
        // document.querySelector('.loading').innerHTML = 'Database not found';
    });

export {
    t2
};