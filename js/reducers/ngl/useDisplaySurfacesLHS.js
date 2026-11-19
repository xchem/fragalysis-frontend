import { useStructureOperationQueue } from './useStructureOperationQueue';
import { useCallback, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NGL_OBJECTS } from './constants';
import {
  appendSurfaceList,
  removeFromSurfaceList,
  removeFromToBeDisplayedList,
  updateInToBeDisplayedList
} from '../selection/actions';
import { generateMoleculeId, generateSurfaceObject } from '../../components/nglView/generatingObjects';
import { VIEWS } from '../../constants/constants';
import { NglContext } from '../../components/nglView/nglProvider';
import { getRandomColor } from '../../components/preview/molecule/utils/color';
import { deleteObject, loadObject } from './dispatchActions';
import { base_url } from '../../components/routes/constants';
import { getToBeDisplayedStructures } from './utils';

export const useDisplaySurfaceLHS = () => {
  const dispatch = useDispatch();
  const runStructureOperation = useStructureOperationQueue();

  const toBeDisplayedList = useSelector(state => state.selectionReducers.toBeDisplayedList);
  const displayedSurfaces = useSelector(state => state.selectionReducers.surfaceList);
  const allObservations = useSelector(state => state.apiReducers.all_mol_lists);

  const { getNglView } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

  const displaySurface = useCallback(
    async surfaceData => {
      const data = allObservations.find(obs => obs.id === surfaceData.id);
      if (!data) return;
      const colourToggle = getRandomColor(data);
      const moleculeId = generateMoleculeId(data);
      const target = Object.assign(
        { display_div: VIEWS.MAJOR_VIEW },
        await dispatch(generateSurfaceObject(data, colourToggle, base_url))
      );

      dispatch(appendSurfaceList(moleculeId));
      try {
        await dispatch(
          loadObject({
            target,
            stage,
            previousRepresentations: surfaceData.representations,
            orientationMatrix: null,
            preserveColour: surfaceData.preserveColour
          })
        );
        dispatch(updateInToBeDisplayedList({ id: data.id, rendered: true, type: NGL_OBJECTS.SURFACE }));
      } catch {
        dispatch(removeFromSurfaceList(moleculeId));
        dispatch(removeFromToBeDisplayedList({ id: data.id, type: NGL_OBJECTS.SURFACE }));
      }
    },
    [allObservations, dispatch, stage]
  );

  const removeSurface = useCallback(
    async surfaceData => {
      const data = allObservations.find(obs => obs.id === surfaceData.id);
      if (!data) return;
      const colourToggle = getRandomColor(data);

      await dispatch(
        deleteObject(
          Object.assign(
            { display_div: VIEWS.MAJOR_VIEW },
            await dispatch(generateSurfaceObject(data, colourToggle, base_url))
          ),
          stage
        )
      );
      dispatch(removeFromSurfaceList(generateMoleculeId(data)));

      dispatch(removeFromToBeDisplayedList({ id: surfaceData.id, type: NGL_OBJECTS.SURFACE }));
    },
    [allObservations, dispatch, stage]
  );

  useEffect(() => {
    const toBeDisplayedSurfaces = getToBeDisplayedStructures(toBeDisplayedList, displayedSurfaces, NGL_OBJECTS.SURFACE);
    toBeDisplayedSurfaces?.forEach(data => {
      runStructureOperation(data, displaySurface);
    });

    const toBeRemovedSurfaces = getToBeDisplayedStructures(
      toBeDisplayedList,
      displayedSurfaces,
      NGL_OBJECTS.SURFACE,
      true
    );
    toBeRemovedSurfaces?.forEach(data => {
      runStructureOperation(data, removeSurface);
    });
  }, [runStructureOperation, toBeDisplayedList, displaySurface, dispatch, stage, removeSurface, displayedSurfaces]);

  return {};
};
