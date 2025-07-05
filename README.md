# FireCast Web Demos

This repo now contains **two** lightweight, no-backend web demos for visualising FireCast wildfire predictions:

1. `firecast-viewer/` – MapLibre-GL JS version
2. `firecast-deckgl-viewer/` – Deck.gl + MapLibre (GPU heatmap) version

### Quick start (works on any machine with Python ≥3)
```
# 1. Launch a tiny web server from the repo root
python -m http.server 8000

# 2. Open a browser
# MapLibre version : http://localhost:8000/firecast-viewer/index.html
# Deck.gl version  : http://localhost:8000/firecast-deckgl-viewer/index.html
```
That's it – no builds, no installs.  Stop the server anytime with Ctrl-C. 