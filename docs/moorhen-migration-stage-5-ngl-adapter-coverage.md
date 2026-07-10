# Moorhen Migration Stage 5: Complete NGL Adapter Coverage

## Outcome

All active application-to-viewer operations now pass through the viewer adapter while NGL remains the only enabled
engine. Existing Redux names and the legacy `{ id, stage }` view list remain available to limit migration risk, but
raw stages are treated as opaque values and wrapped immediately by `asViewerAdapter`.

## Covered Behavior

- Molecule, protein, surface, vector, hotspot, and density/map loading.
- Component lookup, centering, removal, and remove-all cleanup.
- Representation creation, lookup, parameter edits, visibility, type changes, and removal.
- Viewer parameters and density representation controls.
- Orientation reads, writes, and smooth snapshot orientation animation.
- Picking and click normalization for interactions, molecule groups, vectors, and coordinate filtering.
- Viewer resize, renderer element access, render-task completion, and event subscription cleanup.
- Snapshot viewer-image capture while preserving the existing DOM screenshot output.

## Adapter Lifecycle

`viewerAdapterFactory` creates the active adapter and caches wrappers for legacy stages. `NglProvider` maintains one
adapter per registered view while preserving the existing `nglViewList` structure.

The NGL view component now creates stages, renders coordinate-search spheres, registers events, and resizes through
the adapter. Event handlers are deduplicated and removed when the effect reruns or the component unmounts. Stage
destruction remains disabled to preserve the existing preview remount behavior.

## NGL Implementation Boundary

Direct NGL imports and engine API calls are limited to:

- `js/viewer/NglViewerAdapter.js`
- `js/viewer/ngl/representationHelpers.js`
- `js/components/nglView/renderingObjects.js`
- `js/components/nglView/renderingHelpers.js`

The rendering modules are private implementation dependencies invoked by `NglViewerAdapter.loadObject`. A boundary
test scans the source tree and fails if new direct NGL imports or stage/component calls appear elsewhere.

## Verification

- `yarn test:ci`: passed, 12 suites and 80 tests.
- Adapter tests cover caching, loading delegation, object and representation operations, task tracking, orientation,
  normalized picking, event cleanup, screenshots, and lifecycle methods.
- Viewer boundary tests: passed, 2 tests.
- `yarn build`: passed with Webpack 4.46.0.
- Production bundle: `main-17125e84483539192d57.js`.
- Prettier checks: passed for all normally formatted touched files.
- `git diff --check`: passed; Git reported only the existing LF-to-CRLF working-tree warnings.
- Cypress was not run locally. It remains a CI-only check for this project environment.

## Manual Parity Check

1. Open a target and verify the main and summary viewers initialize without console errors.
2. Toggle ligands, proteins, complexes, surfaces, density maps, artefact chains, and vectors from both LHS and RHS
   workflows.
3. In display controls, toggle object and representation visibility, add a representation, change its type and
   parameters, and remove it.
4. Adjust background, clipping, fog, density ISO level, box size, opacity, contour, and map color controls.
5. Exercise atom/bond picking, coordinate-radius filtering, molecule-group selection, and vector selection.
6. Rotate and center the viewer, save a snapshot, switch to another snapshot, and confirm orientation restoration and
   smooth animation.
7. Confirm snapshot images are still generated and visually match the pre-migration behavior.
8. Switch targets or leave and reopen the preview, then confirm controls fire once and the viewer remains responsive.
