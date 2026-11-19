# Contributor contracts for the Moorhen branch

This adapts the contributor guide added by source commit `789f7356cfc2fbd9705c68698c707703e034893c` to the architecture on `#1812-moorhen`. It is supporting documentation, not a replacement AGENTS.md. The source guide describes NGL as the active viewer; this branch has intentionally completed its removal. Current code, tests and explicit task scope take precedence over stale descriptions. Diagnose bugs normally; document any incompatible behavior and its user-visible tradeoff instead of treating a preservation note as proof that a bug is correct.

## Application and development

The JavaScript/JSX application under `js/` supplies bundles to Django. There is no usable standalone HTML shell: Django supplies `window.DJANGO_CONTEXT` and normally serves port 8080; the frontend bundle/HMR server uses port 3030. Preserve the jointly pinned React/ReactDOM/react-is versions, Redux's `legacy_createStore`, named `thunk` and the Redux DevTools extension. Use the existing Node/Yarn declarations and local UI boundary. Read relevant tests and Moorhen stage notes before editing guarded behavior; keep fixes separate from broad Redux, styling, naming or dependency changes.

## Snapshot contracts

- Same-project `changeSnapshot` uses history replacement, orientation animation and slice reloads through `applySnapshotStateWithoutFullRefresh`; it preserves the existing preview and viewer. Initial hydration/job overlays still use full-state replacement. Keep those flows distinct.
- Structural masks in `utilitySnapshotShapes.js` retain fetched target/dataset data, object caches, selections and runtime counters. Their `true`, `1`, empty-array and empty-object markers are not application defaults. JSON cloning and custom deep merge semantics are intentional; preparation works on cloned state, with carefully scoped payload mutation preserving live counters.
- Render intent lives in `toBeDisplayedList`. Removal tombstones (`display: false`) are necessary commands; preserve them. Existing objects remain rendered, only new work is counted, and same-project switches suppress blocking render dialogs while incremental work finishes. Preserve the animation-frame clearing of the switching flag.
- Saved snapshots omit downloaded molecule/tag/dataset data, image/PDB/quality caches, transient selections, loading flags and UI state. Retain `apiReducers.target_id_list`; normalize render entries to `center: false` / `rendered: false`, recompute work counts and save orientation separately.
- Keep both `/api/snapshot_state/<id>/` and legacy `snapshot.additional_info.snapshotState` loading paths. An initial `INIT` snapshot has a null parent. Shared snapshots group saved state with full-screen and viewer screenshots after both captures finish.
- Normalize RHS navigation settings at full hydration, slice reload and in-place snapshot normalization. Missing/invalid values use defaults; the former centering boolean maps to design-ligand or none. Never inherit unrelated current settings when restoring an old snapshot.

## Viewer and rendering

- Moorhen is the sole renderer. Add capabilities behind `ViewerAdapter` and `asViewerAdapter`. Legacy `{ id, stage }` handles and serialized `nglReducers` / object names remain compatibility interfaces. The viewer boundary test rejects NGL imports and engine calls outside the native adapter.
- Preserve one reverse-portal canvas across layouts. Ordinary listener cleanup must not destroy the viewer; explicit native teardown remains owned by the Moorhen host/adapter. Preserve workers, WASM asset routing and cross-origin isolation headers.
- Selection formats vary between primitive IDs, object IDs, density metadata and dataset lists. Queued display intent, render acknowledgement, pending counts and `objectsInView` are separate facts. Native loads/deletes are asynchronous; transfer readiness requires the queue marker and matching completed viewer objects, and removal waits for the native object registry to clear.
- Display hooks claim pending requests through `useStructureOperationQueue` before fetching coordinates. Repeated effects share the same pending intent; removal for that item waits for loading, and independent items remain concurrent. Native molecule/composite/map loads and named deletion are ordered by the adapter. Use `removeObjects(name)` for application deletion so objects still loading before registration are included. Finish pending representation redraws before native deletion; an empty registry alone does not prove all rendered buffers were removed.
- Removed representations are stashed for reload, with optional color replacement. Density objects may own several maps; complete their deletion before final selection cleanup. Keep object-name separators, legacy type inference and map suffixes stable.
- Redux representation actions store detached display records (`representationState.js`), including IDs for adapter lookup and parameter templates for editing. Native handles, promises, molecules and rendering buffers stay in the viewer. Transfers copy only type and display parameters, excluding per-object IDs before comparison. Never deep-clone a native handle; its circular runtime graph includes renderer buffers and other molecules.
- Initial normal target load selects the first eligible alphabetical tag and shows the first ligand and protein/sidechains without artefact chains. Snapshot/direct loads skip initialization. Preserve the target's combined protein/artefact toggle behavior and its ligand fit scaling.
- Multi-ligand focusing gives each native ligand center equal weight, fits the combined extent and rotates the widest separation horizontally. Single-ligand focusing retains Moorhen's established behavior. Legacy NGL matrices are translated through existing orientation compatibility helpers; zoom units are engine-specific.
- The old guide's NGL fallback/engine flag, native NGL implementation allowlist and NGL surface-worker setting are obsolete on this branch. They do not justify restoring the removed runtime. Existing quality, picking and specialized-viewer parity gaps remain in the separate Moorhen audit/backlog.

## Pose transfer

Defaults are remove-first, overlapped scheduling and visible destination ligand centroid. Phased scheduling completes the chosen first operation group; overlapped scheduling uses the order as launch priority and concurrently runs independent work. Shared unchanged objects remain; changed shared objects remove before reload. Capture the first active source separately for each control and apply the union to destination inspirations. Preserve ligand/protein/artefact/complex/surface customizations, quality flags and inspiration density/vector state. Skip unavailable destination maps.

Transfers serialize UI requests, navigate in full filtered/sorted table order, reveal destinations beyond the current page, close stale popovers and reanchor the inspiration dialog. Failed rendering uses best-effort rollback where supported; preserve the original error, and treat a focus-only error separately from a completed transfer. Failed rollback cannot be described as a successful transfer.

## API and legacy data

- `DJANGO_CONTEXT` is required at module load; missing `pk`, false `authenticated` and username `NOT_LOGGED_IN` have distinct meanings. Preserve same-origin defaults and CSRF cookies; remote debugging intentionally omits the CSRF header.
- Axios 0.19 uses CancelToken and needs URL objects converted to strings for params. GET/HEAD requests enforce no-cache headers and unique `__cacheBust` values; mutation params/payloads stay intact. Direct-download tasks download only on successful completion, show bounded-retry failures, and ignore work after route teardown.
- Preserve HTTP-to-HTTPS structure URL normalization on HTTPS pages. Legacy targets are conditionally loaded from checked-in JSON when `legacy_url` exists, receive external links and synthetic IDs above the current maximum, and are combined with live targets.
- Access strings display/sort by alias with a real-access-string fallback; matching still uses the real value. Missing tag meta-category means LHS. Non-assignable structural tag categories, disabled single-observation priority handling, and synthetic/orphan RHS poses are deliberate compatibility rules.
- Inspiration filtering prefers explicit computed sets, accepts legacy synthetic tag IDs and prefers main-observation inspirations over pose fallback. LHS assay-column dispatch is intentionally disabled while assay/score data remain mixed. The entry point's removal of Django's first stylesheet suppresses historic Bootstrap; inspect its template before changing it.

## React, layout and tooltips

Preserve Emotion CacheProvider (`prepend`), ThemeProvider, ErrorBoundary and application provider order. MUI 7 uses GridLegacy and local TSS compatibility styles, with v4-like theme defaults, 12px typography and drawer ordering. Theme spacing returns CSS strings. Shared controls and tooltips use the UI boundary.

React 19 requires stable registered refs, explicit key handling for table/list prop getters, supported root APIs, and guards against feedback from fresh object/array identities. Existing hook dependency exceptions can retain selected rows or prevent duplicate loads; inspect behavior before changing them. Observation dialogs stay owned by the opening navigator and update on pose changes; identical observation references must not dispatch a new state.

Preserve draggable-layout overlays, panel proportions/collapsed height rules and the single viewer. Tooltip paths and provider nesting are part of UI data; preserve Shift path discovery, Alt interaction, disabled/empty behavior and the existing `tootlipProvider` export spelling.

## Build and verification

Use `yarn install --immutable` with the declared Corepack/Yarn/Node versions, project cache, node_modules linker and disabled lifecycle scripts. Known older React peer warnings do not alone indicate failure. Preserve empty production publicPath, absolute development bundle/HMR paths, `main-[fullhash].js`, the legacy Webpack stats shape, asset-inline threshold, Terser settings and narrowly scoped warning filter. Moorhen static assets and manually dispatched CI remain target requirements.

Run focused Jest tests, the complete `yarn test:ci`, `yarn build` (including stats validation) and `yarn verify:moorhen-assets`. Use existing lint config and source audit tests. Generated bundles, stats, caches, Cypress artifacts and local environment files are not source changes. Cypress needs a reachable stack; its default remote cannot validate local uncommitted code. The full suite mutates snapshots, so select an appropriate test environment. Viewer, layout, snapshot transitions, navigation and dialog behavior also need the manual checks recorded in the migration validation report.
