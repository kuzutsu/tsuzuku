# Tsuzuku
[__Tsuzuku__](https://kuzutsu.github.io/tsuzuku/) is an IndexedDB-based anime tracker<a id="1" href="#ref-1"><sup>[1]</sup></a> that uses MyAnimeList and Kitsu metadata from the [anime-offline-database](https://github.com/manami-project/anime-offline-database).

![Preview](https://raw.githubusercontent.com/kuzutsu/tsuzuku/master/preview.png)

## Features
* Dark mode
* Dominant-color progress bar for titles currently watching
* Export data in MyAnimeList XML format
* Find relations of completed titles<a id="2" href="#ref-2"><sup>[2]</sup></a>
* Import data from MyAnimeList or Kitsu XML<a id="3" href="#ref-3"><sup>[3]</sup></a><a id="4" href="#ref-4"><sup>[4]</sup></a>
* Letter-by-letter sorting
* Nest titles
* Select random title from planning-to-watch list<a id="5" href="#ref-5"><sup>[5]</sup></a>
* Warn completed titles with mismatched episode count

[Roadmap](https://github.com/kuzutsu/tsuzuku/projects/1)

## Dependencies
* anime-offline-database
* [Color Thief](https://github.com/lokesh/color-thief)
* [jQuery](https://github.com/jquery/jquery)<a id="6" href="#ref-6"><sup>[6]</sup></a>

## Notes
1. <a id="ref-1" href="#1">↑</a> Data is saved locally; no sign-up required
1. <a id="ref-2" href="#2">↑</a> By clicking on the Type column
1. <a id="ref-3" href="#3">↑</a> Will overwrite existing data
1. <a id="ref-4" href="#4">↑</a> Will only import `<series_animedb_id>`, `<series_title>`, `<series_type>`, `<series_episodes>`, `<my_watched_episodes>`, `<my_status>`, and `<my_comments>`
1. <a id="ref-5" href="#5">↑</a> By double-clicking on the Planning tab
1. <a id="ref-6" href="#6">↑</a> Will be removed
