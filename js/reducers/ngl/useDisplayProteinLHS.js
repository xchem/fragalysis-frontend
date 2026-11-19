import { useStructureOperationQueue } from './useStructureOperationQueue';
import { useCallback, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NGL_OBJECTS } from './constants';
import {
  appendProteinList,
  appendQualityList,
  removeFromProteinList,
  removeFromQualityList,
  removeFromToBeDisplayedList,
  updateInToBeDisplayedList
} from '../selection/actions';
import { generateHitProteinObject, generateMoleculeId } from '../../components/nglView/generatingObjects';
import { VIEWS } from '../../constants/constants';
import { NglContext } from '../../components/nglView/nglProvider';
import { getRandomColor } from '../../components/preview/molecule/utils/color';
import { readQualityInformation } from '../../viewer/qualityInformation';
import { deleteObject, loadObject } from './dispatchActions';
import { base_url } from '../../components/routes/constants';
import { getToBeDisplayedStructures } from './utils';

export const useDisplayProteinLHS = () => {
  const dispatch = useDispatch();
  const runStructureOperation = useStructureOperationQueue();

  const toBeDisplayedList = useSelector(state => state.selectionReducers.toBeDisplayedList);
  const displayedProteins = useSelector(state => state.selectionReducers.proteinList);
  const allObservations = useSelector(state => state.apiReducers.all_mol_lists);

  const { getNglView } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

  const displayProtein = useCallback(
    async proteinData => {
      const data = allObservations.find(obs => obs.id === proteinData.id);
      if (!data) return;
      const colourToggle = getRandomColor(data);

      const molId = generateMoleculeId(data);
      const hitProteinObject = await dispatch(generateHitProteinObject(data, colourToggle, base_url));
      const qualityInformation = dispatch(readQualityInformation(hitProteinObject.name, hitProteinObject.sdf_info));

      let hasAdditionalInformation =
        proteinData.withQuality === true &&
        qualityInformation &&
        qualityInformation.badproteinids &&
        qualityInformation.badproteinids.length !== 0;
      dispatch(appendProteinList(molId));
      if (hasAdditionalInformation) {
        dispatch(appendQualityList(molId, true));
      }

      try {
        await dispatch(
          loadObject({
            target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, hitProteinObject),
            stage,
            previousRepresentations: proteinData.representations,
            orientationMatrix: null,
            loadQuality: hasAdditionalInformation,
            quality: qualityInformation,
            preserveColour: proteinData.preserveColour
          })
        );
        dispatch(updateInToBeDisplayedList({ id: data.id, rendered: true, type: NGL_OBJECTS.PROTEIN }));
      } catch (error) {
        console.error(`Unable to display protein for observation ${data.id}`, error);
        dispatch(removeFromProteinList(molId));
        dispatch(removeFromQualityList(molId));
        dispatch(removeFromToBeDisplayedList({ id: data.id, type: NGL_OBJECTS.PROTEIN }));
      }
    },
    [allObservations, dispatch, stage]
  );

  const removeProtein = useCallback(
    async proteinData => {
      const data = allObservations.find(obs => obs.id === proteinData.id);
      if (!data) return;
      const colourToggle = getRandomColor(data);
      await dispatch(
        deleteObject(
          Object.assign(
            { display_div: VIEWS.MAJOR_VIEW },
            await dispatch(generateHitProteinObject(data, colourToggle, base_url))
          ),
          stage
        )
      );
      dispatch(removeFromProteinList(generateMoleculeId(data)));
      dispatch(removeFromToBeDisplayedList({ id: proteinData.id, type: NGL_OBJECTS.PROTEIN }));
    },
    [allObservations, dispatch, stage]
  );

  useEffect(() => {
    const toBeDisplayedProteins = getToBeDisplayedStructures(toBeDisplayedList, displayedProteins, NGL_OBJECTS.PROTEIN);
    toBeDisplayedProteins?.forEach(data => {
      runStructureOperation(data, displayProtein);
    });

    const toBeRemovedProteins = getToBeDisplayedStructures(
      toBeDisplayedList,
      displayedProteins,
      NGL_OBJECTS.PROTEIN,
      true
    );
    toBeRemovedProteins?.forEach(data => {
      runStructureOperation(data, removeProtein);
    });
  }, [runStructureOperation, toBeDisplayedList, displayProtein, dispatch, stage, removeProtein, displayedProteins]);

  return {};
};
