import { useCallback, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NGL_OBJECTS } from './constants';
import {
  appendArtefactsChainList,
  appendDensityList,
  appendQualityList,
  removeFromArtefactsChainList,
  removeFromDensityList,
  removeFromToBeDisplayedList,
  updateInToBeDisplayedList
} from '../selection/actions';
import {
  generateArtefactChains,
  generateDensityObject,
  generateMoleculeId
} from '../../components/nglView/generatingObjects';
import { VIEWS } from '../../constants/constants';
import { NglContext } from '../../components/nglView/nglProvider';
import { deleteObject, loadObject } from './dispatchActions';
import { getToBeDisplayedStructures, getToBeDisplayedStructuresDensity } from './utils';
import {
  deleteDensityObject,
  getDensityChangedParams,
  getDensityMapData,
  getProteinData,
  removeQuality,
  toggleDensityWireframe
} from '../../components/preview/molecule/redux/dispatchActions';
import { getRandomColor } from '../../components/preview/molecule/utils/color';
import { readQualityInformation } from '../../components/nglView/renderingHelpers';

export const useDisplayArtefactsChainsLHS = () => {
  const dispatch = useDispatch();

  const toBeDisplayedList = useSelector(state => state.selectionReducers.toBeDisplayedList);
  const displayedArtefactsChains = useSelector(state => state.selectionReducers.artefactsChainList);
  const allObservations = useSelector(state => state.apiReducers.all_mol_lists);

  const { getNglView } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

  const displayArtefactsChains = useCallback(
    async artefactsChainsData => {
      const obs = allObservations.find(obs => obs.id === artefactsChainsData.id);
      if (!obs) return;
      const colourToggle = getRandomColor(obs);

      dispatch(appendArtefactsChainList(generateMoleculeId(obs)));
      const artefactsChainsObject = await dispatch(generateArtefactChains(obs, colourToggle));
      const qualityInformation = dispatch(
        readQualityInformation(artefactsChainsObject.name, artefactsChainsObject.sdf_info)
      );

      let hasAdditionalInformation =
        artefactsChainsData.withQuality === true &&
        qualityInformation &&
        qualityInformation.badproteinids &&
        qualityInformation.badproteinids.length !== 0;
      if (hasAdditionalInformation) {
        dispatch(appendQualityList(generateMoleculeId(obs), true));
      }
      return dispatch(
        loadObject({
          target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, artefactsChainsObject),
          stage,
          previousRepresentations: artefactsChainsData.representations,
          orientationMatrix: null,
          loadQuality: hasAdditionalInformation,
          quality: qualityInformation,
          preserveColour: artefactsChainsData.preserveColour
        })
      ).then(() => {
        dispatch(updateInToBeDisplayedList({ id: obs.id, rendered: true, type: NGL_OBJECTS.ARTEFACTS }));
      });
    },
    [allObservations, dispatch, stage]
  );

  const removeArtefactsChains = useCallback(
    async artefactsChainsData => {
      const data = allObservations.find(obs => obs.id === artefactsChainsData.id);
      if (!data) return;
      const colourToggle = getRandomColor(data);
      dispatch(
        deleteObject(
          Object.assign({ display_div: VIEWS.MAJOR_VIEW }, await dispatch(generateArtefactChains(data, colourToggle))),
          stage
        )
      );
      dispatch(removeFromArtefactsChainList(generateMoleculeId(data)));
      dispatch(removeFromToBeDisplayedList({ id: artefactsChainsData.id, type: NGL_OBJECTS.ARTEFACTS }));
    },
    [allObservations, dispatch, stage]
  );

  useEffect(() => {
    const toBedisplayedArtefactsChains = getToBeDisplayedStructures(
      toBeDisplayedList,
      displayedArtefactsChains,
      NGL_OBJECTS.ARTEFACTS
    );
    toBedisplayedArtefactsChains?.forEach(data => {
      displayArtefactsChains(data);
    });
    const toBeRemovedArtefactsChains = getToBeDisplayedStructures(
      toBeDisplayedList,
      displayedArtefactsChains,
      NGL_OBJECTS.ARTEFACTS,
      true
    );
    toBeRemovedArtefactsChains?.forEach(data => {
      removeArtefactsChains(data);
    });
  }, [toBeDisplayedList, displayedArtefactsChains, displayArtefactsChains, dispatch, stage, removeArtefactsChains]);

  return {};
};
