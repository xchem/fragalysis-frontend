# stagingcandidate to Moorhen migration

## Baseline and scope (2026-09-10)

- Repository: `m2ms/fragalysis-frontend`, remote `origin` verified by URL.
- Branch: `#1812-moorhen`; TARGET_START: `5dfe068cfa60af2f095c64d1953bb490e97c9f84`.
- Inclusive START: `32f0c133d8e0297c419c3a316547a1702a4169d2`.
- BASE: `1a67ec628aff1488b907894a75006a13fe129541` (START's only parent).
- SOURCE_TIP: `0e48340d0e419a0c4e2bf1ac4b122b2817d33b30`.
- `git fetch --no-tags origin 'stagingcandidate:refs/remotes/origin/stagingcandidate'` succeeded. Local and fetched source refs match SOURCE_TIP. START is an ancestor of SOURCE_TIP.
- Six commits, no merge commits in this interval; two commits contain squashed histories. Both their final patches and the net diff are reviewed. Net scope: 39 files, 4512 additions / 107 deletions.
- Target/source common ancestor: `cd2ba2318ca43728ce73042220a807f094ee33f5`.
- Initial staged changes: none. Unstaged changes: none. Untracked files: none. No unfinished Git operation.
- No applicable AGENTS.md or AGENTS.override.md found in repository or ancestor directories. Existing planning location is `docs/`; existing Moorhen stage and parity documents were read as architecture context. The source-only AGENTS.md is scope evidence, not an instruction to restore NGL or overwrite local guidance.

## Architecture to preserve

Moorhen 0.22.7 is the only viewer; NGL and its adapter were intentionally removed. Preserve the single reverse-portal canvas, opaque stage compatibility handles, viewer adapter boundary, native Moorhen molecule/map lifecycle, asynchronous failure propagation, representation stash, and legacy serialized Redux/object names. Preserve target protein toggle behavior, sidechain initialization, ligand fit scaling, cross-origin isolation configuration, and manually triggered CI.

Use Node 24.18.0, Corepack 0.35.0, Yarn 4.17.1, React 19 / MUI 7 GridLegacy, local TSS styles, JavaScript, existing Redux command/render acknowledgement queues and Jest infrastructure. The selected source interval has no package, lockfile, build, CI, image or other binary asset changes. No dependency upgrade is planned.

## Executable batches

1. Establish baseline checks and document all 12 inventory entries in the coverage report. Install missing dependencies with `yarn install --immutable`; initial test/build failures are environment failures, recorded separately. Inspect source tests and target call chains before their batch.
2. Add navigation constants/normalization, reducer action and snapshot hydration handling (SC03). Review/adopt genuinely new engine-neutral transfer and RHS control modules (SC04/05), retaining existing target queue contracts. Add `ViewerAdapter.centerOnObjects`, implement native Moorhen centering and asynchronous centering thunks in `js/reducers/ngl/dispatchActions.js` (SC06). Run focused settings, transfer, snapshot, adapter and boundary tests early.
3. Wire RHS configuration, row/toolbar arrows, full filtered/sorted navigation, pagination, dialog cleanup/reanchoring into `poseList.js`, `poseListRHS.js` and the unified observation view (SC07/08/09). Preserve the target-only protein toggle block. Adapt tooltip text to the active viewer (SC12).
4. Reimplement direct-download success/failure polling and cleanup (SC10), then request cache prevention with existing Axios/CSRF/cancellation behavior (SC11). Add focused regressions. Verify already-equivalent default backend and initial ligand/protein behavior (SC01/02).
5. Account for source contributor guidance in an adapted document under `docs/` (SC12); retain Moorhen-specific contracts and identify obsolete source guidance explicitly. Run whole unit suite, production build/stats, static asset verification, targeted lint and whitespace checks. Inspect browser runtime/backend availability and perform safe smoke checks where practical; otherwise record exact NOT RUN workflows.
6. Audit every source path and logical change, new files and target diff; update all three migration documents. Leave work uncommitted on the current branch.

## Decisions and high-risk checks

- New self-contained constants, transfer engine, RHS configuration and navigation popover may be adopted only after dependency review. Engine code depends on existing lodash and injected control callbacks; RHS configuration uses existing queue thunks and legacy state fields still used by Moorhen. Its camera entry points must be adapted to await native operations. Tests may be brought over only as new files after checking mocks/imports.
- Source multi-object fitting uses NGL matrices, boxes and synchronous APIs. Reimplement with Moorhen atom geometry and origin/quaternion/zoom state; equal-weight ligand centers, union fit and horizontal widest separation remain acceptance requirements. Exact visual framing needs runtime validation.
- Removal completion must use the target's awaited viewer deletion path; selection alone is insufficient for render readiness. Check overlap/reload/failure tests and preserve original errors.
- Source initial ligand/protein initialization already exists in TARGET_START. Add/retain evidence without reintroducing artefacts.
- Source guidance naming NGL as runtime and default CI behavior is inapplicable to the experiment; document equivalent contracts without creating AGENTS.md.
- No pre-BASE prerequisite scope extension identified: required pose/UI/queue infrastructure already exists on target. Reassess if implementation proves otherwise.

## Current progress and handoff

Implementation and source coverage audit complete. All 39 source paths have supported dispositions: 10 logical changes implemented/adapted, 2 already equivalent. Full unit suite passes (38 suites / 238 tests), production build/stats and 275 static assets pass. The subsequent strengthened legacy selection-reload assertion passes its focused suite. Targeted production lint has 0 errors and 9 reproduced baseline warnings. Package/lockfile, compose/isolation, manual CI, initial display behavior and target protein toggle are preserved.

No pre-BASE prerequisite extension was needed. Moorhen removal and camera timing adjustments are necessary adaptations of selected source navigation behavior. The source engine's unused global-clear helpers were removed after using scoped entry deletion waits; no existing target code was deleted. Source-only contributor guidance was adapted under docs, without creating AGENTS.md.

Browser discovery returned no connections and local frontend/backend ports refused connections. Interactive checks remain NOT RUN. Next concrete step before mainline integration: start the configured local stack and frontend, connect a browser, and execute the eight manual workflows in the validation report, especially camera framing, map/vector transfer, layout/dialog ownership and snapshot restoration. Existing unrelated PoC parity gaps remain in the existing Moorhen backlog. No claim of production readiness or automatic future integration compatibility is made.

Changes remain uncommitted and unpushed on #1812-moorhen. HEAD is unchanged at TARGET_START and the index is empty. There was no pre-existing user work to distinguish. No local branch switch, merge, rebase, cherry-pick, patch replay, source-file replacement, history rewrite or cleanup was used.

## Changed files

24 modified files and 18 new files (42 total), including these four migration/contributor documents. Generated build output and dependency cache are ignored.

### Modified

- `js/components/direct/directDownload.js`
- `js/components/direct/downloadProgress.js`
- `js/components/preview/molecule/observationUnifiedView/hooks/useFilters.js`
- `js/components/preview/molecule/observationUnifiedView/observationUnifiedView.js`
- `js/components/preview/molecule/observationUnifiedView/observationUnifiedViewWrapper.js`
- `js/components/preview/molecule/observationUnifiedView/table/views/detailView.js`
- `js/components/preview/molecule/observationUnifiedView/table/views/observationsView.js`
- `js/components/preview/molecule/poseList.js`
- `js/components/preview/molecule/poseListRHS.js`
- `js/components/snapshot/redux/utilitySnapshotShapes.js`
- `js/components/snapshot/redux/utilitySnapshotShapes.test.js`
- `js/reducers/ngl/dispatchActions.js`
- `js/reducers/ngl/dispatchActions.test.js`
- `js/reducers/rootReducer.js`
- `js/reducers/selection/actions.js`
- `js/reducers/selection/actions.test.js`
- `js/reducers/selection/constants.js`
- `js/reducers/selection/selectionReducers.js`
- `js/utils/api.js`
- `js/viewer/MoorhenViewerAdapter.js`
- `js/viewer/MoorhenViewerAdapter.test.js`
- `js/viewer/ViewerAdapter.js`
- `js/viewer/moorhenAdapterUtils.js`
- `tooltips/tooltips.json`

### New

- `docs/moorhen-contributor-contracts.md`
- `docs/stagingcandidate-to-moorhen-coverage.md`
- `docs/stagingcandidate-to-moorhen-plan.md`
- `docs/stagingcandidate-to-moorhen-validation.md`
- `js/components/direct/directDownload.test.js`
- `js/components/preview/molecule/observationUnifiedView/table/views/observationsView.test.js`
- `js/components/preview/molecule/poseNavigationConfigPopover.js`
- `js/components/preview/molecule/poseNavigationConfigPopover.test.js`
- `js/components/preview/molecule/poseTransfer.js`
- `js/components/preview/molecule/poseTransfer.test.js`
- `js/components/preview/molecule/poseTransferButtons.js`
- `js/components/preview/molecule/rhsPoseTransferConfig.js`
- `js/components/preview/molecule/rhsPoseTransferConfig.test.js`
- `js/components/preview/molecule/usePoseTransferNavigation.js`
- `js/components/preview/molecule/usePoseTransferNavigation.test.js`
- `js/constants/poseNavigation.js`
- `js/constants/poseNavigation.test.js`
- `js/utils/api.test.js`
