import { generateProteinObject } from '../../nglView/generatingObjects';
import { SUFFIX, VIEWS } from '../../../constants/constants';
import { loadObject, setOrientation } from '../../../reducers/ngl/dispatchActions';
import { reloadSummaryReducer } from '../summary/redux/actions';
import { reloadCompoundsReducer, resetCurrentCompoundsSettings } from '../compounds/redux/actions';
import { removeAllNglComponents, setProteinLoadingState } from '../../../reducers/ngl/actions';
import { createInitialSnapshot, reloadSession } from '../../snapshot/redux/dispatchActions';
import { resetLoadedSnapshots, resetProjectsReducer } from '../../projects/redux/actions';
import { resetSelectionState } from '../../../reducers/selection/actions';
// import { reloadMoleculeReducer } from '../molecule/redux/actions';

const loadProtein = nglView => (dispatch, getState) => {
  const state = getState();
  const target_on = state.apiReducers.target_on;
  const targetIdList = state.apiReducers.target_id_list;

  if (target_on !== undefined && targetIdList && nglView && nglView.id && nglView.stage) {
    let targetData = null;
    targetIdList.forEach(thisTarget => {
      if (thisTarget.id === target_on && targetData === null) {
        targetData = thisTarget;
      }
    });
    const targObject = generateProteinObject(targetData);
    if (targObject) {
      let newParams = { display_div: nglView.id };
      if (nglView.id === VIEWS.MAJOR_VIEW) {
        newParams.name = targObject.name + SUFFIX.MAIN;
      }
      return dispatch(loadObject(Object.assign({}, targObject, newParams), nglView.stage));
    }
  }
  return Promise.reject('Cannot load Protein to NGL View ID ', nglView.id);
};

export const shouldLoadProtein = ({ nglViewList, isStateLoaded, projectId, snapshotId }) => (dispatch, getState) => {
  const state = getState();
  const targetIdList = state.apiReducers.target_id_list;
  const targetOnName = state.apiReducers.target_on_name;
  const currentSnapshotID = state.projectReducers.currentSnapshot.id;
  const currentSnapshotData = state.projectReducers.currentSnapshot.data;

  if (targetIdList && targetIdList.length > 0 && nglViewList && nglViewList.length > 0) {
    //  1. Generate new protein or skip this action and everything will be loaded from session
    if (!isStateLoaded && currentSnapshotID === null) {
      dispatch(setProteinLoadingState(false));
      Promise.all(
        nglViewList.map(nglView =>
          dispatch(loadProtein(nglView)).finally(() => {
            dispatch(setOrientation(nglView.id, nglView.stage.viewerControls.getOrientation()));
          })
        )
      )
        .then(() => {
          dispatch(setProteinLoadingState(true));
          if (getState().nglReducers.countOfRemainingMoleculeGroups === 0) {
            dispatch(createInitialSnapshot(projectId));
          }
        })
        .catch(error => {
          dispatch(setProteinLoadingState(false));
          throw new Error(error);
        });
    }
    // decide to load existing snapshot
    else if (snapshotId !== null && currentSnapshotData !== null) {
      dispatch(reloadSession(currentSnapshotData, nglViewList));
    }

    if (targetOnName !== undefined) {
      document.title = targetOnName + ': Fragalysis';
    }
  }
};

export const reloadPreviewReducer = newState => dispatch => {
  dispatch(reloadSummaryReducer(newState.summary));
  dispatch(reloadCompoundsReducer(newState.compounds));
};

export const unmountPreviewComponent = (stages = []) => dispatch => {
  stages.forEach(stage => {
    if (stage.stage !== undefined || stage.stage !== null) {
      dispatch(removeAllNglComponents(stage.stage));
    }
  });

  dispatch(resetCurrentCompoundsSettings(true));
  dispatch(resetProjectsReducer());

  dispatch(resetSelectionState());
};

export const resetReducersBetweenSnapshots = (stages = []) => dispatch => {
  stages.forEach(stage => {
    if (stage.stage !== undefined || stage.stage !== null) {
      dispatch(removeAllNglComponents(stage.stage));
    }
  });
  dispatch(removeAllNglComponents());
  // dispatch(resetCurrentCompoundsSettings(true));
  // dispatch(resetProjectsReducer());

  dispatch(resetLoadedSnapshots());
  dispatch(resetSelectionState());
};
