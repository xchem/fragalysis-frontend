import { useStructureOperationQueue } from './useStructureOperationQueue';
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
  removeFromToBeDisplayedListForDataset,
  updateInToBeDisplayedListForDataset
} from '../../components/datasets/redux/actions';
import { generateHitProteinObject, generateMoleculeCompoundId } from '../../components/nglView/generatingObjects';
import { deleteObject, loadObject } from './dispatchActions';
import { base_url } from '../../components/routes/constants';

export const useDisplayProteinRHS = () => {
  const dispatch = useDispatch();
  const runStructureOperation = useStructureOperationQueue();

  const toBeDisplayedList = useSelector(state => state.datasetsReducers.toBeDisplayedList);
  const displayedProteins = useSelector(state => state.datasetsReducers.proteinLists);
  const allCompounds = useSelector(state => state.datasetsReducers.moleculeLists);

  const { getNglView } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

  const displayProtein = useCallback(
    async proteinData => {
      const datasetCompounds = allCompounds[proteinData.datasetID];
      const data = datasetCompounds?.find(obs => obs.id === proteinData.id);
      if (!data) return;
      const colourToggle = getRandomColor(data);
      const datasetID = proteinData.datasetID;
      const moleculeId = generateMoleculeCompoundId(data);
      const target = Object.assign(
        { display_div: VIEWS.MAJOR_VIEW },
        await dispatch(generateHitProteinObject(data, colourToggle, base_url, datasetID))
      );

      dispatch(appendProteinList(datasetID, moleculeId));
      try {
        await dispatch(
          loadObject({
            target,
            stage,
            previousRepresentations: proteinData.representations,
            orientationMatrix: null
          })
        );
        dispatch(
          updateInToBeDisplayedListForDataset(datasetID, { id: data.id, rendered: true, type: NGL_OBJECTS.PROTEIN })
        );
      } catch {
        dispatch(removeFromProteinList(datasetID, moleculeId));
        dispatch(removeFromToBeDisplayedListForDataset(datasetID, { id: data.id, type: NGL_OBJECTS.PROTEIN }));
      }
    },
    [allCompounds, dispatch, stage]
  );

  const removeProtein = useCallback(
    async proteinData => {
      const datasetCompounds = allCompounds[proteinData.datasetID];
      const data = datasetCompounds?.find(obs => obs.id === proteinData.id);
      if (!data) return;
      const datasetID = proteinData.datasetID;
      const colourToggle = getRandomColor(data);

      await dispatch(
        deleteObject(
          Object.assign(
            { display_div: VIEWS.MAJOR_VIEW },
            await dispatch(generateHitProteinObject(data, colourToggle, base_url, datasetID))
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
      runStructureOperation(data, removeProtein);
    });
    const toBeDisplayedProteins = getToBeDisplayedStructuresDataset(
      toBeDisplayedList,
      displayedProteins,
      NGL_OBJECTS.PROTEIN
    );
    toBeDisplayedProteins?.forEach(data => {
      runStructureOperation(data, displayProtein);
    });
  }, [runStructureOperation, toBeDisplayedList, displayedProteins, displayProtein, dispatch, stage, removeProtein]);

  return {};
};
