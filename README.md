# [Tsuzuku](https://kuzutsu.github.io/tsuzuku/)
**Tsuzuku** is an index for the [anime-offline-database](https://github.com/manami-project/anime-offline-database), with games included.

> For now, only entries from MyAnimeList are used by the app.

 There's no need to create an account to track progress in Tsuzuku as everything is saved locally in the browser. However, tracking without any backup is **dangerous** as updates may break the app. Although an option to export progress is available, there's no feature to sync progress online. **Clearing site data will also clear progress.** By using Tsuzuku as a tracker, you agree that you're some sort of a daredevil.

## Dependencies
* anime-offline-database
* [Fuse](https://github.com/krisk/fuse)
* [Roboto](https://github.com/googlefonts/roboto)
* [Tabulator](https://github.com/olifolkerd/tabulator)

<details>
<summary><i>To be continued...</i></summary>

## Features
### Auto-update
Checks for updates every app launch and downloads them when available

### Offline-ready
Install as PWA

While offline, thumbnails will not load unless cached

### Search qualifiers
| Qualifier | Example |
| --- | --- |
| `alt:false` | [**life alt:false**](https://kuzutsu.github.io/tsuzuku/?query=life%2520alt%253Afalse%2520) matches canonical titles with "life" (matches *ReLIFE* but **not** *Nichijou*)<br><br>[**world alt:false**](https://kuzutsu.github.io/tsuzuku/?query=world%2520alt%253Afalse%2520) matches canonical titles with "world" (matches *Accel World* but **not** *Re:Zero kara Hajimeru Isekai Seikatsu*)
| `is:dead` | [**is:dead**](https://kuzutsu.github.io/tsuzuku/?query=is%253Adead%2520) matches saved titles removed from the database
| `is:mismatched` | [**is:mismatched**](https://kuzutsu.github.io/tsuzuku/?query=is%253Amismatched%2520) matches completed titles with progress different from number of episodes
| `is:new` | [**is:new**](https://kuzutsu.github.io/tsuzuku/?query=is%253Anew%2520) matches new database entries since last online
| `is:ongoing` | [**is:ongoing**](https://kuzutsu.github.io/tsuzuku/?query=is%253Aongoing%2520) matches ongoing titles
| `is:selected` | [**is:selected**](https://kuzutsu.github.io/tsuzuku/?query=is%253Aselected%2520) matches selected titles
| <code>random:<i>NUMBER</i></code> | [**random:5**](https://kuzutsu.github.io/tsuzuku/?query=random%253A5%2520) randomly selects five titles<br><br>[**magical random:10**](https://kuzutsu.github.io/tsuzuku/?query=magical%2520random%253A10%2520) randomly selects 10 titles with "magical"
| `regex:true` | [**senpai$ regex:true**](https://kuzutsu.github.io/tsuzuku/?query=senpai%2524%2520regex%253Atrue%2520) matches titles ending with "senpai" (matches *Tejina-senpai* and *Seishun Buta Yarou wa Bunny Girl Senpai no Yume wo Minai*)<br><br>[**senpai$ regex:true alt:false**](https://kuzutsu.github.io/tsuzuku/?query=senpai%2524%2520regex%253Atrue%2520alt%253Afalse%2520) matches canonical titles ending with "senpai" (matches *Tejina-senpai* but **not** *Seishun Buta Yarou wa Bunny Girl Senpai no Yume wo Minai*)

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
* `tag:` (replace spaces with `_`, start with `-` to exclude, [tags supported](https://kuzutsu.github.io/tsuzuku/tags/))
* `year:` (can use `tba`)

Examples:
* Has 13 episodes ([`episodes:13`](https://kuzutsu.github.io/tsuzuku/?query=episodes%253A13))
* Has progress higher than 4 but lower than 70% ([`progress:>4&<70%`](https://kuzutsu.github.io/tsuzuku/?query=progress%253A%253E4%2526%253C70%2525))
* Based on a manga and comedy ([`tag:based_on_a_manga&comedy`](https://kuzutsu.github.io/tsuzuku/?query=tag%253Abased_on_a_manga%2526comedy))
* Based on a light novel but not isekai ([`tag:based_on_a_light_novel&-isekai`](https://kuzutsu.github.io/tsuzuku/?query=tag%253Abased_on_a_light_novel%2526-isekai))
* Before 2019 ([`year:<2019`](https://kuzutsu.github.io/tsuzuku/?query=year%253A%253C2019))

### Mass change status
Click on thumbnail to select

To select range, hold `Shift` on desktop or hold down thumbnail on mobile

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
* Skipped titles will have a Dropped status with 0 progress

### Import
Supports files in MyAnimeList XML or AniList GDPR JSON format

| Site | URL |
| --- | --- |
| **MyAnimeList** | https://myanimelist.net/panel.php?go=export |
| **Kitsu** | https://kitsu.io/settings/exports |
| **AniList** | https://anilist.co/gdpr/download |

#### Disclaimer
* Only status and progress will be imported
* For MyAnimeList XML, `update_on_import` will be ignored
* For AniList GDPR JSON, titles not in MyAnimeList will be ignored
* Saved data will be overwritten
 </details>