*Source code in chaos<br>
Will update from time to time<br>
What is this haiku?*

*Also this README<br>
Will update from time to time<br>
Another haiku*

# [Tsuzuku-α](https://kuzutsu.github.io/tsuzuku/test/)
**Tsuzuku** is useful for anime watching challenges.

![](https://raw.githubusercontent.com/kuzutsu/tsuzuku/master/test/preview.png)

Search providers are MyAnimeList (high priority) and Kitsu
* If title is in MyAnimeList but not in Kitsu, this will be listed and MyAnimeList icon will be shown
* If title is in Kitsu but not in MyAnimeList, this will be listed and Kitsu icon will be shown
* If title is in MyAnimeList and same title is in Kitsu, only one title will be listed and MyAnimeList icon will be shown
* If title is in MyAnimeList but different title is in Kitsu, both titles will be listed and respective icons will be shown

## Features
### Fuzzy search (default)
Search (not case-sensitive) in Romaji, English, Japanese, etc.

Default sort by relevancy % (descending), then by title (ascending)

### Regular expression search
Can only search (not case-sensitive) in Romaji

Click on the dot-and-asterisk icon to toggle (will light up when enabled)

Examples:
* Only 13 characters (`^.{13}$`)
* Only 8 *i*'s (`^[^i]*(?:i[^i]*){8}$`)
* No spaces (`^\S+$`)
* No vowels (`^[^aeiou]+$`)
* Ends with a number (`\d$`)
* Has *a* on the third position and *e* on the sixth (`^..a..e.*$`)

### Advanced search
#### Text-based
Separate with OR operator (`,`), no spaces
* `season:` (`winter`, `spring`, `summer`, `fall`, `tba`)
* `status:` (`watching`, `rewatching`, `completed`, `paused`, `dropped`, `planning`)
* `type:` (`tv`, `movie`, `ova`, `ona`, `special`)

Examples:
* From summer season only (`season:summer`)
* Paused or dropped (`status:paused,dropped`)
* Movies, OVAs, or ONAs only (`type:movie,ova,ONA`)

#### Number-based
Can use `<`, `<=`, `>`, or `>=`, separate with AND operator (`&`), no spaces
* `episodes:`
* `score:`
* `year:`

Examples:
* Only 13 episodes (`episodes:13`)
* Score higher than 4 but less than 7 (`score:>4&<7`)
* On or before 2011 (`year:<=2011`)

### Randomly select *n* titles
Click on the shuffle icon to toggle (will light up when enabled)

Default is 1

Press `Enter` in search box to randomize again

### Multiple sort
Desktop only

Hold `Ctrl`, then click on the header titles (toggle between ascending and descending)

### Dark mode
Click on the sun icon to toggle

## Bugs
* Scrolling leaves a padding<br>
**Workaround:** Tapping on search (on mobile) or resizing the window (on desktop)

## Notes
* Notes placeholder text in the preview is from the *Nani the Fuck?* copypasta
* Scores and statuses are at random while the tracking feature of Tsuzuku is in development
