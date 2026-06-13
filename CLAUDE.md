# Mom's Birthday Travel Map

## What this is

A birthday gift website for Tô Ánh Loan (born June 13, 1971 — 55 years old). It's a full-screen interactive world map that shows every country she has visited. Clicking a visited country opens a photo slideshow with Ken Burns animations, background music, thumbnail strip, collage view, and a progress bar. The site opens with a theatrical curtain intro and plays `music/intro.mp3`.

The site is entirely static — no build step, no framework, no server-side code. Open `index.html` directly in a browser, or run `python3 -m http.server 8080` from this directory.

**Live URL:** `https://jacktran5641.github.io/moms-travel-map`

## IMPORTANT — pushing rules

**Do not push after every change.** Batch all edits first and only push when the user explicitly says to. Each push triggers GitHub Actions (manifest regeneration) which can cause rebase conflicts on the next push.

When ready to push:
```bash
git stash && git pull --rebase && git stash pop && git push
```

## File overview

| File | Role |
|------|------|
| `index.html` | Single-page shell — all structure, no logic |
| `data.js` | **The only file you normally edit.** Lists visited countries, locations, photo folders, music files, and dates |
| `app.js` | All interactivity: map rendering (D3 + TopoJSON), intro, slideshow, collage, modals, music, keyboard nav, ending screen |
| `style.css` | All styling. CSS variables in `:root` control the color palette |
| `photos/` | One subfolder per location (path must match `folder` key in `data.js`); `ending.jpg` is the ending card photo |
| `music/` | One `.mp3` per location (filename must match `music` key in `data.js`); `intro.mp3` plays during the curtain intro |
| `generate_manifest.py` | Run this after adding photos to regenerate `photos/manifest.json` — required for the slideshow to find images on GitHub Pages (no directory listing) |
| `.github/workflows/update-manifest.yml` | GitHub Action that auto-regenerates the manifest on every push |
| `.nojekyll` | Tells GitHub Pages to skip Jekyll processing — required or CSS won't load |

## Adding a new country

1. Find the ISO numeric country code (Wikipedia: ISO 3166-1 numeric).
2. Add an entry to `TRAVEL_DATA` in `data.js`:
   ```js
   japan: {
     name: "Japan",
     countryCode: 392,
     locations: {
       "tokyo": { name: "Tokyo", folder: "japan/tokyo", music: "tokyo.mp3", date: "Tháng 3, 2024" }
     }
   }
   ```
3. Drop photos into `photos/japan/tokyo/`.
4. Drop the music file into `music/tokyo.mp3`.
5. Run `python3 generate_manifest.py` to update `photos/manifest.json`.
6. Tell the user to push when ready.

## Placeholder countries (no photos yet)

Countries that have been visited but have no photos/music yet are marked with `placeholder: true` on their location:
```js
"paris": { name: "Paris", folder: "france/paris", music: "", date: "", placeholder: true }
```

Placeholder behavior:
- Shown on the map with a **diagonal gold hatch pattern** instead of solid gold
- Listed in the places panel with a dashed bullet and greyed-out text — not clickable
- **Excluded from the ending card completion count** — the ending only triggers when all non-placeholder locations are viewed
- To "graduate" a placeholder to real: remove `placeholder: true`, add photos + music, re-run manifest

## Adding photos to an existing location

Drop image files (JPG, PNG, WEBP, AVIF, GIF, HEIC) or videos (MP4, MOV, WEBM, M4V) into the matching `photos/<folder>/` directory.

- **Local dev**: photos appear immediately on refresh (live directory scan, no manifest needed)
- **GitHub Pages**: run `python3 generate_manifest.py` then commit+push so the manifest is updated

**Case sensitivity warning**: GitHub Pages runs Linux (case-sensitive). File extensions must be lowercase (`.jpg` not `.JPG`, `.mp3` not `.MP3`). macOS ignores case but the live site won't.

## Features implemented

- **D3 zoom/pan** — scroll or pinch to zoom; drag to pan; click a visited country to zoom in
- **Places panel** — collapsible sidebar listing all countries/locations; real locations get a strikethrough when visited this session; placeholders shown with dashed bullet
- **Ending screen** — after all non-placeholder locations are viewed in a session, a 3D card animates in with a personal photo (`photos/ending.jpg`), Vietnamese birthday message, and signature "— Bi"
- **Volume slider** — in the slideshow top bar
- **Video support** — `.MOV`/`.MP4`/`.WEBM` files play inline in the slideshow; images are always sorted first
- **Music autoplay** — fires synchronously in the click handler (before async zoom) to stay within Chrome's user-gesture window; intro music uses a capture-phase listener; a `primeAudio` listener on first click unlocks `bg-music` for strict browsers (checks `musicEnabled` before pausing so it doesn't clobber a track that just started)
- **Ending music** — `intro.mp3` restarts when the ending card flips in; stops when the ending is closed
- **Skip-to-end button** — tiny `✦` in the footer for testing the ending screen without watching all slideshows
- **Placeholder map pattern** — diagonal hatch fill for countries with no photos yet

## Color palette (CSS variables)

```
--bg:       #FAF8F5   warm off-white background
--gold:     #C9A84C   visited countries, accents, active elements
--gold-lt:  #E2C97E   lighter gold
--rose:     #D4868A   hover state on visited countries / rose accents
--text:     #2C2826   near-black body text
--muted:    #9A948E   secondary / subdued text
--gray-map: #D8D3CD   unvisited countries
```

## Current travel data

| Country | Locations | Status |
|---------|-----------|--------|
| Vietnam | Phu Quoc (Tháng 6, 2019), Sapa (Tháng 9, 2025) | ✓ has photos + music |
| United States | San Jose, Malibu, Big Sur (Tháng 8, 2022) | ✓ has photos + music |
| Bahamas | Bahamas (Tháng 7, 2023) | ✓ has photos + music |
| France | Paris | placeholder |
| United Kingdom | London | placeholder |
| South Africa | South Africa | placeholder |
| Peru | Peru | placeholder |
| Argentina | Argentina | placeholder |
| Brazil | Brazil | placeholder |
| UAE | Dubai | placeholder |
| Singapore | Singapore | placeholder |
| Indonesia | Bali | placeholder |
| Australia | Australia | placeholder |
| Japan | Japan | placeholder |
| Germany | Germany | placeholder |

## Music files present

All 7 music files committed: `intro.mp3`, `phu-quoc.mp3`, `sapa.mp3`, `san-jose.mp3`, `malibu.mp3`, `big-sur.mp3`, `bahamas.mp3`

## Deployment

Hosted on GitHub Pages at `https://jacktran5641.github.io/moms-travel-map`.
Push to `main` → GitHub Actions regenerates `manifest.json` → Pages deploys automatically (~1–2 min).

Music autoplay works on the live HTTPS URL. In Brave, if music is blocked, click the lion icon → Shields → allow autoplay for the site.

## Known gaps

- `photos/vietnam/IMG_7689.jpeg` is a stray file in the Vietnam root folder (not linked to any location) — delete or move it
- Video audio in slideshow is unmuted by design (user preference) — can conflict with background music on video slides; to mute add `vid.muted = true` in `showSlide()` in `app.js`
