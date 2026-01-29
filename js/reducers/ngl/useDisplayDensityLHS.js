import { useCallback, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NGL_OBJECTS } from './constants';
import {
  appendDensityList,
  removeFromDensityList,
  removeFromToBeDisplayedList,
  updateInToBeDisplayedList
} from '../selection/actions';
import { generateDensityObject } from '../../components/nglView/generatingObjects';
import { VIEWS } from '../../constants/constants';
import { NglContext } from '../../components/nglView/nglProvider';
import { loadObject } from './dispatchActions';
import { getToBeDisplayedStructuresDensity } from './utils';
import {
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
  const allObservations = useSelector(state => state.apiReducers.all_mol_lists);

  const { getNglView } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

  const displayDensity = useCallback(
    async densityData => {
      const obs = allObservations.find(obs => obs.id === densityData.id);
      const densitySettingsObject = densityData.densityObject;
      if (!obs) return;
      if (!densitySettingsObject) return;

      if (!obs.proteinData) {
        await dispatch(getDensityMapData(obs));
      }

      obs.proteinData = densityData.densityData;

      const prepParams = dispatch(getDensityChangedParams(densitySettingsObject));
      const densityObject = await dispatch(generateDensityObject(obs, densitySettingsObject));
      const combinedObject = { ...prepParams, ...densityObject };
      dispatch(
        loadObject({
          target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, combinedObject),
          stage,
          previousRepresentations: densityData.representations,
          orientationMatrix: null
        })
      ).then(() => {
        if (!obs.proteinData) {
          dispatch(getProteinData(obs)).then(i => {
            const proteinData = i;
            obs.proteinData = proteinData;

            dispatch(appendDensityList(densitySettingsObject));
          });
        } else {
          dispatch(appendDensityList(densitySettingsObject));
        }
        dispatch(updateInToBeDisplayedList({ id: obs.id, rendered: true, type: NGL_OBJECTS.DENSITY }));
      });
    },
    [allObservations, dispatch, stage]
  );

  const removeDensity = useCallback(
    densityData => {
      const data = allObservations.find(obs => obs.id === densityData.id);
      const densitySettingsObject = densityData.densityObject;

      const colourToggle = densitySettingsObject.color;

      dispatch(toggleDensityWireframe(densitySettingsObject.isWireframeStyle));
      dispatch(deleteDensityObject(data, stage, densitySettingsObject));

      dispatch(removeFromDensityList(densitySettingsObject));
      if (data.proteinData.render_quality) {
        dispatch(removeQuality(stage, data, colourToggle, true));
      }

      dispatch(removeFromToBeDisplayedList({ id: densityData.id, type: NGL_OBJECTS.DENSITY }));
      dispatch(removeFromToBeDisplayedList({ id: densityData.id, type: NGL_OBJECTS.DENSITY_CUSTOM }));
    },
    [allObservations, dispatch, stage]
  );

  useEffect(() => {
    const toBeDisplayedDensities = getToBeDisplayedStructuresDensity(
      toBeDisplayedList,
      displayedDensities,
      NGL_OBJECTS.DENSITY
    );
    toBeDisplayedDensities?.forEach(data => {
      displayDensity(data);
    });

    const toBeRemovedDensities = getToBeDisplayedStructuresDensity(
      toBeDisplayedList,
      displayedDensities,
      NGL_OBJECTS.DENSITY,
      true
    );
    toBeRemovedDensities?.forEach(data => {
      removeDensity(data);
    });
  }, [toBeDisplayedList, displayDensity, dispatch, stage, removeDensity, displayedDensities]);

  return {};
};
