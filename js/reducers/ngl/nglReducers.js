import { BACKGROUND_COLOR, NGL_PARAMS, NGL_VIEW_DEFAULT_VALUES } from '../../components/nglView/constants';
import { CONSTANTS } from './constants';
import { VIEWS } from '../../constants/constants';
import { withBackgroundColor } from './viewParameters';

export const INITIAL_STATE = {
  // NGL Scene properties
  objectsInView: {},
  objectsInViewStash: {},
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
    ...NGL_VIEW_DEFAULT_VALUES
    // [NGL_PARAMS.backgroundColor]: BACKGROUND_COLOR.black,
    // [NGL_PARAMS.clipNear]: 42,
    // [NGL_PARAMS.clipFar]: 100,
    // [NGL_PARAMS.clipDist]: 10,
    // [NGL_PARAMS.fogNear]: 50,
    // [NGL_PARAMS.fogFar]: 62
  },

  // Helper variables for marking that protein and molecule groups are successful loaded
  countOfRemainingMoleculeGroups: null,
  proteinsHasLoaded: null,
  countOfPendingNglObjects: {
    [VIEWS.MAJOR_VIEW]: 0,
    [VIEWS.SUMMARY_VIEW]: 0
  },
  moleculeOrientations: {},
  pdbCache: {},
  qualityCache: {},
  electronDensityColor_event: 'blue',
  electronDensityColor_sigmaa: 'blue',
  electronDensityColor_diff: 'blue',
  skipOrientationChange: false,
  nglViewFromSnapshotRendered: false,
  snapshotOrientationApplied: false,
  reapplyOrientation: false,
  objectsInSnapshotToBeRendered: 0,
  isSnapshotRendering: false,
  isNGLQueueEmpty: true
};

export default function nglReducers(state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    // Defined in initialState - but may be needed if we want to load a different structure

    case CONSTANTS.SET_IS_NGL_QUEUE_EMPTY:
      return { ...state, isNGLQueueEmpty: action.isEmpty };

    case CONSTANTS.SET_NGL_OBJECTS_IN_SNAPSHOT_TO_BE_RENDERED:
      return { ...state, objectsInSnapshotToBeRendered: action.noOfobjects };

    case CONSTANTS.SET_IS_SNAPSHOT_RENDERING:
      return { ...state, isSnapshotRendering: action.isSnapshotRendering ?? action.isRendering };

    case CONSTANTS.SET_SKIP_ORIENTATION_CHANGE:
      return { ...state, skipOrientationChange: action.skip };

    case CONSTANTS.SET_REAPPLY_ORIENTATION:
      return { ...state, reapplyOrientation: action.reapply };

    case CONSTANTS.SET_NGL_VIEW_FROM_SNAPSHOT_RENDERED:
      return { ...state, nglViewFromSnapshotRendered: action.rendered };

    case CONSTANTS.SET_SNAPSHOT_ORIENTATION_APPLIED:
      return { ...state, snapshotOrientationApplied: action.applied };

    case CONSTANTS.LOAD_OBJECT:
      // at first check if object was already stashed
      const objectsInViewStashTemp = { ...state.objectsInViewStash };
      const newStateObject = {};
      if (objectsInViewStashTemp.hasOwnProperty(action.target.name)) {
        // delete object (it was/could be already loaded in loadObject() call)
        delete objectsInViewStashTemp[action.target.name];

        newStateObject['objectsInViewStash'] = objectsInViewStashTemp;
      }
      // Add object into view list
      const newObjectsInView = {
        ...state.objectsInView,
        [action.target.name]: { ...action.target, representations: action.representations }
      };

      newStateObject['objectsInView'] = newObjectsInView;

      return Object.assign({}, state, newStateObject);

    case CONSTANTS.UPDATE_COMPONENT_REPRESENTATION:
      const objectToUpdate = state.objectsInView[action.objectInViewID];
      const newRepresentations = objectToUpdate.representations.map(representation =>
        representation.uuid === action.representationID ? action.newRepresentation : representation
      );
      const newObjInView = {
        ...state.objectsInView,
        [action.objectInViewID]: {
          ...objectToUpdate,
          representations: newRepresentations
        }
      };

      return Object.assign({}, state, {
        objectsInView: newObjInView
      });

    case CONSTANTS.ADD_COMPONENT_REPRESENTATION:
      const objectToExtend = state.objectsInView[action.objectInViewID];
      const newObjInView2 = {
        ...state.objectsInView,
        [action.objectInViewID]: {
          ...objectToExtend,
          representations: [...objectToExtend.representations, action.newRepresentation]
        }
      };

      return Object.assign({}, state, {
        objectsInView: newObjInView2
      });

    case CONSTANTS.REMOVE_COMPONENT_REPRESENTATION:
      const representationID = action.representation && action.representation.uuid;
      const objectToTrim = state.objectsInView[action.objectInViewID];
      const remainingRepresentations = (objectToTrim.representations || []).filter(
        representation => representation.uuid !== representationID
      );
      const newObjInViewWithRemovedRepresentation = {
        ...state.objectsInView,
        [action.objectInViewID]: {
          ...objectToTrim,
          representations: remainingRepresentations
        }
      };
      return Object.assign({}, state, {
        objectsInView: newObjInViewWithRemovedRepresentation
      });

    case CONSTANTS.DELETE_OBJECT:
      const objectsInViewTemp = { ...state.objectsInView };

      // stash state of the object
      const newObjectsInViewStash = { ...state.objectsInViewStash };
      if (objectsInViewTemp.hasOwnProperty(action.target.name)) {
        newObjectsInViewStash[action.target.name] = {
          ...objectsInViewTemp[action.target.name],
          representations: objectsInViewTemp[action.target.name].representations
        };
      }

      delete objectsInViewTemp[action.target.name];

      return Object.assign({}, state, {
        objectsInView: objectsInViewTemp,
        objectsInViewStash: newObjectsInViewStash
      });

    case CONSTANTS.SET_ORIENTATION:
      let div_id = action.div_id;
      let orientation = action.orientation;
      let toSetDiv = JSON.parse(JSON.stringify(state.nglOrientations));
      toSetDiv[div_id] = orientation;

      return Object.assign({}, state, {
        nglOrientations: toSetDiv
      });

    case CONSTANTS.SET_ORIENTATION_BY_INTERACTION:
      div_id = action.div_id;
      orientation = action.orientation;
      toSetDiv = JSON.parse(JSON.stringify(state.nglOrientations));
      toSetDiv[div_id] = orientation;

      return Object.assign({}, state, {
        nglOrientations: toSetDiv
      });

    case CONSTANTS.SET_NGL_VIEW_PARAMS:
      if (action.key === NGL_PARAMS.backgroundColor) {
        return { ...state, viewParams: withBackgroundColor(state.viewParams, action.value) };
      }
      const newViewParams = JSON.parse(JSON.stringify(state.viewParams));
      newViewParams[action.key] = action.value;

      return Object.assign({}, state, {
        viewParams: newViewParams
      });

    case CONSTANTS.SET_NGL_STATE_FROM_CURRENT_SNAPSHOT:
      const snapshot = action.payload;
      delete snapshot.countOfPendingNglObjects;
      delete snapshot.countOfRemainingMoleculeGroups;
      delete snapshot.proteinsHasLoaded;
      // PDB files are cached as live Blobs. Their JSON-cloned counterparts
      // in the prepared snapshot are just {}, which NGL cannot load.
      delete snapshot.pdbCache;
      return Object.assign({}, state, snapshot);

    case CONSTANTS.REMOVE_ALL_NGL_COMPONENTS:
      // clear all arrays of object
      return Object.assign({}, INITIAL_STATE);

    // Helper actions for marking that protein and molecule groups are successful loaded
    case CONSTANTS.SET_PROTEINS_HAS_LOADED:
      return Object.assign({}, state, { proteinsHasLoaded: action.payload });

    case CONSTANTS.SET_COUNT_OF_REMAINING_MOLECULE_GROUPS:
      return Object.assign({}, state, { countOfRemainingMoleculeGroups: action.payload });

    case CONSTANTS.DECREMENT_COUNT_OF_REMAINING_MOLECULE_GROUPS:
      return Object.assign({}, state, { countOfRemainingMoleculeGroups: action.payload });

    case CONSTANTS.DECREMENT_COUNT_OF_PENDING_NGL_OBJECTS:
      const newCounts = JSON.parse(JSON.stringify(state.countOfPendingNglObjects));
      newCounts[action.payload] = state.countOfPendingNglObjects[action.payload] - 1;
      return Object.assign({}, state, { countOfPendingNglObjects: newCounts });

    case CONSTANTS.INCREMENT_COUNT_OF_PENDING_NGL_OBJECTS:
      const newPendingCounts = JSON.parse(JSON.stringify(state.countOfPendingNglObjects));
      newPendingCounts[action.payload] = state.countOfPendingNglObjects[action.payload] + 1;
      return Object.assign({}, state, { countOfPendingNglObjects: newPendingCounts });

    case CONSTANTS.SET_MOLECULE_ORIENTATIONS:
      return Object.assign({}, state, { moleculeOrientations: action.payload });

    case CONSTANTS.APPEND_MOLECULE_ORIENTATION:
      const newMoleculeOrientations = Object.assign({}, state.moleculeOrientations);

      // if (newMoleculeOrientations[action.payload.moleculeID] === undefined) {
      newMoleculeOrientations[action.payload.moleculeID] = action.payload.orientation;
      // }
      return Object.assign({}, state, { moleculeOrientations: newMoleculeOrientations });

    case CONSTANTS.REMOVE_MOLECULE_ORIENTATION:
      const diminishedMoleculeOrientations = Object.assign({}, state.moleculeOrientations);
      if (diminishedMoleculeOrientations[action.payload] !== undefined) {
        delete diminishedMoleculeOrientations[action.payload];
      }
      return Object.assign({}, state, { moleculeOrientations: diminishedMoleculeOrientations });

    case CONSTANTS.ADD_TO_PDB_CACHE:
      return {
        ...state,
        pdbCache: {
          ...state.pdbCache,
          [action.payload.name]: action.payload.cacheItem
        }
      };

    case CONSTANTS.SET_ELECTRON_DENSITY_COLOR_EVENT:
      return {
        ...state,
        electronDensityColor_event: action.payload
      };
    case CONSTANTS.SET_ELECTRON_DENSITY_COLOR_SIGMAA:
      return {
        ...state,
        electronDensityColor_sigmaa: action.payload
      };
    case CONSTANTS.SET_ELECTRON_DENSITY_COLOR_DIFF:
      return {
        ...state,
        electronDensityColor_diff: action.payload
      };

    case CONSTANTS.ADD_TO_QUALITY_CACHE:
      return {
        ...state,
        qualityCache: {
          ...state.qualityCache,
          [action.payload.name]: action.payload.cacheItem
        }
      };
    default:
      return state;
  }
}
