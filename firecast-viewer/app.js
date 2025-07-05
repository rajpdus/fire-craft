/* global maplibregl */

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://demotiles.maplibre.org/style.json',
  center: [-120.0, 37.0],
  zoom: 5
});

map.addControl(new maplibregl.NavigationControl(), 'top-right');

const LA_BOUNDS = [[-119.0, 33.6], [-117.6, 34.6]];

const datasets = {
  'static/pred_la_day1.geojson': {bounds: LA_BOUNDS},
  'static/pred_la_day2.geojson': {bounds: LA_BOUNDS},
  'static/pred_la_day3.geojson': {bounds: LA_BOUNDS},
  'static/pred_la_day4.geojson': {bounds: LA_BOUNDS},
  'static/pred_la_day5.geojson': {bounds: LA_BOUNDS}
};

// Replace select logic with slider
const slider = document.getElementById('time-slider');
const playBtn = document.getElementById('play-btn');
const dateLabel = document.getElementById('date-label');
const datasetArray = [
  {url:'static/pred_la_day1.geojson', label:'2020-01-01', bounds: LA_BOUNDS},
  {url:'static/pred_la_day2.geojson', label:'2020-01-02', bounds: LA_BOUNDS},
  {url:'static/pred_la_day3.geojson', label:'2020-01-03', bounds: LA_BOUNDS},
  {url:'static/pred_la_day4.geojson', label:'2020-01-04', bounds: LA_BOUNDS},
  {url:'static/pred_la_day5.geojson', label:'2020-01-05', bounds: LA_BOUNDS}
];
slider.max = datasetArray.length-1;
slider.value = 0;

let currentIndex = parseInt(slider.value);
let playInterval = null;

function updateDataset(idx) {
  currentIndex = idx;
  const ds = datasetArray[idx];
  dateLabel.textContent = ds.label;
  const source = map.getSource('predictions-dyn');
  if (source) source.setData(ds.url);
  map.fitBounds(ds.bounds, {padding:40});
}

slider.addEventListener('input', (e)=>{
  updateDataset(parseInt(e.target.value));
});

playBtn.addEventListener('click', ()=>{
  if (playInterval) {
    clearInterval(playInterval);
    playInterval = null;
    playBtn.textContent = '▶';
  } else {
    playBtn.textContent = '⏸';
    playInterval = setInterval(()=>{
      let next = (currentIndex+1)%datasetArray.length;
      slider.value = next;
      updateDataset(next);
    }, 1500);
  }
});

// Initial dataset load will happen after map load callback at bottom of file

map.on('load', () => {
  // predictions source (will be swapped)
  map.addSource('predictions-dyn', {
    type: 'geojson',
    data: datasetArray[currentIndex].url
  });

  // heatmap layer for lower zooms
  map.addLayer({
    id: 'predictions-heat',
    type: 'heatmap',
    source: 'predictions-dyn',
    maxzoom: 9,
    paint: {
      'heatmap-weight': ['interpolate',['linear'],['get','prob'],0,0,1,1],
      'heatmap-intensity': ['interpolate',['linear'],['zoom'],0,1,9,3],
      'heatmap-color':[ 'interpolate', ['linear'], ['heatmap-density'],
        0,'rgba(0,0,255,0)',
        0.2,'rgba(0,255,255,0.6)',
        0.4,'rgba(0,255,0,0.6)',
        0.6,'rgba(255,255,0,0.6)',
        0.8,'rgba(255,140,0,0.6)',
        1,'rgba(255,0,0,0.7)'
      ],
      'heatmap-radius': ['interpolate',['linear'],['zoom'],0,2,9,20],
      'heatmap-opacity': 0.8
    }
  });

  // circle layer for detailed view when zoomed in
  map.addLayer({
    id: 'predictions-circles',
    type: 'circle',
    source: 'predictions-dyn',
    minzoom: 9,
    paint: {
      'circle-radius': [
        'interpolate', ['linear'], ['get', 'prob'],
        0.5, 4,
        1.0, 10
      ],
      'circle-color': [
        'interpolate', ['linear'], ['get', 'prob'],
        0.5, 'yellow',
        0.75, 'orange',
        1.0, 'red'
      ],
      'circle-opacity': 0.9
    }
  });

  // California boundary outline
  map.addSource('ca-boundary', {
    type: 'geojson',
    data: 'static/ca_boundary.geojson'
  });

  // Fit map to Los Angeles region once LA prediction layer loads
  map.once('idle', () => {
    map.fitBounds(LA_BOUNDS, { padding: 40, maxZoom: 10 });
  });

  // replace existing ca-boundary-line creation: add fill layer before line
  map.addLayer({
    id: 'ca-boundary-fill',
    type: 'fill',
    source: 'ca-boundary',
    paint: {
      'fill-color': '#d1e3c8',
      'fill-opacity': 0.3
    }
  });

  // line remains after fill

  // Major city labels
  map.addSource('ca-cities', {
    type: 'geojson',
    data: 'static/ca_cities.geojson'
  });
  map.addLayer({
    id: 'ca-city-labels',
    type: 'symbol',
    source: 'ca-cities',
    layout: {
      'text-field': ['get', 'city'],
      'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
      'text-size': 14,
      'text-offset': [0, 0.6],
      'text-allow-overlap': true
    },
    minzoom: 4,
    paint: {
      'text-color': '#111',
      'text-halo-color': '#fff',
      'text-halo-width': 1
    }
  });

  // County boundaries
  map.addSource('la-counties', {
    type: 'geojson',
    data: 'static/la_counties.geojson'
  });

  map.addLayer({
    id: 'la-counties-line',
    type: 'line',
    source: 'la-counties',
    paint: {
      'line-color': '#8a2be2',
      'line-width': 1.5,
      'line-dasharray': [2,2]
    }
  });

  map.addLayer({
    id: 'la-counties-label',
    type: 'symbol',
    source: 'la-counties',
    layout: {
      'text-field': ['get', 'county'],
      'text-size': 12,
      'text-font': ['Open Sans Semibold','Arial Unicode MS Bold']
    },
    minzoom: 7,
    paint: {
      'text-color': '#8a2be2',
      'text-halo-color': '#fff',
      'text-halo-width': 1
    }
  });

  // Los Angeles city boundary
  map.addSource('la-city', {
    type: 'geojson',
    data: 'static/la_city_boundary.geojson'
  });

  map.addLayer({
    id: 'la-city-line',
    type: 'line',
    source: 'la-city',
    paint: {
      'line-color': '#ff1493',
      'line-width': 2
    }
  });

  // fit to bounds of initial dataset
  if (datasets[datasetArray[currentIndex].url]) {
    map.fitBounds(datasets[datasetArray[currentIndex].url].bounds, {padding: 40});
  }
}); 