import * as actions from '../actonTypes';
import { OBJECT_TYPE } from '../../constants/constants';
import { MOL_REPRESENTATION } from '../../components/nglView/constants';

const INITIALSTATE = {
  // Lists storing the information of what is in the viewer
  objectsToLoad: {},
  objectsToDelete: {},
  objectsInView: {},
  objectsLoading: {},
  nglOrientations: {},
  visible: true,
  interactions: true,
  color: 'blue',
  style: 'xstick',
  spin: false,
  water: true,
  hydrogen: true,
  orientationToSet: {},
  loadingState: true,
  stageColor: 'black',
  nglProtStyle: MOL_REPRESENTATION.cartoon
};

export default function nglReducers(state = INITIALSTATE, action = {}) {
  switch (action.type) {
    // Defined in initialState - but may be needed if we want to load a different structure

    case actions.LOAD_OBJECT:
      // Append the input to objectsToLoad list
      const newObjectsToLoad = JSON.parse(JSON.stringify(state.objectsToLoad));
      const newObjectsInView = JSON.parse(JSON.stringify(state.objectsInView));
      if (!(action.group.name in newObjectsInView)) {
        newObjectsToLoad[action.group.name] = action.group;
      }

      return Object.assign({}, state, {
        objectsToLoad: newObjectsToLoad
      });

    case actions.LOAD_OBJECT_SUCCESS:
      // Remove from objectsLoading List
      const newObjectsLoading = JSON.parse(JSON.stringify(state.objectsLoading));
      delete newObjectsLoading[action.group.name];
      // Add to Objects in view list
      const newTempObjectsInView = JSON.parse(JSON.stringify(state.objectsInView));
      newTempObjectsInView[action.group.name] = action.group;
      return Object.assign({}, state, {
        objectsInView: newTempObjectsInView,
        objectsLoading: newObjectsLoading
      });

    case actions.LOAD_OBJECT_FAILURE:
      // Don't change state - but can be used later to count number of failures
      return Object.assign({}, state, {});

    case actions.DELETE_OBJECT:
      // Append the input to objectsToDelete list
      const objectsToDeleteTemp = JSON.parse(JSON.stringify(state.objectsToDelete));
      // Add to the list to delete if not
      objectsToDeleteTemp[action.group.name] = action.group;
      return Object.assign({}, state, {
        objectsToDelete: objectsToDeleteTemp
      });

    case actions.OBJECT_LOADING:
      var objectsToLoad = JSON.parse(JSON.stringify(state.objectsToLoad));
      delete objectsToLoad[action.group.name];
      // Add to Objects in view list
      var objectsLoading = JSON.parse(JSON.stringify(state.objectsLoading));
      objectsLoading[action.group.name] = action.group;
      return Object.assign({}, state, {
        objectsToLoad: objectsToLoad,
        objectsLoading: objectsLoading
      });

    case actions.DELETE_OBJECT_SUCCESS:
      // Remove from objectsToDelete list
      const objectsToDeleteHelp = JSON.parse(JSON.stringify(state.objectsToDelete));
      delete objectsToDeleteHelp[action.group.name];
      // Remove from ObjecsIn view list
      const objectsInViewHelp = JSON.parse(JSON.stringify(state.objectsInView));
      delete objectsInViewHelp[action.group.name];
      return Object.assign({}, state, {
        objectsToDelete: objectsToDeleteHelp,
        objectsInView: objectsInViewHelp
      });

    case actions.DELETE_OBJECT_TYPE:
      var objectsToDelete = JSON.parse(JSON.stringify(state.objectsToDelete));
      var objectsInView = JSON.parse(JSON.stringify(state.objectsInView));
      for (var key in objectsInView) {
        if (key.split('_')[0] === action.object_type) {
          objectsToDelete[key] = objectsInView[key];
        }
      }
      return Object.assign({}, state, {
        objectsToDelete: objectsToDelete
      });

    case actions.DELETE_OBJECT_FAILURE:
      // Don't change state - but can be used later to count number of failures
      return Object.assign({}, state, {});

    case actions.SET_COLOR:
      return Object.assign({}, state, {
        color: action.color
      });

    case actions.SET_STYLE:
      return Object.assign({}, state, {
        style: action.style
      });
    case actions.SET_SPIN:
      return Object.assign({}, state, {
        spin: action.spin
      });
    case actions.SET_WATER:
      return Object.assign({}, state, {
        water: action.water
      });
    case actions.SET_HYDROGEN:
      return Object.assign({}, state, {
        hydrogen: action.hydrogen
      });

    case actions.SET_ORIENTATION:
      const div_id = action.div_id;
      const orientation = action.orientation;
      const toSetDiv = JSON.parse(JSON.stringify(state.nglOrientations));
      toSetDiv[div_id] = orientation;
      return Object.assign({}, state, {
        nglOrientations: toSetDiv
      });

    case actions.SET_NGL_ORIENTATION:
      const set_div_id = action.div_id;
      const set_orientation = action.orientation;
      const toSetDivTemp = JSON.parse(JSON.stringify(state.orientationToSet));
      toSetDivTemp[set_div_id] = set_orientation;
      return Object.assign({}, state, {
        orientationToSet: toSetDivTemp
      });

    case actions.SET_LOADING_STATE:
      return Object.assign({}, state, {
        loadingState: action.loadingState
      });

    case actions.SET_STAGE_COLOR:
      return Object.assign({}, state, {
        stageColor: action.stageColor
      });

    case actions.SET_NGL_PROT_STYLE:
      return Object.assign({}, state, {
        nglProtStyle: action.nglProtStyle
      });

    case actions.REDEPLOY_VECTORS:
      var vectorList = [];
      for (var object in action.objectsWereInView) {
        if (
          action.objectsWereInView[object].OBJECT_TYPE === OBJECT_TYPE.ARROW ||
          action.objectsWereInView[object].OBJECT_TYPE === OBJECT_TYPE.CYLINDER
        ) {
          vectorList.push(action.objectsWereInView[object]);
        }
      }
      return Object.assign({}, state, {
        objectsToLoad: vectorList
      });

    // Cases like: @@redux/INIT

    default:
      return state;
  }
}
