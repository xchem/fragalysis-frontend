import { useStructureOperationQueue } from './useStructureOperationQueue';
import { useCallback, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NGL_OBJECTS } from './constants';
import {
  appendArtefactsChainList,
  appendQualityList,
  removeFromArtefactsChainList,
  removeFromQualityList,
  removeFromToBeDisplayedList,
  updateInToBeDisplayedList
} from '../selection/actions';
import { generateArtefactChains, generateMoleculeId } from '../../components/nglView/generatingObjects';
import { VIEWS } from '../../constants/constants';
import { NglContext } from '../../components/nglView/nglProvider';
import { getRandomColor } from '../../components/preview/molecule/utils/color';
import { readQualityInformation } from '../../viewer/qualityInformation';
import { deleteObject, loadObject } from './dispatchActions';
import { getToBeDisplayedStructures } from './utils';

export const useDisplayArtefactChainsLHS = () => {
  const dispatch = useDispatch();
  const runStructureOperation = useStructureOperationQueue();

  const toBeDisplayedList = useSelector(state => state.selectionReducers.toBeDisplayedList);
  const displayedArtefactChains = useSelector(state => state.selectionReducers.artefactsChainList);
  const allObservations = useSelector(state => state.apiReducers.all_mol_lists);

  const { getNglView } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

  const displayArtefactChains = useCallback(
    async artefactChainData => {
      const data = allObservations.find(obs => obs.id === artefactChainData.id);
      if (!data) return;
      const colourToggle = getRandomColor(data);

      const molId = generateMoleculeId(data);
      const artefactChainObject = await dispatch(generateArtefactChains(data, colourToggle));
      const qualityInformation = dispatch(
        readQualityInformation(artefactChainObject.name, artefactChainObject.sdf_info)
      );

      let hasAdditionalInformation =
        artefactChainData.withQuality === true &&
        qualityInformation &&
        qualityInformation.badproteinids &&
        qualityInformation.badproteinids.length !== 0;
      dispatch(appendArtefactsChainList(molId));
      if (hasAdditionalInformation) {
        dispatch(appendQualityList(molId, true));
      }

      try {
        await dispatch(
          loadObject({
            target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, artefactChainObject),
            stage,
            previousRepresentations: artefactChainData.representations,
            orientationMatrix: null,
            loadQuality: hasAdditionalInformation,
            quality: qualityInformation,
            preserveColour: artefactChainData.preserveColour
          })
        );
        dispatch(updateInToBeDisplayedList({ id: data.id, rendered: true, type: NGL_OBJECTS.ARTEFACTS }));
      } catch (error) {
        console.error(`Unable to display artefact chain for observation ${data.id}`, error);
        dispatch(removeFromArtefactsChainList(molId));
        dispatch(removeFromQualityList(molId));
        dispatch(removeFromToBeDisplayedList({ id: data.id, type: NGL_OBJECTS.ARTEFACTS }));
      }
    },
    [allObservations, dispatch, stage]
  );

  const removeArtefactChains = useCallback(
    async artefactChainData => {
      const data = allObservations.find(obs => obs.id === artefactChainData.id);
      if (!data) return;
      const colourToggle = getRandomColor(data);
      await dispatch(
        deleteObject(
          Object.assign({ display_div: VIEWS.MAJOR_VIEW }, await dispatch(generateArtefactChains(data, colourToggle))),
          stage
        )
      );
      dispatch(removeFromArtefactsChainList(generateMoleculeId(data)));
      dispatch(removeFromToBeDisplayedList({ id: artefactChainData.id, type: NGL_OBJECTS.ARTEFACTS }));
    },
    [allObservations, dispatch, stage]
  );

  useEffect(() => {
    const toBeDisplayedArtefactChains = getToBeDisplayedStructures(
      toBeDisplayedList,
      displayedArtefactChains,
      NGL_OBJECTS.ARTEFACTS
    );
    toBeDisplayedArtefactChains?.forEach(data => {
      runStructureOperation(data, displayArtefactChains);
    });

    const toBeRemovedArtefactChains = getToBeDisplayedStructures(
      toBeDisplayedList,
      displayedArtefactChains,
      NGL_OBJECTS.ARTEFACTS,
      true
    );
    toBeRemovedArtefactChains?.forEach(data => {
      runStructureOperation(data, removeArtefactChains);
    });
  }, [runStructureOperation, toBeDisplayedList, displayedArtefactChains, displayArtefactChains, dispatch, stage, removeArtefactChains]);

  return {};
};
