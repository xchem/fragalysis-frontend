export const VIEWER_ENGINE = 'moorhen';

// true: NGL contact detection and per-type colours, rendered by Moorhen.
// false: Moorhen/Coot's native hydrogen bonds and purple dashed rendering.
// Rebuild/reload after changing this; the setting is not saved in snapshots.
export const USE_NGL_STYLE_INTERACTIONS = false;

export const viewerConfig = Object.freeze({
  viewerEngine: VIEWER_ENGINE,
  selectionSource: 'fixed'
});
