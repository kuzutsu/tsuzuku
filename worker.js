if (typeof Fuse === 'undefined') {
    importScripts('https://cdn.jsdelivr.net/npm/fuse.js/dist/fuse.basic.min.js');
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
            return v1 <= v2 ? true : false;
        case '>=':
            return v1 >= v2 ? true : false;
        case '<':
            return v1 < v2 ? true : false;
        case '>':
            return v1 > v2 ? true : false;
        case '=':
            return v1 === v2 ? true : false;
        default:
            return false;
    }
}

self.addEventListener('message', function (event) {
    const
        f = [],
        u = [];
    
    let v = event.data.value,
        episodes = null,
        score = null,
        year = null,
        type = null,
        status = null,
        season = null,
        tags = null,
        dd = null,
        ff = null,
        uu = null,
        found = false;

    if (!v.trim() && !event.data.random) {
        postMessage({
            message: 'clear'
        });

        return;
    }

    if (v.match(/\bepisodes:(&?(<=|>=|<|>)?(0|[1-9][0-9]*)\b)+/giu)) {
        episodes = v.match(/\bepisodes:(&?(<=|>=|<|>)?(0|[1-9][0-9]*)\b)+/giu)[0].replace(/episodes:/giu, '').split('&');
        v = v.replace(/\bepisodes:(&?(<=|>=|<|>)?(0|[1-9][0-9]*)\b)+/giu, '');
    }

    if (v.match(/\bscore:(&?(<=|>=|<|>)?(10|[0-9]{1})\b)+/giu)) {
        score = v.match(/\bscore:(&?(<=|>=|<|>)?(10|[0-9]{1})\b)+/giu)[0].replace(/score:/giu, '').split('&');
        v = v.replace(/\bscore:(&?(<=|>=|<|>)?(10|[0-9]{1})\b)+/giu, '');
    }

    if (v.match(/\byear:(tba\b|(&?(<=|>=|<|>)?[1-9][0-9]{3}\b)+)/giu)) {
        year = v.match(/\byear:(tba\b|(&?(<=|>=|<|>)?[1-9][0-9]{3}\b)+)/giu)[0].replace(/year:/giu, '').split('&');
        v = v.replace(/\byear:(tba\b|(&?(<=|>=|<|>)?[1-9][0-9]{3}\b)+)/giu, '');
    }
    
    if (v.match(/\btype:(,?(tv|movie|ova|ona|special)\b)+/giu)) {
        type = v.match(/\btype:(,?(tv|movie|ova|ona|special)\b)+/giu)[0].replace(/type:/giu, '').split(',');
        v = v.replace(/\btype:(,?(tv|movie|ova|ona|special)\b)+/giu, '');
    }

    if (v.match(/\bstatus:(,?(watching|rewatching|completed|paused|dropped|planning)\b)+/giu)) {
        status = v.match(/\bstatus:(,?(watching|rewatching|completed|paused|dropped|planning)\b)+/giu)[0].replace(/status:/giu, '').split(',');
        v = v.replace(/\bstatus:(,?(watching|rewatching|completed|paused|dropped|planning)\b)+/giu, '');
    }

    if (v.match(/\bseason:(,?(winter|spring|summer|fall)\b)+/giu)) {
        season = v.match(/\bseason:(,?(winter|spring|summer|fall)\b)+/giu)[0].replace(/season:/giu, '').split(',');
        v = v.replace(/\bseason:(,?(winter|spring|summer|fall)\b)+/giu, '');
    }

    if (v.match(/\btags:(&?(\S+)\b)+/giu)) {
        tags = v.match(/\btags:(&?(\S+)\b)+/giu)[0].replace(/tags:/giu, '').split('&');
        v = v.replace(/\btags:(&?(\S+)\b)+/giu, '');
    }

    if (v.match(/\bis:selected\b/giu)) {
        dd = 'selected';
        v = v.replace(/\bis:selected\b/giu, '');
    } else {
        dd = 'data';
    }

    event.data[dd].forEach((d, i) => {
        postMessage({
            message: 'progress',
            progress: (i + 1) / event.data[dd].length * 100 + '%'
        });

        if (episodes) {
            for (const value of episodes) {
                if (!is(d.episodes, (value.match(/<=|>=|<|>/giu) || '=').toString(), value.match(/0|[1-9][0-9]*/giu).toString())) {
                    return;
                }
            }
        }

        if (score) {
            for (const value of score) {
                if (!is(d.score, (value.match(/<=|>=|<|>/giu) || '=').toString(), value.match(/10|[1-9]{1}/giu).toString())) {
                    return;
                }
            }
        }

        if (year) {
            for (const value of year) {
                if (!is(d.season.substring(d.season.indexOf(' ') + 1), (value.match(/<=|>=|<|>/giu) || '=').toString(), value.match(/tba|[1-9][0-9]{3}/giu).toString())) {
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
            if (status.toString().toLowerCase().split(',').indexOf(d.status.toLowerCase()) === -1) {
                return;
            }
        }

        if (season) {
            if (season.toString().toLowerCase().split(',').indexOf(d.season.substring(0, d.season.indexOf(' ')).toLowerCase()) === -1) {
                return;
            }
        }

        if (tags) {
            for (const value of tags) {
                if (d.tags.indexOf(value.toLowerCase()) === -1) {
                    return;
                }
            }
        }

        if (v.trim()) {
            if (event.data.regex) {
                let r = false;

                for (const value of [d.title, ...d.synonyms]) {
                    if (value.match(RegExp(v.trim(), 'giu'))) {
                        r = true;

                        if (value !== d.title) {
                            d.alternative = value + ' <span class="title">' + d.title + '</span>';
                        }

                        break;
                    }
                }

                if (!r) {
                    return;
                }

                d.relevancy = 1;
            } else {
                const result = new Fuse([d.title, ...d.synonyms], {
                    includeScore: true,
                    threshold: 1 / 3
                }).search(v.trim());
    
                if (!result.length) {
                    return;
                }
    
                d.relevancy = 1 - result[0].score;

                if (result[0].item !== d.title) {
                    d.alternative = result[0].item + ' <span class="title">' + d.title + '</span>';
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
            source: d.sources,
            relevancy: d.relevancy,
            alternative: d.alternative
        });
    });

    if (!found) {
        postMessage({
            message: 'done',
            filter: ['']
        });

        return;
    }

    if (event.data.random && f.length > event.data.randomValue) {
        ff = [];
        uu = [];

        while (event.data.randomValue--) {
            let r = Math.round(Math.random() * (f.length - 1));

            ff.push(f[r]);
            uu.push(u[r]);

            f.splice(r, 1);
            u.splice(r, 1);
        }
    }

    postMessage({
        message: 'done',
        filter: ff || f,
        update: uu || u
    });
});