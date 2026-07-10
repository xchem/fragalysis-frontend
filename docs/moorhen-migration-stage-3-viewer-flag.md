# Moorhen Migration Stage 3: Viewer Feature Flag

## Outcome

Stage 3 adds viewer-engine configuration without enabling a second viewer. NGL remains the default and the only
runtime provider.

The configured value and the active value are kept separate. `moorhen` is recognized as a future configuration,
but currently resolves to the NGL fallback.

## Configuration Precedence

The viewer setting is resolved in this order:

1. `window.DJANGO_CONTEXT.viewer_engine`, provided before the frontend bundle loads.
2. `VIEWER_ENGINE` from the build environment.
3. `VIEWER_ENGINE` from the local `.env` file.
4. The default value, `ngl`.

Both production and development Webpack configurations inject the build environment value. The Django context
override allows a deployed dev or staging environment to control the flag without producing a different bundle.

## Runtime Safety

The root component selects its provider from an enabled-provider map. That map contains only `NglProvider` in this
stage. A configured value of `moorhen`, or an unknown value, records a fallback and keeps NGL active.

## Verification

- `yarn test:ci`: passed, 10 suites and 69 tests.
- `yarn build`: passed with Webpack 4.46.0.
- Production bundle: `main-546d0b73551786082b17.js`.
- `git diff --check`: passed; Git reported only the existing LF-to-CRLF working-tree warnings.
- Cypress was not run locally. It is retained as a CI-only check for this project environment.

## Manual Check

Start with no viewer setting, then repeat with `VIEWER_ENGINE=moorhen`. In both cases the existing NGL viewer should
load and behave exactly as before. The second case verifies the deliberate Stage 3 fallback; it does not enable
Moorhen yet.
