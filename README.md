# Mars & Moon Mission Explorer

Explore Mars and the Moon through interactive 3D globes, surface maps, landing
markers, mission records, and science highlights.

## Run locally

1. Install Node.js (18 or newer).
2. From this folder, run `npm install`.
3. Run `npm run dev` and open the local address printed in the terminal.

The globe view opens first. Select a planet to load its 3D model; click the
globe to open its surface mission explorer. The Moon model is large and loads
only when selected.

On the globe view, choose an orbital mission to see its mission-specific path.
Profiles use published orbit altitudes and inclinations where available. The
radial scale is compressed to keep high and low orbits visible together; a
mission without a sourced profile is shown without a path.

## Production build

Run `npm run build`. The generated site is written to `dist/` and is configured
for the repository's GitHub Pages path in `vite.config.js`.
