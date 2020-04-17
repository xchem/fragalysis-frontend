import {
  decrementCountOfPendingNglObjects,
  decrementCountOfRemainingMoleculeGroups,
  deleteNglObject,
  incrementCountOfPendingNglObjects,
  loadNglObject,
  setNglStateFromCurrentSnapshot,
  setMoleculeOrientations,
  setNglOrientation,
  setNglViewParams
} from './actions';
import { isEmpty, isEqual } from 'lodash';
import { createRepresentationsArray } from '../../components/nglView/generatingObjects';
import { SELECTION_TYPE } from '../../components/nglView/constants';
import {
  removeFromComplexList,
  removeFromFragmentDisplayList,
  removeFromVectorOnList,
  removeFromProteinList,
  removeFromSurfaceList,
  removeFromDensityList
} from '../selection/actions';
import { nglObjectDictionary } from '../../components/nglView/renderingObjects';
import { createInitialSnapshot } from '../../components/snapshot/redux/dispatchActions';

export const loadObject = (target, stage, previousRepresentations, orientationMatrix) => (dispatch, getState) => {
  if (stage) {
    dispatch(incrementCountOfPendingNglObjects(target.display_div));
    return nglObjectDictionary[target.OBJECT_TYPE](
      stage,
      target,
      target.name,
      previousRepresentations,
      orientationMatrix
    )
      .then(representations => dispatch(loadNglObject(target, representations)))
      .catch(error => {
        console.error(error);
      })
      .finally(() => dispatch(decrementCountOfPendingNglObjects(target.display_div)));
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
      case SELECTION_TYPE.PROTEIN:
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
    }
  }

  dispatch(deleteNglObject(target));
};

export const decrementCountOfRemainingMoleculeGroupsWithSavingDefaultState = projectId => (dispatch, getState) => {
  const state = getState();
  const decrementedCount = state.nglReducers.countOfRemainingMoleculeGroups - 1;
  // decide to create INIT snapshot
  console.log(
    '**** decrementCountOfRemainingMoleculeGroupsWithSavingDefaultState ',
    decrementedCount,
    state.nglReducers.proteinsHasLoaded
  );
  if (decrementedCount === 0 && state.nglReducers.proteinsHasLoaded === true) {
    dispatch(createInitialSnapshot(projectId));
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
          loadObject(snapshot.objectsInView[objInView], stage, createRepresentationsArray(representations))
        );
      } else {
        return Promise.resolve();
      }
    })
  ).finally(() => {
    // loop over nglViewParams
    Object.keys(snapshot.viewParams).forEach(param => {
      dispatch(setNglViewParams(param, snapshot.viewParams[param], stage));
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
  });
};
