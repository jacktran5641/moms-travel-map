# Mom's Birthday Travel Map

## What this is

A birthday gift website for Tô Ánh Loan (born June 13, 1971 — 55 years old). It's a full-screen interactive world map that shows every country she has visited. Clicking a visited country opens a photo slideshow with Ken Burns animations, background music, thumbnail strip, collage view, and a progress bar. The site opens with a theatrical curtain intro and plays `music/intro.mp3`.

The site is entirely static — no build step, no framework, no server-side code. Open `index.html` directly in a browser, or run `python3 -m http.server 8080` from this directory.

## File overview

| File | Role |
|------|------|
| `index.html` | Single-page shell — all structure, no logic |
| `data.js` | **The only file you normally edit.** Lists visited countries, locations, photo folders, music files, and dates |
| `app.js` | All interactivity: map rendering (D3 + TopoJSON), intro, slideshow, collage, modals, music, keyboard nav |
| `style.css` | All styling. CSS variables in `:root` control the color palette |
| `photos/` | One subfolder per location (path must match `folder` key in `data.js`) |
| `music/` | One `.mp3` per location (filename must match `music` key in `data.js`); `intro.mp3` plays during the curtain intro |
| `generate_manifest.py` | Run this after adding photos to regenerate `photos/manifest.json` — required for the slideshow to find images when served as a static file without directory listing |
| `.github/workflows/update-manifest.yml` | GitHub Action that auto-regenerates the manifest on push |

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

## Adding photos to an existing location

Just drop image files (JPG, PNG, WEBP, AVIF, GIF, HEIC) or videos (MP4, MOV, WEBM, M4V) into the matching `photos/<folder>/` directory, then re-run the manifest generator.

## Color palette (CSS variables)

```
--bg:       #FAF8F5   warm off-white background
--gold:     #C9A84C   visited countries, accents, active elements
--gold-lt:  #E2C97E   lighter gold
--rose:     #D4868A   hover state on visited countries
--text:     #2C2826   near-black body text
--muted:    #9A948E   secondary / subdued text
--gray-map: #D8D3CD   unvisited countries
```

## Current travel data

| Country | Locations |
|---------|-----------|
| Vietnam | Phu Quoc (June 2019), Sapa |
| United States | San Jose (Aug 2022), Malibu (Aug 2022), Big Sur (Aug 2022) |
| Bahamas | Bahamas (July 2023) |

## Music files present

`music/intro.mp3`, `music/phu-quoc.mp3`, `music/sapa.mp3`, `music/malibu.MP3` — note: `san-jose.mp3` and `bahamas` music are referenced in `data.js` but files may be missing; the app silently skips missing music.

## Clarification questions / known gaps

- **Sapa date**: `data.js` has `date: ""` for Sapa — fill in the actual visit date when known.
- **Music files**: `san-jose.mp3` is listed in `data.js` but not present in `music/` — add if available.
- **More countries**: Are there other countries (France, Japan, etc.) to add? The map only shows what's in `data.js`.
- **Hosting**: Is this meant to be deployed somewhere (GitHub Pages, Vercel) so Mom can visit it via URL, or is it a one-time local presentation?
- **Intro music**: `music/intro.MP3` exists (uppercase extension) but `index.html` references `music/intro.mp3` (lowercase) — on case-sensitive file systems this will fail. Safe to rename the file to lowercase.
