# Migration validation

## Baseline before application edits

- PASS: branch, repository, clean index/worktree/untracked state and no unfinished Git operation.
- PASS: remote fetch; local/fetched source match; inclusive START ancestry and single-parent BASE; six-commit history and 39-file net diff.
- PASS: runtime declarations and installed versions: Node v24.18.0, Corepack 0.35.0, Yarn 4.17.1.
- ENVIRONMENT FAILURE: `yarn test:ci` exits 1 because Jest is not installed in node_modules.
- ENVIRONMENT FAILURE: `yarn build` exits 1 because `node_modules/moorhen/public` is missing.
- PASS: `yarn install --immutable` restored declared dependencies in 1m44s, with existing peer and disabled-build-script warnings; package and lockfile unchanged.
- PASS (baseline after install, before application edits): `yarn test:ci`: 30 suites / 172 tests, 60.863s.
- PASS (baseline after install, before application edits): `yarn build`: Webpack production compilation in 54.821s, existing asset/entrypoint size warnings (2); legacy backend stats validation passed.
- PASS (baseline): `yarn verify:moorhen-assets`: 275 assets, 114450225 bytes.
- Existing CI checks: immutable install; `yarn test:ci`; `yarn build` (includes `test:webpack-stats`); `yarn verify:moorhen-assets`; optional Cypress smoke when a backend is configured. No lint script; `.eslintrc` is available for targeted static checks.

## Implementation checks and final results

| Check / command | Result |
| --- | --- |
| First focused Jest run (settings, transfer/config, snapshot, adapter, camera thunk, boundary) | Initially 3 failed suites / 4 passed. New test fixtures lacked the required native runtime/Django context, and the copied phased-transfer stub did not acknowledge rendering. Fixed fixtures to model the required lifecycle; no assertions/checks disabled. |
| `yarn test:ci --runTestsByPath js/constants/poseNavigation.test.js js/components/preview/molecule/poseTransfer.test.js js/viewer/MoorhenViewerAdapter.test.js` | PASS: 3 suites, 48 tests after the fixture fixes. |
| Focused direct-download/API/config popover/observation dialog/initialization test paths | PASS: 5 suites, 18 tests. |
| Focused usePoseTransferNavigation/poseTransfer/rhsPoseTransferConfig/directDownload test paths | PASS: 4 suites, 40 tests, including native deletion timing, pagination/serialization and stale download results. |
| `yarn test:ci` after production implementation | PASS: 38 suites, 238 tests, 24.035s (baseline: 30 suites / 172 tests). Covers existing Moorhen, reverse-portal/UI, snapshot and viewer-boundary regressions as well as new behavior. |
| `yarn test:ci --runTestsByPath js/reducers/selection/actions.test.js` after strengthening legacy slice-reload assertion | PASS: 1 suite, 16 tests. Production code unchanged since full-suite/build checks. |
| `yarn build` | PASS: production Webpack compilation, 52.357s; legacy backend stats contract passed. Same 2 asset/entrypoint-size warnings as baseline. Main bundle approximately 11.4 MiB versus 11.3 MiB baseline. |
| `yarn verify:moorhen-assets` | PASS: 275 files / 114450225 bytes. |
| `yarn exec eslint` across all 25 changed/new production JS paths | PASS with baseline warnings: 0 errors, 9 warnings. Two hook dependency warnings and seven unused-variable warnings were individually reproduced by piping the corresponding TARGET_START source into ESLint with the same filename. No new warnings found. |
| Isolated baseline/current API assertion using Babel and Node VM, mocked Axios | PASS discrimination: required read cache policy FAILS on TARGET_START (expected) and PASSES on implementation. No baseline working-tree replacement or reset. |
| `git -c core.safecrlf=false diff --check`; new-file whitespace and source audit | PASS. The command-local safecrlf option suppresses Windows conversion notices; repository config is unchanged. |
| Source history/net-diff path inventory | PASS: all 39 paths mapped to 12 logical dispositions. No merge commits or omitted build/CI/package/assets in selected interval. |
| Target preservation audit | PASS: package.json, yarn.lock, compose, manual CI, initialization implementation/test unchanged; three default backend images and Moorhen isolation mount present; target protein toggle retained; no NGL import restored. |
| Browser/runtime/local backend | NOT RUN: browser runtime has no connected browser (discovery returned []); ports 8080/3030 refuse connections. Remote Cypress default cannot validate local code. |

These initial migration checks passed without interactive validation. Subsequent user testing exposed the RHS transfer memory regression documented below; the original test doubles did not model native runtime graphs. Pre-existing peer, lint and bundle-size warnings remain. The existing broader Moorhen parity backlog is outside this reimplementation.

## Browser availability and acceptance (NOT RUN)

Browser skill read and runtime connection attempted; runtime reported no browser available. Troubleshooting documentation read. HTTP probes to local ports 8080 and 3030 both returned ECONNREFUSED. These environment limits prevent full local UI/backend validation. The remote Cypress default does not host this uncommitted implementation and cannot establish its correctness.

Use the configured local stack at `http://127.0.0.1:8080` with frontend bundles at port 3030 if available. Do not claim interactive behavior from compilation alone. Existing Cypress smoke is read-only navigation; the broader suite mutates snapshots and is not required for this local check.

1. Open a public target: one Moorhen canvas, initial ligand and sidechains, no artefact chains; rotate and resize/switch layout without losing the viewer.
2. Open an RHS design with inspirations, enable ligand/protein/complex/surface and inspiration map/vector controls, adjust representations and density, and transfer up/down. Verify destination settings and union of inspiration controls; old controls clear and shared objects remain when unchanged.
3. Exercise each order/scheduling combination, filtered/sorted lists, row boundaries and a destination beyond the rendered page. Verify scrolling, disabled controls during transfer and no transient dialog ownership changes.
4. Test no centering, design ligand centering, and default centroid: equal influence per ligand, visible separation, all destination ligands framed; one ligand focuses normally, no ligands leave camera unchanged.
5. Open observation/inspiration dialogs on both sides and navigate poses; ownership stays with opener, inspiration dialog reanchors, tag/protein/density popovers close. Inject a failed object load and verify error/rollback without claiming render success.
6. Save and restore configured navigation; restore older snapshots with missing settings and boolean centering. Verify defaults/migration, preserved camera and uninterrupted existing snapshot transitions.
7. Open a direct-download link with a successful task, failed task and temporarily failing status endpoint: success downloads once, failure shows an alert and ends spinner, bounded retries occur, navigation away cancels polling.
8. Inspect read requests for unique cache-busting params and no-cache headers; verify normal tag/pose updates use fresh data and mutation payloads remain intact.

Full interactive coverage, backend availability and any remaining manual steps will be updated at handoff.

## RHS transfer memory regression follow-up (2026-09-10)

User reported slow RHS arrow transfers and tab memory exceeding 5 GB after two moves. Transfer customization used `cloneDeep` on live Moorhen handles, which include `nativeRepresentation`, `parentObject` and `ready`. Native representations link to circular molecule/renderer graphs and rendering buffers. Additional transfer snapshot/apply copies amplified that work; Redux object records and the removal stash also retained native references. Per-object representation IDs caused identical shared appearances to compare unequal and reload unnecessarily.

The fix selects display fields before cloning. Redux representation actions retain detached type, parameters, IDs, visibility and editor templates; live handles remain accessible through adapter ID lookup. RHS captures and applies only type/parameters for every structure and density control, so comparisons exclude runtime identity.

- Regression discrimination: the first two rendered/queued runtime traversal tests failed on the implementation before this fix, inside Lodash `cloneDeep`. Both passed after the fix.
- Expanded coverage checks all six structure/map representation paths for rendered and queued inputs using getters that throw if native data is visited. Representation actions are likewise checked before Redux/tracking receives their payloads.
- Shared-object tests exercise overlapped and phased add-first transfers: equal appearance is retained despite different IDs; a changed opacity still causes one removal/reload.
- Adapter/state integration exercises 12 load/edit/hide/delete cycles with circular native molecule references and typed rendering buffers. Live handle lookup and native deletion remain functional, and the serialized removal stash stays below 12 KB with no native references. This measures stored display records, not total browser memory.
- Final automated validation: `yarn test:ci` passed all 38 suites / 261 tests (56.916s); `yarn build` passed in 50.119s with the same two bundle-size warnings and successful stats validation. Targeted ESLint for all three production files changed in this fix passed with zero errors/warnings. `yarn verify:moorhen-assets` and `git -c core.safecrlf=false diff --check` passed.
- Browser discovery was retried and returned no connected browser. The reported 5 GB tab footprint and real backend/render latency have not been measured after the fix. Interactive acceptance requires a full tab reload to clear existing native copies, followed by repeated forward/backward RHS transfers while monitoring tab memory and verifying appearance, editing and shared-object retention.

## RHS old-structure accumulation follow-up (2026-09-10)

User confirmed faster transfers but supplied an image consistent with old structures accumulating. A new regression reproduced a distinct lifecycle race: two loads with the same name both passed the pre-load registry check. The second registration overwrote the first, and deletion emptied the registry while leaving one native representation rendered. The new buffer-tracking test failed before this fix with one rendered object remaining.

- Display effects now claim pending work before coordinate fetching and share repeated requests. Load/remove/reload for one item are ordered; other items, types and datasets remain independent. Ligand, protein, complex, surface, artefact, density and vector hooks use the shared queue. Removal callbacks await native completion before clearing selection/queue acknowledgement, including all density maps and vector objects.
- The adapter orders native molecule/composite/map loads and deletion by object name, including protein preprocessing. Named removal resolves the registry after pending loads finish. Repeated native deletion is idempotent; pending representation redraws finish before disposal, and teardown drains pending native operations.
- React/Redux regressions use Strict Mode, repeated renders and delayed coordinate fetch/load/deletion for ligand and protein hooks. They verify exactly one load and removal, including removal requested before coordinate data arrives. Queue tests cover ordered reload, independent datasets/items and retry after failure.
- Native regressions cover concurrent same-name molecule/composite/map loads, deletion before registration for ligands/proteins/density, delayed redraw, repeated deletion, Redux cleanup during in-flight loading, and teardown during loading. They check native object/buffer ownership as well as registry state. These are controlled lifecycle fixtures, not a live WebGL acceptance run.
- Final validation: all 40 suites / 274 tests passed (`yarn test:ci`, 48.327s). Production build and stats validation passed (54.295s), with the same two bundle-size warnings. After tightening test assertions for lint, both queue/hook suites passed again (4 tests). Targeted lint passed with only existing unused-variable warnings; the six warnings in newly touched vector/molecule-dispatch files were reproduced against HEAD. Asset verification passed (275 assets / 114450225 bytes), and `git -c core.safecrlf=false diff --check` passed.
- Browser discovery again returned no connected browser. After loading the rebuilt frontend, fully reload the tab to discard structures orphaned by the previous implementation. Interactive follow-up: navigate repeatedly forward and backward with design ligands and inspiration protein/map controls; verify only destination/shared structures remain and tab memory stabilizes.

## Density positioning and contour regression (2026-09-14)

The user's NGL/Moorhen comparison showed a small Event patch displaced from the ligand and no apparent 2FoFc density.
The preceding popover fix had removed the React update loop, but had not established visual map parity.

The local backend was reachable for this investigation. Read-only requests retrieved observation 3,
`A71EV2A-x0188a`, and its actual Event, 2FoFc and difference maps. All three are cropped 39 x 33 x 34 grids with
0.5 angstrom sampling and an MRC ORIGIN of approximately `[-5.863, 4.477, -5.351]`. Direct execution of the installed
Moorhen 0.22.7 Coot WASM showed that the imported map lost that origin: its strongest Event peak was located at
`[13, 8.5, 10]` rather than `[7.137, 12.977, 4.649]`, adjacent to the ligand's sulfur atom. The earlier audit's general
alignment observation did not establish compatibility with these files.

Three adapter problems were identified:

- The exact fractional ORIGIN was not applied to the native contour coordinates. NGL includes ORIGIN and grid starts
  in its [MRC coordinate transform](https://github.com/nglviewer/ngl/blob/master/src/parser/mrc-parser.ts).
- The native map manager overwrote application parameters on mount. Coot classified these small maps as EM maps,
  chose a 3.74 angstrom radius around an automatically selected peak, and locked contouring to that location.
- Application sigma contour values were passed as absolute density values. The original NGL path uses the map mean
  and RMS to convert sigma to an absolute threshold; see its
  [volume implementation](https://github.com/nglviewer/ngl/blob/master/src/surface/volume.ts).

The adapter now retains file geometry/statistics outside serialized state, translates contour queries and returned
meshes without resampling the voxels, and clips periodic copies outside the supplied volume. Box size zero draws
the whole cropped map. Native automatic settings no longer overwrite application controls. Saved contour values
remain unchanged, including explicit absolute-value representations; sigma conversion occurs only at the native
boundary. Native map draws are awaited and serialized, and deletion prevents late manager callbacks from recreating
buffers. No map assets, dependencies, snapshot shapes or molecular coordinates were changed.

Native checks using the actual files produced these results with the default application controls:

| Map | Mean | RMS | Absolute threshold | Vertices in the corrected cropped contour | Vertices within 3 angstroms of ligand sulfur |
| --- | --- | --- | --- | --- | --- |
| Event, 1 sigma | -0.20393604 | 1.17932427 | 0.97538823 | 10030 | 469 |
| 2FoFc, 1.2 sigma | -0.02578083 | 0.36402115 | 0.41104455 | 6150 | 148 |

The log's `No map found with molNo` warning originates in the native map manager selector when a removed map is no
longer in its store. It is not a map-download error. The fix does not suppress that warning; cleanup tests check
actual buffer and registry disposal, including a delayed native redraw after removal.

Validation:

- PASS: 43 Jest suites / 292 tests, 54.604 seconds. Includes the previous popover/queue, snapshot, transfer and viewer
  boundary checks; new coordinate/statistics tests; native redraw/deletion fixtures; and a test executing the installed
  threaded Coot WASM on a synthetic Gaussian map with a fractional, signed origin.
- PASS: production build and backend stats validation, 55.922 seconds, with the existing two bundle-size warnings.
- PASS: Moorhen asset integrity, 275 assets / 114450225 bytes.
- PASS: targeted production/helper/native-test lint, targeted formatting and whitespace checks.
- NOT RUN: browser visual acceptance. Browser discovery returned no connected browser, despite the backend being
  reachable. Native mesh generation with the actual target data is verified; interactive WebGL appearance is not.

After a full reload, check Event and 2FoFc around the ligand at the initial camera position; change contours, colors,
wireframe/surface and box size; rotate and zoom; toggle all map types and remove them. Repeat snapshot save/restore,
same-project switching and RHS transfers with map controls, checking alignment, cleanup and stable memory.

## Density remains visible after unchecking (2026-09-14)

The installed Moorhen 0.22.7 map `delete`, `hideMapContour` and `setupContourBuffers` methods update
`glRef.displayBuffers` without requesting a canvas repaint. Its WebMG host does not redraw in response to that
buffer list alone. Removing the final selected map can therefore leave the previous frame visible until a mouse
interaction or another render request. The earlier buffer/registry tests did not check repainting.

The adapter now explicitly draws the scene after native map contour setup, hiding and deletion. Native disposal
still drains pending contours and blocks delayed callbacks before acknowledging removal. Snapshot payloads, map
settings, object names and the existing operation queues are unchanged.

Validation:

- PASS: reproduced the missing repaint for Event, 2FoFc and FoFc before the fix. Regression tests execute the
  installed package's actual delete/hide/clear methods, obtained from its bundled source map, with a fixture store
  and a renderer that records the last drawn frame. They check map disappearance, unrelated protein preservation,
  hide/show, native buffer cleanup and repeated deletion. This is not a live WebGL visual test.
- PASS: final-checkbox tests for all three map types through the actual popover, Redux and display hook, including
  delayed deletion and acknowledgement only after disposal. Existing delayed-contour tests still prevent deleted
  resources from being recreated.
- PASS: 11 relevant Jest suites / 95 tests, including adapter/boundary, map geometry/native Coot, display queues,
  pose transfer and snapshot shape checks, 13.403 seconds.
- PASS: production build and backend stats validation, 50.615 seconds; the existing two bundle-size warnings remain.
- PASS: Moorhen asset integrity, 275 assets / 114450225 bytes.
- PASS: production adapter and popover test lint. New adapter test sections have no lint findings; the adapter test
  file still has 53 pre-existing lint errors elsewhere. Changed sections are formatted and whitespace checks pass.
- NOT RUN: live browser acceptance. Browser discovery again returned no connected browser. Reload the Preview,
  toggle each density type off without moving the mouse, then verify re-enabling, contour/style edits and navigation.

## Interaction dots/spikes instead of dashed lines (2026-09-14)

The legacy `contact` representation was mapped to Moorhen `contact_dots`. The installed native implementation sends
`contact_dots_for_ligand` with that representation's CID. Complex loading supplies the whole-molecule CID, even
though this is a ligand validation display, explaining the unrelated cluster of dots/spikes. The old NGL complex
used its contact representation over the protein and ligand, with weak hydrogen bonds enabled.

The adapter style mapping now uses native `allHBonds`, which requests Coot hydrogen-bond pairs and renders them as
dashed cylinders. The serialized representation type remains `contact`; existing complex and event representations
use the corrected mapping. Protein/ligand loading, merging, coordinates and camera behavior are unchanged.

This fixes the wrong visualization, not all NGL interaction semantics. Coot's
[hydrogen-bond API](https://www2.mrc-lmb.cam.ac.uk/personal/pemsley/coot/docs/api/html/) is used without explicit-hydrogen
mode. NGL-specific weak hydrogen bonds, other contact categories, per-category colors and detailed contact options
are not translated by this change. They remain parity work. In a native probe using the actual A71EV2A-x0188a apo
and ligand files, merged ligand coordinates were preserved and Coot returned 170 hydrogen bonds over the combined
structure; none involved UNL. This does not establish equivalent ligand interactions between the two engines.

Validation:

- PASS: the pinned native Coot runtime, initialized with its bundled data archive and tutorial coordinates, produces
  hydrogen-bond pairs. The test executes the installed Moorhen representation and cylinder builder, checks the
  selected native command, verifies both endpoints against those atom coordinates and checks real gaps between
  dashes. GPU rendering and visual appearance are not exercised by this test.
- PASS: complex/event adapter tests use `allHBonds`; enabling complex interactions does not recenter the view.
- PASS: 10 relevant Jest suites / 83 tests, 10.021 seconds, covering adapter and boundary behavior, native interaction
  geometry, display queues, pose transfer and snapshot shapes.
- PASS: production build and backend stats validation, 35.968 seconds; the existing two bundle-size warnings remain.
- PASS: Moorhen asset integrity, 275 assets / 114450225 bytes.
- PASS: targeted production utility and native test lint; native test formatting and changed-file whitespace checks.
- NOT RUN: live browser comparison, toggling, snapshot round trips and layout/transfer visual acceptance. No browser
  is connected. Reload the Preview before comparing the changed representation with the previous dots/spikes.

## Intermittent viewport size and stray semicolon (2026-09-14)

Moorhen's native container measures its dimensions on initialization and window resize. Designs visibility changes,
divider drags and reverse-portal layout moves can change the available panel without a window resize, leaving the
native canvas at its earlier size. The adapter's existing `resize()` only resized WebGL, without updating the native
scene width/height used by its host, 2D overlays and later resize effects. These timing differences account for the
intermittent behavior.

The host now observes its own panel with `ResizeObserver`, coalesces notifications into an animation frame and
resizes through the existing adapter. Native scene dimensions, WebGL size and redraw are synchronized. A briefly
detached/zero-sized portal retains the last usable dimensions. Observation and pending callbacks are stopped during
actual host teardown; Designs toggles and portal movement retain the same adapter, canvas, scene and camera.

The circled symbol matches a literal semicolon following `Moorhen2DOverlay` in the installed MoorhenWebMG figure.
Scoped host styles zero the figure's text metrics to hide it, make the canvas block-level to remove its baseline
gap, and remove the native wrapper/figure margins. Overlay canvases retain absolute positioning and their native
text drawing. The package, worker and static payload are unchanged.

Validation:

- PASS: real host/React reverse-portal tests with mocked native runtime, delayed initialization and repeated modeled
  Designs/layout changes. Check one retained canvas/adapter, coalesced resize notifications, scoped styles and
  teardown cancellation, including a late observer callback.
- PASS: adapter tests for opening/closing Designs and changing panel height, synchronized native scene dimensions,
  unchanged camera and ignoring temporary zero dimensions during a portal move.
- PASS: 14 relevant Jest suites / 98 tests, 16.876 seconds, including viewer/boundary, worker, native map/interaction,
  display queue, pose transfer and snapshot shape regressions.
- PASS: production build and backend stats validation, 66.011 seconds, with the existing two bundle-size warnings.
- PASS: Moorhen asset integrity, 275 assets / 114450225 bytes.
- PASS: changed production/host test lint, formatting and whitespace checks. The existing adapter test file has
  53 pre-existing lint errors; its new resize test has no findings.
- NOT RUN: live browser visual acceptance. Browser discovery returned no connected browser. After reloading, repeat
  Designs show/hide and divider drags at several window sizes, change layouts, rotate/pick near the canvas edges,
  and save/restore/switch snapshots. Check full-area drawing, no semicolon, stable scene/camera and clean removal.

## Initial scene presentation (2026-09-15)

Molecule load promises resolve before the installed MoorhenWebMG camera effect finishes its 15-frame animation.
The adapter writes the destination to Moorhen's store; that does not immediately position the rendered camera.
The native animator also ignores a new destination while an earlier animation is running. These details qualify
the guide's description of `animateOrientation` applying the final orientation immediately.

Preview now keeps the mounted native container transparent, with a visible "Preparing view..." status, until its
initial selection, coordinate/render queue and saved snapshot camera are ready. The adapter waits for native
operations and camera animation to finish, synchronizes any newer camera destination, and the host reveals the
scene after two settled frames. This can delay the first visible structure until the rest of the initial scene is
ready. The canvas retains its dimensions and native resources throughout preparation.

The reveal is local to the mounted Preview and happens once. Subsequent snapshot switches, toggles and layout
portal moves retain the visible scene and existing camera transitions. Snapshot payloads, incremental command
queues, display/removal acknowledgements and camera compatibility conversion are unchanged.

Validation:

- PASS: 46 Jest suites / 307 tests, including snapshot, transfer, native adapter, queue and host coverage.
- PASS: the new adapter test executes the installed renderer's animation methods across all 15 frames, models a
  newer destination during an active animation, and waits for pending loads/native commands before preparation.
- PASS: initial selection and delayed-render readiness, LHS density/RHS structures, saved-camera readiness, empty
  scenes, queue entries removed after failure, Strict Mode, cancellation, and one-time reveal tests.
- PASS: the host test keeps the same canvas and adapter visible across modeled snapshot loads and portal moves.
- PASS: production build and legacy backend stats validation; the existing two bundle-size warnings remain.
- PASS: Moorhen asset integrity, 275 assets / 114450225 bytes.
- NOT RUN: live browser visual acceptance; no browser is connected. Hard reload a normal target and a saved snapshot
  (including a legacy NGL camera), and check that the first visible structures are already positioned. Then rotate,
  toggle LHS/RHS structures and maps, resize/change layouts, save/restore, switch snapshots repeatedly, and navigate
  poses. Confirm no preparation overlay or canvas disappearance after the initial reveal, smooth transitions,
  incremental removals, and no blocking-dialog flashes. Automated tests do not establish GPU/visual parity.

## Apply representation appearance before presentation (2026-09-15)

The installed `MoorhenMolecule.addRepresentation()` draws its default representation before returning. The adapter
then applied Fragalysis colour, bond/radius settings and opacity, showed the representation and redrew it. This
exposed thin default ligand bonds and the default surface colour while the requested appearance was being built.

The adapter now constructs an undrawn native representation, configures its appearance, and generates its first
mesh with those settings. Newly published buffers stay hidden during the remaining asynchronous atom work. Opacity
is applied to the completed buffers before showing them, and the final reveal explicitly repaints the canvas.
Existing structures remain visible throughout. Initially hidden representations generate no geometry until shown;
their opacity also applies when those buffers are eventually created.

The representation's `ready` promise now covers the entire initialization, including the final reveal. Failed
creation removes its partial native buffers and representation record. Native colour rules are detached before
adding the requested colour: Moorhen's `setColourRules([])` restores defaults rather than clearing the rule list,
and appending to that shared list could otherwise affect other representations. Saved representation records and
the snapshot, centering, transfer and object-operation queues retain their existing contracts.

Validation:

- PASS: 47 Jest suites / 315 tests. After the final repaint adjustment, 8 relevant suites / 82 tests passed.
- PASS: tests execute the installed native representation constructor, colour rules, draw, buffer publication,
  hide/show and deletion code, with controlled mesh generation, atom fetching and GPU allocation. They verify the
  requested LHS/RHS ligand and surface appearance on the first mesh, one initial mesh generation, hidden partial
  buffers, opacity, a final visible frame, a stable pending `ready` promise, hidden saved representations, failure
  cleanup and deletion during creation. Circular native ownership and typed buffer fixtures remain covered.
- PASS: targeted lint for the changed adapter and new native presentation tests; changed-file whitespace checks.
- PASS: final production build and backend stats validation, with the existing two bundle-size warnings; Moorhen
  asset integrity, 275 assets / 114450225 bytes.
- NOT RUN: live browser visual acceptance; no browser is connected. Reload Preview, repeatedly add/remove LHS and
  RHS ligands and surfaces, and check that their first visible appearance already has the requested thickness,
  colour and opacity. Also check representation additions/selection edits, hidden saved representations, rotation,
  layouts, snapshot save/restore/switching and pose transfers with shared structures. Verify that existing objects
  stay visible during preparation and that removal leaves no buffers. The tests do not exercise actual GPU output.

## Other structure presentation audit (2026-09-15)

Proteins, hit-protein sidechains, artefacts and merged complexes use the same representation initialization path.
The installed native lifecycle tests now cover their first mesh settings, hidden partial buffers and final reveal,
including disposal of the temporary ligand before the complex starts drawing.

Spheres were an exception: `addSphere()` loaded and revealed a default-sized sphere, then applied its radius and
optional opacity through an edit/redraw. These settings now enter the initial representation definition. Both new
sphere tests failed against the previous implementation and pass with the fix; only one initial mesh is generated.

Source inspection of the installed Moorhen map code confirms that data loading does not draw contours. The adapter
disables native suggested-settings replacement and applies contour level, radius, style, colours and opacity before
requesting geometry. Native buffer setup applies those colours/opacity before publishing the buffers. This shared
path serves density, event and hotspot maps; it does not establish OpenDX input compatibility. Arrows and cylinders
carry their final coordinates, colour and arrow mode before publication, and the native vector renderer reads those
values directly. Event-map molecule layers use the common molecular initialization path. Multi-part objects retain
incremental layer loading; this audit concerns each representation's initial appearance, not an atomic scene reveal.

Validation:

- PASS: 8 relevant suites / 88 tests, including presentation, adapter/boundary, native map geometry, display queues,
  pose transfer and snapshot shape checks.
- PASS: targeted adapter/new-test lint, new-test formatting and changed-file whitespace checks. The adapter's
  pre-existing camera-method formatting discrepancy remains outside this change.
- PASS: production build and backend stats validation (33.019 seconds), with the existing two bundle-size warnings.
- PASS: Moorhen asset integrity, 275 assets / 114450225 bytes.
- NOT RUN: live visual acceptance; browser discovery again returned no connected browser. Reload Preview and check
  protein/sidechain/artefact/complex/sphere toggles plus density/event maps, including saved customized layers.
  Confirm initial colour, width/radius and opacity, existing-scene continuity, and clean removals. Native lifecycle
  fixtures and source inspection do not establish actual GPU output or complete visual parity.

## Sidechain and hydrogen-bond colours (2026-09-15)

The pre-migration `renderHitProtein` and `renderArtefactChains` definitions in commit `6c617a65` explicitly used
`colorScheme: 'element'`. Their Moorhen defaults omitted it, so the adapter applied the carbon/observation colour
to non-carbon atoms as well. Line representation handles now default to element colouring, including restored
definitions that omit the scheme. Explicit saved schemes such as `uniform` take precedence. Carbon colour, bond
widths, ligand stripping and the preparation/reveal lifecycle retain their existing behavior.

The installed `allHBonds` representation ignores colour rules and passes a hard-coded purple to its dashed-cylinder
builder. Contact representations now pass NGL's hydrogen-bond blue (`#2b83ba`) to that same native builder, before
buffers are created. Coot's selection, detected endpoints, distance filtering, geometry and redraw/disposal paths
are retained. Other representations are unaffected.

This is a colour correction, not full NGL interaction parity. NGL's
[contact palette and detector](https://github.com/nglviewer/ngl/blob/master/src/chemistry/interactions/contact.ts)
also distinguish weak hydrogen bonds, ionic, aromatic, halogen and metal interactions. The current adapter asks
Coot for hydrogen bonds only. Reproducing the remaining coloured lines requires equivalent interaction detection;
assigning those colours arbitrarily to existing hydrogen bonds would misrepresent the chemistry.

Validation:

- PASS: new native-lifecycle checks verify carbon-only colour commands before first presentation for sidechains,
  artefacts and saved definitions without a scheme, plus preservation of explicitly uniform saved colours.
- PASS: the existing real Coot hydrogen-bond test now exercises the adapter's colour override and checks the NGL
  blue for every generated cylinder, alongside its existing endpoint and dash-gap geometry assertions.
- PASS: targeted lint for the adapter and both native presentation/interaction test files.
- PASS: 9 relevant suites / 93 tests, including viewer, queue, transfer and snapshot regressions.
- PASS: production build and backend stats validation (63.419 seconds), with the existing two bundle-size warnings;
  Moorhen asset integrity, 275 assets / 114450225 bytes.
- NOT RUN: live comparison with the supplied screenshots; no browser is connected. Reload Preview and compare
  sidechains, artefacts and contacts; also exercise saved representations, colour edits, hidden/revealed layers,
  snapshots and removal. These checks do not establish exact element shades, lighting or interaction-type parity.

## First density-dialog opening reloads an unchanged map (2026-09-15)

Both D-button left-click handlers omit flags for unselected map types. The popover initializes these checkboxes
to `false`, then previously submitted those normalized settings on mount. The density display hook interpreted
the shape difference as an edit and removed/reloaded the map. Once normalized, subsequent openings did not reload it.

The popover now records its initial control values as the unchanged baseline when density already exists or is
loading. Only changed control values are submitted. Opening without existing density still loads the default map;
real edits, including reverting an edit, still use the existing asynchronous queue. Snapshot shapes are unchanged.

Validation:

- PASS: reproduced the first-open reload for Event, 2FoFc and FoFc before the fix. Actual popover/Redux/display-hook
  tests under Strict Mode now verify no viewer load/delete calls or Redux changes on first opening and reopening.
- PASS: pending initial loads complete once; opening without density loads once; real edits and reverting them work.
- PASS: 7 related suites / 88 tests, including adapter/boundary, display queues, transfers and snapshot shapes.
- PASS: targeted ESLint for the popover and its tests.
- PASS: production build and backend stats validation (77.772 seconds), with bundle-size warnings only;
  Moorhen asset integrity, 275 assets / 114450225 bytes.
- NOT RUN: live browser acceptance; browser connection failed and discovery returned no connected browsers.
  In Django-backed Preview, check left-click D followed by right-click, reopening, edits, removal and snapshot switching.

## Black snapshot thumbnails (2026-09-18)

The snapshot card uses the saved `NGL_SCREEN` image, including with Moorhen. Moorhen 0.22.7 creates its WebGL
context without `preserveDrawingBuffer`; the old adapter either read an undrawn canvas or delegated directly to
asynchronous DOM capture. `dom-to-image-more` could therefore read a cleared buffer, producing the reported black
thumbnail. This follows the [WebGL drawing-buffer lifecycle](https://registry.khronos.org/webgl/specs/latest/1.0/#2.2).

The adapter now redraws and synchronously encodes the canvas before invoking DOM capture. Both the viewer and
full-page snapshot captures replace only the cloned canvas image with that frozen frame, retaining DOM overlays,
layout dimensions and the live canvas. Save/share/update still rescale both images and upload them with snapshot
state in the existing group. Snapshot payloads, orientation and switching behavior are unchanged. Already stored
black images require loading the desired snapshot and using Update to capture it again.

Validation:

- PASS: five new regressions failed before the fix, covering direct/delegated adapter capture, both DOM captures
  after a modeled buffer clear, and full-page capture errors. The focused adapter, boundary, screenshot and snapshot
  shape suites passed all 61 tests after the fix.
- PASS: new coverage also checks high-DPI layout dimensions, labels, unrelated canvases, unchanged live DOM,
  DOM-only fallback, missing viewer nodes and error propagation.
- PASS: full unit suite, 52 suites / 365 tests (117.093 seconds), including native adapter, boundary, display queues,
  pose transfers and snapshot shapes.
- PASS: production build and backend stats validation (79.494 seconds), with the two existing bundle-size warnings.
- PASS: Moorhen asset verification, 275 assets / 114450225 bytes, and `git diff --check`.
- PASS: lint comparison against HEAD found no added findings. The existing adapter test file has 59 lint errors;
  snapshot dispatch actions have 17 unused-variable warnings. Other changed JavaScript files have no findings.
- NOT RUN: live browser acceptance; browser discovery returned no connected browsers. Reload the updated frontend,
  load a target with ligand/protein/map and labels, rotate, then create and update snapshots. Inspect both uploaded
  images and the thumbnail, including after resizing/layout changes. Check LHS/RHS toggles, restore, smooth
  same-project switching, incremental removal, orientation and absence of blocking-dialog flashes.

## Download dialog text and console review (2026-09-18)

The user confirmed the thumbnail now shows the scene, then reported unreadable Download structures labels and
provided console output. The installed Moorhen container appends `darkly.css` globally when the viewer background
is dark. Its body text color is white. The shared Fragalysis modal set its paper background but inherited text color
from that body. Modal paper now also sets the application theme's primary text color. Disabled labels and explicit
button/error colors retain their own styles.

The dialog also retained MUI v4's removed `disableTypography` property, nesting an `h5` or `h4` inside DialogTitle's
default `h2`. All four title states now use a `div` wrapper, retaining the inner heading and its typography.

The `dom-to-image-more` image-load exception was reproduced using the installed library's image helper. It leaves
an `onload` callback on the resolved canvas image which removes a temporary SVG. Replacing that image's `src` with
the frozen frame invokes the callback again, after the SVG has already been removed. The clone adjustment now
detaches the completed load/error callbacks and substitutes the frame only once. Live image handlers are untouched.

Remaining supplied messages:

- `Maximum update depth exceeded`: the user clarified snapshot switching as the suspected trigger and requested
  deferring investigation to a later prompt. The supplied log has no component stack; no fix is claimed.
- `GridLegacy` deprecation: expected with the intentionally retained grid compatibility component.
- Missing dependency source maps: debugger metadata warnings; the log subsequently records successful viewer startup.
- Cross-origin CSS rules: snapshot font discovery cannot inspect Moorhen sheets loaded from port 3030. The installed
  `moorhen.css` and `darkly.css` contain no `@font-face` rules, and the capture library catches these errors and continues.
  Font embedding remains enabled for accessible application font stylesheets; warnings are not suppressed.
- Missing list keys: `PM` maps to the installed Moorhen bundle's React Bootstrap `OverlayTrigger`. The other
  `ForwardRef` warning is not specific enough to locate from this excerpt. No dependency patch was made.
- Zinc charge/protonation warning: emitted by the vendored contact detector's valence model, which lacks a zinc
  assignment branch. It continues using the supplied formal charge (or zero) and default geometry; the log records
  the object load completing. This is a chemistry-model limitation, not a failed structure download.

Validation:

- PASS: the new installed-library image regression reproduced `NotFoundError` before the handler fix and passed after it.
- PASS: a rendered download-dialog test reproduces the body color from the installed dark stylesheet, verifies dark
  text on white paper and the disabled map option, and checks valid headings without React errors while current
  snapshot metadata changes. This uses JSDOM and does not establish live-browser visual acceptance.
- PASS: 7 relevant suites / 88 tests (13.617 seconds), covering the dialog, capture helper, theme/UI boundary,
  viewer adapter/boundary and snapshot shapes.
- PASS: production build and backend stats validation (43.513 seconds), with the two existing bundle-size warnings;
  Moorhen asset verification, 275 assets / 114450225 bytes.
- PASS: targeted ESLint and whitespace checks. Download dialog retains its four pre-existing unused-variable
  warnings, verified against HEAD; the other files changed in this follow-up have no lint findings.
- NOT RUN: live browser verification; no browser is connected. Reload the updated frontend, inspect all download
  dialog labels, and save/update a snapshot to confirm the thumbnail remains correct without the image-load error.

## Timed same-project snapshot transitions (2026-09-18)

The user approved replacing the old transition timing and staging structure changes after camera motion, with
rollback if the live result is worse. Baseline commit: `8dbfb9bbb356face05de4344c78522abb6d415f5` (clean working tree).
The former `2000` argument was ignored by the adapter: it dispatched camera state immediately, while the installed
Moorhen host independently animated over 15 frames. Snapshot cloning and structure work could overlap that motion.

The adapter now interpolates origin, zoom and the shortest quaternion arc using animation-frame timestamps and a
400 ms smooth easing curve. An unchanged camera does not wait out that duration. A guard around the installed
native camera scheduler invalidates already queued native frames and prevents competing animations. It is restored
on teardown. Final camera values are copied to Moorhen's store before camera ownership is released; origin and zoom
notifications retain map updates and zoom-dependent clipping/fog. Legacy NGL matrix conversion retains fitted zoom.

The switch prepares its existing cloned/merged state before motion, lets the final camera frame paint, and then
applies destination intent through the existing slice actions and display queues. It rebases against current state
if work completed during motion. Request ownership is kept outside Redux: a newer selection aborts old camera motion,
ignores stale fetch responses, and owns flag cleanup. Manual pointer/wheel/keyboard input on the canvas stops motion
while allowing destination structures to load. The existing orientation-applied flag prevents delayed restoration
from snapping the camera back afterward. Initial/job hydration retains its separate full-state path. Snapshot/API
formats, structural preservation masks, native load/deletion queues and blocking-dialog suppression remain intact.

Validation:

- PASS: all 55 Jest suites / 388 tests, 67.335 seconds. Includes adapter/boundary, display queues, transfers, initial
  presentation, layout/host and snapshot compatibility checks.
- PASS: 3 directly changed suites / 65 tests after test-style adjustments, 11.427 seconds. New cases cover irregular
  frame intervals, final camera/store agreement, native scheduled frames, shortest rotations, legacy zoom, unchanged
  cameras, supersession, manual interruption, errors, teardown, stale responses, fresh runtime acknowledgements,
  shared-object retention/removal commands, and initial versus in-place orientation restoration.
- PASS: production bundle and backend stats validation, 67.454 seconds, with the two existing bundle-size warnings.
- PASS: Moorhen static integrity, 275 assets / 114450225 bytes; whitespace check; no additional ESLint findings versus
  baseline. The adapter test file retains 59 existing test-style errors; snapshot actions and ProjectPreview retain
  their 17 and 1 existing unused-variable warnings respectively. New test files have no findings.
- NOT RUN: live timing baseline/comparison or visual acceptance because browser discovery returned no connected
  browser. Installed native scheduling is exercised in tests, but WebGL drawing is modeled; no live FPS improvement
  or smoothness guarantee is claimed. No speculative surface-quality or rendering-cache changes were made.

For live acceptance, reload the tab first. Compare camera-only snapshots, snapshots with different structures, and
complex protein/surface/map scenes. Record fetch/preparation delay, camera frame gaps and destination completion time;
rapidly select A/B/C and rotate or zoom during a transition. Confirm the latest snapshot wins, shared objects stay
visible, removed objects disappear, no blocking dialog flashes, and manual camera changes survive structure loading.
Also check initial target/snapshot load, LHS/RHS toggles, layout moves/resizing, save/update thumbnails, orientation
restoration, and repeated RHS transfers with shared inspirations while watching memory. The separately deferred
maximum-update-depth warning is not claimed fixed by this change.

## First Designs opening after restoring a snapshot (2026-09-18)

Read-only inspection of `/api/snapshot_state/4/` confirmed that project 4 / snapshot 4 was saved with
`sidesOpen.RHS: false`, `areRHSCompoundsInitialized: false`, and `rhs_selectedTagList: []`. The target's tag API
contains one visible RHS tag (79). The selection was not lost during switching: no RHS selection had been saved,
and `initializeRHSMolecules` skipped default tag selection for every snapshot, including an unopened Designs panel.

RHS initialization now selects its normal first eligible tag for that uninitialized snapshot case. It requires an
explicit false initialization flag, an empty saved tag list, and no saved Show all, untagged, or coordinate filter.
Existing selections, intentionally cleared initialized selections, and legacy snapshots with an unknown initialization
status retain their saved behavior. Direct-display mode still skips initialization. This fallback dispatches only a
tag selection; LHS initialization, structure queues, camera restoration and the approved animation are unchanged.
Existing snapshots use the fallback when opened; no saved record or API payload format was modified.

Validation:

- PASS: the save/merge/first-open regression reproduced the empty selection before the fix and passes afterward.
- PASS: 6 relevant suites / 54 tests, 13.164 seconds, including snapshot shapes/switching, project camera restoration,
  pose transfers and initial viewer presentation. Tests cover preserved saved/empty choices, direct display, filter
  alternatives, eligible tag ordering and repeated initialization without touching viewer state.
- PASS: no new ESLint findings against HEAD and clean whitespace checks for changed code. The actions retain five
  existing unused-variable warnings; the existing test retains its one pre-existing assertion-style finding.
- PASS: production build and backend stats validation, 75.934 seconds, with the two existing bundle-size warnings;
  Moorhen asset integrity, 275 assets / 114450225 bytes.
- NOT RUN: interactive Designs opening; no browser is connected. Reload, restore snapshot 4, then open Designs and
  confirm tag 79 is selected. Also restore a snapshot with an explicitly cleared tag selection and confirm it stays
  empty. Close/reopen Designs and recheck smooth snapshot switching.

## Scene settings parity (2026-10-02)

- Investigation: the removed frontend pinned NGL 2.0.0-dev.37. Its
  [viewer source](https://github.com/nglviewer/ngl/blob/v2.0.0-dev.37/src/viewer/viewer.ts) interprets near/far
  clipping and fog as percentages of the scene bounding radius, with 50 at the camera target. `clipDist` is a
  minimum camera-to-near-plane distance in Angstroms, not slab thickness. The warning switch controls eligible
  molecule-image warning icons independently of the viewer.
- Fix: keep the existing Redux/snapshot fields and translate percentages to Moorhen world distances in the adapter.
  Compute bounds from native mesh vertices/instance origins using a weak cache; never serialize/copy native handles.
  Convert Moorhen's view height to an equivalent NGL camera distance for the `clipDist` minimum. Moorhen has a
  different projection, so this is a view-size compatibility conversion rather than identical camera geometry.
- Fix: initialize and reapply parameters from the application store on snapshot restore without recreating the
  adapter/canvas. Recompute planes for scene geometry/zoom changes and prevent native zoom frames from replacing
  them with Moorhen's default slab. Restore the draw method and remove the zoom listener on actual teardown.
  Preserve native manual plane edits until the view or application settings change. Avoid redundant background
  dispatches when a slider updates; these caused unnecessary native representation redraws.
- Fix: restoring a different background exposed native molecule-card redraws racing snapshot removal, producing
  `Cannot pass deleted object as a pointer of type Structure`. Track and serialize these native redraw callbacks
  per molecule, drain active callbacks before deletion, and skip callbacks arriving after disposal starts.
- PASS: full Jest suite, 61 suites / 453 tests, 136.675 seconds; focused adapter/settings/host retest,
  3 suites / 62 tests. Coverage includes installed native clip/fog setters
  and zoom-frame scheduling, individual parameter edits, circular native buffers, geometry replacement/removal,
  listener cleanup, initial saved settings, snapshot settings updates retaining the same adapter/canvas, and native
  background redraws with delayed completion, circular buffer ownership, removal acknowledgement and late callbacks.
- PASS: production build and backend stats validation, 46.192 seconds, with the two existing bundle-size warnings;
  Moorhen asset integrity, 275 assets / 114450225 bytes. No new ESLint findings; the adapter test retains its
  59 existing findings. Clean whitespace checks.
- PASS (live Chrome, local Django/development bundle, A71EV2A / lb18145-1): fresh target load, black/white background,
  clip near/far extremes visibly hiding/revealing structures, `clipDist` 100 hiding structures and 10 restoring them,
  fog near 0 visibly darkening the scene, fog far 0 fading structures completely, and restored drawer defaults.
  Native plane/fog readbacks agree with the translated values. Warning switch state toggles; this target's visible
  rows have no eligible warning icons, so icon appearance itself was not visually verified.
- PASS (live): rotation, wheel zoom and Designs opening/closing retain the loaded scene and translated ranges.
  Existing snapshots 7 and 6 restore orientation and structures. Changing the background to white and `clipDist`
  to 100 before restoring snapshot 6 reapplies its black background and distance 10; native inspection confirms
  the same adapter instance survives. The deleted-Structure exception reproduced before the teardown fix and did
  not recur in the final repeat. No saved records were changed.
- NOT RUN: creating/updating a saved snapshot (the connected session is anonymous, with update controls disabled),
  unlocked draggable layouts, and a complete RHS transfer/memory audit. Panel width dragging was attempted but
  no width change was observed; layout-induced viewer resizing is covered by the host regression test.
