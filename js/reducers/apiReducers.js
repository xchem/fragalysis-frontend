/**
 * Created by abradley on 06/03/2018.
 */
import * as actions from '../actions/actonTypes'

const INITIALSTATE = {
    project_id: undefined,
    target_id: undefined,
    target_id_list: [],
    mol_group_list: [],
    molecule_list: [],
    duck_yank_data: {},
    pandda_event_on: undefined,
    pandda_site_on: undefined,
    pandda_event_list: [],
    pandda_site_list: [],
    mol_group_on: undefined,
    target_on: undefined,
    target_on_name: undefined,
    group_id: undefined,
    isFetching: false,
    app_on: "PREVIEW",
    group_type: "MC",
    hotspot_on: undefined,
    hotspot_list: []
}

export default function apiReducers(state = INITIALSTATE, action) {
    console.log('REDUCERS FIRED OFF. OLD STATE');
    console.log(state);
    console.log('action.type=' + action.type);

    switch (action.type) {
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
            return Object.assign({}, state, {
                isFetching: true,
                element_type: action.element_type,
                url: getUrl(state, action.element_type)
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
        
        case actions.SET_TARGET_ID_LIST:
            return Object.assign({}, state, {
                target_id_list: action.target_id_list
            });

        case actions.SET_TARGET_ON:
            var target_on_name = undefined;
            for(var ind in state.target_id_list){
                if(state.target_id_list[ind].id==action.target_on){
                    target_on_name = state.target_id_list[ind].title;
                }
            }
            return Object.assign({}, state, {
                target_on_name: target_on_name,
                target_on: action.target_on,
            });

        case actions.SET_HOTSPOT_LIST:
            return Object.assign({}, state, {
                hotspot_list: action.hotspot_list
            });

        case actions.SET_HOTSPOT_ON:
            return Object.assign({}, state, {
                hotspot_on: action.hotspot_on
            });

        case actions.SET_MOL_GROUP_LIST:
            return Object.assign({}, state, {
                mol_group_list: action.mol_group_list
            });

        case actions.SET_MOL_GROUP_ON:
            return Object.assign({}, state, {
                mol_group_on: action.mol_group_on
            });

        case actions.FB_SET_MOL_GROUP_ON:
            return Object.assign({}, state, {
                mol_group_on: action.mol_group_on
            });

        case actions.SET_MOLECULE_LIST:
            return Object.assign({}, state, {
                molecule_list: action.molecule_list
            });

        case actions.SET_TO_BUY_LIST:
            return Object.assign({}, state, {
                to_buy_list: action.to_buy_list
            });


        case actions.SET_PANNDA_EVENT_LIST:
            return Object.assign({}, state, {
                pandda_event_list: action.pandda_event_list
            });
        case actions.SET_PANNDA_SITE_LIST:
            return Object.assign({}, state, {
                pandda_site_list: action.pandda_site_list
            });

        case actions.SET_PANNDA_EVENT_ON:
            return Object.assign({}, state, {
                pandda_event_on: action.pandda_event_id
            });

        case actions.SET_PANNDA_SITE_ON:
            return Object.assign({}, state, {
                pandda_site_on: action.pandda_site_id
            });

        case actions.SET_APP_ON:
            return Object.assign({}, state, {
                app_on: action.app_on
            });

        case actions.SET_DUCK_YANK_DATA:
            return Object.assign({}, state, {
                duck_yank_data: action.duck_yank_data
            });

        case actions.RELOAD_API_STATE:
            var target_on_name = undefined;
            for(var ind in state.target_id_list){
                if(state.target_id_list[ind].id==action.target_on){
                    target_on_name = state.target_id_list[ind].title;
                }
            }
            return Object.assign({}, state, {
                target_on_name: target_on_name,
                target_on: action.target_on,
                molecule_list: action.molecule_list,
                mol_group_list: action.mol_group_list,
                mol_group_on: action.mol_group_on,
                hotspot_list: action.hotspot_list,
                hotspot_on: action.hotspot_on,
                app_on: action.app_on
            });

        // Cases like: @@redux/INIT
        default:
            return state;
    }
}
