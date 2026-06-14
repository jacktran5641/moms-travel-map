/* ─── App.js — Interactive Travel Map ──────────────────── */

const TOPO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const IMAGE_EXTS = /\.(jpe?g|png|gif|webp|avif|heic)$/i;
const VIDEO_EXTS = /\.(mp4|mov|webm|m4v)$/i;

// ── Build a lookup: ISO numeric code → country key ────────
function buildCodeMap() {
  const map = {};
  for (const [key, data] of Object.entries(TRAVEL_DATA)) {
    map[data.countryCode] = key;
  }
  return map;
}

// ── Intro ─────────────────────────────────────────────────
function runIntro() {
  const intro = document.getElementById('intro');
  setTimeout(() => intro.classList.add('open'), 200);

  const introMusic = document.getElementById('intro-music');
  introMusic.volume = 0.5;

  // Try immediate autoplay; if blocked, play on the very first gesture (capture
  // phase so it fires before any child handler like the skip button).
  // Both listeners share a named handler so they can be removed together, and
  // we skip the deferred play if the user's first gesture is the skip button
  // (otherwise the play() promise resolves after pause() on mobile, leaking audio).
  introMusic.play().catch(() => {
    function onFirstGesture(e) {
      document.removeEventListener('click', onFirstGesture, true);
      document.removeEventListener('touchstart', onFirstGesture, true);
      if (e.target && e.target.closest && e.target.closest('#intro-skip')) return;
      introMusic.play().catch(() => {});
    }
    document.addEventListener('click', onFirstGesture, { capture: true });
    document.addEventListener('touchstart', onFirstGesture, { capture: true, passive: true });
  });

  document.getElementById('intro-skip').addEventListener('click', closeIntro);
}

function fadeOutIntroMusic() {
  const audio = document.getElementById('intro-music');
  const steps = 30;
  const stepSize = audio.volume / steps;
  const fade = setInterval(() => {
    audio.volume = Math.max(0, audio.volume - stepSize);
    if (audio.volume <= 0) { audio.pause(); clearInterval(fade); }
  }, 50);
}

function closeIntro() {
  fadeOutIntroMusic();
  const intro = document.getElementById('intro');
  intro.classList.remove('open');
  intro.classList.add('closing');
  setTimeout(() => intro.classList.add('done'), 1100);
}

// ── Map zoom state ─────────────────────────────────────────
let mapPath, mapW, mapH, mapZoom, mapSvg;

function zoomToCountry(feature, callback) {
  const [[x0, y0], [x1, y1]] = mapPath.bounds(feature);
  const pad = 40;
  const bw = x1 - x0 + pad * 2, bh = y1 - y0 + pad * 2;
  const k = Math.min(mapW / bw, mapH / bh, 6);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const tx = mapW / 2 - k * cx, ty = mapH / 2 - k * cy;
  mapSvg.transition().duration(800).ease(d3.easeCubicInOut)
    .call(mapZoom.transform, d3.zoomIdentity.translate(tx, ty).scale(k))
    .on('end', callback || (() => {}));
}

function resetMapZoom() {
  mapSvg.transition().duration(600).ease(d3.easeCubicOut)
    .call(mapZoom.transform, d3.zoomIdentity);
}

// ── Init ──────────────────────────────────────────────────
async function init() {
  const codeMap = buildCodeMap();

  let world;
  try {
    const res = await fetch(TOPO_URL);
    if (!res.ok) throw new Error('Network response was not ok');
    world = await res.json();
  } catch (err) {
    document.getElementById('map-container').innerHTML =
      '<p style="text-align:center;color:#9A948E;padding:40px;font-style:italic">Không thể tải bản đồ. Vui lòng kiểm tra kết nối mạng và thử lại.</p>';
    return;
  }

  const countries = topojson.feature(world, world.objects.countries);

  const container = document.getElementById('map-container');
  mapW = container.clientWidth || 960;
  mapH = Math.round(mapW * 0.52);

  mapSvg = d3.select('#world-map')
    .attr('viewBox', `0 0 ${mapW} ${mapH}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  // Diagonal hatch pattern for placeholder countries (no photos yet)
  const defs = mapSvg.append('defs');
  const pattern = defs.append('pattern')
    .attr('id', 'placeholder-hatch')
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('width', 5).attr('height', 5)
    .attr('patternTransform', 'rotate(45)');
  pattern.append('rect').attr('width', 5).attr('height', 5).attr('fill', '#E2C97E').attr('fill-opacity', 0.18);
  pattern.append('line')
    .attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 5)
    .attr('stroke', '#C9A84C').attr('stroke-width', 1.4).attr('stroke-opacity', 0.5);

  const projection = d3.geoNaturalEarth1()
    .scale(mapW / 6.2)
    .translate([mapW / 2, mapH / 2]);

  mapPath = d3.geoPath().projection(projection);

  // Zoom & pan behavior
  mapZoom = d3.zoom()
    .scaleExtent([1, 8])
    .on('zoom', e => g.attr('transform', e.transform));

  mapSvg.call(mapZoom);

  const g = mapSvg.append('g').attr('id', 'map-g');

  const tooltip = document.getElementById('tooltip');

  g.selectAll('.country')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', d => {
      const key = codeMap[+d.id];
      if (!key) return 'country country-unvisited';
      const isPlaceholder = Object.values(TRAVEL_DATA[key].locations).every(l => l.placeholder);
      return isPlaceholder ? 'country country-placeholder' : 'country country-visited';
    })
    .attr('d', mapPath)
    .on('mouseenter', function(event, d) {
      const key = codeMap[+d.id];
      if (!key) return;
      tooltip.textContent = TRAVEL_DATA[key].name;
      tooltip.classList.add('visible');
    })
    .on('mousemove', function(event) {
      tooltip.style.left = (event.clientX + 14) + 'px';
      tooltip.style.top  = (event.clientY - 28) + 'px';
    })
    .on('mouseleave', function() {
      tooltip.classList.remove('visible');
    })
    .on('click', function(event, d) {
      if (event.defaultPrevented) return; // ignore drag-end clicks
      const key = codeMap[+d.id];
      if (!key) return;
      tooltip.classList.remove('visible');
      spawnSparkles(event.clientX, event.clientY);
      // Start music immediately while still inside the user-gesture context,
      // before the 800ms zoom animation expires the browser's autoplay permission.
      const locs = Object.values(TRAVEL_DATA[key].locations);
      if (locs.length === 1 && locs[0].music && !locs[0].placeholder) loadAndPlayMusic(locs[0].music);
      zoomToCountry(d, () => handleCountryClick(key));
    });

  // Pulsing rings on non-placeholder visited countries
  const pulseLayer = g.append('g').attr('class', 'pulse-layer').style('pointer-events', 'none');
  countries.features.forEach(feature => {
    const key = codeMap[+feature.id];
    if (!key) return;
    const isPlaceholder = Object.values(TRAVEL_DATA[key].locations).every(l => l.placeholder);
    if (isPlaceholder) return;
    const centroid = mapPath.centroid(feature);
    if (!centroid || isNaN(centroid[0]) || isNaN(centroid[1])) return;
    const pg = pulseLayer.append('g').attr('transform', `translate(${centroid[0]},${centroid[1]})`);
    pg.append('circle').attr('r', 4).attr('class', 'pulse-ring pulse-ring-1');
    pg.append('circle').attr('r', 4).attr('class', 'pulse-ring pulse-ring-2');
    pg.append('circle').attr('r', 1.8).attr('class', 'pulse-dot');
  });
}

// ── Country click handler ─────────────────────────────────
function handleCountryClick(countryKey) {
  const data = TRAVEL_DATA[countryKey];
  const locationKeys = Object.keys(data.locations);

  if (locationKeys.length === 1) {
    const locKey = locationKeys[0];
    const loc = data.locations[locKey];
    openSlideshow(countryKey, locKey, data.name, loc, loc.music || null);
  } else {
    openLocationPicker(data, countryKey);
  }
}

// ── Location Picker ───────────────────────────────────────
function openLocationPicker(countryData, countryKey) {
  document.getElementById('location-country-name').textContent = countryData.name;

  const list = document.getElementById('location-list');
  list.innerHTML = '';

  for (const [locKey, loc] of Object.entries(countryData.locations)) {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.className = 'location-btn';
    btn.textContent = loc.name;
    btn.addEventListener('click', () => {
      closeModal('location-modal');
      openSlideshow(countryKey, locKey, countryData.name, loc, loc.music || null);
    });
    li.appendChild(btn);
    list.appendChild(li);
  }

  openModal('location-modal');
}

// ── Scan a folder ─────────────────────────────────────────
async function scanFolder(folderPath) {
  const MEDIA_EXTS = /\.(jpe?g|png|gif|webp|avif|heic|mp4|mov|webm|m4v)$/i;

  // Always try live directory listing first (works with python -m http.server).
  // cache: 'no-store' ensures we never serve stale results when photos are added/removed.
  try {
    const res = await fetch(`photos/${folderPath}/`, { cache: 'no-store' });
    if (res.ok) {
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const files = [...doc.querySelectorAll('a[href]')]
        .map(a => decodeURIComponent(a.getAttribute('href')))
        .filter(name => MEDIA_EXTS.test(name));
      if (files.length > 0) return files;
    }
  } catch {}

  // Fallback: manifest.json (needed on static hosts where directory listing is off)
  try {
    const res = await fetch('photos/manifest.json', { cache: 'no-store' });
    if (res.ok) {
      const manifest = await res.json();
      return manifest[folderPath] || [];
    }
  } catch {}

  return [];
}

// ── Music ─────────────────────────────────────────────────
let musicEnabled = false;
let _currentMusicFile = null;

function loadAndPlayMusic(filename) {
  if (!filename) return;
  if (filename === _currentMusicFile && musicEnabled) return; // already playing this track
  _currentMusicFile = filename;
  const bgMusic = document.getElementById('bg-music');
  bgMusic.src = 'music/' + encodeURIComponent(filename);
  bgMusic.volume = +document.getElementById('sl-volume').value;
  bgMusic.play().catch(() => {});
  musicEnabled = true;
  document.getElementById('sl-music').classList.add('music-on');
}

function pauseMusic() {
  const bgMusic = document.getElementById('bg-music');
  bgMusic.pause();
  musicEnabled = false;
  _currentMusicFile = null;
  document.getElementById('sl-music').classList.remove('music-on');
}

function toggleMusic() {
  if (musicEnabled) {
    pauseMusic();
  } else {
    const bgMusic = document.getElementById('bg-music');
    bgMusic.play().catch(() => {});
    musicEnabled = true;
    document.getElementById('sl-music').classList.add('music-on');
  }
}

// ── Progress Bar ──────────────────────────────────────────
function resetProgress() {
  const fill = document.getElementById('slide-progress-fill');
  fill.style.animation = 'none';
  void fill.offsetWidth;
  fill.style.animation = 'progress-fill 5s linear forwards';
}

function pauseProgress() {
  document.getElementById('slide-progress-fill').style.animationPlayState = 'paused';
}

function resumeProgress() {
  document.getElementById('slide-progress-fill').style.animationPlayState = 'running';
}

// ── Slideshow State ───────────────────────────────────────
const KB_ANIMS = ['kb-zoom-in', 'kb-zoom-out', 'kb-pan-left', 'kb-pan-right'];

let ssMedia = []; // [{src, type}]
let ssIndex  = 0;
let ssTimer  = null;
let ssPlaying = true;
let ssOverlayTimer = null;
let ssLayerA, ssLayerB;
let ssActive = 'a';
let ssViewMode = 'slideshow';

function randomKB() {
  return KB_ANIMS[Math.floor(Math.random() * KB_ANIMS.length)];
}

function applyKB(layer) {
  KB_ANIMS.forEach(c => layer.classList.remove(c));
  void layer.offsetWidth;
  layer.classList.add(randomKB());
}

function showSlide(index, layerEl) {
  const media = ssMedia[index];
  layerEl.innerHTML = '';
  layerEl.style.backgroundImage = '';
  if (media.type === 'video') {
    const vid = document.createElement('video');
    vid.src = media.src;
    vid.autoplay = true;
    vid.loop = true;
    vid.playsInline = true;
    vid.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#0a0808';
    layerEl.appendChild(vid);
    KB_ANIMS.forEach(c => layerEl.classList.remove(c));
  } else {
    layerEl.style.backgroundImage = `url('${media.src}')`;
    applyKB(layerEl);
  }
  layerEl.classList.add('active');
}

function ssAdvance(delta) {
  ssIndex = (ssIndex + delta + ssMedia.length) % ssMedia.length;
  updateCounter();
  updateThumbActive();
  resetProgress();

  const nextLayer = ssActive === 'a' ? ssLayerB : ssLayerA;
  const currLayer = ssActive === 'a' ? ssLayerA : ssLayerB;

  showSlide(ssIndex, nextLayer);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      currLayer.classList.remove('active');
      // pause any video in the outgoing layer
      const outVid = currLayer.querySelector('video');
      if (outVid) outVid.pause();
      ssActive = ssActive === 'a' ? 'b' : 'a';
    });
  });
}

function updateCounter() {
  document.getElementById('slide-counter').textContent =
    ssMedia.length > 0 ? `${ssIndex + 1} / ${ssMedia.length}` : '';
}

function startTimer() {
  stopTimer();
  if (ssMedia.length > 1) {
    ssTimer = setInterval(() => ssAdvance(1), 5000);
  }
}

function stopTimer() {
  if (ssTimer) { clearInterval(ssTimer); ssTimer = null; }
}

function togglePlayPause() {
  ssPlaying = !ssPlaying;
  const btn = document.getElementById('sl-playpause');
  const bgMusic = document.getElementById('bg-music');
  if (ssPlaying) {
    btn.innerHTML = '&#10074;&#10074;';
    startTimer();
    resumeProgress();
    if (musicEnabled) bgMusic.play().catch(() => {});
  } else {
    btn.innerHTML = '&#9654;';
    stopTimer();
    pauseProgress();
    bgMusic.pause();
  }
}

// ── Overlay idle hide ─────────────────────────────────────
function showOverlay() {
  const overlay = document.getElementById('slide-overlay');
  overlay.classList.remove('hidden');
  clearTimeout(ssOverlayTimer);
  ssOverlayTimer = setTimeout(() => overlay.classList.add('hidden'), 3000);
}

// ── Thumbnails ────────────────────────────────────────────
function buildThumbs() {
  const strip = document.getElementById('slide-thumbs');
  strip.innerHTML = '';
  ssMedia.forEach((media, i) => {
    let el;
    if (media.type === 'video') {
      el = document.createElement('video');
      el.src = media.src;
      el.preload = 'metadata';
    } else {
      el = document.createElement('img');
      el.src = media.src;
    }
    el.className = 'thumb-img';
    if (i === 0) el.classList.add('active');
    el.addEventListener('click', () => jumpToSlide(i));
    strip.appendChild(el);
  });
}

function updateThumbActive() {
  document.querySelectorAll('.thumb-img').forEach((el, i) =>
    el.classList.toggle('active', i === ssIndex));
  const active = document.querySelector('.thumb-img.active');
  if (active) active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}

function jumpToSlide(idx) {
  stopTimer();
  ssIndex = (idx - 1 + ssMedia.length) % ssMedia.length;
  ssAdvance(1);
  if (ssPlaying) startTimer();
}

// ── Collage View ──────────────────────────────────────────
function switchView(mode) {
  ssViewMode = mode;
  document.getElementById('slideshow').classList.toggle('collage-mode', mode === 'collage');
  document.getElementById('sl-view-ss').classList.toggle('active', mode === 'slideshow');
  document.getElementById('sl-view-col').classList.toggle('active', mode === 'collage');
  if (mode === 'collage') {
    stopTimer();
    pauseProgress();
    buildCollage();
  } else {
    if (ssPlaying) {
      startTimer();
      resumeProgress();
    }
  }
}

function buildCollage() {
  const collage = document.getElementById('slide-collage');
  const inner = document.createElement('div');
  inner.className = 'collage-inner';
  ssMedia.forEach((media, i) => {
    const item = document.createElement('div');
    item.className = 'collage-photo-item';
    let el;
    if (media.type === 'video') {
      el = document.createElement('video');
      el.src = media.src;
      el.preload = 'metadata';
    } else {
      el = document.createElement('img');
      el.src = media.src;
      el.loading = 'lazy';
    }
    item.appendChild(el);
    item.addEventListener('click', () => { switchView('slideshow'); jumpToSlide(i); });
    inner.appendChild(item);
  });
  collage.innerHTML = '';
  collage.appendChild(inner);
}

// ── Places panel ──────────────────────────────────────────
function buildPlacesPanel() {
  const content = document.getElementById('places-content');
  for (const [cKey, country] of Object.entries(TRAVEL_DATA)) {
    const section = document.createElement('div');
    section.className = 'places-country';

    const h = document.createElement('p');
    h.className = 'places-country-name';
    h.textContent = country.name;
    section.appendChild(h);

    for (const [lKey, loc] of Object.entries(country.locations)) {
      const btn = document.createElement('button');
      btn.className = loc.placeholder ? 'places-loc-btn places-loc-placeholder' : 'places-loc-btn';
      btn.dataset.country = cKey;
      btn.dataset.loc = lKey;
      btn.textContent = loc.name;
      btn.addEventListener('click', () => {
        closeModal('location-modal');
        document.getElementById('places-panel').classList.remove('open');
        if (!loc.placeholder) openSlideshow(cKey, lKey, country.name, loc, loc.music || null);
      });
      section.appendChild(btn);
    }
    content.appendChild(section);
  }
}

// ── Ending screen ─────────────────────────────────────────
const ENDING_IMAGE = 'photos/ending.jpg';
let _endingQueued = false;

function showEnding() {
  document.getElementById('ending-photo').src = ENDING_IMAGE;
  document.getElementById('ending-modal').classList.add('open');
  document.body.style.overflow = 'hidden';

  const introMusic = document.getElementById('intro-music');
  introMusic.currentTime = 0;
  introMusic.volume = 0.5;
  introMusic.play().catch(() => {});

  // Reset card flip so it replays on repeated opens (skip button)
  const card = document.querySelector('.ending-card');
  card.style.animation = 'none';
  void card.offsetWidth;
  card.style.animation = '';

  // Reset and restagger text lines
  document.querySelectorAll('.ending-line').forEach((el, i) => {
    el.classList.remove('animate');
    void el.offsetWidth;
    el.style.animationDelay = `${0.6 + i * 0.65}s`;
    el.classList.add('animate');
  });

  // Reset close button
  const closeBtn = document.getElementById('ending-close');
  closeBtn.style.animation = 'none';
  void closeBtn.offsetWidth;
  closeBtn.style.animation = '';
}

function markVisited(countryKey, locKey) {
  const btn = document.querySelector(
    `.places-loc-btn[data-country="${countryKey}"][data-loc="${locKey}"]`
  );
  if (btn) btn.classList.add('visited');

  const total = Object.values(TRAVEL_DATA).reduce((n, c) =>
    n + Object.values(c.locations).filter(l => !l.placeholder).length, 0);
  const visited = document.querySelectorAll('.places-loc-btn:not(.places-loc-placeholder).visited').length;
  if (visited >= total && !_endingQueued) {
    _endingQueued = true;
    document.addEventListener('slideshowClosed', () => setTimeout(showEnding, 400), { once: true });
  }
}

// ── Open / Close Slideshow ────────────────────────────────
async function openSlideshow(countryKey, locKey, countryName, location, musicFile) {
  markVisited(countryKey, locKey);

  ssLayerA = document.getElementById('slide-a');
  ssLayerB = document.getElementById('slide-b');

  ssLayerA.classList.remove('active');
  ssLayerB.classList.remove('active');
  ssLayerA.innerHTML = '';
  ssLayerB.innerHTML = '';
  KB_ANIMS.forEach(c => { ssLayerA.classList.remove(c); ssLayerB.classList.remove(c); });

  document.getElementById('slide-country').textContent = countryName;
  document.getElementById('slide-location').textContent = location.name;
  document.getElementById('slide-date').textContent = location.date || '';
  document.getElementById('slide-counter').textContent = '';

  const existingEmpty = document.getElementById('slide-empty');
  if (existingEmpty) existingEmpty.remove();

  ssViewMode = 'slideshow';
  document.getElementById('slideshow').classList.remove('collage-mode');
  document.getElementById('sl-view-ss').classList.add('active');
  document.getElementById('sl-view-col').classList.remove('active');

  document.getElementById('slideshow').classList.add('open');
  document.body.style.overflow = 'hidden';

  document.getElementById('slide-overlay').classList.remove('hidden');
  clearTimeout(ssOverlayTimer);
  ssOverlayTimer = setTimeout(() => document.getElementById('slide-overlay').classList.add('hidden'), 3000);

  ssMedia = [];
  ssIndex = 0;
  ssPlaying = true;
  ssActive = 'a';
  document.getElementById('sl-playpause').innerHTML = '&#10074;&#10074;';
  stopTimer();

  if (musicFile) loadAndPlayMusic(musicFile);

  const files = await scanFolder(location.folder);
  ssMedia = files.map(f => ({
    src: `photos/${location.folder}/${encodeURIComponent(f)}`,
    type: VIDEO_EXTS.test(f) ? 'video' : 'image'
  }));
  ssMedia.sort((a, b) => {
    if (a.type === b.type) return 0;
    return a.type === 'image' ? -1 : 1;
  });

  if (ssMedia.length === 0) {
    const empty = document.createElement('div');
    empty.id = 'slide-empty';
    empty.innerHTML = `
      <div class="empty-icon">✦</div>
      <div class="empty-text">Ảnh sắp có mặt...</div>
      <div class="empty-sub">Kỷ niệm sẽ được thêm vào</div>`;
    document.getElementById('slideshow').appendChild(empty);
    return;
  }

  updateCounter();
  buildThumbs();
  resetProgress();

  showSlide(0, ssLayerA);
  ssActive = 'a';

  // Preload second item if it's an image
  if (ssMedia.length > 1 && ssMedia[1].type === 'image') {
    const img = new Image();
    img.src = ssMedia[1].src;
  }

  // Lazy-preload remaining images after 2s
  if (ssMedia.length > 2) {
    setTimeout(() => {
      ssMedia.slice(2).forEach(m => {
        if (m.type === 'image') { const i = new Image(); i.src = m.src; }
      });
    }, 2000);
  }

  startTimer();
}

function closeSlideshow() {
  stopTimer();
  clearTimeout(ssOverlayTimer);
  pauseMusic();
  resetMapZoom();
  ssViewMode = 'slideshow';
  document.getElementById('slideshow').classList.remove('open');
  document.getElementById('slideshow').classList.remove('collage-mode');
  document.body.style.overflow = '';
  const existingEmpty = document.getElementById('slide-empty');
  if (existingEmpty) existingEmpty.remove();
  if (ssLayerA) ssLayerA.innerHTML = '';
  if (ssLayerB) ssLayerB.innerHTML = '';
  ssMedia = [];
  ssLayerA = ssLayerB = null;
  document.dispatchEvent(new Event('slideshowClosed'));
}

// ── Modal helpers ─────────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
  resetMapZoom();
}

// ── Stats Counter ─────────────────────────────────────────
function renderStats() {
  const birth = new Date(1971, 5, 13); // June 13, 1971
  const now = new Date();
  const age = Math.floor((now - birth) / (365.25 * 24 * 3600 * 1000));
  const countries = Object.keys(TRAVEL_DATA).length;
  const locs = Object.values(TRAVEL_DATA)
    .reduce((n, c) => n + Object.keys(c.locations).length, 0);
  document.getElementById('header-stats').innerHTML =
    `<span class="stat-num">${age}</span><span class="stat-lbl"> năm</span>` +
    `<span class="stat-sep">✦</span>` +
    `<span class="stat-num">${countries}</span><span class="stat-lbl"> quốc gia</span>` +
    `<span class="stat-sep">✦</span>` +
    `<span class="stat-num">${locs}</span><span class="stat-lbl"> địa điểm</span>`;
}

// ── Sparkle burst on country click ────────────────────────
function spawnSparkles(x, y) {
  const shapes = ['✦', '✧', '◆', '✦', '·', '★'];
  const colors = ['#C9A84C', '#E2C97E', '#D4868A', '#E8AAAD', '#fffbe8'];
  const count = 12;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = 'sparkle-particle';
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
    const dist  = 55 + Math.random() * 90;
    const dur   = 0.5 + Math.random() * 0.45;
    el.textContent = shapes[Math.floor(Math.random() * shapes.length)];
    el.style.cssText = [
      `left:${x}px`, `top:${y}px`,
      `color:${colors[Math.floor(Math.random() * colors.length)]}`,
      `font-size:${10 + Math.random() * 10}px`,
      `--spark-dx:${Math.cos(angle) * dist}px`,
      `--spark-dy:${Math.sin(angle) * dist}px`,
      `--spark-dur:${dur}s`,
    ].join(';');
    document.body.appendChild(el);
    setTimeout(() => el.remove(), (dur + 0.1) * 1000);
  }
}

// ── Falling Petals ────────────────────────────────────────
function createPetals() {
  const container = document.getElementById('petals-container');
  const colors = [
    'rgba(212,134,138,0.50)', 'rgba(232,170,173,0.42)',
    'rgba(226,201,126,0.38)', 'rgba(201,168,76,0.32)'
  ];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    const size = 7 + Math.random() * 10;
    p.style.width  = `${size}px`;
    p.style.height = `${(size * 1.6).toFixed(1)}px`;
    p.style.left   = `${Math.random() * 100}%`;
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDuration = `${10 + Math.random() * 14}s`;
    p.style.animationDelay   = `${-(Math.random() * 20)}s`;
    p.style.setProperty('--drift', `${-60 + Math.random() * 120}px`);
    container.appendChild(p);
  }
}

// ── Event Listeners ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderStats();
  buildPlacesPanel();
  createPetals();
  runIntro();

  // Prime bgMusic on first click so Brave/strict browsers allow play() after async delays.
  // (Intro music is handled separately in runIntro with capture-phase listeners.)
  document.addEventListener('click', function primeAudio() {
    const bgMusic = document.getElementById('bg-music');
    bgMusic.play().then(() => { if (!musicEnabled) bgMusic.pause(); }).catch(() => {});
  }, { once: true });

  document.getElementById('places-toggle').addEventListener('click', () => {
    document.getElementById('places-panel').classList.toggle('open');
  });

  document.getElementById('ending-close').addEventListener('click', () => {
    document.getElementById('ending-modal').classList.remove('open');
    document.body.style.overflow = '';
    const introMusic = document.getElementById('intro-music');
    introMusic.pause();
    introMusic.currentTime = 0;
  });

  document.getElementById('skip-to-end').addEventListener('click', showEnding);

  document.getElementById('close-location-modal').addEventListener('click', () => closeModal('location-modal'));

  document.getElementById('location-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal('location-modal');
  });

  // Slideshow controls
  document.getElementById('sl-close').addEventListener('click', closeSlideshow);

  document.getElementById('sl-prev').addEventListener('click', () => {
    if (ssMedia.length <= 1) return;
    stopTimer();
    ssAdvance(-1);
    if (ssPlaying) startTimer();
  });

  document.getElementById('sl-next').addEventListener('click', () => {
    if (ssMedia.length <= 1) return;
    stopTimer();
    ssAdvance(1);
    if (ssPlaying) startTimer();
  });

  document.getElementById('sl-playpause').addEventListener('click', togglePlayPause);
  document.getElementById('sl-view-ss').addEventListener('click', () => switchView('slideshow'));
  document.getElementById('sl-view-col').addEventListener('click', () => switchView('collage'));
  document.getElementById('sl-music').addEventListener('click', toggleMusic);
  document.getElementById('sl-volume').addEventListener('input', function() {
    document.getElementById('bg-music').volume = +this.value;
  });

  // Overlay reveal on mouse/touch activity
  const ss = document.getElementById('slideshow');
  ss.addEventListener('mousemove', showOverlay);
  ss.addEventListener('touchstart', showOverlay, { passive: true });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (document.getElementById('slideshow').classList.contains('open')) {
      if (e.key === 'ArrowLeft')  { stopTimer(); ssAdvance(-1); if (ssPlaying) startTimer(); }
      if (e.key === 'ArrowRight') { stopTimer(); ssAdvance(1);  if (ssPlaying) startTimer(); }
      if (e.key === ' ')          { e.preventDefault(); togglePlayPause(); }
      if (e.key === 'Escape')     closeSlideshow();
    } else {
      if (e.key === 'Escape') closeModal('location-modal');
    }
  });

  init();
});
