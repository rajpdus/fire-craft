# FireCast Deck.gl Viewer – LA Wildfire Animation

This folder contains **a souped-up version** of the FireCast demo that uses **Deck.gl** (a WebGL library from Uber) to draw thousands of points super-smoothly.  If you ever played a game and wondered how it can move so many things at once—Deck.gl does that for maps.

---
## 1. What does it show?
Exactly the same pretend Los Angeles wildfire as the MapLibre demo but with extra sparkle:

* **Heatmap cloud** when you are zoomed out.  Colours fade from blue → green → yellow → orange → red as the danger gets hotter.
* **Dots** when you zoom in.  We clone each prediction 20–40 times (with a tiny random wiggle) so the cluster looks like a real wall of fire.
* **City names** (Los Angeles, Pasadena, Long Beach, etc.) drawn with Deck.gl's `TextLayer` so you always know where you are.

Timeline at the bottom lets you scrub or play through **Day 1 → Day 5** to see the fire balloon outward.

---
## 2. How do I open it?
1. Double-click `firecast-deckgl-viewer/index.html` (no server needed).
2. Wait a second—the browser downloads Deck.gl (≈ 700 kB) from a CDN.
3. Map appears centred on L.A.
4. Use the **play button** or **slider** just like before.

If you see errors about files not found, make sure the folder structure is:
```
firecast-deckgl-viewer/
  index.html
  styles.css
  app.js
  static/
    pred_la_day1.geojson
    ...
```

---
## 3. File tour
```
app.js      ← all the JavaScript magic
 ├─ MapLibre basemap (nice street map)
 ├─ Deck.MapboxOverlay bridges Deck.gl + MapLibre
 ├─ HeatmapLayer (for zoom < 9)
 ├─ ScatterplotLayer (for zoom ≥ 9)
 └─ TextLayer for city labels

styles.css  ← full-screen map + timeline + legend
index.html  ← basic HTML shell
static/     ← GeoJSON data copied from the MapLibre demo
```

### What did we change vs the first viewer?
* **`jitterPoints()`** – duplicates every prediction with random offsets so the fire blob looks thick.
* **HeatmapLayer** – automatically blends thousands of points on the GPU.
* Everything else (timeline, play loop, legend) is almost identical.

---
## 4. Tweak the density or colours
Open `app.js` and look for the line:
```js
const copies = Math.floor(p.prob * 40); // 20-40 extra pts
```
* Increase `40` ⇒ denser fire.
* Decrease `0.01` in `dx, dy` jitter ⇒ tighter blob.

Heatmap palette is set in one place (`HeatmapLayer` → `colorRange`).  Swap colours if you want blue flames or neon pink 😜.

---
## 5. FAQ
**Q: Why still MapLibre if Deck.gl can show a basemap too?**  
A: MapLibre gives a lightweight street layer and handles controls (zoom buttons).  Deck.gl focuses on the heavy data overlays.

**Q: Does it work on a phone?**  
A: Yes—any reasonably modern phone (WebGL-capable).  Older low-end devices may struggle with the heatmap.

**Q: Can I add 100 days of data?**  
A: Yes, but the slider will get tiny.  Consider a nicer timeline UI or dynamic loading (only keep 3 days in memory at once).

---
## 6. Learn more
* Deck.gl docs & examples: <https://deck.gl>
* MapLibre GL JS docs: <https://maplibre.org/maplibre-gl-js-docs/>

Enjoy flying through the virtual flames! 🔥🚁 