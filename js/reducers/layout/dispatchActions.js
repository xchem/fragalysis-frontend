import { setCurrentLayout, setDefaultLayout } from './actions';
import { layouts } from './layouts';

export const updateLayoutOnDependencyChange = (showLHS, showRHS, hideProjects, height, margin) => (
  dispatch,
  getState
) => {
  const { layoutLocked, panelsExpanded, selectedLayoutName } = getState().layoutReducers;

  const defaultLayout = layouts[selectedLayoutName](
    showLHS,
    showRHS,
    hideProjects,
    height,
    margin,
    layoutLocked,
    panelsExpanded
  );

  dispatch(setDefaultLayout(defaultLayout));
  dispatch(setCurrentLayout(defaultLayout));
};
