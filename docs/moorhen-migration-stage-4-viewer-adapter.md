# Moorhen Migration Stage 4: Viewer Adapter Skeleton

## Outcome

Stage 4 introduces a viewer-independent adapter contract and an NGL implementation. NGL remains the only active
viewer, and existing code can continue to access raw NGL stages while later stages move operations behind the
adapter incrementally.

## Adapter Contract

`ViewerAdapter` defines the migration surface:

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

`NglViewerAdapter` implements each method by delegating to the current NGL stage, component, or representation API.
Engine-native handles are intentionally accepted during the staged migration; Stage 5 can move existing callers
behind this boundary without a large rewrite.

## Provider Integration

`NglProvider` creates one adapter for each registered stage and stores it in a private map. The existing
`nglViewList` remains unchanged as `{ id, stage }`, avoiding changes to snapshot and Redux call sites. Consumers can
retrieve the adapter with `getViewerAdapter(id)`.

Two low-risk operations now use the adapter:

1. NGL interaction events read the current orientation through `getOrientation`.
2. Project snapshot restoration applies orientation through `setOrientation`.

## Verification

- `yarn test:ci`: passed, 11 suites and 73 tests.
- Adapter tests: passed, 4 tests covering all adapter methods and the required-stage guard.
- `yarn build`: passed with Webpack 4.46.0.
- Production bundle: `main-951865fd89044c11727f.js`.
- Prettier checks for new and normally formatted touched files: passed.
- `git diff --check`: passed; Git reported only the existing LF-to-CRLF working-tree warnings.
- Cypress was not run locally. It remains a CI-only check for this project environment.

## Manual Check

1. Open a target and confirm molecules, maps, surfaces, vectors, and display controls still behave as before.
2. Rotate or pan the main viewer and confirm interaction remains smooth; this exercises adapter-based orientation
   reads.
3. Open a saved snapshot with a distinct orientation and confirm the view restores correctly; this exercises
   adapter-based orientation writes.
