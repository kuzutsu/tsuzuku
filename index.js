(() => {
    'use strict';

    let canUpdate = null,
        highlight = null,
        random = null,
        restore = [],
        restoretemp = 0,
        test = null,
        watchFunction = null;

    const
        DB = 'tsuzuku',
        db = [],
        openDB = indexedDB.open(DB, 1);

    function dialogFunction(text) {
        let dialog = document.querySelector('dialog');

        if (!dialog) {
            dialog = document.createElement('dialog');
            document.body.appendChild(dialog);
        }

        dialog.insertAdjacentHTML('beforeend',
            '<span>🔔</span>' +
            `<pre style="margin-top: 0;">${text}</pre>`
        );

        dialog.scrollTo(0, dialog.scrollHeight);
        dialog.setAttribute('open', '');
    }

    function getFunction(name) {
        return new Promise((resolve) => {
            watchFunction().get(name).onsuccess = (event) => resolve(event.currentTarget.result);
        });
    }

    function stringFunction(a) {
        const b =
            a.toLowerCase()
                .normalize('NFD')
                .match(/(?:[A-Za-z0-9])/gu);

        if (b) {
            return b.join('');
        }

        return encodeURIComponent(a);
    }

    function defaultcolorFunction(a) {
        let c = [];
        const r = Math.round(Math.random() * 255);

        if (a) {
            c = a;
        } else {
            c = [r, r, r];
        }

        return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
    }

    function htmlFunction(cur, child, input, name, img) {
        return (
            `<tr data-parentanime="${stringFunction(cur.parentanime)}" data-parentmyanimelist="${cur.parentmyanimelist}" data-child="${cur.child}"` +
                ` data-anime="${stringFunction(cur.title)}" data-myanimelist="${cur.key}"` +
            ` data-when="${cur.when}">` +
                '<td>' +
                    `${input || '<input type="number" disabled></input>'}` +
                '</td>' +
                `<td style="background-color: ${cur.color}">` +
                    `<img id="picture" src="${cur.picture}" loading="lazy" style="vertical-align: middle;" onerror="this.remove();">` +
                '</td>' +
                `<td${child || ''}>` +
                    `<a id="name" href="${cur.key}" target="_blank" rel="noreferrer">${cur.title}</a>` +
                    ' ' +
                    `<span id="comments">${cur.comments}</span>` +
                    `${name || ''}` +
                '</td>' +
                '<td>' +
                    '<span id="type">' +
                        `${cur.type + (
                            cur.episodes
                                ? ` (${cur.episodes})`
                                : ''
                        )}` +
                    '</span>' +
                '</td>' +
                '<td>' +
                    `<span id="${
                        cur.child
                            ? 'parent">🧓'
                            : 'child">👶'
                    }</span>` +
                    ' ' +
                    `${img || '<span id="start">▶️</span> <span id="remove">❌</span>'}` +
                '</td>' +
            '</tr>'
        );
    }

    function searchFunction() {
        const
            all = [],
            completed = [],
            dropped = [],
            message =
                '<tr id="message" style="height: 23px;">' +
                    '<td></td>' +
                    '<td></td>' +
                    '<td><span>Nothing here</span></td>' +
                    '<td></td>' +
                    '<td></td>' +
                '</tr>',
            mismatch = [],
            paused = [],
            planning = [],
            promises = [],
            watching = [];

        watchFunction().openCursor().onsuccess = (event) => {
            const cursor = event.currentTarget.result;

            let child = null,
                cur = null,
                input = null;

            if (cursor) {
                cur = {
                    child: cursor.value.child,
                    color: cursor.value.color,
                    comments: cursor.value.comments,
                    episodes: cursor.value.episodes,
                    key: cursor.key,
                    parentanime: cursor.value.parentanime,
                    parentmyanimelist: cursor.value.parentmyanimelist,
                    picture: cursor.value.picture,
                    title: cursor.value.title,
                    type: cursor.value.type,
                    what: cursor.value.what,
                    when: cursor.value.when
                };

                if (cur.child) {
                    child = ' style="padding-left: 3%;"';
                }

                switch (cursor.value.when) {
                    case 'Completed':
                        if (cur.what !== cur.episodes) {
                            input =
                                '<input type="number" disabled></input>' +
                                ' ' +
                                `<span id="mismatch" title="Completed ${cur.what}\nExpected ${cur.episodes}">⚠️</span>`;

                            mismatch.push(cur.title);
                        }

                        completed.push(htmlFunction(cur, child, input, null, '<span id="start">▶️</span> <span id="postpone">🕓</span> <span id="remove">❌</span>'));

                        break;

                    case 'Dropped':
                        dropped.push(htmlFunction(cur, child));

                        break;

                    case 'On-Hold':
                        paused.push(htmlFunction(cur, child,
                            // input
                            `<input type="number" min="0"${
                                cur.episodes
                                    ? ` max="${cur.episodes}"`
                                    : ''
                            } value="${cur.what}"></input>` +
                            ' ' +
                            '<span id="start">▶️</span>',

                            // name
                            cur.episodes
                                ? `<div id="progress" style="width: ${
                                    cur.what > cur.episodes
                                        ? 100
                                        : cur.what / cur.episodes * 100
                                }%; background-color: ${cur.color};"></div>`
                                : '',

                            // img
                            '<span id="postpone">🕓</span>' +
                            ' ' +
                            '<span id="complete">✔️</span>' +
                            ' ' +
                            '<span id="drop">⏹️</span>' +
                            ' ' +
                            '<span id="remove">❌</span>'
                        ));

                        break;

                    case 'Plan to Watch':
                        planning.push(htmlFunction(cur, child));

                        break;

                    case 'Watching':
                        watching.push(htmlFunction(cur, child,
                            // input
                            `<input type="number" min="0"${
                                cur.episodes
                                    ? ` max="${cur.episodes}"`
                                    : ''
                            } value="${cur.what}"></input>` +
                            ' ' +
                            '<span id="pause">⏸️</span>',

                            // name
                            cur.episodes
                                ? `<div id="progress" style="width: ${
                                    cur.what > cur.episodes
                                        ? 100
                                        : cur.what / cur.episodes * 100
                                }%; background-color: ${cur.color};"></div>`
                                : '',

                            // img
                            '<span id="postpone">🕓</span>' +
                            ' ' +
                            '<span id="complete">✔️</span>' +
                            ' ' +
                            '<span id="drop">⏹️</span>' +
                            ' ' +
                            '<span id="remove">❌</span>'
                        ));

                        break;

                    default:
                        break;
                }

                cursor.continue();
            } else {
                Promise.all(promises).then(() => {
                    all.push(...completed, ...dropped, ...watching, ...planning, ...paused);

                    if (all.length) {
                        canUpdate = true;
                    } else {
                        canUpdate = false;
                    }

                    document.querySelector('#divall').innerHTML = `All (${all.length.toLocaleString('en')})`;
                    document.querySelector('#divcompleted').innerHTML = `${
                        mismatch.length
                            ? `<span title="${mismatch.length.toLocaleString('en')} mismatched">⚠️</span> `
                            : ''
                    }Completed (${completed.length.toLocaleString('en')})`;

                    document.querySelector('#divdropped').innerHTML = `Dropped (${dropped.length.toLocaleString('en')})`;
                    document.querySelector('#divpaused').innerHTML = `Paused (${paused.length.toLocaleString('en')})`;
                    document.querySelector('#divplanning').innerHTML = `Planning (${planning.length.toLocaleString('en')})`;
                    document.querySelector('#divwatching').innerHTML = `Watching (${watching.length.toLocaleString('en')})`;

                    document.querySelector('table#all').innerHTML =
                        all.length
                            ? all.sort().join('')
                            : message;

                    document.querySelector('table#completed').innerHTML =
                        completed.length
                            ? completed.sort().join('')
                            : message;

                    document.querySelector('table#dropped').innerHTML =
                        dropped.length
                            ? dropped.sort().join('')
                            : message;

                    document.querySelector('table#paused').innerHTML =
                        paused.length
                            ? paused.sort().join('')
                            : message;

                    document.querySelector('table#planning').innerHTML =
                        planning.length
                            ? planning.sort().join('')
                            : message;

                    document.querySelector('table#watching').innerHTML =
                        watching.length
                            ? watching.sort().join('')
                            : message;
                });
            }
        };
    }

    function databaseFunction() {
        const
            databaseHTML = [],
            name = document.querySelector('input#search').value,
            promises = [];

        if (name.length < 3) {
            document.querySelector('table#database').innerHTML =
                '<tr id="message" style="height: 23px;">' +
                    '<td></td>' +
                    '<td></td>' +
                    '<td><span>Must have at least 3 characters to search</span></td>' +
                    '<td></td>' +
                    '<td></td>' +
                '</tr>';

            return;
        }

        for (const value of db) {
            if (value.title.toLowerCase().indexOf(name.toLowerCase()) === -1) {
                continue;
            }

            promises.push(
                getFunction(value.myanimelist)
                    .then((result) => {
                        if (!result) {
                            return '<span id="watching">▶️</span> <span id="planning">🕓</span> <span id="completed">✔️</span>';
                        }

                        switch (result.when) {
                            case 'Completed':
                                return '<button id="databasecompleted">Completed</button>';
                            case 'Dropped':
                                return '<button id="databasedropped">Dropped</button>';
                            case 'On-Hold':
                                return '<button id="databasepaused">Paused</button>';
                            case 'Plan to Watch':
                                return '<button id="databaseplanning">Planning</button>';
                            case 'Watching':
                                return '<button id="databasewatching">Watching</button>';
                            default:
                                return false;
                        }
                    })
                    .then((w) => {
                        const title = value.title.split('');

                        title.splice(value.title.toLowerCase().indexOf(name.toLowerCase()), 0, '<span class="searchhighlight">');
                        title.splice(value.title.toLowerCase().indexOf(name.toLowerCase()) + name.length + 1, 0, '</span>');

                        databaseHTML.push(
                            `<tr data-anime="${stringFunction(value.title)}" data-myanimelist="${value.myanimelist}">` +
                                '<td>' +
                                    '<input type="number" disabled></input>' +
                                '</td>' +
                                `<td style="background-color: ${defaultcolorFunction()}">` +
                                    `<img id="picture" src="${value.picture}" loading="lazy" style="vertical-align: middle;" onerror="this.remove();">` +
                                '</td>' +
                                '<td>' +
                                    `${
                                        value.myanimelist.match(/myanimelist/gu)
                                            ? '<img src="https://www.google.com/s2/favicons?domain=https://myanimelist.net" style="vertical-align: middle;"> '
                                            : '<img src="https://www.google.com/s2/favicons?domain=https://kitsu.io" style="vertical-align: middle;"> '
                                    }` +
                                    `<a id="name" href="${value.myanimelist}" target="_blank" rel="noreferrer">${
                                        title.join('')
                                    }</a>` +
                                '</td>' +
                                '<td>' +
                                    `<span id="type">${value.type + (
                                        value.episodes
                                            ? ` (${value.episodes})`
                                            : ''
                                    )}</span>` +
                                '</td>' +
                                `<td>${
                                    w
                                }</td>` +
                            '</tr>'
                        );
                    })
            );
        }

        Promise.all(promises).then(() => {
            if (databaseHTML.length) {
                document.querySelector('table#database').innerHTML = databaseHTML.sort().join('');
            } else {
                document.querySelector('table#database').innerHTML =
                    '<tr id="message" style="height: 23px;">' +
                        '<td></td>' +
                        '<td></td>' +
                        '<td><span>Nothing found</span></td>' +
                        '<td></td>' +
                        '<td></td>' +
                    '</tr>';
            }
        });
    }

    function testFunction(name) {
        const myanimelist = name[0].parentNode.parentNode.dataset.myanimelist;

        test = name;

        watchFunction().get(myanimelist).onsuccess = (event) => {
            if (!event.currentTarget.result) {
                return;
            }

            const
                i = db.findIndex((n) => n.myanimelist === myanimelist),
                promises = [],
                related = db[i].relations,
                relatedHTML = [],
                temp = [];

            temp.push(...db[i].relations);

            function relatedF(anime, t) {
                t.map((a) => {
                    const
                        aa = db.findIndex((ii) => ii.myanimelist === a),
                        dbase =
                            db[aa]
                                ? db[aa].relations.filter((r) => anime.indexOf(r) === -1 && r !== myanimelist)
                                : [];

                    t.splice(t.indexOf(a), 1);

                    if (dbase[0]) {
                        anime.push(...dbase);
                        t.push(...dbase);
                    }

                    return relatedF(anime, t);
                });
            }

            relatedF(related, temp);

            for (const value of related) {
                promises.push(
                    getFunction(value)
                        .then((result) => {
                            if (!result) {
                                return '<span id="watching">▶️</span> <span id="planning">🕓</span> <span id="completed">✔️</span>';
                            }

                            switch (result.when) {
                                case 'Completed':
                                    return '<button id="databasecompleted">Completed</button>';
                                case 'Dropped':
                                    return '<button id="databasedropped">Dropped</button>';
                                case 'On-Hold':
                                    return '<button id="databasepaused">Paused</button>';
                                case 'Plan to Watch':
                                    return '<button id="databaseplanning">Planning</button>';
                                case 'Watching':
                                    return '<button id="databasewatching">Watching</button>';
                                default:
                                    return false;
                            }
                        })
                        .then((w) => {
                            const index = db[db.findIndex((f) => f.myanimelist === value)];

                            if (!index) {
                                return;
                            }

                            relatedHTML.push(
                                `<tr data-anime="${stringFunction(index.title)}" data-myanimelist="${value}">` +
                                    '<td>' +
                                        '<input type="number" disabled></input>' +
                                    '</td>' +
                                    `<td style="background-color: ${defaultcolorFunction()}">` +
                                        `<img id="picture" src="${index.picture}" loading="lazy" style="vertical-align: middle;" onerror="this.remove();">` +
                                    '</td>' +
                                    '<td>' +
                                        `${
                                            value.match(/myanimelist/gu)
                                                ? '<img src="https://www.google.com/s2/favicons?domain=https://myanimelist.net" style="vertical-align: middle;"> '
                                                : '<img src="https://www.google.com/s2/favicons?domain=https://kitsu.io" style="vertical-align: middle;"> '
                                        }` +
                                        `<a id="name" href="${value}" target="_blank" rel="noreferrer">${index.title}</a>` +
                                    '</td>' +
                                    '<td>' +
                                        `<span id="type">${index.type +
                                            (index.episodes
                                                ? ` (${index.episodes})`
                                                : ''
                                            )}</span>` +
                                    '</td>' +
                                    `<td>${
                                        w
                                    }</td>` +
                                '</tr>'
                            );
                        })
                );
            }

            Promise.all(promises).then(() => {
                const index = db[db.findIndex((f) => f.myanimelist === myanimelist)];

                let m = 'is related to';

                if (!relatedHTML.length) {
                    m = 'has no relations';
                }

                document.querySelector('table#related').innerHTML =
                    '<tr>' +
                        '<td>' +
                            '<input type="number" disabled></input>' +
                        '</td>' +
                        `<td style="background-color: ${defaultcolorFunction()}">` +
                            `<img id="picture" src="${index.picture}" loading="lazy" style="vertical-align: middle;" onerror="this.remove();">` +
                        '</td>' +
                        '<td>' +
                            `${
                                myanimelist.match(/myanimelist/gu)
                                    ? '<img src="https://www.google.com/s2/favicons?domain=https://myanimelist.net" style="vertical-align: middle;"> '
                                    : '<img src="https://www.google.com/s2/favicons?domain=https://kitsu.io" style="vertical-align: middle;"> '
                            }` +
                            `<a id="name" href="${myanimelist}" target="_blank" rel="noreferrer">${index.title}</a>` +
                        '</td>' +
                        '<td>' +
                            `<span id="type">${index.type + (
                                index.episodes
                                    ? ` (${index.episodes})`
                                    : ''
                            )}</span>` +
                        '</td>' +
                        '<td></td>' +
                    '</tr>' +
                    '<tr id="message" style="height: 23px;">' +
                        '<td></td>' +
                        '<td></td>' +
                        `<td><span>${m}</span></td>` +
                        '<td></td>' +
                        '<td></td>' +
                    `</tr>${
                        relatedHTML.sort().join('')
                    }`;
            });
        };
    }

    function addFunction(name, n) {
        const
            anime = name[0].parentNode.parentNode.dataset.myanimelist,
            image = new Image(),
            index = db[db.findIndex((i) => i.myanimelist === anime)],
            picture = name[0].parentNode.parentNode.querySelector('#picture');

        if (!picture) {
            const a =
                watchFunction().add({
                    child: 0,
                    color: defaultcolorFunction(),
                    comments: '',
                    episodes: index.episodes,
                    myanimelist: anime,
                    parentanime: index.title,
                    parentmyanimelist: anime,
                    picture: index.picture,
                    title: index.title,
                    type: index.type,
                    what:
                        n === 'Completed'
                            ? index.episodes
                            : 0,
                    when: n
                });

            a.onsuccess = () => {
                searchFunction();
                databaseFunction();

                if (test) {
                    testFunction(test);
                }

                dialogFunction(
                    `${index.title}\n` +
                    `=> update when => ${n}`
                );
            };

            a.onerror = () => {
                dialogFunction('Duplicate');
            };

            return;
        }

        image.crossOrigin = 'anonymous';
        image.src = picture.getAttribute('src');
        image.onload = (event) => {
            const a =
                watchFunction().add({
                    child: 0,
                    color: defaultcolorFunction(new ColorThief().getColor(event.currentTarget)),
                    comments: '',
                    episodes: index.episodes,
                    myanimelist: anime,
                    parentanime: index.title,
                    parentmyanimelist: anime,
                    picture: index.picture,
                    title: index.title,
                    type: index.type,
                    what:
                        n === 'Completed'
                            ? index.episodes
                            : 0,
                    when: n
                });

            a.onsuccess = () => {
                searchFunction();
                databaseFunction();

                if (test) {
                    testFunction(test);
                }

                dialogFunction(
                    `${index.title}\n` +
                    `=> update when => ${n}`
                );
            };

            a.onerror = () => {
                dialogFunction('Duplicate');
            };
        };

        image.onerror = () => {
            const a =
                watchFunction().add({
                    child: 0,
                    color: defaultcolorFunction(),
                    comments: '',
                    episodes: index.episodes,
                    myanimelist: anime,
                    parentanime: index.title,
                    parentmyanimelist: anime,
                    picture: index.picture,
                    title: index.title,
                    type: index.type,
                    what:
                        n === 'Completed'
                            ? index.episodes
                            : 0,
                    when: n
                });

            a.onsuccess = () => {
                searchFunction();
                databaseFunction();

                if (test) {
                    testFunction(test);
                }

                dialogFunction(
                    `${index.title}\n` +
                    `=> update when => ${n}`
                );
            };

            a.onerror = () => {
                dialogFunction('Duplicate');
            };
        };
    }

    function startFunction(name) {
        const myanimelist = name[0].parentNode.parentNode.dataset.myanimelist;

        watchFunction().get(myanimelist).onsuccess = (event) => {
            const
                change = event.currentTarget.result,
                t = change.title,
                w = change.when;

            change.when = 'Watching';

            watchFunction().put(change).onsuccess = () => {
                searchFunction();

                dialogFunction(
                    `${t}\n` +
                    `=> update when => ${w} => Watching`
                );
            };
        };
    }

    function pauseFunction(name) {
        const myanimelist = name[0].parentNode.parentNode.dataset.myanimelist;

        watchFunction().get(myanimelist).onsuccess = (event) => {
            const
                change = event.currentTarget.result,
                t = change.title,
                w = change.when;

            change.when = 'On-Hold';

            watchFunction().put(change).onsuccess = () => {
                searchFunction();

                dialogFunction(
                    `${t}\n` +
                    `=> update when => ${w} => On-Hold`
                );
            };
        };
    }

    function dropFunction(name) {
        const myanimelist = name[0].parentNode.parentNode.dataset.myanimelist;

        watchFunction().get(myanimelist).onsuccess = (event) => {
            const
                change = event.currentTarget.result,
                t = change.title,
                w = change.when;

            change.when = 'Dropped';

            watchFunction().put(change).onsuccess = () => {
                searchFunction();

                dialogFunction(
                    `${t}\n` +
                    `=> update when => ${w} => Dropped`
                );
            };
        };
    }

    function backupFunction() {
        let backup =
            '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<myanimelist>\n' +
            '    <myinfo>\n' +
            '        <user_export_type>1</user_export_type>\n' +
            '    </myinfo>\n';

        watchFunction().openCursor().onsuccess = (event) => {
            const cursor = event.currentTarget.result;

            /**
             * AniList requires the following tags
             * not yet implemented in Tsuzuku:
             *      my_finish_date
             *      my_score
             *      my_start_date
             */
            if (cursor) {
                backup +=
                    '    <anime>\n' +
                    `        <my_comments><![CDATA[${cursor.value.comments}]]></my_comments>\n` +
                    '        <my_finish_date>0000-00-00</my_finish_date>\n' +
                    '        <my_score>0</my_score>\n' +
                    '        <my_start_date>0000-00-00</my_start_date>\n' +
                    `        <my_status>${cursor.value.when}</my_status>\n` +
                    `        <my_watched_episodes>${cursor.value.what}</my_watched_episodes>\n` +
                    `        <series_animedb_id>${
                        cursor.key.match(/myanimelist/gu)
                            ? cursor.key.substring('https://myanimelist.net/anime/'.length)
                            : cursor.key
                    }</series_animedb_id>\n` +
                    `        <series_child>${cursor.value.child}</series_child>\n` +
                    `        <series_color>${cursor.value.color}</series_color>\n` +
                    `        <series_episodes>${cursor.value.episodes}</series_episodes>\n` +
                    `        <series_parent_animedb_id>${
                        cursor.value.parentmyanimelist.match(/myanimelist/gu)
                            ? cursor.value.parentmyanimelist.substring('https://myanimelist.net/anime/'.length)
                            : cursor.value.parentmyanimelist
                    }</series_parent_animedb_id>\n` +
                    `        <series_parent_title><![CDATA[${cursor.value.parentanime}]]></series_parent_title>\n` +
                    `        <series_picture>${cursor.value.picture}</series_picture>\n` +
                    `        <series_title><![CDATA[${cursor.value.title}]]></series_title>\n` +
                    `        <series_type>${cursor.value.type}</series_type>\n` +
                    '        <update_on_import>1</update_on_import>\n' +
                    '    </anime>\n';

                cursor.continue();
            } else {
                const a = document.createElement('a');

                a.href = URL.createObjectURL(new Blob([`${backup}</myanimelist>`]), {
                    type: 'application/xml'
                });

                a.download = 'export.xml';
                a.click();
                a.remove();
            }
        };
    }

    function get2Function(name, i) {
        return new Promise((resolve) => {
            const w = watchFunction().add(name);

            w.onsuccess = () => {
                restoretemp -= 1;
                document.querySelector('dialog pre').innerHTML =
                    `Importing ${(restore.length - restoretemp).toLocaleString('en')} of ${restore.length.toLocaleString('en')}...`;

                return resolve();
            };

            w.onerror = () => {
                restoretemp -= 1;
                dialogFunction(`Deleted duplicate ${restore[i].title}`);
                restore.splice(i, 1);
                document.querySelector('dialog pre').innerHTML =
                    `Importing ${(restore.length - restoretemp).toLocaleString('en')} of ${restore.length.toLocaleString('en')}...`;

                return resolve();
            };
        });
    }

    function restoreFunction() {
        const promises = [];

        watchFunction().clear();

        document.body.innerHTML = '';
        dialogFunction(`Importing 0 of ${restore.length.toLocaleString('en')}...`);

        for (const [index, value] of restore.entries()) {
            promises.push(
                get2Function({
                    child: value.child,
                    color: value.color,
                    comments: value.comments,
                    episodes: value.episodes,
                    myanimelist: value.myanimelist,
                    parentanime: value.parentanime,
                    parentmyanimelist: value.parentmyanimelist,
                    picture: value.picture,
                    title: value.title,
                    type: value.type,
                    what: value.what,
                    when: value.when
                }, index)
            );
        }

        Promise.all(promises).then(() => {
            dialogFunction('Done');
            setTimeout(() => location.reload(), 1000);
        });
    }

    function randomFunction() {
        let i = Math.round(Math.random() * (document.querySelectorAll('table#planning tr').length - 1));

        while (i === random) {
            i = Math.round(Math.random() * (document.querySelectorAll('table#planning tr').length - 1));
        }

        random = i;

        if (document.querySelector('.highlight')) {
            clearTimeout(highlight);
            document.querySelector('.highlight').classList.remove('highlight');
        }

        document.querySelector('div#planning').scrollTop = i * (document.querySelector('td:nth-child(2)').clientHeight + 2);

        document.querySelectorAll('table#planning tr')[i].querySelector('#name').classList.add('highlight');

        highlight = setTimeout(() => {
            document.querySelectorAll('table#planning tr')[i].querySelector('#name').classList.remove('highlight');
        }, 2000);
    }

    function updateFunction() {
        const promises = [];

        document.body.innerHTML = '';
        dialogFunction('Updating...');

        watchFunction().openCursor().onsuccess = (event) => {
            const cursor = event.currentTarget.result;
            let update = '';

            if (cursor) {
                promises.push(
                    new Promise((resolve) => {
                        watchFunction().get(cursor.key).onsuccess = (event2) => {
                            const
                                change = event2.currentTarget.result,
                                image = new Image(),
                                index = db[db.findIndex((i) => i.myanimelist === change.myanimelist)],
                                parentindex = db[db.findIndex((i) => i.myanimelist === change.parentmyanimelist)],
                                t = change.title,
                                v = [
                                    'episodes',
                                    'picture',
                                    'title',
                                    'type'
                                ];

                            if (index) {
                                for (const value of v) {
                                    if (index[value] === change[value]) {
                                        continue;
                                    }

                                    update += `\n=> update ${value} => ${change[value]} => `;

                                    change[value] = index[value];

                                    update += index[value];
                                }
                            }

                            if (parentindex) {
                                if (parentindex.title !== change.parentanime) {
                                    update += `\n=> update parentanime => ${change.parentanime} => ${parentindex.title}`;

                                    change.parentanime = parentindex.title;
                                }
                            }

                            image.crossOrigin = 'anonymous';
                            image.src = change.picture;
                            image.onload = (event3) => {
                                const
                                    c = new ColorThief().getColor(event3.currentTarget),
                                    rgb = `rgb(${c[0]}, ${c[1]}, ${c[2]})`;

                                if (rgb !== change.color) {
                                    update += `\n=> update color => ${change.color} => ${rgb}`;

                                    change.color = rgb;
                                }

                                watchFunction().put(change).onsuccess = () => {
                                    if (update.length) {
                                        dialogFunction(t + update);
                                        return resolve();
                                    }

                                    return resolve();
                                };
                            };

                            image.onerror = () => {
                                watchFunction().put(change).onsuccess = () => {
                                    if (update.length) {
                                        dialogFunction(t + update);
                                        return resolve();
                                    }

                                    return resolve();
                                };
                            };
                        };
                    })
                );

                cursor.continue();
            } else {
                Promise.all(promises).then(() => {
                    dialogFunction('Done');
                    setTimeout(() => location.reload(), 1000);
                });
            }
        };
    }

    function postponeFunction(name) {
        const myanimelist = name[0].parentNode.parentNode.dataset.myanimelist;

        watchFunction().get(myanimelist).onsuccess = (event) => {
            const
                change = event.currentTarget.result,
                t = change.title,
                w = change.what,
                ww = change.when;

            change.what = 0;
            change.when = 'Plan to Watch';

            watchFunction().put(change).onsuccess = () => {
                searchFunction();

                if (w) {
                    dialogFunction(
                        `${t}\n` +
                        `=> update what => ${w} => 0\n` +
                        `=> update when => ${ww} => Plan to Watch`
                    );
                } else {
                    dialogFunction(
                        `${t}\n` +
                        `=> update when => ${ww} => Plan to Watch`
                    );
                }
            };
        };
    }

    function completeFunction(name) {
        const myanimelist = name[0].parentNode.parentNode.dataset.myanimelist;

        watchFunction().get(myanimelist).onsuccess = (event) => {
            const
                change = event.currentTarget.result,
                e = change.episodes,
                t = change.title,
                w = change.what,
                ww = change.when;

            change.what = e;
            change.when = 'Completed';

            watchFunction().put(change).onsuccess = () => {
                searchFunction();

                if (w) {
                    dialogFunction(
                        `${t}\n` +
                        `=> update what => ${w} => ${e}\n` +
                        `=> update when => ${ww} => Completed`
                    );
                } else {
                    dialogFunction(
                        `${t}\n` +
                        `=> update when => ${ww} => Completed`
                    );
                }
            };
        };
    }

    function removeFunction(name) {
        const myanimelist = name[0].parentNode.parentNode.dataset.myanimelist;

        for (const value of name[0].parentNode.parentNode.parentNode.children) {
            if (value.dataset.parentmyanimelist !== myanimelist) {
                continue;
            }

            const
                childanime = value.querySelector('#name').innerHTML,
                childmyanimelist = value.dataset.myanimelist;

            watchFunction().get(childmyanimelist).onsuccess = (event2) => {
                const change = event2.currentTarget.result;

                change.parentanime = childanime;
                change.parentmyanimelist = childmyanimelist;
                change.child = 0;

                watchFunction().put(change).onsuccess = () => {
                    searchFunction();
                    databaseFunction();

                    if (test) {
                        testFunction(test);
                    }

                    if (myanimelist !== childmyanimelist) {
                        dialogFunction(
                            `${childanime}\n` +
                            '=> parent'
                        );
                    }
                };
            };
        }

        watchFunction().get(myanimelist).onsuccess = (event) => {
            const
                change = event.currentTarget.result,
                e = change.episodes,
                p = change.picture,
                t = change.title,
                w = change.what,
                ww = change.when,
                y = change.type;

            watchFunction().delete(myanimelist).onsuccess = () => {
                searchFunction();

                dialogFunction(
                    `${t}\n` +
                    `=> delete episodes => ${e}\n` +
                    `=> delete picture => ${p}\n` +
                    `=> delete title => ${t}\n` +
                    `=> delete type => ${y}\n` +
                    `=> delete what => ${w}\n` +
                    `=> delete when => ${ww}`
                );
            };
        };
    }

    function childFunction(name) {
        const myanimelist = name[0].parentNode.parentNode.dataset.myanimelist;

        let option = '';

        for (const value of document.querySelectorAll('#all tr')) {
            if (value.dataset.myanimelist === myanimelist) {
                option += `<option value="${value.dataset.myanimelist}" selected disabled>${
                    value.querySelector('#name').innerHTML
                }</option>`;
            } else if (value.dataset.child === '0') {
                option += `<option value="${value.dataset.myanimelist}">${
                    value.querySelector('#name').innerHTML
                }</option>`;
            }
        }

        name[0].parentNode.innerHTML = `<select id="childinput">${option}</select>`;
    }

    function parentFunction(name) {
        const myanimelist = name[0].parentNode.parentNode.dataset.myanimelist;

        watchFunction().get(myanimelist).onsuccess = (event) => {
            const
                change = event.currentTarget.result,
                t = change.title;

            change.parentanime = t;
            change.parentmyanimelist = myanimelist;
            change.child = 0;

            watchFunction().put(change).onsuccess = () => {
                searchFunction();

                dialogFunction(
                    `${t}\n` +
                    '=> parent'
                );
            };
        };
    }

    function childinputFunction(name) {
        const
            myanimelist = name[0].parentNode.parentNode.dataset.myanimelist,
            option = name[0].value,
            optionselected =
                $(name)
                    .children('option:selected')
                    .text();

        for (const value of document.querySelectorAll('#all tr')) {
            if (value.dataset.parentmyanimelist !== myanimelist || value.dataset.child !== '1') {
                continue;
            }

            parentFunction(value.querySelector('#parent'));
        }

        watchFunction().get(myanimelist).onsuccess = (event) => {
            const
                change = event.currentTarget.result,
                t = change.title;

            change.parentanime = optionselected;
            change.parentmyanimelist = option;
            change.child = 1;

            watchFunction().put(change).onsuccess = () => {
                searchFunction();

                dialogFunction(
                    `${t}\n` +
                    `=> child => ${optionselected}`
                );
            };
        };
    }

    function buttonFunction(button) {
        const div = button[0].getAttribute('id').slice(3);

        if (!$(`div#${div}`).is(':hidden')) {
            return;
        }

        if (document.querySelector('#when button[selected]')) {
            document.querySelector('#when button[selected]').removeAttribute('selected');
        }

        $('#bottom > div').hide();
        $(`div#${div}`).show();

        button[0].setAttribute('selected', '');
    }

    function scrollFunction(name) {
        const
            id = name[0].getAttribute('id').slice(8),
            myanimelist = name[0].parentNode.parentNode.dataset.myanimelist,
            n = [...document.querySelectorAll(`table#${id} tr`)],
            nn = n.findIndex((i) => i.dataset.myanimelist === myanimelist);

        if (document.querySelector('.highlight')) {
            clearTimeout(highlight);
            document.querySelector('.highlight').classList.remove('highlight');
        }

        buttonFunction($(`#div${id}`));

        // Height of <tr> + border-spacing of <table>
        document.querySelector(`div#${id}`).scrollTop = nn * (document.querySelector('td:nth-child(2)').clientHeight + 2);

        n[nn].querySelector('#name').classList.add('highlight');

        highlight = setTimeout(() => {
            n[nn].querySelector('#name').classList.remove('highlight');
        }, 2000);
    }

    function changeFunction(name, w) {
        const myanimelist = name[0].parentNode.parentNode.dataset.myanimelist;

        watchFunction().get(myanimelist).onsuccess = (event) => {
            const change = event.currentTarget.result;

            change.what = w;

            watchFunction().put(change).onsuccess = () => {
                searchFunction();
            };
        };
    }

    function resetFunction() {
        watchFunction().clear().onsuccess = () => {
            location.reload();
        };
    }

    document.addEventListener('DOMContentLoaded', () => {
        $('body')
            .on('click', 'span#watching', (event) => {
                addFunction($(event.currentTarget), 'Watching');
            })

            .on('click', 'span#planning', (event) => {
                addFunction($(event.currentTarget), 'Plan to Watch');
            })

            .on('click', 'span#completed', (event) => {
                addFunction($(event.currentTarget), 'Completed');
            })

            .on('click', '#update', () => {
                if (!db.length || !canUpdate) {
                    return;
                }

                updateFunction();
            })

            .on('click', '#import', () => {
                if (!restore.length) {
                    return;
                }

                restoreFunction();
            })

            .on('click', '#export', () => {
                backupFunction();
            })

            .on('click', '#reset', () => {
                resetFunction();
            })

            .on('focus', 'input#search', () => {
                $('div#all, div#completed, div#dropped, div#paused, div#planning, div#related, div#watching').hide();
                $('div#database').show();
                $('#divall, #divcompleted, #divdropped, #divpaused, #divplanning, #divrelated, #divwatching').removeAttr('selected');
            })

            .on('input', 'input#search', () => {
                if (!db.length) {
                    return;
                }

                $('table#database').html(
                    '<tr id="message" style="height: 23px;">' +
                        '<td></td>' +
                        '<td></td>' +
                        '<td><span>Searching...</span></td>' +
                        '<td></td>' +
                        '<td></td>' +
                    '</tr>'
                );

                databaseFunction();
            })

            .on('click', '#child', (event) => {
                childFunction($(event.currentTarget));
            })

            .on('change', '#childinput', (event) => {
                childinputFunction($(event.currentTarget));
            })

            .on('click', '#parent', (event) => {
                parentFunction($(event.currentTarget));
            })

            .on('click', '#start', (event) => {
                startFunction($(event.currentTarget));
            })

            .on('click', '[data-when="Completed"] #type', (event) => {
                if (!db.length) {
                    return;
                }

                $('table#related').html(
                    '<tr id="message" style="height: 23px;">' +
                        '<td></td>' +
                        '<td></td>' +
                        '<td><span>Searching...</span></td>' +
                        '<td></td>' +
                        '<td></td>' +
                    '</tr>'
                );

                testFunction($(event.currentTarget));
                buttonFunction($('#divrelated'));
            })

            .on('click', '#pause', (event) => {
                pauseFunction($(event.currentTarget));
            })

            .on('click', '#drop', (event) => {
                dropFunction($(event.currentTarget));
            })

            .on('click', '#postpone', (event) => {
                postponeFunction($(event.currentTarget));
            })

            .on('click', '#complete', (event) => {
                completeFunction($(event.currentTarget));
            })

            .on('click', '#divall, #divcompleted, #divdropped, #divpaused, #divplanning, #divwatching', (event) => {
                buttonFunction($(event.currentTarget));
            })

            .on('click', '#divrelated', (event) => {
                $('div#all, div#completed, div#database, div#dropped, div#paused, div#planning, div#watching').hide();
                $('div#related').show();
                $('#divall, #divcompleted, #divdropped, #divpaused, #divplanning, #divwatching').removeAttr('selected');
                $(event.currentTarget).attr('selected', '');
            })

            .on('dblclick', '#divplanning', () => {
                randomFunction();
            })

            .on('click', '#databasecompleted, #databasedropped, #databasepaused, #databaseplanning, #databasewatching', (event) => {
                scrollFunction($(event.currentTarget));
            })

            .on('click', '#remove', (event) => {
                removeFunction($(event.currentTarget));
            })

            .on('input', 'input[type="number"]', (event) => {
                changeFunction($(event.currentTarget), $(event.currentTarget).val());
            })

            .on('click', '#mode', (event) => {
                if (document.body.getAttribute('id') === 'light') {
                    document.body.setAttribute('id', 'dark');
                    $(event.currentTarget).html('Light');
                    localStorage.setItem('mode', 'dark');
                } else {
                    document.body.setAttribute('id', 'light');
                    $(event.currentTarget).html('Dark');
                    localStorage.setItem('mode', 'light');
                }
            })

            .on('click', 'dialog', (event) => {
                if (!document.querySelector('div')) {
                    return;
                }

                $(event.currentTarget).removeAttr('open');
                $(event.currentTarget).empty();
            })

            .on('change', '#file', (event) => {
                const
                    file = event.currentTarget.files[0],
                    reader = new FileReader();

                reader.readAsText(file);

                reader.onload = (event2) => {
                    const anime =
                        new DOMParser().parseFromString(event2.target.result, 'application/xml')
                            .querySelectorAll('anime');

                    restore = [];
                    restoretemp = 0;

                    if (!anime.length) {
                        dialogFunction('Invalid XML');
                        return;
                    }

                    for (const value of anime) {
                        const parseFunction = (b) => {
                            const parse = value.querySelector(b);

                            if (parse) {
                                return parse.textContent;
                            }

                            return '';
                        };

                        if (!parseFunction('series_animedb_id')) {
                            continue;
                        }

                        restore.push({
                            child: Number(parseFunction('series_child')) || 0,
                            color: parseFunction('series_color') || defaultcolorFunction(),
                            comments: parseFunction('my_comments'),
                            episodes: Number(parseFunction('series_episodes')) || 0,
                            myanimelist:
                                Number(parseFunction('series_animedb_id'))
                                    ? `https://myanimelist.net/anime/${parseFunction('series_animedb_id')}`
                                    : parseFunction('series_animedb_id'),
                            parentanime: parseFunction('name') || parseFunction('series_parent_title') || parseFunction('series_title'),
                            parentmyanimelist:
                                parseFunction('series_parent_animedb_id')
                                    ? Number(parseFunction('series_parent_animedb_id'))
                                        ? `https://myanimelist.net/anime/${parseFunction('series_parent_animedb_id')}`
                                        : parseFunction('series_parent_animedb_id')
                                    : Number(parseFunction('series_animedb_id'))
                                        ? `https://myanimelist.net/anime/${parseFunction('series_animedb_id')}`
                                        : parseFunction('series_animedb_id'),
                            picture: parseFunction('series_picture'),
                            title: parseFunction('series_title'),
                            type: parseFunction('series_type'),
                            what: Number(parseFunction('my_watched_episodes')) || 0,
                            when: parseFunction('my_status') || 'Plan to Watch'
                        });

                        restoretemp += 1;
                    }
                };
            });

        /**
         * Useless if ran in localhost;
         * use service workers
         */
        if (navigator.onLine) {
            return;
        }

        dialogFunction('You are offline');
    });

    openDB.onsuccess = (event) => {
        const watch = event.currentTarget.result;
        watchFunction = () => watch.transaction(DB, 'readwrite').objectStore(DB);

        searchFunction();
    };

    openDB.onupgradeneeded = (event) => {
        const
            createDB =
                event.currentTarget.result.createObjectStore(DB, {
                    keyPath: 'myanimelist'
                }),
            index =
                [
                    'child',
                    'color',
                    'comments',
                    'episodes',
                    'parentanime',
                    'parentmyanimelist',
                    'picture',
                    'title',
                    'type',
                    'what',
                    'when'
                ];

        for (const value of index) {
            createDB.createIndex(value, value, {
                unique: false
            });
        }
    };

    openDB.onerror = () => {
        document.body.innerHTML = '';
    };

    fetch('https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database.json')
        .then((response) => response.json())
        .then((data) => {
            const d = data.data;

            for (const value of d) {
                const m = value.sources.filter((s) => s.match(/kitsu|myanimelist/gu));

                if (!m.length) {
                    continue;
                }

                for (const value2 of m) {
                    if (value2.match(/kitsu/gu) && m.filter((f) => f.match(/myanimelist/gu)).length) {
                        continue;
                    }

                    db.push({
                        episodes: value.episodes,
                        myanimelist: value2.toString(),
                        picture: value.picture,
                        relations: value.relations.filter((r) => r.match(/kitsu|myanimelist/gu)),
                        title: value.title,
                        type: value.type
                    });
                }
            }

            document.querySelector('table#database').innerHTML =
                '<tr id="message" style="height: 23px;">' +
                    '<td></td>' +
                    '<td></td>' +
                    '<td><span>Must have at least 3 characters to search</span></td>' +
                    '<td></td>' +
                    '<td></td>' +
                '</tr>';

            document.querySelector('table#related').innerHTML =
                '<tr id="message" style="height: 23px;">' +
                    '<td></td>' +
                    '<td></td>' +
                    '<td><span>From your Completed list, click on the Type column to find relations</span></td>' +
                    '<td></td>' +
                    '<td></td>' +
                '</tr>';
        })
        .catch(() => {
            dialogFunction('Error fetching database');

            for (const value of ['table#database', 'table#related']) {
                document.querySelector(value).innerHTML =
                    '<tr id="message" style="height: 23px;">' +
                        '<td></td>' +
                        '<td></td>' +
                        '<td><span>Error fetching database</span></td>' +
                        '<td></td>' +
                        '<td></td>' +
                    '</tr>';
            }
        });
})();
