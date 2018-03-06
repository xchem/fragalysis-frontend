/**
 * Created by abradley on 06/03/2018.
 */
import * as actions from '../actions/actonTypes'

const INITIALSTATE = {
    project_id: undefined,
    target_id: undefined,
    group_id: undefined,
    group_type: "MC"
}


export default function apiReducers(state = INITIALSTATE, action) {
    console.log('REDUCERS FIRED OFF. OLD STATE');
    console.log(state);
    console.log('action.type=' + action.type);

    switch (action.type) {
        // Defined in initialState - but may be needed if we want to load a different structure

        case actions.LOAD_TARGETS:
            return Object.assign({}, state, {
                project_id: action.project_id
            });

        case actions.LOAD_MOL_GROUPS:
            return Object.assign({}, state, {
                group_id: action.group_id,
                // Group type is default
                group_type: action.group_type = action.group_type === undefined ? "MC" : action.group_type
            });

        case actions.LOAD_MOLECULES:
            return Object.assign({}, state, {
                target_id: action.target_id,
                group_id: action.group_id
            });
        // Cases like: @@redux/INIT
        default:
            return state;
    }
}


