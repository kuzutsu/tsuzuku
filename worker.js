if (typeof Fuse === 'undefined') {
    importScripts('https://cdn.jsdelivr.net/npm/fuse.js@6.4.6/dist/fuse.min.js');
}

function is(value1, type, value2) {
    if (!value1) {
        if (value2.toString().toLowerCase() === 'tba') {
            return true;
        }

        return false;
    }

    const
        v1 = Number(value1),
        v2 = Number(value2);

    switch (type) {
        case '<=':
            return v1 <= v2;
        case '>=':
            return v1 >= v2;
        case '<':
            return v1 < v2;
        case '>':
            return v1 > v2;
        default:
            return v1 === v2;
    }
}

addEventListener('message', (event) => {
    const
        f = [],
        u = [];

    let alt = true,
        dd = null,
        dead = false,
        episodes = null,
        ff = null,
        found = false,
        mismatched = false,
        n = false,
        ongoing = false,
        progress = null,
        random = 0,
        regex = false,
        season = null,
        status = null,
        tags = null,
        type = null,
        uu = null,
        v = event.data.value,
        year = null;

    if (!v.trim()) {
        postMessage({
            message: 'progress',
            progress: '100%'
        });

        postMessage({
            message: 'found'
        });

        postMessage({
            message: 'clear'
        });

        return;
    }

    if ((/\bepisodes:(?:&?(?:<=|>=|<|>)?(?:0|[1-9][0-9]*)\b)+/giu).test(v)) {
        episodes = (/\bepisodes:(?:&?(?:<=|>=|<|>)?(?:0|[1-9][0-9]*)\b)+/giu).exec(v)[0].replace(/episodes:/giu, '').split('&');
        v = v.replace(/\bepisodes:(?:&?(?:<=|>=|<|>)?(?:0|[1-9][0-9]*)\b)+/giu, '');
    }

    if ((/\bprogress:(?:&?(?:<=|>=|<|>)?(?:0|[1-9][0-9]*)(?:%\B|\b))+/giu).test(v)) {
        progress = (/\bprogress:(?:&?(?:<=|>=|<|>)?(?:0|[1-9][0-9]*)(?:%\B|\b))+/giu).exec(v)[0].replace(/progress:/giu, '').split('&');
        v = v.replace(/\bprogress:(?:&?(?:<=|>=|<|>)?(?:0|[1-9][0-9]*)(?:%\B|\b))+/giu, '');
    }

    if ((/\byear:(?:tba\b|(?:&?(?:<=|>=|<|>)?[1-9][0-9]{3}\b)+)/giu).test(v)) {
        year = (/\byear:(?:tba\b|(?:&?(?:<=|>=|<|>)?[1-9][0-9]{3}\b)+)/giu).exec(v)[0].replace(/year:/giu, '').split('&');
        v = v.replace(/\byear:(?:tba\b|(?:&?(?:<=|>=|<|>)?[1-9][0-9]{3}\b)+)/giu, '');
    }

    if ((/\btype:(?:\|?(?:tv|movie|ova|ona|special|tba)\b)+/giu).test(v)) {
        type = (/\btype:(?:\|?(?:tv|movie|ova|ona|special|tba)\b)+/giu).exec(v)[0].replace(/type:/giu, '').split('|');
        v = v.replace(/\btype:(?:\|?(?:tv|movie|ova|ona|special|tba)\b)+/giu, '');
    }

    if ((/\bstatus:(?:\|?(?:all|none|watching|rewatching|completed|paused|dropped|planning|skipping)\b)+/giu).test(v)) {
        status = (/\bstatus:(?:\|?(?:all|none|watching|rewatching|completed|paused|dropped|planning|skipping)\b)+/giu).exec(v)[0].replace(/status:/giu, '').split('|');
        v = v.replace(/\bstatus:(?:\|?(?:all|none|watching|rewatching|completed|paused|dropped|planning|skipping)\b)+/giu, '');
    }

    if ((/\bseason:(?:\|?(?:winter|spring|summer|fall|tba)\b)+/giu).test(v)) {
        season = (/\bseason:(?:\|?(?:winter|spring|summer|fall|tba)\b)+/giu).exec(v)[0].replace(/season:/giu, '').split('|');
        v = v.replace(/\bseason:(?:\|?(?:winter|spring|summer|fall|tba)\b)+/giu, '');
    }

    if ((/\btag:\S+\b/giu).test(v)) {
        tags = (/\btag:\S+\b/giu).exec(v)[0].replace(/tag:/giu, '').split('&');
        v = v.replace(/\btag:\S+\b/giu, '');
    }

    if ((/\bis:selected\b/giu).test(v)) {
        dd = 'selected';
        v = v.replace(/\bis:selected\b/giu, '');
    } else {
        dd = 'data';
    }

    if ((/\bis:ongoing\b/giu).test(v)) {
        ongoing = true;
        v = v.replace(/\bis:ongoing\b/giu, '');
    }

    if ((/\bis:new\b/giu).test(v)) {
        n = true;
        v = v.replace(/\bis:new\b/giu, '');
    }

    if ((/\bis:dead\b/giu).test(v)) {
        dead = true;
        v = v.replace(/\bis:dead\b/giu, '');
    }

    if ((/\bis:mismatched\b/giu).test(v)) {
        mismatched = true;
        v = v.replace(/\bis:mismatched\b/giu, '');
    }

    if ((/\bregex:true\b/giu).test(v)) {
        regex = true;
        v = v.replace(/\bregex:true\b/giu, '');
    }

    if ((/\balt:false\b/giu).test(v)) {
        alt = false;
        v = v.replace(/\balt:false\b/giu, '');
    }

    if ((/\brandom:[1-9][0-9]*\b/giu).test(v)) {
        random = Number((/\brandom:[1-9][0-9]*\b/giu).exec(v)[0].replace(/random:/giu, ''));
        v = v.replace(/\brandom:[1-9][0-9]*\b/giu, '');
    }

    for (const d of event.data[dd]) {
        postMessage({
            message: 'progress',
            progress: `${(event.data[dd].indexOf(d) + 1) / event.data[dd].length * 100}%`
        });

        if (episodes) {
            let c = false;

            for (const value of episodes) {
                if (!is(d.episodes, (value.match(/<=|>=|<|>/giu) || '').toString(), value.match(/0|[1-9][0-9]*/giu).toString())) {
                    c = true;
                    break;
                }
            }

            if (c) {
                continue;
            }
        }

        if (progress) {
            let c = false;

            for (const value of progress) {
                if ((/%/giu).test(value)) {
                    if (d.episodes) {
                        if (!is(Math.round(d.progress / d.episodes * 100), (value.match(/<=|>=|<|>/giu) || '').toString(), Number(value.match(/0|[1-9][0-9]*/giu).toString()))) {
                            c = true;
                            break;
                        }
                    } else {
                        c = true;
                        break;
                    }
                } else {
                    if (!is(d.progress, (value.match(/<=|>=|<|>/giu) || '').toString(), value.match(/0|[1-9][0-9]*/giu).toString())) {
                        c = true;
                        break;
                    }
                }
            }

            if (c) {
                continue;
            }
        }

        if (year) {
            let c = false;

            for (const value of year) {
                if (!is(d.season.substring(d.season.indexOf(' ') + 1), (value.match(/<=|>=|<|>/giu) || '').toString(), value.match(/tba|[1-9][0-9]{3}/giu).toString())) {
                    c = true;
                    break;
                }
            }

            if (c) {
                continue;
            }
        }

        if (type) {
            const t = d.type || 'tba';

            if (type.toString().toLowerCase().split(',').indexOf(t.toLowerCase()) === -1) {
                continue;
            }
        }

        if (status) {
            if (status.toString().toLowerCase().split(',').indexOf('all') > -1) {
                if (!d.status.toLowerCase()) {
                    continue;
                }
            } else if (status.toString().toLowerCase().split(',').indexOf('none') > -1) {
                if (d.status.toLowerCase()) {
                    continue;
                }
            } else {
                if (status.toString().toLowerCase().split(',').indexOf(d.status.toLowerCase()) === -1) {
                    continue;
                }
            }
        }

        if (season) {
            const s =
                d.season.indexOf(' ') > -1
                    ? d.season.substring(0, d.season.indexOf(' '))
                    : 'tba';

            if (season.toString().toLowerCase().split(',').indexOf(s.toLowerCase()) === -1) {
                continue;
            }
        }

        if (tags) {
            let c = false;

            for (const value of tags) {
                if ((/^-/giu).test(value)) {
                    if (d.tags.indexOf(value.replace(/^-/giu, '').toLowerCase()) > -1) {
                        c = true;
                        break;
                    }
                } else {
                    if (d.tags.indexOf(value.toLowerCase()) === -1) {
                        c = true;
                        break;
                    }
                }
            }

            if (c) {
                continue;
            }
        }

        if (ongoing) {
            if (!d.ongoing) {
                continue;
            }
        }

        if (n) {
            if (!d.new) {
                continue;
            }
        }

        if (dead) {
            if (!d.dead) {
                continue;
            }
        }

        if (mismatched) {
            if (d.status.toLowerCase() !== 'completed' || Number(d.progress) === Number(d.episodes)) {
                continue;
            }
        }

        const
            t = [
                {
                    title: d.title
                }
            ],
            tt = [d.title];

        /*
        const
            s = [],
            s2 = [],
            t = [
                {
                    title: d.title,
                    title2: d.title
                }
            ],
            tt = [d.title];
        */

        if (v.trim()) {
            if (regex) {
                let r = false;

                if (alt) {
                    tt.push(...d.synonyms);
                }

                try {
                    for (const value of tt) {
                        if (value.match(RegExp(v.trim(), 'giu'))) {
                            r = true;

                            if (value !== d.title) {
                                d.alternative = `${value}&nbsp;<span class="title">${d.title}</span>`;
                            }

                            break;
                        }
                    }
                } catch (error) {
                    postMessage({
                        filter: [''],
                        message: 'error'
                    });

                    return;
                }

                if (!r) {
                    continue;
                }

                d.relevancy = 1;
            } else {
                if (alt) {
                    for (const value of d.synonyms) {
                        t.push({
                            title: value
                        });

                        /*
                        t.push({
                            title: value,
                            title2: value,
                            title3: value
                        });
                        */
                    }
                }

                /*
                let extend = false,
                    key = ['title'],
                    search = v.trim();

                if (v.trim().split(' ').length > 1) {
                    extend = true;

                    for (const value of v.trim().split(' ')) {
                        s.push({
                            title2: `=${value}`
                        });

                        s2.push({
                            title3: value
                        });
                    }

                    key = [
                        {
                            name: 'title',
                            weight: 0.5
                        },
                        {
                            name: 'title2',
                            weight: 0.4
                        },
                        {
                            name: 'title3',
                            weight: 0.1
                        }
                    ];

                    search = {
                        $or: [
                            {
                                title: v.trim()
                            },
                            {
                                $and: s
                            },
                            {
                                $and: s2
                            }
                        ]
                    };
                }
                */

                const result = new Fuse(t, {
                    ignoreLocation: true,
                    includeScore: true,
                    keys: ['title'],
                    threshold: 0.25
                }).search(v.trim());

                if (result.length) {
                    d.relevancy = 1 - result[0].score;
                } else {
                    continue;
                }

                if (result[0].item.title !== d.title) {
                    d.alternative = `${result[0].item.title}&nbsp;<span class="title">${d.title}</span>`;
                }
            }
        }

        if (!found) {
            postMessage({
                message: 'found'
            });

            found = true;
        }

        f.push(d.sources);
        u.push({
            alternative: d.alternative,
            relevancy: d.relevancy,
            source: d.sources
        });
    }

    if (!found) {
        postMessage({
            filter: [''],
            message: 'success'
        });

        return;
    }

    if (random && f.length > random) {
        ff = [];
        uu = [];

        while (random--) {
            const r = Math.round(Math.random() * (f.length - 1));

            ff.push(f[r]);
            uu.push(u[r]);

            f.splice(r, 1);
            u.splice(r, 1);
        }
    }

    postMessage({
        filter: ff || f,
        message: 'success',
        query: v.trim(),
        update: uu || u
    });
});