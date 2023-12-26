# [**Tsuzuku**](https://kuzutsu.github.io/tsuzuku/)
Also known as *There's No Anime Tracking App Out There That's Right For Me, So I Decided to Create My Own Even Though I Suck at Coding and Call It "Tsuzuku" Because I Also Suck at Naming*


### Features
* **Index**<br>Tsuzuku is mobile-friendly, offline-ready, and installable as a PWA. Everything is cached immediately upon first launch, except thumbnails, which are cached only as they show up in the viewport. Thus, only thumbnails that appear online will load offline, but the functionality of the app remains the same.

* **Tracker**<br>There's no need to create an account to track progress in Tsuzuku as everything is saved locally in the browser. Still, make sure to have backups all the time as updates may break the app. **Clearing site data will clear all progress.** Although an option to export is available, there won't be a feature to sync it online.

* **Games**<br>Tsuzuku includes [**Crop**](https://kuzutsu.github.io/tsuzuku/games/crop/), [**Quiz**](https://kuzutsu.github.io/tsuzuku/games/quiz/), and [**Odd One Out**](https://kuzutsu.github.io/tsuzuku/games/odd-one-out/).


### Third-party
* [**anime-offline-database**](https://github.com/manami-project/anime-offline-database) (metadata)
* [**Tabulator**](https://github.com/olifolkerd/tabulator) (table)
* [**Fuse**](https://github.com/krisk/fuse) (fuzzy matching)
* [**Roboto**](https://github.com/googlefonts/roboto) (font)
* [**Material Symbols**](https://github.com/google/material-design-icons) (icons)


<details>
<summary>To be continued...</summary>


## Features
### Search filters
* Click/tap on help icon


### Mass change status
* Click/tap on thumbnail/checkbox to select
* To select range, hold `Shift` on desktop or hold down thumbnail/checkbox on mobile


### Export
* File is in MyAnimeList XML format
* Skipped titles will have a Dropped status with 0 progress


### Import
* Supports files in MyAnimeList XML format
* Only `series_animedb_id`, `my_status`, `my_watched_episodes`, and `my_times_watched` will be imported
* `update_on_import` will be ignored
* Saved data will be overwritten
 </details>