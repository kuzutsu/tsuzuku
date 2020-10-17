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
        ff = null,
        uu = null,
        found = false;

    if (!v.trim() && !event.data.random) {
        postMessage({
            message: 'clear'
        });

        return;
    }

    if (v.match(/\bepisodes:(&?(\<=|\>=|\<|\>)?(0|[1-9][0-9]*)\b)+/gi)) {
        episodes = v.match(/\bepisodes:(&?(\<=|\>=|\<|\>)?(0|[1-9][0-9]*)\b)+/gi)[0].replace(/episodes:/gi, '').split('&');
        v = v.replace(/\bepisodes:(&?(\<=|\>=|\<|\>)?(0|[1-9][0-9]*)\b)+/gi, '');
    }

    if (v.match(/\bscore:(&?(\<=|\>=|\<|\>)?(10|[0-9]{1})\b)+/gi)) {
        score = v.match(/\bscore:(&?(\<=|\>=|\<|\>)?(10|[0-9]{1})\b)+/gi)[0].replace(/score:/gi, '').split('&');
        v = v.replace(/\bscore:(&?(\<=|\>=|\<|\>)?(10|[0-9]{1})\b)+/gi, '');
    }

    if (v.match(/\byear:(tba\b|(&?(\<=|\>=|\<|\>)?[1-9][0-9]{3}\b)+)/gi)) {
        year = v.match(/\byear:(tba\b|(&?(\<=|\>=|\<|\>)?[1-9][0-9]{3}\b)+)/gi)[0].replace(/year:/gi, '').split('&');
        v = v.replace(/\byear:(tba\b|(&?(\<=|\>=|\<|\>)?[1-9][0-9]{3}\b)+)/gi, '');
    }
    
    if (v.match(/\btype:(,?(tv|movie|ova|ona|special)\b)+/gi)) {
        type = v.match(/\btype:(,?(tv|movie|ova|ona|special)\b)+/gi)[0].replace(/type:/gi, '').split(',');
        v = v.replace(/\btype:(,?(tv|movie|ova|ona|special)\b)+/gi, '');
    }

    if (v.match(/\bstatus:(,?(watching|rewatching|completed|paused|dropped|planning)\b)+/gi)) {
        status = v.match(/\bstatus:(,?(watching|rewatching|completed|paused|dropped|planning)\b)+/gi)[0].replace(/status:/gi, '').split(',');
        v = v.replace(/\bstatus:(,?(watching|rewatching|completed|paused|dropped|planning)\b)+/gi, '');
    }

    if (v.match(/\bseason:(,?(winter|spring|summer|fall)\b)+/gi)) {
        season = v.match(/\bseason:(,?(winter|spring|summer|fall)\b)+/gi)[0].replace(/season:/gi, '').split(',');
        v = v.replace(/\bseason:(,?(winter|spring|summer|fall)\b)+/gi, '');
    }

    event.data.data.forEach((d, i) => {
        postMessage({
            message: 'progress',
            progress: (i + 1) / event.data.data.length * 100 + '%'
        });

        if (episodes) {
            for (const value of episodes) {
                if (!is(d.episodes, (value.match(/\<=|\>=|\<|\>/gi) || '=').toString(), value.match(/0|[1-9][0-9]*/gi).toString())) {
                    return;
                }
            }
        }

        if (score) {
            for (const value of score) {
                if (!is(d.score, (value.match(/\<=|\>=|\<|\>/gi) || '=').toString(), value.match(/10|[1-9]{1}/gi).toString())) {
                    return;
                }
            }
        }

        if (year) {
            for (const value of year) {
                if (!is(d.season.substring(d.season.indexOf(' ') + 1), (value.match(/\<=|\>=|\<|\>/gi) || '=').toString(), value.match(/tba|[1-9][0-9]{3}/gi).toString())) {
                    return;
                }
            }
        }

        if (type) {
            if (type.indexOf(d.type.toLowerCase()) === -1) {
                return;
            }
        }

        if (status) {
            if (status.indexOf(d.status.toLowerCase()) === -1) {
                return;
            }
        }

        if (season) {
            if (season.indexOf(d.season.substring(0, d.season.indexOf(' ')).toLowerCase()) === -1) {
                return;
            }
        }

        if (v.trim()) {
            if (event.data.regex) {
                if (!d.title.match(RegExp(v.trim(), 'gi'))) {
                    return;
                }
            } else {
                const result = new Fuse([d.title, ...d.synonyms], {
                    ignoreFieldNorm: true,
                    ignoreLocation: true,
                    includeScore: true,
                    threshold: 1 / 3
                }).search(v.trim());
    
                if (!result.length) {
                    return;
                }
    
                d.relevancy = 1 - result[0].score;
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
            relevancy: d.relevancy
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
