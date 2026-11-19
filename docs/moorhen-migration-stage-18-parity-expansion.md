# Moorhen Migration Stage 18: Parity Expansion

Stage 18 expands `MoorhenViewerAdapter` from the Stage 17 proof into the Fragalysis Preview workflows. Moorhen is
still opt-in through `viewer_engine=moorhen` or `VIEWER_ENGINE=moorhen`; NGL remains the default and immediate
rollback engine.

## Implemented Parity

- Protein and ligand loading from URLs, files, or structure strings.
- Complex loading by merging the ligand into the protein molecule.
- CCP4/MAP and MTZ density loading, including difference-map positive and negative colours.
- Molecular surfaces, interaction vectors, arrows, cylinders, and radius-search spheres.
- Fragalysis-to-Moorhen representation style mapping, visibility, opacity, colour, width, radius, and map controls.
- Whole-molecule, ligand, polymer, and native Moorhen CID selections. Changing a selection rebuilds the native
  representation while preserving the Fragalysis representation handle.
- Molecule and map centering, native rotate/pan/zoom controls, atom-pick translation, and resize bridging.
- Orientation capture and restore using the existing eight-element snapshot format.
- Screenshot capture, loading/task completion callbacks, and linked-object cleanup.
- Idempotent removal of molecules, maps, vectors, representations, and all adapter-owned state.

## Two-Canvas Gate

In Moorhen mode, Moorhen owns only `VIEWS.MAJOR_VIEW`. The summary/molecule-group canvas continues to use NGL.
Moorhen 0.22.7 hard-codes a singleton Redux store internally, so mounting two independent Moorhen canvases would
mix their molecules, maps, vectors, and camera state. Keeping the summary canvas on NGL preserves molecule-group
selection without shared-state corruption. Both canvases still register through the same `ViewerAdapter` boundary.

## Representation Translation

Common NGL styles map to Moorhen styles, including cartoon/ribbon to `CRs`, ball-and-stick to `ligands`, line and
licorice to `CBs`, spacefill to `VdwSpheres`, and surface to `MolecularSurface`. Map representation parameters are
translated to Moorhen contour level, radius, alpha, line/solid style, and colour actions.

NGL atom-index expressions do not have a general one-to-one Moorhen CID translation. Native CIDs are passed
through, common Fragalysis aliases are translated, and an unknown expression falls back to the whole molecule.
This keeps restored representations visible while avoiding invalid Moorhen selections.

## Automated Verification

- Adapter tests cover protein, ligand, complex, surface, map, MTZ, vector, sphere, representation, selection,
  visibility, centering, orientation, pick, screenshot, progress, and cleanup behavior.
- Translation tests cover colours, styles, selections, coordinate shapes, and typed-array snapshot orientation.
- The viewer-boundary test permits native API calls only in the NGL and Moorhen adapter implementations.
- The complete Jest suite and production build are run as the Stage 18 gate.
- Cypress remains a CI-only check on this workstation.

## Quick Manual Check

1. Start or keep the flagged frontend running:

   ```powershell
   $env:VIEWER_ENGINE='moorhen'; $env:DEV_SERVER_PORT='3032'; yarn start
   ```

2. Open `http://localhost:3032/viewer/react/moorhen-proof/`. Confirm the protein and map overlap, then rotate and
   zoom the view.
3. Open the normal Preview through the Django-backed application. Toggle one ligand, its protein, complex,
   surface, and available density. Confirm each appears on the main canvas and the density follows the protein.
4. In display controls, hide/show one representation, change its colour or opacity, and center the molecule.
5. Select a molecule group in the summary canvas and confirm its normal selection workflow still runs.
6. Rotate and zoom, switch away and back or restore a snapshot, and confirm the orientation returns. Trigger the
   existing screenshot/feedback capture once.
7. Deselect the objects and confirm they disappear without a repeating console error.
8. Restart without `VIEWER_ENGINE=moorhen` and confirm Preview uses NGL as before.

The highest-signal result is steps 3 through 7: if those work for one observation with density, the Stage 18
adapter, state bridge, snapshot bridge, and cleanup path are all being exercised together.
