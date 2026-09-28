# Interaction classification and colours

Implemented 2026-09-15 after the all-blue contact report.

The former adapter requested Coot hydrogen bonds and rendered them all in NGL's hydrogen-bond blue. It did not calculate
the other NGL interaction categories. The replacement computes the original NGL contact classifications in a dedicated
worker and renders their geometry through Moorhen. See the [detector documentation](../js/viewer/contacts/vendor/README.md)
for algorithms, defaults, colours, pinned sources, licence notices and reproducible reference comparisons.

In NGL-style mode, the contact control includes hydrogen and weak hydrogen bonds, ionic contacts, aromatic interactions,
halogen bonds and metal coordination. Saved parameters can also enable water, backbone and hydrophobic contacts. Different colours
represent calculated categories; a selection containing only hydrogen bonds can still legitimately look all blue.

Protein/SDF topology remains separate for calculation and is never stored in Fragalysis Redux. Native representations
receive final meshes before becoming visible. Pending worker jobs count as viewer work, and molecule removal waits for
contact generation and representation disposal. Existing snapshot serialization and in-place switching are unchanged.

## Code switch

Set `USE_NGL_STYLE_INTERACTIONS` in [`js/config/viewer.js`](../js/config/viewer.js), then rebuild/reload Preview:

- `false` (default): Moorhen's unmodified `allHBonds` path calls Coot's `get_h_bonds` for the contact molecule and builds its
  native purple dashed hydrogen bonds. It does not run the NGL detector or apply its category/threshold filters.
- `true`: the existing NGL detector, contact categories, filters and per-type colours, rendered by Moorhen.

This changes both detection and appearance for application contact representations, including complexes, event-map
contact layers and restored contacts. Native mode uses the whole contact molecule; the NGL ligand-environment and
selection filters remain specific to NGL mode. Visibility, opacity and asynchronous cleanup retain the same lifecycle.
The setting is not serialized in snapshots. Reload after changing modes so already loaded representations are recreated.
Moorhen remains the viewer in both modes.

## Automated acceptance

Completed: `yarn test:ci` (50 suites, 347 tests), targeted ESLint, `yarn build` including backend stats validation,
and `yarn verify:moorhen-assets` (275 files). The build reports bundle-size warnings only.

- Independent comparisons with the original NGL bundle cover all ten contact types, complete endpoints/colours/radii,
  model selections, paired filters, parameter changes, complex ligand topology and event-map environments.
- V3000 and V2000 equivalents produce matching contacts, with V3000 coordinate precision preserved.
- The shipped worker executes off-thread, returns typed arrays, survives a failed calculation and releases its URL.
- Installed Moorhen geometry preserves every type's colour, native dashed geometry and lengths beyond 4 Å.
- Native representation lifecycle checks cover final colours/opacity before visibility, delayed contact calculations,
  concurrent removal and failed calculations without leaving native buffers or registry entries.

## Manual acceptance still required

No browser was connected during implementation. Automated checks do not establish the screenshot's visual parity.
Reload the Django-backed Preview and verify the reported target with contact toggles, LHS/RHS transfers, camera motion,
layout changes, saving/restoring and same-project snapshot switching. Check that old contacts disappear, colours match
detected types, initial views reveal only completed representations, and repeated transfers do not grow tab memory.

## Development worker build fix (2026-09-17)

`yarn start` uses `webpack.config-dev.js`, independently of the production configuration. The development configuration
was missing the detector's `asset/source` rule: it imported the detector as a JavaScript module instead of the text
inserted into the worker. This produced the missing-default-export warning and `detectContacts is not defined` when
interactions were requested. Both configurations now load the detector as source text.

The existing worker test mocked that import, so it did not cover this build failure. A new integration test bundles the
worker factory with each configuration's actual module rules and executes the resulting worker against the contact
fixture. Before the fix, the development case reproduced the reported warning while the production case passed.

Validation: all 21 worker, detector and build-integration tests passed; targeted ESLint passed. A full development
compilation, with output and backend stats kept in memory to preserve the running server, completed without errors or
warnings and classified the detector as `asset/source`. No browser was connected for visual verification of the reported
pose. Restart `yarn start` and reload Preview before retesting; HMR does not reload the Webpack configuration.
