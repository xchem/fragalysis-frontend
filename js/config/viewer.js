// Select the application viewer here before building: 'ngl' or 'moorhen'.
export const VIEWER_ENGINE = 'ngl';

// Keep bulk LHS downloads and rendering bounded, yielding between completed loads.
// Runtime scheduling only; this limit is not stored in snapshots.
export const LHS_BULK_LIGAND_CONCURRENCY = 4;

// true: NGL contact detection and per-type colours, rendered by Moorhen.
// false: Moorhen/Coot's native hydrogen bonds and purple dashed rendering.
// Initial value for Preferences > NGL style interactions; not saved in snapshots.
export const USE_NGL_STYLE_INTERACTIONS = false;

export const viewerConfig = Object.freeze({
  viewerEngine: VIEWER_ENGINE,
  selectionSource: 'fixed'
});
