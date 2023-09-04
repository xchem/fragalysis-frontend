import { useTheme } from '@material-ui/core';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enableLayout } from '../../reducers/layout/actions';
import { updateLayoutOnDependencyChange } from '../../reducers/layout/dispatchActions';

/**
 * A hook which takes care of providing the layouting capabilities.
 */
export const useUpdateGridLayout = hideProjects => {
  const dispatch = useDispatch();

  const sidesOpen = useSelector(state => state.previewReducers.viewerControls.sidesOpen);

  const panelsExpanded = useSelector(state => state.layoutReducers.panelsExpanded);
  const selectedLayoutName = useSelector(state => state.layoutReducers.selectedLayoutName);

  const theme = useTheme();

  const ref = useRef();
  const [height, setHeight] = useState(800);

  // Updates the available height
  useEffect(() => {
    const node = ref.current;
    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      setHeight(entry.borderBoxSize[0].blockSize);
    });

    resizeObserver.observe(node);

    return () => {
      resizeObserver.unobserve(node);
    };
  }, []);

  // Enables the layout buttons in the header
  useEffect(() => {
    dispatch(enableLayout(true));

    return () => {
      dispatch(enableLayout(false));
    };
  }, [dispatch]);

  // Updates the layout whenever any of the variables in the dependency array updates
  useEffect(() => {
    dispatch(updateLayoutOnDependencyChange(sidesOpen.LHS, sidesOpen.RHS, hideProjects, height, theme.spacing()));
  }, [dispatch, height, hideProjects, sidesOpen, theme, panelsExpanded, selectedLayoutName]);

  return ref;
};
