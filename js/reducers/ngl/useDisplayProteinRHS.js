import { useCallback, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NglContext } from '../../components/nglView/nglProvider';
import { VIEWS } from '../../constants/constants';
import { NGL_OBJECTS } from './constants';
import { getToBeDisplayedStructuresDataset } from './utils';
import { getRandomColor } from '../../components/preview/molecule/utils/color';
import {
  appendProteinList,
  removeFromProteinList,
  removeFromToBeDisplayedListForDataset
} from '../../components/datasets/redux/actions';
import { generateHitProteinObject, generateMoleculeCompoundId } from '../../components/nglView/generatingObjects';
import { deleteObject, loadObject, setOrientation } from './dispatchActions';
import { base_url } from '../../components/routes/constants';

export const useDisplayProteinRHS = () => {
  const dispatch = useDispatch();

  const toBeDisplayedList = useSelector(state => state.datasetsReducers.toBeDisplayedList);
  const displayedProteins = useSelector(state => state.datasetsReducers.proteinLists);
  const allCompounds = useSelector(state => state.datasetsReducers.moleculeLists);

  const { getNglView } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

  const displayProtein = useCallback(
    proteinData => {
      const datasetCompounds = allCompounds[proteinData.datasetID];
      const data = datasetCompounds?.find(obs => obs.id === proteinData.id);
      if (!data) return;
      const colourToggle = getRandomColor(data);
      const datasetID = proteinData.datasetID;

      dispatch(appendProteinList(datasetID, generateMoleculeCompoundId(data)));
      return dispatch(
        loadObject({
          target: Object.assign(
            { display_div: VIEWS.MAJOR_VIEW },
            generateHitProteinObject(data, colourToggle, base_url, datasetID)
          ),
          stage,
          previousRepresentations: proteinData.representations,
          orientationMatrix: null
        })
      ).finally(() => {
        const currentOrientation = stage.viewerControls.getOrientation();
        dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
      });
    },
    [allCompounds, dispatch, stage]
  );

  const removeProtein = useCallback(
    proteinData => {
      const datasetCompounds = allCompounds[proteinData.datasetID];
      const data = datasetCompounds?.find(obs => obs.id === proteinData.id);
      if (!data) return;
      const datasetID = proteinData.datasetID;
      const colourToggle = getRandomColor(data);

      dispatch(
        deleteObject(
          Object.assign(
            { display_div: VIEWS.MAJOR_VIEW },
            generateHitProteinObject(data, colourToggle, base_url, datasetID)
          ),
          stage
        )
      );
      dispatch(removeFromProteinList(datasetID, generateMoleculeCompoundId(data)));

      dispatch(removeFromToBeDisplayedListForDataset(datasetID, { id: proteinData.id, type: NGL_OBJECTS.PROTEIN }));
    },
    [allCompounds, dispatch, stage]
  );

  useEffect(() => {
    const toBeRemovedProteins = getToBeDisplayedStructuresDataset(
      toBeDisplayedList,
      displayedProteins,
      NGL_OBJECTS.PROTEIN,
      true
    );
    toBeRemovedProteins?.forEach(data => {
      removeProtein(data);
    });
    const toBeDisplayedProteins = getToBeDisplayedStructuresDataset(
      toBeDisplayedList,
      displayedProteins,
      NGL_OBJECTS.PROTEIN
    );
    toBeDisplayedProteins?.forEach(data => {
      displayProtein(data);
    });
  }, [toBeDisplayedList, displayedProteins, displayProtein, dispatch, stage, removeProtein]);

  return {};
};
