# Moorhen Migration Stage 15: Infrastructure

## Outcome

Moorhen `0.22.7` is installed and its complete published runtime asset tree is copied, verified, and served without
activating Moorhen in application flows. NGL remains the default and only enabled viewer.

## Dependency And Runtime Boundary

- Added the current stable `moorhen` release, pinned to `0.22.7`.
- Moorhen and Fragalysis resolve to the same React `19.2.7`, ReactDOM `19.2.7`, and MUI `7.3.11` installations.
- No Moorhen module is imported by the application entrypoint. The production bundle contains no references to
  `MoorhenContainer`, `CootWorker.js`, or either Moorhen WASM file.
- The existing viewer configuration still exposes only `ngl` in `ENABLED_VIEWER_ENGINES`; configuring `moorhen`
  continues to fall back to NGL.

Moorhen's npm package publishes a large regular dependency tree. Yarn added approximately 459 MiB to the local
package cache, but those packages are not included in the Fragalysis browser bundle at this stage.

## Static Assets

- `yarn copy:moorhen-assets` copies all of `node_modules/moorhen/public` to `bundles/moorhen`.
- The script verifies relative paths, sizes, and SHA-256 digests after every copy.
- `yarn verify:moorhen-assets` provides a non-mutating CI/deployment check.
- The current package contributes 275 files totaling 114,450,225 bytes, including `CootWorker.js`, `moorhen.wasm`,
  `moorhen64.wasm`, monomer dictionaries, pixmaps, MathJax files, and tutorial data.
- Generated output remains ignored through the existing `bundles/` rule.
- `start`, `build`, `watch`, and `dev` copy the assets before starting their normal work.

## Headers And MIME Types

The local Express server serves the generated tree at `/bundles/moorhen` and adds:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: cross-origin
```

WASM files are explicitly served as `application/wasm`. The cross-origin resource policy allows the development
bundle and Moorhen assets to be embedded by the Django page when the two servers use different ports.

RDKit's external script element now requests `unpkg.com` through anonymous CORS so it remains compatible with
`Cross-Origin-Embedder-Policy: require-corp`.

The production/Django/nginx/ingress requirements and deployment probes are documented in
`docs/moorhen-static-deployment.md`. The COOP and COEP headers must be applied to the top-level Django HTML response;
putting them only on static resources is insufficient for `window.crossOriginIsolated`.

## CI And Containers

- GitHub Actions verifies Moorhen assets after the production build.
- Jenkins performs the same verification in its build stage.
- The Docker build uses the normal asset-copying production build and then runs the explicit verification command.

## Verification

- `yarn install --immutable`: passed with the previously documented legacy peer-range warnings.
- Focused infrastructure/viewer-flag tests: 3 suites and 9 tests passed.
- `yarn test:ci`: passed, 23 suites and 127 tests.
- `yarn build`: passed with Webpack `5.108.4` and the stats-contract validator.
- Production bundle: `main-a79631e6fa96796ecaef.js`, 14,056,971 bytes (13.4 MiB).
- Production compiler output: only the three existing bundle-size warnings.
- Asset verification: 275 files and 114,450,225 bytes passed path, size, and SHA-256 checks.
- Development bundle on port 3031: compiled successfully with no warnings or errors.
- HTTP probes for `CootWorker.js`, `moorhen.wasm`, and `ALA.cif`: HTTP 200 with correct lengths and isolation
  headers; WASM returned `Content-Type: application/wasm`.
- RDKit CDN probe: HTTP 200 with `Access-Control-Allow-Origin: *` and
  `Cross-Origin-Resource-Policy: cross-origin`.
- GitHub Actions YAML parse: passed.
- `docker build --check .`: passed with no warnings.
- `docker build --tag fragalysis-frontend:stage15 .`: passed in 237 seconds, including the immutable install,
  production build, stats validation, and Moorhen asset verification.
- Exported image audit: 275 Moorhen assets totaling 114,450,225 bytes; worker, both WASM files, and the sample
  monomer dictionary were present. The image size is 1,183,121,462 bytes (about 1.10 GiB).
- React and ReactDOM dependency audit: one browser runtime at `19.2.7`.
- Main-bundle source audit: no Moorhen runtime references.
- `git diff --check`: passed.
- The temporary development process was stopped and ports 3030/3031 were released.

Cypress was not run locally because it is the CI-only browser check for this setup.

## Quick Manual Check

1. Run `yarn start`, open Fragalysis through the usual Django URL, and load a normal target. Confirm NGL still
   renders, rotates, and toggles a ligand normally.
2. Open `http://localhost:3030/bundles/moorhen/moorhen.wasm` in the Network panel. Confirm HTTP 200,
   `Content-Type: application/wasm`, and the COOP/COEP/CORP response headers.
3. Open a molecule table that renders RDKit thumbnails. Confirm the thumbnails appear and the console has no COEP,
   CORS, worker, WASM, duplicate-React, or invalid-hook errors.
4. After the Django/backend header policy is configured, evaluate `window.crossOriginIsolated` and confirm it is
   `true`. Until those document-response headers are deployed, the static-server headers alone cannot make it true.
