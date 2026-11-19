# Moorhen Migration Stage 16: Proof Route

Stage 16 adds an isolated Moorhen page at `/viewer/react/moorhen-proof/`. The route is hidden from normal navigation,
lazy-loads Moorhen, and does not load the Fragalysis target list. All normal application routes continue to use NGL.

## Availability

The proof route is enabled by default in development and disabled by default in production. It can be controlled at
build time with `MOORHEN_PROOF_ENABLED=true` or at runtime before the frontend bundle loads:

```javascript
window.DJANGO_CONTEXT.moorhen_proof_enabled = true;
```

Moorhen assets are resolved next to the running frontend bundle by default. Deployments can override the asset root
with `MOORHEN_ASSET_URL` at build time or `window.DJANGO_CONTEXT.moorhen_asset_url` at runtime. The configured asset
root must be on the same origin as the top-level page because Moorhen starts a classic web worker from that URL.

## Proof Data

After the host-side CCP4/Gemmi WASM module, Coot worker, and user preferences initialize, the route loads Moorhen's
bundled tutorial structure and MTZ map. The on-screen status changes to `Moorhen ready: 1 molecule, 1 map` only after
both objects are present in Moorhen's Redux store. An initialization or asset error is displayed in the same status
area.

## Quick Manual Check

1. Run `yarn start`, then open `http://localhost:3030/viewer/react/moorhen-proof/`. The frontend server provides a
   proof-only page with the required isolation headers and same-origin Moorhen assets.
2. Wait for the bottom-left status to report `Moorhen ready: 1 molecule, 1 map`. Rotate the visible structure and
   confirm the map contours remain visible.
3. In DevTools, confirm `CootWorker.js`, the selected `moorhen.js`/`moorhen64.js` and WASM file, the tutorial `.pdb`,
   and the tutorial `.mtz` return HTTP 200, and check that `window.crossOriginIsolated` is `true`.
4. Open a normal preview route and confirm its existing NGL viewer still loads.

The document response must include the COOP/COEP headers described in
`docs/moorhen-static-deployment.md`; asset-server headers alone cannot make a Django-hosted page cross-origin
isolated. The proof-only development page supplies these headers directly.

## Automated Verification

- Jest covers proof-route gating, bundle-relative asset resolution, tutorial fetch failures, and the requirement that
  both a molecule and a map reach the Moorhen store.
- The production build emits Moorhen in lazy chunks, leaving the normal main bundle at its pre-proof-route size.
- Local HTTP probes cover the lazy route chunk, worker, WASM, Coot data archive, PDB, and MTZ assets.
