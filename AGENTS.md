# Fragalysis Frontend Agent Guide

This file applies to the whole repository. Treat the currently working application as the behavioural baseline. This
is a mature Django-integrated scientific UI with serialized Redux state and a live 3D viewer; code that looks
redundant, mutable, or overly defensive often preserves an old snapshot, backend, or rendering contract.

This guide is a set of preservation warnings, **not gospel and not evidence that a reported bug is acceptable**. If
investigation shows that a bug is caused by, or cannot be fixed without changing, one of the behaviours documented
here, tell the user clearly. Identify the behaviour, show the relevant evidence, explain the user-visible trade-off,
and ask for explicit permission to change that specific behaviour. Do not make the change until the user grants that
permission. A general request to fix a nearby bug is not implicit permission to remove one of these contracts.

## Before changing code

- Keep changes narrow. Do not combine a requested fix with Redux, hooks, naming, styling, or dependency cleanup.
- Read the nearest tests and current implementation before changing guarded code. The completed viewer migration is
  described in `docs/moorhen-migration-stages-20-21-moorhen-only.md`; deployment requirements are in
  `docs/moorhen-static-deployment.md`. Earlier migration stages describe historical intermediate states.
- Consult `docs/moorhen-ngl-parity-audit.md` and `docs/stagingcandidate-to-moorhen-validation.md` for investigation
  context, then verify findings against current code. Some audit findings predate subsequent fixes; an implemented path
  or passing mocked test does not establish visual parity.
- Preserve old snapshot and API payload shapes unless the task explicitly includes a migration.
- Diagnose documented quirks normally. Do not dismiss, conceal, or redefine a bug as expected behaviour merely because
  the implicated code appears in this guide.
- When a fix can preserve the documented behaviour, take that route. When it cannot, stop after diagnosis and request
  explicit permission, naming the exact behaviour that would change and the regression risk it previously addressed.
- Treat permission as behaviour-specific. Do not carry approval to change one preservation contract over to another
  contract or a later task.
- If this file disagrees with current code, tests, observed behaviour, or the user's instructions, report the mismatch;
  do not force the implementation to match this document.
- Do not assume that a new object identity is harmless. Several render, ref, dialog, and viewer flows are deliberately
  identity-sensitive under React 19.
- Do not assume that all state must be replaced immutably in one operation. Snapshot switching is the major deliberate
  exception described below. Mutation of _live_ Redux state is still not generally authorized.

## Application shape

- This repository builds the React bundle consumed by Fragalysis' Django application. It has no usable standalone
  `index.html`; `yarn start` serves the development bundle and HMR on port 3030, but the page shell and
  `window.DJANGO_CONTEXT` must come from Django (normally opened through the stack on port 8080).
  The development-only `/viewer/react/moorhen-proof` page is an isolated Moorhen check served by the frontend; it does
  not exercise the full Django-backed Preview, data queues, or snapshot workflows.
- Application source is JavaScript/JSX under `js/`, including JSX in `.js` files. Redux slice names such as
  `apiReducers`, `nglReducers`, and `selectionReducers` are persisted in snapshots and are compatibility names, not
  candidates for opportunistic renaming.
- React 19.2.7, React DOM, and `react-is` are intentionally pinned together. Redux 5 is intentionally initialized with
  `legacy_createStore`, the named `thunk` export, and `@redux-devtools/extension`.
- Moorhen is the only application viewer. `js/config/viewer.js` fixes `VIEWER_ENGINE` to `moorhen`, and
  `js/components/moorhenView/ViewerView.js` mounts `MoorhenView`. There is no configurable engine switch, NGL fallback,
  or rollout/rollback flag. NGL adapters, rendering helpers, and the `ngl` dependency have been removed.
- `MoorhenView` hosts `MoorhenContainer` with Moorhen's own Redux store, command centre, WebGL references, and threaded
  WebAssembly runtime. The Fragalysis Redux store remains separate. The main Preview uses one canvas; do not assume
  multiple viewers are isolated when they share the singleton `MoorhenReduxStore`.

## Snapshot and state contracts

Snapshot behaviour is the highest-risk area. Always inspect
`js/components/snapshot/redux/dispatchActions.js`, `utilitySnapshotShapes.js`, and their tests together.

### Same-project snapshot switching is intentionally in place

- A user-initiated switch within the current project must not replace the whole Redux tree or remount the preview.
  `changeSnapshot` updates the URL with `window.history.replaceState`, invokes the existing viewer's orientation API,
  then dispatches slice-specific reload actions through `applySnapshotStateWithoutFullRefresh`. Replacing this with
  router navigation, `window.location`, or `SET_ENTIRE_STATE` causes viewer/UI teardown,
  blinking, downloads, and lost caches.
- The switch keeps current fetched target data, dataset data, viewer object/cache state, rendered selection lists, and
  other runtime state through structural preservation masks in `utilitySnapshotShapes.js`. Those masks use values
  such as `true`, `1`, empty arrays, and empty objects as path markers; they are not application defaults.
- Objects visible in the old snapshot but absent from the new one are appended to the new `toBeDisplayedList` with
  `display: false`. These entries are removal commands (tombstones), not stale data to filter out. Display hooks consume
  the additions and removals incrementally so overlapping structures remain on screen.
- Already displayed objects are marked rendered and only genuinely new objects count as render work. For an in-place
  switch, the blocking snapshot render counters/dialog are then deliberately suppressed while the display hooks finish
  the incremental work. `switchingSnapshotWithinProject` also suppresses the general UI rendering dialog and is cleared
  on the next animation frame.
- Snapshot preparation mutates deep-cloned state and, in `nglReducers`, deletes transient counters from the
  action payload before merging it. This preserves live queue counters. Do not turn the flow into a blanket immutable
  replacement without proving smooth switching, removals, cache retention, and progress-dialog behaviour.
- `deepClone` is intentionally JSON based and the custom deep-merge helpers replace arrays and give special meaning to
  empty objects. Do not swap them for `structuredClone`, Lodash merge, Immer, or generic spread logic without snapshot
  compatibility tests.
- These cloning rules apply to serializable application state. Never clone Moorhen native handles or pass their
  molecule, renderer, store, promise, or buffer references into snapshot preparation.

### Saved snapshots are deliberately incomplete

- Saved state strips downloaded API data, molecule/tag/dataset lists, image/PDB/quality caches, live render lists,
  loading flags, and transient UI state. These are fetched or reconstructed on restore and must not bloat snapshots.
- `apiReducers.target_id_list` is deliberately retained in saved snapshots for the existing restore flow, even though
  most other downloaded API data is removed.
- `toBeDisplayedList` is the durable rendering intent. Saving normalizes entries to `center: false` and
  `rendered: false`, captures the main-view orientation separately, and recomputes the render count.
- State can exist in the newer `/api/snapshot_state/<id>/` resource or in legacy
  `snapshot.additional_info.snapshotState`. Different load paths prefer different locations, but both fallbacks are
  still required for old snapshots.
- Old snapshots may omit RHS pose navigation settings or contain the former boolean
  `centerOnDestinationLigandAfterTransfer`. Normalize them through `normalizeRhsPoseNavigationConfig`; never leak the
  configuration active before the switch into such snapshots.
- An `INIT` snapshot is the project-tree root. When the first one is created its parent must be `null`, regardless of
  the form value.
- Snapshot sharing captures and rescales both a full-screen image and a viewer image. Snapshot state and both images
  are uploaded together after both captures exist; preserve that grouping unless the backend contract changes.
- Moorhen captures its own orientation format and accepts historic NGL matrices through
  `js/viewer/moorhenAdapterUtils.js`. Legacy camera distance is not Moorhen zoom: preserve the compatibility conversion
  and fitted zoom rather than copying numeric values between engines. User-approved same-project transitions prepare
  state before a cancellable, elapsed-time camera animation (400 ms), then apply incremental structure changes after
  the final frame can paint. Preserve request ownership, live-state rebasing, native-animation cancellation and manual
  interruption; do not reapply the saved camera after the user interrupts it. Initial hydration remains separate.

Full-state replacement is still used for initial project/snapshot hydration and job-execution overlays. Do not merge
that path with the in-place user switch merely because both ultimately load snapshot data.

## Viewer and rendering contracts

- Keep application-to-viewer operations behind `js/viewer/ViewerAdapter.js` and `asViewerAdapter`. The public legacy
  view list intentionally remains `{ id, stage }`; `stage` is the registered Moorhen runtime containing its adapter.
  `asViewerAdapter` accepts an adapter or that runtime and rejects unregistered viewer objects. It does not construct
  an NGL wrapper. `NglContext.getViewerAdapter(viewId)` retrieves the registered adapter.
- `js/viewer/viewerBoundary.test.js` rejects imports of the removed `ngl` package and restricts the guarded native
  rendering calls to `js/viewer/MoorhenViewerAdapter.js`. Add application rendering capabilities through the adapter;
  the Moorhen host, proof route, runtime initialization, and worker bridge own their respective engine setup.
- `Preview` creates one `ViewerView` in an `InPortal` and moves its DOM through `OutPortal` when layouts change. Keep
  that single Moorhen canvas alive across layout changes so loaded objects, camera, and event state survive.
- Listener-only cleanup must not tear down the viewer. Actual Moorhen host cleanup removes handlers, unregisters the
  view, and starts asynchronous native cleanup through `adapter.destroy()`. The adapter drains pending operations and
  removes its molecules, maps, and vectors. Do not remove this teardown or invoke it on ordinary layout movement.
- Historical `ngl` Redux/context names and object names are compatibility contracts. Object names encode observations,
  object types, dataset IDs, and density suffixes; legacy loading also infers missing `OBJECT_TYPE` from names. Do not
  rename constants, change separators, or “correct” NGL-specific Redux names as incidental cleanup.
- Selection lists are not uniformly primitive IDs. Many contain `{ id, name, ... }`, density entries contain extra map
  data, and some dataset paths use raw IDs. Compatibility helpers deliberately accept both object and primitive IDs.
- `toBeDisplayedList` plus the corresponding displayed lists form an asynchronous command/acknowledgement queue.
  `display`, `rendered`, pending object counts, native command activity, and matching `objectsInView` are separate
  signals. Moorhen's `activeMessages` count alone does not cover all fetching, redraw, or cleanup work.
- Display hooks use `js/reducers/ngl/useStructureOperationQueue.js` to claim work before awaiting coordinate fetching.
  Repeated effects share the pending intent; load, removal, and reload are ordered per item/type/dataset. Independent
  items remain concurrent. Preserve this protection against duplicate loads during React updates and Strict Mode.
- The adapter orders molecule/composite/map loads and deletion by object name. A load must not overwrite another
  native object in the registry without disposing it. Application deletion uses `removeObjects(name)` so it also waits
  for loads which have not registered yet; an immediate `getObjects(name)` lookup can miss them.
- Wait for outstanding representation redraws before native deletion, and keep repeated deletion idempotent. Removal
  callbacks await disposal before clearing displayed selections and queue entries, including all maps or vectors owned
  by a logical item. An empty registry alone does not prove no rendered buffers remain.
- Fragalysis Redux representation actions use `js/viewer/representationState.js` to select and copy only display data:
  type, parameters, identity fields, visibility, and editor templates. Keep live handles, `nativeRepresentation`,
  `parentObject`, `ready` promises, native stores, and rendering buffers inside the viewer. Native Moorhen objects may
  live in Moorhen's own store; that is separate from serialized application state.
- Never use `cloneDeep`, JSON serialization, or `structuredClone` on a native representation handle. Its circular graph
  reaches molecules and renderer buffers; copying it during navigation previously caused multi-gigabyte tab growth.
  Select display fields before cloning. Resolve detached records back to live handles through adapter IDs for edits.
- Removing an object stashes detached representation records in `objectsInViewStash`. Reload paths can reuse those
  settings and optionally rewrite their colour. Preserve this cache without retaining disposed native objects.
- Representation creation and editing are asynchronous. Wait for `ready` before acknowledging an update; propagate
  rendering failures and clear pending counts in `finally` instead of marking failed work as rendered.
- Moorhen computes surfaces through its native runtime. The removed NGL `useWorker: false` workaround is obsolete;
  preserve Moorhen's workers and cross-origin isolation requirements.
- Initial normal target load selects the first visible alphabetical LHS tag and displays the first pose's ligand plus
  protein/sidechains. It deliberately does **not** display artefact chains. Snapshot and direct-display loads skip this
  initialization entirely.
- Hit-protein and artefact loading strips bound `LIG` records before rendering sidechains, while complex loading merges
  its ligand explicitly. Keep coordinate-preserving MOL/SDF loading, thin RHS ligand bonds, and ligand-fit scaling.
  Earlier parity notes describing hit-protein/artefact ligand merging predate this behavior.
- Multi-ligand centering uses an equally weighted mean of per-ligand centres, not an atom-weighted centroid, and rotates
  the widest ligand separation toward the horizontal screen axis. This is a user-facing navigation choice.
- Do not infer full NGL feature parity from a retained UI control. Quality metadata/flags, picking workflows, detailed
  selection/style translation, OpenDX hotspots, and Tindspect's multiple-viewer ownership need current implementation
  and runtime verification when touched. Historical audit labels are investigation leads, not immutable requirements.

## Pose navigation transfer semantics

The complexity in `poseTransfer.js` and `rhsPoseTransferConfig.js` exists to avoid viewer blinking and half-applied
transfers.

- Defaults are remove-first, overlapped scheduling, then centering on the visible destination ligand centroid.
- In phased “Add first”, new destination structures finish rendering before stale structures are removed. Identical
  overlaps remain loaded in add-first/overlapped paths; shared objects whose customization changed remove before reload.
- “Overlapped” launches independent addition and removal work concurrently. Transfer order determines launch order,
  not strict completion order. “Phased” is the strict sequential alternative.
- Structure readiness requires both a rendered queue marker and matching viewer object metadata, with native loads
  complete. Removal waits for selection and object deletion acknowledgements. A checkbox alone is not proof of either.
- Capture and apply representation type/parameters only. Exclude source UUIDs, `lastKnownID`, and native runtime
  identity from transfer appearance comparisons so unchanged shared structures are retained.
- Rendering failures trigger best-effort rollback of new, refreshed, and concurrently removed structures while the
  original transfer error is preserved for the UI. A post-transfer focus failure is reported but does not roll back an
  otherwise completed transfer.
- Inspiration control state is captured from the first eligible active source per control, and the union is applied to
  destination inspirations. Do not simplify this to copying one row wholesale.
- Serialize UI transfer requests, use the full filtered/sorted table order across pagination, reveal the destination,
  close stale popovers, and reanchor the inspiration dialog. Await destination rendering even with centering disabled.

## API, Django, and legacy-data contracts

- `window.DJANGO_CONTEXT` is required at module load. Authentication logic intentionally distinguishes missing `pk`,
  false `authenticated`, and the string username `NOT_LOGGED_IN`; do not normalize these without a coordinated backend
  change.
- All GET and HEAD requests through `js/utils/api.js` carry enforced no-cache headers and a unique `__cacheBust` query
  value. Mutation requests must not receive that query parameter. This prevents stale molecule/tag/pose data and is not
  debug noise.
- The API wrapper is pinned to Axios 0.19 behaviour: URL objects are converted to strings before params are appended,
  and cancellation uses `CancelToken`.
- Normal same-origin calls include Django's `csrftoken`. Remote debugging intentionally omits `X-CSRFToken` and requires
  manually switching `isRemoteDebugging` and `base_url` as documented in `README.md`; committed defaults stay
  same-origin and `false`.
- Structure URLs are upgraded from `http://` to `https://` when the page is HTTPS. Preserve this compatibility
  normalization for mixed data.
- Legacy targets are loaded from checked-in `legacy/legacy_targets.json` only when `DJANGO_CONTEXT.legacy_url` exists,
  decorated with external legacy links, merged into the live target list, and assigned synthetic IDs above the current
  maximum. These client-side IDs and the fixed legacy URL suffix are intentional compatibility glue, not backend IDs.
- Target access strings display and sort by `project.alias` first, falling back to
  `project.target_access_string`. URL/project matching still uses the real access string.
- Tags with no `meta_category` are treated as LHS tags, not tags for both sides. Exact non-assignable structural tag
  categories are business rules in `tagUtils.js`; do not make them editable as a generic UX improvement.
- Single-observation priority-tag behaviour is explicitly disabled (`isSingleObs = false`) on request. Preserve it
  unless product requirements change.
- RHS pose construction tolerates orphan poses with no matching observation. It also creates synthetic RHS poses from
  RHS-visible tags when the backend has no pose for their observations; IDs such as `rhs-tag-<tag id>` are expected.
- Computed-inspiration filtering prefers explicit `additional_info.computed_set(s)` but accepts legacy synthetic tag IDs
  of the form `rhs-<number>`. It prefers the main observation's inspirations over pose-level fallback data.
- LHS activity columns are currently not dispatched because assay columns and RHS score columns are mixed. The
  commented dispatch is deliberate; enabling it is a data-model change, not a cleanup.
- The application entry point deliberately removes the first Django-injected `<link>` element to suppress the old
  Bootstrap stylesheet. This is brittle-looking historical integration code; verify the Django template before changing
  it.

## React, UI, layout, and tooltip compatibility

- Preserve the provider nesting in `js/components/root.js`: Emotion `CacheProvider` (with `prepend: true`), MUI
  `ThemeProvider`, then `ErrorBoundary`, followed by the application providers. A source test enforces the outer order.
- MUI 7 is intentionally used with `GridLegacy` to retain old sizing and breakpoint behaviour. Migrating to the new Grid
  is a separate visual project, not a mechanical import update.
- `js/ui/styles.js` adapts legacy `makeStyles`/`withStyles` semantics to TSS, including prop functions, arrays, and
  `$rule` selectors. Shared components under `js/components/common` and `RichTooltip` must use the local UI boundary;
  feature components may still import MUI components directly.
- Theme defaults deliberately emulate Material UI v4 (button/checkbox/icon/link/tab/input variants), use 12 px base
  typography, and keep drawers above the app bar. `theme.spacing()` returns CSS strings; never perform arithmetic on it
  without explicitly parsing where the existing layout API requires a number.
- React 19 guards prohibit legacy root APIs, `findDOMNode`, string refs, inline callback refs, defaultProps assignment,
  and spreading React Table/virtual-list prop getters that contain `key`. Keep callback refs stable with
  `useRegisteredNodeRef`.
- Avoid effect-driven copies of derived data and unguarded state updates. Several filters, row-height caches, pagination
  effects, and quality-status views deliberately compare values or derive during render to prevent React 19 update
  loops caused by fresh array/object identities.
- Some exhaustive-deps suppressions are deliberate. For example, the pose list uses seemingly unrelated dialog/edit
  dependencies to keep a selected molecule visible until its editor closes, and viewer display callbacks omit state
  that would cause duplicate loads. Do not auto-apply hook-lint dependency suggestions without reproducing the flow.
- The observation dialog is owned by the LHS or RHS navigator that opened it. Changing pose updates the open dialog
  rather than closing it; the non-owner must not clean it up. Re-dispatching the same observation references
  returns the identical Redux state to avoid feedback loops.
- The default layout keeps the single viewer alive through reverse portals. When a draggable layout is unlocked, an
  overlay intentionally blocks viewer interaction so viewer mouse controls do not fight panel dragging. Resizable panels
  preserve proportions and remembered variable heights while collapsed panels use fixed overrides.
- Tooltips are path-based data in `tooltips/tooltips.json`. Preserve `TooltipPathProvider` nesting when moving controls.
  Missing/empty tooltip text stays hidden but holding Shift reveals the resolved path for authors; explicit
  `disabled: true` suppresses a tooltip. Alt enables interaction with tooltip content. The exported spelling
  `tootlipProvider` is an existing compatibility name—do not silently correct it.

## Build and dependency contracts

- Use Node 24.18.x and Yarn 4.17.1 through Corepack. The project intentionally uses `node_modules`, a project-local Yarn
  cache, immutable installs, and `enableScripts: false`. Do not use npm or generate `package-lock.json`.
- Install with `yarn install --immutable`. Existing peer warnings from older React-facing packages are known and are not
  by themselves evidence that the install failed.
- Moorhen is pinned in `package.json` (currently `0.22.7`). Its JavaScript, worker scripts, WASM binaries, and monomer
  assets must come from the same installed package. `start`, `build`, `watch`, and `dev` run `yarn copy:moorhen-assets`;
  this copies all of `node_modules/moorhen/public` to generated `bundles/moorhen` and checks paths, sizes, and hashes.
  Run `yarn verify:moorhen-assets` after builds and publish that directory alongside the bundles.
- Asset URLs are resolved in `js/config/moorhenProof.js`, despite the historical filename. The default follows the
  frontend bundle base; overrides are `MOORHEN_ASSET_URL` at build time or `window.DJANGO_CONTEXT.moorhen_asset_url`
  before startup. `MOORHEN_PROOF_ENABLED` controls the isolated proof route, not the main Preview's viewer engine.
- Moorhen requires `window.crossOriginIsolated === true` on the application document: serve
  `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`. Serve WASM
  as `application/wasm` and allow required cross-origin resources through CORS/CORP. Asset headers alone cannot isolate
  the Django document. Preserve `serverHeaders.js` for the frontend asset server. The backend must supply the document
  headers in development and deployed stacks. Do not add a local nginx header fallback: it was explicitly removed so
  missing backend configuration fails visibly during development. Avoid duplicate policy headers.
- Preserve the worker/CCP4 initialization bridges and their cleanup. They support the separate Django and frontend
  origins in development and do not replace document isolation. Moorhen initialization failures remain visible errors;
  there is no fallback renderer to mask missing assets or headers.
- Production output remains in ignored `bundles/` with `main-[fullhash].js`; production `publicPath` is deliberately
  empty. Development uses an absolute `http://localhost:<DEV_SERVER_PORT>/bundles/` path and an absolute HMR endpoint so
  Django can load the cross-origin bundle.
- `webpack-stats.json` is a backend API contract even though it is generated and ignored. It must retain
  `status: "done"` and `chunks.main[]` entries containing `name` and absolute `path`; development entries may also carry
  `publicPath`. Keep `LegacyBundleTrackerPlugin` and the build validator coordinated.
- The 100,000-byte Webpack asset-inline threshold, Terser `compress: false`/`keep_fnames: true`, and the narrowly scoped
  `react-datepicker` optional-timezone warning filter are intentional. Do not broaden warning suppression.
- Generated `bundles/`, `webpack-stats.json`, `.yarn/cache`, Cypress screenshots/videos, `node_modules`, and `.env` are
  not source changes and must not be committed.

## Verification

Use the smallest relevant checks first, then broaden in proportion to risk.

- Unit suite: `yarn test:ci`
- Production bundle plus backend stats validation: `yarn build`
- Moorhen static payload integrity: `yarn verify:moorhen-assets`
- Focused Jest test: `yarn test:ci --runTestsByPath <test-file>`
- Development bundle/HMR: `yarn start` (open the app through Django, not the bundle server)

There is no repository `lint` script. Follow the existing Prettier settings (single quotes, 2 spaces, 120 columns, LF)
and use existing source/audit tests as the compatibility gate. Targeted lint is available through
`yarn exec eslint <changed-files>`; distinguish existing warnings from new ones.

For viewer lifecycle or transfer changes, include native adapter/boundary tests, display queue/hook tests, transfer
tests, and snapshot tests as relevant. Fixtures must model circular native references, buffers, delayed coordinate
fetches, overlapping same-name loads, redraws, and deletion. Check both rendered resource cleanup and Redux/registry
acknowledgement; simple resolved mocks missed the earlier memory and orphaned-structure regressions.

Cypress is not a hermetic local suite. Its default `baseUrl` is a remote development stack, and the full suite logs in
and creates, renames, updates, and shares snapshots. Do not run `yarn cy:run` without an explicitly confirmed
`CYPRESS_BASE_URL` and appropriate `CYPRESS_LOGIN`/`CYPRESS_PASSWORD`; never point it at production. `yarn cy:smoke` is
the smaller migration smoke gate but still requires a reachable stack.

For snapshot, viewer, layout, or pose-transfer changes, automated tests are not sufficient. Manually verify target load,
LHS/RHS toggles, viewer rotation, layout switching/resizing, save and restore, smooth same-project snapshot transitions,
incremental object removal, orientation restoration, and absence of blocking-dialog flashes.
For navigation changes, repeat RHS forward/back transfers with shared inspirations and protein/map controls, verify
old structures disappear, and monitor tab memory. Distinguish automated coverage from live browser results; record
unavailable interactive checks explicitly. Reload the tab before retesting fixes for already copied/orphaned native
resources so leftovers from the previous code do not contaminate the result.
