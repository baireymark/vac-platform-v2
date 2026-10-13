# 3D integration

The platform uses the 3D body viewer and male model from `3d.zip`, and the supplied `military uniform 3d model.glb` as its female model. Its existing calculator UI, condition identifiers, effect controls, percentage choices, VA math, compensation tables, household controls, and forms remain in place.

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

## Uniform patches

The male flag is fitted within its shoulder tab and its original scanned rank tab is retained. The male left shoulder badge is replaced with native blank Velcro weave. The new female GLB preserves its supplied flag, rank patch, geometry, and 4096×4096 base-color texture without the old female overlays.

The supplied female model uses its own baked photographic flag. The male model's original baked flag is replaced by a swatch of its own blank Velcro weave beneath the new flag. Patch masks are limited to the sleeve and torso regions so nearby atlas islands cannot color skin or hair.

`addUniformPatches` in `public/assets/calculator/vac-body-map.js` uses an unlit photographic material with a separate transparent 4096×4096 patch atlas. The photographic base-color texture already contains lighting, so additional PBR lamps, normal-map lighting and tone-mapping exposure are bypassed for the model. Original base-color images and their sRGB settings are retained. Continuous inverse bilinear rasterization fits each flag into its Velcro quadrilateral without triangle antialias seams. The male chest texture is preserved without a covering overlay. No floating patch geometry or new external dependencies are required.

The viewer uses sRGB output, a render pixel ratio of at least 1.5 (capped at 2), anisotropic texture filtering up to the GPU's limit (maximum 16), and restrained detail enhancement in linear light. Body-part hover, selection, condition tints and bilateral highlights are included in the photographic shader. The selected region receives only a subtle tint, so an unrated limb does not look overexposed. The male base-color texture is 1024×1024, and the new female base-color texture is 4096×4096.

Verified: production build, existing smoke checks, both models viewed from the front and right side, plain chest panels, flag alignment on the shoulder tabs, rotation, and calculator interaction. Patches use the original body mesh, so body selection remains available over them.

## Original integration validation

Production build and platform smoke checks passed. Browser checks covered real WebGL model loading and ray clicks, all 30 body parts, adding/removing/clearing conditions, rating and pay updates, bilateral calculations, spouse changes, model switching, keyboard rotation, and desktop/mobile layout.


## Replacement female model

The Female control loads public/assets/calculator/female-uniform.glb. Body-region attributes were added using approximate anatomical height and lateral position so clicking and rating highlights continue to work. Original geometry, normals, UVs, and embedded images are retained. The model contains about 1.9 million triangles and the GLB is about 70 MB; initial loading and rendering cost is higher than the previous female model.

