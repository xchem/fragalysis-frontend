export const VIEWER_ENGINE = 'moorhen';

// true: NGL contact detection and per-type colours, rendered by Moorhen.
// false: Moorhen/Coot's native hydrogen bonds and purple dashed rendering.
// Initial value for Preferences > NGL style interactions; not saved in snapshots.
export const USE_NGL_STYLE_INTERACTIONS = false;

export const viewerConfig = Object.freeze({
  viewerEngine: VIEWER_ENGINE,
  selectionSource: 'fixed'
});
