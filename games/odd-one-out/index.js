import {
    source
} from '../../global.js';

const
    choice = [],
    choice2 = [3, 4, 5, 6, 7, 8, 9, 10],
    database = [],
    tags = [],
    tags2 = new Map(),
    types = ['tag', 'year'],
    years = [],
    years2 = new Map();

let choice3 = null,
    choices = null,
    query = null,
    type = null;

fetch(source)
    .then((response) => response.json())
    .then((data) => {
        const d = data.data;

        document.querySelector('.loading').innerHTML = 'Building game...';

        setTimeout(() => {
            for (let i = 0; i < d.length; i++) {
                const
                    e = d[i].episodes,
                    m = d[i].sources.filter((sources) => sources.match(/myanimelist\.net/gu)),
                    y = d[i].animeSeason.year;

                let source2 = null;

                if (!m.length) {
                    continue;
                }

                if (!d[i].episodes) {
                    continue;
                }

                if (d[i].sources.filter((sources) => sources.match(/myanimelist\.net/gu)).length) {
                    source2 = /myanimelist\.net/gu;
                }

                if (d[i].picture === 'https://cdn.myanimelist.net/images/qm_50.gif') {
                    continue;
                }

                if (d[i].tags.indexOf('anime influenced') > -1) {
                    continue;
                }

                for (const value of d[i].sources.filter((sources) => sources.match(source2))) {
                    const tt = d[i].tags.map((t) => t.replace(/\s/gu, '_'));

                    for (const value2 of tt) {
                        if (tags2.has(value2)) {
                            tags2.set(value2, tags2.get(value2) + 1);
                        } else {
                            tags2.set(value2, 1);
                            tags.push(value2);
                        }
                    }

                    if (years2.has(y)) {
                        years2.set(y, years2.get(y) + 1);
                    } else {
                        years2.set(y, 1);
                        years.push(y);
                    }

                    database.push({
                        episodes: e,
                        link: value,
                        picture: d[i].picture,
                        season: d[i].animeSeason.season.toLowerCase(),
                        tags: tt,
                        title: d[i].title,
                        year: y
                    });
                }
            }

            tags.sort();
            years.sort();
            years.splice(years.indexOf(null), 1);

            function submit() {
                const c = JSON.parse(localStorage.getItem('odd-one-out'));

                let incorrect = false,
                    score = 0;

                for (let i = 0; i < choice3; i++) {
                    if (choice.indexOf(i) > -1) {
                        if (document.querySelector(`.choice div:nth-child(${i + 1})`).classList.contains('selected')) {
                            document.querySelector(`.choice div:nth-child(${i + 1})`).classList.remove('selected');
                            document.querySelector(`.choice div:nth-child(${i + 1})`).style.background = 'var(--green)';
                            score += 1;
                        }
                    } else {
                        if (document.querySelector(`.choice div:nth-child(${i + 1})`).classList.contains('selected')) {
                            document.querySelector(`.choice div:nth-child(${i + 1})`).classList.remove('selected');
                            document.querySelector(`.choice div:nth-child(${i + 1})`).style.background = 'var(--red)';
                            score -= 1;
                            incorrect = true;
                        }

                        document.querySelector(`.choice div:nth-child(${i + 1})`).classList.add('dim');
                    }
                }

                switch (type) {
                    case 'year':
                        document.querySelector('.query-container').innerHTML =
                            `<a href="../../?query=${escape(encodeURIComponent(`year:${query} `))}" rel="noreferrer">` +
                                '<span>year:</span>' +
                                `<span class="bold">${query}</span>` +
                            '</a>';
                        break;

                    default:
                        document.querySelector('.query-container').innerHTML =
                            `<a href="../../?query=${escape(encodeURIComponent(`tag:${query} `))}" rel="noreferrer">` +
                                '<span>tag:</span>' +
                                `<span class="bold">${query}</span>` +
                            '</a>';
                        break;
                }

                if (c.resetIncorrect && incorrect) {
                    c.score = 0;
                } else {
                    c.score += score;
                }

                if (!c.negative && c.score < 0) {
                    c.score = 0;
                }

                document.querySelector('.score').innerHTML = c.score;

                if (c.score > c.high) {
                    c.high = c.score;
                    document.querySelector('.high').innerHTML = c.high;
                }

                document.querySelector('.submit').innerHTML = 'Next';

                c.cheat = {};

                localStorage.setItem('odd-one-out', JSON.stringify(c));
            }

            function game(start) {
                const
                    c = JSON.parse(localStorage.getItem('odd-one-out')),
                    choices2 = [];

                /*
                const
                    remaining = [],
                    remaining2 = {};
                */

                choice3 =
                    c.choices === 'random'
                        ? choice2[Math.round(Math.random() * (choice2.length - 1))]
                        : c.choices;

                choices = Math.round(Math.random() * (choice3 - 1));

                document.querySelector('.score').innerHTML = c.score;
                document.querySelector('.high').innerHTML = c.high;
                document.querySelector('.choice').innerHTML = '';

                document.querySelector('.submit').innerHTML =
                    c.autoSubmit
                        ? ''
                        : 'Submit';

                if (c.skip) {
                    document.querySelector('.reload svg').style.fill = '';
                    document.querySelector('.reload').title = 'Skip';
                } else {
                    document.querySelector('.reload svg').style.fill = 'var(--disabled)';
                    document.querySelector('.reload').title = 'Skipping disabled';
                }

                if (start && c.cheat.type) {
                    type = c.cheat.type;
                } else {
                    if (c.type === 'random') {
                        type = types[Math.round(Math.random() * (types.length - 1))];
                    } else {
                        type = c.type;
                    }
                }

                choice.splice(0);

                if (start && c.cheat.choice) {
                    choice.push(...c.cheat.choice);
                } else {
                    choice.push(choices);
                }

                document.querySelector('.query-container').innerHTML =
                    `<span>${
                        type === 'year'
                            ? 'year:?'
                            : 'tag:?'
                    }</span>`;

                switch (type) {
                    case 'year':
                        query =
                            start && c.cheat.query
                                ? c.cheat.query
                                : years[Math.round(Math.random() * (years.length - 1))];

                        while (years2.get(query) < choice3 - 1) {
                            query = years[Math.round(Math.random() * (years.length - 1))];
                        }

                        break;

                    default:
                        query =
                            start && c.cheat.query
                                ? c.cheat.query
                                : tags[Math.round(Math.random() * (tags.length - 1))];

                        while (tags2.get(query) < choice3 - 1) {
                            query = tags[Math.round(Math.random() * (tags.length - 1))];
                        }

                        break;
                }

                for (let i = 0; i < choice3; i++) {
                    const div = document.createElement('div');
                    let random =
                        start && c.cheat.link && c.cheat.link.length === choice3
                            ? database.findIndex((ii) => ii.link === c.cheat.link[i]) > -1
                                ? database.findIndex((ii) => ii.link === c.cheat.link[i])
                                : Math.round(Math.random() * (database.length - 1))
                            : Math.round(Math.random() * (database.length - 1));

                    switch (type) {
                        case 'year':
                            if (choice.indexOf(i) > -1) {
                                while (database[random].year === query || choices2.indexOf(database[random].link) > -1) {
                                    random = Math.round(Math.random() * (database.length - 1));
                                }
                            } else {
                                while (database[random].year !== query || choices2.indexOf(database[random].link) > -1) {
                                    random = Math.round(Math.random() * (database.length - 1));
                                }
                            }

                            /*
                            if (c.type === 'random') {
                                remaining.push(...database[random].tags);
                            }

                            remaining.push(database[random].year);
                            */
                            break;

                        default:
                            if (choice.indexOf(i) > -1) {
                                while (database[random].tags.indexOf(query) > -1 || choices2.indexOf(database[random].link) > -1) {
                                    random = Math.round(Math.random() * (database.length - 1));
                                }
                            } else {
                                while (database[random].tags.indexOf(query) === -1 || choices2.indexOf(database[random].link) > -1) {
                                    random = Math.round(Math.random() * (database.length - 1));
                                }
                            }

                            /*
                            if (c.type === 'random') {
                                remaining.push(database[random].year);
                            }

                            remaining.push(...database[random].tags);
                            */
                            break;
                    }

                    choices2.push(database[random].link);

                    div.tabIndex = 0;
                    div.innerHTML =
                        `<img class="picture" src="${database[random].picture}" loading="lazy" alt style="margin-right: 19px;">` +
                        '<span>' +
                            `<span class="title">${database[random].title}</span>` +
                            '<span class="myanimelist">' +
                                '<span style="user-select: none;">&nbsp;</span>' +
                                `<a href="${database[random].link}" target="_blank" rel="noreferrer" title="MyAnimeList" style="display: inline-flex; align-items: center;">` +
                                    '<svg viewBox="0 0 24 24" height="17" width="17">' +
                                        '<path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"></path>' +
                                    '</svg>' +
                                '</a>' +
                            '</span>' +
                        '</span>';

                    div.addEventListener('click', (e) => {
                        if (e.target.classList.contains('source')) {
                            return;
                        }

                        if (document.querySelector('.choice div[style]')) {
                            return;
                        }

                        if (document.querySelector('.selected')) {
                            document.querySelector('.selected').classList.remove('selected');
                        }

                        e.currentTarget.classList.toggle('selected');

                        if (c.autoSubmit) {
                            div.blur();
                            submit();
                        }
                    });

                    document.querySelector('.choice').appendChild(div);
                }

                /*
                for (const value of remaining) {
                    if (value === query) {
                        continue;
                    }

                    if (remaining2[value]) {
                        remaining2[value] += 1;

                        if (remaining2[value] === choice3 - 1) {
                            game();

                            return;
                        }
                    } else {
                        remaining2[value] = 1;
                    }
                }
                */

                c.cheat = {
                    choice: choice,
                    link: choices2,
                    query: query,
                    type: type
                };

                localStorage.setItem('odd-one-out', JSON.stringify(c));
            }

            game(true);

            document.querySelector('.submit').addEventListener('click', () => {
                if (document.querySelector('.choice div[style]')) {
                    game();

                    return;
                }

                if (!document.querySelector('.selected')) {
                    return;
                }

                submit();
            });

            document.querySelector('#choices').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('odd-one-out'));

                c.choices = Number(e.target.value) || e.target.value;
                c.score = 0;
                c.high = 0;

                localStorage.setItem('odd-one-out', JSON.stringify(c));
                game();
            });

            document.querySelector('#auto-submit').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('odd-one-out'));

                c.autoSubmit = e.target.checked;
                c.score = 0;
                c.high = 0;

                localStorage.setItem('odd-one-out', JSON.stringify(c));
                game();
            });

            document.querySelector('#skip').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('odd-one-out'));

                c.skip = e.target.checked;
                c.score = 0;
                c.high = 0;

                localStorage.setItem('odd-one-out', JSON.stringify(c));
                game();
            });

            document.querySelector('#negative').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('odd-one-out'));

                c.negative = e.target.checked;
                c.score = 0;
                c.high = 0;

                localStorage.setItem('odd-one-out', JSON.stringify(c));
                game();
            });

            document.querySelector('#reset-incorrect').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('odd-one-out'));

                c.resetIncorrect = e.target.checked;
                c.score = 0;
                c.high = 0;

                if (document.querySelector('#reset-incorrect').checked) {
                    document.querySelector('[for="negative"]').style.color = 'var(--disabled)';
                    document.querySelector('#negative').setAttribute('disabled', '');
                } else {
                    document.querySelector('[for="negative"]').style.color = '';
                    document.querySelector('#negative').removeAttribute('disabled');
                }

                localStorage.setItem('odd-one-out', JSON.stringify(c));
                game();
            });

            document.querySelector('#type').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('odd-one-out'));

                c.type = e.target.value;
                c.score = 0;
                c.high = 0;

                localStorage.setItem('odd-one-out', JSON.stringify(c));
                game();
            });

            document.querySelector('.settings').addEventListener('click', () => {
                if (document.querySelector('.settings-container').style.display === 'none') {
                    document.querySelector('.settings-container').style.display = 'flex';
                    document.querySelector('.query').style.display = '';
                    document.querySelector('.choice').style.display = '';
                } else {
                    document.querySelector('.settings-container').style.display = 'none';
                    document.querySelector('.query').style.display = 'inline-flex';
                    document.querySelector('.choice').style.display = 'block';
                }
            });

            document.querySelector('.score').addEventListener('click', (e) => {
                const c = JSON.parse(localStorage.getItem('odd-one-out'));

                c.score = 0;
                e.target.innerHTML = c.score;

                localStorage.setItem('odd-one-out', JSON.stringify(c));
            });

            document.querySelector('.high').addEventListener('click', (e) => {
                const c = JSON.parse(localStorage.getItem('odd-one-out'));

                c.high = 0;
                e.target.innerHTML = c.high;

                localStorage.setItem('odd-one-out', JSON.stringify(c));
            });

            document.querySelector('.reload').addEventListener('click', () => {
                const c = JSON.parse(localStorage.getItem('odd-one-out'));

                if (!c.skip) {
                    return;
                }

                game();
            });

            document.querySelector('.loading').remove();
            document.querySelector('.choice').style.display = 'block';
            document.querySelector('.menu').style.display = 'inline-flex';
            document.querySelector('.query').style.display = 'inline-flex';
        }, 100);
    })
    .catch(() => {
        document.querySelector('.loading').innerHTML = 'Database not found';
    });