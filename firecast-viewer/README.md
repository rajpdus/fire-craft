# FireCast Viewer (Los Angeles Wildfire Demo)

## 1 — What is this?
Imagine you have a crystal ball that can *guess* where a wildfire in Los Angeles might spread over the next few days.  
FireCast is the brain that makes those guesses, and **this web page** is the big TV screen that lets you *see* them on an interactive map.

The demo shows 3 "days" (January 1–3, 2020) of a pretend wildfire:
* **Yellow dots** = places that have a *50-60 %* chance of catching fire.
* **Orange dots** = *60-75 %* chance.
* **Red dots** = *75-100 %* chance.

At low zoom the dots melt into a colourful *heat-cloud* (red hot ⇢ green cool).  When you zoom in the dots re-appear so you can pick out neighbourhoods.

We also draw helpful things:
* Purple dashed lines – county borders (Los Angeles, Orange, Ventura).
* Pink outline – Los Angeles city boundary.
* Labels – cities like Santa Monica and Pasadena so you know where you're looking.


## 2 — How do I try it?
1. **Open** the file `firecast-viewer/index.html` in any modern browser (Chrome, Edge, Firefox).  
   You don't need a server — just double-click.
2. A map pops up already centred on L.A.
3. Look at the black bar along the bottom:
   * Press **▶ play** and the bar will step through Day 1 → Day 2 → Day 3, looping forever.
   * Drag the **slider** left-right to scrub through time yourself.
4. **Scroll** your mouse wheel or pinch-zoom on the map to zoom in/out.  
   Below zoom level 9 you'll see a soft heatmap; above that you'll see the individual dots.
5. **Pan** around like any online map (hold left-mouse button and drag).


## 3 — What are these files?
```
firecast-viewer/
├── index.html      ← the web page you open
├── styles.css      ← colours & layout
├── app.js          ← the code that runs the map, slider & animation
├── README.md       ← (this file!)
└── static/         ← data the map reads
    ├── ca_boundary.geojson         state outline
    ├── ca_cities.geojson           major city label points
    ├── la_counties.geojson         county borders (3 counties)
    ├── la_city_boundary.geojson    L.A. city outline
    ├── pred_la_day1.geojson        Day 1 prediction dots
    ├── pred_la_day2.geojson        Day 2 prediction dots
    └── pred_la_day3.geojson        Day 3 prediction dots
```

**GeoJSON** is just a fancy text file where you list shapes (points, lines, polygons) and their coordinates (longitude, latitude).  The map library gobbles these files and draws them.


## 4 — How does the map work?
1. **MapLibre GL JS** – an open-source map engine, like Google Maps but fully free.  It can draw custom layers and animate them with the GPU (fast!).
2. **Heatmap Layer** – at low zoom we merge many points into a smooth colour blob so you can see big patterns.
3. **Circle Layer** – at high zoom every prediction becomes a dot whose size & colour match the probability.
4. **Timeline** – a JavaScript timer swaps one GeoJSON file for another every 1.5 seconds.  That makes it look like the fire is growing.


## 5 — I want to add more days or different fires!
1. Drop your new GeoJSON into `static/` and name it like `pred_la_day4.geojson`.
2. Open `app.js` and find the list called `datasetArray` near the top.  Add an entry:
```js
{url:'static/pred_la_day4.geojson', label:'2020-01-04', bounds: LA_BOUNDS},
```
3. Bump the slider's maximum automatically (it's already done from `datasetArray.length`), so just save and reload the page.

If you move to a new region (e.g. San Diego):
* Add a new set of GeoJSON points for that region.
* Give it its own `bounds` (south-west + north-east corners) so the map zooms correctly.
* You may also add city labels or outlines the same way.


## 6 — Where do the probabilities come from?
In the real FireCast project a deep-learning model looks at satellite pictures, weather forecasts, topography (hills) and past burn scars to predict where tomorrow's flames will likely be.  Here we made tiny sample files so you can play with the map even without running the model.


## 7 — Can I host this online?
Yes!  Because everything is plain HTML/CSS/JS with static files, you can drag the folder into:
* **GitHub Pages**
* **Netlify**
* **Vercel**
* or even your school's web space.

Remember to enable CORS if you ever load the GeoJSON from a different domain.


## 8 — I'm stuck / want to learn more
* MapLibre docs: <https://maplibre.org/maplibre-gl-js-docs/>  
* What is GeoJSON: <https://geojson.org/>

Have fun playing wildfire scientist! 🔥🗺️ 