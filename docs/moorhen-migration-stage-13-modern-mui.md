# Moorhen Migration Stage 13: Modern MUI

## Outcome

The application now uses the MUI package lines expected by the current Moorhen ecosystem while retaining React 18
and the NGL viewer. Stage 13 deliberately stops at MUI 7 rather than moving to MUI 9 because the current Moorhen
package is built against MUI 7 and MUI X 8; React 19 remains Stage 14 work.

## Dependency Migration

- Upgraded `@mui/material`, `@mui/icons-material`, and `@mui/system` to `7.3.11`.
- Upgraded `@mui/x-tree-view` to `8.29.2`.
- Upgraded `@emotion/react` and `@emotion/cache` to `11.14.0`, and `@emotion/styled` to `11.14.1`.
- Removed `@mui/styles` and added `tss-react` `4.9.21` for the existing `makeStyles` and `withStyles` call sites.
- Upgraded RJSF to `6.6.2` so generated MUI forms use a version that supports MUI 7.
- Pinned `react-is` to `18.3.1`, including a Yarn resolution, while the application remains on React `18.3.1`.
- `@mui/lab` is not required and was not added.

## Code Migration

- Added a local TSS compatibility adapter for the legacy `makeStyles`/`withStyles` signatures, including dynamic
  prop values, arrays, and `$rule` selectors. All application style imports now pass through this adapter.
- Added an explicit Emotion cache above the theme provider so TSS and MUI use a predictable style-insertion order.
- Kept existing layout behavior with `GridLegacy as Grid`. Moving immediately to MUI 7's redesigned Grid would
  change sizing and breakpoint behavior and would constitute a separate layout migration.
- Replaced the removed `ListItem button` API with `ListItemButton` in the application drawer.
- Migrated MUI X Tree View to `SimpleTreeView`, `itemId`, and icon slots.
- Migrated TextField, TablePagination, Tooltip, and Autocomplete call sites from deprecated props to `slotProps`
  and `renderValue`.
- Preserved the MUI `components.defaultProps` and `components.styleOverrides` theme structure established in
  Stage 12; the theme tests pass on MUI 7.
- Fixed the manual visual follow-up: the menu trigger now has an explicit visible color, temporary drawers stack
  above the app bar, and compact hit-selection buttons compensate for GridLegacy's larger negative row offset.
- Source audits found no MUI v4 imports, `@mui/styles`, old Tree View identifiers, removed `ListItem button` use,
  deprecated props migrated in this stage, or accidental imports of MUI 7's new Grid.

## Tests

The UI compatibility suite now exercises emitted TSS CSS for prop-dependent values, referenced selectors, and
`withStyles`. It also prevents `@mui/styles` from returning and verifies the root provider order.

## Verification

- `yarn install --immutable`: passed.
- `yarn test:ci`: passed, 17 suites and 116 tests.
- `yarn build`: passed with Webpack `5.108.4` and the stats-contract validator.
- Production bundle: `main-31e2ee935bbe8347d1fa.js`, 13.4 MiB.
- Development middleware on port 3031: compiled successfully with no webpack warnings or errors.
- The temporary development process was stopped and port 3031 was released.
- Cypress was not run locally. It remains a CI-only browser check for this machine.

The production compiler reports only the three existing bundle-size warnings. Yarn still reports peer warnings
from older React libraries and the absent optional `@types/react` package; the MUI, Emotion, TSS, and RJSF package
lines themselves accept the current React 18 runtime.

This repository has no standalone `index.html`, so the development middleware cannot serve the application shell
directly; the page must be opened through Django. No usable automated screenshot baseline is available, making the
visual part of the Stage 13 gate the quick manual check below.

## Quick Manual Check

1. Open the app through the usual Django URL. Confirm the menu icon is visible, its drawer covers the header instead
   of rendering beneath it, and check the browser console for MUI warnings or an error boundary.
2. Search the target list and change its page size, then open the compound list and edit a compound-class name. The
   adornment icons, input read-only state, and pagination should behave normally.
3. Confirm the Select all/displayed hits buttons are fully visible in both navigators. Then open Display controls,
   expand and collapse the object tree, and change one representation value; the NGL view should still update.
4. Open Add Tag and Job Configuration. Add/remove an Autocomplete chip, inspect a generated form field, and hover a
   rich tooltip. Confirm chips, labels, validation, tooltip placement, save, and cancel all look and behave normally.

## References

- [Moorhen 0.22.7 package](https://www.npmjs.com/package/moorhen/v/0.22.7)
- [MUI v6 migration](https://mui.com/material-ui/migration/upgrade-to-v6/)
- [MUI v7 migration](https://mui.com/material-ui/migration/upgrade-to-v7/)
- [Migrating from JSS](https://mui.com/material-ui/migration/migrating-from-jss/)
- [MUI X Tree View v7 migration](https://mui.com/x/migration/migration-tree-view-v6/)
- [MUI X Tree View v8 migration](https://mui.com/x/migration/migration-tree-view-v7/)
- [RJSF v6 upgrade guide](https://rjsf-team.github.io/react-jsonschema-form/docs/migration-guides/v6.x%20upgrade%20guide/)
