/**
 * Created by abradley on 06/03/2018.
 */
import * as actions from '../actions/actonTypes'

const INITIALSTATE = {
    project_id: undefined,
    target_id: undefined,
    group_id: undefined,
    isFetching: false,
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
                project_id: action.project_id,
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

        case actions.GET_FROM_API:
            // Here is where we put the logic for generatiing the url
            var request_url = "/v0.1/"
            var get_params = {}
            switch(action.element_type) {
                case actions.LOAD_MOLECULES:
                    request_url += "molecules/"
                    get_params["target_id"] = state.target_id
                    if(state.group_id != undefined) {
                        get_params["group_id"] = state.group_id
                    }
                case actions.LOAD_MOL_GROUPS:
                    request_url += "molgroup/"
                    get_params["group_id"] = state.group_id
                    get_params["group_type"] = state.group_type
                case actions.LOAD_TARGETS:
                    request_url += "targets/"
                    if(state.project_id != undefined) {
                        get_params["project_id"] = state.project_id
                    }
            }
            return Object.assign({}, state, {
                get_params: get_params,
                isFetching: true,
                element_type: action.element_type,
                url: request_url
            });

        case actions.GET_FROM_API_SUCCESS:
            return Object.assign({}, state, {
                element_type: action.element_type,
                isFetching: false,
                response: action.response
            });

        case actions.GET_FROM_API_FAILURE:
            return Object.assign({}, state, {
                element_type: action.element_type,
                isFetching: false,
                error: action.error
            });

        // Cases like: @@redux/INIT
        default:
            return state;
    }
}


