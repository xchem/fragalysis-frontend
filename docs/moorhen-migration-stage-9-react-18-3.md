# Moorhen Migration Stage 9: React 18.3 Warning Stage

## Outcome

The application now uses React and ReactDOM `18.3.1`. React 19 and Material UI were intentionally left unchanged.
React 18.3 keeps React 18 behavior while surfacing warnings for APIs that must be addressed before React 19.

## Changes

- Upgraded `react` and `react-dom` from `18.2.0` to `18.3.1` and updated `yarn.lock`.
- Enabled the automatic JSX runtime in Babel, as required by the future React 19 migration path.
- Kept the existing `createRoot` entry point introduced in an earlier stage.
- Removed `key` from props returned by React Table getters before spreading those props into the job table JSX.
- Removed `key` from Material UI Autocomplete tag props before spreading them into tag chips.
- Added `js/reactCompatibility.test.js` to prevent app-owned reintroduction of deprecated React APIs and known
  key-spread patterns.

## Compatibility Audit

Application source does not use:

- `findDOMNode`
- `ReactDOM.render`, `ReactDOM.hydrate`, or `ReactDOM.unmountComponentAtNode`
- `react-dom/test-utils`
- legacy context declarations
- string refs
- `createFactory`
- function `defaultProps` assignments

Third-party packages are outside this source audit. The legacy Material UI and test dependencies still declare old
React peer ranges; their Yarn warnings remain documented migration debt for the later MUI and testing stages.

## Verification

- `yarn install --immutable`: passed with the known legacy peer dependency warnings.
- `yarn test:ci`: passed, 13 suites and 89 tests.
- `yarn build`: passed with Webpack `5.108.4` and the stats-contract validator.
- Production bundle: `main-c7b56e2a5d7958a9925a.js`.
- Development bundle: returned HTTP 200.
- HMR endpoint: returned a valid sync/heartbeat stream.
- The verification server was stopped afterward and port 3030 is free.
- Cypress was not run locally. It remains a CI-only browser check for this project environment.

The production compiler retains only the three existing bundle-size performance warnings. Tests retain the Node 24
`DEP0176` warning from the old Jest/jsdom dependency chain; Stage 10 owns that test-stack upgrade.

The standalone development server cannot render `/` because the page shell is supplied by Django and this repository
does not contain a root `index.html`. Bundle and HMR endpoints were verified directly. A browser console check through
the normal Django URL remains the manual working-state gate.

## Quick Manual Check

1. Run `yarn start`, then open the application through the usual Django URL with browser DevTools open.
2. Load a target and confirm the page and molecular viewer render without new React warnings in the console.
3. Open the Job Table, sort a column, and expand a job; confirm there is no warning about spreading a `key` prop.
4. Open the add-tag dialog, add an existing or free-text tag, and confirm its chip renders and saves without that
   warning.
5. Stop `yarn start` when finished.

## References

- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [React changelog](https://github.com/facebook/react/blob/main/CHANGELOG.md)
