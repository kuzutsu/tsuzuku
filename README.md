*Source code in chaos<br>
Will update from time to time<br>
What is this haiku?*

*Also this README<br>
Will update from time to time<br>
Another haiku*

# [Tsuzuku-α](https://kuzutsu.github.io/tsuzuku/test/)
**Tsuzuku** is useful for anime watching challenges.

![](https://raw.githubusercontent.com/kuzutsu/tsuzuku/master/test/preview.png)

## Features
### Fuzzy search (default, not case-sensitive)
### Regular expression search (not case-sensitive)
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

## Bugs
* Scrolling leaves a padding<br>
**Workaround:** Tapping on search (on mobile) or resizing the window (on desktop)

## Notes
* Notes placeholder text in the preview is from the *Nani the Fuck?* copypasta
* Scores and statuses are at random while the tracking feature of Tsuzuku is in development
