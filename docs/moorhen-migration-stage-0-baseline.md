# Moorhen Migration Stage 0 Baseline

Created: 2026-07-10T09:01:39+02:00

Branch: `#1812-moorhen`

Baseline commit: `31863768`

Workspace note: Stage 1 CI/test files were already present in the working tree when this baseline was captured. No production application code was changed by Stage 1 or Stage 0.

## Environment

| Item | Value |
| --- | --- |
| OS | Windows 11 Pro 10.0.26100 |
| Node | `v22.22.3` |
| Yarn | `1.22.22` |
| React | `^18.2.0` |
| ReactDOM | `^18.2.0` |
| Webpack | `^4.41.5` |
| Cypress | `^15.11.0` |

## Command Baseline

| Check | Command | Result |
| --- | --- | --- |
| Install | `yarn install --frozen-lockfile --non-interactive` | Passed. Already up-to-date. |
| Unit tests | `yarn test:ci` | Passed. 9 suites, 64 tests. |
| Production build | `yarn build` | Passed. Webpack 4.46.0 build completed in 34368 ms. |
| Diff whitespace | `git diff --check` | Passed, with existing LF/CRLF working-copy warnings only. |

## Test Output Baseline

`yarn test:ci` passed the current reducer/helper test suite:

- `js/reducers/ngl/dispatchActions.test.js`
- `js/reducers/selection/actions.test.js`
- `js/reducers/api/actions.test.js`
- `js/components/snapshot/redux/utilitySnapshotShapes.test.js`
- `js/reducers/ngl/actions.test.js`
- `js/components/preview/molecule/utils/computedInspirations.test.js`
- `js/components/target/sortTargets/sortTargets.test.js`
- `js/components/preview/molecule/useScrollToSelectedPose.test.js`
- `js/components/nglView/surfaceRepresentationUtils.test.js`

Known test-console noise:

- `loadObject - entry`
- `Switch - Before object is loaded: 1`
- `Object loaded: 1`

## Bundle Baseline

Latest emitted files:

| File | Size |
| --- | ---: |
| `bundles/main-5df0545430d68da29070.js` | 14065961 bytes |
| `bundles/main-5df0545430d68da29070.js.LICENSE.txt` | 11792 bytes |

`webpack-stats.json` shape:

```json
{
  "topLevelKeys": ["status", "chunks"],
  "status": "done",
  "chunkNames": ["main"],
  "mainChunkItemKeys": ["name", "path"],
  "mainChunkName": "main-5df0545430d68da29070.js"
}
```

Compatibility note: later Webpack migration stages should preserve the backend-facing `status` plus `chunks.main[].name/path` contract unless the backend is updated at the same time.

## Browser Baseline

Browser screenshots/videos and browser console capture were not completed locally.

Local blockers:

- The in-app browser connector exposed no available browser backends in this session.
- `yarn cy:smoke` failed before launching tests on Windows after a forced Cypress binary reinstall:
  - `Cypress.exe: bad option: --smoke-test`
  - exit code `3221225501` when Cypress verification was skipped.
- The existing remote Cypress base URL timed out from this machine:
  - `https://fragalysis-simona-default.xchem-dev.diamond.ac.uk/viewer/react/landing/`

Stage 1 browser smoke is therefore the first place where CI can produce the missing screenshot/video and console-error baseline, provided it runs from an environment with a reachable `CYPRESS_BASE_URL`.

## Suggested Baseline Flows Still Needed In Browser

- target/project list
- preview page layout
- molecule table interactions
- NGL viewer initial load
- protein, ligand, complex, density/map loading
- density/map display controls
- molecule group selection
- tags
- snapshot save and restore
- dialogs/forms/job launch flows
- screenshot/export flows

## Working-State Gate

Install, unit tests, production build, and bundle stats are baselined and passing. Browser visual/console evidence remains pending because the local browser/Cypress environment could not launch and the configured remote dev URL was not reachable from this machine.
