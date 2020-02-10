import {
  decrementCountOfPendingNglObjects,
  decrementCountOfRemainingMoleculeGroups,
  deleteNglObject,
  incrementCountOfPendingNglObjects,
  loadNglObject,
  resetStateToDefaultScene,
  setNglStateFromCurrentSnapshot,
  setNglOrientation,
  setNglViewParams,
  setProteinLoadingState
} from './actions';
import { isEmpty, isEqual } from 'lodash';
import { SCENES } from './constants';
import { createRepresentationsArray } from '../../components/nglView/generatingObjects';
import { SELECTION_TYPE } from '../../components/nglView/constants';
import { removeFromComplexList, removeFromFragmentDisplayList, removeFromVectorOnList } from '../selection/actions';
import { nglObjectDictionary } from '../../components/nglView/renderingObjects';
import { addSnapshotToProject, saveCurrentSnapshot } from '../../components/projects/redux/dispatchActions';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { SnapshotType } from '../../components/projects/redux/constants';
import moment from 'moment';

export const loadObject = (target, stage, previousRepresentations) => dispatch => {
  if (stage) {
    dispatch(incrementCountOfPendingNglObjects());
    return nglObjectDictionary[target.OBJECT_TYPE](stage, target, target.name, previousRepresentations)
      .then(representations => dispatch(loadNglObject(target, representations)))
      .catch(error => {
        console.error(error);
      })
      .finally(() => dispatch(decrementCountOfPendingNglObjects()));
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
      case SELECTION_TYPE.COMPLEX:
        dispatch(removeFromComplexList(objectId));
        break;
      case SELECTION_TYPE.VECTOR:
        dispatch(removeFromVectorOnList(objectId));
        break;
    }
  }

  dispatch(deleteNglObject(target));
};

const createInitialSnapshot = projectId => async (dispatch, getState) => {
  const { objectsInView, nglOrientations, viewParams } = getState().nglReducers;
  const snapshot = { objectsInView, nglOrientations, viewParams };
  const snapshotDetail = {
    type: SnapshotType.INIT,
    name: 'Initial Snapshot',
    author: {
      username: DJANGO_CONTEXT.username,
      email: DJANGO_CONTEXT.email
    },
    message: 'Auto generated initial snapshot',
    children: null,
    parent: null,
    created: moment()
  };
  // TODO condition to check if project exists and if is open target or project
  dispatch(saveCurrentSnapshot(snapshot, snapshotDetail));
  if (projectId) {
    dispatch(addSnapshotToProject(snapshot, snapshotDetail, projectId));
  }
};

export const decrementCountOfRemainingMoleculeGroupsWithSavingDefaultState = projectId => (dispatch, getState) => {
  const state = getState();
  const decrementedCount = state.nglReducers.countOfRemainingMoleculeGroups - 1;
  if (decrementedCount === 0 && state.nglReducers.proteinsHasLoaded === true) {
    dispatch(createInitialSnapshot(projectId));
  }
  dispatch(decrementCountOfRemainingMoleculeGroups(decrementedCount));
};

// Helper actions for marking that protein and molecule groups are successful loaded
export const setProteinsHasLoaded = (hasLoaded = false, withoutSavingToDefaultState = false, projectId) => async (
  dispatch,
  getState
) => {
  const state = getState();
  if (
    state.nglReducers.countOfRemainingMoleculeGroups === 0 &&
    hasLoaded === true &&
    withoutSavingToDefaultState === false
  ) {
    dispatch(createInitialSnapshot(projectId));
  }
  dispatch(setProteinLoadingState(hasLoaded));
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
 */
export const reloadNglViewFromSnapshot = (stage, display_div) => (dispatch, getState) => {
  const snapshot = getState().projectReducers.snapshot;

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
  });
};
