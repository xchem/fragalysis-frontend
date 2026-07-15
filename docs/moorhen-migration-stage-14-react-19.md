# Moorhen Migration Stage 14: React 19

## Outcome

The application runtime now uses React 19 with NGL still selected as the default viewer. React, ReactDOM, and
`react-is` are aligned on `19.2.7`, the application still mounts through `createRoot`, and the Redux integration
uses the current React 19-compatible package lines.

## Dependency Migration

- Upgraded `react`, `react-dom`, and `react-is` to `19.2.7`, with a matching Yarn resolution for `react-is`.
- Added React 19 typings: `@types/react` `19.2.17` and `@types/react-dom` `19.2.3`.
- Upgraded `react-redux` to `9.3.0`, Redux to `5.0.1`, and `redux-thunk` to `3.1.0`.
- Replaced the deprecated `redux-devtools-extension` package with `@redux-devtools/extension` `4.0.0`.
- Updated `redux-mock-store` to `1.5.5` and React Refresh to `0.18.0`. The existing React Testing Library
  `16.3.2`, Jest `30.4.2`, and user-event `14.6.1` lines already support this runtime.
- Upgraded React-facing browser packages whose older implementations or peer ranges were unsafe for React 19:
  `react-datepicker` `9.1.0`, `react-grid-layout` `1.5.3`, `notistack` `3.0.2`, and
  `react-reverse-portal` `2.3.0`.
- Removed unused legacy packages `react-canvas-draw`, `react-event-timeline`, and `react-grid-gallery`. Also
  removed the unused `redux-logger` dependency.

## Code Migration

- Updated Redux initialization for Redux 5: `legacy_createStore`, the named `thunk` export, and the new Redux
  DevTools package are now used at the application entrypoint.
- Updated the NGL Redux test store to use the named Redux Thunk export.
- Extended the React compatibility suite to assert aligned React runtime versions, the `react-is` resolution,
  and the Redux 5 entrypoint contracts.
- Replaced the table resizer's stateful inline callback ref with a React mouse handler. React 19 detaches a changed
  callback ref before attaching the next one, so updating state from that ref caused a maximum-update-depth loop.
- Removed the same state-setting inline callback-ref pattern from `SummaryView`, where the captured node was unused,
  and added a source guard against reintroducing this React 19-sensitive pattern.
- Stabilized Preview and dataset row registration refs with `useRegisteredNodeRef`. This prevents React 19 ref
  detachment from repeatedly removing and restoring rows in the scroll-to-selection state.
- Narrowed `ObservationFilter` to its own saved-filter entry with shallow equality and removed its render-driven
  initialization state. Unrelated filter updates no longer create a passive-effect update cascade on Preview load.
- Converted per-row quality-status arrays from effect-driven state to memoized render-time derivations, and changed
  the text, numeric, peer-review, and molecule filters to initialize directly from Redux without mount effects.
- Removed effect-driven pruning of cached detail-row heights from `ObservationUnifiedViewWrapper`. Display sizing
  already considers only currently filtered rows, so fresh filtered-array identities no longer schedule state.
- Guarded `PoseList` pagination before dispatching state and moved search pagination resets out of render-time
  memoization. Recreated filtered arrays can no longer keep the Preview page in a passive update loop.
- Added a table resizer regression test covering mount, drag, rerender, and listener cleanup under React 19.
- Retained the automatic JSX transform and `createRoot` mount established in earlier stages. A codemod was not
  needed because the source audit and compatibility suite found no removed React 19 APIs requiring conversion.
- Added a narrowly scoped Webpack filter for `react-datepicker`'s optional `date-fns-tz` dynamic probe in both
  production and development configs. Other critical-dependency warnings remain enabled.

## Compatibility Audit

- `yarn why react` and `yarn why react-dom` each resolve one application runtime at `19.2.7`.
- `yarn why react-is` resolves application and MUI/RJSF consumers to `19.2.7`. Jest's formatter has isolated
  development-only copies and does not add another React runtime to the browser bundle.
- Source and installed-package scans found no `ReactDOM.render`, `ReactDOM.hydrate`, `findDOMNode`, legacy
  `react-dom/test-utils`, string refs, or known React 19 `key` prop-spread patterns in application code.
- NGL remains the default viewer; this stage does not install or activate Moorhen.

## Verification

- `yarn install --immutable`: passed.
- `yarn test:ci`: passed, 21 suites and 123 tests.
- `yarn build`: passed with Webpack `5.108.4` and the stats-contract validator.
- Production bundle: `main-481a86c337f22c11e317.js`, 13.4 MiB.
- Development middleware on port 3031: compiled successfully with no webpack warnings or errors.
- The temporary development process was stopped and port 3031 was released.
- Cypress was not run locally. It remains a CI-only browser check for this machine.

The production compiler reports only the three existing bundle-size warnings. Yarn still reports stale React peer
ranges from `react-infinite-scroller`, `react-svg-inline`, `react-table`, `react-use-clipboard`, and the React types
requested by `@loschmidt/jsme-react`. Their installed implementations were checked for removed React 19 APIs, but
their interactions are included in the manual check because their published metadata does not yet claim React 19.

This repository has no standalone `index.html`, so the application shell must be opened through Django. The
automated Stage 14 gate is green; the short browser check below completes the runtime gate in the real page.

## Quick Manual Check

1. Open a normal target through Django and check the console while the page loads. Confirm NGL renders and there
   are no invalid-hook-call, duplicate-React, `findDOMNode`, or error-boundary messages.
2. Open the target date filter and select/clear a date, then trigger an action that displays a snackbar. Confirm
   the date picker and notification render, close, and update normally.
3. Unlock the layout, drag and resize one panel, then reload the saved layout. Also scroll far enough in a target or
   compound list to fetch more rows. Confirm layout portals, resizing, and infinite loading remain responsive.
4. Sort a React Table view, copy a compound value with its copy control, and inspect an SVG molecule thumbnail.
   Confirm sorting, clipboard feedback, and the thumbnail work without new console errors.

## References

- [React 19 upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [React 19 release](https://react.dev/blog/2024/12/05/react-19)
- [Redux 5 and React-Redux 9 migration](https://redux.js.org/usage/migrations/migrating-rtk-2)
- [Redux DevTools releases](https://github.com/reduxjs/redux-devtools/releases)
- [react-datepicker optional timezone probe](https://github.com/Hacker0x01/react-datepicker/issues/6154)
