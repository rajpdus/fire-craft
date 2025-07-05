#!/usr/bin/env python3
"""
export_geojson.py  –  Convert FireCast prediction CSV to GeoJSON
---------------------------------------------------------------
Assumptions
1. CSV columns: burnName,date,y,x,probability
2. Row (y) and column (x) indices are referenced to the upper-left of the raster.
3. Provide a simple geotransform via command-line:
     --ul <lon lat>          upper-left corner (degrees)
     --pixel-size <deg>      pixel size (square, degrees)
4. Only points whose probability >= --prob-threshold are exported.

Example
    python export_geojson.py predictions.csv \
        --ul -121 40 --pixel-size 0.0002695 \
        -o static/pred_20200101.geojson
"""

import csv
import json
import argparse
import sys
from pathlib import Path

def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument('csvfile', help='Path to FireCast predictions CSV')
    p.add_argument('-o', '--out', default='predictions.geojson', help='Output GeoJSON file')
    p.add_argument('--ul', nargs=2, type=float, metavar=('LON_UL', 'LAT_UL'),
                   help='Upper-left longitude and latitude of raster (degrees)')
    p.add_argument('--pixel-size', type=float, default=0.0002695,
                   help='Pixel size in degrees (default corresponds to ~30 m)')
    p.add_argument('--prob-threshold', type=float, default=0.5,
                   help='Minimum probability to include [0-1]')
    return p.parse_args()

def main():
    args = parse_args()

    if args.ul is None:
        sys.exit('Error: --ul lon lat is required for the demo transform.')

    lon_ul, lat_ul = args.ul
    pix = args.pixel_size

    features = []
    with open(args.csvfile, newline='') as fh:
        reader = csv.reader(fh)
        for burn, date, y_str, x_str, prob_str in reader:
            prob = float(prob_str)
            if prob < args.prob_threshold:
                continue
            x = int(x_str)
            y = int(y_str)
            lon = lon_ul + x * pix
            lat = lat_ul - y * pix  # minus because raster rows increase downward
            features.append({
                "type": "Feature",
                "properties": {"prob": prob, "date": date, "burn": burn},
                "geometry": {"type": "Point", "coordinates": [lon, lat]}
            })

    fc = {"type": "FeatureCollection", "features": features}
    Path(args.out).write_text(json.dumps(fc))
    print(f"Wrote {len(features)} features → {args.out}")

if __name__ == '__main__':
    main() 