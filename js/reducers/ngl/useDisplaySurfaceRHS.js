import { useStructureOperationQueue } from './useStructureOperationQueue';
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
  removeFromToBeDisplayedListForDataset,
  updateInToBeDisplayedListForDataset
} from '../../components/datasets/redux/actions';
import { generateMoleculeCompoundId, generateSurfaceObject } from '../../components/nglView/generatingObjects';
import { deleteObject, loadObject } from './dispatchActions';
import { base_url } from '../../components/routes/constants';

export const useDisplaySurfaceRHS = () => {
  const dispatch = useDispatch();
  const runStructureOperation = useStructureOperationQueue();

  const toBeDisplayedList = useSelector(state => state.datasetsReducers.toBeDisplayedList);
  const displayedSurfaces = useSelector(state => state.datasetsReducers.surfaceLists);
  const allCompounds = useSelector(state => state.datasetsReducers.moleculeLists);

  const { getNglView } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

  const displaySurface = useCallback(
    async surfaceData => {
      const datasetCompounds = allCompounds[surfaceData.datasetID];
      const data = datasetCompounds?.find(obs => obs.id === surfaceData.id);
      if (!data) return;
      const colourToggle = getRandomColor(data);
      const datasetID = surfaceData.datasetID;
      const moleculeId = generateMoleculeCompoundId(data);
      const target = Object.assign(
        { display_div: VIEWS.MAJOR_VIEW },
        await dispatch(generateSurfaceObject(data, colourToggle, base_url, datasetID))
      );

      dispatch(appendSurfaceList(datasetID, moleculeId));
      try {
        await dispatch(
          loadObject({
            target,
            stage,
            previousRepresentations: surfaceData.representations,
            orientationMatrix: null
          })
        );
        dispatch(
          updateInToBeDisplayedListForDataset(datasetID, { id: data.id, rendered: true, type: NGL_OBJECTS.SURFACE })
        );
      } catch {
        dispatch(removeFromSurfaceList(datasetID, moleculeId));
        dispatch(removeFromToBeDisplayedListForDataset(datasetID, { id: data.id, type: NGL_OBJECTS.SURFACE }));
      }
    },
    [allCompounds, dispatch, stage]
  );

  const removeSurface = useCallback(
    async surfaceData => {
      const datasetCompounds = allCompounds[surfaceData.datasetID];
      const data = datasetCompounds?.find(obs => obs.id === surfaceData.id);
      if (!data) return;
      const datasetID = surfaceData.datasetID;
      const colourToggle = getRandomColor(data);

      await dispatch(
        deleteObject(
          Object.assign(
            { display_div: VIEWS.MAJOR_VIEW },
            await dispatch(generateSurfaceObject(data, colourToggle, base_url, datasetID))
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
      runStructureOperation(data, removeSurface);
    });
    const toBeDisplayedSurfaces = getToBeDisplayedStructuresDataset(
      toBeDisplayedList,
      displayedSurfaces,
      NGL_OBJECTS.SURFACE
    );
    toBeDisplayedSurfaces?.forEach(data => {
      runStructureOperation(data, displaySurface);
    });
  }, [runStructureOperation, toBeDisplayedList, displayedSurfaces, displaySurface, dispatch, stage, removeSurface]);

  return {};
};
