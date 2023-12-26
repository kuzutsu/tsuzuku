import {
    addCommas,
    source,
    svg,
    tagsDelisted
} from '../../global.js';

const
    categories = ['episodes (with operators)', 'season', 'tag', 'type', 'year (with operators)'],
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
    set = new Set(),
    tags = [],
    tags2 = new Map(),
    types = ['movie', 'ona', 'ova', 'special', 'tv'],
    years = [],
    years2 = new Map();

let category = null,
    choice3 = null,
    choices = null,
    game = function () {
        // defined below
    },
    reset = true,
    skipped = false,
    stop = false,
    submitted = false,
    updated = '???';

fetch(source)
    .then((response) => response.json())
    .then((data) => {
        const d = data.data;

        updated = data.lastUpdate;

        document.querySelector('.loading').innerHTML = 'Building game<span class="el">.</span><span class="lip">.</span><span class="sis">.</span>';

        setTimeout(() => {
            for (const i of d) {
                const
                    e = i.episodes,
                    m = i.sources.filter((sources) => sources.match(/myanimelist\.net/giv)),
                    tt = new Set(i.tags.map((t) => t.replace(/&/giv, 'and').replace(/\s/giv, ' ').replace(/-/giv, ' ').replace(/,$/giv, ''))),
                    y = i.animeSeason.year;

                let c = false;

                if (!m.length) {
                    continue;
                }

                if (!i.episodes) {
                    continue;
                }

                if (set.has(m[0])) {
                    continue;
                }

                if (!localStorage.getItem('tsuzuku') || !JSON.parse(localStorage.getItem('tsuzuku')).delisted) {
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

                for (const value2 of [...tt]) {
                    if (tags2.has(value2)) {
                        tags2.set(value2, tags2.get(value2) + 1);
                    } else {
                        tags2.set(value2, 1);
                        tags.push(value2);
                    }
                }

                if (!y) {
                    continue;
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
                    link: m[0],
                    picture: i.picture.replace(i.picture.substr(i.picture.lastIndexOf('.')), '.webp'),
                    season: i.animeSeason.season.toLowerCase(),
                    tags: [...tt],
                    title: i.title,
                    type: i.type.toLowerCase(),
                    year: y
                });

                set.add(m[0]);
            }

            tags.sort();
            years.sort();
            episodes.sort();

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
                    minus = 0,
                    plus = 0;

                stop = true;

                document.querySelector('.plus').style.display = '';
                document.querySelector('.plus').innerHTML = '';
                document.querySelector('.minus').style.display = '';
                document.querySelector('.minus').innerHTML = '';
                document.querySelector('.min').style.display = '';
                document.querySelector('.min').innerHTML = '';

                for (let i = 0; i < choice3; i++) {
                    if (choice.indexOf(i) > -1) {
                        if (document.querySelector(`.choice > div:nth-child(${i + 1})`).classList.contains('selected')) {
                            if ((submitted && c.resultSubmit) || (c.skip && skipped && c.resultSkip)) {
                                document.querySelector(`.choice > div:nth-child(${i + 1})`).classList.remove('selected');

                                if (submitted && c.resultSubmit) {
                                    document.querySelector(`.choice > div:nth-child(${i + 1})`).classList.add('correct');
                                } else {
                                    document.querySelector(`.choice > div:nth-child(${i + 1})`).classList.add('none');
                                }
                            }

                            if (submitted) {
                                plus += 1;
                            }
                        } else {
                            if (c.selection.indexOf('or more') > -1) {
                                if ((submitted && c.resultSubmit) || (c.skip && skipped && c.resultSkip)) {
                                    if (submitted && c.resultSubmit) {
                                        document.querySelector(`.choice > div:nth-child(${i + 1})`).classList.add('incorrect');
                                    }
                                }

                                if (submitted) {
                                    minus += 1;
                                    incorrect = true;
                                }
                            }
                        }
                    } else {
                        if (document.querySelector(`.choice > div:nth-child(${i + 1})`).classList.contains('selected')) {
                            if ((submitted && c.resultSubmit) || (c.skip && skipped && c.resultSkip)) {
                                document.querySelector(`.choice > div:nth-child(${i + 1})`).classList.remove('selected');

                                if (submitted && c.resultSubmit) {
                                    document.querySelector(`.choice > div:nth-child(${i + 1})`).classList.add('incorrect');
                                } else {
                                    document.querySelector(`.choice > div:nth-child(${i + 1})`).classList.add('none');
                                }
                            }

                            if (submitted) {
                                minus += 1;
                                incorrect = true;
                            }
                        } else {
                            if (c.selection.indexOf('or more') > -1) {
                                if ((submitted && c.resultSubmit) || (c.skip && skipped && c.resultSkip)) {
                                    if (submitted && c.resultSubmit) {
                                        document.querySelector(`.choice > div:nth-child(${i + 1})`).classList.add('correct');
                                    }
                                }

                                if (submitted) {
                                    plus += 1;
                                }
                            }
                        }

                        if ((submitted && c.resultSubmit) || (c.skip && skipped && c.resultSkip)) {
                            document.querySelector(`.choice > div:nth-child(${i + 1})`).classList.add('dim');
                        }
                    }
                }

                if (submitted) {
                    if (plus) {
                        document.querySelector('.plus').innerHTML = `+${addCommas(plus)}`;
                        document.querySelector('.plus').style.display = 'inline';
                    } else {
                        document.querySelector('.plus').innerHTML = '';
                        document.querySelector('.plus').style.display = '';
                    }

                    if (minus) {
                        document.querySelector('.minus').innerHTML = `-${addCommas(minus)}`;
                        document.querySelector('.minus').style.display = 'inline';
                    } else {
                        document.querySelector('.minus').innerHTML = '';
                        document.querySelector('.minus').style.display = '';
                    }

                    c.score += plus - minus;

                    if (c.resetIncorrect && incorrect) {
                        document.querySelector('.min').innerHTML = 'Reset';
                        document.querySelector('.min').style.display = 'inline';

                        c.score = 0;
                    }

                    if (!c.negative && c.score < 0) {
                        document.querySelector('.min').innerHTML = 'Min reached';
                        document.querySelector('.min').style.display = 'inline';

                        c.score = 0;
                    }

                    document.querySelector('.score').innerHTML = addCommas(c.score);

                    if (c.score > c.high) {
                        c.high = c.score;
                        document.querySelector('.high').innerHTML = addCommas(c.high);
                    }
                }

                if (c.skip) {
                    document.querySelector('.skip').style.display = 'none';
                }

                if ((submitted && c.resultSubmit) || (c.skip && skipped && c.resultSkip)) {
                    document.querySelector('.submit').innerHTML = 'Next';
                    document.querySelector('.submit').style.display = '';
                }

                c.cheat = {};

                localStorage.setItem('quiz', JSON.stringify(c));

                if ((submitted && !c.resultSubmit) || (c.skip && skipped && !c.resultSkip)) {
                    submitted = false;
                    skipped = false;
                    game();
                }
            }

            game = function (start) {
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
                            : seasons[Math.round(Math.random() * (seasons.length - 1))],
                    type =
                        start && c.cheat.type
                            ? c.cheat.type
                            : types[Math.round(Math.random() * (types.length - 1))];

                if (reset || (submitted && c.resultSubmit) || (c.skip && skipped && c.resultSkip)) {
                    document.querySelector('.score').innerHTML = addCommas(c.score);
                    document.querySelector('.high').innerHTML = addCommas(c.high);

                    document.querySelector('.plus').style.display = '';
                    document.querySelector('.plus').innerHTML = '';
                    document.querySelector('.minus').style.display = '';
                    document.querySelector('.minus').innerHTML = '';
                    document.querySelector('.min').style.display = '';
                    document.querySelector('.min').innerHTML = '';
                }

                reset = false;
                skipped = false;
                stop = false;
                submitted = false;

                document.querySelector('.choice').innerHTML = '';

                if (c.autoSubmit && c.selection.indexOf('or more') === -1) {
                    document.querySelector('.submit').style.color = '';
                    document.querySelector('.submit').innerHTML = '';
                    document.querySelector('.submit').style.display = 'none';
                } else {
                    if (c.selection === '0 or more') {
                        document.querySelector('.submit').style.color = '';
                    } else {
                        document.querySelector('.submit').style.color = 'var(--disabled)';
                    }

                    document.querySelector('.submit').innerHTML = 'Submit';
                    document.querySelector('.submit').style.display = '';
                }

                if (c.skip) {
                    document.querySelector('.skip').style.display = '';
                } else {
                    document.querySelector('.skip').style.display = 'none';
                }

                if (start && c.cheat.category) {
                    category = c.cheat.category;
                } else {
                    if (c.category === 'random') {
                        category = categories[Math.round(Math.random() * (categories.length - 1))];
                    } else {
                        if (['episodes', 'year'].indexOf(c.category) > -1) {
                            if (c.operators) {
                                category = `${c.category} (with operators)`;
                            } else {
                                category = `${c.category} (without operators)`;
                            }
                        } else {
                            category = c.category;
                        }
                    }
                }

                if (start && c.cheat.choices) {
                    choice3 = c.cheat.choices;
                } else {
                    if (c.choices === 'random') {
                        choice3 = choice2[Math.round(Math.random() * (choice2.length - 1))];
                    } else {
                        choice3 = c.choices;
                    }
                }

                switch (c.selection) {
                    case '1 or more':
                        choices = Math.round(Math.random() * (choice3 - 1)) + 1;
                        break;
                    case '0 or more':
                        choices = Math.round(Math.random() * choice3);
                        break;
                    default:
                        choices = 1;
                        break;
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

                document.querySelector('.query a').href = '../../?query=';

                switch (category) {
                    case 'episodes (without operators)':
                        while (episodes2.get(episode) < choices) {
                            episode = episodes[Math.round(Math.random() * (episodes.length - 1))];
                        }

                        document.querySelector('.query a').href += escape(encodeURIComponent(`eps:${episode} `));
                        document.querySelector('.query a').innerHTML = `eps:<span class="bold">${episode}</span>`;
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

                        document.querySelector('.query a').href += escape(encodeURIComponent(`eps:${operator + episode} `));
                        document.querySelector('.query a').innerHTML = `eps:<span class="bold">${operator + episode}</span>`;
                        break;

                    case 'season':
                        document.querySelector('.query a').href += escape(encodeURIComponent(`season:${season} `));
                        document.querySelector('.query a').innerHTML = `season:<span class="bold">${season}</span>`;
                        break;

                    case 'type':
                        document.querySelector('.query a').href += escape(encodeURIComponent(`type:${type} `));
                        document.querySelector('.query a').innerHTML = `type:<span class="bold">${type}</span>`;
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

                        document.querySelector('.query a').href += escape(encodeURIComponent(`tag:${tag.replace(/\s/giv, '_')} `));
                        document.querySelector('.query a').innerHTML = `tag:<span class="bold">${tag.replace(/\s/giv, '_')}</span>`;
                        break;
                }

                for (let i = 0; i < choice3; i++) {
                    const div = document.createElement('div');

                    let random =
                        start && c.cheat.link && c.cheat.link.length === choice3 && database.findIndex((ii) => ii.link === c.cheat.link[i]) > -1
                            ? database.findIndex((ii) => ii.link === c.cheat.link[i])
                            : Math.round(Math.random() * (database.length - 1));

                    switch (category) {
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

                        case 'type':
                            if (choice.indexOf(i) > -1) {
                                while (database[random].type !== type || choices2.indexOf(database[random].link) > -1) {
                                    random = Math.round(Math.random() * (database.length - 1));
                                }
                            } else {
                                while (database[random].type === type || choices2.indexOf(database[random].link) > -1) {
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
                        `<span class="title" style="width: 100%;">${database[random].title}</span>` +
                        '<div class="source">' +
                            `<a href="../../?query=${escape(encodeURIComponent(`id:${database[random].link.slice('https://myanimelist.net/anime/'.length)} `))}" target="_blank" title="Search">` +
                                `<svg viewBox="${svg.viewBox}" height="17" width="17">${svg.search}</svg>` +
                            '</a>' +
                        '</div>';

                    div.addEventListener('click', (e) => {
                        if (e.target.classList.contains('source')) {
                            return;
                        }

                        if (stop) {
                            return;
                        }

                        if (c.selection === '1' && document.querySelector('.selected') && !e.currentTarget.classList.contains('selected')) {
                            document.querySelector('.selected').classList.remove('selected');
                        }

                        e.currentTarget.classList.toggle('selected');

                        if (document.querySelector('.selected')) {
                            document.querySelector('.submit').style.color = '';
                        } else {
                            if (c.selection === '0 or more') {
                                document.querySelector('.submit').style.color = '';
                            } else {
                                document.querySelector('.submit').style.color = 'var(--disabled)';
                            }
                        }

                        if (c.autoSubmit && c.selection.indexOf('or more') === -1) {
                            submitted = true;

                            div.blur();
                            submit();
                        }
                    });

                    document.querySelector('.choice').appendChild(div);
                }

                c.cheat = {
                    category: category,
                    choice: choice,
                    choices: choice3,
                    episode: episode,
                    link: choices2,
                    operator: operator,
                    season: season,
                    tag: tag,
                    type: type,
                    year: year
                };

                localStorage.setItem('quiz', JSON.stringify(c));
            };

            game(true);

            document.querySelector('.submit').addEventListener('click', () => {
                const c = JSON.parse(localStorage.getItem('quiz'));

                submitted = true;

                if (document.querySelector('.choice > .dim') || document.querySelector('.choice > div[style]')) {
                    game();

                    return;
                }

                if (c.selection !== '0 or more' && !document.querySelector('.selected')) {
                    return;
                }

                submit();
            });

            document.querySelector('#selection').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('quiz'));

                c.selection = e.target.value;
                c.score = 0;
                c.high = 0;

                if (e.target.value.indexOf('or more') > -1) {
                    document.querySelector('[for="auto-submit"]').style.color = 'var(--disabled)';
                    document.querySelector('#auto-submit').setAttribute('disabled', '');
                    document.querySelector('#auto-submit').parentElement.parentElement.style.display = 'none';
                } else {
                    document.querySelector('[for="auto-submit"]').style.color = '';
                    document.querySelector('#auto-submit').removeAttribute('disabled');
                    document.querySelector('#auto-submit').parentElement.parentElement.style.display = '';
                }

                localStorage.setItem('quiz', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('#choices').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('quiz'));

                c.choices = Number(e.target.value) || e.target.value;
                c.score = 0;
                c.high = 0;

                localStorage.setItem('quiz', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('#auto-submit').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('quiz'));

                c.autoSubmit = e.target.checked;
                c.score = 0;
                c.high = 0;

                localStorage.setItem('quiz', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('#skip').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('quiz'));

                c.skip = e.target.checked;
                c.score = 0;
                c.high = 0;

                if (e.target.checked) {
                    document.querySelector('[for="result-skip"]').style.color = '';
                    document.querySelector('#result-skip').removeAttribute('disabled');
                    document.querySelector('#result-skip').parentElement.parentElement.style.display = '';
                } else {
                    document.querySelector('[for="result-skip"]').style.color = 'var(--disabled)';
                    document.querySelector('#result-skip').setAttribute('disabled', '');
                    document.querySelector('#result-skip').parentElement.parentElement.style.display = 'none';
                }

                localStorage.setItem('quiz', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('#negative').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('quiz'));

                c.negative = e.target.checked;
                c.score = 0;
                c.high = 0;

                localStorage.setItem('quiz', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('#reset-incorrect').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('quiz'));

                c.resetIncorrect = e.target.checked;
                c.score = 0;
                c.high = 0;

                if (e.target.checked) {
                    document.querySelector('[for="negative"]').style.color = 'var(--disabled)';
                    document.querySelector('#negative').setAttribute('disabled', '');
                    document.querySelector('#negative').parentElement.parentElement.style.display = 'none';
                } else {
                    document.querySelector('[for="negative"]').style.color = '';
                    document.querySelector('#negative').removeAttribute('disabled');
                    document.querySelector('#negative').parentElement.parentElement.style.display = '';
                }

                localStorage.setItem('quiz', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('#result-submit').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('quiz'));

                c.resultSubmit = e.target.checked;
                c.score = 0;
                c.high = 0;

                localStorage.setItem('quiz', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('#result-skip').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('quiz'));

                c.resultSkip = e.target.checked;
                c.score = 0;
                c.high = 0;

                localStorage.setItem('quiz', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('#operators').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('quiz'));

                c.operators = e.target.checked;
                c.score = 0;
                c.high = 0;

                localStorage.setItem('quiz', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('#category').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('quiz'));

                c.category = e.target.value;
                c.score = 0;
                c.high = 0;

                if (['episodes', 'year'].indexOf(e.target.value) > -1) {
                    document.querySelector('[for="operators"]').style.color = '';
                    document.querySelector('#operators').removeAttribute('disabled');
                    document.querySelector('#operators').parentElement.parentElement.style.display = '';
                } else {
                    document.querySelector('[for="operators"]').style.color = 'var(--disabled)';
                    document.querySelector('#operators').setAttribute('disabled', '');
                    document.querySelector('#operators').parentElement.parentElement.style.display = 'none';
                }

                localStorage.setItem('quiz', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('.settings').addEventListener('click', () => {
                if (document.querySelector('.settings-container').style.display === 'none') {
                    document.querySelector('.settings svg').innerHTML = svg.settingsOpen;
                    document.querySelector('.settings-container').style.display = 'flex';
                    document.querySelector('.query').style.display = 'none';
                    document.querySelector('.choice').style.display = 'none';
                } else {
                    document.querySelector('.settings svg').innerHTML = svg.settingsClose;
                    document.querySelector('.settings-container').style.display = 'none';
                    document.querySelector('.query').style.display = '';
                    document.querySelector('.choice').style.display = '';
                }
            });

            document.querySelector('.reset-score').addEventListener('click', () => {
                const c = JSON.parse(localStorage.getItem('quiz'));

                c.score = 0;
                document.querySelector('.score').innerHTML = addCommas(c.score);

                localStorage.setItem('quiz', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('.reset-high').addEventListener('click', () => {
                const c = JSON.parse(localStorage.getItem('quiz'));

                c.high = 0;
                document.querySelector('.high').innerHTML = addCommas(c.high);

                localStorage.setItem('quiz', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('.reset-both').addEventListener('click', () => {
                const c = JSON.parse(localStorage.getItem('quiz'));

                c.score = 0;
                c.high = 0;
                document.querySelector('.score').innerHTML = addCommas(c.score);
                document.querySelector('.high').innerHTML = addCommas(c.high);

                localStorage.setItem('quiz', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('.skip').addEventListener('click', () => {
                const c = JSON.parse(localStorage.getItem('quiz'));

                if (!c.skip) {
                    return;
                }

                skipped = true;

                if (c.resultSkip) {
                    document.querySelector('.submit').style.color = '';
                    submit();
                    return;
                }

                game();
            });

            document.querySelector('.loading').innerHTML = `Database as of ${updated}`;
            document.querySelector('.reload').style.display = 'inline-flex';
            document.querySelector('main').style.display = '';
        }, 100);
    })
    .catch(() => {
        document.querySelector('.loading').innerHTML = 'Database not found';
    });