# Sideout

Volleyball positioning, taught on an animated court: where to stand, and why.

Live: https://francisphan.github.io/sideout/

## Lessons

- **Rotation basics.** The six zones, clockwise rotation on a side-out, and the overlap rule. Drag players around and the pairs that break the rule turn red.
- **Serve receive.** All six rotations of a 5-1 with a libero. Step through before the serve, contact, pass, and set. Each player explains their job in that rotation.
- **Floor defense.** Perimeter, rotation, and middle-up systems against an attack from either pin or the middle. Base and read positions, shot lanes, and the block shadow.

Two views of every lesson, switchable in the top bar: a **perspective** view from behind your own endline with silhouette players that crouch, pass, set, jump and block, and a **whiteboard** view from straight above. Positions are one common way to run each system. Either way you are looking from behind your own endline, so zone 4 is on the left.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # vitest
npm run lint
npm run build      # tsc + vite, output in dist/
```

React 19, TypeScript, Vite. No UI library and no 3D engine: both courts are hand-drawn SVG. The perspective view projects court metres through a fixed pinhole camera (`src/components/projection.ts`), silhouettes are joint lists in `src/data/poses.ts` drawn as thick strokes, and all motion is CSS transitions on transforms and path data.

Court geometry and all positions live in `src/data/`. Every pre-serve formation is checked against the overlap rule in tests, so a change that makes a rotation illegal fails `npm test`.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages. The Vite `base` is `/sideout/` in production builds.
