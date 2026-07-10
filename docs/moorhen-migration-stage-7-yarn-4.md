# Moorhen Migration Stage 7: Yarn 4

## Outcome

The project now uses Yarn `4.17.1` through Corepack while retaining a conventional `node_modules` installation.
Plug'n'Play remains disabled and application runtime dependencies are unchanged.

## Project Configuration

- `package.json` pins `packageManager` to `yarn@4.17.1`.
- `.yarnrc.yml` sets `nodeLinker: node-modules`.
- The cache is project-local through `enableGlobalCache: false` and generated `.yarn` files are ignored.
- Third-party lifecycle scripts remain disabled through `enableScripts: false`, preserving the former
  `ignore-scripts true` policy from `.yarnrc`.
- `yarn.lock` was regenerated in Yarn lockfile metadata version 10 format.
- `.dockerignore` excludes generated dependencies, bundles, and Yarn cache data from the image context.

## CI And Containers

- GitHub Actions enables Corepack, caches `.yarn/cache`, and installs with `yarn install --immutable`.
- Jenkins enables Corepack and installs with `yarn install --immutable`.
- Docker now uses the Corepack bundled with the Node image instead of installing Yarn Classic from the Debian
  repository.
- The Docker build uses an immutable install and no longer receives host `node_modules` or Yarn cache files.

## Developer Setup

Run `corepack enable` once, then use the normal `yarn` commands. On Windows installations where Node is under a
protected directory, the documented non-admin fallback installs Corepack shims into `npm config get prefix`.

## Verification

- Yarn identity/configuration: `4.17.1`, `node-modules`, project-local cache, dependency scripts disabled.
- Clean install: removed `node_modules`, then `yarn install --immutable` passed in 42 seconds.
- Repeat immutable install: passed in 2 seconds.
- `yarn test:ci`: passed, 12 suites and 80 tests.
- `yarn build`: passed with Webpack `5.108.4` and the Stage 6 stats-contract validator.
- Production bundle: `main-177bd3803e94100d4994.js`.
- GitHub Actions YAML parse: passed.
- `docker build --check .`: passed without warnings.
- Uncached `docker build --tag fragalysis-frontend:stage7 .`: passed in 144 seconds, including the Yarn install and
  production build.
- `yarn start`: passed from the clean install; the development bundle returned HTTP 200 and HMR returned a valid
  `sync` event without warnings or errors. The verification server was stopped afterward.
- Cypress was not run locally. It remains a CI-only check for this project environment.

The production compiler retains only the three existing bundle-size performance warnings.

## Known Peer Warnings

Yarn 4 reports pre-existing peer dependency debt:

- React 18 does not satisfy several older React 16/17 package ranges.
- `formik-material-ui-pickers` declares an unmet `@material-ui/pickers` peer and is not imported by application code.
- `@types/react` and `tiny-warning` are not declared at the project root but remain available through transitive
  dependencies.

These warnings do not fail installation, tests, the browser bundle, or the clean container build. They are left for
the dependency modernization stages.

## Quick Manual Check

1. Run `yarn --version` and confirm it reports `4.17.1`.
2. Run `yarn start`, open the application through the usual Django URL, and load one target.
3. Confirm the page assets and NGL viewer load, then rotate the structure or toggle one ligand.
4. Stop the server and run `yarn install --immutable`; it should finish without changing `yarn.lock`.
