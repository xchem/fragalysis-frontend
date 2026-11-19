import { useStructureOperationQueue } from './useStructureOperationQueue';
import { useCallback, useContext, useEffect } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { isEqual } from 'lodash';
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
  const store = useStore();
  const runStructureOperation = useStructureOperationQueue();

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
      try {
        await dispatch(
          loadObject({
            target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, combinedObject),
            stage,
            previousRepresentations: densityData.representations,
            orientationMatrix: null
          })
        );
        if (!obs.proteinData) {
          obs.proteinData = await dispatch(getProteinData(obs));
          dispatch(appendDensityList(densitySettingsObject));
        } else {
          dispatch(appendDensityList(densitySettingsObject));
        }
        dispatch((dispatch, getState) => {
          const intent = getState().selectionReducers.toBeDisplayedList.find(
            item => item.id === obs.id && item.type === NGL_OBJECTS.DENSITY
          );
          if (isEqual(intent?.densityObject, densitySettingsObject)) {
            dispatch(updateInToBeDisplayedList({ id: obs.id, rendered: true, type: NGL_OBJECTS.DENSITY }));
          }
        });
      } catch {
        dispatch(removeFromToBeDisplayedList({ id: obs.id, type: NGL_OBJECTS.DENSITY }));
        dispatch(removeFromToBeDisplayedList({ id: obs.id, type: NGL_OBJECTS.DENSITY_CUSTOM }));
      }
    },
    [allObservations, dispatch, stage]
  );

  const removeDensity = useCallback(
    async (densityData, preserveDisplayIntent = false) => {
      const data = allObservations.find(obs => obs.id === densityData.id);
      const densitySettingsObject = densityData.densityObject;

      const colourToggle = densitySettingsObject.color;

      dispatch(toggleDensityWireframe(densitySettingsObject.isWireframeStyle));
      await dispatch(deleteDensityObject(data, stage, densitySettingsObject));

      dispatch(removeFromDensityList(densitySettingsObject));
      if (data.proteinData.render_quality) {
        dispatch(removeQuality(stage, data, colourToggle, true));
      }

      if (!preserveDisplayIntent) {
        dispatch(removeFromToBeDisplayedList({ id: densityData.id, type: NGL_OBJECTS.DENSITY }));
        dispatch(removeFromToBeDisplayedList({ id: densityData.id, type: NGL_OBJECTS.DENSITY_CUSTOM }));
      }
    },
    [allObservations, dispatch, stage]
  );

  const updateDensity = useCallback(
    async densityData => {
      // Settings can change during fetching, rendering or deletion. Keep the
      // latest intent in Redux and reconcile it under the same per-item claim.
      while (true) {
        const selection = store.getState().selectionReducers;
        const intent = selection.toBeDisplayedList.find(
          item => item.id === densityData.id && item.type === NGL_OBJECTS.DENSITY
        );
        if (!intent?.display) return;
        const displayed = selection.densityList.find(item => item.id === densityData.id);
        if (displayed) {
          if (isEqual(displayed, intent.densityObject)) return;
          await removeDensity({ ...intent, densityObject: displayed }, true);
        } else {
          await displayDensity(intent);
          // Missing observations/settings and failed loads must not spin here.
          if (!store.getState().selectionReducers.densityList.some(item => item.id === densityData.id)) return;
        }
      }
    },
    [displayDensity, removeDensity, store]
  );

  useEffect(() => {
    const toBeDisplayedDensities = toBeDisplayedList.filter(
      data =>
        data.type === NGL_OBJECTS.DENSITY &&
        data.display &&
        !isEqual(
          displayedDensities.find(item => item.id === data.id),
          data.densityObject
        )
    );
    toBeDisplayedDensities?.forEach(data => {
      runStructureOperation(data, updateDensity);
    });

    const toBeRemovedDensities = getToBeDisplayedStructuresDensity(
      toBeDisplayedList,
      displayedDensities,
      NGL_OBJECTS.DENSITY,
      true
    );
    toBeRemovedDensities?.forEach(data => {
      runStructureOperation(data, removeDensity);
    });
  }, [runStructureOperation, toBeDisplayedList, updateDensity, stage, removeDensity, displayedDensities]);

  return {};
};
