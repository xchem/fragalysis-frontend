import ViewerAdapter from './ViewerAdapter';
import NglViewerAdapter from './NglViewerAdapter';
import { viewerEngine, VIEWER_ENGINES } from '../config/viewerEngine';

export const asViewerAdapter = viewer => {
  if (!viewer) {
    return undefined;
  }
  if (viewer instanceof ViewerAdapter) {
    return viewer;
  }
  if (viewerEngine === VIEWER_ENGINES.NGL) {
    return NglViewerAdapter.forStage(viewer);
  }
  throw new Error(`No viewer adapter is enabled for ${viewerEngine}`);
};

export const createViewerAdapter = containerId => {
  if (viewerEngine === VIEWER_ENGINES.NGL) {
    return NglViewerAdapter.create(containerId);
  }
  throw new Error(`No viewer adapter is enabled for ${viewerEngine}`);
};
