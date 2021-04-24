const
    choice = [],
    database = [],
    episodes = [],
    episodes2 = new Map(),
    green = '#2e7d32',
    max = {
        episode: null,
        year: null
    },
    min = {
        episode: null,
        year: null
    },
    operators = ['', '<', '>', '<=', '>='],
    red = '#c62828',
    seasons = ['fall', 'spring', 'summer', 'winter'],
    tags = [],
    tags2 = new Map(),
    types = ['tag', 'episodes (with operators)', 'year (with operators)', 'season'],
    years = [],
    years2 = new Map();

fetch('https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database.json')
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

                if (episodes2.has(e)) {
                    episodes2.set(e, episodes2.get(e) + 1);
                } else {
                    episodes2.set(e, 1);
                    episodes.push(e);
                }

                database.push({
                    episodes: e,
                    link: value,
                    picture: d[i].thumbnail,
                    season: d[i].animeSeason.season.toLowerCase(),
                    source:
                        value.match(/myanimelist\.net/gu)
                            ? 'https://myanimelist.net/img/common/pwa/launcher-icon-4x.png'
                            : value.match(/kitsu\.io/gu)
                                ? 'https://kitsu.io/favicon-194x194-2f4dbec5ffe82b8f61a3c6d28a77bc6e.png'
                                : 'https://anilist.co/img/icons/android-chrome-192x192.png',
                    tags: tt,
                    title: d[i].title,
                    year: y
                });
            }
        }

        tags.sort();
        episodes.sort();
        years.sort();
        years.splice(years.indexOf(null), 1);

        max.episode = Math.max(...episodes);
        min.episode = Math.min(...episodes);

        max.year = Math.max(...years);
        min.year = Math.min(...years);

        years.push(null);

        function operate(operator, map, value) {
            let count = 0;

            for (const [key, value2] of map) {
                if (!key) {
                    continue;
                }

                switch (operator) {
                    case '<':
                        if (key < value) {
                            count += value2;
                        }
                        break;

                    case '>':
                        if (key > value) {
                            count += value2;
                        }
                        break;

                    case '<=':
                        if (key <= value) {
                            count += value2;
                        }
                        break;

                    case '>=':
                        if (key >= value) {
                            count += value2;
                        }
                        break;

                    default:
                        break;
                }
            }

            return count;
        }

        function game() {
            document.querySelector('.score').innerHTML = localStorage.getItem('score');
            document.querySelector('.high').innerHTML = localStorage.getItem('high');

            if (document.querySelector('.choice').innerHTML) {
                document.querySelector('.choice').innerHTML = '';
            }

            if (localStorage.getItem('random') === 'enable') {
                localStorage.setItem('type', types[Math.round(Math.random() * (types.length - 1))]);
            }

            const
                choices =
                    localStorage.getItem('selection') === 'single'
                        ? 1
                        : Math.round(Math.random() * Number(localStorage.getItem('choices'))),
                choices2 = [],
                choices3 = Number(localStorage.getItem('choices')),
                operator = operators[Math.round(Math.random() * (operators.length - 1))],
                season = seasons[Math.round(Math.random() * (seasons.length - 1))];

            choice.splice(0);

            if (choices) {
                for (let i = 0; i < choices; i++) {
                    let n = Math.round(Math.random() * (Number(localStorage.getItem('choices')) - 1));

                    while (choice.indexOf(n) > -1) {
                        n = Math.round(Math.random() * (Number(localStorage.getItem('choices')) - 1));
                    }

                    choice.push(n);
                }
            }

            let episode = episodes[Math.round(Math.random() * (episodes.length - 1))],
                tag = tags[Math.round(Math.random() * (tags.length - 1))],
                year = years[Math.round(Math.random() * (years.length - 1))];

            document.querySelector('.query a').href = '../?query=';

            switch (localStorage.getItem('type')) {
                case 'episodes (without operators)':
                    while (episodes2.get(episode) < choices) {
                        episode = episodes[Math.round(Math.random() * (episodes.length - 1))];
                    }

                    document.querySelector('.query a').href += encodeURIComponent(`episodes:${episode}`);
                    document.querySelector('.query a').innerHTML = `episodes:<span class="bold">${episode}</span>`;
                    break;

                case 'episodes (with operators)':
                    switch (operator) {
                        case '<':
                            while (episode === min.episode || operate(operator, episodes2, episode) < choices || operate('>=', episodes2, episode) < (choices3 - choices)) {
                                episode = episodes[Math.round(Math.random() * (episodes.length - 1))];
                            }
                            break;

                        case '>':
                            while (episode === max.episode || operate(operator, episodes2, episode) < choices || operate('<=', episodes2, episode) < (choices3 - choices)) {
                                episode = episodes[Math.round(Math.random() * (episodes.length - 1))];
                            }
                            break;

                        case '<=':
                            while (episode === max.episode || operate(operator, episodes2, episode) < choices || operate('>', episodes2, episode) < (choices3 - choices)) {
                                episode = episodes[Math.round(Math.random() * (episodes.length - 1))];
                            }
                            break;

                        case '>=':
                            while (episode === min.episode || operate(operator, episodes2, episode) < choices || operate('<', episodes2, episode) < (choices3 - choices)) {
                                episode = episodes[Math.round(Math.random() * (episodes.length - 1))];
                            }
                            break;

                        default:
                            while (episodes2.get(episode) < choices) {
                                episode = episodes[Math.round(Math.random() * (episodes.length - 1))];
                            }
                            break;
                    }

                    document.querySelector('.query a').href += encodeURIComponent(`episodes:${operator + episode}`);
                    document.querySelector('.query a').innerHTML = `episodes:<span class="bold">${operator + episode}</span>`;
                    break;

                case 'season':
                    document.querySelector('.query a').href += encodeURIComponent(`season:${season}`);
                    document.querySelector('.query a').innerHTML = `season:<span class="bold">${season}</span>`;
                    break;

                case 'year (without operators)':
                    while (years2.get(year) < choices) {
                        year = years[Math.round(Math.random() * (years.length - 1))];
                    }

                    document.querySelector('.query a').href += encodeURIComponent(`year:${year || 'tba'}`);
                    document.querySelector('.query a').innerHTML = `year:<span class="bold">${year || 'tba'}</span>`;
                    break;

                case 'year (with operators)':
                    switch (operator) {
                        case '<':
                            while (!year || year === min.year || operate(operator, years2, year) < choices || operate('>=', years2, year) < (choices3 - choices)) {
                                year = years[Math.round(Math.random() * (years.length - 1))];
                            }
                            break;

                        case '>':
                            while (!year || year === max.year || operate(operator, years2, year) < choices || operate('<=', years2, year) < (choices3 - choices)) {
                                year = years[Math.round(Math.random() * (years.length - 1))];
                            }
                            break;

                        case '<=':
                            while (!year || year === max.year || operate(operator, years2, year) < choices || operate('>', years2, year) < (choices3 - choices)) {
                                year = years[Math.round(Math.random() * (years.length - 1))];
                            }
                            break;

                        case '>=':
                            while (!year || year === min.year || operate(operator, years2, year) < choices || operate('<', years2, year) < (choices3 - choices)) {
                                year = years[Math.round(Math.random() * (years.length - 1))];
                            }
                            break;

                        default:
                            while (years2.get(year) < choices) {
                                year = years[Math.round(Math.random() * (years.length - 1))];
                            }
                            break;
                    }

                    document.querySelector('.query a').href += encodeURIComponent(`year:${
                        year
                            ? operator + year
                            : 'tba'
                    }`);

                    document.querySelector('.query a').innerHTML = `year:<span class="bold">${
                        year
                            ? operator + year
                            : 'tba'
                    }</span>`;

                    break;

                default:
                    while (tags2.get(tag) < choices) {
                        tag = tags[Math.round(Math.random() * (tags.length - 1))];
                    }

                    document.querySelector('.query a').href += encodeURIComponent(`tag:${tag}`);
                    document.querySelector('.query a').innerHTML = `tag:<span class="bold">${tag}</span>`;
                    break;
            }

            for (let i = 0; i < Number(localStorage.getItem('choices')); i++) {
                const div = document.createElement('div');
                let random = Math.round(Math.random() * (database.length - 1));

                if (choice.indexOf(i) > -1) {
                    switch (localStorage.getItem('type')) {
                        case 'episodes (without operators)':
                            while (database[random].episodes !== episode || choices2.indexOf(database[random].link) > -1) {
                                random = Math.round(Math.random() * (database.length - 1));
                            }
                            break;

                        case 'episodes (with operators)':
                            switch (operator) {
                                case '<':
                                    while (database[random].episodes >= episode || choices2.indexOf(database[random].link) > -1) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                case '>':
                                    while (database[random].episodes <= episode || choices2.indexOf(database[random].link) > -1) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                case '<=':
                                    while (database[random].episodes > episode || choices2.indexOf(database[random].link) > -1) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                case '>=':
                                    while (database[random].episodes < episode || choices2.indexOf(database[random].link) > -1) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                default:
                                    while (database[random].episodes !== episode || choices2.indexOf(database[random].link) > -1) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;
                            }
                            break;

                        case 'season':
                            while (database[random].season !== season || choices2.indexOf(database[random].link) > -1) {
                                random = Math.round(Math.random() * (database.length - 1));
                            }
                            break;

                        case 'year (without operators)':
                            while (database[random].year !== year || choices2.indexOf(database[random].link) > -1) {
                                random = Math.round(Math.random() * (database.length - 1));
                            }
                            break;

                        case 'year (with operators)':
                            switch (operator) {
                                case '<':
                                    while (!database[random].year || database[random].year >= year || choices2.indexOf(database[random].link) > -1) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                case '>':
                                    while (database[random].year <= year || choices2.indexOf(database[random].link) > -1) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                case '<=':
                                    while (!database[random].year || database[random].year > year || choices2.indexOf(database[random].link) > -1) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                case '>=':
                                    while (database[random].year < year || choices2.indexOf(database[random].link) > -1) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                default:
                                    while (database[random].year !== year || choices2.indexOf(database[random].link) > -1) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;
                            }
                            break;

                        default:
                            while (database[random].tags.indexOf(tag) === -1 || choices2.indexOf(database[random].link) > -1) {
                                random = Math.round(Math.random() * (database.length - 1));
                            }
                            break;
                    }
                } else {
                    switch (localStorage.getItem('type')) {
                        case 'episodes (without operators)':
                            while (database[random].episodes === episode || choices2.indexOf(database[random].link) > -1) {
                                random = Math.round(Math.random() * (database.length - 1));
                            }
                            break;

                        case 'episodes (with operators)':
                            switch (operator) {
                                case '<':
                                    while (database[random].episodes < episode || choices2.indexOf(database[random].link) > -1) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                case '>':
                                    while (database[random].episodes > episode || choices2.indexOf(database[random].link) > -1) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                case '<=':
                                    while (database[random].episodes <= episode || choices2.indexOf(database[random].link) > -1) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                case '>=':
                                    while (database[random].episodes >= episode || choices2.indexOf(database[random].link) > -1) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                default:
                                    while (database[random].episodes === episode || choices2.indexOf(database[random].link) > -1) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;
                            }
                            break;

                        case 'season':
                            while (database[random].season === season || choices2.indexOf(database[random].link) > -1) {
                                random = Math.round(Math.random() * (database.length - 1));
                            }
                            break;

                        case 'year (without operators)':
                            while (database[random].year === year || choices2.indexOf(database[random].link) > -1) {
                                random = Math.round(Math.random() * (database.length - 1));
                            }
                            break;

                        case 'year (with operators)':
                            switch (operator) {
                                case '<':
                                    while ((database[random].year && database[random].year < year) || choices2.indexOf(database[random].link) > -1) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                case '>':
                                    while (database[random].year > year || choices2.indexOf(database[random].link) > -1) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                case '<=':
                                    while ((database[random].year && database[random].year <= year) || choices2.indexOf(database[random].link) > -1) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                case '>=':
                                    while (database[random].year >= year || choices2.indexOf(database[random].link) > -1) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                default:
                                    while (database[random].year === year || choices2.indexOf(database[random].link) > -1) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;
                            }
                            break;

                        default:
                            while (database[random].tags.indexOf(tag) > -1 || choices2.indexOf(database[random].link) > -1) {
                                random = Math.round(Math.random() * (database.length - 1));
                            }
                            break;
                    }
                }

                choices2.push(database[random].link);

                div.innerHTML =
                    `<img class="picture" src="${database[random].picture}" loading="lazy" alt>` +
                    '<span class="separator"></span>' +
                    `<a class="link" href="${database[random].link}" target="_blank" rel="noreferrer">` +
                        `<img class="source" src="${database[random].source}" loading="lazy" alt>` +
                    '</a>' +
                    '<span class="separator"></span>' +
                    `<span class="title">${database[random].title}</span>`;

                div.addEventListener('click', (e) => {
                    if (e.target.classList.contains('source')) {
                        return;
                    }

                    if (document.querySelector('.choice div[style]')) {
                        return;
                    }

                    if (localStorage.getItem('selection') === 'single' && document.querySelector('.selected')) {
                        document.querySelector('.selected').classList.remove('selected');
                    }

                    e.currentTarget.classList.toggle('selected');
                });

                document.querySelector('.choice').appendChild(div);
            }
        }

        game();

        document.querySelector('.submit').addEventListener('click', () => {
            let incorrect = false,
                score = 0;

            if (document.querySelector('.choice div[style]')) {
                return;
            }

            if (localStorage.getItem('selection') === 'single' && !document.querySelector('.selected')) {
                return;
            }

            for (let i = 0; i < Number(localStorage.getItem('choices')); i++) {
                if (choice.indexOf(i) > -1) {
                    if (document.querySelector(`.choice div:nth-child(${i + 1})`).classList.contains('selected')) {
                        document.querySelector(`.choice div:nth-child(${i + 1})`).classList.remove('selected');
                        document.querySelector(`.choice div:nth-child(${i + 1})`).style.background = green;
                        score += 1;
                    } else {
                        if (localStorage.getItem('selection') !== 'single') {
                            document.querySelector(`.choice div:nth-child(${i + 1})`).style.background = red;
                            score -= 1;
                            incorrect = true;
                        }
                    }
                } else {
                    if (document.querySelector(`.choice div:nth-child(${i + 1})`).classList.contains('selected')) {
                        document.querySelector(`.choice div:nth-child(${i + 1})`).classList.remove('selected');
                        document.querySelector(`.choice div:nth-child(${i + 1})`).style.background = red;
                        score -= 1;
                        incorrect = true;
                    } else {
                        if (localStorage.getItem('selection') !== 'single') {
                            document.querySelector(`.choice div:nth-child(${i + 1})`).style.background = green;
                            score += 1;
                        }
                    }

                    document.querySelector(`.choice div:nth-child(${i + 1})`).classList.add('dim');
                }
            }

            if (localStorage.getItem('reset-incorrect') === 'enable' && incorrect) {
                localStorage.setItem('score', 0);
            } else {
                localStorage.setItem('score', Number(localStorage.getItem('score')) + score);
            }

            if (localStorage.getItem('negative') === 'disable' && Number(localStorage.getItem('score')) < 0) {
                localStorage.setItem('score', 0);
            }

            document.querySelector('.score').innerHTML = localStorage.getItem('score');

            if (Number(localStorage.getItem('score')) > Number(localStorage.getItem('high'))) {
                localStorage.setItem('high', Number(localStorage.getItem('score')));
                document.querySelector('.high').innerHTML = localStorage.getItem('high');
            }
        });

        document.querySelector('.selection').addEventListener('change', (e) => {
            localStorage.setItem('selection', e.currentTarget.value);
            localStorage.setItem('score', 0);
            localStorage.setItem('high', 0);
            game();
        });

        document.querySelector('.choices').addEventListener('change', (e) => {
            localStorage.setItem('choices', e.currentTarget.value);
            localStorage.setItem('score', 0);
            localStorage.setItem('high', 0);
            game();
        });

        document.querySelector('.negative').addEventListener('change', (e) => {
            localStorage.setItem('negative', e.currentTarget.value);
            localStorage.setItem('score', 0);
            localStorage.setItem('high', 0);
            game();
        });

        document.querySelector('.reset-incorrect').addEventListener('change', (e) => {
            localStorage.setItem('reset-incorrect', e.currentTarget.value);
            localStorage.setItem('score', 0);
            localStorage.setItem('high', 0);
            game();
        });

        document.querySelector('.type').addEventListener('change', (e) => {
            if (e.currentTarget.value === 'random') {
                localStorage.setItem('random', 'enable');
            } else {
                localStorage.setItem('random', 'disable');
                localStorage.setItem('type', e.currentTarget.value);
            }

            localStorage.setItem('score', 0);
            localStorage.setItem('high', 0);
            game();
        });

        document.querySelector('.settings').addEventListener('click', () => {
            for (const i of document.querySelectorAll('.setting')) {
                if (i.style.display) {
                    i.style.display = '';
                } else {
                    i.style.display = 'flex';
                }
            }
        });

        document.querySelector('.score').addEventListener('click', (e) => {
            localStorage.setItem('score', 0);
            e.currentTarget.innerHTML = localStorage.getItem('score');
        });

        document.querySelector('.high').addEventListener('click', (e) => {
            localStorage.setItem('high', 0);
            e.currentTarget.innerHTML = localStorage.getItem('high');
        });

        document.querySelector('.reload svg').addEventListener('click', () => {
            game();
        });
    });