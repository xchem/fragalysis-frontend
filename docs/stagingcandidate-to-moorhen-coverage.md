# Migration coverage

Pinned revisions and batch order are in `stagingcandidate-to-moorhen-plan.md`. Status below is the initial disposition; tests and final implementation evidence will be updated as work proceeds. Commit abbreviations refer to full SHAs in the source history.

| ID | Source evidence and required final behavior | Target mapping / dependencies | Initial disposition | Acceptance evidence to collect |
| --- | --- | --- | --- | --- |
| SC01 | `32f0c13`, `docker-compose.dev.vector.yml`: default xchem stack for web, worker and beat | Same compose file; preserve Moorhen isolation mount | Already equivalent, verification pending | Inspect all three active images and target-only nginx mount |
| SC02 | `a6da985`, molecule `redux/dispatchActions.js` + new test: initial ligand and protein without artefact chains | `initializeMolecules`, already implemented in target `5dfe068` | Already equivalent, test pending | Focused initialization test; snapshot/direct load exclusions preserved |
| SC03 | `1df32d8`: `js/constants/poseNavigation.js` + test; selection actions/constants/reducer + action tests; rootReducer + new test; snapshot utility + tests | Same state paths and hydration entry points | Reimplement | Default remove-first/overlapped/centroid; valid partial updates; missing/invalid/legacy boolean snapshot defaults; no configuration leakage |
| SC04 | `1df32d8`: new `poseTransfer.js` + tests | New pure orchestration module, lodash + injected queue controls | Reviewed new-module adoption with compatibility validation | Per-control capture, filtered adjacent/first eligible poses, phased and overlapped order, retain unchanged shared objects, refresh changed shared objects, rollback, render waits and separate focus failures |
| SC05 | `1df32d8`: new `rhsPoseTransferConfig.js` + tests | Existing target molecule dispatch actions, generation helpers, objectsInView and rendered queue markers | Reviewed new-module adoption with camera adaptation | Ligand/protein/artefact/complex/surface settings, inspiration density/vector union, availability, customization, quality flags, selected-item removal fallback, render readiness and focus IDs |
| SC06 | `1df32d8`: ViewerAdapter, NglViewerAdapter + tests; ngl dispatchActions + tests: destination centering | Extend ViewerAdapter and MoorhenViewerAdapter; asynchronous thunks; no NGL imports | Reimplement with Moorhen | Deduplicate objects; average ligand centers equally, fit all geometry, horizontal widest separation, one/none cases, await camera before storing orientation |
| SC07 | `1df32d8`: new poseNavigationConfigPopover + test; poseList and poseListRHS | Existing MUI 7, RichTooltip and Redux config; SC03/04/05/06 | Reimplement / reviewed new popover | Config radios update settings; toolbar arrows choose first eligible visible-order source; serialize transfers; report errors and restore dialog context |
| SC08 | `1df32d8`: unified-view hooks/useFilters, wrapper, observationUnifiedView, detailView | Existing shared LHS/RHS table; SC04/07 | Reimplement | Full filtered/sorted navigation across pagination, row arrows only for transferable state, boundaries/disabled state, widths, stable refs and popover resets; target protein toggle remains |
| SC09 | `b756b7b` (#2343/#2345): observationsView + test, detailView/poseList, selection reducer | Same dialog ownership and stable observation references | Reimplement | Opening side owns dialog, another pose updates it, non-owner cannot steal it; redundant reference-identical updates return same state; no React feedback loop |
| SC10 | `0e48340` (#2360): directDownload + new test, downloadProgress | Existing direct tag endpoint and ToastContext | Reimplement with effect cleanup | Successful tasks download only on SUCCESS; backend failures alert and clear progress; retry status errors at 5 seconds up to three retries; malformed requests fail; pending work cannot update after unmount |
| SC11 | `b756b7b` (#2343/#2345): utils/api.js + new test | Existing Axios 0.19 wrapper, CSRF/remote-debug behavior | Reimplement | GET/HEAD unique query values, enforced case-insensitive no-cache headers, mutation params untouched, URL normalization, cancellation and caller headers preserved |
| SC12 | `789f735`: source-only AGENTS.md; `1df32d8` tooltips/tooltips.json navConfig entries | Adapted contributor notes under docs; existing tooltip data | Reimplement guidance and tooltip semantics; obsolete NGL implementation details inapplicable | Account for every source guidance section, preserve target framework/runtime/queue/snapshot contracts; tooltip paths resolve and refer to active viewer |

## File coverage audit

All 39 net-diff paths are covered above. Tests are included alongside their production behavior; deleted NGL adapter tests map to new native Moorhen centering regressions, not a restored NGL test/runtime. No package/lock/build/CI/assets were omitted: their net source diff is empty. Source has no merge commits in the six-commit interval; squashed changes and final follow-up fixes are included. No net changes are currently classified reverted/superseded or blocked. Complete source-only AGENTS guidance is documentation scope, not authority over target architecture.

## Initial counts

12 logical items: 2 already equivalent (pending checks), 10 requiring implementation/adaptation. Final counts and supporting checks are pending.

## Implementation progress

SC03-SC11 are implemented. New engine-neutral modules were reviewed before adoption; existing target files were edited semantically, never replaced from source. The new `usePoseTransferNavigation.js` and `poseTransferButtons.js` integrate shared navigation without duplicating row/toolbar logic. Moorhen camera operations use `gemmiAtomsForCid` and native origin/quaternion/zoom; no NGL runtime or dependency was restored. Moorhen removal waits check both selections and live object metadata, and transfer completion always waits for destination rendering even when centering is disabled. Direct downloads cancel timers and ignore late results after route teardown.

SC12 contributor guidance is adapted in `moorhen-contributor-contracts.md`, covering all source guide sections with obsolete NGL architecture explicitly identified. Navigation tooltip paths are added with viewer-neutral language. SC01 active images were already equivalent; SC02 initialization and its exact regression test were already present and pass. Full final validation/audit remains in progress.

## Final dispositions and evidence

12 logical changes accounted for: **10 implemented/adapted, 2 already equivalent, 0 wholly superseded, 0 wholly inapplicable, 0 implementation blockers**. Interactive validation remains NOT RUN, not implicitly passed. Source-specific NGL implementation details are replaced by Moorhen equivalents under SC06/SC12. No pre-BASE prerequisite was needed.

| ID | Final status | Evidence and remaining limits |
| --- | --- | --- |
| SC01 | Already equivalent | All three active images are xchem/fragalysis-stack:latest. Compose is identical to TARGET_START and retains docker/nginx/moorhen-isolation.conf mount. |
| SC02 | Already equivalent | Initialization implementation and test are identical to TARGET_START; focused test passes for protein + ligand and excludes artefacts. |
| SC03 | Implemented | Constants, selection action/reducer, full root hydration and snapshot normalization; constants tests, snapshot roundtrip/legacy tests and strengthened selection reload regression pass. |
| SC04 | Implemented/adapted | poseTransfer.test.js passes order, overlap, shared retention/refresh, rollback, delayed native deletion and focus failures. Every successful transfer awaits destination rendering. |
| SC05 | Implemented/adapted | rhsPoseTransferConfig.test.js verifies settings capture, maps, readiness, focus IDs and checkbox/native deletion separation. Live map/vector visuals remain NOT RUN. |
| SC06 | Implemented for Moorhen | MoorhenViewerAdapter.test.js verifies equal ligand weighting, fitting, horizontal separation, empty/single selections and async completion; Redux camera test waits before saving orientation; viewerBoundary.test.js passes. Exact native framing remains visually unverified. |
| SC07 | Implemented | Config radio test and usePoseTransferNavigation.test.js pass: ordered candidates, destination beyond page, single in-flight transfer, dialog handoff. JSX compiles in production. |
| SC08 | Implemented | Shared filtering function is applied to both rendered items and full navigation; adjacency tests and hook pagination/order test pass. Row width, toolbar layout and popover resets require manual smoke checks. |
| SC09 | Implemented | ObservationsView test verifies explicit owner and closing, constants test verifies stable observation identity, production effect now only claims unowned dialogs. |
| SC10 | Implemented/adapted | DirectDownload tests pass success, backend errors, three retries, malformed tags, unmount/late result cleanup; inline alert ends progress. |
| SC11 | Implemented | API tests pass GET/HEAD/default/lowercase methods, uniqueness, mutation params, custom headers, URL objects and CancelToken. Isolated cache-policy assertion fails against TARGET_START and passes against current code. |
| SC12 | Adapted | All source contributor-guide sections covered in docs/moorhen-contributor-contracts.md; obsolete NGL runtime/flag/allowlist/surface-worker guidance explicitly inapplicable. Navigation tooltips compile with active viewer wording. |

## Exact net-diff path audit

Each of the 39 source paths has an explicit mapping below; source history was rechecked against each commit's path list. In particular cache prevention belongs to b756b7b (#2343/#2345), while download error handling belongs to 0e48340 (#2360). No package, lockfile, build, CI or binary asset changes occur in the selected interval.

| Source path | Coverage | Target evidence / mapping |
| --- | --- | --- |
| `AGENTS.md` | SC12 | docs/moorhen-contributor-contracts.md; automatic NGL-specific instructions are not installed |
| `docker-compose.dev.vector.yml` | SC01 | Already equivalent; three default stack images and isolation mount verified |
| `js/components/direct/directDownload.js` | SC10 | Same target path; cleanup/late-result guards added |
| `js/components/direct/directDownload.test.js` | SC10 | Same target path; cleanup/late-result guards added |
| `js/components/direct/downloadProgress.js` | SC10 | Same target path; cleanup/late-result guards added |
| `js/components/preview/molecule/observationUnifiedView/hooks/useFilters.js` | SC08, SC09 | Same target paths; target protein toggle preserved |
| `js/components/preview/molecule/observationUnifiedView/observationUnifiedView.js` | SC08, SC09 | Same target paths; target protein toggle preserved |
| `js/components/preview/molecule/observationUnifiedView/observationUnifiedViewWrapper.js` | SC08, SC09 | Same target paths; target protein toggle preserved |
| `js/components/preview/molecule/observationUnifiedView/table/views/detailView.js` | SC08, SC09 | Same target paths; target protein toggle preserved |
| `js/components/preview/molecule/observationUnifiedView/table/views/observationsView.js` | SC09 | Same target path; owned-dialog regression test |
| `js/components/preview/molecule/observationUnifiedView/table/views/observationsView.test.js` | SC09 | Same target path; owned-dialog regression test |
| `js/components/preview/molecule/poseList.js` | SC07, SC09 | Same target path plus usePoseTransferNavigation.js/.test.js and poseTransferButtons.js |
| `js/components/preview/molecule/poseListRHS.js` | SC07 | Same target path; native RHS configuration/dialog lifecycle |
| `js/components/preview/molecule/poseNavigationConfigPopover.js` | SC07 | Reviewed new MUI 7 component/test |
| `js/components/preview/molecule/poseNavigationConfigPopover.test.js` | SC07 | Reviewed new MUI 7 component/test |
| `js/components/preview/molecule/poseTransfer.js` | SC04 | Reviewed new module/test; wait for native deletion and render completion |
| `js/components/preview/molecule/poseTransfer.test.js` | SC04 | Reviewed new module/test; wait for native deletion and render completion |
| `js/components/preview/molecule/redux/dispatchActions.js` | SC02 | Already equivalent production implementation and exact initialization test preserved |
| `js/components/preview/molecule/redux/dispatchActions.test.js` | SC02 | Already equivalent production implementation and exact initialization test preserved |
| `js/components/preview/molecule/rhsPoseTransferConfig.js` | SC05 | Reviewed new module/test; native deletion acknowledgement added |
| `js/components/preview/molecule/rhsPoseTransferConfig.test.js` | SC05 | Reviewed new module/test; native deletion acknowledgement added |
| `js/components/snapshot/redux/utilitySnapshotShapes.js` | SC03 | Same target path; settings defaults, migration and roundtrip tests |
| `js/components/snapshot/redux/utilitySnapshotShapes.test.js` | SC03 | Same target path; settings defaults, migration and roundtrip tests |
| `js/constants/poseNavigation.js` | SC03 | Same target path; settings defaults, migration and roundtrip tests |
| `js/constants/poseNavigation.test.js` | SC03 | Same target path; settings defaults, migration and roundtrip tests |
| `js/reducers/ngl/dispatchActions.js` | SC06 | Same target path; native async camera and mock ViewerAdapter tests |
| `js/reducers/ngl/dispatchActions.test.js` | SC06 | Same target path; native async camera and mock ViewerAdapter tests |
| `js/reducers/rootReducer.js` | SC03 | Same target path; settings defaults, migration and roundtrip tests |
| `js/reducers/rootReducer.test.js` | SC03 | Full hydration regression in js/constants/poseNavigation.test.js |
| `js/reducers/selection/actions.js` | SC03, SC09 | Same target paths plus js/constants/poseNavigation.test.js for config/identity |
| `js/reducers/selection/actions.test.js` | SC03, SC09 | Same target paths plus js/constants/poseNavigation.test.js for config/identity |
| `js/reducers/selection/constants.js` | SC03, SC09 | Same target paths plus js/constants/poseNavigation.test.js for config/identity |
| `js/reducers/selection/selectionReducers.js` | SC03, SC09 | Same target paths plus js/constants/poseNavigation.test.js for config/identity |
| `js/utils/api.js` | SC11 | Same target path |
| `js/utils/api.test.js` | SC11 | Same target path |
| `js/viewer/NglViewerAdapter.js` | SC06 | MoorhenViewerAdapter.js/.test.js and moorhenAdapterUtils.js |
| `js/viewer/NglViewerAdapter.test.js` | SC06 | MoorhenViewerAdapter.js/.test.js and moorhenAdapterUtils.js |
| `js/viewer/ViewerAdapter.js` | SC06 | Same target interface, implemented by Moorhen |
| `tooltips/tooltips.json` | SC12 | Same target path; viewer-neutral navigation text |

## Adaptation and adoption rationale

Only genuinely new source modules/tests were directly brought over after review: navigation constants, pure transfer engine, RHS control configuration, MUI navigation popover, and their new tests; new direct-download/API/dialog tests use compatible existing Jest/Testing Library infrastructure. The target's existing initialization test was detected and preserved. Existing target production files were authored in place, without source patch application or file replacement.

The pure engine retains source orchestration and injected controls, with target-specific waiting for asynchronous Moorhen deletion and completion even when camera focus is disabled. RHS controls retain historic Redux names because they remain the native target's serialized command/acknowledgement contract. Camera geometry uses per-molecule atom centers (matching native Moorhen centering), equal molecule weights, quaternion presentation and native diameter/40 fitting with margin/aspect correction, rather than NGL bounding boxes and camera-distance units. One native ligand retains existing fit scaling. This is a deliberate engine adaptation; exact visual framing needs the manual check.

Source row/toolbar logic is integrated through two small new shared components/hooks instead of duplicating orchestration in the existing large PoseList. Direct-download polling is owned by its route effect, with timer cleanup and stale-result protection. Source guide content lives under docs, without adding or changing AGENTS.md or restoring NGL.
