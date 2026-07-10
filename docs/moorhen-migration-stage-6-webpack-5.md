# Moorhen Migration Stage 6: Webpack 5

## Outcome

The application now builds and serves development bundles with Webpack 5. The bundle directory, default development
origin, HMR endpoint, and backend-facing legacy stats contract are preserved. No browser fallbacks for Node globals or
modules were required by the current dependency graph.

## Toolchain

- Webpack `5.108.4` and webpack-cli `5.1.4`.
- babel-loader `9.2.1`.
- css-loader `6.11.0` and style-loader `3.3.4`.
- terser-webpack-plugin `5.6.1`.
- webpack-dev-middleware `6.1.3` and webpack-hot-middleware `2.26.1`.
- dotenv-webpack `8.1.1`.

The obsolete `url-loader`, `file-loader`, `error-overlay-webpack-plugin`, `compression-webpack-plugin`, and
`webpack-bundle-tracker` packages were removed. The Node OpenSSL legacy-provider flag was removed from all scripts.

## Configuration Changes

- Image and font handling now uses Webpack 5 `asset` modules with the existing 100,000-byte inline threshold.
- Bundle output remains in `bundles`, with full-build hashes in JavaScript filenames.
- Production `publicPath` is explicitly empty to preserve the Webpack 4 behavior; development still defaults to
  `http://localhost:3030/bundles/`.
- The custom development server still uses Express, webpack-dev-middleware, and webpack-hot-middleware. The port can
  be overridden with `DEV_SERVER_PORT` for local conflict-free testing.
- Removed Webpack 4-only `NamedModulesPlugin` and `NoEmitOnErrorsPlugin` use in favor of Webpack 5 optimization
  settings.
- JSON modules now use default imports, avoiding Webpack 5 named-export compatibility warnings.

## Backend Stats Contract

`webpack/LegacyBundleTrackerPlugin.js` replaces the Webpack 4-only tracker implementation. It preserves the baseline
production contract:

```json
{
  "status": "done",
  "chunks": {
    "main": [{ "name": "main-<hash>.js", "path": "<absolute bundle path>" }]
  }
}
```

Development entries additionally retain `publicPath`. `yarn build` now runs `scripts/validate-webpack-stats.js` after
compilation so CI fails if `status`, `chunks.main`, or the required `name` and `path` fields drift.

## Verification

- `yarn install --non-interactive`: passed and updated `yarn.lock`.
- Webpack config validation: passed for production and development configs.
- `yarn test:ci`: passed, 12 suites and 80 tests.
- `yarn build`: passed with Webpack `5.108.4`.
- Production bundle: `main-1926b6cb70df1ec85e6f.js`.
- Production stats validation: passed with exactly `status` and `chunks` top-level keys and `name`/`path` main item
  keys.
- Development compiler: passed without compiler warnings or errors on the default port 3030.
- Development bundle request: HTTP 200, 24,804,626 bytes.
- HMR stream: HTTP 200 with a valid `sync` event and heartbeat.
- `git diff --check`: passed; Git reported only existing LF-to-CRLF working-tree warnings.
- Cypress was not run locally. It remains a CI-only check for this project environment.

The production compiler retains only the three existing bundle-size performance warnings for the 13.3 MiB main
bundle.

## Quick Manual Check

1. With `yarn start` running, open the application through the usual Django URL.
2. Open one target. Confirm the page logos/fonts render, the NGL viewer loads its protein/ligands, and rotate or toggle
   one ligand to verify the viewer remains interactive.
3. With the page open, make and undo one harmless visible React text change. Confirm it appears through hot refresh
   without restarting the bundle server.
4. Check the browser console for build/runtime errors and confirm the main bundle is loaded from
   `http://localhost:3030/bundles/`.
