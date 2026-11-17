# Contact detection used by Moorhen

`detector.mjs` contains the computational subset of **NGL 2.0.0-dev.37**, the version previously used by Fragalysis.
Moorhen remains the only viewer and owns every rendered buffer. This module provides molecular parsing, bonding,
valence, aromatic rings, selections, interaction classification and refinement. It imports no NGL viewer, stage,
representation, GPU buffer or rendering worker. No NGL package is added to the application dependencies.

The entry and small integration bridges are in `scripts/contact-detector/`. Webpack embeds the module as source text;
`createContactWorker.js` places that source in a module Blob worker. This supports the separate Django and frontend
origins without fetching another worker script. The worker exchanges plain coordinate strings and typed result arrays.
Its owner rejects pending requests on worker errors and terminates it on adapter destruction. Parsed structures and
selection views are disposed after each calculation.

## Behaviour

The detector retains NGL's distance, angle, valence, aromaticity, alternate-conformer, model, line-of-sight and
redundant-contact filters. Fragalysis' former complex defaults enable weak hydrogen bonds and use a 35-degree donor
plane threshold and master model 0. Water, backbone hydrogen bonds and hydrophobic contacts remain disabled by default;
saved representation parameters can enable them. Type colours are:

| Contact | Colour |
| --- | --- |
| Hydrogen bond, water, backbone | `#2b83ba` |
| Weak hydrogen bond | `#c5ddec` |
| Ionic | `#f0c814` |
| Cation–pi | `#ff8000` |
| Pi stacking | `#8cb366` |
| Halogen bond | `#40ffbf` |
| Metal coordination | `#8c4099` |
| Hydrophobic | `#808080` |

Complexes retain the protein PDB before Moorhen merges the explicit SDF ligand. The detector concatenates the protein's
`not ligand` view and the SDF, preserving bond orders, formal charges and separate model indices. Event-map contacts use
the former 5 Å ligand environment selection. Ordinary contact representations use their saved selection.

The local V3000 parser fills the same molecular stores directly, preserving coordinates, bonds and charges. It supports
concrete molecular atom/bond records, non-sequential atom IDs, continuation lines and multiple V3000 records. Query bond
types and incomplete records fail visibly. This extends the pinned parser, whose SDF support is V2000 only.

`MoorhenViewerAdapter` builds native dashed cylinder meshes grouped by contact type. Native hydrogen-bond templates
accept only lengths from 1.9 to 4 Å, so the adapter builds a 3 Å template and supplies the calculated radius and length
as instance dimensions. This preserves longer ionic and aromatic contacts. Colours and opacity are set before first
presentation. Async readiness, edits and disposal use the existing representation lifecycle.

## Reproduction and licensing

Pinned upstream sources (MIT; notices in `LICENSE`):

- [NGL commit fc81766d4376275ff703f6d8a840dc4990b173dc](https://github.com/nglviewer/ngl/tree/fc81766d4376275ff703f6d8a840dc4990b173dc)
  ([source archive](https://codeload.github.com/nglviewer/ngl/tar.gz/fc81766d4376275ff703f6d8a840dc4990b173dc)).
- [Three.js 0.95.0](https://registry.npmjs.org/three/-/three-0.95.0.tgz), math classes only.
- [JS Signals 1.0.0](https://registry.npmjs.org/signals/-/signals-1.0.0.tgz), model/selection events only.

Extract these outside the repository. With Node 24.18 and esbuild 0.25.12 (available in the existing dependency tree), run:

```text
node scripts/vendor-contact-detector.cjs <ngl-source-root> <three-package-root> <signals-package-root>
```

The generator rejects rendering module imports and records SHA-256 hashes of every input and the output in
`provenance.json`. Class-field compilation deliberately uses assignment semantics to preserve upstream Store prototypes.
The generator replaces Three.js's UUID entropy with Web Crypto `getRandomValues`, retaining its uppercase UUID v4
format. Provenance input hashes describe the original sources; the output hash includes this security patch.
Application builds use the checked-in source and do not download or regenerate it.

## Verification

Reference results were generated independently with the original
[NGL 2.0.0-dev.37 npm bundle](https://registry.npmjs.org/ngl/-/ngl-2.0.0-dev.37.tgz), calling its actual contact representation:

```text
node scripts/contact-detector/generate-reference.cjs <original-package>/dist/ngl.js
```

`fixtures/ngl-reference.json` records the original bundle hash, fixture hashes, and full endpoint/type/colour/radius
records. Fixtures cover all ten categories, protein/SDF complexes, parameter overrides, paired selections and ligand
environments. The real protein fixture comes from the installed, pinned Moorhen tutorial. V3000 is compared with the
equivalent V2000 reference, including an explicit aromatic ligand and a charged nitrogen.

Tests also execute the shipped module in a real worker thread, the installed Moorhen mesh builder, and its native
draw/show/delete lifecycle with delayed calculations and failures. These checks do not establish GPU or visual parity;
the Django-backed viewer still requires manual acceptance with real snapshots and target data.
