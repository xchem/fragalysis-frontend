import { useCallback, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NGL_OBJECTS } from './constants';
import { appendComplexList, removeFromComplexList, removeFromToBeDisplayedList } from '../selection/actions';
import { generateComplexObject, generateMoleculeId } from '../../components/nglView/generatingObjects';
import { VIEWS } from '../../constants/constants';
import { NglContext } from '../../components/nglView/nglProvider';
import { getRandomColor } from '../../components/preview/molecule/utils/color';
import { deleteObject, loadObject, setOrientation } from './dispatchActions';
import { base_url } from '../../components/routes/constants';
import { getToBeDisplayedStructures } from './utils';

export const useDisplayComplexLHS = () => {
  const dispatch = useDispatch();

  const toBeDisplayedList = useSelector(state => state.selectionReducers.toBeDisplayedList);
  const displayedComplexes = useSelector(state => state.selectionReducers.complexList);
  const allObservations = useSelector(state => state.apiReducers.all_mol_lists);

  const { getNglView } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

  const displayComplex = useCallback(
    complexData => {
      const data = allObservations.find(obs => obs.id === complexData.id);
      if (!data) return;
      const colourToggle = getRandomColor(data);

      dispatch(appendComplexList(generateMoleculeId(data)));
      return dispatch(
        loadObject({
          target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateComplexObject(data, colourToggle, base_url)),
          stage,
          previousRepresentations: complexData.representations,
          orientationMatrix: null,
          preserveColour: complexData.preserveColour
        })
      ).finally(() => {
        const currentOrientation = stage.viewerControls.getOrientation();
        dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
      });
    },
    [allObservations, dispatch, stage]
  );

  const removeComplex = useCallback(
    complexData => {
      const data = allObservations.find(obs => obs.id === complexData.id);
      if (!data) return;
      const colourToggle = getRandomColor(data);

      dispatch(
        deleteObject(
          Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateComplexObject(data, colourToggle, base_url)),
          stage
        )
      );
      dispatch(removeFromComplexList(generateMoleculeId(data)));

      dispatch(removeFromToBeDisplayedList({ id: complexData.id, type: NGL_OBJECTS.COMPLEX }));
    },
    [allObservations, dispatch, stage]
  );

  useEffect(() => {
    const toBeDisplayedComplexes = getToBeDisplayedStructures(
      toBeDisplayedList,
      displayedComplexes,
      NGL_OBJECTS.COMPLEX
    );
    toBeDisplayedComplexes?.forEach(data => {
      displayComplex(data);
    });

    const toBeRemovedComplexes = getToBeDisplayedStructures(
      toBeDisplayedList,
      displayedComplexes,
      NGL_OBJECTS.COMPLEX,
      true
    );
    toBeRemovedComplexes?.forEach(data => {
      removeComplex(data);
    });
  }, [toBeDisplayedList, displayComplex, dispatch, stage, removeComplex, displayedComplexes]);

  return {};
};
