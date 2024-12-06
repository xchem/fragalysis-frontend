import { useCallback, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NglContext } from '../../components/nglView/nglProvider';
import { VIEWS } from '../../constants/constants';
import { NGL_OBJECTS } from './constants';
import { getToBeDisplayedStructuresDataset } from './utils';
import { getRandomColor } from '../../components/preview/molecule/utils/color';
import {
  appendSurfaceList,
  removeFromSurfaceList,
  removeFromToBeDisplayedListForDataset
} from '../../components/datasets/redux/actions';
import { generateMoleculeCompoundId, generateSurfaceObject } from '../../components/nglView/generatingObjects';
import { deleteObject, loadObject, setOrientation } from './dispatchActions';
import { base_url } from '../../components/routes/constants';

export const useDisplaySurfaceRHS = () => {
  const dispatch = useDispatch();

  const toBeDisplayedList = useSelector(state => state.datasetsReducers.toBeDisplayedList);
  const displayedSurfaces = useSelector(state => state.datasetsReducers.surfaceLists);
  const allCompounds = useSelector(state => state.datasetsReducers.moleculeLists);

  const { getNglView } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

  const displaySurface = useCallback(
    surfaceData => {
      const datasetCompounds = allCompounds[surfaceData.datasetID];
      const data = datasetCompounds?.find(obs => obs.id === surfaceData.id);
      if (!data) return;
      const colourToggle = getRandomColor(data);
      const datasetID = surfaceData.datasetID;

      dispatch(appendSurfaceList(datasetID, generateMoleculeCompoundId(data)));
      return dispatch(
        loadObject({
          target: Object.assign(
            { display_div: VIEWS.MAJOR_VIEW },
            generateSurfaceObject(data, colourToggle, base_url, datasetID)
          ),
          stage,
          previousRepresentations: surfaceData.representations,
          orientationMatrix: null
        })
      ).finally(() => {
        const currentOrientation = stage.viewerControls.getOrientation();
        dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
      });
    },
    [allCompounds, dispatch, stage]
  );

  const removeSurface = useCallback(
    surfaceData => {
      const datasetCompounds = allCompounds[surfaceData.datasetID];
      const data = datasetCompounds?.find(obs => obs.id === surfaceData.id);
      if (!data) return;
      const datasetID = surfaceData.datasetID;
      const colourToggle = getRandomColor(data);

      dispatch(
        deleteObject(
          Object.assign(
            { display_div: VIEWS.MAJOR_VIEW },
            generateSurfaceObject(data, colourToggle, base_url, datasetID)
          ),
          stage
        )
      );
      dispatch(removeFromSurfaceList(datasetID, generateMoleculeCompoundId(data)));

      dispatch(removeFromToBeDisplayedListForDataset(datasetID, { id: surfaceData.id, type: NGL_OBJECTS.SURFACE }));
    },
    [allCompounds, dispatch, stage]
  );

  useEffect(() => {
    const toBeRemovedSurfaces = getToBeDisplayedStructuresDataset(
      toBeDisplayedList,
      displayedSurfaces,
      NGL_OBJECTS.SURFACE,
      true
    );
    toBeRemovedSurfaces?.forEach(data => {
      removeSurface(data);
    });
    const toBeDisplayedSurfaces = getToBeDisplayedStructuresDataset(
      toBeDisplayedList,
      displayedSurfaces,
      NGL_OBJECTS.SURFACE
    );
    toBeDisplayedSurfaces?.forEach(data => {
      displaySurface(data);
    });
  }, [toBeDisplayedList, displayedSurfaces, displaySurface, dispatch, stage, removeSurface]);

  return {};
};
