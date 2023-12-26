import {
    addCommas,
    source,
    svg,
    tagsDelisted
} from '../../global.js';

const
    categories = ['tag', 'type', 'year'],
    choice = [],
    choice2 = [3, 4, 5, 6, 7, 8, 9, 10],
    database = [],
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
    query = null,
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

            function submit() {
                const c = JSON.parse(localStorage.getItem('odd-one-out'));

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
                        }

                        if ((submitted && c.resultSubmit) || (c.skip && skipped && c.resultSkip)) {
                            document.querySelector(`.choice > div:nth-child(${i + 1})`).classList.add('dim');
                        }
                    }
                }

                switch (category) {
                    case 'type':
                        document.querySelector('.query-container').innerHTML =
                            `<a href="../../?query=${escape(encodeURIComponent(`type:${query} `))}">` +
                                '<span>type:</span>' +
                                `<span class="bold">${query}</span>` +
                            '</a>';
                        break;

                    case 'year':
                        document.querySelector('.query-container').innerHTML =
                            `<a href="../../?query=${escape(encodeURIComponent(`year:${query} `))}">` +
                                '<span>year:</span>' +
                                `<span class="bold">${query}</span>` +
                            '</a>';
                        break;

                    default:
                        document.querySelector('.query-container').innerHTML =
                            `<a href="../../?query=${escape(encodeURIComponent(`tag:${query.replace(/\s/giv, '_')} `))}">` +
                                '<span>tag:</span>' +
                                `<span class="bold">${query.replace(/\s/giv, '_')}</span>` +
                            '</a>';
                        break;
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

                localStorage.setItem('odd-one-out', JSON.stringify(c));

                if ((submitted && !c.resultSubmit) || (c.skip && skipped && !c.resultSkip)) {
                    submitted = false;
                    skipped = false;
                    game();
                }
            }

            game = function (start) {
                const
                    c = JSON.parse(localStorage.getItem('odd-one-out')),
                    choices2 = [],
                    mutual = new Map();

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

                if (c.autoSubmit) {
                    document.querySelector('.submit').style.color = '';
                    document.querySelector('.submit').innerHTML = '';
                    document.querySelector('.submit').style.display = 'none';
                } else {
                    document.querySelector('.submit').style.color = 'var(--disabled)';
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
                        category = c.category;
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

                choices = Math.round(Math.random() * (choice3 - 1));

                choice.splice(0);

                if (start && c.cheat.choice) {
                    choice.push(...c.cheat.choice);
                } else {
                    choice.push(choices);
                }

                if (c.category === 'random' && !c.showCategory) {
                    document.querySelector('.query-container').innerHTML = '<span>???:<span class="bold">???</span></span>';
                } else {
                    document.querySelector('.query-container').innerHTML = `<span>${category}:<span class="bold">???</span></span>`;
                }

                switch (category) {
                    case 'type':
                        query =
                            start && c.cheat.query
                                ? c.cheat.query
                                : types[Math.round(Math.random() * (types.length - 1))];

                        break;

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
                        start && c.cheat.link && c.cheat.link.length === choice3 && database.findIndex((ii) => ii.link === c.cheat.link[i]) > -1
                            ? database.findIndex((ii) => ii.link === c.cheat.link[i])
                            : Math.round(Math.random() * (database.length - 1));

                    switch (category) {
                        case 'type':
                            if (choice.indexOf(i) > -1) {
                                while (database[random].type === query || choices2.indexOf(database[random].link) > -1) {
                                    random = Math.round(Math.random() * (database.length - 1));
                                }
                            } else {
                                while (database[random].type !== query || choices2.indexOf(database[random].link) > -1) {
                                    random = Math.round(Math.random() * (database.length - 1));
                                }
                            }

                            if (c.category === 'random' && !c.showCategory) {
                                if (mutual.has(database[random].year)) {
                                    mutual.set(database[random].year, mutual.get(database[random].year) + 1);
                                } else {
                                    mutual.set(database[random].year, 1);
                                }

                                for (const value of database[random].tags) {
                                    if (mutual.has(value)) {
                                        mutual.set(value, mutual.get(value) + 1);
                                    } else {
                                        mutual.set(value, 1);
                                    }
                                }
                            }

                            break;

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

                            if (c.category === 'random' && !c.showCategory) {
                                if (mutual.has(database[random].type)) {
                                    mutual.set(database[random].type, mutual.get(database[random].type) + 1);
                                } else {
                                    mutual.set(database[random].type, 1);
                                }

                                for (const value of database[random].tags) {
                                    if (mutual.has(value)) {
                                        mutual.set(value, mutual.get(value) + 1);
                                    } else {
                                        mutual.set(value, 1);
                                    }
                                }
                            }

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

                            if (c.category === 'random' && !c.showCategory) {
                                if (mutual.has(database[random].type)) {
                                    mutual.set(database[random].type, mutual.get(database[random].type) + 1);
                                } else {
                                    mutual.set(database[random].type, 1);
                                }

                                if (mutual.has(database[random].year)) {
                                    mutual.set(database[random].year, mutual.get(database[random].year) + 1);
                                } else {
                                    mutual.set(database[random].year, 1);
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

                        if (document.querySelector('.selected') && !e.currentTarget.classList.contains('selected')) {
                            document.querySelector('.selected').classList.remove('selected');
                        }

                        e.currentTarget.classList.toggle('selected');

                        if (document.querySelector('.selected')) {
                            document.querySelector('.submit').style.color = '';
                        } else {
                            document.querySelector('.submit').style.color = 'var(--disabled)';
                        }

                        if (c.autoSubmit) {
                            submitted = true;

                            div.blur();
                            submit();
                        }
                    });

                    document.querySelector('.choice').appendChild(div);
                }

                if (c.category === 'random' && !c.showCategory) {
                    for (const value of mutual.values()) {
                        if (value === choice3 - 1) {
                            game();

                            return;
                        }
                    }
                }

                c.cheat = {
                    category: category,
                    choice: choice,
                    choices: choice3,
                    link: choices2,
                    query: query
                };

                localStorage.setItem('odd-one-out', JSON.stringify(c));
            };

            game(true);

            document.querySelector('.submit').addEventListener('click', () => {
                submitted = true;

                if (document.querySelector('.choice > .dim') || document.querySelector('.choice > div[style]')) {
                    game();

                    return;
                }

                if (!document.querySelector('.selected')) {
                    return;
                }

                submit();
            });

            document.querySelector('#show-category').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('odd-one-out'));

                c.showCategory = e.target.checked;
                c.score = 0;
                c.high = 0;

                localStorage.setItem('odd-one-out', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('#choices').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('odd-one-out'));

                c.choices = Number(e.target.value) || e.target.value;
                c.score = 0;
                c.high = 0;

                localStorage.setItem('odd-one-out', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('#auto-submit').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('odd-one-out'));

                c.autoSubmit = e.target.checked;
                c.score = 0;
                c.high = 0;

                localStorage.setItem('odd-one-out', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('#skip').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('odd-one-out'));

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

                localStorage.setItem('odd-one-out', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('#negative').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('odd-one-out'));

                c.negative = e.target.checked;
                c.score = 0;
                c.high = 0;

                localStorage.setItem('odd-one-out', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('#reset-incorrect').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('odd-one-out'));

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

                localStorage.setItem('odd-one-out', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('#result-submit').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('odd-one-out'));

                c.resultSubmit = e.target.checked;
                c.score = 0;
                c.high = 0;

                localStorage.setItem('odd-one-out', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('#result-skip').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('odd-one-out'));

                c.resultSkip = e.target.checked;
                c.score = 0;
                c.high = 0;

                localStorage.setItem('odd-one-out', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('#category').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('odd-one-out'));

                c.category = e.target.value;
                c.score = 0;
                c.high = 0;

                if (e.target.value === 'random') {
                    document.querySelector('[for="show-category"]').style.color = '';
                    document.querySelector('#show-category').removeAttribute('disabled');
                    document.querySelector('#show-category').parentElement.parentElement.style.display = '';
                } else {
                    document.querySelector('[for="show-category"]').style.color = 'var(--disabled)';
                    document.querySelector('#show-category').setAttribute('disabled', '');
                    document.querySelector('#show-category').parentElement.parentElement.style.display = 'none';
                }

                localStorage.setItem('odd-one-out', JSON.stringify(c));
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
                const c = JSON.parse(localStorage.getItem('odd-one-out'));

                c.score = 0;
                document.querySelector('.score').innerHTML = addCommas(c.score);

                localStorage.setItem('odd-one-out', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('.reset-high').addEventListener('click', () => {
                const c = JSON.parse(localStorage.getItem('odd-one-out'));

                c.high = 0;
                document.querySelector('.high').innerHTML = addCommas(c.high);

                localStorage.setItem('odd-one-out', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('.reset-both').addEventListener('click', () => {
                const c = JSON.parse(localStorage.getItem('odd-one-out'));

                c.score = 0;
                c.high = 0;
                document.querySelector('.score').innerHTML = addCommas(c.score);
                document.querySelector('.high').innerHTML = addCommas(c.high);

                localStorage.setItem('odd-one-out', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('.skip').addEventListener('click', () => {
                const c = JSON.parse(localStorage.getItem('odd-one-out'));

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