import {
    dark,
    dimension
} from './index.js';

var db = [],
    r = null,
    s = null,
    table = null;

fetch('https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database.json')
    .then(response => response.json())
    .then(data => {
        const d = data.data;
        
        let database = [],
            lastRow = false;

        $('#search-container').css('display', 'flex');

        for (var i = 0; i < d.length; i++) {
            var m = d[i].sources.filter(s => s.match(/kitsu\.io|myanimelist\.net/g)),
                source = null;

            if (m.length) {
                switch (d[i].animeSeason.season) {
                    case 'WINTER':
                        s = 'Winter ';
                        break;
                    case 'SPRING':
                        s = 'Spring ';
                        break;
                    case 'SUMMER':
                        s = 'Summer ';
                        break;
                    case 'FALL':
                        s = 'Fall ';
                        break;
                    default:
                        s = '';
                        break;
                }

                if (d[i].sources.filter(s => s.match(/myanimelist\.net/g)).length) {
                    source = /myanimelist\.net/g;
                } else {
                    source = /kitsu\.io/g;
                }

                for (const value of d[i].sources.filter(s => s.match(source))) {
                    database.push({
                        episodes: d[i].episodes || '',
                        notes: '',
                        nsfw: d[i].tags.filter(t => t.match(/hentai/g))[0] || '',
                        picture: d[i].picture.match(/myanimelist\.net/g) ? d[i].picture.replace(d[i].picture.substr(d[i].picture.lastIndexOf('.')), '.webp') : d[i].picture,
                        relations: d[i].relations.filter(r => r.match(/kitsu\.io|myanimelist\.net/g)),
                        relevancy: 1,
                        score: Math.round(Math.random() * 10) || '',
                        season: s + (d[i].animeSeason.year || ''),
                        sources: value,
                        status: ['', 'Watching', 'Completed', 'Rewatching', 'Paused', 'Dropped', 'Planning'][Math.round(Math.random() * 5)],
                        synonyms: d[i].synonyms,
                        title: d[i].title,
                        type: d[i].type
                    });
                }
            }
        }

        Tabulator.prototype.extendModule('edit', 'editors', {
            'textarea': function (cell, onRendered, success, cancel, editorParams) {
                var self = this,
                    cellValue = cell.getValue(),
                    vertNav = editorParams.verticalNavigation || "hybrid",
                    value = String(cellValue !== null && typeof cellValue !== "undefined"  ? cellValue : ""),
                    count = (value.match(/(?:\r\n|\r|\n)/g) || []).length + 1,
                    input = document.createElement("textarea"),
                    scrollHeight = 0;

                input.style.display = "block";
                input.style.padding = "2px";
                input.style.height = "100%";
                input.style.width = "100%";
                input.style.whiteSpace = "pre-wrap";
                input.style.resize = "none";
                input.style.overflowY = "hidden";
        
                if(editorParams.elementAttributes && typeof editorParams.elementAttributes == "object"){
                    for (let key in editorParams.elementAttributes){
                        if(key.charAt(0) == "+"){
                            key = key.slice(1);
                            input.setAttribute(key, input.getAttribute(key) + editorParams.elementAttributes["+" + key]);
                        }else{
                            input.setAttribute(key, editorParams.elementAttributes[key]);
                        }
                    }
                }
        
                input.value = value;
        
                onRendered(function(){
                    input.focus({preventScroll: true});
                    input.style.height = "";
        
                    input.scrollHeight;
                    input.style.height = input.scrollHeight + 2 + "px";
                    cell.getRow().normalizeHeight();
                });
        
                function onChange(e){
        
                    if(((cellValue === null || typeof cellValue === "undefined") && input.value !== "") || input.value !== cellValue){
        
                        if(success(input.value)){
                            cellValue = input.value; //persist value if successfully validated incase editor is used as header filter
                        }
        
                        setTimeout(function(){
                            cell.getRow().normalizeHeight();
                        },300)
                    }else{
                        cancel();
                    }
                }
        
                //submit new value on blur or change
                input.addEventListener("change", onChange);
                input.addEventListener("blur", onChange);
        
                input.addEventListener("keyup", function(){

                    input.style.height = "";

                    var heightNow = input.scrollHeight;
                    input.style.height = heightNow + 2 + "px";

                    if(heightNow != scrollHeight){
                        scrollHeight = heightNow;
                        cell.getRow().normalizeHeight();
                    }
                });
        
                input.addEventListener("keydown", function(e){
        
                    switch(e.keyCode){
                        case 27:
                        cancel();
                        break;
        
                        case 38: //up arrow
                        if(vertNav == "editor" || (vertNav == "hybrid" && input.selectionStart)){
                            e.stopImmediatePropagation();
                            e.stopPropagation();
                        }
        
                        break;
        
                        case 40: //down arrow
                        if(vertNav == "editor" || (vertNav == "hybrid" && input.selectionStart !== input.value.length)){
                            e.stopImmediatePropagation();
                            e.stopPropagation();
                        }
                        break;
        
                        case 35:
                        case 36:
                        e.stopPropagation();
                        break;
                    }
                });
        
                if(editorParams.mask){
                    this.table.modules.edit.maskInput(input, editorParams);
                }
        
                return input;
            }
        });

        table = new Tabulator('#database-container', {
            data: database,
            layout: 'fitColumns',
            sortOrderReverse: true,
            resizableColumns: false,
            dataFiltering: function () {
                if (!r) {
                    return;
                }

                for (const value of r) {
                    value.update({
                        relevancy: 1
                    });
                }
            },
            dataFiltered: function (filters, rows) {
                if (dimension) {
                    r = rows;

                    for (const value of rows) {
                        value.update({
                            relevancy: dimension[dimension.findIndex((i) => i.source === value.getData().sources)].relevancy
                        });
                    }
                }

                $('#progress').remove();
                $('.tabulator-tableHolder').show();
            },
            initialSort: [
                {
                    column: 'relevancy',
                    dir: 'desc'
                },
                {
                    column: 'title',
                    dir: 'asc'
                }
            ],
            rowFormatter: function (row) {
                row.getElement().dataset.status = row.getData().status;
            },
            responsiveLayout: 'hide',
            headerSortElement: '<span class="material-icons" style="font-size: 17px;">arrow_downward</span>',
            columns: [
                {
                    field: 'color',
                    headerSort: false,
                    minWidth: 4,
                    width: 4
                },
                {
                    title: '#',
                    headerSort: false,
                    headerHozAlign: 'center',
                    hozAlign: 'center',
                    vertAlign: 'middle',
                    formatter: 'rownum',
                    width: 50
                },
                {
                    titleFormatter: function () {
                        return '<span class="material-icons" style="font-size: 17px;">check_box_outline_blank</span>';
                    },
                    field: 'picture',
                    headerHozAlign: 'center',
                    hozAlign: 'center',
                    vertAlign: 'middle',
                    headerSort: false,
                    width: 50,
                    formatter: function (cell) {
                        return '<span class="material-icons" style="font-size: 17px; position: absolute; cursor: default; display: none; user-select: none;">check_box</span><img src="' + cell.getValue() + '" loading="lazy" style="height: 40px; width: 40px; object-fit: cover; user-select: none;">';
                    },
                    headerClick: function (e, column) {
                        if (!column.getTable().getSelectedRows().length) {
                            column.getTable().selectRow('active');

                            if (!column.getTable().getSelectedRows().length) {
                                return;
                            }

                            document.querySelector('#header').classList.add('header-tabulator-selected');

                            if (column.getTable().getSelectedRows().length === column.getTable().getRows().length) {
                                column._column.titleElement.children[0].innerHTML = 'check_box';
                            } else {
                                column._column.titleElement.children[0].innerHTML = 'indeterminate_check_box';
                            }

                            document.querySelector('#header-title').innerHTML = column.getTable().getSelectedRows().length + ' selected';
                            document.querySelector('#header-version').style.display = 'none';
                            document.head.querySelector('[name="theme-color"]').content = '#769bcc';
                        } else {
                            document.querySelector('#header').classList.remove('header-tabulator-selected');
                            column._column.titleElement.children[0].innerHTML = 'check_box_outline_blank';
                            column.getTable().deselectRow();
                            document.querySelector('#header-title').innerHTML = 'Tsuzuku';
                            document.querySelector('#header-version').style.display = 'block';

                            if (dark) {
                                document.head.querySelector('[name="theme-color"]').content = '#000';
                            } else {
                                document.head.querySelector('[name="theme-color"]').content = '#fff';
                            }
                        }
                    },
                    cellClick: function (e, cell) {
                        getSelection().removeAllRanges();
                        cell.getRow().toggleSelect();

                        if (e.shiftKey) {
                            if (!lastRow) {
                                lastRow = cell.getRow();

                                cell.getColumn()._column.titleElement.children[0].innerHTML = 'indeterminate_check_box';
                                return;
                            }

                            let position = cell.getRow().getPosition(true),
                                lastPosition = lastRow.getPosition(true);

                            if (lastPosition < position) {
                                let prevRow = cell.getRow().getPrevRow();

                                while (prevRow.getPosition(true) > lastPosition) {
                                    prevRow.toggleSelect();
                                    prevRow = prevRow.getPrevRow();
                                }
                            } else {
                                let nextRow = cell.getRow().getNextRow();

                                while (nextRow.getPosition(true) < lastPosition) {
                                    nextRow.toggleSelect();
                                    nextRow = nextRow.getNextRow();
                                }
                            }
                        }

                        lastRow = cell.getRow();

                        if (!cell.getTable().getSelectedRows().length) {
                            document.querySelector('#header').classList.remove('header-tabulator-selected');
                            document.querySelector('#header-title').innerHTML = 'Tsuzuku';
                            document.querySelector('#header-version').style.display = 'block';
                            cell.getColumn()._column.titleElement.children[0].innerHTML = 'check_box_outline_blank';

                            if (dark) {
                                document.head.querySelector('[name="theme-color"]').content = '#000';
                            } else {
                                document.head.querySelector('[name="theme-color"]').content = '#fff';
                            }
                        } else {
                            document.querySelector('#header').classList.add('header-tabulator-selected');
                            document.querySelector('#header-title').innerHTML = cell.getTable().getSelectedRows().length + ' selected';
                            document.querySelector('#header-version').style.display = 'none';
                            document.head.querySelector('[name="theme-color"]').content = '#769bcc';

                            if (cell.getTable().getSelectedRows().length === cell.getTable().getRows().length) {
                                cell.getColumn()._column.titleElement.children[0].innerHTML = 'check_box';
                            } else {
                                cell.getColumn()._column.titleElement.children[0].innerHTML = 'indeterminate_check_box';
                            }
                        }
                    }
                },
                {
                    titleFormatter: function () {
                        return '<span class="material-icons" style="font-size: 17px;">public</span>';
                    },
                    field: 'sources',
                    headerHozAlign: 'center',
                    hozAlign: 'center',
                    vertAlign: 'middle',
                    headerSort: false,
                    width: 50,
                    formatter: function (cell) {
                        let sources = '<img src="';

                        if (cell.getValue().match(/myanimelist\.net/g)) {
                            sources += 'https://myanimelist.net/img/common/pwa/launcher-icon-4x.png';
                        } else {
                            sources += 'https://kitsu.io/favicon-194x194-2f4dbec5ffe82b8f61a3c6d28a77bc6e.png';
                        }

                        return sources + '" loading="lazy" style="user-select: none; height: 17px; width: 17px;">';
                    }
                },
                {
                    title: 'Title',
                    vertAlign: 'middle',
                    field: 'title',
                    minWidth: 100,
                    formatter: function (cell) {
                        return '<a href="' + cell.getRow().getCell('sources').getValue() + '" target="_blank" rel="noreferrer" style="overflow-wrap: anywhere; white-space: normal;">' + cell.getValue() + '</a>';
                    }
                },
                {
                    title: 'Notes',
                    field: 'notes',
                    vertAlign: 'middle',
                    minWidth: 100,
                    editor: 'textarea',
                    formatter: function (cell) {
                        var span = document.createElement('span');

                        span.classList.add('markdown');
                        span.style.overflowWrap = 'anywhere';
                        span.style.whiteSpace = 'normal';
                        span.style.width = 'inherit';

                        span.innerHTML = markdownit({
                            html: true
                        //}).render(bbcodeToHTML(cell.getValue() || ''));
                        }).render(cell.getValue() || '');

                        if (span.querySelectorAll('a').length) {
                            for (const value of span.querySelectorAll('a')) {
                                value.setAttribute('target', '_blank');
                                value.setAttribute('rel', 'noreferrer');
                            }
                        }

                        return span.outerHTML;
                    }
                },
                {
                    title: 'Score',
                    headerHozAlign: 'center',
                    hozAlign: 'center',
                    vertAlign: 'middle',
                    field: 'score',
                    width: 100,
                    editor: 'select',
                    editorParams: {
                        values: [
                            '',
                            1,
                            2,
                            3,
                            4,
                            5,
                            6,
                            7,
                            8,
                            9,
                            10
                        ]
                    }
                },
                {
                    title: 'Type',
                    headerHozAlign: 'center',
                    hozAlign: 'center',
                    vertAlign: 'middle',
                    field: 'type',
                    width: 100
                },
                {
                    title: 'Episodes',
                    headerHozAlign: 'center',
                    hozAlign: 'center',
                    vertAlign: 'middle',
                    field: 'episodes',
                    width: 100
                },
                {
                    title: 'Season',
                    headerHozAlign: 'center',
                    hozAlign: 'center',
                    vertAlign: 'middle',
                    field: 'season',
                    width: 100
                },
                {
                    title: 'Status',
                    headerHozAlign: 'center',
                    hozAlign: 'center',
                    vertAlign: 'middle',
                    field: 'status',
                    width: 100,
                    editor: 'select',
                    editorParams: {
                        values: [
                            '',
                            'Watching',
                            'Rewatching',
                            'Completed',
                            'Paused',
                            'Dropped',
                            'Planning'
                        ]
                    },
                    cellEdited: function (cell) {
                        cell.getRow().getElement().dataset.status = cell.getValue();
                    }
                },
                {
                    title: '%',
                    field: 'relevancy',
                    headerHozAlign: 'center',
                    hozAlign: 'center',
                    vertAlign: 'middle',
                    width: 100,
                    formatter: function (cell) {
                        return Number(cell.getValue() * 100).toFixed(1) + '%';
                    }
                }
            ]
        });
    });

export {
    db,
    table
};
