import { BACKGROUND_COLOR } from '../../components/nglView/constants';
import { CONSTANTS } from './nglConstants';

const INITIAL_STATE = {
  // NGL Scene properties
  objectsInView: {},
  nglOrientations: {},
  orientationToSet: {},
  loadingState: true,
  backgroundColor: BACKGROUND_COLOR.black,
  defaultScene: {},
  // Helper variables for marking that protein and molecule groups are successful loaded
  countOfRemainingMoleculeGroups: null,
  proteinsHasLoad: null,
  countOfPendingNglObjects: 0
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

      //   console.log(' LOAD_OBJECT ', newObjectsInView);

      return Object.assign({}, state, {
        objectsInView: newObjectsInView
      });

    case CONSTANTS.DELETE_OBJECT:
      const objectsInViewTemp = JSON.parse(JSON.stringify(state.objectsInView));
      delete objectsInViewTemp[action.target.name];

      console.log(' DELETE_OBJECT');
      return Object.assign({}, state, {
        objectsInView: objectsInViewTemp
      });

    case CONSTANTS.SET_ORIENTATION:
      const div_id = action.div_id;
      const orientation = action.orientation;
      const toSetDiv = JSON.parse(JSON.stringify(state.nglOrientations));
      toSetDiv[div_id] = orientation;

      console.log(' SET_ORIENTATION');
      return Object.assign({}, state, {
        nglOrientations: toSetDiv
      });

    case CONSTANTS.SET_NGL_ORIENTATION:
      const set_div_id = action.div_id;
      const set_orientation = action.orientation;
      const toSetDivTemp = JSON.parse(JSON.stringify(state.orientationToSet));
      toSetDivTemp[set_div_id] = set_orientation;
      console.log(' SET_NGL_ORIENTATION');
      return Object.assign({}, state, {
        orientationToSet: toSetDivTemp
      });

    case CONSTANTS.SET_LOADING_STATE:
      console.log(' SET_LOADING_STATE');
      return Object.assign({}, state, {
        loadingState: action.loadingState
      });

    case CONSTANTS.SET_BACKGROUND_COLOR:
      console.log(' SET_BACKGROUND_COLOR');
      return Object.assign({}, state, {
        backgroundColor: action.backgroundColor
      });

    case CONSTANTS.RESET_NGL_VIEW_TO_DEFAULT_SCENE:
      console.log(' RESET_NGL_VIEW_TO_DEFAULT_SCENE ');
      const newStateWithoutScene = JSON.parse(JSON.stringify(state.defaultScene));
      return Object.assign({}, state, newStateWithoutScene);

    case CONSTANTS.RESET_NGL_VIEW_TO_LAST_SCENE:
      console.log(' RESET_NGL_VIEW_TO_LAST_SCENE');
      // load state from default scene and replace current state by these data
      return state;

    case CONSTANTS.SAVE_NGL_STATE_AS_DEFAULT_SCENE:
      // load state from default scene and replace current state by these data
      const stateWithoutScene = JSON.parse(JSON.stringify(state));
      delete stateWithoutScene['defaultScene'];
      delete stateWithoutScene['countOfRemainingMoleculeGroups'];
      delete stateWithoutScene['proteinsHasLoad'];
      delete stateWithoutScene['countOfPendingNglObjects'];

      console.log(' SAVE_NGL_STATE_AS_DEFAULT_SCENE');

      return Object.assign({}, state, {
        defaultScene: stateWithoutScene
      });

    case CONSTANTS.REMOVE_ALL_NGL_COMPONENTS:
      console.log(' REMOVE_ALL_NGL_COMPONENTS');
      action.stage.removeAllComponents();
      // clear all arrays of object
      return Object.assign({}, state, INITIAL_STATE);

    // Helper actions for marking that protein and molecule groups are successful loaded
    case CONSTANTS.SET_PROTEINS_HAS_LOADED:
      //   console.log('SET_PROTEIN_HAS_LOAD ', action.payload);
      return Object.assign({}, state, { proteinsHasLoad: action.payload });

    case CONSTANTS.SET_COUNT_OF_REMAINING_MOLECULE_GROUPS:
      //    console.log('SET_COUNT_OF_REMAINING_MOLECULE_GROUPS');
      return Object.assign({}, state, { countOfRemainingMoleculeGroups: action.payload });

    case CONSTANTS.DECREMENT_COUNT_OF_REMAINING_MOLECULE_GROUPS:
      //    console.log('DECREMENT_COUNT_OF_REMAINING_MOLECULE_GROUPS');
      return Object.assign({}, state, { countOfRemainingMoleculeGroups: action.payload });

    case CONSTANTS.DECREMENT_COUNT_OF_PENDING_NGL_OBJECTS:
      return Object.assign({}, state, { countOfPendingNglObjects: state.countOfPendingNglObjects - 1 });

    case CONSTANTS.INCREMENT_COUNT_OF_PENDING_NGL_OBJECTS:
      return Object.assign({}, state, { countOfPendingNglObjects: state.countOfPendingNglObjects + 1 });

    default:
      return state;
  }
}
