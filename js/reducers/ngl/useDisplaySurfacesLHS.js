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
import { deleteObject, loadObject, setOrientation } from './dispatchActions';
import { base_url } from '../../components/routes/constants';
import { getToBeDisplayedStructures } from './utils';

export const useDisplaySurfaceLHS = () => {
  const dispatch = useDispatch();

  const toBeDisplayedList = useSelector(state => state.selectionReducers.toBeDisplayedList);
  const displayedSurfaces = useSelector(state => state.selectionReducers.surfaceList);
  const allObservations = useSelector(state => state.apiReducers.all_mol_lists);

  const { getNglView } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

  const displaySurface = useCallback(
    surfaceData => {
      const data = allObservations.find(obs => obs.id === surfaceData.id);
      if (!data) return;
      const colourToggle = getRandomColor(data);

      dispatch(appendSurfaceList(generateMoleculeId(data)));
      return dispatch(
        loadObject({
          target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateSurfaceObject(data, colourToggle, base_url)),
          stage,
          previousRepresentations: surfaceData.representations,
          orientationMatrix: null,
          preserveColour: surfaceData.preserveColour
        })
      ).then(() => {
        dispatch(updateInToBeDisplayedList({ id: data.id, rendered: true, type: NGL_OBJECTS.SURFACE }));
      });
    },
    [allObservations, dispatch, stage]
  );

  const removeSurface = useCallback(
    surfaceData => {
      const data = allObservations.find(obs => obs.id === surfaceData.id);
      if (!data) return;
      const colourToggle = getRandomColor(data);

      dispatch(
        deleteObject(
          Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateSurfaceObject(data, colourToggle, base_url)),
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
      displaySurface(data);
    });

    const toBeRemovedSurfaces = getToBeDisplayedStructures(
      toBeDisplayedList,
      displayedSurfaces,
      NGL_OBJECTS.SURFACE,
      true
    );
    toBeRemovedSurfaces?.forEach(data => {
      removeSurface(data);
    });
  }, [toBeDisplayedList, displaySurface, dispatch, stage, removeSurface, displayedSurfaces]);

  return {};
};
