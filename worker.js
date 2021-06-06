if (typeof Fuse === 'undefined') {
    importScripts('https://cdn.jsdelivr.net/npm/fuse.js@6.4.6/dist/fuse.min.js');
}

function is(value1, type, value2) {
    if (!value1) {
        if (value2.toLowerCase() === 'tba') {
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

    if (v.match(/\bepisodes:(?:&?(?:<=|>=|<|>)?(?:0|[1-9][0-9]*)\b)+/giu)) {
        episodes = v.match(/\bepisodes:(?:&?(?:<=|>=|<|>)?(?:0|[1-9][0-9]*)\b)+/giu)[0].replace(/episodes:/giu, '').split('&');
        v = v.replace(/\bepisodes:(?:&?(?:<=|>=|<|>)?(?:0|[1-9][0-9]*)\b)+/giu, '');
    }

    if (v.match(/\bprogress:(?:&?(?:<=|>=|<|>)?(?:0|[1-9][0-9]*)\b)+/giu)) {
        progress = v.match(/\bprogress:(?:&?(?:<=|>=|<|>)?(?:0|[1-9][0-9]*)\b)+/giu)[0].replace(/progress:/giu, '').split('&');
        v = v.replace(/\bprogress:(?:&?(?:<=|>=|<|>)?(?:0|[1-9][0-9]*)\b)+/giu, '');
    }

    if (v.match(/\byear:(?:tba\b|(?:&?(?:<=|>=|<|>)?[1-9][0-9]{3}\b)+)/giu)) {
        year = v.match(/\byear:(?:tba\b|(?:&?(?:<=|>=|<|>)?[1-9][0-9]{3}\b)+)/giu)[0].replace(/year:/giu, '').split('&');
        v = v.replace(/\byear:(?:tba\b|(?:&?(?:<=|>=|<|>)?[1-9][0-9]{3}\b)+)/giu, '');
    }

    if (v.match(/\btype:(?:\|?(?:tv|movie|ova|ona|special)\b)+/giu)) {
        type = v.match(/\btype:(?:\|?(?:tv|movie|ova|ona|special)\b)+/giu)[0].replace(/type:/giu, '').split('|');
        v = v.replace(/\btype:(?:\|?(?:tv|movie|ova|ona|special)\b)+/giu, '');
    }

    if (v.match(/\bstatus:(?:\|?(?:all|watching|rewatching|completed|paused|dropped|planning|skipping)\b)+/giu)) {
        status = v.match(/\bstatus:(?:\|?(?:all|watching|rewatching|completed|paused|dropped|planning|skipping)\b)+/giu)[0].replace(/status:/giu, '').split('|');
        v = v.replace(/\bstatus:(?:\|?(?:all|watching|rewatching|completed|paused|dropped|planning|skipping)\b)+/giu, '');
    }

    if (v.match(/\bseason:(?:\|?(?:winter|spring|summer|fall|tba)\b)+/giu)) {
        season = v.match(/\bseason:(?:\|?(?:winter|spring|summer|fall|tba)\b)+/giu)[0].replace(/season:/giu, '').split('|');
        v = v.replace(/\bseason:(?:\|?(?:winter|spring|summer|fall|tba)\b)+/giu, '');
    }

    if (v.match(/\btag:\S+\b/giu)) {
        tags = v.match(/\btag:\S+\b/giu)[0].replace(/tag:/giu, '').split('&');
        v = v.replace(/\btag:\S+\b/giu, '');
    }

    if (v.match(/\bsource:(?:&?(?:myanimelist|kitsu|anilist)\b)+/giu)) {
        source = v.match(/\bsource:(?:&?(?:myanimelist|kitsu|anilist)\b)+/giu)[0].replace(/source:/giu, '').split('&');
        v = v.replace(/\bsource:(?:&?(?:myanimelist|kitsu|anilist)\b)+/giu, '');
    }

    if (v.match(/\bis:selected\b/giu)) {
        dd = 'selected';
        v = v.replace(/\bis:selected\b/giu, '');
    } else {
        dd = 'data';
    }

    if (v.match(/\bis:ongoing\b/giu)) {
        ongoing = true;
        v = v.replace(/\bis:ongoing\b/giu, '');
    }

    if (dd === 'selected' && !event.data[dd].length) {
        postMessage({
            message: 'progress',
            progress: '100%'
        });
    } else {
        event.data[dd].forEach((d, i) => {
            postMessage({
                message: 'progress',
                progress: `${(i + 1) / event.data[dd].length * 100}%`
            });

            if (episodes) {
                for (const value of episodes) {
                    if (!is(d.episodes, (value.match(/<=|>=|<|>/giu) || '').toString(), value.match(/0|[1-9][0-9]*/giu).toString())) {
                        return;
                    }
                }
            }

            if (progress) {
                for (const value of progress) {
                    if (!is(d.progress, (value.match(/<=|>=|<|>/giu) || '').toString(), value.match(/0|[1-9][0-9]*/giu).toString())) {
                        return;
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
                    if (value.match(/^-/giu)) {
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

            const
                s = [],
                t = [
                    {
                        title: d.title
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
                                title: value
                            });
                        }
                    }

                    let result = new Fuse(t, {
                        ignoreLocation: true,
                        includeScore: true,
                        keys: ['title'],
                        threshold: 0.25
                    }).search(v.trim());

                    if (result.length) {
                        d.relevancy = 2 - result[0].score;
                    } else {
                        if (v.trim().split(' ').length === 1) {
                            return;
                        }

                        for (const value of v.trim().split(' ')) {
                            s.push({
                                title: value
                            });
                        }

                        result = new Fuse(t, {
                            ignoreLocation: true,
                            includeScore: true,
                            keys: ['title'],
                            threshold: 0.25
                        }).search({
                            $and: s
                        });

                        if (result.length) {
                            d.relevancy = 1 - result[0].score;
                        } else {
                            return;
                        }
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
        });
    }

    if (!found) {
        postMessage({
            filter: [''],
            message: 'done'
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
        message: 'done',
        query: v.trim(),
        update: uu || u
    });
});