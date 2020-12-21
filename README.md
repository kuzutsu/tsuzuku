# [Tsuzuku-α](https://kuzutsu.github.io/tsuzuku/)
**Tsuzuku** is useful for anime watching challenges.

![](https://raw.githubusercontent.com/kuzutsu/tsuzuku/master/preview.png)

Search providers are MyAnimeList (high priority) and Kitsu
* If title is in MyAnimeList but not in Kitsu, this will be listed and MyAnimeList icon will be shown
* If title is in Kitsu but not in MyAnimeList, this will be listed and Kitsu icon will be shown
* If title is in MyAnimeList and same title is in Kitsu, only one title will be listed and MyAnimeList icon will be shown
* If title is in MyAnimeList but different title is in Kitsu, both titles will be listed and respective icons will be shown

## Features
### Offline-ready
Install as PWA

### Fuzzy search (default)
Not case-sensitive

Default sort by relevancy % (descending), then by title (ascending)

### Regular expression search
Romaji only, not case-sensitive

Click on dot-and-asterisk icon to toggle (will light up when enabled)

Examples:
* Only 13 characters ([`^.{13}$`](https://kuzutsu.github.io/tsuzuku/?query=%255E.%257B13%257D%2524&regex=1))
* Only 8 *i*'s ([`^[^i]*(?:i[^i]*){8}$`](https://kuzutsu.github.io/tsuzuku/?query=%255E%255B%255Ei%255D*%28%253F%253Ai%255B%255Ei%255D*%29%257B8%257D%2524&regex=1))
* No spaces ([`^\S+$`](https://kuzutsu.github.io/tsuzuku/?query=%255E%255CS%252B%2524&regex=1))
* No vowels ([`^[^aeiou]+$`](https://kuzutsu.github.io/tsuzuku/?query=%255E%255B%255Eaeiou%255D%252B%2524&regex=1))
* Ends with a number ([`\d$`](https://kuzutsu.github.io/tsuzuku/?query=%255Cd%2524&regex=1))
* Has *a* on the third position and *e* on the sixth ([`^..a..e.*$`](https://kuzutsu.github.io/tsuzuku/?query=%255E..a..e.*%2524&regex=1))

### Advanced search
#### OR-based
Separate with `,`, no spaces
* `season:` (`winter`, `spring`, `summer`, `fall`, `tba`)
* `status:` (`watching`, `rewatching`, `completed`, `paused`, `dropped`, `planning`)
* `type:` (`tv`, `movie`, `ova`, `ona`, `special`)

Examples:
* From summer season only ([`season:summer`](https://kuzutsu.github.io/tsuzuku/?query=season%253Asummer))
* Paused or dropped ([`status:paused,dropped`](https://kuzutsu.github.io/tsuzuku/?query=status%253Apaused%252Cdropped))
* Movies, OVAs, or ONAs only ([`type:movie,ova,ONA`](https://kuzutsu.github.io/tsuzuku/?query=type%253Amovie%252Cova%252CONA))

#### AND-based
Can use `<`, `<=`, `>`, or `>=` for numerals, separate with `&`, no spaces
* `episodes:`
* `score:`
* `tags:` (if with spaces, replace with `_`)
* `year:` (can use `tba`)

Examples:
* Only 13 episodes ([`episodes:13`](https://kuzutsu.github.io/tsuzuku/?query=episodes%253A13))
* Score higher than 4 but lower than 7 ([`score:>4&<7`](https://kuzutsu.github.io/tsuzuku/?query=score%253A%253E4%2526%253C7))
* Based on a manga and comedy ([`tags:based_on_a_manga&comedy`](https://kuzutsu.github.io/tsuzuku/?query=tags%253Abased_on_a_manga%2526comedy))
* On or before 2011 ([`year:<=2011`](https://kuzutsu.github.io/tsuzuku/?query=year%253A%253C%253D2011))

### Randomly select *n* titles
Click on shuffle icon to toggle (will light up when enabled)

Default is 1

Press `Enter` in search box (or click on search icon) to randomize again

### Multiple sort
Desktop only

Hold `Ctrl`, then click on header titles (toggle between ascending and descending)

### Dark mode
Click on sun icon to toggle

## Bugs
* Scrolling breaks UI<br>
**Workaround:** Tapping on search (on mobile) or resizing window (on desktop)

## Dependencies
* [anime-offline-database](https://github.com/manami-project/anime-offline-database)
* [Fuse](https://github.com/krisk/fuse)
* [Tabulator](https://github.com/olifolkerd/tabulator)