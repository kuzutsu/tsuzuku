import {
    addCommas,
    removeReserved,
    source,
    svg,
    tagsDelisted
} from '../../global.js';

const
    answers = [],
    answers2 = [],
    answers3 = [],
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
    set = new Set(),
    tags = [],
    tags2 = new Map(),
    years = [],
    years2 = new Map();

let game = function () {
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
                    synonyms: i.synonyms,
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

            function submit() {
                const
                    c = JSON.parse(localStorage.getItem('crop')),
                    div = document.createElement('div'),
                    value = removeReserved(document.querySelector('.input').value.toLowerCase());

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

                div.style.alignItems = 'center';
                div.style.display = 'flex';
                div.style.minHeight = '40px';
                div.style.overflowWrap = 'anywhere';
                div.style.padding = '11.5px 19px';
                div.style.width = '100%';
                div.innerHTML = `<span style="user-select: text;">${value}</span>`;

                document.querySelector('.answers').prepend(div);
                document.querySelector('.input').value = '';
                document.querySelector('.input2').style.display = 'none';

                if (submitted) {
                    if (answers2.indexOf(value) > -1) {
                        div.classList.add('correct');
                        plus += 1;
                    } else {
                        div.classList.add('incorrect');
                        document.querySelector('.answers').prepend(div);
                        document.querySelector('.input').value = '';
                        document.querySelector('.input2').style.display = 'none';

                        minus += 1;
                        incorrect = true;
                    }
                } else {
                    div.classList.add('none');
                }

                if ((submitted && c.resultSubmit) || (c.skip && skipped && c.resultSkip)) {
                    for (const value2 of answers3) {
                        if (submitted && c.resultSubmit && removeReserved(value2.toLowerCase()) === value) {
                            continue;
                        }

                        document.querySelector('.answers').innerHTML +=
                            '<div style="align-items: center; display: flex; height: 40px; padding: 0 19px; width: 100%;">' +
                                `<span style="user-select: text;">${removeReserved(value2)}</span>` +
                            '</div>';
                    }
                }

                document.querySelector('.source').style.display = '';

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

                localStorage.setItem('crop', JSON.stringify(c));

                if ((submitted && !c.resultSubmit) || (c.skip && skipped && !c.resultSkip)) {
                    submitted = false;
                    skipped = false;
                    game();
                }
            }

            game = function (start) {
                const
                    c = JSON.parse(localStorage.getItem('crop')),
                    random = Math.round(Math.random() * (database.length - 1)),
                    set2 = new Set();

                let link = null,
                    picture = null,
                    x = null,
                    y = null;

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

                document.querySelector('.source').style.display = 'none';
                document.querySelector('.submit').style.color = 'var(--disabled)';
                document.querySelector('.submit').innerHTML = 'Submit';

                if (c.skip) {
                    document.querySelector('.skip').style.display = '';
                } else {
                    document.querySelector('.skip').style.display = 'none';
                }

                if (start && c.cheat.answers && c.cheat.answers.length && c.cheat.link && c.cheat.picture && c.cheat.x && c.cheat.y) {
                    for (const value of c.cheat.answers) {
                        if (set2.has(value.toLowerCase())) {
                            continue;
                        }

                        set2.add(value.toLowerCase());

                        answers.push(value);
                        answers3.push(removeReserved(value));
                    }

                    link = c.cheat.link;
                    picture = c.cheat.picture;
                    x = c.cheat.x;
                    y = c.cheat.y;
                } else {
                    answers.splice(0);
                    answers3.splice(0);

                    for (const value of [database[random].title, ...database[random].synonyms]) {
                        if (set2.has(value.toLowerCase())) {
                            continue;
                        }

                        set2.add(value.toLowerCase());

                        answers.push(value);
                        answers3.push(removeReserved(value));
                    }

                    link = database[random].link;
                    picture = database[random].picture;
                    x = Math.round(Math.random() * 100);
                    y = Math.round(Math.random() * 100);
                }

                answers2.splice(0);
                answers2.push(...answers.map((s) => s.toLowerCase()));

                document.querySelector('.query-container').innerHTML = `<div style="background-color: var(--background-hover); background-image: url(${picture}); background-position: ${x}% ${y}%; height: 100px; margin-top: 11.5px; width: 100px;"></div>`;
                document.querySelector('.source').href = `../../?query=${escape(encodeURIComponent(`id:${link.slice('https://myanimelist.net/anime/'.length)} `))}`;

                c.cheat = {
                    answers: answers,
                    link: link,
                    picture: picture,
                    x: x,
                    y: y
                };

                document.querySelector('.input').value = '';
                document.querySelector('.input2').style.display = '';
                document.querySelector('.answers').innerHTML = '';
                document.querySelector('.input').focus();

                localStorage.setItem('crop', JSON.stringify(c));
            };

            game(true);

            document.querySelector('.input').addEventListener('input', () => {
                if (document.querySelector('.input').value) {
                    document.querySelector('.submit').style.color = '';
                } else {
                    document.querySelector('.submit').style.color = 'var(--disabled)';
                }
            });

            document.querySelector('.input').addEventListener('keydown', (e) => {
                if (stop) {
                    return;
                }

                if (e.key !== 'Enter' || e.repeat) {
                    return;
                }

                if (!document.querySelector('.input').value) {
                    return;
                }

                submitted = true;
                submit();
            });

            document.querySelector('.submit').addEventListener('click', () => {
                submitted = true;

                if (document.querySelector('.input2').style.display === 'none') {
                    game();

                    return;
                }

                if (!document.querySelector('.input').value) {
                    return;
                }

                submit();
            });

            document.querySelector('#skip').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('crop'));

                c.skip = e.target.checked;
                c.score = 0;
                c.high = 0;

                if (document.querySelector('#skip').checked) {
                    document.querySelector('[for="result-skip"]').style.color = '';
                    document.querySelector('#result-skip').removeAttribute('disabled');
                    document.querySelector('#result-skip').parentElement.parentElement.style.display = '';
                } else {
                    document.querySelector('[for="result-skip"]').style.color = 'var(--disabled)';
                    document.querySelector('#result-skip').setAttribute('disabled', '');
                    document.querySelector('#result-skip').parentElement.parentElement.style.display = 'none';
                }

                localStorage.setItem('crop', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('#negative').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('crop'));

                c.negative = e.target.checked;
                c.score = 0;
                c.high = 0;

                localStorage.setItem('crop', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('#reset-incorrect').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('crop'));

                c.resetIncorrect = e.target.checked;
                c.score = 0;
                c.high = 0;

                if (document.querySelector('#reset-incorrect').checked) {
                    document.querySelector('[for="negative"]').style.color = 'var(--disabled)';
                    document.querySelector('#negative').setAttribute('disabled', '');
                    document.querySelector('#negative').parentElement.parentElement.style.display = 'none';
                } else {
                    document.querySelector('[for="negative"]').style.color = '';
                    document.querySelector('#negative').removeAttribute('disabled');
                    document.querySelector('#negative').parentElement.parentElement.style.display = '';
                }

                localStorage.setItem('crop', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('#result-submit').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('crop'));

                c.resultSubmit = e.target.checked;
                c.score = 0;
                c.high = 0;

                localStorage.setItem('crop', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('#result-skip').addEventListener('change', (e) => {
                const c = JSON.parse(localStorage.getItem('crop'));

                c.resultSkip = e.target.checked;
                c.score = 0;
                c.high = 0;

                localStorage.setItem('crop', JSON.stringify(c));
                reset = true;
                game();
            });

            // document.querySelector('#auto-focus').addEventListener('change', (e) => {
            //     const c = JSON.parse(localStorage.getItem('crop'));

            //     c.autoFocus = e.target.checked;
            //     c.score = 0;
            //     c.high = 0;

            //     localStorage.setItem('crop', JSON.stringify(c));
            //     reset = true;
            //     game();
            // });

            // document.querySelector('#repeat').addEventListener('change', (e) => {
            //     const c = JSON.parse(localStorage.getItem('crop'));

            //     c.repeat = e.target.checked;
            //     c.score = 0;
            //     c.high = 0;

            //     if (e.target.checked) {
            //         document.querySelector('[for="clear"]').style.color = '';
            //         document.querySelector('#clear').removeAttribute('disabled');
            //         document.querySelector('#clear').parentElement.parentElement.style.display = '';
            //     } else {
            //         document.querySelector('[for="clear"]').style.color = 'var(--disabled)';
            //         document.querySelector('#clear').setAttribute('disabled', '');
            //         document.querySelector('#clear').parentElement.parentElement.style.display = 'none';
            //     }

            //     localStorage.setItem('crop', JSON.stringify(c));
            //     reset = true;
            //     game();
            // });

            // document.querySelector('#clear').addEventListener('change', (e) => {
            //     const c = JSON.parse(localStorage.getItem('crop'));

            //     c.clear = e.target.checked;
            //     c.score = 0;
            //     c.high = 0;

            //     localStorage.setItem('crop', JSON.stringify(c));
            //     reset = true;
            //     game();
            // });

            document.querySelector('.settings').addEventListener('click', () => {
                if (document.querySelector('.settings-container').style.display === 'none') {
                    document.querySelector('.settings svg').innerHTML = svg.settingsOpen;
                    document.querySelector('.settings-container').style.display = 'flex';
                    document.querySelector('.query').style.display = 'none';
                    document.querySelector('.main').style.display = 'none';
                } else {
                    document.querySelector('.settings svg').innerHTML = svg.settingsClose;
                    document.querySelector('.settings-container').style.display = 'none';
                    document.querySelector('.query').style.display = '';
                    document.querySelector('.main').style.display = '';
                }
            });

            document.querySelector('.reset-score').addEventListener('click', () => {
                const c = JSON.parse(localStorage.getItem('crop'));

                c.score = 0;
                document.querySelector('.score').innerHTML = addCommas(c.score);

                localStorage.setItem('crop', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('.reset-high').addEventListener('click', () => {
                const c = JSON.parse(localStorage.getItem('crop'));

                c.high = 0;
                document.querySelector('.high').innerHTML = addCommas(c.high);

                localStorage.setItem('crop', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('.reset-both').addEventListener('click', () => {
                const c = JSON.parse(localStorage.getItem('crop'));

                c.score = 0;
                c.high = 0;
                document.querySelector('.score').innerHTML = addCommas(c.score);
                document.querySelector('.high').innerHTML = addCommas(c.high);

                localStorage.setItem('crop', JSON.stringify(c));
                reset = true;
                game();
            });

            document.querySelector('.skip').addEventListener('click', () => {
                const c = JSON.parse(localStorage.getItem('crop'));

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