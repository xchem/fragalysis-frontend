import { BACKGROUND_COLOR } from '../../components/nglView/constants';
import { CONSTANTS } from './nglConstants';

const INITIAL_STATE = {
  // NGL Scene properties
  objectsInView: {},
  nglOrientations: {},
  orientationToSet: {},
  loadingState: true,
  backgroundColor: BACKGROUND_COLOR.black,
  defaultScene: {}
};

export default function nglReducers(state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    // Defined in initialState - but may be needed if we want to load a different structure

    case CONSTANTS.LOAD_OBJECT:
      // Append the input to objectsToLoad list
      const newObjectsInView = JSON.parse(JSON.stringify(state.objectsInView));
      if (!(action.target.name in newObjectsInView)) {
        newObjectsInView[action.target.name] = action.target;
      }

      return Object.assign({}, state, {
        objectsInView: newObjectsInView
      });

    case CONSTANTS.DELETE_OBJECT:
      const objectsInViewTemp = JSON.parse(JSON.stringify(state.objectsInView));
      delete objectsInViewTemp[action.target.name];
      return Object.assign({}, state, {
        objectsInView: objectsInViewTemp
      });

    case CONSTANTS.SET_ORIENTATION:
      const div_id = action.div_id;
      const orientation = action.orientation;
      const toSetDiv = JSON.parse(JSON.stringify(state.nglOrientations));
      toSetDiv[div_id] = orientation;
      return Object.assign({}, state, {
        nglOrientations: toSetDiv
      });

    case CONSTANTS.SET_NGL_ORIENTATION:
      const set_div_id = action.div_id;
      const set_orientation = action.orientation;
      const toSetDivTemp = JSON.parse(JSON.stringify(state.orientationToSet));
      toSetDivTemp[set_div_id] = set_orientation;
      return Object.assign({}, state, {
        orientationToSet: toSetDivTemp
      });

    case CONSTANTS.SET_LOADING_STATE:
      return Object.assign({}, state, {
        loadingState: action.loadingState
      });

    case CONSTANTS.SET_BACKGROUND_COLOR:
      return Object.assign({}, state, {
        backgroundColor: action.backgroundColor
      });

    case CONSTANTS.RESET_NGL_VIEW_TO_DEFAULT_SCENE:
      // load state from default scene and replace current state by these data
      return state;

    case CONSTANTS.SAVE_NGL_STATE_AS_DEFAULT_SCENE:
      // load state from default scene and replace current state by these data
      const stateWithoutScene = JSON.parse(JSON.stringify(state));
      delete stateWithoutScene['defaultScene'];

      return Object.assign({}, state, {
        defaultScene: stateWithoutScene
      });

    case CONSTANTS.REMOVE_ALL_NGL_COMPONENTS:
      action.stage.removeAllComponents();
      // clear all arrays of object
      return Object.assign({}, state, INITIAL_STATE);

    // Cases like: @@redux/INIT

    default:
      return state;
  }
}
