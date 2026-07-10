# Moorhen Migration Stage 2 Package Hygiene

Created: 2026-07-10

## Scope

Stage 2 intentionally avoids major upgrades. No React, MUI, Webpack, Node, Yarn, or viewer dependency upgrades were made.

## UUID Import Cleanup

The app now imports UUID generation through `js/utils/uuid.js`.

Changed direct UUID call sites:

- `js/components/header/errorReport.js`
- `js/components/datasets/useScrollToCompound.js`
- `js/components/snapshot/modals/downloadStructuresDialog.js`
- `js/components/preview/molecule/poseListRHS.js`
- `js/components/preview/molecule/rhsCmpList.js`
- `js/components/preview/tags/details/tagDetails.js`
- `js/components/preview/tags/redux/dispatchActions.js`

`uuid` package version was not changed. Current installed version is `3.4.0`, resolved from the existing `^3.2.1` dependency range.

## Package Removals

No packages were removed in this stage.

Rationale: Stage 0 showed that local browser smoke and screenshot capture are not available yet. Removing packages without browser coverage would increase migration risk and does not match this stage's low-risk cleanup goal.

## React Peer Dependency Risks

Direct dependencies whose installed peer metadata excludes React 18 or is clearly React-16-era:

| Package | Installed | React peer | ReactDOM peer | Notes |
| --- | ---: | --- | --- | --- |
| `@material-ui/core` | `4.12.4` | `^16.8.0 || ^17.0.0` | `^16.8.0 || ^17.0.0` | Old MUI v4; planned for Stages 11-12. |
| `@material-ui/icons` | `4.11.3` | `^16.8.0 || ^17.0.0` | `^16.8.0 || ^17.0.0` | Old MUI v4 icon package. |
| `@material-ui/lab` | `4.0.0-alpha.61` | `^16.8.0 || ^17.0.0` | `^16.8.0 || ^17.0.0` | Old alpha lab package. |
| `enzyme-adapter-react-16` | `1.15.7` | `^16.0.0-0` | `^16.0.0-0` | React 16 test adapter; planned for Stage 10 removal. |
| `formik-material-ui` | `2.0.1` | `^16.8.0` | - | Tied to old Material UI/Formik integration. |
| `formik-material-ui-pickers` | `0.0.8` | `^16.8.0` | - | Tied to old picker stack. |
| `react-canvas-draw` | `1.2.1` | `16.x || 17.x` | - | Does not declare React 18 support. |
| `react-event-timeline` | `1.6.3` | `>= 0.14.0 < 17.0.0-0` | - | Explicitly older than React 17. |
| `react-grid-gallery` | `0.5.6` | `^15.0 || ^16.0` | - | React 15/16-era gallery component. |
| `react-svg-inline` | `2.1.1` | `^0.14.9 || ^15.3.0 || ^16.0.0` | - | React 16-era inline SVG package. |

Additional hygiene notes:

- Both old `@material-ui/*` and newer `@mui/*` packages are installed. That coexistence is expected before the staged MUI migration, but it is a major risk area for React 19.
- `enzyme`, `enzyme-adapter-react-16`, and transitive React 16 testing packages should be removed before React 19.
- `uuid` remains on the v3 line for now; the local wrapper isolates future movement to a modern UUID package API.
- Webpack 4-era loaders (`url-loader`, `file-loader`, older CSS/style loader stack) are intentionally left for Stage 6.

## Working-State Gate

The intended Stage 2 working-state gate is:

- `yarn test:ci`
- `yarn build`
- `yarn cy:smoke` when Cypress can launch and `CYPRESS_BASE_URL` is reachable

## Verification Result

Executed on 2026-07-10:

| Check | Result |
| --- | --- |
| App UUID imports | Passed. No app code imports `uuid` or `uuid/v4` directly. |
| `git diff --check` | Passed, with existing LF/CRLF working-copy warnings only. |
| `yarn test:ci` | Passed. 9 suites, 64 tests. |
| `yarn build` | Passed. Webpack 4.46.0 emitted `main-85a1f186ce4409655c79.js`. |
| `yarn cy:smoke` | Blocked before test execution by the known local Cypress startup issue: `Cypress.exe: bad option: --smoke-test`. |
