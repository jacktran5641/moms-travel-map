# Mom's Birthday Travel Map

## What this is

A birthday gift website for Tô Ánh Loan (born June 13, 1971 — 55 years old). It's a full-screen interactive world map that shows every country she has visited. Clicking a visited country opens a photo slideshow with Ken Burns animations, background music, thumbnail strip, collage view, and a progress bar. The site opens with a theatrical curtain intro and plays `music/intro.mp3`.

The site is entirely static — no build step, no framework, no server-side code. Open `index.html` directly in a browser, or run `python3 -m http.server 8080` from this directory.

**Live URL:** `https://jacktran5641.github.io/moms-travel-map`

## File overview

| File | Role |
|------|------|
| `index.html` | Single-page shell — all structure, no logic |
| `data.js` | **The only file you normally edit.** Lists visited countries, locations, photo folders, music files, and dates |
| `app.js` | All interactivity: map rendering (D3 + TopoJSON), intro, slideshow, collage, modals, music, keyboard nav, ending screen |
| `style.css` | All styling. CSS variables in `:root` control the color palette |
| `photos/` | One subfolder per location (path must match `folder` key in `data.js`); `ending.JPG` is the ending card photo |
| `music/` | One `.mp3` per location (filename must match `music` key in `data.js`); `intro.mp3` plays during the curtain intro |
| `generate_manifest.py` | Run this after adding photos to regenerate `photos/manifest.json` — required for the slideshow to find images on GitHub Pages (no directory listing) |
| `.github/workflows/update-manifest.yml` | GitHub Action that auto-regenerates the manifest on every push |

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
6. Commit and push — GitHub Actions will also regenerate the manifest automatically.

## Adding photos to an existing location

Drop image files (JPG, PNG, WEBP, AVIF, GIF, HEIC) or videos (MP4, MOV, WEBM, M4V) into the matching `photos/<folder>/` directory.

- **Local dev**: photos appear immediately on refresh (live directory scan, no manifest needed).
- **GitHub Pages**: run `python3 generate_manifest.py` then commit+push so the manifest is updated.

## Features implemented

- **D3 zoom/pan** — scroll or pinch to zoom; drag to pan; click a visited country to zoom in
- **Places panel** — collapsible sidebar listing all countries/locations; items get a strikethrough when visited this session
- **Ending screen** — after all locations are viewed in a session, a 3D card animates in with a personal photo (`photos/ending.JPG`), Vietnamese birthday message, and signature "— Bi"
- **Volume slider** — in the slideshow top bar
- **Video support** — `.MOV`/`.MP4`/`.WEBM` files play inline in the slideshow; images are always sorted first
- **Music autoplay fix** — music fires synchronously in the click handler (before async zoom) to stay within the browser's user-gesture window
- **Skip-to-end button** — tiny `✦` in the footer for testing the ending screen without watching all slideshows

## Color palette (CSS variables)

```
--bg:       #FAF8F5   warm off-white background
--gold:     #C9A84C   visited countries, accents, active elements
--gold-lt:  #E2C97E   lighter gold
--rose:     #D4868A   hover state on visited countries / rose accents
--rose-lt:  lighter rose used for ornaments
--text:     #2C2826   near-black body text
--muted:    #9A948E   secondary / subdued text
--gray-map: #D8D3CD   unvisited countries
```

## Current travel data

| Country | Locations | Music file |
|---------|-----------|------------|
| Vietnam | Phu Quoc (Tháng 6, 2019), Sapa (Tháng 9, 2025) | `phu-quoc.mp3`, `sapa.mp3` |
| United States | San Jose (Tháng 8, 2022), Malibu (Tháng 8, 2022), Big Sur (Tháng 8, 2022) | `san-jose.mp3`, `malibu.mp3`, `big-sur.mp3` |
| Bahamas | Bahamas (Tháng 7, 2023) | `bahamas.mp3` |

## Music files present

All 7 music files are present: `intro.mp3`, `phu-quoc.mp3`, `sapa.mp3`, `san-jose.mp3`, `malibu.mp3`, `big-sur.mp3`, `bahamas.mp3`

## Deployment

Hosted on GitHub Pages at `https://jacktran5641.github.io/moms-travel-map`.  
Push to `main` → GitHub Actions regenerates `manifest.json` → Pages deploys automatically (takes ~1–2 min).

Music autoplay works on the live HTTPS URL. In Brave, if music is blocked, click the lion icon → Shields → allow autoplay for the site.

## Known gaps / future ideas

- **More countries**: Are there other countries to add? The map only shows what's in `data.js`.
- **Stray file**: `photos/vietnam/IMG_7689.jpeg` is in the Vietnam root folder (not linked to any location) — delete or move it.
- **Video audio**: Slideshow videos play with audio unmuted; this can overlap with background music. To mute video audio, add `vid.muted = true` in `showSlide()` in `app.js`.
