import { useCallback, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NGL_OBJECTS } from './constants';
import {
  appendFragmentDisplayList,
  appendQualityList,
  removeFromFragmentDisplayList,
  removeFromQualityList,
  removeFromToBeDisplayedList,
  updateInToBeDisplayedList
} from '../selection/actions';
import { generateMoleculeId, generateMoleculeObject } from '../../components/nglView/generatingObjects';
import { VIEWS } from '../../constants/constants';
import { NglContext } from '../../components/nglView/nglProvider';
import { getRandomColor } from '../../components/preview/molecule/utils/color';
import { readQualityInformation } from '../../components/nglView/renderingHelpers';
import { deleteObject, loadObject } from './dispatchActions';
import { removeVector } from '../../components/preview/molecule/redux/dispatchActions';
import { getToBeDisplayedStructures } from './utils';
import { setNglOrientation } from './actions';

export const useDisplayLigandLHS = () => {
  const dispatch = useDispatch();

  const toBeDisplayedList = useSelector(state => state.selectionReducers.toBeDisplayedList);
  const displayedLigands = useSelector(state => state.selectionReducers.fragmentDisplayList);
  const allObservations = useSelector(state => state.apiReducers.all_mol_lists);

  const { getNglView, getViewerAdapter } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;
  const viewerAdapter = getViewerAdapter(VIEWS.MAJOR_VIEW);

  // const isLoadingCurrentSnapshot = useSelector(state => state.projectReducers.isLoadingCurrentSnapshot);

  const displayLigand = useCallback(
    async ligandData => {
      const data = allObservations.find(obs => obs.id === ligandData.id);
      if (!data) return;
      const colourToggle = getRandomColor(data);
      const molId = generateMoleculeId(data);
      dispatch(appendFragmentDisplayList(molId));

      let moleculeObject = await dispatch(generateMoleculeObject(data, colourToggle));
      let qualityInformation = dispatch(readQualityInformation(moleculeObject.name, moleculeObject.sdf_info));

      let hasAdditionalInformation =
        ligandData.withQuality === true &&
        qualityInformation &&
        qualityInformation.badids &&
        qualityInformation.badids.length !== 0;
      if (hasAdditionalInformation) {
        dispatch(appendQualityList(molId));
      }

      return dispatch(
        loadObject({
          target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, moleculeObject),
          stage,
          previousRepresentations: ligandData.representations,
          loadQuality: hasAdditionalInformation,
          quality: qualityInformation,
          center: ligandData.center
        })
      ).then(() => {
        if (ligandData.center) {
          const currentOrientation = viewerAdapter.getOrientation();
          dispatch(setNglOrientation(currentOrientation, VIEWS.MAJOR_VIEW));
        }
        dispatch(updateInToBeDisplayedList({ id: data.id, rendered: true, type: NGL_OBJECTS.LIGAND }));
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allObservations, dispatch, stage, viewerAdapter] //skipOrientationChange and isLoadingCurrentSnapshot are not included in the dependencies by desing
  );

  const removeLigand = useCallback(
    async ligandData => {
      const data = allObservations.find(obs => obs.id === ligandData.id);
      if (!data) return;
      const ligandDataText = await dispatch(generateMoleculeObject(data));
      dispatch(deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, ligandDataText), stage));
      dispatch(removeFromFragmentDisplayList(generateMoleculeId(data)));
      dispatch(removeFromQualityList(generateMoleculeId(data)));
      if (ligandData.withVector === true) {
        // remove vector
        dispatch(removeVector(stage, data));
      }

      dispatch(removeFromToBeDisplayedList({ id: ligandData.id, type: NGL_OBJECTS.LIGAND }));
    },
    [allObservations, dispatch, stage]
  );

  useEffect(() => {
    const toBeRemovedLigands = getToBeDisplayedStructures(
      toBeDisplayedList,
      displayedLigands,
      NGL_OBJECTS.LIGAND,
      true
    );
    toBeRemovedLigands?.forEach(data => {
      removeLigand(data);
    });
    const toBeDisplayedLigands = getToBeDisplayedStructures(toBeDisplayedList, displayedLigands, NGL_OBJECTS.LIGAND);
    toBeDisplayedLigands?.forEach(data => {
      displayLigand(data);
    });
  }, [toBeDisplayedList, displayedLigands, displayLigand, dispatch, stage, removeLigand]);

  return {};
};
