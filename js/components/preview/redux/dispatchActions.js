import { generateProteinObject } from '../../nglView/generatingObjects';
import { SUFFIX, VIEWS } from '../../../constants/constants';
import { loadObject, setOrientation } from '../../../reducers/ngl/dispatchActions';
import { reloadSummaryReducer } from '../summary/redux/actions';
import { reloadCompoundsReducer, resetCurrentCompoundsSettings } from '../compounds/redux/actions';
import { removeAllNglComponents, setProteinLoadingState } from '../../../reducers/ngl/actions';
import { createInitialSnapshot } from '../../snapshot/redux/dispatchActions';
import { resetLoadedSnapshots, resetProjectsReducer } from '../../projects/redux/actions';
import { resetSelectionState } from '../../../reducers/selection/actions';
import { URLS } from '../../routes/constants';
import { resetDatasetsState } from '../../datasets/redux/actions';
import { restoreAfterTargetActions } from '../../../reducers/tracking/dispatchActions';
import { resetTrackingState } from '../../../reducers/tracking/actions';
import { setTargetOn } from '../../../reducers/api/actions';
import { resetNglTrackingState } from '../../../reducers/nglTracking/dispatchActions';
import { resetViewerControlsState } from '../viewerControls/redux/actions';

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
      return dispatch(loadObject({ target: Object.assign({}, targObject, newParams), stage: nglView.stage }));
    }
  }
  return Promise.reject('Cannot load Protein to NGL View ID ', nglView.id);
};

export const shouldLoadProtein = ({
  nglViewList,
  isStateLoaded,
  routeProjectID,
  routeSnapshotID,
  currentSnapshotID,
  isLoadingCurrentSnapshot
}) => (dispatch, getState) => {
  const state = getState();
  const targetIdList = state.apiReducers.target_id_list;
  const targetOnName = state.apiReducers.target_on_name;
  const isRestoring = state.trackingReducers.isActionRestoring;
  if (
    targetIdList &&
    targetIdList.length > 0 &&
    nglViewList &&
    nglViewList.length > 0 &&
    isLoadingCurrentSnapshot === false
  ) {
    //  1. Generate new protein or skip this action and everything will be loaded from project actions
    if (!isStateLoaded && currentSnapshotID === null && !routeSnapshotID) {
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
            const summaryView = nglViewList.find(view => view.id === VIEWS.SUMMARY_VIEW);
            dispatch(createInitialSnapshot(routeProjectID, summaryView));
          }
        })
        .catch(error => {
          dispatch(setProteinLoadingState(false));
          throw new Error(error);
        });
    } else if (
      currentSnapshotID !== null &&
      (!routeSnapshotID || routeSnapshotID === currentSnapshotID.toString()) &&
      isRestoring === true
    ) {
      dispatch(restoreAfterTargetActions(nglViewList, routeProjectID));
    }

    if (targetOnName !== undefined) {
      document.title = targetOnName + ': Fragalysis';
    }
  }
};

export const loadProteinOfRestoringActions = ({ nglViewList }) => (dispatch, getState) => {
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
    })
    .catch(error => {
      dispatch(setProteinLoadingState(false));
      throw new Error(error);
    });
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

  dispatch(resetTrackingState());
  dispatch(resetNglTrackingState());

  dispatch(resetCurrentCompoundsSettings(true));
  dispatch(resetProjectsReducer());

  dispatch(resetSelectionState());
  dispatch(resetDatasetsState());

  dispatch(resetViewerControlsState());
};

export const resetReducersForRestoringActions = () => dispatch => {
  dispatch(resetSelectionState());
  dispatch(resetDatasetsState());
  dispatch(resetViewerControlsState());
};

export const resetReducersBetweenSnapshots = (stages = []) => dispatch => {
  stages.forEach(stage => {
    if (stage.stage !== undefined || stage.stage !== null) {
      dispatch(removeAllNglComponents(stage.stage));
    }
  });

  dispatch(resetLoadedSnapshots());
  dispatch(resetSelectionState());
  dispatch(resetDatasetsState());
  dispatch(resetTrackingState());
  dispatch(resetNglTrackingState());
  dispatch(setTargetOn(undefined));
  dispatch(resetViewerControlsState());
};

export const switchBetweenSnapshots = ({ nglViewList, projectID, snapshotID, history }) => (dispatch, getState) => {
  if (projectID && snapshotID) {
    dispatch(resetReducersBetweenSnapshots(nglViewList));
    history.push(`${URLS.projects}${projectID}/${snapshotID}`);
  } else {
    throw new Error('ProjectID or SnapshotID is missing!');
  }
};
