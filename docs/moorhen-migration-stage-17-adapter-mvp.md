# Moorhen Migration Stage 17: Adapter MVP

Stage 17 adds `MoorhenViewerAdapter` behind the existing viewer contract. NGL remains the default engine. Moorhen is
selected only when `viewer_engine` is explicitly set to `moorhen` at runtime or `VIEWER_ENGINE=moorhen` is supplied
to the frontend build/development server.

## MVP Scope

The adapter owns Moorhen molecule and map objects and implements:

- basic PDB/mmCIF molecule loading with an initial Moorhen representation;
- CCP4/MAP and MTZ map loading;
- Fragalysis template-protein and density request translation;
- object lookup, removal, and remove-all cleanup;
- molecule, map, and representation visibility;
- molecule/map centering;
- basic orientation state, resize, task, and screenshot bridges required by the existing adapter contract.

The flagged Preview path lazy-loads Moorhen and mounts it only in the main viewer. The summary viewer stays disabled
in this MVP because Moorhen 0.22.7 uses a singleton Redux store internally. This prevents two canvases from sharing
and mutating the same molecule/map state. Ligands, contacts, vector/sphere rendering, snapshot orientation parity,
and full representation controls remain Stage 18 work.

## Isolation And Rollback

- With no viewer setting, `viewerEngine` resolves to `ngl` and the existing NGL component is rendered unchanged.
- Moorhen code is loaded through a lazy chunk only in flagged mode.
- Moorhen uses its own Redux provider/store and adapter-owned object registry.
- Adapter cleanup deletes its Moorhen objects and unregisters the view when the main canvas unmounts.
- An unknown viewer value still falls back to NGL.

## Quick Manual Check

1. Start a flagged server on a free port from PowerShell:

   ```powershell
   $env:VIEWER_ENGINE='moorhen'; $env:DEV_SERVER_PORT='3032'; yarn start
   ```

2. Open `http://localhost:3032/viewer/react/moorhen-proof/`. Wait for the `Moorhen ready` status to report at least
   one molecule and one map, then rotate and zoom the structure. This proof now loads its PDB and MTZ data through
   `MoorhenViewerAdapter`.
3. For the integrated MVP check, open the normal Preview page through Django and confirm its main bundle is loaded
   from port `3032`. Wait for `Moorhen ready`, then verify the template protein and an available density map can
   be shown, hidden, centered, and removed. The standalone frontend server cannot serve the normal Preview HTML.
4. Stop the flagged server, clear `VIEWER_ENGINE` (and any `window.DJANGO_CONTEXT.viewer_engine` override), restart
   the usual frontend server, and confirm the same Preview loads with NGL as before.

This document records the Stage 17 boundary. Ligand, complex, surface, vector, sphere, snapshot, and representation
parity are implemented in [Stage 18](./moorhen-migration-stage-18-parity-expansion.md).

## Automated Verification

- `MoorhenViewerAdapter` tests cover runtime validation, factory recovery, molecule/map loading, Fragalysis request
  translation, visibility, centering, removal, and cleanup.
- Viewer configuration tests confirm NGL remains the default and Moorhen requires an explicit flag.
- The complete Jest suite and production build pass.
- Webpack keeps the Moorhen preview host and Moorhen dependency in lazy chunks.
- The isolated proof route loads its tutorial molecule and MTZ maps through `MoorhenViewerAdapter`.
