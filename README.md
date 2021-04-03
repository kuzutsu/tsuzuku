# [Tsuzuku](https://kuzutsu.github.io/tsuzuku/)
**Tsuzuku** is useful for anime watching challenges.

![](https://raw.githubusercontent.com/kuzutsu/tsuzuku/master/preview.png)

It uses the [anime-offline-database](https://github.com/manami-project/anime-offline-database) (to minimize duplicates, only titles from MyAnimeList and Kitsu will be listed) and [Tabulator](https://github.com/olifolkerd/tabulator).
* If title is in MyAnimeList but not in Kitsu, this will be listed and MyAnimeList icon will appear
* If title is in Kitsu but not in MyAnimeList, this will be listed and Kitsu icon will appear
* If title is in MyAnimeList and same title is in Kitsu, only one title will be listed and MyAnimeList icon will appear
* If title is in MyAnimeList but different title is in Kitsu, both titles will be listed and respective icons will appear

## Features
### Offline-ready
Install as PWA

### Fuzzy search (default)
Uses [Fuse](https://github.com/krisk/fuse)

Not case-sensitive

Default sort by relevancy

### Regular expression search
Not case-sensitive

Click on dot-and-asterisk icon to toggle (will light up when enabled)

Examples:
* Starts with *a* ([`^a`](https://kuzutsu.github.io/tsuzuku/?query=%255Ea&regex=1&alt=0))
* Ends with a number ([`\d$`](https://kuzutsu.github.io/tsuzuku/?query=%255Cd%2524&regex=1&alt=0))
* Only 13 characters ([`^.{13}$`](https://kuzutsu.github.io/tsuzuku/?query=%255E.%257B13%257D%2524&regex=1&alt=0))
* Only 8 *i*'s ([`^[^i]*(?:i[^i]*){8}$`](https://kuzutsu.github.io/tsuzuku/?query=%255E%255B%255Ei%255D*%28%253F%253Ai%255B%255Ei%255D*%29%257B8%257D%2524&regex=1&alt=0))
* No spaces ([`^\S+$`](https://kuzutsu.github.io/tsuzuku/?query=%255E%255CS%252B%2524&regex=1&alt=0))

### Include synonyms (enabled by default)
Click on split-arrow icon to toggle (will light up when enabled)

Recommended to disable when using regular expression search

### Search syntaxes
* `is:airing`
* `is:selected`

#### OR-based
Separate with `|`, no spaces
* `season:` (`winter`, `spring`, `summer`, `fall`, `tba`)
* `status:` (`completed`, `dropped`, `paused`, `planning`, `rewatching`, `watching`)
* `type:` (`tv`, `movie`, `ova`, `ona`, `special`)

Examples:
* From summer season only ([`season:summer`](https://kuzutsu.github.io/tsuzuku/?query=season%253Asummer))
* Paused or dropped ([`status:paused|dropped`](https://kuzutsu.github.io/tsuzuku/?query=status%253Apaused%257Cdropped))
* Movies, OVAs, or ONAs only ([`type:movie|ova|ona`](https://kuzutsu.github.io/tsuzuku/?query=type%253Amovie%257Cova%257Cona))

#### AND-based
Can use `<`, `<=`, `>`, or `>=` for numerals, separate with `&`, no spaces
* `episodes:`
* `progress:`
* `tags:` (replace spaces with `_`, start with `-` to exclude)
  * MyAnimeList (`action`, `adventure`, etc.)
  * Kitsu (`absurdist_humour`, `africa`, etc.)
  * AniList (`achromatic`, `achronological_order`, etc.)
  * Anime-Planet (`abstract`, `acting`, etc.)
* `year:` (can use `tba`)

Examples:
* Only 13 episodes ([`episodes:13`](https://kuzutsu.github.io/tsuzuku/?query=episodes%253A13))
* Progress higher than 4 but lower than 7 ([`progress:>4&<7`](https://kuzutsu.github.io/tsuzuku/?query=progress%253A%253E4%2526%253C7))
* Based on a manga and comedy ([`tags:based_on_a_manga&comedy`](https://kuzutsu.github.io/tsuzuku/?query=tags%253Abased_on_a_manga%2526comedy))
* Based on a light novel but not isekai ([`tags:based_on_a_light_novel&-isekai`](https://kuzutsu.github.io/tsuzuku/?query=tags%253Abased_on_a_light_novel%2526-isekai))
* On or before 2011 ([`year:<=2011`](https://kuzutsu.github.io/tsuzuku/?query=year%253A%253C%253D2011))

### Random select
Click on shuffle icon to toggle (will light up when enabled)

Default is 1

Press `Enter` in search box (or click on search icon) to randomize again

### Select range
Desktop only

Hold `Shift`, then click on thumbnail images

### Dark mode
Click on sun icon to toggle