# Moorhen Migration Stage 8: Node 24 LTS

## Outcome

The project now targets Node `24.18.0` LTS with Yarn `4.17.1` and Webpack `5.108.4`. Fresh host and container
installs, tests, production builds, and the development server all work without application code changes.

## Runtime Pins

- `.nvmrc` and `.node-version` pin `24.18.0`.
- `package.json` declares `node >=24.18.0 <25`.
- GitHub Actions reads `.node-version` through `actions/setup-node`.
- Docker uses the exact `node:24.18.0-bookworm` base image.
- README developer prerequisites and setup checks now name Node 24 LTS.

The Jenkins agent runtime is managed outside this repository. Its existing pipeline now uses the Stage 7 Corepack and
Yarn 4 commands and should be provisioned with Node 24.18.0 to match the repository pins.

## Verification

- Host toolchain: Node `24.18.0`, npm `11.16.0`, Corepack `0.35.0`, Yarn `4.17.1`.
- Clean install: removed `node_modules`, then `yarn install --immutable` passed in 84 seconds without changing
  `yarn.lock`.
- `yarn test:ci`: passed, 12 suites and 80 tests.
- `yarn build`: passed with Webpack `5.108.4` and the Stage 6 stats-contract validator.
- Production bundle: `main-ec8e61c62e90cdbb6ecb.js`.
- GitHub Actions YAML parse: passed.
- `docker build --check .`: passed without warnings.
- `docker build --tag fragalysis-frontend:stage8 .`: passed in 141 seconds, including an immutable install and
  production build.
- Built image toolchain: Node `24.18.0`, npm `11.16.0`, Corepack `0.35.0`, Yarn `4.17.1`.
- `yarn start`: passed under Node 24; the development bundle returned HTTP 200 and HMR returned a valid `sync` event
  and heartbeat without compiler warnings or errors.
- The verification server was stopped afterward and port 3030 is free.
- Cypress was not run locally. It remains a CI-only check for this project environment.

The production compiler retains only the three existing bundle-size performance warnings. Yarn retains the Stage 7
legacy peer dependency warnings.

## Deferred Test Warning

Node 24 emits deprecation warning `DEP0176` because `pn`, loaded by the Jest 24-era `jsdom`, reads `fs.F_OK`. The
warning does not fail tests and originates entirely in the transitive test stack. Stage 10 already upgrades Jest and
jsdom, so that migration owns this cleanup rather than patching a transitive package in Stage 8.

## Quick Manual Check

1. Run `node --version` and `yarn --version`; confirm `v24.18.0` and `4.17.1`.
2. Run `yarn start`, open the application through the usual Django URL, and load one target.
3. Confirm page assets and the NGL viewer load, then rotate the structure or toggle one ligand.
4. Stop the server and run `yarn install --immutable`; it should finish without changing `yarn.lock`.
