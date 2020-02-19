import { BACKGROUND_COLOR, NGL_PARAMS } from '../../components/nglView/constants';
import { CONSTANTS } from './constants';

export const INITIAL_STATE = {
  // NGL Scene properties
  objectsInView: {},
  nglOrientations: {},
  viewParams: {
    /*
    [NGL_PARAMS.impostor]: true,
    [NGL_PARAMS.quality]: 'auto',
    [NGL_PARAMS.sampleLevel]: 0,
    [NGL_PARAMS.theme]: 'dark',
    [NGL_PARAMS.overview]: true,
    [NGL_PARAMS.rotateSpeed]: 2.0,
    [NGL_PARAMS.zoomSpeed]: 1.2,
    [NGL_PARAMS.panSpeed]: 0.8,
    [NGL_PARAMS.cameraFov]: 40,
    [NGL_PARAMS.cameraType]: 'perspective',
    [NGL_PARAMS.lightColor]: 0xdddddd,
    [NGL_PARAMS.lightIntensity]: 1.0,
    [NGL_PARAMS.ambientColor]: 0xdddddd,
    [NGL_PARAMS.ambientIntensity]: 0.2,
    [NGL_PARAMS.hoverTimeout]: 0, */
    [NGL_PARAMS.backgroundColor]: BACKGROUND_COLOR.white,
    [NGL_PARAMS.clipNear]: 0,
    [NGL_PARAMS.clipFar]: 100,
    [NGL_PARAMS.clipDist]: 10,
    [NGL_PARAMS.fogNear]: 50,
    [NGL_PARAMS.fogFar]: 100
  },

  // Helper variables for marking that protein and molecule groups are successful loaded
  countOfRemainingMoleculeGroups: null,
  proteinsHasLoaded: null,
  countOfPendingNglObjects: 0
};

export default function nglReducers(state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    // Defined in initialState - but may be needed if we want to load a different structure

    case CONSTANTS.LOAD_OBJECT:
      // Append the input to objectsToLoad list
      const newObjectsInView = JSON.parse(JSON.stringify(state.objectsInView));
      newObjectsInView[action.target.name] = { ...action.target, representations: action.representations };

      return Object.assign({}, state, {
        objectsInView: newObjectsInView
      });

    case CONSTANTS.UPDATE_COMPONENT_REPRESENTATION:
      const newObjInView = JSON.parse(JSON.stringify(state.objectsInView));
      let newRepresentations = [];
      newObjInView[action.objectInViewID].representations.forEach(r => {
        if (r.uuid === action.representationID) {
          newRepresentations.push(action.newRepresentation);
        } else {
          newRepresentations.push(r);
        }
      });
      newObjInView[action.objectInViewID].representations = newRepresentations;

      return Object.assign({}, state, {
        objectsInView: newObjInView
      });

    case CONSTANTS.ADD_COMPONENT_REPRESENTATION:
      const newObjInView2 = JSON.parse(JSON.stringify(state.objectsInView));
      newObjInView2[action.objectInViewID].representations.push(action.newRepresentation);

      return Object.assign({}, state, {
        objectsInView: newObjInView2
      });

    case CONSTANTS.REMOVE_COMPONENT_REPRESENTATION:
      const newObjInViewWithRemovedRepresentation = JSON.parse(JSON.stringify(state.objectsInView));
      if (newObjInViewWithRemovedRepresentation[action.objectInViewID].representations) {
        for (let i = 0; i < newObjInViewWithRemovedRepresentation[action.objectInViewID].representations.length; i++) {
          if (
            newObjInViewWithRemovedRepresentation[action.objectInViewID].representations[i].uuid ===
            action.representationID
          ) {
            newObjInViewWithRemovedRepresentation[action.objectInViewID].representations.splice(i, 1);
            break;
          }
        }
      }
      return Object.assign({}, state, {
        objectsInView: newObjInViewWithRemovedRepresentation
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

    case CONSTANTS.SET_NGL_VIEW_PARAMS:
      const newViewParams = JSON.parse(JSON.stringify(state.viewParams));
      newViewParams[action.key] = action.value;

      return Object.assign({}, state, {
        viewParams: newViewParams
      });

    case CONSTANTS.SET_NGL_STATE_FROM_CURRENT_SNAPSHOT:
      return Object.assign({}, state, action.payload);

    case CONSTANTS.REMOVE_ALL_NGL_COMPONENTS:
      if (action.stage) {
        action.stage.removeAllComponents();
      }
      // clear all arrays of object
      return INITIAL_STATE;

    // Helper actions for marking that protein and molecule groups are successful loaded
    case CONSTANTS.SET_PROTEINS_HAS_LOADED:
      return Object.assign({}, state, { proteinsHasLoaded: action.payload });

    case CONSTANTS.SET_COUNT_OF_REMAINING_MOLECULE_GROUPS:
      return Object.assign({}, state, { countOfRemainingMoleculeGroups: action.payload });

    case CONSTANTS.DECREMENT_COUNT_OF_REMAINING_MOLECULE_GROUPS:
      return Object.assign({}, state, { countOfRemainingMoleculeGroups: action.payload });

    case CONSTANTS.DECREMENT_COUNT_OF_PENDING_NGL_OBJECTS:
      return Object.assign({}, state, { countOfPendingNglObjects: state.countOfPendingNglObjects - 1 });

    case CONSTANTS.INCREMENT_COUNT_OF_PENDING_NGL_OBJECTS:
      return Object.assign({}, state, { countOfPendingNglObjects: state.countOfPendingNglObjects + 1 });

    default:
      return state;
  }
}
