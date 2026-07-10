# Moorhen Migration Stage 10: Testing Stack Migration

## Outcome

The test stack now uses Jest 30, jsdom 26, and Testing Library. Enzyme and its React 16 adapter are completely removed.
Application runtime code is unchanged.

## Dependency Changes

- Upgraded `jest` from `24.9.0` to `30.4.2`.
- Upgraded `babel-jest` from `24.9.0` to `30.4.1`.
- Added `jest-environment-jsdom` `30.4.1`, which supplies jsdom `26.1.0`.
- Added `@testing-library/react` `16.3.2` and `@testing-library/dom` `10.4.1`.
- Added `@testing-library/jest-dom` `6.9.1` and `@testing-library/user-event` `14.6.1`.
- Upgraded `jest-canvas-mock` from `2.4.0` to `2.5.8`.
- Removed `enzyme` and `enzyme-adapter-react-16` and their transitive dependency tree.

## Test Changes

- Replaced the Enzyme adapter initialization in `setupTests.js` with the jest-dom matcher setup.
- Kept `jest-canvas-mock` in `setupFilesAfterEnv` for viewer and canvas compatibility.
- Added a Testing Library test for `HeaderProvider` that renders through React 18, queries accessible DOM roles, and
  exercises a state update with `user-event`.
- No Enzyme test files required conversion. The adapter setup and dependencies were the only remaining Enzyme usage.
- Existing reducer and viewer tests were preserved without behavioral rewrites.

## Verification

- Enzyme audit: no references remain in application/test source, `setupTests.js`, `package.json`, or `yarn.lock`.
- `yarn install --immutable`: passed with the known legacy application peer dependency warnings.
- `yarn test:ci`: passed, 14 suites and 90 tests.
- Reducer-only verification: passed, 4 suites and 45 tests.
- The Node 24 `DEP0176` warning from the old Jest 24/jsdom 11 stack is gone.
- `yarn build`: passed with Webpack `5.108.4` and the stats-contract validator.
- Production bundle: `main-aeeaa789e2d17b1970b8.js`.
- Development bundle: returned HTTP 200.
- HMR endpoint: returned a valid sync/heartbeat stream.
- The verification server was stopped afterward and port 3030 is free.
- Cypress was not run locally. It remains a CI-only browser check for this project environment.

The production compiler retains only the three existing bundle-size warnings. Yarn retains the legacy Material UI and
application peer dependency warnings documented in earlier stages.

## Quick Manual Check

1. Run `yarn test:ci`; confirm all 14 suites pass without an `fs.F_OK` deprecation warning.
2. Run `yarn start`, then open the application through the usual Django URL.
3. Confirm the header, target list, and one target page render normally.
4. Load the molecular viewer and perform one simple interaction such as rotating the structure or toggling a ligand.
5. Stop `yarn start` when finished.

## References

- [Jest 30 upgrade guide](https://jestjs.io/docs/30.0/upgrading-to-jest30)
- [Testing Library React setup](https://testing-library.com/docs/react-testing-library/setup/)
- [Testing Library React introduction](https://testing-library.com/docs/react-testing-library/intro/)
- [jest-dom documentation](https://testing-library.com/docs/ecosystem-jest-dom/)
