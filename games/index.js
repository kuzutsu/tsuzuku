const
    choice = [],
    database = [],
    episodes = [],
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
    types = ['tags', 'episodes (with operators)', 'year (with operators)', 'season'],
    years = [];

fetch('https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database.json')
    .then((response) => response.json())
    .then((data) => {
        const d = data.data;

        for (let i = 0; i < d.length; i++) {
            const
                e = d[i].episodes,
                m = d[i].sources.filter((sources) => sources.match(/kitsu\.io|myanimelist\.net/gu)),
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
            } else {
                source = /kitsu\.io/gu;
            }

            for (const value of d[i].sources.filter((sources) => sources.match(source))) {
                const tt = d[i].tags.map((t) => t.replace(/\s/gu, '_'));

                for (const value2 of tt) {
                    if (tags.indexOf(value2) === -1) {
                        tags.push(value2);
                    }
                }

                if (years.indexOf(y) === -1) {
                    years.push(y);
                }

                if (episodes.indexOf(e) === -1) {
                    episodes.push(e);
                }

                database.push({
                    episodes: e,
                    link: value,
                    picture:
                        d[i].picture.match(/myanimelist\.net/gu)
                            ? d[i].picture.replace(d[i].picture.substr(d[i].picture.lastIndexOf('.')), '.webp')
                            : d[i].picture,
                    season: d[i].animeSeason.season.toLowerCase(),
                    source:
                        value.match(/myanimelist\.net/gu)
                            ? 'https://myanimelist.net/img/common/pwa/launcher-icon-4x.png'
                            : 'https://kitsu.io/favicon-194x194-2f4dbec5ffe82b8f61a3c6d28a77bc6e.png',
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
                operator = operators[Math.round(Math.random() * (operators.length - 1))],
                season = seasons[Math.round(Math.random() * (seasons.length - 1))],
                tag = tags[Math.round(Math.random() * (tags.length - 1))];

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
                year = years[Math.round(Math.random() * (years.length - 1))];

            document.querySelector('.query a').href = 'https://kuzutsu.github.io/tsuzuku/?query=';

            switch (localStorage.getItem('type')) {
                case 'episodes (without operators)':
                    document.querySelector('.query a').href += encodeURIComponent(`episodes:${episode}`);
                    document.querySelector('.query a').innerHTML = `episodes:<span class="bold">${episode}</span>`;
                    break;

                case 'episodes (with operators)':
                    switch (operator) {
                        case '<':
                        case '>=':
                            while (episode === min.episode) {
                                episode = episodes[Math.round(Math.random() * (episodes.length - 1))];
                            }
                            break;

                        case '>':
                        case '<=':
                            while (episode === max.episode) {
                                episode = episodes[Math.round(Math.random() * (episodes.length - 1))];
                            }
                            break;

                        default:
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
                    document.querySelector('.query a').href += encodeURIComponent(`year:${year || 'tba'}`);
                    document.querySelector('.query a').innerHTML = `year:<span class="bold">${year || 'tba'}</span>`;
                    break;

                case 'year (with operators)':
                    switch (operator) {
                        case '<':
                        case '>=':
                            while (year === min.year) {
                                year = years[Math.round(Math.random() * (years.length - 1))];
                            }
                            break;

                        case '>':
                        case '<=':
                            while (year === max.year) {
                                year = years[Math.round(Math.random() * (years.length - 1))];
                            }
                            break;

                        default:
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
                    document.querySelector('.query a').href += encodeURIComponent(`tags:${tag}`);
                    document.querySelector('.query a').innerHTML = `tags:<span class="bold">${tag}</span>`;
                    break;
            }

            for (let i = 0; i < Number(localStorage.getItem('choices')); i++) {
                const div = document.createElement('div');
                let random = Math.round(Math.random() * (database.length - 1));

                if (choice.indexOf(i) > -1) {
                    switch (localStorage.getItem('type')) {
                        case 'episodes (without operators)':
                            while (database[random].episodes !== episode) {
                                random = Math.round(Math.random() * (database.length - 1));
                            }
                            break;

                        case 'episodes (with operators)':
                            switch (operator) {
                                case '<':
                                    while (database[random].episodes >= episode) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                case '>':
                                    while (database[random].episodes <= episode) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                case '<=':
                                    while (database[random].episodes > episode) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                case '>=':
                                    while (database[random].episodes < episode) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                default:
                                    while (database[random].episodes !== episode) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;
                            }
                            break;

                        case 'season':
                            while (database[random].season !== season) {
                                random = Math.round(Math.random() * (database.length - 1));
                            }
                            break;

                        case 'year (without operators)':
                            while (database[random].year !== year) {
                                random = Math.round(Math.random() * (database.length - 1));
                            }
                            break;

                        case 'year (with operators)':
                            switch (operator) {
                                case '<':
                                    while (!database[random].year || database[random].year >= year) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                case '>':
                                    while (database[random].year <= year) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                case '<=':
                                    while (!database[random].year || database[random].year > year) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                case '>=':
                                    while (database[random].year < year) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                default:
                                    while (database[random].year !== year) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;
                            }
                            break;

                        default:
                            while (database[random].tags.indexOf(tag) === -1) {
                                random = Math.round(Math.random() * (database.length - 1));
                            }
                            break;
                    }
                } else {
                    switch (localStorage.getItem('type')) {
                        case 'episodes (without operators)':
                            while (database[random].episodes === episode) {
                                random = Math.round(Math.random() * (database.length - 1));
                            }
                            break;

                        case 'episodes (with operators)':
                            switch (operator) {
                                case '<':
                                    while (database[random].episodes < episode) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                case '>':
                                    while (database[random].episodes > episode) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                case '<=':
                                    while (database[random].episodes <= episode) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                case '>=':
                                    while (database[random].episodes >= episode) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                default:
                                    while (database[random].episodes === episode) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;
                            }
                            break;

                        case 'season':
                            while (database[random].season === season) {
                                random = Math.round(Math.random() * (database.length - 1));
                            }
                            break;

                        case 'year (without operators)':
                            while (database[random].year === year) {
                                random = Math.round(Math.random() * (database.length - 1));
                            }
                            break;

                        case 'year (with operators)':
                            switch (operator) {
                                case '<':
                                    while (database[random].year && database[random].year < year) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                case '>':
                                    while (database[random].year > year) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                case '<=':
                                    while (database[random].year && database[random].year <= year) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                case '>=':
                                    while (database[random].year >= year) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;

                                default:
                                    while (database[random].year === year) {
                                        random = Math.round(Math.random() * (database.length - 1));
                                    }
                                    break;
                            }
                            break;

                        default:
                            while (database[random].tags.indexOf(tag) > -1) {
                                random = Math.round(Math.random() * (database.length - 1));
                            }
                            break;
                    }
                }

                switch (localStorage.getItem('thumbnails')) {
                    case 'disable':
                        div.innerHTML = '<span class="no-picture"></span>';
                        break;

                    default:
                        div.innerHTML = `<img class="picture" src="${database[random].picture}" loading="lazy" alt></img>`;
                        break;
                }

                div.innerHTML +=
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

        document.querySelector('.thumbnails').addEventListener('change', (e) => {
            localStorage.setItem('thumbnails', e.currentTarget.value);
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