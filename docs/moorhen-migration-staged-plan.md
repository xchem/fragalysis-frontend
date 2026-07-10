# Moorhen Migration Staged Plan

This plan breaks the Moorhen migration into small stages where the application
should remain buildable, testable, and usable after each stage.

The main goal is to replace the current NGL viewer with Moorhen while
mitigating the highest risks:

- large React/MUI/toolchain jumps
- Webpack 4 to Webpack 5 migration
- Yarn Classic to modern Yarn migration
- WebAssembly and worker asset serving
- cross-origin isolation headers
- NGL-to-Moorhen behavior mismatch
- preserving current application behavior during UI and viewer migration

## Target End State

| Area | Target |
| --- | --- |
| Node | Node 24 LTS |
| Package manager | Yarn 4 stable via Corepack, initially with `nodeLinker: node-modules` |
| React | React 19 / ReactDOM 19 |
| UI framework | Modern MUI, no `@material-ui/*` v4 packages |
| Bundler | Webpack 5 |
| Babel | Latest Babel 7 first; Babel 8 only if separately justified |
| Tests | Modern Jest/jsdom plus Testing Library |
| Viewer | Moorhen as default viewer, NGL removed after stabilization |
| Rollout | Feature flag controlled until Moorhen reaches parity |

## Ground Rules

- Every stage must end with a working app.
- Do not combine high-risk stages unless there is a specific reason.
- Keep NGL as the default viewer until Moorhen parity is proven.
- Use feature flags for viewer behavior changes.
- Prefer small PRs with clear verification over one large migration PR.
- Preserve existing user-facing behavior unless a change is explicitly accepted.
- Use screenshot/browser tests to catch UI regressions that unit tests miss.

## Stage 0: Baseline Current Behavior

### Goal

Define what "the app still works" means before any migration starts.

### Changes

- No production code changes.
- Run and record current install, test, and build results.
- Capture current browser console errors and warnings.
- Capture current bundle output and `webpack-stats.json` shape.
- Capture screenshots or videos for important flows.

### Suggested Baseline Flows

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

### Verification

- `yarn install`
- `yarn test`
- `yarn build`
- browser smoke tests against the current app

### Working-State Gate

The app is unchanged, and the current behavior baseline is documented.

## Stage 1: CI Safety Net

### Goal

Make future migration regressions visible immediately.

### Changes

- Add or improve CI jobs for install, test, and build.
- Add browser smoke tests if not already present.
- Store test screenshots/videos as CI artifacts.
- Make migration-branch CI failures block merges.
- Do not upgrade major dependencies in this stage.

### Code Work

- Add smoke tests for key routes and workflows.
- Add basic console-error detection in browser tests.
- Ensure tests can run consistently in CI.

### Verification

- CI passes on the current application.
- Browser smoke tests run successfully.

### Working-State Gate

The current app remains unchanged, and CI can prove it.

## Stage 2: Package Hygiene Without Major Upgrades

### Goal

Reduce obvious dependency risk before larger migrations.

### Changes

- Remove clearly unused packages only after verification.
- Avoid React, MUI, Webpack, Node, or Yarn major upgrades here.
- Add notes for known risky packages and peer dependency problems.

### Code Work

- Replace direct `uuid/v4` imports with a local wrapper or modern-compatible import path.
- Keep the actual `uuid` package version unchanged if needed to reduce scope.
- Identify old packages with React peer dependency risks.

### Verification

- Tests pass.
- Build passes.
- Smoke tests pass.

### Working-State Gate

The app behaves the same, with only low-risk cleanup completed.

## Stage 3: Viewer Feature Flag Infrastructure

### Goal

Prepare for a controlled viewer migration without changing the active viewer.

### Changes

- Add a viewer engine flag, for example:
  - `viewerEngine = "ngl"`
  - future value: `viewerEngine = "moorhen"`
- Keep NGL as the only enabled runtime viewer.

### Code Work

- Add configuration plumbing for the viewer flag.
- Ensure the flag can be controlled in local/dev/staging environments.
- Do not change existing NGL behavior yet.

### Verification

- The app still starts with NGL.
- No visible behavior changes.
- Smoke tests pass.

### Working-State Gate

NGL remains the default and only active viewer.

## Stage 4: Viewer Adapter Skeleton

### Goal

Introduce a stable abstraction around viewer behavior.

### Changes

- Create a generic viewer adapter interface.
- Implement an initial NGL adapter that delegates to existing code.
- Do not add Moorhen yet.

### Suggested Adapter Methods

- `loadMolecule`
- `loadMap`
- `loadSurface`
- `loadVector`
- `setRepresentation`
- `setVisibility`
- `centerOn`
- `setOrientation`
- `getOrientation`
- `removeObject`
- `removeAll`
- `captureImage`
- `destroy`

### Code Work

- Add adapter types or documentation.
- Add `NglViewerAdapter`.
- Route one or two low-risk NGL calls through the adapter.

### Verification

- Existing NGL flows still work.
- Adapter tests cover the routed calls.
- Build and smoke tests pass.

### Working-State Gate

The app still uses NGL, with a small part of the viewer logic routed through the adapter.

## Stage 5: Complete NGL Adapter Coverage

### Goal

Move all app-to-viewer calls behind the adapter while still using NGL.

### Changes

- Gradually route current NGL operations through `NglViewerAdapter`.
- Keep Redux state names if renaming would increase risk.
- Keep all existing user behavior.

### Code Work

- Cover molecule loading.
- Cover map/density loading.
- Cover representations.
- Cover selection and picking behavior.
- Cover orientation persistence.
- Cover screenshot capture.
- Cover cleanup/unmount behavior.

### Verification

- NGL viewer parity tests pass.
- Snapshot restore works.
- Display controls work.
- Browser screenshots match baseline.

### Working-State Gate

The application still uses NGL by default, but app code no longer depends directly on NGL details outside the adapter boundary.

## Stage 6: Webpack 5 Migration

### Goal

Modernize the bundler while keeping the runtime app behavior the same.

### Changes

- Upgrade Webpack 4 to Webpack 5.
- Upgrade related packages:
  - `webpack-cli`
  - `babel-loader`
  - `css-loader`
  - `style-loader`
  - `terser-webpack-plugin`
  - dev middleware/dev server packages
- Replace `url-loader` and `file-loader` with Webpack 5 asset modules.
- Remove `node --openssl-legacy-provider` from scripts.

### Code Work

- Update `webpack.config.js`.
- Update `webpack.config-dev.js`.
- Preserve current bundle output directory.
- Preserve `publicPath`.
- Preserve hot reload behavior.
- Preserve or intentionally migrate `webpack-stats.json`.
- Add explicit browser fallbacks only if packages require Node globals/modules.

### Verification

- Development server works.
- Production build works.
- Backend can still consume `webpack-stats.json`.
- Browser smoke tests pass.

### Working-State Gate

The app works with Webpack 5, still on the current viewer and mostly current runtime dependencies.

## Stage 7: Yarn Modernization

### Goal

Keep Yarn, but move away from Yarn Classic.

### Changes

- Enable Corepack.
- Move to Yarn 4 stable.
- Add `packageManager` to `package.json`.
- Add `.yarnrc.yml`.
- Use `nodeLinker: node-modules` initially.
- Regenerate the lockfile.
- Update CI install command to `yarn install --immutable`.

### Code Work

- Update CI cache paths.
- Update developer setup documentation.
- Keep Plug'n'Play disabled for now.

### Verification

- Fresh install works.
- Tests pass.
- Build passes.
- CI passes using Yarn 4.

### Working-State Gate

The app works on Yarn 4 with the `node_modules` linker.

## Stage 8: Node 24 LTS

### Goal

Move the runtime to the current LTS line after package manager and bundler risks are lower.

### Changes

- Update Dockerfile to Node 24 LTS.
- Update CI Node version.
- Add or update `.nvmrc` / `.node-version`.
- Update README and developer docs.

### Code Work

- Fix runtime issues exposed by Node 24.
- Keep application behavior unchanged.

### Verification

- Fresh install on Node 24 works.
- Tests pass.
- Build passes.
- Development server works.
- Docker build works.

### Working-State Gate

The app works on Node 24 LTS, Yarn 4, and Webpack 5.

## Stage 9: React 18.3 Warning Stage

### Goal

Prepare for React 19 while still staying in the React 18 family.

### Changes

- Upgrade React and ReactDOM from 18.2 to 18.3 if available and compatible.
- Do not upgrade to React 19 yet.
- Do not migrate MUI in the same stage unless required.

### Code Work

- Fix warnings that indicate future React 19 incompatibilities.
- Audit for old APIs:
  - `findDOMNode`
  - legacy context
  - string refs
  - `react-dom/test-utils`
  - unsupported function `defaultProps`

### Verification

- Tests pass.
- Browser smoke tests pass.
- Console warnings are reduced and documented.

### Working-State Gate

The app works on React 18.3 and is cleaner for a future React 19 jump.

## Stage 10: Testing Stack Migration

### Goal

Remove React-16-era testing blockers before React 19.

### Changes

- Remove Enzyme and `enzyme-adapter-react-16`.
- Upgrade Jest and jsdom.
- Add Testing Library packages.

### Code Work

- Update `setupTests.js`.
- Convert Enzyme tests to Testing Library.
- Preserve existing reducer tests.
- Keep `jest-canvas-mock` or replace viewer-related assertions with browser tests.

### Verification

- Unit tests pass without Enzyme.
- Existing reducer behavior remains covered.
- Browser smoke tests pass.

### Working-State Gate

The app runtime is unchanged, and tests no longer depend on Enzyme.

## Stage 11: MUI Compatibility Layer

### Goal

Prepare the app for MUI migration without changing all screens at once.

### Changes

- Create local wrapper exports for commonly used UI components if helpful.
- Start with shared/common components.
- Keep current visible behavior.

### Code Work

- Create wrappers for frequently used components such as:
  - buttons
  - dialogs
  - popovers
  - tooltips
  - grids
  - form controls
  - icons
- Keep old Material UI packages installed at this stage if needed.

### Verification

- Shared components render correctly.
- Screenshots match baseline.
- Tests and build pass.

### Working-State Gate

The app looks and behaves the same, with lower-risk paths available for MUI migration.

## Stage 12: Migrate Off `@material-ui/*`

### Goal

Remove old Material UI v4 usage.

### Changes

- Replace imports from:
  - `@material-ui/core`
  - `@material-ui/icons`
  - `@material-ui/lab`
  - `@material-ui/styles`
- Move to modern `@mui/*` packages.
- Replace `@rjsf/material-ui` with `@rjsf/mui`.

### Code Work

- Migrate theme setup:
  - `ThemeProvider`
  - `createTheme`
  - palette
  - typography
  - spacing
  - overrides/default props
- Replace `makeStyles` and `withStyles` gradually.
- Migrate lab components:
  - `TreeView` / `TreeItem` to `@mui/x-tree-view`
  - `Autocomplete` to modern MUI imports
- Verify popover, modal, dialog, table, tooltip, and slider behavior.

### Verification

- No `@material-ui/*` imports remain.
- Screenshots are acceptable against baseline.
- Important forms and dialogs work.
- Tests and build pass.

### Working-State Gate

The app works without Material UI v4, still before the React 19 jump.

## Stage 13: Upgrade MUI To Target Modern Version

### Goal

Align the UI stack with the modern React/Moorhen ecosystem.

### Changes

- Upgrade:
  - `@mui/material`
  - `@mui/icons-material`
  - `@mui/lab` if still needed
  - `@mui/x-tree-view`
  - `@emotion/react`
  - `@emotion/styled`
- Avoid unnecessary visual redesign.

### Code Work

- Fix changed component APIs.
- Fix changed theme override paths.
- Fix deep import issues.
- Re-test layout-sensitive components.

### Verification

- Screenshots match accepted MUI migration baseline.
- Browser smoke tests pass.
- No major visual regressions in core workflows.

### Working-State Gate

The app works on the target MUI line, still using NGL.

## Stage 14: React 19 Upgrade

### Goal

Move the app runtime to the React version expected by latest Moorhen.

### Changes

- Upgrade React and ReactDOM to React 19.
- Upgrade React typings if TypeScript type checks are used.
- Upgrade compatible React ecosystem packages:
  - `react-redux`
  - `redux`
  - Redux DevTools integration
  - testing packages

### Code Work

- Run React 19 codemods where useful.
- Fix runtime errors and warnings.
- Ensure the app still uses the modern root API.
- Verify there is only one React runtime.

### Verification

- `yarn why react`
- Tests pass.
- Build passes.
- Browser smoke tests pass.
- No duplicate React or invalid hook call errors.

### Working-State Gate

The app works on React 19 with NGL still as the default viewer.

## Stage 15: Moorhen Infrastructure Only

### Goal

Install and serve Moorhen without replacing NGL.

### Changes

- Add latest stable `moorhen`.
- Copy `node_modules/moorhen/public/*` into served static assets.
- Add WASM/static MIME handling.
- Add local development headers required for cross-origin isolation.
- Mirror header requirements in production config.

### Required Headers

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

### Code Work

- Add an explicit asset-copy script.
- Ensure CI/Docker runs the asset-copy step.
- Update `server.js` for local development headers.
- Add production deployment notes for backend/nginx/ingress.
- Keep Moorhen behind a disabled feature flag.

### Verification

- Normal app still uses NGL.
- Moorhen static files are served.
- Existing external images, scripts, fonts, and downloads still work under COOP/COEP.
- Build and browser smoke tests pass.

### Working-State Gate

The app behaves as before, and Moorhen assets are available but not active in production flows.

## Stage 16: Moorhen Proof Route

### Goal

Prove Moorhen can run inside this app independently of the NGL replacement.

### Changes

- Add an internal/debug route or hidden development page.
- Load a small molecule.
- Load a small map if available.
- Keep the route out of normal user navigation unless intentionally enabled.

### Code Work

- Add a minimal Moorhen wrapper.
- Wrap with Moorhen's Redux store/provider as required.
- Lazy-load Moorhen.
- Verify worker and WASM initialization.

### Verification

- Moorhen proof route loads.
- No duplicate React runtime.
- Worker/WASM files load successfully.
- No browser console errors related to Moorhen initialization.
- Normal app flows still use NGL.

### Working-State Gate

The app works normally, and Moorhen is proven in an isolated route.

## Stage 17: Moorhen Adapter MVP

### Goal

Implement Moorhen behind the existing viewer adapter interface.

### Changes

- Add `MoorhenViewerAdapter`.
- Keep `viewerEngine = "ngl"` as the default.
- Enable Moorhen only by feature flag.

### Code Work

- Implement:
  - basic molecule load
  - basic map load
  - object removal
  - visibility toggle
  - center/focus
  - adapter cleanup
- Add adapter tests where practical.

### Verification

- NGL default path still works.
- Moorhen flagged path works for MVP operations.
- No shared-state pollution between NGL and Moorhen modes.

### Working-State Gate

Moorhen works in limited flagged mode; NGL remains the stable default.

## Stage 18: Moorhen Parity Expansion

### Goal

Add Moorhen support feature by feature until it matches required NGL behavior.

### Changes

- Expand `MoorhenViewerAdapter` behavior incrementally.
- Keep a separate gate for each viewer capability.

### Parity Checklist

- protein load
- ligand load
- complex load
- density/map load
- surfaces
- vectors
- representation styles
- visibility toggles
- selections
- molecule group selection
- centering/focus
- mouse controls
- orientation persistence
- snapshot restore
- screenshot capture
- loading/progress state
- object cleanup/removal

### Verification

- Each feature has a parity test or browser smoke flow.
- Compare against baseline NGL screenshots where useful.
- Keep rollback to NGL available.

### Working-State Gate

After each parity item, NGL still works by default and Moorhen passes the newly added flagged behavior.

## Stage 19: Controlled Moorhen Rollout

### Goal

Expose Moorhen to selected environments/users while keeping rollback available.

### Changes

- Enable Moorhen by default in development or staging first.
- Keep NGL fallback.
- Monitor browser errors, performance, and user-reported behavior gaps.

### Code Work

- Add logging/telemetry around viewer initialization and failures if available.
- Add fast rollback configuration.
- Fix parity gaps found during staging.

### Verification

- Staging workflows pass with Moorhen.
- NGL rollback still works.
- Performance is acceptable.
- Snapshot and screenshot workflows are verified carefully.

### Working-State Gate

Moorhen can be used in staging, and NGL remains an immediate fallback.

## Stage 20: Make Moorhen Default

### Goal

Switch normal users to Moorhen while keeping NGL available temporarily.

### Changes

- Set `viewerEngine = "moorhen"` as the default.
- Keep `viewerEngine = "ngl"` as a fallback.
- Continue monitoring for parity issues.

### Code Work

- Update default configuration.
- Update any user-facing labels if needed.
- Keep old NGL assets/dependencies for a stabilization window.

### Verification

- Core workflows pass with Moorhen default.
- NGL fallback is tested.
- No major browser console errors.
- User acceptance testing passes.

### Working-State Gate

The app works with Moorhen as default and NGL as fallback.

## Stage 21: Remove NGL

### Goal

Clean up after Moorhen has stabilized.

### Changes

- Remove `ngl`.
- Remove old `three.js` if only NGL used it.
- Delete old NGL-only components/helpers.
- Remove NGL fallback flag after an agreed stabilization period.

### Code Work

- Remove NGL adapter.
- Remove dead NGL reducers/actions only after confirming no non-viewer logic depends on them.
- Rename viewer state from NGL-specific names only if the rename is worth the churn.
- Update tests and docs.

### Verification

- Tests pass.
- Build passes.
- Browser smoke tests pass.
- No NGL references remain outside historical docs/changelog.

### Working-State Gate

The app works with Moorhen only.

## Final Acceptance Criteria

- CI installs with Yarn 4 and Node 24 LTS.
- App builds without OpenSSL legacy flags.
- Existing tests pass after migration.
- Testing stack no longer depends on Enzyme.
- No `@material-ui/*` packages remain.
- App runs on React 19 with a single React runtime.
- Webpack 5 build output works with the backend.
- Moorhen static assets and WASM files are served correctly.
- COOP/COEP headers are configured in local and production environments.
- Key UI screenshots match the accepted baseline.
- Moorhen loads molecule/map data successfully.
- Moorhen passes the viewer parity checklist.
- NGL has been removed only after Moorhen stabilization.

## Key Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| MUI migration causes UI regressions | Migrate in stages, use wrappers, compare screenshots |
| React 19 breaks old packages | Remove old React-16-era dependencies before upgrading |
| Webpack 5 changes backend bundle stats | Treat `webpack-stats.json` as a compatibility contract |
| Yarn 4 changes install behavior | Use `nodeLinker: node-modules` first |
| COOP/COEP breaks cross-origin assets | Test all external resources and add CORS/CORP fixes |
| Moorhen increases asset size | Lazy-load Moorhen and copy only required static assets where possible |
| NGL and Moorhen behavior differs | Use adapter, feature flag, parity checklist, and staged rollout |
| Duplicate React runtime | Verify with `yarn why react` and bundler resolution checks |

## Useful References

- Node.js releases: https://nodejs.org/en/about/previous-releases
- Yarn installation and Corepack: https://yarnpkg.com/getting-started/install
- React 19 upgrade guide: https://react.dev/blog/2024/04/25/react-19-upgrade-guide
- MUI migration guide: https://mui.com/material-ui/migration/
- Moorhen repository: https://github.com/moorhen-coot/Moorhen
- Minimal embedded Moorhen example: https://github.com/moorhen-coot/MinimalEmbeddedMoorhen
- Moorhen embedding notes: https://moorhen-coot.github.io/wiki/2025/07/08/Moorhen-Embedding-2.html
- MDN Cross-Origin-Embedder-Policy: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy
