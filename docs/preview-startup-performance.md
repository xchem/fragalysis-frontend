# Preview startup performance (2026-11-17)

The full target download and existing list controls are unchanged. No API pagination, snapshot schema, viewer engine,
display queue, initial selection, or canvas lifecycle was changed.

## Changes

- Build temporary observation, tag-membership and compound-identifier indexes once per load. Pose and dataset assembly
  uses these indexes instead of repeatedly scanning the full target. Preserve source ordering, strict ID types,
  duplicate source records, object references and independent result arrays. Keep orphan poses and synthetic RHS poses.
- Compute a tag row's observation membership when its Select hits action is used. Previously every row scanned the
  target during mount and then rendered again to store the result. Memoize the selected-observation array passed to rows
  so unrelated parent updates do not redraw every row.
- Reuse one numeric, case-insensitive locale collator for tag-name sorting.
- Load Plotly through a local Suspense boundary when the Graphs panel mounts. The normal Preview starts with Designs
  closed, so the chart dependency is deferred. A saved layout with Designs open still loads its charts immediately.
  First opening may briefly show “Loading plots…”; the viewer and other panels stay mounted.

## Measurements

Chrome performance counters on the local development Preview recorded about 9.16 seconds of script execution, including React
development instrumentation. Plotly module initialization accounted for approximately 0.47 seconds in a fresh-load
trace even though Designs was closed. The production build now emits the 4.76 MiB chart dependency separately; its main
entry is 6.88 MiB. A live resource check confirmed the chart chunks were requested only after opening Designs.

An isolated Node 24.18.0 benchmark executed the previous and updated target-loading thunks with resolved API fixtures:
80 tags, one identifier and one pose per observation. Figures are medians of five runs after one warmup; emitted action
payloads were compared and were identical.

| Observations | Previous preparation | Updated preparation |
| --- | ---: | ---: |
| 930 | 21.92 ms | 1.89 ms |
| 5,000 | 541.16 ms | 9.36 ms |

These measure data preparation, not total page-load time. The browser baseline used a development bundle and the live
acceptance used the production build, so they do not establish a comparable overall startup speedup.

## Verification

- PASS: full Jest suite, 100 suites / 659 tests, 199.16 seconds. New coverage checks relationship traversal counts,
  ordering, strict IDs, duplicate memberships, independent arrays, orphan and synthetic RHS poses, activity ordering,
  stable tag-row props, current-data selection and deferred chart initialization.
- PASS: production build and backend stats validation, 30.641 seconds; two existing bundle-size warnings.
- PASS: Moorhen payload integrity, 275 assets / 114450225 bytes; targeted ESLint has no errors and existing unused-variable
  warnings only. Whitespace check uses `core.whitespace=cr-at-eol` for the existing tracked CRLF/mixed source files.
- PASS (live Chrome, local Django, A71EV2A / lb18145-1, production bundle): initial ligand/protein display, ligand off/on,
  rotation, tag Select/Unselect hits, Designs opening/closing/reopening, graph chunk loading and panel width resizing.
  The same canvas DOM object survived resizing and Designs toggles. No console errors were recorded. This target has
  no graph datasets, so plotting interactions could not be exercised.
- NOT RUN: authenticated snapshot save/restore, smooth same-project snapshot transitions, incremental snapshot removals,
  draggable layout switching and complete RHS transfer/memory acceptance. Snapshot/viewer/transfer automated coverage
  passes, but it does not replace these interactive checks. No saved snapshots were modified.

## Tooltip initialization pass against the current baseline (2026-11-17)

The baseline for this pass is commit `56738bc9b5b13f5dbecb5ef2157feae8324979f0`, which already includes the preceding
optimizations. Both sides of this comparison include those earlier changes.

- Defer the Markdown body and its style hook until MUI mounts the tooltip content. Closed tooltips still retain MUI's
  existing hover/focus/touch handling, delays, arrow and wrapper styling. Help text, links and path hints keep their
  previous markup and styles.
- Share one pair of window Shift listeners across mounted tooltips and remove them when the last tooltip unmounts.
  Shift presses update engaged tooltips; inactive tooltips avoid a React update. Hover/focus reads the shared modifier
  state, including Shift held before entering a control.
- Define the styled tag-mode switch once so parent updates preserve its DOM identity and keyboard focus.

### Production-browser measurements

Five alternating baseline/candidate pairs were run after warming both builds, in the same in-app Chromium browser at
1280 x 720 on the local Django stack, A71EV2A / lb18145-1. Every run loaded 930 observations, 736 LHS poses, 22 fetch/XHR
resources and three registered viewer objects. Designs remained closed. The baseline production asset was
`main-cdfc157794c118230912.js`; the candidate was `main-34220c6cab13a04365f0.js`. Distinct source hashes and runtime build
markers were checked, and identical temporary timing probes were applied to both. These were actual UI/viewer loads,
not synthetic data-preparation fixtures.

| Metric | Current baseline median (range) | Updated median (range) |
| --- | ---: | ---: |
| Main-thread startup work, network waiting excluded | 2,206 ms (2,043–2,274) | 2,073 ms (2,045–2,112) |
| JavaScript execution within that work | 1,125 ms (1,024–1,133) | 995 ms (976–1,023) |
| UI ready after final fetch/XHR response | 228 ms (224–237) | 229 ms (225–238) |
| Bundle execution to UI ready, including download waits | 7,867 ms (7,396–8,253) | 7,968 ms (7,796–8,146) |

Median main-thread work decreased by approximately 6%; JavaScript execution decreased by approximately 12%. The final
post-download tail was unchanged within variation. The overall wall-clock figures include variable backend/network
waits and do not establish an overall page-load improvement.

Main-thread work is Chrome's `TaskDuration` minus `DevToolsCommandDuration`; it includes JavaScript, layout, style and
other renderer work, while excluding network idle time. This is CPU work, not a reconstructed elapsed time with all
download intervals removed. Readiness required LHS/RHS data loaded, the existing fully-rendered UI marker, acknowledged
display intents, zero pending main-view objects and removal of the blocking modal, followed by a paint opportunity.
The post-data metric measures only the remaining tail, because UI work also occurs while downloads are in progress.

| Pair | Baseline main-thread work | Updated main-thread work |
| --- | ---: | ---: |
| 1 | 2,043 ms | 2,112 ms |
| 2 | 2,206 ms | 2,045 ms |
| 3 | 2,274 ms | 2,103 ms |
| 4 | 2,086 ms | 2,069 ms |
| 5 | 2,207 ms | 2,073 ms |

Raw measurements and probe metadata are in ignored `bundles/preview-benchmark/round2-browser-results.json` for this
workspace. The backend stats were restored to the normal candidate production bundle after testing.

### Validation and remaining caveat

- PASS: 100 Jest suites / 663 tests, 157.324 seconds. Regressions cover deferred content styles, shared listener cleanup,
  avoiding inactive-tooltip updates, Shift held before hover, path hints, Markdown/link overrides, Alt interaction and
  closing transitions. Tag-switch identity and keyboard focus survive observation data updates.
- PASS: production build and backend stats validation, 34.543 seconds, with the two existing bundle-size warnings;
  275 Moorhen assets / 114450225 bytes verified. Targeted ESLint has no errors and the two existing unused imports only.
- PASS (live): normal tooltip hover, Shift-hover path discovery, and Alt entry into tooltip content followed by
  dismissal with the production build. The target and native scene render successfully; no console errors were recorded.
- Existing mismatch with AGENTS.md: `showDebugPathOnly` allows Shift to reveal a path for `disabled: true`, despite the
  guide describing complete suppression. This pass preserves the current implementation; that separate behavior has
  not been changed.
