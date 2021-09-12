# [Tsuzuku](https://kuzutsu.github.io/tsuzuku/)
**Tsuzuku** combines entries from MyAnimeList (highest priority), Kitsu, and AniList into a single list.

Uses the [anime-offline-database](https://github.com/manami-project/anime-offline-database) and [Tabulator](https://github.com/olifolkerd/tabulator)

![](https://raw.githubusercontent.com/kuzutsu/tsuzuku/master/preview.png)

Only one source will appear, click on earth icon to toggle more

## Features
### Offline-ready
Install as PWA

Personal list only saved locally in the browser

While offline, thumbnails will not load unless cached

### Fuzzy search (default)
Uses [Fuse](https://github.com/krisk/fuse)

Not case-sensitive

Default sort by relevancy

### Regular expression search
Not case-sensitive

Examples:
* Starts with *a* ([`^a`](https://kuzutsu.github.io/tsuzuku/?query=%255Ea&regex=1&alt=0))
* Ends with a number ([`\d$`](https://kuzutsu.github.io/tsuzuku/?query=%255Cd%2524&regex=1&alt=0))
* Only 13 characters ([`^.{13}$`](https://kuzutsu.github.io/tsuzuku/?query=%255E.%257B13%257D%2524&regex=1&alt=0))
* Only 8 *i*'s ([`^[^i]*(?:i[^i]*){8}$`](https://kuzutsu.github.io/tsuzuku/?query=%255E%255B%255Ei%255D*%28%253F%253Ai%255B%255Ei%255D*%29%257B8%257D%2524&regex=1&alt=0))
* No spaces ([`^\S+$`](https://kuzutsu.github.io/tsuzuku/?query=%255E%255CS%252B%2524&regex=1&alt=0))

### Match canonical titles only (disabled by default)
Recommended to disable when using regular expression search

### Search syntaxes
* `is:dead` (saved titles removed from the database)
* `is:new` (new titles since last app launch)
* `is:ongoing`
* `is:selected`

#### OR-type
Separate with `|`, no spaces
* `season:` (`winter`, `spring`, `summer`, `fall`, `tba`)
* `status:` (`all`, `none`, `completed`, `dropped`, `paused`, `planning`, `rewatching`, `skipping`, `watching`)
* `type:` (`tv`, `movie`, `ova`, `ona`, `special`, `tba`)

Examples:
* From summer season ([`season:summer`](https://kuzutsu.github.io/tsuzuku/?query=season%253Asummer))
* Paused or dropped ([`status:paused|dropped`](https://kuzutsu.github.io/tsuzuku/?query=status%253Apaused%257Cdropped))
* Movies, OVAs, or ONAs ([`type:movie|ova|ona`](https://kuzutsu.github.io/tsuzuku/?query=type%253Amovie%257Cova%257Cona))

#### AND-type
Separate with `&`, no spaces, can use `<`, `<=`, `>`, or `>=` for numerals
* `episodes:`
* `progress:` (can use absolute or relative values)
* `source:` (`myanimelist`, `kitsu`, `anilist`)
* `tag:` (replace spaces with `_`, start with `-` to exclude)
  * MyAnimeList (`action`, `adventure`, etc.)
  * Kitsu (`absurdist_humour`, `africa`, etc.)
  * AniList (`achromatic`, `achronological_order`, etc.)
  * Anime-Planet (`abstract`, `acting`, etc.)
* `year:` (can use `tba`)

Examples:
* Has 13 episodes ([`episodes:13`](https://kuzutsu.github.io/tsuzuku/?query=episodes%253A13))
* Has progress higher than 4 but lower than 70% ([`progress:>4&<70%`](https://kuzutsu.github.io/tsuzuku/?query=progress%253A%253E4%2526%253C70%2525))
* Only on Kitsu and AniList ([`source:kitsu&anilist`](https://kuzutsu.github.io/tsuzuku/?query=source%253Akitsu%2526anilist))
* Based on a manga and comedy ([`tag:based_on_a_manga&comedy`](https://kuzutsu.github.io/tsuzuku/?query=tag%253Abased_on_a_manga%2526comedy))
* Based on a light novel but not isekai ([`tag:based_on_a_light_novel&-isekai`](https://kuzutsu.github.io/tsuzuku/?query=tag%253Abased_on_a_light_novel%2526-isekai))
* Before 2019 ([`year:<2019`](https://kuzutsu.github.io/tsuzuku/?query=year%253A%253C2019))

### Randomize results
Default is 1

### Mass change status
Click on thumbnails to select

On desktop, hold `Shift` to select range

### Dark mode
Click on moon icon to toggle

### List layout
Click on image icon to toggle

### Games
Click on score to reset

#### Odd one out
Query will only appear after submitting an answer

#### Quiz
In single selection mode (default), there is only one correct answer

In multiple selection mode, there may be one, multiple, or no correct answers

### Export
File is in MyAnimeList XML format

#### Disclaimer
* Sites supporting this format may only import titles with a MyAnimeList entry
* Skipped titles will have a Dropped status with 0 progress

### Import
Supports files in MyAnimeList XML or AniList GDPR JSON format

#### Disclaimer
* Only status and progress will be imported
* Saved data will be overwritten
* For MyAnimeList XML, `update_on_import` will be ignored

#### MyAnimeList
1. Go to https://myanimelist.net/panel.php?go=export
1. Click "Export My List"
1. Click "OK"
1. Click "animelist_xxxxxxxxxx_-_xxxxxxxx.xml.gz" to download GZIP file
1. Extract XML file

#### Kitsu
Method will only include titles with a MyAnimeList entry
1. Go to https://kitsu.io/settings/exports
1. Click "Download Anime Library" to download XML file

#### AniList
1. Go to https://anilist.co/gdpr/download to download JSON file