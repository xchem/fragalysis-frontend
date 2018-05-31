/**
 * Created by rgillams on 22/05/2018.
 */
import * as actions from '../actions/actonTypes'


const INITIALSTATE = {
    objectsToLoad: [],
    objectsInView: [],
    nglOrientation: []
}

export default function stateReducers(state = INITIALSTATE, action) {
    console.log('REDUCERS FIRED OFF. OLD STATE');
    console.log(state);
    console.log('action.type=' + action.type);

    switch (action.type) {
        // Defined in initialState - but may be needed if we want to load a different structure
        case actions.STATE_ALERT:
            var objectsInView = state.objectsInView
            return Object.assign({}, state, {
                objectsInView: objectsInView
                alert(this.objectsInView)
            });

        case actions.STATE_SPECIFY:
            var objectsToLoad = state.objectsToLoad
            return Object.assign({}, state, {
                objectsToLoad: objectsToLoad
            });

        case actions.GET_ORIENTATION:
            var nglOrientation = state.nglOrientation
            return Object.assign({}, state, {
                nglOrientation: nglOrientation
            });

        default:
            return state;
    }
}


