# FireCast Webapp Plan

## 1. Purpose
Create a lightweight interactive web application that visualises FireCast wildfire-spread predictions for **California wildfires** on an online map.  It must run entirely from static assets so it can be hosted on any static site platform (GitHub Pages, Netlify, Vercel, S3, etc.).

## 2. Understand Existing Outputs
1. `output/datasets/*.json` – Geo metadata and point lists.
2. `output/predictions/*.csv` – Rows: `burnName,date,y,x,probability`.
3. `output/figures/*.png` – Quick-look images (not georeferenced).

The web map will use the prediction CSVs – converted to GeoJSON point features (or optional Cloud-Optimised GeoTIFF rasters) – plus optional perimeter outlines.

## 3. Technology Choices
* **Frontend map library**  MapLibre GL JS (open-source Mapbox GL).
* **Basemap**  OpenStreetMap raster or any compatible vector-tile style.
* **Prediction layer**  GeoJSON points coloured by probability (initial implementation).  Later iterations may switch to COG rasters.
* **Static assets**  All data files placed under a top-level `/static/` folder or an S3 bucket.

## 4. California-Specific Data Sources
These publicly-available layers will ensure the map feels native to California and provide context for FireCast predictions:

* **Fire Perimeters & Incidents**  Historical and active perimeter shapefiles from the California Department of Forestry & Fire Protection (CAL FIRE) – `https://frap.fire.ca.gov/mapping/gis-data/` ("FIRE21_1" & "FirePerimeters") updated daily during fire season.
* **Land Ownership**  `CALFIRE/FRAP` State ownership layer and `USFS Region 5` boundaries to give context on jurisdiction.
* **Digital Elevation Model (DEM)**  USGS 1/3 arc-second (~10 m) DEM for CA or the ready-to-use Hillshade tiles from USGS The National Map.
* **Vegetation/Fuel Typing**  LANDFIRE 2.0 "Existing Vegetation Type" (EVT) and California Fire Resource Assessment Program (FRAP) Fuel Rank.
* **Weather & Forecasts**  NOAA NWS Digital Forecast Database (DFD) grids clipped to CA; backups: NAM 3 km or HRRR for wind & humidity.

All static layers that do not change frequently (ownership, DEM, vegetation) can be tiled once and stored under `/static/basemaps/`; dynamic layers (daily perimeter shapefiles) can be re-exported nightly via a small cron job and dropped into `/static/perimeters/`.

> **CRS note:**  FireCast currently uses WGS-84 (EPSG:4326).  California state agencies often publish data in NAD83 / California Albers (EPSG:3310).  The export script must re-project to 4326 so MapLibre can overlay all sources cleanly.

## 5. Data-Preparation Script (Python)
Path: `FireCast/tools/export_geojson.py`
1. Read dataset JSON to derive spatial transform (row/col → lat/lon).
2. Load a prediction CSV.
3. For every row create a GeoJSON Feature:
   ```json
   {
     "type": "Feature",
     "properties": { "prob": 0.87, "date": "0712" },
     "geometry": { "type": "Point", "coordinates": [lon, lat] }
   }
   ```
4. Write one GeoJSON file per burn-date: `static/pred_<date>.geojson`.

Optional extension: write probability rasters as Cloud-Optimised GeoTIFFs using GDAL.

## 6. Web App Skeleton
Project root (example):
```
firecast-viewer/
  index.html
  app.js
  styles.css
  static/
    pred_0712.geojson
    …
```
Key implementation notes:
*  Initialise MapLibre in `app.js` with an OSM or vector-tile style.
*  For each date add a GeoJSON source and a `circle` layer styling by `prob` (yellow→red ramp).
*  Provide a date selector (dropdown or slider) that swaps the source URL and triggers a layer refresh.
*  Future: add raster layers for DEM hillshade or probability COGs, and vector layers for starting/ending perimeters.

## 7. Optional Enhancements
*  Vectorise and display fire perimeter outlines for each day.
*  Add legend & info panel showing statistics (precision, recall) pulled from console output or a summary JSON.
*  Implement drag-and-drop of a new prediction CSV inside the browser and visualise instantly using PapaParse.
*  Support offline use by packaging all static assets locally.

---
This plan provides all steps required to transform FireCast model outputs into interactive geospatial visualisations delivered as a fully static web application. 