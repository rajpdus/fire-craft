/* global maplibregl, deck */

// ------------- CONFIG -----------------
const LA_BOUNDS = [[-119.0, 33.6], [-117.6, 34.6]];

// Paths point to the data already present in firecast-viewer/static/
const basePath = './static/';

const datasetArray = [
  {url: basePath + 'pred_la_day1.geojson', label: '2020-01-01', bounds: LA_BOUNDS},
  {url: basePath + 'pred_la_day2.geojson', label: '2020-01-02', bounds: LA_BOUNDS},
  {url: basePath + 'pred_la_day3.geojson', label: '2020-01-03', bounds: LA_BOUNDS},
  {url: basePath + 'pred_la_day4.geojson', label: '2020-01-04', bounds: LA_BOUNDS},
  {url: basePath + 'pred_la_day5.geojson', label: '2020-01-05', bounds: LA_BOUNDS}
];

// ------------- UI ELEMENTS -------------
const slider = document.getElementById('time-slider');
const playBtn = document.getElementById('play-btn');
const dateLabel = document.getElementById('date-label');
slider.max = datasetArray.length - 1;
slider.value = 0;

let currentIndex = 0;
let playInterval = null;
let currentData = [];
let currentDataDense = [];

// load city data once
let cityData = [];
fetch(basePath + 'ca_cities.geojson')
  .then(r=>r.json())
  .then(json=>{
    cityData = json.features.map(f=>({position:f.geometry.coordinates, name:f.properties.city}));
    updateOverlay();
  });

// ------------- MAP & DECK ------------
const map = new maplibregl.Map({
  container: 'map',
  style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  center: [-118.25, 34.15],
  zoom: 8,
  maxZoom: 14
});

map.addControl(new maplibregl.NavigationControl(), 'top-right');

// Create overlay
const overlay = new deck.MapboxOverlay({layers: []});
map.addControl(overlay);

// Helper to transform GeoJSON Feature -> {position, prob}
function featureToPoint(f) {
  return {
    position: f.geometry.coordinates,
    prob: f.properties.prob
  };
}

// Helper to create many points around a centroid for visual density
function jitterPoints(point, count) {
  const res = [];
  for (let i = 0; i < count; i++) {
    const dx = (Math.random() - 0.5) * 0.01; // ~0.01 deg ≈ 1 km
    const dy = (Math.random() - 0.5) * 0.01;
    res.push({position: [point.position[0] + dx, point.position[1] + dy], prob: point.prob});
  }
  return res;
}

// Build Deck.gl layers based on zoom
function buildLayers(zoom) {
  const data = currentDataDense;
  const heatVisible = zoom < 9;
  const scatterVisible = zoom >= 9;
  const cityDotsVisible = zoom >= 11;
  const cityLabelsVisible = zoom < 11;
  
  return [
    new deck.HeatmapLayer({
      id: 'heat',
      data,
      getPosition: d => d.position,
      getWeight: d => d.prob,
      radiusPixels: 40,
      visible: heatVisible
    }),
    new deck.ScatterplotLayer({
      id: 'fire-scatter',
      data,
      visible: scatterVisible,
      getPosition: d => d.position,
      getFillColor: d => {
        const p = d.prob;
        if (p >= 0.75) return [255,0,0,220];
        if (p >= 0.6) return [255,165,0,220];
        return [255,255,0,220];
      },
      getRadius: 100,
      radiusUnits: 'meters'
    }),
    new deck.TextLayer({
      id: 'city-labels',
      data: cityData,
      getPosition: d=>d.position,
      getText: d=>d.name,
      getSize: 14,
      sizeUnits: 'pixels',
      getColor: [0,0,0,200],
      billboard: true,
      visible: cityLabelsVisible
    }),
    new deck.ScatterplotLayer({
      id: 'city-dots',
      data: cityData,
      getPosition: d=>d.position,
      getRadius: 120,
      radiusUnits: 'meters',
      getFillColor: [0,0,0,200],
      getLineColor: [255,255,255,255],
      lineWidthUnits: 'pixels',
      lineWidthMinPixels: 1,
      pickable: false,
      visible: cityDotsVisible
    })
  ];
}

function updateOverlay() {
  const zoom = map.getZoom();
  overlay.setProps({layers: buildLayers(zoom)});
}

// ------------- DATA LOADING ----------
function loadDataset(idx) {
  currentIndex = idx;
  const ds = datasetArray[idx];
  dateLabel.textContent = ds.label;
  fetch(ds.url)
    .then(r => r.json())
    .then(json => {
      currentData = json.features.map(featureToPoint);
      // densify
      let dense = [];
      currentData.forEach(p => {
        const copies = Math.floor(p.prob * 40); // 20-40 extra pts depending on prob
        dense = dense.concat(jitterPoints(p, copies));
      });
      currentDataDense = currentData.concat(dense);
      updateOverlay();
      map.fitBounds(ds.bounds, {padding: 40});
    });
}

// Initial load
map.on('load', () => {
  loadDataset(0);
});

map.on('zoomend', updateOverlay);

// Slider interaction
slider.addEventListener('input', e => {
  const idx = parseInt(e.target.value);
  loadDataset(idx);
});

// Play / pause
playBtn.addEventListener('click', () => {
  if (playInterval) {
    clearInterval(playInterval);
    playInterval = null;
    playBtn.textContent = '▶';
  } else {
    playBtn.textContent = '⏸';
    playInterval = setInterval(() => {
      let next = (currentIndex + 1) % datasetArray.length;
      slider.value = next;
      loadDataset(next);
    }, 1500);
  }
}); 