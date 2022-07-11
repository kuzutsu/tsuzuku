import {
    source
} from '/global.js';

const
    choice = [],
    choice2 = [2, 3, 4, 5, 6, 7, 8, 9, 10],
    database = [],
    episodes = [],
    episodes2 = new Map(),
    max = {
        episode: null,
        year: null
    },
    min = {
        episode: null,
        year: null
    },
    operators = ['', '<', '>', '<=', '>='],
    seasons = ['fall', 'spring', 'summer', 'winter'],
    settingsClose = '<path d="M9.25 22 8.85 18.8Q8.525 18.675 8.238 18.5Q7.95 18.325 7.675 18.125L4.7 19.375L1.95 14.625L4.525 12.675Q4.5 12.5 4.5 12.337Q4.5 12.175 4.5 12Q4.5 11.825 4.5 11.662Q4.5 11.5 4.525 11.325L1.95 9.375L4.7 4.625L7.675 5.875Q7.95 5.675 8.25 5.5Q8.55 5.325 8.85 5.2L9.25 2H14.75L15.15 5.2Q15.475 5.325 15.763 5.5Q16.05 5.675 16.325 5.875L19.3 4.625L22.05 9.375L19.475 11.325Q19.5 11.5 19.5 11.662Q19.5 11.825 19.5 12Q19.5 12.175 19.5 12.337Q19.5 12.5 19.45 12.675L22.025 14.625L19.275 19.375L16.325 18.125Q16.05 18.325 15.75 18.5Q15.45 18.675 15.15 18.8L14.75 22ZM12.05 15.5Q13.5 15.5 14.525 14.475Q15.55 13.45 15.55 12Q15.55 10.55 14.525 9.525Q13.5 8.5 12.05 8.5Q10.575 8.5 9.562 9.525Q8.55 10.55 8.55 12Q8.55 13.45 9.562 14.475Q10.575 15.5 12.05 15.5ZM12.05 13.5Q11.425 13.5 10.988 13.062Q10.55 12.625 10.55 12Q10.55 11.375 10.988 10.938Q11.425 10.5 12.05 10.5Q12.675 10.5 13.113 10.938Q13.55 11.375 13.55 12Q13.55 12.625 13.113 13.062Q12.675 13.5 12.05 13.5ZM12 12Q12 12 12 12Q12 12 12 12Q12 12 12 12Q12 12 12 12Q12 12 12 12Q12 12 12 12Q12 12 12 12Q12 12 12 12Q12 12 12 12Q12 12 12 12Q12 12 12 12Q12 12 12 12Q12 12 12 12Q12 12 12 12Q12 12 12 12Q12 12 12 12ZM11 20H12.975L13.325 17.35Q14.1 17.15 14.763 16.762Q15.425 16.375 15.975 15.825L18.45 16.85L19.425 15.15L17.275 13.525Q17.4 13.175 17.45 12.787Q17.5 12.4 17.5 12Q17.5 11.6 17.45 11.212Q17.4 10.825 17.275 10.475L19.425 8.85L18.45 7.15L15.975 8.2Q15.425 7.625 14.763 7.237Q14.1 6.85 13.325 6.65L13 4H11.025L10.675 6.65Q9.9 6.85 9.238 7.237Q8.575 7.625 8.025 8.175L5.55 7.15L4.575 8.85L6.725 10.45Q6.6 10.825 6.55 11.2Q6.5 11.575 6.5 12Q6.5 12.4 6.55 12.775Q6.6 13.15 6.725 13.525L4.575 15.15L5.55 16.85L8.025 15.8Q8.575 16.375 9.238 16.762Q9.9 17.15 10.675 17.35Z"></path>',
    settingsOpen = '<path d="M9.25 22 8.85 18.8Q8.525 18.675 8.238 18.5Q7.95 18.325 7.675 18.125L4.7 19.375L1.95 14.625L4.525 12.675Q4.5 12.5 4.5 12.337Q4.5 12.175 4.5 12Q4.5 11.825 4.5 11.662Q4.5 11.5 4.525 11.325L1.95 9.375L4.7 4.625L7.675 5.875Q7.95 5.675 8.25 5.5Q8.55 5.325 8.85 5.2L9.25 2H14.75L15.15 5.2Q15.475 5.325 15.763 5.5Q16.05 5.675 16.325 5.875L19.3 4.625L22.05 9.375L19.475 11.325Q19.5 11.5 19.5 11.662Q19.5 11.825 19.5 12Q19.5 12.175 19.5 12.337Q19.5 12.5 19.45 12.675L22.025 14.625L19.275 19.375L16.325 18.125Q16.05 18.325 15.75 18.5Q15.45 18.675 15.15 18.8L14.75 22ZM12.05 15.5Q13.5 15.5 14.525 14.475Q15.55 13.45 15.55 12Q15.55 10.55 14.525 9.525Q13.5 8.5 12.05 8.5Q10.575 8.5 9.562 9.525Q8.55 10.55 8.55 12Q8.55 13.45 9.562 14.475Q10.575 15.5 12.05 15.5Z"></path>',
    tags = [],
    tags2 = new Map(),
    types = ['tag', 'episodes (with operators)', 'year (with operators)', 'season'],
    years = [],
    years2 = new Map();

let choice3 = null,
    choices = null,
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

            function submit() {
                const c = JSON.parse(localStorage.getItem('quiz'));

                let incorrect = false,
                    score = 0;

                for (let i = 0; i < choice3; i++) {
                    if (choice.indexOf(i) > -1) {
                        if (document.querySelector(`.choice div:nth-child(${i + 1})`).classList.contains('selected')) {
                            document.querySelector(`.choice div:nth-child(${i + 1})`).classList.remove('selected');
                            document.querySelector(`.choice div:nth-child(${i + 1})`).style.background = 'var(--green)';
                            score += 1;
                        } else {
                            if (c.selection === 'multiple') {
                                document.querySelector(`.choice div:nth-child(${i + 1})`).style.background = 'var(--red)';
                                score -= 1;
                                incorrect = true;
                            }
                        }
                    } else {
                        if (document.querySelector(`.choice div:nth-child(${i + 1})`).classList.contains('selected')) {
                            document.querySelector(`.choice div:nth-child(${i + 1})`).classList.remove('selected');
                            document.querySelector(`.choice div:nth-child(${i + 1})`).style.background = 'var(--red)';
                            score -= 1;
                            incorrect = true;
                        } else {
                            if (c.selection === 'multiple') {
                                document.querySelector(`.choice div:nth-child(${i + 1})`).style.background = 'var(--green)';
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

                document.querySelector('.submit').innerHTML = 'Next';

                c.cheat = {};

                localStorage.setItem('quiz', JSON.stringify(c));
            }

            function game(start) {
                const
                    c = JSON.parse(localStorage.getItem('quiz')),
                    choices2 = [],
                    operator =
                        start && c.cheat.operator
                            ? c.cheat.operator
                            : operators[Math.round(Math.random() * (operators.length - 1))],
                    season =
                        start && c.cheat.season
                            ? c.cheat.season
                            : seasons[Math.round(Math.random() * (seasons.length - 1))];

                choice3 =
                    c.choices === 'random'
                        ? choice2[Math.round(Math.random() * (choice2.length - 1))]
                        : c.choices;

                choices =
                    c.selection === 'multiple'
                        ? Math.round(Math.random() * choice3)
                        : 1;

                document.querySelector('.score').innerHTML = c.score;
                document.querySelector('.high').innerHTML = c.high;
                document.querySelector('.choice').innerHTML = '';

                document.querySelector('.submit').innerHTML =
                    c.autoSubmit && c.selection !== 'multiple'
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
                }

                choice.splice(0);

                if (choices) {
                    if (start && c.cheat.choice) {
                        choice.push(...c.cheat.choice);
                    } else {
                        for (let i = 0; i < choices; i++) {
                            let n = Math.round(Math.random() * (choice3 - 1));

                            while (choice.indexOf(n) > -1) {
                                n = Math.round(Math.random() * (choice3 - 1));
                            }

                            choice.push(n);
                        }
                    }
                }

                let episode =
                        start && c.cheat.episode
                            ? c.cheat.episode
                            : episodes[Math.round(Math.random() * (episodes.length - 1))],
                    tag =
                        start && c.cheat.tag
                            ? c.cheat.tag
                            : tags[Math.round(Math.random() * (tags.length - 1))],
                    year =
                        start && c.cheat.year
                            ? c.cheat.year
                            : years[Math.round(Math.random() * (years.length - 1))];

                document.querySelector('.query a').href = '/?query=';

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
                    let random =
                        start && c.cheat.link && c.cheat.link.length === choice3
                            ? database.findIndex((ii) => ii.link === c.cheat.link[i]) > -1
                                ? database.findIndex((ii) => ii.link === c.cheat.link[i])
                                : Math.round(Math.random() * (database.length - 1))
                            : Math.round(Math.random() * (database.length - 1));

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

                        if (c.selection !== 'multiple' && document.querySelector('.selected')) {
                            document.querySelector('.selected').classList.remove('selected');
                        }

                        e.currentTarget.classList.toggle('selected');

                        if (c.autoSubmit && c.selection !== 'multiple') {
                            div.blur();
                            submit();
                        }
                    });

                    document.querySelector('.choice').appendChild(div);
                }

                c.cheat = {
                    choice: choice,
                    episode: episode,
                    link: choices2,
                    operator: operator,
                    season: season,
                    tag: tag,
                    type: type,
                    year: year
                };

                localStorage.setItem('quiz', JSON.stringify(c));
            }

            game(true);

            document.querySelector('.submit').addEventListener('click', () => {
                const c = JSON.parse(localStorage.getItem('quiz'));

                if (document.querySelector('.choice div[style]')) {
                    game();

                    return;
                }

                if (c.selection !== 'multiple' && !document.querySelector('.selected')) {
                    return;
                }

                submit();
            });

            document.querySelector('#selection').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('quiz'));

                c.selection = e.target.value;
                c.score = 0;
                c.high = 0;

                if (e.target.value === 'multiple') {
                    document.querySelector('[for="auto-submit"]').style.color = 'var(--disabled)';
                    document.querySelector('#auto-submit').setAttribute('disabled', '');
                } else {
                    document.querySelector('[for="auto-submit"]').style.color = '';
                    document.querySelector('#auto-submit').removeAttribute('disabled');
                }

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

            document.querySelector('#auto-submit').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('quiz'));

                c.autoSubmit = e.target.checked;
                c.score = 0;
                c.high = 0;

                localStorage.setItem('quiz', JSON.stringify(c));
                game();
            });

            document.querySelector('#skip').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('quiz'));

                c.skip = e.target.checked;
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
                    document.querySelector('.settings svg').innerHTML = settingsOpen;
                    document.querySelector('.settings-container').style.display = 'flex';
                    document.querySelector('.query').style.display = '';
                    document.querySelector('.choice').style.display = '';
                } else {
                    document.querySelector('.settings svg').innerHTML = settingsClose;
                    document.querySelector('.settings-container').style.display = 'none';
                    document.querySelector('.query').style.display = 'inline-flex';
                    document.querySelector('.choice').style.display = 'block';
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
                const c = JSON.parse(localStorage.getItem('quiz'));

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