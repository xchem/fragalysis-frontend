import { useCallback, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NglContext } from '../../components/nglView/nglProvider';
import { VIEWS } from '../../constants/constants';
import { NGL_OBJECTS } from './constants';
import { getToBeDisplayedStructuresDataset } from './utils';
import { getRandomColor } from '../../components/preview/molecule/utils/color';
import {
  appendComplexList,
  removeFromComplexList,
  removeFromToBeDisplayedListForDataset,
  updateInToBeDisplayedListForDataset
} from '../../components/datasets/redux/actions';
import { generateComplexObject, generateMoleculeCompoundId } from '../../components/nglView/generatingObjects';
import { deleteObject, loadObject, setOrientation } from './dispatchActions';
import { base_url } from '../../components/routes/constants';

export const useDisplayComplexRHS = () => {
  const dispatch = useDispatch();

  const toBeDisplayedList = useSelector(state => state.datasetsReducers.toBeDisplayedList);
  const displayedComplexes = useSelector(state => state.datasetsReducers.complexLists);
  const allCompounds = useSelector(state => state.datasetsReducers.moleculeLists);

  const { getNglView } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

  const displayComplex = useCallback(
    complexData => {
      const datasetCompounds = allCompounds[complexData.datasetID];
      const data = datasetCompounds?.find(obs => obs.id === complexData.id);
      if (!data) return;
      const colourToggle = getRandomColor(data);
      const datasetID = complexData.datasetID;

      dispatch(appendComplexList(datasetID, generateMoleculeCompoundId(data)));
      return dispatch(
        loadObject({
          target: Object.assign(
            { display_div: VIEWS.MAJOR_VIEW },
            generateComplexObject(data, colourToggle, base_url, datasetID)
          ),
          stage,
          previousRepresentations: complexData.representations,
          orientationMatrix: null
        })
      ).then(() => {
        dispatch(
          updateInToBeDisplayedListForDataset(datasetID, { id: data.id, rendered: true, type: NGL_OBJECTS.COMPLEX })
        );
      });
    },
    [allCompounds, dispatch, stage]
  );

  const removeComplex = useCallback(
    complexData => {
      const datasetCompounds = allCompounds[complexData.datasetID];
      const data = datasetCompounds?.find(obs => obs.id === complexData.id);
      if (!data) return;
      const datasetID = complexData.datasetID;
      const colourToggle = getRandomColor(data);

      dispatch(
        deleteObject(
          Object.assign(
            { display_div: VIEWS.MAJOR_VIEW },
            generateComplexObject(data, colourToggle, base_url, datasetID)
          ),
          stage
        )
      );
      dispatch(removeFromComplexList(datasetID, generateMoleculeCompoundId(data)));

      dispatch(removeFromToBeDisplayedListForDataset(datasetID, { id: complexData.id, type: NGL_OBJECTS.COMPLEX }));
    },
    [allCompounds, dispatch, stage]
  );

  useEffect(() => {
    const toBeRemovedComplexes = getToBeDisplayedStructuresDataset(
      toBeDisplayedList,
      displayedComplexes,
      NGL_OBJECTS.COMPLEX,
      true
    );
    toBeRemovedComplexes?.forEach(data => {
      removeComplex(data);
    });
    const toBeDisplayedComplexes = getToBeDisplayedStructuresDataset(
      toBeDisplayedList,
      displayedComplexes,
      NGL_OBJECTS.COMPLEX
    );
    toBeDisplayedComplexes?.forEach(data => {
      displayComplex(data);
    });
  }, [toBeDisplayedList, displayedComplexes, displayComplex, dispatch, stage, removeComplex]);

  return {};
};
