# Moorhen Migration Stages 20 and 21: Moorhen Only

Stages 20 and 21 were executed together without a stabilization window. Moorhen is now the only viewer mounted by the
application.

## Removed

- Viewer engine selection, rollout, rollback, and automatic fallback code.
- The NGL viewer adapter and its tests.
- NGL rendering objects, rendering helpers, representation helpers, and rendering file loader.
- The `ngl`, `three.js`, and obsolete transitive Three.js 0.77 packages.
- Dead NGL surface and mesh utilities.

## Retained Compatibility State

Some Redux actions, reducer fields, object-generation helpers, and context APIs still have historical `ngl` names.
They are used by Moorhen through the viewer adapter and remain to preserve saved snapshot/state compatibility, as
allowed by the Stage 21 instruction to avoid a high-churn state rename. They do not import or instantiate NGL.

## Configuration

There is no `VIEWER_ENGINE`, `MOORHEN_ROLLOUT_ENABLED`, or `MOORHEN_ROLLBACK` setting. Moorhen static assets continue
to use `MOORHEN_ASSET_URL` or `window.DJANGO_CONTEXT.moorhen_asset_url` when an override is required.

For local development, `yarn start` continues serving bundles and Moorhen assets on `http://localhost:3030`, while
the application remains available from Django at `http://127.0.0.1:8080`. The backend must supply the cross-origin
isolation headers required by Moorhen. The former local nginx header fallback has been removed so backend
misconfiguration remains visible in development.

## Quick Manual Check

1. Start the frontend with `yarn start` and hard reload normal Preview.
2. Confirm the main canvas starts Moorhen and loads a protein, ligand, and map.
3. Rotate the scene and verify that molecule and map remain aligned.
4. Exercise one visibility toggle and one snapshot or screenshot workflow.
5. Confirm the console contains `viewer.initialization.ready` and does not contain a worker, WASM, or adapter error.

Cypress remains a CI-only check on machines where its browser runtime is available.
