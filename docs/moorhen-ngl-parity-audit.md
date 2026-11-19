# Moorhen/NGL Functional Parity Audit

Audit date: 2026-07-16

## Purpose

This audit treats the removed NGL behavior as the compatibility specification for Moorhen. It compares:

- the NGL implementation still available in Git history, especially
  `HEAD:js/components/nglView/renderingObjects.js`, `HEAD:js/components/nglView/renderingHelpers.js`, and
  `HEAD:js/viewer/NglViewerAdapter.js`
- the current `MoorhenViewerAdapter` and Moorhen view host
- every current Preview, snapshot, display-control, and Tindspect call site that uses the viewer adapter
- existing unit and Cypress coverage

This is primarily a static code audit. A status of **implemented** means that a Moorhen path exists; it does not imply
visual parity unless a manual or browser check is explicitly noted.

The [2026-09-15 contact follow-up](moorhen-contact-parity.md) supersedes the contact-classification findings below;
it records the computational and native-rendering checks separately from pending visual acceptance.

## Verdict

Stages 20 and 21 do not need to be reverted in order to recover old behavior. The removed implementation remains a
usable reference in Git history, and the adapter boundary is a reasonable place to restore parity. Reintroducing NGL
would add another runtime and another state path without resolving the Moorhen gaps.

The main Preview has a viable Moorhen foundation: startup, a single canvas, molecule/map loading, native camera
controls, composite object loading, and cleanup are present. It is not yet functionally equivalent to NGL. The largest
remaining gaps are quality rendering, picking-based workflows, representation/selection translation, OpenDX hotspots,
and the two-canvas Tindspect route.

## Implemented During This Pass

- Object and representation failures now reject; pending counters still clear, failed handles are removed, and LHS/RHS
  selection state rolls back instead of claiming an object rendered.
- Historic 16-value NGL `Matrix4` snapshots restore center and rotation. Moorhen keeps its fitted zoom because NGL camera
  distance and Moorhen zoom are not compatible units.
- Hit-protein and artefact objects merge their ligand again and preserve the old default line widths.
- Right-side ligands preserve the old thin `0.11` bond radius.
- Event-map molecules now include cartoon, ligand, and contact layers; linked-map representation removal no longer leaves
  stale adapter state.
- Display controls wait for Moorhen representation creation/editing before committing Redux state, and the color editor
  handles representations without an initial color.

## Status And Priority

- **Implemented**: a corresponding Moorhen path exists and has focused adapter coverage.
- **Partial**: a path exists but intentionally or accidentally drops NGL behavior.
- **Missing**: the old behavior has no current equivalent.
- **High risk**: code exists, but its input format or ownership model does not match Moorhen and lacks a runtime proof.
- **P0**: state/data integrity or saved-user-state compatibility; fix before broad polishing.
- **P1**: normal Preview behavior users are likely to notice.
- **P2**: specialized workflows or deeper controls.
- **P3**: lower-impact polish and naming cleanup.

## Findings

### P0: Reliability And Saved State

| Workflow                         | Status                | Finding                                                                                                                                                                                                               | Evidence                                                                                     |
| -------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Failed object loads              | Implemented           | Adapter failures reject, pending counters clear in `finally`, and display hooks roll back optimistic LHS/RHS selection state.                                                                                         | `js/reducers/ngl/dispatchActions.js`, `js/reducers/ngl/useDisplay*.js`                       |
| Historic snapshot orientation    | Partial compatibility | Current 8-value snapshots restore fully. Historic NGL `Matrix4` snapshots restore quaternion and origin using a real repository fixture; zoom remains Moorhen-fitted because the stored NGL value is camera distance. | `js/viewer/moorhenAdapterUtils.js`, `js/viewer/moorhenAdapterUtils.test.js`                  |
| Representation creation failures | Implemented           | Failed handles reject and are removed from adapter state. Add/change/edit controls wait for `ready` before updating Redux.                                                                                            | `js/viewer/MoorhenViewerAdapter.js`, `js/components/preview/viewerControls/displayControls/` |

### P1: Core Preview Objects

| Workflow          | NGL behavior                                                                                                                      | Moorhen status | Gap                                                                                                                                                                                |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Template protein  | PDB plus configured protein style                                                                                                 | Implemented    | Adapter-covered at the molecule level; verify the real initial target load and color once.                                                                                         |
| Ligand            | SDF, ball-and-stick or thinner RHS licorice, element colors, multiple bonds, optional quality overlay                             | Partial        | Basic SDF/style and the RHS `0.11` radius are present. Moorhen's ligand style decides bond multiplicity; quality is missing.                                                       |
| Hit protein       | Protein and ligand loaded and merged into one named component; line representation on the protein model; optional protein quality | Partial        | Protein and ligand are merged and the old width is preserved. The old `/0` model-only selection maps to all atoms in Moorhen, and quality is missing.                              |
| Artefact chains   | Artefact PDB and ligand merged; line representation on the artefact model; optional protein quality                               | Partial        | Artefact and ligand are merged and the old width is preserved. The model-only selection and quality overlay remain gaps.                                                           |
| Complex           | Protein and ligand merged; NGL contact representation with hydrogen-bond options over both models                                 | Partial        | Merge exists. `contact` is approximated as Moorhen `contact_dots`; the NGL selection and contact parameters are not preserved.                                                     |
| Quality toggle    | Replaces/reloads ligand or protein with good/bad atom and bond coloring plus shape overlays tied to visibility                    | Missing        | Quality metadata is parsed and the UI/state still expose `Q`, but `loadQuality` and `quality` are ignored by the adapter. `withQuality`/`isShape` representations no longer exist. |
| Molecular surface | Polymer AV/VDW molecular surface with electrostatic color scheme and 0.74 opacity                                                 | Partial        | Molecular surface and opacity exist, but it uses a flat target color. Electrostatic coloring and AV/VDW semantics are not translated.                                              |

Quality is still requested by the display hooks, but the adapter intentionally does not consume the old NGL atom-index
metadata. Moorhen requires structural CIDs; reusing NGL indices would highlight the wrong atoms.

### P1: Interaction Parity

| Workflow                 | Status                         | Finding                                                                                                                                                                                                    |
| ------------------------ | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rotate, pan, zoom        | Implemented, manually observed | Moorhen native camera interaction works on the main Preview. Orientation event coverage still needs a drag, wheel, and snapshot round-trip check.                                                          |
| Atom picking             | Implemented                    | `atomClicked` is normalized to atom position and component name. Unit-covered.                                                                                                                             |
| Interaction/bond picking | Missing                        | NGL converted picked contact bonds into an interaction id and coordinates, then drew the red duck/yank arrow. Moorhen emits only `kind: 'atom'`, so the bond branch in `handleNglViewPick` is unreachable. |
| Component picking        | Partial                        | The code can identify molecule buffers, but vector/shape/component picks are not normalized. Molecule-group, PANDDA-site, and vector selection all depend on `componentName`.                              |
| Vector geometry          | Partial                        | Arrow/cylinder endpoints and colors are translated. The requested radius is dropped, and vector picking is absent.                                                                                         |
| Radius sphere            | Implemented                    | A one-atom VDW representation emulates the NGL shape sphere and carries the requested radius. Adapter-covered; click identity still needs a browser check where used.                                      |

Evidence: `js/viewer/MoorhenViewerAdapter.js:620-660`, `js/viewer/MoorhenViewerAdapter.js:894-919`, and
`js/components/nglView/redux/dispatchActions.js:64-110`.

### P1: Display Controls And Representations

| Workflow                           | Status                           | Finding                                                                                                                                                                                         |
| ---------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Show/hide object or representation | Implemented, workflow-unverified | Molecule, map, and vector visibility paths exist. UI calls are not awaited, so redraw failures and rapid toggles can race Redux state.                                                          |
| Add/change representation          | Partial                          | Creation is now transactional, but the UI still offers all 22 NGL types. Moorhen maps several to broad approximations such as labels to `CBs`, axes to `unitCell`, and distance to `allHBonds`. |
| Selection editing/restoration      | Partial                          | Only all/polymer, ligand, `/0`, `/1`, and already-native slash CIDs are recognized. Every other NGL atom expression becomes the whole molecule.                                                 |
| Parameter editing                  | Partial                          | Moorhen handles visibility, opacity, color, basic width/radius, and map controls. Most NGL style-specific parameters are retained in Redux but ignored.                                         |
| Edit menu robustness               | Implemented                      | Missing color values use a safe fallback, and edits commit to Redux only after Moorhen redraw succeeds.                                                                                         |
| Remove representation/object       | Implemented, workflow-unverified | Basic and linked-map removal are unit-covered. Native molecule buffer deletion remains asynchronous.                                                                                            |

Evidence: `js/viewer/moorhenAdapterUtils.js:15-38`, `js/viewer/moorhenAdapterUtils.js:83-112`,
`js/viewer/MoorhenViewerAdapter.js:503-567`, `js/viewer/MoorhenViewerAdapter.js:713-799`, and
`js/components/preview/viewerControls/displayControls/editRepresentationMenu.js:150-193`.

### P1/P2: Density And Maps

| Workflow                          | Status                                | Finding                                                                                                                                                                                                                                                    |
| --------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Event, 2Fo-Fc, and Fo-Fc map load | Implemented, visual parity unverified | CCP4/MAP loading exists and adapter tests cover map actions. The user has already confirmed map/protein alignment after the coordinate fix.                                                                                                                |
| Positive/negative difference map  | Partial                               | Moorhen uses one difference map with positive and negative colors, whereas NGL created two surface components. This is a sound Moorhen model, but display-control identity, snapshot restore, visibility, and deletion must be checked as one logical map. |
| ISO, box size, opacity, wireframe | Implemented, workflow-unverified      | Redux suffix filtering reaches the Moorhen map handle and unit tests cover translated store actions. Browser behavior is not covered.                                                                                                                      |
| Difference-map colors             | Partial                               | Initial positive/negative colors are applied. The current settings panel has no negative-color editor, and generic color edits update only the positive color.                                                                                             |
| Map centering                     | Implemented                           | Uses Moorhen `centreOnMap`; verify it does not disturb molecule/map registration.                                                                                                                                                                          |

Evidence: `js/viewer/MoorhenViewerAdapter.js:199-233`, `js/viewer/MoorhenViewerAdapter.js:426-500`,
`js/viewer/MoorhenViewerAdapter.js:569-608`, and `js/reducers/ngl/dispatchActions.js:264-322`.

### P2: Specialized Viewers

| Workflow                   | Status                  | Finding                                                                                                                                                                                                                                                   |
| -------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tindspect two-canvas route | High risk               | Both canvases mount `MoorhenContainer` against Moorhen's singleton `MoorhenReduxStore`. Camera, molecules, maps, and vectors can leak between the summary and major views. Stage 18 explicitly avoided this configuration, but stages 20/21 now mount it. |
| Tindspect action wiring    | Missing stage ownership | Site/event loaders dispatch `loadObject` and `deleteObject` without a viewer adapter. The generic action rejects when no `stage` is supplied. This appears to be old wiring debt exposed by the audit and should be fixed while restoring the route.      |
| Event-map scene            | Partial                 | Moorhen now loads cartoon, ligand, contact dots, and one signed difference map. The explicit 5 A nearby-residue line layer is still missing.                                                                                                              |
| PANDDA site spheres        | Partial/high risk       | Sphere rendering exists, but the route's missing stage and two-store ownership prevent a reliable end-to-end path.                                                                                                                                        |
| Hotspot OpenDX maps        | High risk               | NGL explicitly loaded `ext: 'dx'`. Moorhen sends `hotUrl` to its CCP4/MAP loader, with no conversion or OpenDX proof and no test. Treat this as unsupported until a real hotspot succeeds.                                                                |

Evidence: `js/components/tindspect/Tindspect.js:10-20`, `js/components/moorhenView/MoorhenView.js:27-58`,
`js/components/moorhenView/MoorhenView.js:190-201`, `js/components/tindspect/eventSlider.js:21-46`,
`js/hoc/withPanddaSiteList.js:44-59`, and `js/viewer/MoorhenViewerAdapter.js:259-288`.

### P2/P3: Scene, Snapshot, And Utility Behavior

| Workflow                            | Status                          | Finding                                                                                                                                                                |
| ----------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New Moorhen orientation persistence | Implemented                     | Current 8-value orientation capture/restore is unit-covered.                                                                                                           |
| Snapshot transition animation       | Missing polish                  | `animateOrientation` applies the final pose immediately and ignores the requested duration.                                                                            |
| Snapshot object restore             | Partial/high risk               | Restore replays current display hooks, so unsupported quality/styles still affect snapshots. Load failures now reject instead of completing falsely.                   |
| Snapshot screenshot capture         | Fixed, browser-unverified       | The adapter redraws and freezes the canvas before DOM cloning; both saved images substitute that frame in the clone. Cleared-buffer regressions are unit-covered.       |
| Rendering progress                  | Partial                         | Moorhen `activeMessages.length` substitutes for NGL's task queue. It may not cover representation redraws or store-dispatched work.                                    |
| Background, clip, fog               | Partial                         | Background, near/far clipping, and near/far fog are translated. The visible `Clip dist` control dispatches `clipDist`, which Moorhen ignores.                          |
| Resize/layout                       | Implemented, browser-unverified | The adapter exposes resize and Preview keeps one portal-mounted canvas. Tindspect's `height` prop is dropped by `MoorhenView`, so its sizing requires separate repair. |
| Cleanup                             | Implemented at adapter level    | Molecules, maps, linked event maps, vectors, and event listeners are removed. Rapid UI deletion remains asynchronous and needs workflow coverage.                      |

## Test-Coverage Audit

Current automated coverage is useful but narrower than the Stage 18 parity checklist:

- `MoorhenViewerAdapter.test.js` covers direct/RHS ligand, hit-protein, artefacts, complex, event scene, surface, raw map,
  MTZ, vector, sphere, representation failures, linked-map removal, orientation, atom events, screenshots, progress,
  visibility, and cleanup.
- It does not cover aggregate `DENSITY`, `HOTSPOT`, quality mode, bond/component picks, or multiple adapters sharing the
  Moorhen store.
- Utility tests cover current 8-value orientation and historic 16-value NGL center/rotation conversion.
- Redux adapter tests cover successful load/delete/orientation bookkeeping and rejected load/pending-counter behavior.
- The full local result is 29 suites and 171 tests passing; the production build and legacy webpack stats validation pass.
- Cypress checks that the Preview route contains a visible canvas; it does not load or operate a ligand, protein,
  complex, surface, map, representation control, snapshot, or Tindspect view.
- No screenshot comparison currently enforces NGL-equivalent scene composition.

## Remaining Repair Order

1. **Restore quality mode.** Convert quality atom names to structural CIDs and reproduce bad-atom/bond visuals with Moorhen
   color rules or custom buffers.
2. **Finish saved-state scale compatibility.** Calibrate historic NGL camera distance against Moorhen zoom with a matched
   before/after scene, then test animated snapshot switching.
3. **Constrain and complete display controls.** Offer only supported Moorhen styles, define style-specific parameter
   templates, translate saved NGL selections where possible, and expose a visible unsupported-selection warning rather
   than silently selecting the whole molecule.
4. **Restore interaction workflows.** Map Moorhen atom/bond/contact events to the legacy interaction contract, preserve
   component identity for selectable vectors/spheres, and restore vector radius.
5. **Close density parity.** Verify all three map types together, positive/negative difference colors, settings, hide/show,
   deletion, and snapshot restore. Keep Moorhen's one-map representation if those workflows remain equivalent.
6. **Repair specialized routes.** Give Tindspect explicit adapter ownership and solve the singleton-store two-view design
   before testing its event scene. Add an OpenDX conversion or a supported hotspot rendering path.
7. **Polish utility parity.** Implement camera animation or explicitly accept immediate transitions, map `clipDist`, and
   verify screenshot, progress, resize, and cleanup behavior in-browser.

## Manual Verification Ready Now

This is the useful first pass; it should take about five minutes:

1. Open one target and toggle ligand, protein, complex, surface, artefacts, and density for one observation.
2. Confirm each successful load selects its control, each object stays aligned, and deselection removes only that object.
3. In Display controls, change one ligand representation, color, and opacity; then hide/show and remove it.
4. Change ISO, box size, opacity, and wireframe on one difference map.
5. Save and restore a new snapshot, then open one historic snapshot and check center/rotation. Its zoom may differ.

Do not spend manual time on these yet; they are known implementation gaps:

- quality (`Q`) bad-atom/bond overlays
- complex contact/bond picking and the red interaction arrow
- vector/component picking and exact vector radius
- Tindspect's independent two-canvas behavior
- OpenDX hotspot maps
- exact legacy snapshot zoom and animated camera transitions

## Completion Gate

Moorhen can be considered equivalent enough to the removed NGL integration when:

- every P0 and P1 row is implemented and has an automated contract or CI browser flow
- a real pre-Moorhen snapshot restores its camera, objects, maps, and supported representations
- the core Preview batch passes for LHS and RHS observations
- density controls and cleanup pass with all available map types loaded together
- Tindspect is either repaired and tested or explicitly removed from the supported product surface
- expected unsupported NGL-only styles/selections are documented in the UI contract and do not fail silently
