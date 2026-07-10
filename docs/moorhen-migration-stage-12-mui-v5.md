# Moorhen Migration Stage 12: Material UI v5

## Outcome

The application no longer depends on or imports Material UI v4. The existing MUI v5 line remains pinned at `5.13.7`
for this stage; upgrading MUI itself remains Stage 13 work.

## Dependency Migration

- Removed `@material-ui/core`, `@material-ui/icons`, `@material-ui/lab`, `@rjsf/material-ui`,
  `formik-material-ui`, and `formik-material-ui-pickers`.
- Added aligned MUI packages: `@mui/styles` and `@mui/system` `5.13.7`, plus `@mui/x-tree-view` `6.17.0`.
- Migrated generated forms to `@rjsf/mui` and the explicit AJV 8 validator on the RJSF `5.24.13` line.
- Added a local Formik TextField adapter for touched/error/helper text and submitting/disabled behavior.
- The lockfile and application source contain no `@material-ui/*` references.

## Code Migration

- Migrated 123 source files to `@mui/material`, `@mui/icons-material`, `@mui/styles`, and `@mui/x-tree-view`.
- Updated the local UI compatibility boundary to export MUI v5 components, icons, theme helpers, and JSS helpers.
- Moved the root to `StyledEngineProvider`, MUI v5 `ThemeProvider`, and the standalone `CssBaseline` component.
- Kept `ErrorBoundary` inside `ThemeProvider` because its always-mounted fallback modal uses JSS theme values.
- Converted theme `props` and `overrides` to `components.defaultProps` and `components.styleOverrides`.
- Preserved important v4 defaults for buttons, checkboxes, radio buttons, switches, icon buttons, links, tabs,
  form controls, selects, text fields, and tooltips.
- Converted 137 spacing expressions in 30 files for MUI v5's string-valued `theme.spacing()` API. Numeric
  `react-grid-layout` inputs now explicitly parse the pixel value.
- Migrated TreeView and TreeItem to `@mui/x-tree-view`, Autocomplete to `@mui/material`, Tooltip's interactive
  API, and the MUI v5 Autocomplete render-option contract.
- Replaced invalid target-list header `<div>` children with table cells, removing the React table-nesting warning.

`makeStyles` and `withStyles` now come from `@mui/styles` in 89 source files. This removes all v4 packages while
keeping the JSS migration gradual. Moving those styles to Emotion or `styled` remains follow-up debt.

## Tests

- The UI compatibility test prevents reintroducing Material UI v4 imports or dependencies.
- Theme tests cover preserved component defaults, typography, spacing, and unsafe spacing arithmetic.
- The local Formik adapter test covers normal, validation-error, and submitting states.

## Verification

- `yarn install --immutable`: passed.
- `yarn test:ci`: passed, 17 suites and 115 tests.
- `yarn build`: passed with Webpack `5.108.4` and the stats-contract validator.
- Production bundle: `main-dceb7c5da75feb00ffb7.js`, 13.3 MiB.
- Development bundle on port 3031: HTTP 200; HMR returned a clean sync with no warnings or errors.
- The temporary development process was stopped and port 3031 was released.
- Cypress was not run locally. It remains a CI-only browser check for this machine.

The production compiler reports only the three existing bundle-size warnings. The immutable install retains the
known React peer warning from transitional `@mui/styles` and the missing optional `@types/react` peer; the old MUI
v4 and form-adapter peer warnings are gone.

This repository does not contain a standalone `index.html`; the real application page is served through Django.
The Stage 0 baseline also has no usable local screenshots, so visual and dialog verification remains the manual gate
below.

## Quick Manual Check

1. Run `yarn start`, open the application through the usual Django URL, and confirm the header, panels, and grid
   layout have their normal spacing and no collapsed or overlapping sections.
2. Open Display controls, expand the object tree, change a representation with its Select/slider, and open and close
   its popover.
3. Open Add/Edit Tag and a snapshot dialog; check standard text-field styling, validation messages, Autocomplete,
   checkboxes, neutral buttons, save, and cancel.
4. Open Job Launcher, change a generated-form value, trigger one validation message, and submit or cancel. Also hover
   one rich tooltip and close one modal by its normal close action.

## References

- [Material UI v4 to v5 migration](https://mui.com/material-ui/migration/migration-v4/)
- [Material UI v5 style and theme changes](https://mui.com/material-ui/migration/v5-style-changes/)
- [Migrating from JSS](https://mui.com/material-ui/migration/migrating-from-jss/)
- [Material UI v5 component changes](https://mui.com/material-ui/migration/v5-component-changes/)
- [Tree View moved from MUI Lab to MUI X](https://mui.com/blog/lab-tree-view-to-mui-x/)
- [RJSF v5 upgrade guide](https://rjsf-team.github.io/react-jsonschema-form/docs/version-5.24.10/migration-guides/v5.x%20upgrade%20guide/)
