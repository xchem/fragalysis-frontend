# NGL viewer restoration

NGL was restored on 2026-11-13 at the user's request. The stage 19 switch had been removed together with the NGL
implementation in stages 20–21, so changing the old environment flags alone could not select NGL.

## Selecting the viewer

`js/config/viewer.js` now selects the application viewer before building:

```js
export const VIEWER_ENGINE = 'ngl';
```

Set this constant to `moorhen` to select Moorhen again, rebuild, and reload the Django application. `ViewerView`
lazily mounts only the selected host. There is no automatic fallback or runtime rollout/rollback setting.
`USE_NGL_STYLE_INTERACTIONS` remains a separate Moorhen contact-rendering preference.

The restored NGL package is pinned to the previous `2.0.0-dev.37` version. Its host, adapter, rendering helpers,
quality glyph mesh and surface worker workaround were recovered from the parent of commit `553d94da` and adapted
to the current application contracts. Moorhen and its matching static payload remain installed and build-verified.

## Compatibility retained

- Application rendering stays behind `ViewerAdapter`; registered native viewers resolve through `asViewerAdapter`.
  The factory continues to reject unregistered objects. The boundary test confines native calls to engine implementations.
- Preview retains one viewer through its reverse portal. Listener changes and layout moves do not destroy it; actual
  teardown unregisters it and drains pending native work before disposal.
- The current display hooks, structure operation queues, pose transfers, Redux state names, snapshot payloads and
  in-place snapshot-switching implementation remain in use.
- NGL operations serialize loads, replacement and removal by logical object name. Removal waits for pending coordinate
  loads and representation tasks. Temporary source components, quality shapes, event maps and difference maps are
  owned and disposed with their logical object. Difference maps use one native component with two contours.
- Redux receives detached representation descriptors. Native components, circular parent references, buffers and
  readiness promises remain outside serialized application state. Representation edits can resolve auxiliary components.
- Snapshot cameras accept historical NGL matrices and Moorhen's eight-element camera format. The latter converts
  orthographic view height to perspective camera distance using NGL's field of view. This preserves framing
  approximately across different projections; it does not equate Moorhen zoom with NGL camera distance.
- Snapshot camera animation uses elapsed time, supports supersession, abort, teardown and manual interruption, and
  settles before the existing snapshot actions apply destination structure intent.
- Multi-ligand centering retains equal per-ligand weighting and horizontal alignment of the widest separation.
  Protein/artefact rendering excludes bound `LIG`; complex rendering still merges its ligand explicitly.
- The Moorhen editing warning appears only when Moorhen is selected.

## Verification

- Immutable install: Node 24.18.0 / Yarn 4.17.1. Existing peer warnings remain.
- Full Jest suite: 76 suites / 559 tests passed before the final small warning/representation-lookup changes.
  Focused final checks cover both engine hosts, native adapters, circular handles/buffers, delayed loads, map removal,
  redraw acknowledgement, failed rendering and retry, camera conversion/cancellation, centroid fitting, display hooks,
  queues, snapshots and pose transfers. Results are recorded separately from live rendering below.
  Final host/selection/NGL-adapter retest: 4 suites / 22 tests passed; changed and restored implementation files
  and the new tests pass targeted ESLint.
- Production build and backend stats validation pass with the existing two bundle-size warning categories.
- Moorhen asset integrity: 275 files / 114450225 bytes.
- Live Chrome against local Django, A71EV2A / lb18145-1: NGL marker and one canvas; initial protein, ligand and
  sidechains; ligand off/on with actual disappearance/reappearance; viewer rotation; Designs opening and canvas
  resizing; RHS design ligand loading and forward/back transfer; density rendering and removal. No console errors
  were reported during those checks.
  The final build was reloaded and again showed one NGL canvas, no blocking dialog and no Moorhen editing warning.
  The backend's existing "Status of services is not available" toast remains unrelated to viewer initialization.
- Snapshot save/restore and same-project visual transition acceptance were not exercised: no snapshots were listed
  in the available target session, including with the mine/starred filters cleared. No saved records were created
  or changed. These workflows retain automated coverage but still need live acceptance with suitable project data.
- A full shared-inspiration protein/map transfer matrix, unlocked layout dragging, long-run memory monitoring,
  surface/quality visual parity and secondary-viewer workflows remain unverified interactively.

Reload before testing so resources from a previously loaded viewer do not contaminate the result. Use the Django
application, not the standalone bundle server or isolated Moorhen proof route.

## Progressive bulk ligand loading and responsiveness (2026-11-13)

The initial restoration used the global NGL stage task counter before starting an object and after its representations
were created. An unrelated native load could therefore block an already downloaded ligand. Object readiness and
deletion now wait for that object's representation counters, including hidden measurement representations. Whole-view
capture/progress and teardown retain their whole-view scope; same-name operations remain ordered.

The LHS bulk path also issued three Redux actions per ligand and rescanned selected IDs against every control-map
entry on each render. For 930 ligands, the regression fixture observed 432915 ID reads in one control calculation.
The control lookup now builds a memoized ID set with 930 reads, performs linear membership checks, and reuses its
result on unchanged inputs. Its returned object retains its identity when the three disabled flags do not change.

Bulk ligand publication now uses three Redux updates for the entire group instead of 2790: disable its controls,
append all requested intents, then restore the controls. Existing queue entries, tombstones, object identities and
representation settings are retained. The payload/state shapes of individual requests and saved snapshots are unchanged.

Live bulk intents are marked in a WeakSet outside Redux and admitted four at a time through coordinate download and
native readiness. Each freed slot yields a browser task before admitting another request. Waiting work is read from
the current Redux queue, so canceled or replaced snapshot intents do not start later. Removing a waiting ligand uses
its name without downloading its coordinates. Fetch/render errors release slots and clear failed intents; native
removal still waits for buffer disposal. Individual and pose-transfer requests keep their existing independent path.

The scheduling limit is `LHS_BULK_LIGAND_CONCURRENCY` in `js/config/viewer.js`; neither that setting nor the WeakSet
marks are saved in snapshots. Snapshot clones use their existing scheduling path.

Rows now subscribe to their own observations' display subsets rather than every global selection array. Membership
indices live outside Redux, preserve strict ID matching and density-object handling, and are rebuilt for new snapshot
arrays. Subsets retain their identity until their observation references change. An unchanged row in the 930-completion
fixture previously redrew 930 times and now redraws zero times; its own changes still update its controls and removal
subsets. Stable column callbacks and omission of inactive LHS transfer callbacks preserve that isolation when the parent
table rerenders. Configured RHS transfer callbacks, dialog ownership and anchoring remain in use.

The persistent Display controls drawer and its representation editors also subscribed to every object-registry change
while closed, rebuilding an ever larger hidden tree. They remain mounted but pause those subscriptions while hidden
and receive the latest registry when reopened. Open editors and color pickers keep updating even if their parent
drawer/menu closes. Deleted objects are tolerated by a still-mounted editor. The controls fixture confirms zero hidden
tree/editor redraws through 930 updates, fresh contents on reopen, and retained active editor identity.

Validation: the downloaded-ligand/unrelated-task test and the 930-ID lookup test both failed before their respective
fixes. The full suite passes 82 suites / 599 tests; the three final hidden-controls/editor checks also pass.
The final UI/membership retest passes 4 suites / 13 tests. Integration tests cover 930 durable intents, three-update
publication, bounded concurrency, out-of-order completions, yielding, cancellation before download, native disposal,
redraws added during pending work, fetch/render failure, Strict Mode, unmount and snapshot replacement.
The production bundle and backend stats validator pass with the existing two bundle-size warning categories;
Moorhen payload verification still passes (275 files / 114450225 bytes).

Live Chrome acceptance against local Django, A71EV2A / lb18145-1, final bundle `main-9664077c6cf2ac94c762.js`:

- Reloaded before the test, removed the initial ligand, selected all tags (736 poses / 930 observations), disabled
  browser HTTP caching for the check, then requested all 930 ligands once. No reload occurred during that request.
- Native rendering and Redux acknowledgement progressed through 13, 250, 550, 817 and all 930 ligands. Final checks
  found 930 matching native/Redux ligand objects, one canvas, zero pending operations, zero stage tasks, a visible
  viewer and no lost WebGL context or console errors. The bulk progress bar disappeared on completion.
- Designs opened and closed during loading without losing the viewer. The Display controls drawer populated with
  current structures on opening and closed again. Opening its hundreds of visible entries remains expensive; this
  optimization avoids repeatedly doing that work while it is closed.
- All 930 were confirmed approximately 10.5 minutes after the request, including the large-drawer interaction. This
  is a functional acceptance run, not an isolated throughput benchmark. Large scenes still require substantial work.
- Normal browser HTTP caching was restored afterward. The completed scene was saved as
  `ngl-930-ligands-complete.jpg` in the session's visualization directory.

An earlier build also verified individual ligand removal/readdition while the bulk queue continued, plus viewer
rotation during loading. Snapshot live-acceptance limitations listed above still apply; no saved records were changed.

## Further bulk-loading optimization (2026-11-13)

The previous 10.5-minute acceptance run exposed substantial application UI work beyond coordinate download/native
rendering. The following changes preserve rendering parameters, coordinates, snapshot shapes and operation ordering:

- `LoadingProvider` memoizes the context's exposed flags/setters. A regression fixture previously caused 931 consumer
  renders for 930 acknowledgements with unchanged flags; those renders are now suppressed while progress still updates.
- Pose membership uses linear indices, retains the same pose results when membership/order/references agree, and
  reuses natural-sort collation and sort callbacks. Selected-observation augmentation still returns an owned array for
  the existing tag-editor append/sort flow. Numeric/string identity, first-match handling and selected-first order remain.
- Column filtering checks the displayed-pose override once per item and only while enabled; inactive sorts preserve
  the input order without a redundant sort. Displayed-ID and inspiration membership indices are shared across rows.
  Regression fixtures reduced their respective ID reads from 432915 and 864900 to 930.
- Display controls uses the installed MUI data-backed tree with the same logical object/representation IDs and ordering.
  Stable slot callbacks and semantic JSX/children comparisons prevent unchanged styled TreeItems from rerendering on
  additions. A real-tree regression confirms zero renders of an existing styled item when an independent item is added;
  its own expansion, focus, selection and appearance updates still work.
- Cheap labels resolve the current display model and select their own object; memoized controls retain their state.
  A shared observer constructs controls on first viewport visit and preserves them across scrolling/drawer closing.
  Stable registered callback refs observe actual attachment, including nodes created after mount. The tree's existing
  collapse/removal lifecycle remains in use. Existing editors/color pickers keep updating, and actions read live state.
- Representation display sorting uses a copy. Group visibility still follows the first displayed representation,
  including mixed-visibility groups. Tests exercise circular native references/buffers without copying native handles.

Verification: 90 suites / 618 tests pass; production bundle and backend stats validation pass; the matching Moorhen
payload still verifies (275 files / 114450225 bytes). Targeted lint has no errors; the existing dataset unused-variable
warnings and deliberate pose-list dependency warning remain. Live acceptance uses `main-1076dbf67f830859a040.js`.

Timing method: local Chrome/Django, A71EV2A / lb18145-1, fresh page, initial ligand removed, all tags selected, then one
930-ligand bulk request. Browser HTTP caching is disabled for coordinate loading. A temporary store listener starts at
publication of the complete intent, checks native/Redux readiness, and records the next two animation frames. Tree
opening is timed from its click through model population and painting. These are single local end-to-end observations,
not a hardware-independent benchmark. Normal caching and temporary timing listeners are restored/removed afterward.

The corrected open-drawer run completed all 930 in 181.35 seconds, with the first ligand ready in 0.83 seconds.
During that run, 436 rendered ligands had 84 live controls for visible/overscan rows; offscreen controls initialized
when scrolled into view. The final registry/queue checks found 930 matches, one canvas, zero pending native operations
and zero stage tasks. Opening, scrolling, expansion, editing and visibility were checked interactively as well as in
the real-tree tests. The final closed-drawer/first-opening measurements are recorded below.

| Latest-build operation | Observed time |
| --- | ---: |
| First ligand ready, drawer closed | 0.83 s |
| All 930 ready and painted, drawer closed | 110.73 s (1 min 51 s) |
| All 930 ready and painted, drawer open throughout | 181.35 s (3 min 1 s) |
| First Display controls opening after all 930 loaded | 2.93 s |

The first opening contained 932 object rows (930 ligands plus two protein objects) and 66 initialized buttons for
visible/overscan controls. Scrolling to the final rows initialized their controls; returning to the top preserved the
expanded first representation. Its editor opened with the current parameters, and its visibility toggled the native
representation off and back on. Final checks again found all 930 matching native/Redux ligands, one canvas, no pending
native operations or stage tasks, no lost WebGL context and no console errors. Normal browser HTTP caching was restored.
The verified scene was saved as `ngl-930-optimized.jpg` in the session's visualization directory. The closed-drawer run
is approximately 5.7 times faster than the earlier 10.5-minute acceptance observation; the different drawer interactions
in that earlier run mean this is an end-to-end comparison rather than an isolated throughput speedup.
