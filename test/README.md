*Source code in chaos<br>
Will update from time to time<br>
What is this haiku?*

*Also this README<br>
Will update from time to time<br>
Another haiku*

# Tsuzuku-α
> Scores and statuses are at random while the tracking feature of Tsuzuku is in development.

Tsuzuku is useful for anime watching challenges.

Tsuzuku has two searches:
* **Fuzzy search** (default)<br>
Uses [Fuse](https://github.com/krisk/fuse)

* **Regular expression search**

Both searches are **not case-sensitive**.

Using regular expressions, imagine searching for a title that:
* only has 13 characters (`^.{13}$`)
* only has 8 *i*'s (`^[^i]*(?:i[^i]*){8}$`)
* has no spaces (`^[\S]+$`)
* has no vowels (`^[^aeiou]+$`)
* ends with a number (`^.*[\d]$`)
* has *a* on the third position and *e* on the sixth (`^..a..e.*$`)

## Features
* Randomly select *n* titles

## Bugs
* Scrolling on mobile leaves a padding<br>
***Workaround:** Tapping on search*
