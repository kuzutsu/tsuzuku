const
    choice = [],
    database = [],
    green = '#2e7d32',
    red = '#c62828',
    tags = [],
    tags2 = new Map(),
    types = ['tag', 'year'],
    years = [],
    years2 = new Map();

let query = null;

fetch('../../anime-offline-database.json')
// fetch('https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database.json')
    .then((response) => response.json())
    .then((data) => {
        const d = data.data;

        for (let i = 0; i < d.length; i++) {
            const
                e = d[i].episodes,
                m = d[i].sources.filter((sources) => sources.match(/anilist\.co|kitsu\.io|myanimelist\.net/gu)),
                y = d[i].animeSeason.year;

            let source = null;

            if (!m.length) {
                continue;
            }

            if (!d[i].episodes) {
                continue;
            }

            if (d[i].sources.filter((sources) => sources.match(/myanimelist\.net/gu)).length) {
                source = /myanimelist\.net/gu;
            } else if (d[i].sources.filter((sources) => sources.match(/kitsu\.io/gu)).length) {
                source = /kitsu\.io/gu;
            } else {
                source = /anilist\.co/gu;
            }

            if (d[i].picture === 'https://cdn.myanimelist.net/images/qm_50.gif') {
                continue;
            }

            for (const value of d[i].sources.filter((sources) => sources.match(source))) {
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
                    source:
                        value.match(/myanimelist\.net/gu)
                            ? '../../images/myanimelist.png'
                            : value.match(/kitsu\.io/gu)
                                ? '../../images/kitsu.png'
                                : '../../images/anilist.png',
                    tags: tt,
                    title: d[i].title,
                    year: y
                });
            }
        }

        tags.sort();
        years.sort();
        years.splice(years.indexOf(null), 1);
        years.push(null);

        function game() {
            const
                c = JSON.parse(localStorage.getItem('odd-one-out')),
                choices = Math.round(Math.random() * (c.choices - 1)),
                choices2 = [],
                remaining = [],
                remaining2 = {};

            document.querySelector('.score').innerHTML = c.score;
            document.querySelector('.high').innerHTML = c.high;
            document.querySelector('.submit').innerHTML = 'Submit';
            document.querySelector('.choice').innerHTML = '';

            if (c.random) {
                c.type = types[Math.round(Math.random() * (types.length - 1))];
            }

            choice.splice(0);

            choice.push(choices);

            document.querySelector('.query a').href = '../../?query=';
            document.querySelector('.query a').innerHTML = '';
            document.querySelector('.query a').tabIndex = -1;

            switch (c.type) {
                case 'year':
                    query = years[Math.round(Math.random() * (years.length - 1))];

                    while (years2.get(query) < c.choices - 1) {
                        query = years[Math.round(Math.random() * (years.length - 1))];
                    }

                    break;

                default:
                    query = tags[Math.round(Math.random() * (tags.length - 1))];

                    while (tags2.get(query) < c.choices - 1) {
                        query = tags[Math.round(Math.random() * (tags.length - 1))];
                    }

                    break;
            }

            for (let i = 0; i < c.choices; i++) {
                const div = document.createElement('div');
                let random = Math.round(Math.random() * (database.length - 1));

                switch (c.type) {
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

                        if (c.random) {
                            remaining.push(...database[random].tags);
                        }

                        remaining.push(database[random].year);
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

                        if (c.random) {
                            remaining.push(database[random].year);
                        }

                        remaining.push(...database[random].tags);
                        break;
                }

                choices2.push(database[random].link);

                div.tabIndex = 0;
                div.innerHTML =
                    `<img class="picture" src="${database[random].picture}" loading="lazy" alt>` +
                    '<span class="separator"></span>' +
                    `<a class="link" href="${database[random].link}" target="_blank" rel="noreferrer" style="background: url(${database[random].source}); background-size: contain; height: 17px; width: 17px; min-height: 17px; min-width: 17px;"></a>` +
                    '<span class="separator"></span>' +
                    `<span class="title">${database[random].title}</span>`;

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
                });

                document.querySelector('.choice').appendChild(div);
            }

            for (const value of remaining) {
                if (value === query) {
                    continue;
                }

                if (remaining2[value]) {
                    remaining2[value] += 1;

                    if (remaining2[value] === c.choices - 1) {
                        game();

                        return;
                    }
                } else {
                    remaining2[value] = 1;
                }
            }

            localStorage.setItem('odd-one-out', JSON.stringify(c));
        }

        game();

        document.querySelector('.submit').addEventListener('click', (e) => {
            const c = JSON.parse(localStorage.getItem('odd-one-out'));

            let incorrect = false,
                score = 0;

            if (document.querySelector('.choice div[style]')) {
                game();

                return;
            }

            if (!document.querySelector('.selected')) {
                return;
            }

            e.target.innerHTML = 'Next';

            for (let i = 0; i < c.choices; i++) {
                if (choice.indexOf(i) > -1) {
                    if (document.querySelector(`.choice div:nth-child(${i + 1})`).classList.contains('selected')) {
                        document.querySelector(`.choice div:nth-child(${i + 1})`).classList.remove('selected');
                        document.querySelector(`.choice div:nth-child(${i + 1})`).style.background = green;
                        score += 1;
                    }
                } else {
                    if (document.querySelector(`.choice div:nth-child(${i + 1})`).classList.contains('selected')) {
                        document.querySelector(`.choice div:nth-child(${i + 1})`).classList.remove('selected');
                        document.querySelector(`.choice div:nth-child(${i + 1})`).style.background = red;
                        score -= 1;
                        incorrect = true;
                    }

                    document.querySelector(`.choice div:nth-child(${i + 1})`).classList.add('dim');
                }
            }

            switch (c.type) {
                case 'year':
                    document.querySelector('.query a').href += encodeURIComponent(`year:${query}`);
                    document.querySelector('.query a').innerHTML = `year:<span class="bold">${query}</span>`;
                    break;

                default:
                    document.querySelector('.query a').href += encodeURIComponent(`tag:${query}`);
                    document.querySelector('.query a').innerHTML = `tag:<span class="bold">${query}</span>`;
                    break;
            }

            document.querySelector('.query a').tabIndex = 0;

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

            localStorage.setItem('odd-one-out', JSON.stringify(c));
        });

        document.querySelector('#choices').addEventListener('change', (e) => {
            const c = JSON.parse(localStorage.getItem('odd-one-out'));

            c.choices = Number(e.target.value);
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

            localStorage.setItem('odd-one-out', JSON.stringify(c));
            game();
        });

        document.querySelector('#type').addEventListener('change', (e) => {
            const c = JSON.parse(localStorage.getItem('odd-one-out'));

            if (e.target.value === 'random') {
                c.random = true;
            } else {
                c.random = false;
                c.type = e.target.value;
            }

            c.score = 0;
            c.high = 0;

            localStorage.setItem('odd-one-out', JSON.stringify(c));
            game();
        });

        document.querySelector('.settings').addEventListener('click', () => {
            if (document.querySelector('.settings-container').style.display) {
                document.querySelector('.settings-container').style.display = '';
                document.querySelector('.settings svg').style.fill = '';
            } else {
                document.querySelector('.settings-container').style.display = 'none';
                document.querySelector('.settings svg').style.fill = '#aaa';
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
            game();
        });

        document.body.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' || e.repeat) {
                return;
            }

            if (e.target.tabIndex === 0 || e.target.type === 'checkbox') {
                e.target.click();
            }
        });
    });