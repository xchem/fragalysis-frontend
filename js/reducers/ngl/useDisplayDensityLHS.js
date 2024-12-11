import { useCallback, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NGL_OBJECTS } from './constants';
import {
  appendDensityList,
  appendDensityListCustom,
  appendToBeDisplayedList,
  appendToDensityListType,
  removeFromDensityList,
  removeFromDensityListCustom,
  removeFromDensityListType,
  removeFromToBeDisplayedList
} from '../selection/actions';
import { generateDensityObject, generateMoleculeId } from '../../components/nglView/generatingObjects';
import { VIEWS } from '../../constants/constants';
import { NglContext } from '../../components/nglView/nglProvider';
import { getRandomColor } from '../../components/preview/molecule/utils/color';
import { loadObject, setOrientation } from './dispatchActions';
import { base_url } from '../../components/routes/constants';
import { getToBeDisplayedStructures } from './utils';
import {
  addQuality,
  deleteDensityObject,
  getDensityChangedParams,
  getDensityMapData,
  getProteinData,
  removeQuality,
  toggleDensityWireframe
} from '../../components/preview/molecule/redux/dispatchActions';

export const useDisplayDensityLHS = () => {
  const dispatch = useDispatch();

  const toBeDisplayedList = useSelector(state => state.selectionReducers.toBeDisplayedList);
  const displayedDensities = useSelector(state => state.selectionReducers.densityList);
  const displayedCustomDensities = useSelector(state => state.selectionReducers.densityListCustom);
  const allObservations = useSelector(state => state.apiReducers.all_mol_lists);

  const { getNglView } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

  const displayDensity = useCallback(
    async densityData => {
      const data = allObservations.find(obs => obs.id === densityData.id);
      if (!data) return;
      const colourToggle = getRandomColor(data);

      if (!data.proteinData) {
        await dispatch(getDensityMapData(data));
      }

      data.proteinData = densityData.densityData;

      const prepParams = dispatch(getDensityChangedParams(densityData.isWireframeStyle));
      const densityObject = generateDensityObject(data, colourToggle, base_url, densityData.isWireframeStyle);
      const combinedObject = { ...prepParams, ...densityObject };
      dispatch(
        loadObject({
          target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, combinedObject),
          stage,
          previousRepresentations: densityData.representations,
          orientationMatrix: null
        })
      ).finally(() => {
        const currentOrientation = stage.viewerControls.getOrientation();
        dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
        let molDataId = generateMoleculeId(data);
        if (!data.proteinData) {
          dispatch(getProteinData(data)).then(i => {
            const proteinData = i;
            data.proteinData = proteinData;

            molDataId['render_event'] = data.proteinData.render_event;
            molDataId['render_sigmaa'] = data.proteinData.render_sigmaa;
            molDataId['render_diff'] = data.proteinData.render_diff;
            molDataId['render_quality'] = data.proteinData.render_quality;

            dispatch(appendDensityList(generateMoleculeId(data)));
            dispatch(appendToDensityListType(molDataId));
            if (data.proteinData.render_quality) {
              return dispatch(addQuality(stage, data, colourToggle, true));
            }
          });
        } else {
          molDataId['render_event'] = data.proteinData.render_event;
          molDataId['render_sigmaa'] = data.proteinData.render_sigmaa;
          molDataId['render_diff'] = data.proteinData.render_diff;
          molDataId['render_quality'] = data.proteinData.render_quality;

          dispatch(appendDensityList(generateMoleculeId(data)));
          dispatch(appendToDensityListType(molDataId));
          if (data.proteinData.render_quality) {
            return dispatch(addQuality(stage, data, colourToggle, true));
          }
        }
      });
    },
    [allObservations, dispatch, stage]
  );

  const displayCustomDensity = useCallback(
    async densityData => {
      const data = allObservations.find(obs => obs.id === densityData.id);
      if (!data) return;
      const colourToggle = getRandomColor(data);

      if (!data.proteinData) {
        await dispatch(getDensityMapData(data));
      }

      data.proteinData = densityData.densityData;

      let densityObject = dispatch(getDensityChangedParams());
      densityObject = dispatch(toggleDensityWireframe(densityData.isWireframeStyle, densityObject));
      const oldDensityData = dispatch(deleteDensityObject(data, colourToggle, stage, !densityData.isWireframeStyle));
      densityObject = { ...densityObject, ...oldDensityData };
      const molId = generateMoleculeId(data);
      dispatch(removeFromDensityList(molId, true));
      //here we need to remove density but we don't know if it is custom or not so we remove both
      dispatch(removeFromToBeDisplayedList({ id: densityData.id, type: NGL_OBJECTS.DENSITY }));
      dispatch(removeFromToBeDisplayedList({ id: densityData.id, type: NGL_OBJECTS.DENSITY_CUSTOM }));
      //and then re-add it as custom
      dispatch(appendDensityListCustom(generateMoleculeId(data)));
      dispatch(
        appendToBeDisplayedList({
          ...densityData
        })
      );
      // dispatch(removeFromDensityListType(molId, true));

      return dispatch(
        loadObject({
          target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, densityObject),
          stage,
          previousRepresentations: densityData.representations,
          orientationMatrix: null
        })
      ).finally(() => {
        const currentOrientation = stage.viewerControls.getOrientation();
        dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
      });
    },
    [allObservations, dispatch, stage]
  );

  const removeDensity = useCallback(
    densityData => {
      const data = allObservations.find(obs => obs.id === densityData.id);
      const colourToggle = getRandomColor(data);

      dispatch(toggleDensityWireframe(densityData.isWireframeStyle));
      dispatch(deleteDensityObject(data, colourToggle, stage, densityData.isWireframeStyle));

      const molId = generateMoleculeId(data);
      dispatch(removeFromDensityList(molId));
      dispatch(removeFromDensityListCustom(molId, true));
      dispatch(removeFromDensityListType(molId));
      if (data.proteinData.render_quality) {
        dispatch(removeQuality(stage, data, colourToggle, true));
      }

      dispatch(removeFromToBeDisplayedList({ id: densityData.id, type: NGL_OBJECTS.DENSITY }));
      dispatch(removeFromToBeDisplayedList({ id: densityData.id, type: NGL_OBJECTS.DENSITY_CUSTOM }));
    },
    [allObservations, dispatch, stage]
  );

  useEffect(() => {
    const toBeDisplayedDensities = getToBeDisplayedStructures(
      toBeDisplayedList,
      displayedDensities,
      NGL_OBJECTS.DENSITY
    );
    toBeDisplayedDensities?.forEach(data => {
      displayDensity(data);
    });

    const toBeDisplayedCustomDensities = getToBeDisplayedStructures(
      toBeDisplayedList,
      displayedCustomDensities,
      NGL_OBJECTS.DENSITY_CUSTOM
    );
    toBeDisplayedCustomDensities?.forEach(data => {
      displayCustomDensity(data);
    });

    const toBeRemovedDensities = getToBeDisplayedStructures(
      toBeDisplayedList,
      displayedDensities,
      NGL_OBJECTS.DENSITY,
      true
    );
    toBeRemovedDensities?.forEach(data => {
      removeDensity(data);
    });

    const toBeRemovedCustomDensities = getToBeDisplayedStructures(
      toBeDisplayedList,
      displayedCustomDensities,
      NGL_OBJECTS.DENSITY_CUSTOM,
      true
    );
    toBeRemovedCustomDensities?.forEach(data => {
      removeDensity(data);
    });
  }, [
    toBeDisplayedList,
    displayDensity,
    dispatch,
    stage,
    removeDensity,
    displayedDensities,
    displayedCustomDensities,
    displayCustomDensity
  ]);

  return {};
};
