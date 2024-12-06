import { useCallback, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NGL_OBJECTS } from './constants';
import {
  appendFragmentDisplayList,
  appendQualityList,
  removeFromFragmentDisplayList,
  removeFromQualityList,
  removeFromToBeDisplayedList
} from '../selection/actions';
import { generateMoleculeId, generateMoleculeObject } from '../../components/nglView/generatingObjects';
import { VIEWS } from '../../constants/constants';
import { NglContext } from '../../components/nglView/nglProvider';
import { getRandomColor } from '../../components/preview/molecule/utils/color';
import { readQualityInformation } from '../../components/nglView/renderingHelpers';
import { deleteObject, loadObject, setOrientation } from './dispatchActions';
import { appendMoleculeOrientation, setNglViewFromSnapshotRendered } from './actions';
import { removeVector } from '../../components/preview/molecule/redux/dispatchActions';
import { getToBeDisplayedStructures } from './utils';

export const useDisplayLigandLHS = () => {
  const dispatch = useDispatch();

  const toBeDisplayedList = useSelector(state => state.selectionReducers.toBeDisplayedList);
  const displayedLigands = useSelector(state => state.selectionReducers.fragmentDisplayList);
  const allObservations = useSelector(state => state.apiReducers.all_mol_lists);
  const skipOrientationChange = useSelector(state => state.nglReducers.skipOrientationChange);

  const { getNglView } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

  // const isLoadingCurrentSnapshot = useSelector(state => state.projectReducers.isLoadingCurrentSnapshot);

  const displayLigand = useCallback(
    ligandData => {
      const data = allObservations.find(obs => obs.id === ligandData.id);
      if (!data) return;
      const colourToggle = getRandomColor(data);
      const currentOrientation = stage.viewerControls.getOrientation();

      dispatch(appendFragmentDisplayList(generateMoleculeId(data)));

      let moleculeObject = generateMoleculeObject(data, colourToggle);
      let qualityInformation = dispatch(readQualityInformation(moleculeObject.name, moleculeObject.sdf_info));

      let hasAdditionalInformation =
        ligandData.withQuality === true &&
        qualityInformation &&
        qualityInformation.badids &&
        qualityInformation.badids.length !== 0;
      if (hasAdditionalInformation) {
        dispatch(appendQualityList(generateMoleculeId(data)));
      }

      return dispatch(
        loadObject({
          target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, moleculeObject),
          stage,
          previousRepresentations: ligandData.representations,
          loadQuality: hasAdditionalInformation,
          quality: qualityInformation
        })
      ).then(() => {
        const skipOrientation = skipOrientationChange;
        if (!skipOrientation /* || isLoadingCurrentSnapshot*/) {
          const ligandOrientation = stage.viewerControls.getOrientation();
          dispatch(setOrientation(VIEWS.MAJOR_VIEW, ligandOrientation));

          dispatch(appendMoleculeOrientation(data?.id, ligandOrientation));
          if (!ligandData.center) {
            // keep current orientation of NGL View
            console.count(`Before applying orientation matrix after loading ligand.`);
            stage.viewerControls.orient(currentOrientation);
            console.count(`After applying orientation matrix after loading ligand.`);
          }
        }
        // dispatch(setNglViewFromSnapshotRendered(false));
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allObservations, dispatch, stage] //skipOrientationChange and isLoadingCurrentSnapshot are not included in the dependencies by desing
  );

  const removeLigand = useCallback(
    ligandData => {
      const data = allObservations.find(obs => obs.id === ligandData.id);
      if (!data) return;
      dispatch(deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMoleculeObject(data)), stage));
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
