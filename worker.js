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

    let dd = null,
        episodes = null,
        ff = null,
        found = false,
        n = false,
        ongoing = false,
        progress = null,
        season = null,
        source = null,
        status = null,
        tags = null,
        type = null,
        uu = null,
        v = event.data.value,
        year = null;

    if (!v.trim() && !event.data.random) {
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

    if ((/\btype:(?:\|?(?:tv|movie|ova|ona|special)\b)+/giu).test(v)) {
        type = (/\btype:(?:\|?(?:tv|movie|ova|ona|special)\b)+/giu).exec(v)[0].replace(/type:/giu, '').split('|');
        v = v.replace(/\btype:(?:\|?(?:tv|movie|ova|ona|special)\b)+/giu, '');
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

    if ((/\bsource:(?:&?(?:myanimelist|kitsu|anilist)\b)+/giu).test(v)) {
        source = (/\bsource:(?:&?(?:myanimelist|kitsu|anilist)\b)+/giu).exec(v)[0].replace(/source:/giu, '').split('&');
        v = v.replace(/\bsource:(?:&?(?:myanimelist|kitsu|anilist)\b)+/giu, '');
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

    event.data[dd].forEach((d) => {
        if (episodes) {
            for (const value of episodes) {
                if (!is(d.episodes, (value.match(/<=|>=|<|>/giu) || '').toString(), value.match(/0|[1-9][0-9]*/giu).toString())) {
                    return;
                }
            }
        }

        if (progress) {
            for (const value of progress) {
                if ((/%/giu).test(value)) {
                    if (d.episodes) {
                        if (!is(d.progress / d.episodes, (value.match(/<=|>=|<|>/giu) || '').toString(), Number(value.match(/0|[1-9][0-9]*/giu).toString()) / 100)) {
                            return;
                        }
                    } else {
                        return;
                    }
                } else {
                    if (!is(d.progress, (value.match(/<=|>=|<|>/giu) || '').toString(), value.match(/0|[1-9][0-9]*/giu).toString())) {
                        return;
                    }
                }
            }
        }

        if (year) {
            for (const value of year) {
                if (!is(d.season.substring(d.season.indexOf(' ') + 1), (value.match(/<=|>=|<|>/giu) || '').toString(), value.match(/tba|[1-9][0-9]{3}/giu).toString())) {
                    return;
                }
            }
        }

        if (type) {
            if (type.toString().toLowerCase().split(',').indexOf(d.type.toLowerCase()) === -1) {
                return;
            }
        }

        if (status) {
            if (status.toString().toLowerCase().split(',').indexOf('all') > -1) {
                if (!d.status.toLowerCase()) {
                    return;
                }
            } else if (status.toString().toLowerCase().split(',').indexOf('none') > -1) {
                if (d.status.toLowerCase()) {
                    return;
                }
            } else {
                if (status.toString().toLowerCase().split(',').indexOf(d.status.toLowerCase()) === -1) {
                    return;
                }
            }
        }

        if (season) {
            const s =
                d.season.indexOf(' ') > -1
                    ? d.season.substring(0, d.season.indexOf(' '))
                    : 'tba';

            if (season.toString().toLowerCase().split(',').indexOf(s.toLowerCase()) === -1) {
                return;
            }
        }

        if (tags) {
            for (const value of tags) {
                if ((/^-/giu).test(value)) {
                    if (d.tags.indexOf(value.replace(/^-/giu, '').toLowerCase()) > -1) {
                        return;
                    }
                } else {
                    if (d.tags.indexOf(value.toLowerCase()) === -1) {
                        return;
                    }
                }
            }
        }

        if (source) {
            if (source.toString().toLowerCase().split(',').indexOf('myanimelist') > -1) {
                if (d.sources2.toString().indexOf('myanimelist') === -1) {
                    return;
                }
            } else {
                if (d.sources2.toString().indexOf('myanimelist') > -1) {
                    return;
                }
            }

            if (source.toString().toLowerCase().split(',').indexOf('kitsu') > -1) {
                if (d.sources2.toString().indexOf('kitsu') === -1) {
                    return;
                }
            } else {
                if (d.sources2.toString().indexOf('kitsu') > -1) {
                    return;
                }
            }

            if (source.toString().toLowerCase().split(',').indexOf('anilist') > -1) {
                if (d.sources2.toString().indexOf('anilist') === -1) {
                    return;
                }
            } else {
                if (d.sources2.toString().indexOf('anilist') > -1) {
                    return;
                }
            }
        }

        if (ongoing) {
            if (!d.ongoing) {
                return;
            }
        }

        if (n) {
            if (!d.new) {
                return;
            }
        }

        const
            s = [],
            t = [
                {
                    title: d.title,
                    title2: d.title
                }
            ],
            tt = [d.title];

        if (v.trim()) {
            if (event.data.regex) {
                let r = false;

                if (event.data.alt) {
                    tt.push(...d.synonyms);
                }

                for (const value of tt) {
                    if (value.match(RegExp(v.trim(), 'giu'))) {
                        r = true;

                        if (value !== d.title) {
                            d.alternative = `${value}&nbsp;<span class="title">${d.title}</span>`;
                        }

                        break;
                    }
                }

                if (!r) {
                    return;
                }

                d.relevancy = 1;
            } else {
                if (event.data.alt) {
                    for (const value of d.synonyms) {
                        t.push({
                            title: value,
                            title2: value
                        });
                    }
                }

                let key = ['title'],
                    search = v.trim();

                if (v.trim().split(' ').length > 1) {
                    for (const value of v.trim().split(' ')) {
                        s.push({
                            title2: value
                        });
                    }

                    key = [
                        {
                            name: 'title',
                            weight: 0.9
                        },
                        {
                            name: 'title2',
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
                            }
                        ]
                    };
                }

                const result = new Fuse(t, {
                    ignoreLocation: true,
                    includeScore: true,
                    keys: key,
                    threshold: 0.25
                }).search(search);

                if (result.length) {
                    d.relevancy = 1 - result[0].score;
                } else {
                    return;
                }

                if (result[0].item.title !== d.title) {
                    d.alternative = `${result[0].item.title}&nbsp;<span class="title">${d.title}</span>`;
                }
            }
        }

        if (!found) {
            found = true;
        }

        f.push(d.sources);
        u.push({
            alternative: d.alternative,
            relevancy: d.relevancy,
            source: d.sources
        });
    });

    if (!found) {
        postMessage({
            filter: [''],
            message: 'success'
        });

        return;
    }

    if (event.data.random && f.length > event.data.randomValue) {
        ff = [];
        uu = [];

        while (event.data.randomValue--) {
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