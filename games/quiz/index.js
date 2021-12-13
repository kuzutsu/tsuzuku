const
    choice = [],
    choice2 = [2, 3, 4, 5, 6, 7, 8, 9, 10],
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

let choice3 = null,
    choices = null,
    type = null;

fetch('https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database-minified.json')
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

                let source = null;

                if (!m.length) {
                    continue;
                }

                if (!d[i].episodes) {
                    continue;
                }

                if (d[i].sources.filter((sources) => sources.match(/myanimelist\.net/gu)).length) {
                    source = /myanimelist\.net/gu;
                }

                if (d[i].picture === 'https://cdn.myanimelist.net/images/qm_50.gif') {
                    continue;
                }

                if (d[i].tags.indexOf('anime influenced') > -1) {
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

                    if (episodes2.has(e)) {
                        episodes2.set(e, episodes2.get(e) + 1);
                    } else {
                        episodes2.set(e, 1);
                        episodes.push(e);
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
            episodes.sort();
            years.sort();
            years.splice(years.indexOf(null), 1);

            max.episode = Math.max(...episodes);
            min.episode = Math.min(...episodes);

            max.year = Math.max(...years);
            min.year = Math.min(...years);

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
                const
                    c = JSON.parse(localStorage.getItem('quiz')),
                    choices2 = [],
                    operator = operators[Math.round(Math.random() * (operators.length - 1))],
                    season = seasons[Math.round(Math.random() * (seasons.length - 1))];

                choice3 =
                    c.choices === 'random'
                        ? choice2[Math.round(Math.random() * (choice2.length - 1))]
                        : c.choices;

                choices =
                    c.selection === 'single'
                        ? 1
                        : Math.round(Math.random() * choice3);

                document.querySelector('.score').innerHTML = c.score;
                document.querySelector('.high').innerHTML = c.high;
                document.querySelector('.submit').innerHTML = 'Submit';
                document.querySelector('.choice').innerHTML = '';

                if (c.type === 'random') {
                    type = types[Math.round(Math.random() * (types.length - 1))];
                } else {
                    if (['episodes', 'year'].indexOf(c.type) > -1) {
                        if (c.operators) {
                            type = `${c.type} (with operators)`;
                        } else {
                            type = `${c.type} (without operators)`;
                        }
                    } else {
                        type = c.type;
                    }
                }

                choice.splice(0);

                if (choices) {
                    for (let i = 0; i < choices; i++) {
                        let n = Math.round(Math.random() * (choice3 - 1));

                        while (choice.indexOf(n) > -1) {
                            n = Math.round(Math.random() * (choice3 - 1));
                        }

                        choice.push(n);
                    }
                }

                let episode = episodes[Math.round(Math.random() * (episodes.length - 1))],
                    tag = tags[Math.round(Math.random() * (tags.length - 1))],
                    year = years[Math.round(Math.random() * (years.length - 1))];

                document.querySelector('.query a').href = '../../?query=';

                switch (type) {
                    case 'episodes (without operators)':
                        while (episodes2.get(episode) < choices) {
                            episode = episodes[Math.round(Math.random() * (episodes.length - 1))];
                        }

                        document.querySelector('.query a').href += escape(encodeURIComponent(`episodes:${episode} `));
                        document.querySelector('.query a').innerHTML = `episodes:<span class="bold">${episode}</span>`;
                        break;

                    case 'episodes (with operators)':
                        switch (operator) {
                            case '<':
                                while (episode === min.episode || operate(operator, episodes2, episode) < choices || operate('>=', episodes2, episode) < (choice3 - choices)) {
                                    episode = episodes[Math.round(Math.random() * (episodes.length - 1))];
                                }
                                break;

                            case '>':
                                while (episode === max.episode || operate(operator, episodes2, episode) < choices || operate('<=', episodes2, episode) < (choice3 - choices)) {
                                    episode = episodes[Math.round(Math.random() * (episodes.length - 1))];
                                }
                                break;

                            case '<=':
                                while (episode === max.episode || operate(operator, episodes2, episode) < choices || operate('>', episodes2, episode) < (choice3 - choices)) {
                                    episode = episodes[Math.round(Math.random() * (episodes.length - 1))];
                                }
                                break;

                            case '>=':
                                while (episode === min.episode || operate(operator, episodes2, episode) < choices || operate('<', episodes2, episode) < (choice3 - choices)) {
                                    episode = episodes[Math.round(Math.random() * (episodes.length - 1))];
                                }
                                break;

                            default:
                                while (episodes2.get(episode) < choices) {
                                    episode = episodes[Math.round(Math.random() * (episodes.length - 1))];
                                }
                                break;
                        }

                        document.querySelector('.query a').href += escape(encodeURIComponent(`episodes:${operator + episode} `));
                        document.querySelector('.query a').innerHTML = `episodes:<span class="bold">${operator + episode}</span>`;
                        break;

                    case 'season':
                        document.querySelector('.query a').href += escape(encodeURIComponent(`season:${season} `));
                        document.querySelector('.query a').innerHTML = `season:<span class="bold">${season}</span>`;
                        break;

                    case 'year (without operators)':
                        while (years2.get(year) < choices) {
                            year = years[Math.round(Math.random() * (years.length - 1))];
                        }

                        document.querySelector('.query a').href += escape(encodeURIComponent(`year:${year} `));
                        document.querySelector('.query a').innerHTML = `year:<span class="bold">${year}</span>`;
                        break;

                    case 'year (with operators)':
                        switch (operator) {
                            case '<':
                                while (!year || year === min.year || operate(operator, years2, year) < choices || operate('>=', years2, year) < (choice3 - choices)) {
                                    year = years[Math.round(Math.random() * (years.length - 1))];
                                }
                                break;

                            case '>':
                                while (!year || year === max.year || operate(operator, years2, year) < choices || operate('<=', years2, year) < (choice3 - choices)) {
                                    year = years[Math.round(Math.random() * (years.length - 1))];
                                }
                                break;

                            case '<=':
                                while (!year || year === max.year || operate(operator, years2, year) < choices || operate('>', years2, year) < (choice3 - choices)) {
                                    year = years[Math.round(Math.random() * (years.length - 1))];
                                }
                                break;

                            case '>=':
                                while (!year || year === min.year || operate(operator, years2, year) < choices || operate('<', years2, year) < (choice3 - choices)) {
                                    year = years[Math.round(Math.random() * (years.length - 1))];
                                }
                                break;

                            default:
                                while (years2.get(year) < choices) {
                                    year = years[Math.round(Math.random() * (years.length - 1))];
                                }
                                break;
                        }

                        document.querySelector('.query a').href += escape(encodeURIComponent(`year:${operator + year} `));
                        document.querySelector('.query a').innerHTML = `year:<span class="bold">${operator + year}</span>`;
                        break;

                    default:
                        while (tags2.get(tag) < choices) {
                            tag = tags[Math.round(Math.random() * (tags.length - 1))];
                        }

                        document.querySelector('.query a').href += escape(encodeURIComponent(`tag:${tag} `));
                        document.querySelector('.query a').innerHTML = `tag:<span class="bold">${tag}</span>`;
                        break;
                }

                for (let i = 0; i < choice3; i++) {
                    const div = document.createElement('div');
                    let random = Math.round(Math.random() * (database.length - 1));

                    switch (type) {
                        case 'episodes (without operators)':
                            if (choice.indexOf(i) > -1) {
                                while (database[random].episodes !== episode || choices2.indexOf(database[random].link) > -1) {
                                    random = Math.round(Math.random() * (database.length - 1));
                                }
                            } else {
                                while (database[random].episodes === episode || choices2.indexOf(database[random].link) > -1) {
                                    random = Math.round(Math.random() * (database.length - 1));
                                }
                            }

                            break;

                        case 'episodes (with operators)':
                            switch (operator) {
                                case '<':
                                    if (choice.indexOf(i) > -1) {
                                        while (database[random].episodes >= episode || choices2.indexOf(database[random].link) > -1) {
                                            random = Math.round(Math.random() * (database.length - 1));
                                        }
                                    } else {
                                        while (database[random].episodes < episode || choices2.indexOf(database[random].link) > -1) {
                                            random = Math.round(Math.random() * (database.length - 1));
                                        }
                                    }

                                    break;

                                case '>':
                                    if (choice.indexOf(i) > -1) {
                                        while (database[random].episodes <= episode || choices2.indexOf(database[random].link) > -1) {
                                            random = Math.round(Math.random() * (database.length - 1));
                                        }
                                    } else {
                                        while (database[random].episodes > episode || choices2.indexOf(database[random].link) > -1) {
                                            random = Math.round(Math.random() * (database.length - 1));
                                        }
                                    }

                                    break;

                                case '<=':
                                    if (choice.indexOf(i) > -1) {
                                        while (database[random].episodes > episode || choices2.indexOf(database[random].link) > -1) {
                                            random = Math.round(Math.random() * (database.length - 1));
                                        }
                                    } else {
                                        while (database[random].episodes <= episode || choices2.indexOf(database[random].link) > -1) {
                                            random = Math.round(Math.random() * (database.length - 1));
                                        }
                                    }

                                    break;

                                case '>=':
                                    if (choice.indexOf(i) > -1) {
                                        while (database[random].episodes < episode || choices2.indexOf(database[random].link) > -1) {
                                            random = Math.round(Math.random() * (database.length - 1));
                                        }
                                    } else {
                                        while (database[random].episodes >= episode || choices2.indexOf(database[random].link) > -1) {
                                            random = Math.round(Math.random() * (database.length - 1));
                                        }
                                    }

                                    break;

                                default:
                                    if (choice.indexOf(i) > -1) {
                                        while (database[random].episodes !== episode || choices2.indexOf(database[random].link) > -1) {
                                            random = Math.round(Math.random() * (database.length - 1));
                                        }
                                    } else {
                                        while (database[random].episodes === episode || choices2.indexOf(database[random].link) > -1) {
                                            random = Math.round(Math.random() * (database.length - 1));
                                        }
                                    }

                                    break;
                            }

                            break;

                        case 'season':
                            if (choice.indexOf(i) > -1) {
                                while (database[random].season !== season || choices2.indexOf(database[random].link) > -1) {
                                    random = Math.round(Math.random() * (database.length - 1));
                                }
                            } else {
                                while (database[random].season === season || choices2.indexOf(database[random].link) > -1) {
                                    random = Math.round(Math.random() * (database.length - 1));
                                }
                            }

                            break;

                        case 'year (without operators)':
                            if (choice.indexOf(i) > -1) {
                                while (database[random].year !== year || choices2.indexOf(database[random].link) > -1) {
                                    random = Math.round(Math.random() * (database.length - 1));
                                }
                            } else {
                                while (database[random].year === year || choices2.indexOf(database[random].link) > -1) {
                                    random = Math.round(Math.random() * (database.length - 1));
                                }
                            }

                            break;

                        case 'year (with operators)':
                            switch (operator) {
                                case '<':
                                    if (choice.indexOf(i) > -1) {
                                        while (!database[random].year || database[random].year >= year || choices2.indexOf(database[random].link) > -1) {
                                            random = Math.round(Math.random() * (database.length - 1));
                                        }
                                    } else {
                                        while ((database[random].year && database[random].year < year) || choices2.indexOf(database[random].link) > -1) {
                                            random = Math.round(Math.random() * (database.length - 1));
                                        }
                                    }

                                    break;

                                case '>':
                                    if (choice.indexOf(i) > -1) {
                                        while (database[random].year <= year || choices2.indexOf(database[random].link) > -1) {
                                            random = Math.round(Math.random() * (database.length - 1));
                                        }
                                    } else {
                                        while (database[random].year > year || choices2.indexOf(database[random].link) > -1) {
                                            random = Math.round(Math.random() * (database.length - 1));
                                        }
                                    }

                                    break;

                                case '<=':
                                    if (choice.indexOf(i) > -1) {
                                        while (!database[random].year || database[random].year > year || choices2.indexOf(database[random].link) > -1) {
                                            random = Math.round(Math.random() * (database.length - 1));
                                        }
                                    } else {
                                        while ((database[random].year && database[random].year <= year) || choices2.indexOf(database[random].link) > -1) {
                                            random = Math.round(Math.random() * (database.length - 1));
                                        }
                                    }

                                    break;

                                case '>=':
                                    if (choice.indexOf(i) > -1) {
                                        while (database[random].year < year || choices2.indexOf(database[random].link) > -1) {
                                            random = Math.round(Math.random() * (database.length - 1));
                                        }
                                    } else {
                                        while (database[random].year >= year || choices2.indexOf(database[random].link) > -1) {
                                            random = Math.round(Math.random() * (database.length - 1));
                                        }
                                    }

                                    break;

                                default:
                                    if (choice.indexOf(i) > -1) {
                                        while (database[random].year !== year || choices2.indexOf(database[random].link) > -1) {
                                            random = Math.round(Math.random() * (database.length - 1));
                                        }
                                    } else {
                                        while (database[random].year === year || choices2.indexOf(database[random].link) > -1) {
                                            random = Math.round(Math.random() * (database.length - 1));
                                        }
                                    }

                                    break;
                            }

                            break;

                        default:
                            if (choice.indexOf(i) > -1) {
                                while (database[random].tags.indexOf(tag) === -1 || choices2.indexOf(database[random].link) > -1) {
                                    random = Math.round(Math.random() * (database.length - 1));
                                }
                            } else {
                                while (database[random].tags.indexOf(tag) > -1 || choices2.indexOf(database[random].link) > -1) {
                                    random = Math.round(Math.random() * (database.length - 1));
                                }
                            }

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

                        if (c.selection === 'single' && document.querySelector('.selected')) {
                            document.querySelector('.selected').classList.remove('selected');
                        }

                        e.currentTarget.classList.toggle('selected');
                    });

                    document.querySelector('.choice').appendChild(div);
                }

                localStorage.setItem('quiz', JSON.stringify(c));
            }

            game();

            document.querySelector('.submit').addEventListener('click', (e) => {
                const c = JSON.parse(localStorage.getItem('quiz'));

                let incorrect = false,
                    score = 0;

                if (document.querySelector('.choice div[style]')) {
                    game();

                    return;
                }

                if (c.selection === 'single' && !document.querySelector('.selected')) {
                    return;
                }

                e.target.innerHTML = 'Next';

                for (let i = 0; i < choice3; i++) {
                    if (choice.indexOf(i) > -1) {
                        if (document.querySelector(`.choice div:nth-child(${i + 1})`).classList.contains('selected')) {
                            document.querySelector(`.choice div:nth-child(${i + 1})`).classList.remove('selected');
                            document.querySelector(`.choice div:nth-child(${i + 1})`).style.background = green;
                            score += 1;
                        } else {
                            if (c.selection !== 'single') {
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
                            if (c.selection !== 'single') {
                                document.querySelector(`.choice div:nth-child(${i + 1})`).style.background = green;
                                score += 1;
                            }
                        }

                        document.querySelector(`.choice div:nth-child(${i + 1})`).classList.add('dim');
                    }
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

                localStorage.setItem('quiz', JSON.stringify(c));
            });

            document.querySelector('#selection').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('quiz'));

                c.selection = e.target.value;
                c.score = 0;
                c.high = 0;

                localStorage.setItem('quiz', JSON.stringify(c));
                game();
            });

            document.querySelector('#choices').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('quiz'));

                c.choices = Number(e.target.value) || e.target.value;
                c.score = 0;
                c.high = 0;

                localStorage.setItem('quiz', JSON.stringify(c));
                game();
            });

            document.querySelector('#negative').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('quiz'));

                c.negative = e.target.checked;
                c.score = 0;
                c.high = 0;

                localStorage.setItem('quiz', JSON.stringify(c));
                game();
            });

            document.querySelector('#reset-incorrect').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('quiz'));

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

                localStorage.setItem('quiz', JSON.stringify(c));
                game();
            });

            document.querySelector('#operators').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('quiz'));

                c.operators = e.target.checked;
                c.score = 0;
                c.high = 0;

                localStorage.setItem('quiz', JSON.stringify(c));
                game();
            });

            document.querySelector('#type').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('quiz'));

                c.type = e.target.value;
                c.score = 0;
                c.high = 0;

                if (['episodes', 'year'].indexOf(e.target.value) > -1) {
                    document.querySelector('[for="operators"]').style.color = '';
                    document.querySelector('#operators').removeAttribute('disabled');
                } else {
                    document.querySelector('[for="operators"]').style.color = 'var(--disabled)';
                    document.querySelector('#operators').setAttribute('disabled', '');
                }

                localStorage.setItem('quiz', JSON.stringify(c));
                game();
            });

            document.querySelector('.settings').addEventListener('click', () => {
                if (document.querySelector('.settings-container').style.display === 'none') {
                    document.querySelector('.settings-container').style.display = 'flex';
                } else {
                    document.querySelector('.settings-container').style.display = 'none';
                }
            });

            document.querySelector('.score').addEventListener('click', (e) => {
                const c = JSON.parse(localStorage.getItem('quiz'));

                c.score = 0;
                e.target.innerHTML = c.score;

                localStorage.setItem('quiz', JSON.stringify(c));
            });

            document.querySelector('.high').addEventListener('click', (e) => {
                const c = JSON.parse(localStorage.getItem('quiz'));

                c.high = 0;
                e.target.innerHTML = c.high;

                localStorage.setItem('quiz', JSON.stringify(c));
            });

            document.querySelector('.reload').addEventListener('click', () => {
                game();
            });

            document.querySelector('.loading').remove();
            document.querySelector('.menu').style.display = 'inline-flex';
            document.querySelector('.query').style.display = 'inline-flex';
        }, 100);
    })
    .catch(() => {
        document.querySelector('.loading').innerHTML = 'Database not found';
    });