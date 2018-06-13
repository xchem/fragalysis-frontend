import * as actions from '../actions/actonTypes'

const INITIALSTATE = {
      // Lists storing the information of what is in the viewer
    objectsToLoad: {},
    objectsToDelete: {},
    objectsInView: {},
    objectsLoading: {},
      // Set the basic things about NGL
    visible: true,
    interactions: true,
    color: "blue",
    style: "xstick",
    spin: false,
    water: true,
    hydrogen: true,
    orientationFlag: false,
    nglOrientation: {},
    orientationToSetFlag: false,
    orientationToSet: {},
    orientationCollectedFlag: false
}

export default function nglReducers(state = INITIALSTATE, action) {
    console.log('REDUCERS FIRED OFF. OLD STATE');
    console.log(state);
    console.log('action.type=' + action.type);

    switch (action.type) {
        // Defined in initialState - but may be needed if we want to load a different structure
            
        case actions.LOAD_OBJECT:
            // Append the input to objectsToLoad list
            var objectsToLoad = Object.assign({},{},state.objectsToLoad)
            var objectsInView = Object.assign({},{},state.objectsInView)
            if (action.group.name in objectsInView){
            }
            else{
                objectsToLoad[action.group.name]=action.group
            }

            return Object.assign({}, state, {
                objectsToLoad: objectsToLoad
            });

        case actions.LOAD_OBJECT_SUCCESS:
            // Remove from objectsLoading List
            var objectsLoading = Object.assign({},{},state.objectsLoading)
            delete objectsLoading[action.group.name]
            // Add to Objects in view list
            var objectsInView = Object.assign({},{},state.objectsInView)
            objectsInView[action.group.name]=action.group
            return Object.assign({}, state, {
                objectsInView: objectsInView,
                objectsLoading: objectsLoading
            });
        
        case actions.LOAD_OBJECT_FAILURE:
            // Don't change state - but can be used later to count number of failures
            console.log("Failed to load - "+action.group.name)
            return Object.assign({}, state, {
            });
        
        case actions.DELETE_OBJECT:
            // Append the input to objectsToDelete list
            var objectsToDelete = Object.assign({},{},state.objectsToDelete)
            // Add to the list to delete if not
            objectsToDelete[action.group.name]=action.group
            return Object.assign({}, state, {
            objectsToDelete: objectsToDelete
        });

        case actions.OBJECT_LOADING:
            var objectsToLoad = Object.assign({},{},state.objectsToLoad)
            delete objectsToLoad[action.group.name]
            // Add to Objects in view list
            var objectsLoading = Object.assign({},{},state.objectsLoading)
            objectsLoading[action.group.name]=action.group
            return Object.assign({}, state, {
                objectsToLoad:objectsToLoad,
                objectsLoading: objectsLoading
            });

        case actions.DELETE_OBJECT_SUCCESS:
            // Remove from objectsToDelete list
            var objectsToDelete = Object.assign({},{},state.objectsToDelete)
            delete objectsToDelete[action.group.name]
            // Remove from ObjecsIn view list
            var objectsInView = Object.assign({},{},state.objectsInView)
            delete objectsInView[action.group.name]
            return Object.assign({}, state, {
                objectsToDelete:objectsToDelete,
                objectsInView: objectsInView
            });

        case actions.DELETE_OBJECT_TYPE:
            console.log("DELETING OBJECT OF TYPE - "+action.object_type)
            var objectsToDelete = Object.assign({},{},state.objectsToDelete)
            var objectsInView = Object.assign({},{},state.objectsInView)
            for (var key in objectsInView){
                if(key.split("_")[0]==action.object_type){
                   objectsToDelete[key] = objectsInView[key]
                }
            }
            return Object.assign({}, state, {
                objectsToDelete:objectsToDelete
            });

        case actions.DELETE_OBJECT_FAILURE:
            // Don't change state - but can be used later to count number of failures
            console.log("Failed to delete - "+action.group.name)
            return Object.assign({}, state, {
            });

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

        case actions.TOGGLE_ORIENTATION_FLAG:
            return Object.assign({}, state, {
                orientationFlag : action.bool
            });

        case actions.GET_NGL_ORIENTATION:
            return Object.assign({}, state, {
                nglOrientation: action.currentOrientation
            });

        case actions.TOGGLE_TO_SET_ORIENTATION:
            return Object.assign({}, state, {
                orientationToSetFlag : action.bool
            });

        case actions.SET_NGL_ORIENTATION:
            return Object.assign({}, state, {
                orientationToSet: action.orientationToSet
            });

        case actions.TOGGLE_ORIENTATION_COLLECTION:
            return Object.assign({}, state, {
                orientationCollectedFlag : action.bool
            });

            // Cases like: @@redux/INIT
        default:
            return state;
    }
}
