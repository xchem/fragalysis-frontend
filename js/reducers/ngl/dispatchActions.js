import {
  decrementCountOfPendingNglObjects,
  decrementCountOfRemainingMoleculeGroups,
  deleteNglObject,
  incrementCountOfPendingNglObjects,
  loadNglObject,
  setNglStateFromCurrentSnapshot,
  setMoleculeOrientations,
  setNglOrientation,
  setNglViewParams,
  setBackgroundColor,
  setNglClipNearAction,
  setNglClipFarAction,
  setNglClipDistAction,
  setNglFogNearAction,
  setNglFogFarAction,
  setIsoLevelAction,
  setBoxSizeAction,
  setOpacityAction,
  setContourAction,
  setWarningIconAction,
  setNglOrientationByInteraction,
  setColorAction,
  setIsNGLQueueEmpty
} from './actions';
import { isEmpty, isEqual } from 'lodash';
import { generateMoleculeObject } from '../../components/nglView/generatingObjects';
import { COMMON_PARAMS, DENSITY_MAPS, OBJECT_TYPE, SELECTION_TYPE } from '../../components/nglView/constants';
import {
  removeFromComplexList,
  removeFromFragmentDisplayList,
  removeFromVectorOnList,
  removeFromProteinList,
  removeFromSurfaceList,
  removeFromDensityList,
  removeFromDensityListType,
  removeFromArtefactsChainList
} from '../selection/actions';
import { VIEWS } from '../../constants/constants';
import { NGL_PARAMS } from '../../components/nglView/constants/index';
import { getRandomColor } from '../../components/preview/molecule/utils/color';
import { asViewerAdapter } from '../../viewer';

export const loadObject = ({
  target,
  stage,
  previousRepresentations,
  orientationMatrix,
  markAsRightSideLigand,
  loadQuality,
  quality,
  preserveColour = false,
  center
}) => async (dispatch, getState) => {
  console.log('loadObject - entry');
  dispatch(setIsNGLQueueEmpty(false));
  const viewerAdapter = asViewerAdapter(stage);
  if (viewerAdapter) {
    const state = getState();
    const actionRestoring = false; //state.trackingReducers.isActionRestoring;
    dispatch(incrementCountOfPendingNglObjects(target.display_div));

    const versionFixedTarget = JSON.parse(JSON.stringify(target));
    if (target && target.OBJECT_TYPE === undefined && target.name && target.name.includes('_PROTEIN')) {
      versionFixedTarget.OBJECT_TYPE = OBJECT_TYPE.HIT_PROTEIN;
    }

    // at first check if object was already used and has stashed state
    const tempObjectsInViewStash = state.nglReducers.objectsInViewStash || {};
    if (tempObjectsInViewStash.hasOwnProperty(versionFixedTarget.name) && actionRestoring) {
      // get stashed object representations to be loaded next
      const stashedObjects = tempObjectsInViewStash[versionFixedTarget.name];
      previousRepresentations = stashedObjects.representations;
    }

    // override previous representations colour with original colour
    if (preserveColour === true && previousRepresentations) {
      previousRepresentations.forEach(representation => {
        representation.params.colorValue = versionFixedTarget.colour;
      });
    }

    console.count(`Switch - Before object is loaded`);
    // versionFixedTarget can cause "Error: TypeError: path is null" in stage.loadFile
    return viewerAdapter
      .loadObject({
        target: versionFixedTarget,
        input_dict: versionFixedTarget,
        object_name: versionFixedTarget.name,
        representations: previousRepresentations,
        orientationMatrix,
        markAsRightSideLigand,
        loadQuality,
        quality,
        dispatch,
        state,
        center
      })
      .then(representations => {
        console.count(`Object loaded`);
        if (representations && representations.length > 0) {
          if (versionFixedTarget.OBJECT_TYPE === OBJECT_TYPE.DENSITY) {
            representations.forEach(repr => {
              if (typeof repr === 'object') {
                let newTarget = Object.assign({
                  ...versionFixedTarget,
                  name: repr.name,
                  defaultName: versionFixedTarget.name
                });
                dispatch(loadNglObject(newTarget, repr.repr));
              }
            });
          } else {
            dispatch(loadNglObject(versionFixedTarget, representations));
          }
        }
      })
      .catch(error => {
        console.error(error);
      })
      .finally(() => dispatch(decrementCountOfPendingNglObjects(versionFixedTarget.display_div)));
  }
  return Promise.reject('Instance of NGL View is missing');
};

export const deleteObject = (target, stage, deleteFromSelections) => dispatch => {
  const viewerAdapter = asViewerAdapter(stage);
  if (viewerAdapter && target) {
    viewerAdapter.getObjects(target.name).forEach(component => viewerAdapter.removeObject(component));

    if (deleteFromSelections === true && target && target.selectionType && target.moleculeId) {
      const objectId = { id: target.moleculeId };
      switch (target.selectionType) {
        case SELECTION_TYPE.LIGAND:
          dispatch(removeFromFragmentDisplayList(objectId));
          break;
        case SELECTION_TYPE.HIT_PROTEIN:
          dispatch(removeFromProteinList(objectId));
          break;
        case SELECTION_TYPE.COMPLEX:
          dispatch(removeFromComplexList(objectId));
          break;
        case SELECTION_TYPE.SURFACE:
          dispatch(removeFromSurfaceList(objectId));
          break;
        case SELECTION_TYPE.DENSITY:
          dispatch(removeFromDensityList(objectId));
          break;
        case SELECTION_TYPE.VECTOR:
          dispatch(removeFromVectorOnList(objectId));
          break;
        case SELECTION_TYPE.ARTEFACTS:
          dispatch(removeFromArtefactsChainList(objectId));
          break;
      }
    }

    dispatch(deleteNglObject(target));
  }
};

export const checkRemoveFromDensityList = (target, objectsInView) => () => {
  let name = target.defaultName;
  let targetName = target.name;

  let targetNameDiff = name + DENSITY_MAPS.DIFF;
  let targetNameSigma = name + DENSITY_MAPS.SIGMAA;

  let existOtherMap =
    (targetName !== targetNameDiff && objectsInView[targetNameDiff] !== undefined) ||
    (targetName !== targetNameSigma && objectsInView[targetNameSigma] !== undefined) ||
    (targetName !== name && objectsInView[name] !== undefined);

  let canRemove = !existOtherMap;
  return canRemove;
};

export const setOrientation = (div_id, orientation) => (dispatch, getState) => {
  const nglOrientations = getState().nglReducers.nglOrientations;

  if (
    orientation &&
    ((nglOrientations && nglOrientations[div_id] && !isEqual(orientation.elements, nglOrientations[div_id].elements)) ||
      isEmpty(nglOrientations) ||
      (nglOrientations && nglOrientations[div_id] === undefined))
  ) {
    dispatch(setNglOrientation(orientation, div_id));
  }
};

export const setOrientationByInteraction = (div_id, orientation) => (dispatch, getState) => {
  const nglOrientations = getState().nglReducers.nglOrientations;

  if (
    orientation &&
    ((nglOrientations && nglOrientations[div_id] && !isEqual(orientation.elements, nglOrientations[div_id].elements)) ||
      isEmpty(nglOrientations) ||
      (nglOrientations && nglOrientations[div_id] === undefined))
  ) {
    dispatch(setNglOrientationByInteraction(orientation, nglOrientations[div_id], div_id));
  }
};

export const centerOnLigandByMoleculeID = (stage, moleculeID, datasetId = null) => async (dispatch, getState) => {
  const viewerAdapter = asViewerAdapter(stage);
  if (moleculeID && viewerAdapter) {
    const state = getState();
    let observation = null;
    if (!datasetId) {
      const all_mol_lists = state.apiReducers.all_mol_lists;
      observation = all_mol_lists.find(mol => mol.id === moleculeID);
    } else {
      const datasetCompounds = state.datasetsReducers.moleculeLists[datasetId] || [];
      observation = datasetCompounds.find(mol => mol.id === moleculeID);
    }
    if (observation) {
      const colourToggle = getRandomColor(observation);
      let obsObject = null;
      if (!datasetId) {
        obsObject = await dispatch(generateMoleculeObject(observation, colourToggle));
      } else {
        obsObject = await dispatch(generateMoleculeObject(observation, colourToggle, datasetId));
      }
      const component = viewerAdapter.getObject(obsObject.name);
      if (component) {
        viewerAdapter.centerOn(component);
      }
      const currentOrientation = viewerAdapter.getOrientation();
      dispatch(setNglOrientation(currentOrientation, VIEWS.MAJOR_VIEW));
      return Boolean(component);
    }
  }

  return false;
};

export const centerOnLigandsByMoleculeIDs = (stage, moleculeIDs) => async (dispatch, getState) => {
  const viewerAdapter = asViewerAdapter(stage);
  if (!viewerAdapter) {
    return false;
  }

  const state = getState();
  const displayedLigandIds = new Set(state.selectionReducers.fragmentDisplayList || []);
  const requestedIds = [...new Set(moleculeIDs || [])].filter(id => displayedLigandIds.has(id));
  const objectsInView = Object.entries(state.nglReducers.objectsInView || {});
  const components = requestedIds
    .map(id => {
      const entry = objectsInView.find(
        ([, object]) => object.moleculeId === id && object.OBJECT_TYPE === OBJECT_TYPE.LIGAND
      );
      return entry ? viewerAdapter.getObject(entry[1].name || entry[0]) : null;
    })
    .filter(Boolean);

  if (!components.length || viewerAdapter.centerOnObjects(components) === false) {
    return false;
  }

  dispatch(setNglOrientation(viewerAdapter.getOrientation(), VIEWS.MAJOR_VIEW));
  return true;
};

export const setNglBckGrndColor = (color, major) => (dispatch, getState) => {
  dispatch(setNglViewParams(NGL_PARAMS.backgroundColor, color, asViewerAdapter(major), VIEWS.MAJOR_VIEW));
  dispatch(setBackgroundColor(color));
};

export const setNglClipNear = (newValue, oldValue, major) => (dispatch, getState) => {
  dispatch(setNglViewParams(NGL_PARAMS.clipNear, newValue, asViewerAdapter(major), VIEWS.MAJOR_VIEW));
  dispatch(setNglClipNearAction(newValue, oldValue));
};

export const setNglClipFar = (newValue, oldValue, major) => (dispatch, getState) => {
  dispatch(setNglViewParams(NGL_PARAMS.clipFar, newValue, asViewerAdapter(major), VIEWS.MAJOR_VIEW));
  dispatch(setNglClipFarAction(newValue, oldValue));
};

export const setNglClipDist = (newValue, oldValue, major) => (dispatch, getState) => {
  dispatch(setNglViewParams(NGL_PARAMS.clipDist, newValue, asViewerAdapter(major), VIEWS.MAJOR_VIEW));
  dispatch(setNglClipDistAction(newValue, oldValue));
};

export const setNglFogNear = (newValue, oldValue, major) => (dispatch, getState) => {
  dispatch(setNglViewParams(NGL_PARAMS.fogNear, newValue, asViewerAdapter(major), VIEWS.MAJOR_VIEW));
  dispatch(setNglFogNearAction(newValue, oldValue));
};

export const setNglFogFar = (newValue, oldValue, major) => (dispatch, getState) => {
  dispatch(setNglViewParams(NGL_PARAMS.fogFar, newValue, asViewerAdapter(major), VIEWS.MAJOR_VIEW));
  dispatch(setNglFogFarAction(newValue, oldValue));
};

export const setIsoLevel = (mapType, newValue, oldValue, major) => (dispatch, getState) => {
  dispatch(updateDensityMapByType(mapType, major, 'isolevel', newValue));
  dispatch(setNglViewParams(NGL_PARAMS[`isolevel${mapType}`], newValue, asViewerAdapter(major), VIEWS.MAJOR_VIEW));
  dispatch(setIsoLevelAction(mapType, newValue, oldValue));
};

export const setBoxSize = (mapType, newValue, oldValue, major) => (dispatch, getState) => {
  dispatch(updateDensityMapByType(mapType, major, 'boxSize', newValue));
  dispatch(setNglViewParams(NGL_PARAMS[`boxSize${mapType}`], newValue, asViewerAdapter(major), VIEWS.MAJOR_VIEW));
  dispatch(setBoxSizeAction(mapType, newValue, oldValue));
};

export const setOpacity = (mapType, newValue, oldValue, major) => (dispatch, getState) => {
  dispatch(updateDensityMapByType(mapType, major, 'opacity', newValue));
  dispatch(setNglViewParams(NGL_PARAMS[`opacity${mapType}`], newValue, asViewerAdapter(major), VIEWS.MAJOR_VIEW));
  dispatch(setOpacityAction(mapType, newValue, oldValue));
};

export const setContour = (mapType, newValue, oldValue, major) => (dispatch, getState) => {
  dispatch(updateDensityMapByType(mapType, major, 'contour', newValue));
  dispatch(setNglViewParams(NGL_PARAMS[`contour${mapType}`], newValue, asViewerAdapter(major), VIEWS.MAJOR_VIEW));
  dispatch(setContourAction(mapType, newValue, oldValue));
};

export const setElectronDesityMapColor = (mapType, newValue, oldValue, major) => (dispatch, getState) => {
  dispatch(updateDensityMapByType(mapType, major, 'color', newValue));
  dispatch(setNglViewParams(NGL_PARAMS[`color${mapType}`], newValue, asViewerAdapter(major), VIEWS.MAJOR_VIEW));
  dispatch(setColorAction(mapType, newValue, oldValue));
};

export const setWarningIcon = (newValue, oldValue, skipTracking) => (dispatch, getState) => {
  dispatch(setNglViewParams(COMMON_PARAMS.warningIcon, newValue));
  dispatch(setWarningIconAction(newValue, oldValue, skipTracking));
};

const updateDensityMapByType = (type, stage, key, newValue) => (dispatch, getState) => {
  const viewerAdapter = asViewerAdapter(stage);
  if (viewerAdapter) {
    const filteredComponents = viewerAdapter.getObjectsByNameSuffix(type);
    const representations = viewerAdapter.getRepresentationsByType(filteredComponents, 'surface');
    representations.forEach(representation =>
      viewerAdapter.setRepresentationParameters(representation, { [key]: newValue })
    );
  }
};

export const isDensityMapVisible = (type, stage) => {
  let result = false;
  const viewerAdapter = asViewerAdapter(stage);
  if (viewerAdapter) {
    const filteredComps = viewerAdapter.getObjectsByNameSuffix(type);
    if (filteredComps && filteredComps.length > 0) {
      const reprList = viewerAdapter.getRepresentationsByType(filteredComps, 'surface');
      if (reprList && reprList.length > 0) {
        result = true;
      }
    }
  }
  return result;
};

export const restoreNglOrientation = (orientation, oldOrientation, div_id, stages) => (dispatch, getState) => {
  const state = getState();
  const skipOrientation = false; //state.trackingReducers.skipOrientationChange;

  if (!skipOrientation) {
    const view = stages.find(view => view.id === div_id);
    console.count(`Before restoring orientation - restoreNglOrientation`);
    asViewerAdapter(view.stage).setOrientation(orientation);
    console.count(`After restoring orientation - restoreNglOrientation`);
    dispatch(setNglOrientationByInteraction(orientation, oldOrientation, div_id));
  }
};
