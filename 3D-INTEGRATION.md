# 3D integration

The platform now uses the 3D body viewer and male/female models from `3d.zip`. Its existing calculator UI, condition identifiers, effect controls, percentage choices, VA math, compensation tables, household controls, and forms remain in place.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:4174. For production, run `npm run build` followed by `npm start`.

## Connection

- `components/Calculator.jsx` contains the viewer, model switch, and a body-part dropdown with all 30 original platform parts.
- `public/js/calculator-3d.js` retains the calculator logic from the original turntable script. Model clicks select a platform body part; adding/removing conditions updates the model's highlights and rating labels. Bilateral conditions use the viewer's gold highlights.
- `public/js/va-math.js` is unchanged. All original percentage choices remain available.
- `public/assets/calculator/` contains the standalone 3D bundle and both model assets. The bundle additionally reports ray-hit height and rotation, allowing selection of the original joints and synchronized rotation controls.
- The body-part dropdown can refine a click or select any part when WebGL is unavailable. The supplied model has broad body regions, so joint selection inferred from height is approximate, and highlights cover the corresponding model region.
- Switching male/female models preserves conditions, percentages, household settings, and estimates.
- `components/LegacyScripts.jsx` loads the 3D viewer before the calculator after hydration. The archived 2.5D script and frame images are no longer loaded.
- `index.html` and the legacy server are updated to use the same viewer and calculator assets.

## Validation

Production build and platform smoke checks passed. Browser checks covered real WebGL model loading and ray clicks, all 30 body parts, adding/removing/clearing conditions, rating and pay updates, bilateral calculations, spouse changes, model switching, keyboard rotation, and desktop/mobile layout.
