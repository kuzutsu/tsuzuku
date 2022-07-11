import {
    source
} from '/global.js';

fetch(source)
    .then((response) => response.json())
    .then((data) => {
        const
            d = data.data,
            m = new Map(),
            m2 = [];

        document.querySelector('main').innerHTML = 'Building list...';

        setTimeout(() => {
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
                            all: m.get(value2).all + 1
                        });
                    } else {
                        m.set(value2, {
                            all: 1
                        });
                    }
                }
            }

            m2.push(...m.keys());
            m2.sort();

            let start = '0-9';

            document.querySelector('main').innerHTML = `<div class="bold">${start}</div>`;

            for (const value of m2) {
                if (isNaN(Number(value[0]))) {
                    if (start !== value[0]) {
                        start = value[0];
                        document.querySelector('main').innerHTML += `<div class="bold" style="margin-top: 17px;">${start.toUpperCase()}</div>`;
                    }
                }

                document.querySelector('main').innerHTML += `<div><a href="../?query=${escape(encodeURIComponent(`tag:${value} `))}">${value}</a> <span style="color: #a7abb7;">(${m.get(value).all})</span></div>`;
            }
        }, 100);
    })
    .catch(() => {
        // document.querySelector('.loading').innerHTML = 'Database not found';
    });