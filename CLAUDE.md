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

## Compressing photos before pushing

**Always compress new photos before committing.** Raw iPhone photos are 4–10 MB each and load very slowly on mobile. All existing photos were compressed in June 2026 (211 MB → 87 MB).

Run this command from the project root after dropping in new photos, before `git add`:

```bash
find photos/ -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) ! -name "ending*" | while read f; do
  sips -Z 1920 --setProperty formatOptions 80 "$f" --out "$f" > /dev/null 2>&1
done
```

- `-Z 1920` — scales the longest dimension down to 1920px max (preserves aspect ratio)
- `formatOptions 80` — JPEG quality 80%, visually indistinguishable on screen
- `ending*` is excluded — `ending.jpg` is the full-bleed ending card and should stay full quality
- This is a one-time operation per batch; after pushing the compressed files live on GitHub forever
- Keep original photos backed up elsewhere (iCloud / phone) before compressing — it's irreversible

## Features implemented

- **D3 zoom/pan** — scroll or pinch to zoom; drag to pan; click a visited country to zoom in
- **Places panel** — collapsible sidebar listing all countries/locations; real locations get a strikethrough when visited this session; sub-city locations (e.g. Phu Quoc, Sapa) are also listed and cross off individually; placeholders shown with dashed bullet, not clickable
- **Ending screen** — after all non-placeholder locations are viewed in a session, a 3D card animates in with a personal photo (`photos/ending.jpg`), Vietnamese birthday message, and signature "— Bi"
- **Ending music** — `music/ending.mp3` plays when the ending card flips in; stops when closed
- **Volume slider** — in the slideshow top bar
- **Video support** — `.MOV`/`.MP4`/`.WEBM` files play inline in the slideshow; images are always sorted first
- **Music autoplay** — fires synchronously in the click handler (before async zoom) to stay within Chrome's user-gesture window; intro music gated behind gift-box click (user gesture) so it plays immediately on all browsers including iOS
- **Intro music stop (iOS fix)** — fade uses a tick counter (not `audio.volume`) as the exit condition; `audio.volume` is read-only on iOS so checking it would loop forever; all audio calls wrapped in try/catch
- **Skip-to-end button** — tiny `✦` in the footer for testing the ending screen without watching all slideshows
- **Placeholder map pattern** — diagonal hatch fill for countries with no photos yet
- **Botanical vine decoration** — fixed SVG vines on left and right edges; opacity is on the `<svg>` attribute (not CSS) to avoid compositing-layer z-index issues that would paint the vine above higher z-index elements
- **Sparkle burst** — clicking a visited country spawns 12 animated sparkle particles from the click point
- **Pulse rings** — gold pulsing rings animate outward from each visited country's centroid on the map
- **Gift-box intro gate** — replaces the old "Bắt đầu" button; clicking the gift box pops the lid (CSS animation), plays intro music, then opens the curtains
- **Map hint** — bobbing rose-colored italic text prompting the user to visit all locations; fixed top-left on desktop, top-center on mobile

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

| File | Used for |
|------|----------|
| `intro.mp3` | Curtain intro (plays on gift-box click) |
| `ending.mp3` | Ending card screen |
| `phu-quoc.mp3` | Vietnam → Phu Quoc |
| `sapa.mp3` | Vietnam → Sapa |
| `san-jose.mp3` | USA → San Jose |
| `malibu-2.mp3` | USA → Malibu (renamed from `malibu.mp3` to bust GitHub Pages CDN cache) |
| `big-sur.mp3` | USA → Big Sur |
| `bahamas.mp3` | Bahamas |

**CDN cache note**: GitHub Pages caches aggressively by filename. If you replace a music file and the old version keeps playing on the live site, rename the file (e.g. `song-2.mp3`) and update the `music` key in `data.js` to match.

## Deployment

Hosted on GitHub Pages at `https://jacktran5641.github.io/moms-travel-map`.
Push to `main` → GitHub Actions regenerates `manifest.json` → Pages deploys automatically (~1–2 min).

Music autoplay works on the live HTTPS URL. In Brave, if music is blocked, click the lion icon → Shields → allow autoplay for the site.

## Known gaps / gotchas

- `photos/vietnam/IMG_7689.jpeg` is a stray file in the Vietnam root folder (not linked to any location) — delete or move it
- Video audio in slideshow is unmuted by design (user preference) — can conflict with background music on video slides; to mute add `vid.muted = true` in `showSlide()` in `app.js`
- Vine opacity must stay on the `<svg opacity="0.6">` attribute, not on the CSS `.vine` rule — CSS opacity creates a compositing layer that paints above higher z-index siblings (the places panel toggle was invisible until this was fixed)
- `.vine-right` is offset `right: 36px` (not `right: 0`) to give the places panel toggle physical clearance
