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
  setWarningIconAction
} from './actions';
import { isEmpty, isEqual } from 'lodash';
import { createRepresentationsArray } from '../../components/nglView/generatingObjects';
import { COMMON_PARAMS, DENSITY_MAPS, OBJECT_TYPE, SELECTION_TYPE } from '../../components/nglView/constants';
import {
  removeFromComplexList,
  removeFromFragmentDisplayList,
  removeFromVectorOnList,
  removeFromProteinList,
  removeFromSurfaceList,
  removeFromDensityList,
  removeFromDensityListCustom
} from '../selection/actions';
import { nglObjectDictionary } from '../../components/nglView/renderingObjects';
import { createInitialSnapshot } from '../../components/snapshot/redux/dispatchActions';
import { VIEWS } from '../../constants/constants';
import { NGL_PARAMS } from '../../components/nglView/constants/index';

export const loadObject = ({
  target,
  stage,
  previousRepresentations,
  orientationMatrix,
  markAsRightSideLigand,
  loadQuality,
  quality
}) => dispatch => {
  if (stage) {
    dispatch(incrementCountOfPendingNglObjects(target.display_div));

    const versionFixedTarget = JSON.parse(JSON.stringify(target));
    if (target && target.OBJECT_TYPE === undefined && target.name && target.name.includes('_PROTEIN')) {
      versionFixedTarget.OBJECT_TYPE = OBJECT_TYPE.HIT_PROTEIN;
    }

    return nglObjectDictionary[versionFixedTarget.OBJECT_TYPE]({
      stage,
      input_dict: versionFixedTarget,
      object_name: versionFixedTarget.name,
      representations: previousRepresentations,
      orientationMatrix,
      markAsRightSideLigand,
      loadQuality,
      quality,
      dispatch
    })
      .then(representations => {
        if (representations && representations.length > 0) {
          if (versionFixedTarget.OBJECT_TYPE === OBJECT_TYPE.DENSITY) {
            representations.forEach(repr => {
              let newTarget = Object.assign({
                ...versionFixedTarget,
                name: repr.name,
                defaultName: versionFixedTarget.name
              });
              dispatch(loadNglObject(newTarget, repr.repr));
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
  const comps = stage.getComponentsByName(target.name);
  comps.list.forEach(component => stage.removeComponent(component));

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
        dispatch(removeFromDensityListCustom(objectId, true));
        break;
      case SELECTION_TYPE.VECTOR:
        dispatch(removeFromVectorOnList(objectId));
        break;
    }
  }

  dispatch(deleteNglObject(target));
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

export const decrementCountOfRemainingMoleculeGroupsWithSavingDefaultState = (projectId, summaryView) => (
  dispatch,
  getState
) => {
  const state = getState();
  const decrementedCount = state.nglReducers.countOfRemainingMoleculeGroups - 1;
  // decide to create INIT snapshot
  if (decrementedCount === 0 && state.nglReducers.proteinsHasLoaded === true) {
    dispatch(createInitialSnapshot(projectId, summaryView));
  }
  dispatch(decrementCountOfRemainingMoleculeGroups(decrementedCount));
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

export const centerOnLigandByMoleculeID = (stage, moleculeID) => (dispatch, getState) => {
  if (moleculeID && stage) {
    const state = getState();
    const storedOrientation = state.nglReducers.moleculeOrientations[moleculeID];
    stage.viewerControls.orient(storedOrientation);
  }
};

/**
 *
 * @param stage - instance of NGL view
 * @param display_div - id of NGL View div
 * @param snapshot - snapshot data of NGL View
 */
export const reloadNglViewFromSnapshot = (stage, display_div, snapshot) => (dispatch, getState) => {
  dispatch(setNglStateFromCurrentSnapshot(snapshot));

  // Remove all components in NGL View
  stage.removeAllComponents();

  // Reconstruction of state in NGL View from currentScene data
  // objectsInView
  Promise.all(
    Object.keys(snapshot.objectsInView || {}).map(objInView => {
      if (snapshot.objectsInView[objInView].display_div === display_div) {
        let representations = snapshot.objectsInView[objInView].representations;
        return dispatch(
          loadObject({
            target: snapshot.objectsInView[objInView],
            stage,
            previousRepresentations: createRepresentationsArray(representations)
          })
        );
      } else {
        return Promise.resolve();
      }
    })
  ).finally(() => {
    if (display_div !== VIEWS.SUMMARY_VIEW) {
      // loop over nglViewParams
      Object.keys(snapshot.viewParams).forEach(param => {
        dispatch(setNglViewParams(param, snapshot.viewParams[param], stage, VIEWS.MAJOR_VIEW));
      });

      // nglOrientations
      const newOrientation = snapshot.nglOrientations[display_div];
      if (newOrientation) {
        stage.viewerControls.orient(newOrientation.elements);
      }

      // set molecule orientations
      if (snapshot.moleculeOrientations) {
        dispatch(setMoleculeOrientations(snapshot.moleculeOrientations));
      }
    }
  });
};

export const setNglBckGrndColor = (color, major, summary) => (dispatch, getState) => {
  dispatch(setNglViewParams(NGL_PARAMS.backgroundColor, color, major, VIEWS.MAJOR_VIEW));
  dispatch(setNglViewParams(NGL_PARAMS.backgroundColor, color, summary, VIEWS.SUMMARY_VIEW));
  dispatch(setBackgroundColor(color));
};

export const setNglClipNear = (newValue, oldValue, major) => (dispatch, getState) => {
  dispatch(setNglViewParams(NGL_PARAMS.clipNear, newValue, major, VIEWS.MAJOR_VIEW));
  dispatch(setNglClipNearAction(newValue, oldValue));
};

export const setNglClipFar = (newValue, oldValue, major) => (dispatch, getState) => {
  dispatch(setNglViewParams(NGL_PARAMS.clipFar, newValue, major, VIEWS.MAJOR_VIEW));
  dispatch(setNglClipFarAction(newValue, oldValue));
};

export const setNglClipDist = (newValue, oldValue, major) => (dispatch, getState) => {
  dispatch(setNglViewParams(NGL_PARAMS.clipDist, newValue, major, VIEWS.MAJOR_VIEW));
  dispatch(setNglClipDistAction(newValue, oldValue));
};

export const setNglFogNear = (newValue, oldValue, major) => (dispatch, getState) => {
  dispatch(setNglViewParams(NGL_PARAMS.fogNear, newValue, major, VIEWS.MAJOR_VIEW));
  dispatch(setNglFogNearAction(newValue, oldValue));
};

export const setNglFogFar = (newValue, oldValue, major) => (dispatch, getState) => {
  dispatch(setNglViewParams(NGL_PARAMS.fogFar, newValue, major, VIEWS.MAJOR_VIEW));
  dispatch(setNglFogFarAction(newValue, oldValue));
};

export const setIsoLevel = (newValue, oldValue, major) => (dispatch, getState) => {
  dispatch(updateRepresentationsByType('surface', major, NGL_PARAMS.isolevel, newValue));
  dispatch(setNglViewParams(NGL_PARAMS.isolevel, newValue, major, VIEWS.MAJOR_VIEW));
  dispatch(setIsoLevelAction(newValue, oldValue));
};

export const setBoxSize = (newValue, oldValue, major) => (dispatch, getState) => {
  dispatch(updateRepresentationsByType('surface', major, NGL_PARAMS.boxSize, newValue));
  dispatch(setNglViewParams(NGL_PARAMS.boxSize, newValue, major, VIEWS.MAJOR_VIEW));
  dispatch(setBoxSizeAction(newValue, oldValue));
};

export const setOpacity = (newValue, oldValue, major) => (dispatch, getState) => {
  dispatch(updateRepresentationsByType('surface', major, NGL_PARAMS.opacity, newValue));
  dispatch(setNglViewParams(NGL_PARAMS.opacity, newValue, major, VIEWS.MAJOR_VIEW));
  dispatch(setOpacityAction(newValue, oldValue));
};

export const setContour = (newValue, oldValue, major) => (dispatch, getState) => {
  dispatch(updateRepresentationsByType('surface', major, NGL_PARAMS.contour, newValue));
  dispatch(setNglViewParams(NGL_PARAMS.contour, newValue, major, VIEWS.MAJOR_VIEW));
  dispatch(setContourAction(newValue, oldValue));
};

export const setWarningIcon = (newValue, oldValue) => (dispatch, getState) => {
  dispatch(setNglViewParams(COMMON_PARAMS.warningIcon, newValue));
  dispatch(setWarningIconAction(newValue, oldValue));
};

const updateRepresentationsByType = (type, stage, key, newValue) => (dispatch, getState) => {
  if (stage) {
    let reprList = stage.compList.flatMap(a => a.reprList.filter(a => a.repr.type === type));
    reprList.forEach(r => {
      r.setParameters({ [key]: newValue });
    });
  }
};
