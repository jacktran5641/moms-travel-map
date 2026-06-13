/* ─── App.js — Interactive Travel Map ──────────────────── */

// CDN urls
const TOPO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// ── State ─────────────────────────────────────────────────
let currentPhotos = [];  // photos currently shown in gallery
let lightboxIndex = 0;   // which photo is open in lightbox

// ── Build a lookup: ISO numeric code → country key ────────
function buildCodeMap() {
  const map = {};
  for (const [key, data] of Object.entries(TRAVEL_DATA)) {
    map[data.countryCode] = key;
  }
  return map;
}

// ── Init ──────────────────────────────────────────────────
async function init() {
  const codeMap = buildCodeMap();

  // Fetch topojson
  let world;
  try {
    const res = await fetch(TOPO_URL);
    if (!res.ok) throw new Error('Network response was not ok');
    world = await res.json();
  } catch (err) {
    document.getElementById('map-container').innerHTML =
      '<p style="text-align:center;color:#9A948E;padding:40px;font-style:italic">Unable to load map. Please check your internet connection and refresh.</p>';
    return;
  }

  const countries = topojson.feature(world, world.objects.countries);

  // ── D3 Setup ─────────────────────────────────────────────
  const container = document.getElementById('map-container');
  const W = container.clientWidth || 960;
  const H = Math.round(W * 0.52);

  const svg = d3.select('#world-map')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  const projection = d3.geoNaturalEarth1()
    .scale(W / 6.2)
    .translate([W / 2, H / 2]);

  const path = d3.geoPath().projection(projection);

  const tooltip = document.getElementById('tooltip');

  // ── Render countries ──────────────────────────────────────
  svg.selectAll('.country')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', d => {
      const key = codeMap[+d.id];
      return key ? 'country country-visited' : 'country country-unvisited';
    })
    .attr('d', path)
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
      const key = codeMap[+d.id];
      if (!key) return;
      tooltip.classList.remove('visible');
      handleCountryClick(key);
    });
}

// ── Country click handler ─────────────────────────────────
function handleCountryClick(countryKey) {
  const data = TRAVEL_DATA[countryKey];
  const locationKeys = Object.keys(data.locations);

  if (locationKeys.length === 1) {
    // Single location — open gallery directly
    const loc = data.locations[locationKeys[0]];
    openGallery(data.name, loc);
  } else {
    // Multiple locations — show picker first
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
      openGallery(countryData.name, loc);
    });
    li.appendChild(btn);
    list.appendChild(li);
  }

  openModal('location-modal');
}

// ── Photo manifest (populated once on first gallery open) ────
let _manifest = null;

async function getManifest() {
  if (_manifest) return _manifest;
  try {
    const res = await fetch('photos/manifest.json');
    if (res.ok) { _manifest = await res.json(); return _manifest; }
  } catch {}
  _manifest = {};
  return _manifest;
}

// ── Scan a folder: manifest first, then directory listing ────
async function scanFolder(folderPath) {
  const IMAGE_EXTS = /\.(jpe?g|png|gif|webp|avif|heic)$/i;

  // 1. Try manifest.json (works on GitHub Pages)
  const manifest = await getManifest();
  if (manifest[folderPath]) return manifest[folderPath];

  // 2. Fall back to Python directory listing (works locally)
  try {
    const res = await fetch(`photos/${folderPath}/`);
    if (!res.ok) return [];
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return [...doc.querySelectorAll('a[href]')]
      .map(a => decodeURIComponent(a.getAttribute('href')))
      .filter(name => IMAGE_EXTS.test(name));
  } catch {
    return [];
  }
}

// ── Gallery ───────────────────────────────────────────────
async function openGallery(countryName, location) {
  document.getElementById('gallery-country-label').textContent = countryName;
  document.getElementById('gallery-location-title').textContent = location.name;

  const grid = document.getElementById('photo-grid');
  grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✦</div><div class="empty-state-text">Loading...</div></div>';

  openModal('gallery-modal');

  const files = await scanFolder(location.folder);

  grid.innerHTML = '';

  if (files.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">✦</div>
        <div class="empty-state-text">Photos coming soon...</div>
        <div class="empty-state-sub">Memories to be added</div>
      </div>`;
    currentPhotos = [];
  } else {
    currentPhotos = files.map(f => `photos/${location.folder}/${f}`);
    currentPhotos.forEach((src, idx) => {
      const item = document.createElement('div');
      item.className = 'photo-item';
      const img = document.createElement('img');
      img.src = src;
      img.alt = `${location.name} — photo ${idx + 1}`;
      img.loading = 'lazy';
      item.appendChild(img);
      item.addEventListener('click', () => openLightbox(idx));
      grid.appendChild(item);
    });
  }
}

// ── Lightbox ──────────────────────────────────────────────
function openLightbox(idx) {
  lightboxIndex = idx;
  updateLightbox();
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function updateLightbox() {
  const img = document.getElementById('lightbox-img');
  img.src = currentPhotos[lightboxIndex];
  document.getElementById('lb-counter').textContent =
    `${lightboxIndex + 1} / ${currentPhotos.length}`;
}

function lightboxPrev() {
  lightboxIndex = (lightboxIndex - 1 + currentPhotos.length) % currentPhotos.length;
  updateLightbox();
}

function lightboxNext() {
  lightboxIndex = (lightboxIndex + 1) % currentPhotos.length;
  updateLightbox();
}

// ── Modal helpers ─────────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}

// ── Event Listeners ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Close buttons
  document.getElementById('close-location-modal').addEventListener('click', () => closeModal('location-modal'));
  document.getElementById('close-gallery-modal').addEventListener('click', () => closeModal('gallery-modal'));

  // Backdrop clicks
  document.getElementById('location-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal('location-modal');
  });
  document.getElementById('gallery-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal('gallery-modal');
  });

  // Lightbox controls
  document.getElementById('lb-close').addEventListener('click', closeLightbox);
  document.getElementById('lb-prev').addEventListener('click', lightboxPrev);
  document.getElementById('lb-next').addEventListener('click', lightboxNext);
  document.getElementById('lightbox').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeLightbox();
  });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (document.getElementById('lightbox').classList.contains('open')) {
      if (e.key === 'ArrowLeft')  lightboxPrev();
      if (e.key === 'ArrowRight') lightboxNext();
      if (e.key === 'Escape')     closeLightbox();
    } else {
      if (e.key === 'Escape') {
        closeModal('gallery-modal');
        closeModal('location-modal');
      }
    }
  });

  // Start
  init();
});
