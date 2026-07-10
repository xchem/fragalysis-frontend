# Moorhen Migration Stage 11: MUI Compatibility Layer

## Outcome

Shared UI components now consume Material UI through a local compatibility boundary. Visible component behavior and
the installed Material UI versions are unchanged. Screen-level migration remains isolated for Stage 12.

## Compatibility Boundary

- `js/ui/index.js` exports frequently used components through supported second-level Material UI v4 imports.
- `js/ui/styles.js` exports theme and JSS helpers.
- `js/ui/icons.js` exports the icons currently used by shared components.
- The boundary covers buttons, dialogs, popovers, tooltips, grids, form controls, navigation, surfaces, and icons.
- All 15 MUI-dependent files under `js/components/common` now import through the local boundary.
- `RichTooltip`, the other shared tooltip primitive, also imports through the boundary.
- No package versions changed. `@material-ui/*` and `@mui/*` remain installed together until Stage 12.

There are no direct MUI imports left in shared common components. The remaining 120 files with direct MUI imports are
screen-level or feature-specific migration work reserved for Stage 12.

## Tests

`js/ui/uiCompatibility.test.js` now verifies that:

- representative component, style, and icon exports are available;
- the existing shared TextField and Paper render through the compatibility layer;
- direct `@material-ui/*` and `@mui/*` imports cannot be reintroduced under `js/components/common` or in
  `RichTooltip`.

## Verification

- `yarn install --immutable`: passed with the known legacy peer dependency warnings.
- `yarn test:ci`: passed, 15 suites and 109 tests.
- Compatibility-layer test: passed, 19 tests.
- Shared direct-import audit: zero violations.
- `yarn build`: passed with Webpack `5.108.4` and the stats-contract validator.
- Production bundle: `main-aedb69d665429d700e39.js`, still in the existing 13.3 MiB size class.
- Development bundle on verification port 3031: returned HTTP 200.
- HMR endpoint: returned a valid sync/heartbeat stream.
- The verification process was stopped afterward and port 3031 is free.
- Cypress was not run locally. It remains a CI-only browser check for this project environment.

The production compiler retains only the three existing bundle-size warnings. The Stage 0 baseline has no usable local
screenshots, so visual equivalence cannot be automatically compared on this machine and remains the manual gate below.

## Quick Manual Check

1. Run `yarn start`, then open the application through the usual Django URL.
2. Use a header or list search field and confirm its text field, search icon, and tooltip look and behave normally.
3. Load a target, expand and collapse one shared panel, and open then close a right-side drawer if available.
4. Open one tag or snapshot modal and confirm its surface, form controls, buttons, and close behavior are unchanged.
5. Stop `yarn start` when finished.

## References

- [Material UI v4 to v5 migration](https://mui.com/material-ui/migration/migration-v4/)
- [Material UI v5 style and theme changes](https://mui.com/material-ui/migration/v5-style-changes/)
- [Material UI v5 component changes](https://mui.com/material-ui/migration/v5-component-changes/)
