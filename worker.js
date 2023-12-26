if (typeof Fuse === 'undefined') {
    importScripts('https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.min.js');
}

function removeReserved(text) {
    return text.replace(/</giv, '&lt;').replace(/>/giv, '&gt;');
}

function giv(string) {
    return RegExp(`(?<=^|\\s)${string}(?=\\s|$)`, 'giv');
}

function season2(value) {
    if (value === 'year') {
        let year2 = new Date().getFullYear();

        if (new Date().getMonth() === 11) {
            year2 += 1;
        }

        return year2;
    }

    switch (new Date().getMonth()) {
        case 0:
        case 1:
        case 11:
            return 'winter';

        case 2:
        case 3:
        case 4:
            return 'spring';

        case 5:
        case 6:
        case 7:
            return 'summer';

        case 8:
        case 9:
        case 10:
            return 'fall';

        default:
            return '';
    }
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
        regex = {
            alt: 'alt:false',
            case: 'case:true',
            deleted: 'is:deleted',
            eps: 'eps:(?<value>tba|(?:<=|>=|<|>)?(?:0|[1-9][0-9]*)(?:&(?:<=|>=|<|>)?(?:0|[1-9][0-9]*))*)',
            id: 'id:(?<value>(?:[1-9][0-9]*)(?:\\|[1-9][0-9]*)*)',
            mismatched: 'is:mismatched',
            n: 'is:new',
            now: 'is:now',
            ongoing: 'is:ongoing',
            progress: 'progress:(?<value>(?:<=|>=|<|>)?(?:0|[1-9][0-9]*)%?(?:&(?:<=|>=|<|>)?(?:0|[1-9][0-9]*)%?)*)',
            r18: 'is:r18',
            random: 'random:(?<value>true|[1-9][0-9]*)',
            regex: 'regex:true',
            related: 'related:(?<value>[1-9][0-9]*)',
            related2: 'related2:(?<value>[1-9][0-9]*)',
            season: 'season:(?<value>(?:winter|spring|summer|fall|now|tba)(?:\\|(?:winter|spring|summer|fall|now|tba))*)',
            selected: 'is:selected',
            similar: 'similar:(?<value>[1-9][0-9]*)',
            status: 'status:(?<value>(?:all|none|watching|completed|paused|dropped|planning|skipping)(?:\\|(?:all|none|watching|completed|paused|dropped|planning|skipping))*)',
            tags: 'tag:(?<value>\\S+(?:\\|\\S+)*)',
            type: 'type:(?<value>(?:tv|movie|ova|ona|special|tba)(?:\\|(?:tv|movie|ova|ona|special|tba))*)',
            watched: 'watched:(?<value>(?:<=|>=|<|>)?(?:0|[1-9][0-9]*)(?:&(?:<=|>=|<|>)?(?:0|[1-9][0-9]*))*)',
            year: 'year:(?<value>now|tba|(?:<=|>=|<|>)?[1-9][0-9]{3}(?:&(?:<=|>=|<|>)?[1-9][0-9]{3})*)'
        },
        rrr = [],
        ss = {
            count: 0,
            season: null,
            year: null
        },
        t3 = [],
        u = [];

    let alt = true,
        case2 = false,
        dd = 'data',
        deleted = false,
        episodes = null,
        ff = null,
        found = false,
        id = null,
        message = null,
        mismatched = false,
        n = false,
        now = false,
        ongoing = false,
        progress = null,
        r18 = false,
        random = null,
        regex2 = false,
        related = null,
        related2 = null,
        rr = 0,
        season = null,
        similar = null,
        similar2 = 0,
        status = null,
        tags = null,
        type = null,
        // uu = null,
        v = event.data.value,
        watched = false,
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

    if (giv(regex.eps).test(v)) {
        episodes = giv(regex.eps).exec(v).groups.value.split('&');
        v = v.replace(giv(regex.eps), '');

        rr = 0;
        ss.count = 0;
    }

    if (giv(regex.progress).test(v)) {
        progress = giv(regex.progress).exec(v).groups.value.split('&');
        v = v.replace(giv(regex.progress), '');

        rr = 0;
        ss.count = 0;
    }

    if (giv(regex.year).test(v)) {
        year = giv(regex.year).exec(v).groups.value.split('&');
        v = v.replace(giv(regex.year), '');

        rr = 0;

        if (year.length === 1 && !/<=|>=|<|>/giv.test(year[0])) {
            ss.count += 1;
            ss.year =
                year[0].toLowerCase() === 'now'
                    ? new Date().getFullYear().toString()
                    : year[0].toLowerCase();
        }
    }

    if (giv(regex.type).test(v)) {
        type = giv(regex.type).exec(v).groups.value.split('|');
        v = v.replace(giv(regex.type), '');

        rr = 0;
        ss.count = 0;
    }

    if (giv(regex.status).test(v)) {
        status = giv(regex.status).exec(v).groups.value.split('|');
        v = v.replace(giv(regex.status), '');

        rr = 0;
        ss.count = 0;
    }

    if (giv(regex.season).test(v)) {
        season = giv(regex.season).exec(v).groups.value.split('|');
        v = v.replace(giv(regex.season), '');

        rr = 0;

        if (season.length === 1) {
            ss.count += 5;
            ss.season =
                season[0].toLowerCase() === 'now'
                    ? season2()
                    : season[0].toLowerCase();
        }
    }

    if (giv(regex.tags).test(v)) {
        tags = giv(regex.tags).exec(v).groups.value.split('&');
        v = v.replace(giv(regex.tags), '');

        rr = 0;
        ss.count = 0;
    }

    if (giv(regex.watched).test(v)) {
        watched = giv(regex.watched).exec(v).groups.value.split('&');
        v = v.replace(giv(regex.watched), '');

        rr = 0;
        ss.count = 0;
    }

    if (giv(regex.id).test(v)) {
        id = giv(regex.id).exec(v).groups.value.split('|');
        v = v.replace(giv(regex.id), '');

        rr = 0;
        ss.count = 0;
    }

    if (giv(regex.related).test(v)) {
        related = giv(regex.related).exec(v).groups.value;
        v = v.replace(giv(regex.related), '');

        rr += 1;
        ss.count = 0;
    }

    if (giv(regex.related2).test(v)) {
        related2 = giv(regex.related2).exec(v).groups.value;
        v = v.replace(giv(regex.related2), '');

        rr += 2;
        ss.count = 0;

        const
            t = event.data.data.find((i) => i.sources === `https://myanimelist.net/anime/${related2}`),
            t2 = [];

        if (t) {
            t2.push(...t.relations);

            while (t2.length) {
                t2.forEach((value) => {
                    event.data.data.filter((i) => {
                        if (i.relations.indexOf(value) > -1) {
                            return true;
                        }

                        return false;
                    }).forEach((value2) => {
                        if (t3.indexOf(value2.sources) === -1) {
                            t2.push(value2.sources);
                            t3.push(value2.sources);
                        }

                        value2.relations.forEach((value3) => {
                            if (t3.indexOf(value3) === -1) {
                                t2.push(value3);
                                t3.push(value3);
                            }
                        });
                    });

                    t2.splice(t2.indexOf(value), 1);
                });
            }

            if (t3.indexOf(t.sources) === -1) {
                t3.push(t.sources);
            }
        }
    }

    if (giv(regex.similar).test(v)) {
        similar = giv(regex.similar).exec(v).groups.value;
        v = v.replace(giv(regex.similar), '');

        rr = 0;
        ss.count = 0;

        const t = event.data.data.find((i) => i.sources === `https://myanimelist.net/anime/${similar}`);

        if (t) {
            rrr.push(...t.tags);
        }
    }

    if (giv(regex.selected).test(v)) {
        dd = 'selected';
        v = v.replace(giv(regex.selected), '');

        rr = 0;
        ss.count = 0;
    }

    if (giv(regex.now).test(v)) {
        now = true;
        v = v.replace(giv(regex.now), '');

        rr = 0;
        ss.count += 6;
        ss.year = season2('year').toString();
        ss.season = season2();
    }

    if (giv(regex.ongoing).test(v)) {
        ongoing = true;
        v = v.replace(giv(regex.ongoing), '');

        rr = 0;
        ss.count = 0;
    }

    if (giv(regex.n).test(v)) {
        n = true;
        v = v.replace(giv(regex.n), '');

        rr = 0;
        ss.count = 0;
    }

    if (giv(regex.deleted).test(v)) {
        deleted = true;
        v = v.replace(giv(regex.deleted), '');

        rr = 0;
        ss.count = 0;
    }

    if (giv(regex.r18).test(v)) {
        r18 = true;
        v = v.replace(giv(regex.r18), '');

        rr = 0;
        ss.count = 0;
    }

    if (giv(regex.mismatched).test(v)) {
        mismatched = true;
        v = v.replace(giv(regex.mismatched), '');

        rr = 0;
        ss.count = 0;
    }

    if (giv(regex.regex).test(v)) {
        regex2 = true;
        v = v.replace(giv(regex.regex), '');

        rr = 0;
        ss.count = 0;
    }

    if (giv(regex.alt).test(v)) {
        alt = false;
        v = v.replace(giv(regex.alt), '');

        rr = 0;
        ss.count = 0;
    }

    if (giv(regex.case).test(v)) {
        case2 = true;
        v = v.replace(giv(regex.case), '');

        rr = 0;
        ss.count = 0;
    }

    if (giv(regex.random).test(v)) {
        random = giv(regex.random).exec(v).groups.value;
        v = v.replace(giv(regex.random), '');

        rr = 0;
        ss.count = 0;
    }

    if (!v.trim()) {
        rr += 3;
        ss.count += 9;
    }

    for (const d of event.data[dd]) {
        d.relevancy = 1;

        postMessage({
            message: 'progress',
            progress: `${(event.data[dd].indexOf(d) + 1) / event.data[dd].length * 100}%`
        });

        if (episodes) {
            let c = false;

            for (const value of episodes) {
                const group = /(?<operator><=|>=|<|>)?(?<value>tba|0|[1-9][0-9]*)/giv.exec(value).groups;
    
                if (!is(d.episodes, group.operator, group.value)) {
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
                const group = /(?<operator><=|>=|<|>)?(?<value>(?:0|[1-9][0-9]*)%?)/giv.exec(value).groups;

                if ((/%/giv).test(value)) {
                    if (d.episodes) {
                        if (!is(Math.round(d.progress / d.episodes * 100), group.operator, group.value.replace('%', ''))) {
                            c = true;
                            break;
                        }
                    } else {
                        c = true;
                        break;
                    }
                } else {
                    if (!is(d.progress, group.operator, group.value)) {
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
                const
                    group = /(?<operator><=|>=|<|>)?(?<value>now|tba|[1-9][0-9]{3})/giv.exec(value).groups,
                    group2 =
                        group.value === 'now'
                            ? new Date().getFullYear()
                            : group.value;

                if (!is(d.season.substring(d.season.indexOf(' ') + 1), group.operator, group2)) {
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

            if (season.map((s2) => s2.toLowerCase().replace('now', season2())).indexOf(s.toLowerCase()) === -1) {
                continue;
            }
        }

        if (tags) {
            let c = false;

            for (const value of tags) {
                if ((/^!/giv).test(value)) {
                    if (d.tags.map((t) => t.replace(/\s/giv, '_')).indexOf(value.replace(/^!/giv, '').toLowerCase()) > -1) {
                        c = true;
                        break;
                    }
                } else {
                    if (d.tags.map((t) => t.replace(/\s/giv, '_')).indexOf(value.toLowerCase()) === -1) {
                        c = true;
                        break;
                    }
                }
            }

            if (c) {
                continue;
            }
        }

        if (watched) {
            let c = false;

            for (const value of watched) {
                const group = /(?<operator><=|>=|<|>)?(?<value>0|[1-9][0-9]*)/giv.exec(value).groups;

                if (!is(d.watched, group.operator, group.value)) {
                    c = true;
                    break;
                }
            }

            if (c) {
                continue;
            }
        }

        if (id) {
            if (id.indexOf(d.sources.slice('https://myanimelist.net/anime/'.length)) === -1) {
                continue;
            }
        }

        if (related) {
            if ([d.sources, ...d.relations].indexOf(`https://myanimelist.net/anime/${related}`) === -1) {
                continue;
            }
        }

        if (related2) {
            if (t3.indexOf(d.sources) === -1) {
                continue;
            }
        }

        if (similar) {
            const nnn = 10;
            similar2 = 0;

            if (d.sources === `https://myanimelist.net/anime/${similar}`) {
                similar2 = d.tags.length;
            } else {
                if (d.tags.length < nnn) {
                    continue;
                }

                for (const value of rrr) {
                    if (d.tags.indexOf(value) > -1) {
                        similar2 += 1;
                    }

                    // if (similar2 >= nnn) {
                    //     break;
                    // }
                }

                if (similar2 < nnn) {
                    continue;
                }
            }
        }

        if (now) {
            if (d.season.toLowerCase() !== `${season2()} ${season2('year')}`) {
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

        if (deleted) {
            if (!d.deleted) {
                continue;
            }
        }

        if (r18) {
            if (!d.r18) {
                continue;
            }
        }

        if (mismatched) {
            if (!d.episodes || d.status.toLowerCase() !== 'completed' || Number(d.progress) === Number(d.episodes)) {
                continue;
            }
        }

        const
            split = [],
            t = [
                {
                    title: d.title
                }
            ],
            tt = [d.title];

        if (v.trim()) {
            if (regex2) {
                const r2 = case2
                    ? 'gv'
                    : 'giv';

                let r = false;

                if (alt) {
                    tt.push(...d.synonyms);
                }

                try {
                    for (const value of tt) {
                        if (value.match(RegExp(v.trim(), r2))) {
                            r = true;

                            if (value === d.title) {
                                d.alternative = removeReserved(d.title);
                            } else {
                                d.alternative = `${removeReserved(value)}&nbsp;<span class="title">${removeReserved(d.title)}</span>`;
                            }

                            break;
                        }
                    }
                } catch (error) {
                    message = removeReserved(error.toString());
                    break;

                    // postMessage({
                    //     filter: [''],
                    //     message: 'error'
                    // });

                    // return;
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
                    }
                }

                for (const value2 of [...new Set(v.trim().split(' '))]) {
                    split.push({
                        title: value2
                    });
                }

                const result = new Fuse(t, {
                    // ignoreFieldNorm: true,
                    ignoreLocation: true,
                    // includeMatches: true,
                    includeScore: true,
                    isCaseSensitive: case2,
                    keys: ['title'],
                    threshold: 0.2
                }).search({
                    $or: [{
                        title: v.trim()
                    }, {
                        $and: split
                    }]
                });

                if (result.length) {
                    d.relevancy =
                        similar2
                            ? (1 - result[0].score) * similar2
                            : 1 - result[0].score;
                } else {
                    continue;
                }

                if (result[0].item.title === d.title) {
                    d.alternative = removeReserved(d.title);
                } else {
                    d.alternative = `${removeReserved(result[0].item.title)}&nbsp;<span class="title">${removeReserved(d.title)}</span>`;
                }
            }
        } else {
            if (regex2) {
                message = 'Missing regular expression';
                break;
            }

            // if (case2 || !alt || fuzzy) {
            if (case2 || !alt) {
                message = 'Missing search query';
                break;
            }

            if (similar2) {
                d.relevancy = similar2;
            }

            d.alternative = removeReserved(d.title);
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
            message: 'success',
            message2: message,
            related: rr,
            seasonal: ss
        });

        return;
    }

    if (random === 'true' || (Number(random) && f.length > Number(random))) {
        let n2 = null;

        ff = [];
        // uu = [];

        postMessage({
            all: f.length,
            message: 'random'
        });

        if (Number(random)) {
            n2 = Number(random);
        } else {
            n2 = Math.round(Math.random() * (f.length - 1)) || 1;
        }

        while (n2--) {
            const r = Math.round(Math.random() * (f.length - 1));

            ff.push(f[r]);
            // uu.push(u[r]);

            f.splice(r, 1);
            // u.splice(r, 1);
        }
    }

    postMessage({
        filter: ff || f,
        message: 'success',
        query: v.trim(),
        related: rr,
        seasonal: ss,
        update: u
    });
});