import {
    addCommas,
    source,
    tagsDelisted
} from '../global.js';

let updated = '???';

fetch(source)
    .then((response) => response.json())
    .then((data) => {
        const
            d = data.data,
            episodes = new Map(),
            m = [],
            m2 = [],
            m3 = [],
            m4 = [],
            m5 = [],
            m6 = [],
            s = new Set(),
            seasons = new Map(),
            tags = new Map(),
            types = new Map(),
            years = new Map();

        updated = data.lastUpdate;

        document.querySelector('.loading').innerHTML = 'Building list<span class="el">.</span><span class="lip">.</span><span class="sis">.</span>';

        setTimeout(() => {
            for (const value of d) {
                const
                    e = value.episodes || 'tba',
                    s2 =
                        value.animeSeason.season === 'UNDEFINED'
                            ? 'tba'
                            : value.animeSeason.season.toLowerCase(),
                    source2 = /myanimelist\.net/giv,
                    t = new Set(value.tags.map((tags2) => tags2.replace(/&/giv, 'and').replace(/\s/giv, ' ').replace(/-/giv, ' ').replace(/,$/giv, ''))),
                    t2 =
                        value.type === 'UNKNOWN'
                            ? 'tba'
                            : value.type.toLowerCase(),
                    value3 = value.sources.filter((sources) => sources.match(source2))[0],
                    y = value.animeSeason.year || 'tba';

                let c = false;

                if (!value.sources.filter((sources2) => sources2.match(source2)).length) {
                    continue;
                }

                if (s.has(value3)) {
                    continue;
                }

                if (!localStorage.getItem('tsuzuku') || !JSON.parse(localStorage.getItem('tsuzuku')).delisted) {
                    if (value.picture === 'https://cdn.myanimelist.net/images/qm_50.gif') {
                        continue;
                    }

                    for (const td of tagsDelisted) {
                        if ([...t].indexOf(td) > -1) {
                            c = true;
                            break;
                        }
                    }

                    if (c) {
                        continue;
                    }
                }

                for (const value2 of [...t]) {
                    if (tags.has(value2)) {
                        tags.set(value2, tags.get(value2) + 1);
                    } else {
                        tags.set(value2, 1);
                    }
                }

                if (types.has(t2)) {
                    types.set(t2, types.get(t2) + 1);
                } else {
                    types.set(t2, 1);
                }

                if (years.has(y)) {
                    years.set(y, years.get(y) + 1);
                } else {
                    years.set(y, 1);
                }

                if (episodes.has(e)) {
                    episodes.set(e, episodes.get(e) + 1);
                } else {
                    episodes.set(e, 1);
                }

                if (seasons.has(s2)) {
                    seasons.set(s2, seasons.get(s2) + 1);
                } else {
                    seasons.set(s2, 1);
                }

                s.add(value3);
            }

            m.push(...tags.keys());
            m.sort();

            m2.push(...types.keys());
            m2.sort();

            m3.push(...years.keys());
            m3.sort();

            m4.push(...episodes.keys());

            m6.push(...seasons.keys());
            m6.sort();

            let episodes2 = '',
                seasons2 = '',
                tags2 = '',
                types2 = '',
                y2 = 0,
                years2 = '';

            for (const value of m) {
                tags2 += `<div><a href="../?query=${escape(encodeURIComponent(`tag:${value.replace(/\s/giv, '_')} `))}">${value}</a><span style="color: var(--disabled);">${addCommas(tags.get(value))}</span></div>`;
            }

            for (const value of m2) {
                types2 += `<div><a href="../?query=${escape(encodeURIComponent(`type:${value} `))}">${value}</a><span style="color: var(--disabled);">${addCommas(types.get(value))}</span></div>`;
            }

            for (const value of m3) {
                years2 += `<div><a href="../?query=${escape(encodeURIComponent(`year:${value} `))}">${value}</a><span style="color: var(--disabled);">${addCommas(years.get(value))}</span></div>`;
            }

            while (m4.length) {
                if (m4.indexOf(y2) > -1) {
                    m5.push(y2);
                    m4.splice(m4.indexOf(y2), 1);
                }

                if (m4.length === 1 && m4[0] === 'tba') {
                    m5.push(m4[0]);
                    m4.splice(0);
                } else {
                    y2 += 1;
                }
            }

            for (const value of m5) {
                episodes2 += `<div><a href="../?query=${escape(encodeURIComponent(`eps:${value} `))}">${addCommas(value)}</a><span style="color: var(--disabled);">${addCommas(episodes.get(value))}</span></div>`;
            }

            for (const value of m6) {
                seasons2 += `<div><a href="../?query=${escape(encodeURIComponent(`season:${value} `))}">${value}</a><span style="color: var(--disabled);">${addCommas(seasons.get(value))}</span></div>`;
            }

            document.querySelector('.loading').innerHTML = `Database as of ${updated}`;
            document.querySelector('.reload').style.display = 'inline-flex';
            document.querySelector('#tags').innerHTML = tags2;
            document.querySelector('#types').innerHTML = types2;
            document.querySelector('#years').innerHTML = years2;
            document.querySelector('#episodes').innerHTML = episodes2;
            document.querySelector('#seasons').innerHTML = seasons2;
            document.querySelector('.container').style.display = '';

            document.querySelectorAll('.columns div').forEach((element) => {
                element.addEventListener('click', (e) => {
                    e.preventDefault();
                    location.assign(element.querySelector('a').href);
                });
            });
        }, 100);
    })
    .catch(() => {
        document.querySelector('.loading').innerHTML = 'Database not found';
    });