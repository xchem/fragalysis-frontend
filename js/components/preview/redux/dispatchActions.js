import { generateProteinObject } from '../../nglView/generatingObjects';
import { SUFFIX, VIEWS } from '../../../constants/constants';
import { loadObject, setProteinsHasLoaded, setOrientation } from '../../../reducers/ngl/dispatchActions';
import { reloadSummaryReducer } from '../summary/redux/actions';
import { reloadCompoundsReducer } from '../compounds/redux/actions';
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

export const shouldLoadProtein = (nglViewList, isStateLoaded, projectId) => (dispatch, getState) => {
  const state = getState();
  const targetIdList = state.apiReducers.target_id_list;
  const targetOnName = state.apiReducers.target_on_name;

  if (targetIdList && targetIdList.length > 0 && nglViewList && nglViewList.length > 0) {
    //  1. Generate new protein or skip this action and everything will be loaded from session
    if (!isStateLoaded) {
      dispatch(setProteinsHasLoaded(false, undefined, projectId));
      Promise.all(
        nglViewList.map(nglView =>
          dispatch(loadProtein(nglView)).finally(() => {
            dispatch(setOrientation(nglView.id, nglView.stage.viewerControls.getOrientation()));
          })
        )
      )
        .then(() => dispatch(setProteinsHasLoaded(true, undefined, projectId)))
        .catch(() => dispatch(setProteinsHasLoaded(false, undefined, projectId)));
    } else {
      dispatch(setProteinsHasLoaded(true, true, projectId));
    }
    if (targetOnName !== undefined) {
      document.title = targetOnName + ': Fragalysis';
    }
  }
};

export const reloadPreviewReducer = newState => dispatch => {
  dispatch(reloadSummaryReducer(newState.summary));
  dispatch(reloadCompoundsReducer(newState.compounds));
  // dispatch(reloadMoleculeReducer(newState.molecule));
};
