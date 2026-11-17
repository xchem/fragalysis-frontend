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
