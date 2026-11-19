import { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { NglContext } from '../nglView/nglProvider';

export const isInitialSceneLoaded = (state, viewId) => {
  const { apiReducers: api, selectionReducers: selection, datasetsReducers: datasets, nglReducers: ngl } = state;
  if (!api.lhsDataIsLoaded || api.lhsDataIsLoading || api.snapshotLoadingInProgress) return false;

  // Before initialization an empty queue does not yet mean an empty scene.
  if (!api.isSnapshot && !selection.areLSHCompoundsInitialized && api.all_mol_lists?.length > 0) return false;
  if (api.isSnapshot && ngl.snapshotNglOrientation?.[viewId]?.elements && !ngl.snapshotOrientationApplied) return false;
  if (ngl.countOfPendingNglObjects?.[viewId] > 0) return false;

  const items = [...(selection.toBeDisplayedList || []), ...Object.values(datasets.toBeDisplayedList || {}).flat()];
  return items.every(item => item.display === false || item.rendered === true);
};

export const useInitialViewerPresentation = (viewId, enabled) => {
  const [presented, setPresented] = useState(false);
  const { getViewerAdapter } = useContext(NglContext);
  const adapter = getViewerAdapter(viewId);
  const sceneLoaded = useSelector(state => !enabled || presented || isInitialSceneLoaded(state, viewId));

  useEffect(() => {
    if (!enabled || presented || !sceneLoaded || !adapter) return undefined;

    let frame;
    let settledFrames = 0;
    const prepare = () => {
      settledFrames = adapter.prepareInitialView() ? settledFrames + 1 : 0;
      // Allow native effects and their canvas paint to finish before revealing.
      if (settledFrames >= 2) setPresented(true);
      else frame = requestAnimationFrame(prepare);
    };
    frame = requestAnimationFrame(prepare);
    return () => cancelAnimationFrame(frame);
  }, [adapter, enabled, presented, sceneLoaded]);

  // This stays true across subsequent loads, snapshot switches and portal moves.
  return !enabled || presented;
};
