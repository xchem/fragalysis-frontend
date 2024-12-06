import { useCallback, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NGL_OBJECTS } from './constants';
import {
  appendProteinList,
  appendQualityList,
  removeFromProteinList,
  removeFromToBeDisplayedList
} from '../selection/actions';
import { generateHitProteinObject, generateMoleculeId } from '../../components/nglView/generatingObjects';
import { VIEWS } from '../../constants/constants';
import { NglContext } from '../../components/nglView/nglProvider';
import { getRandomColor } from '../../components/preview/molecule/utils/color';
import { readQualityInformation } from '../../components/nglView/renderingHelpers';
import { deleteObject, loadObject, setOrientation } from './dispatchActions';
import { base_url } from '../../components/routes/constants';
import { getToBeDisplayedStructures } from './utils';

export const useDisplayProteinLHS = () => {
  const dispatch = useDispatch();

  const toBeDisplayedList = useSelector(state => state.selectionReducers.toBeDisplayedList);
  const displayedProteins = useSelector(state => state.selectionReducers.proteinList);
  const allObservations = useSelector(state => state.apiReducers.all_mol_lists);

  const { getNglView } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

  const displayProtein = useCallback(
    proteinData => {
      const data = allObservations.find(obs => obs.id === proteinData.id);
      if (!data) return;
      const colourToggle = getRandomColor(data);

      dispatch(appendProteinList(generateMoleculeId(data)));
      const hitProteinObject = generateHitProteinObject(data, colourToggle, base_url);
      const qualityInformation = dispatch(readQualityInformation(hitProteinObject.name, hitProteinObject.sdf_info));

      let hasAdditionalInformation =
        proteinData.withQuality === true &&
        qualityInformation &&
        qualityInformation.badproteinids &&
        qualityInformation.badproteinids.length !== 0;
      if (hasAdditionalInformation) {
        dispatch(appendQualityList(generateMoleculeId(data), true));
      }

      return dispatch(
        loadObject({
          target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, hitProteinObject),
          stage,
          previousRepresentations: proteinData.representations,
          orientationMatrix: null,
          loadQuality: hasAdditionalInformation,
          quality: qualityInformation,
          preserveColour: proteinData.preserveColour
        })
      ).finally(() => {
        const currentOrientation = stage.viewerControls.getOrientation();
        dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
      });
    },
    [allObservations, dispatch, stage]
  );

  const removeProtein = useCallback(
    proteinData => {
      const data = allObservations.find(obs => obs.id === proteinData.id);
      if (!data) return;
      const colourToggle = getRandomColor(data);
      dispatch(
        deleteObject(
          Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateHitProteinObject(data, colourToggle, base_url)),
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
      displayProtein(data);
    });

    const toBeRemovedProteins = getToBeDisplayedStructures(
      toBeDisplayedList,
      displayedProteins,
      NGL_OBJECTS.PROTEIN,
      true
    );
    toBeRemovedProteins?.forEach(data => {
      removeProtein(data);
    });
  }, [toBeDisplayedList, displayProtein, dispatch, stage, removeProtein, displayedProteins]);

  return {};
};
