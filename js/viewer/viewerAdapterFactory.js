import ViewerAdapter from './ViewerAdapter';

export const asViewerAdapter = viewer => {
  if (!viewer) {
    return undefined;
  }
  if (viewer instanceof ViewerAdapter) {
    return viewer;
  }
  if (viewer.viewerAdapter instanceof ViewerAdapter) {
    return viewer.viewerAdapter;
  }
  throw new Error('The viewer is not registered through a viewer adapter');
};
