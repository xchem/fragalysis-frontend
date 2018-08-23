/**
 * Created by abradley on 03/03/2018.
 */
import {LOAD_TARGETS, SET_TARGET_ON, SET_TARGET_ID_LIST, SET_MOLECULE_LIST, SET_MOL_GROUP_LIST, SET_MOL_GROUP_ON,
    LOAD_MOLECULES, LOAD_MOL_GROUPS, GET_FROM_API, GET_FROM_API_FAILURE, GET_FROM_API_SUCCESS, RECEIVE_DATA_FROM_API,
    SET_PANNDA_EVENT_LIST, SET_PANNDA_EVENT_ON, SET_PANNDA_SITE_ON, SET_PANNDA_SITE_LIST, SET_APP_ON, SET_HOTSPOT_LIST,
    SET_HOTSPOT_ON, SET_DUCK_YANK_DATA, RELOAD_API_STATE} from './actonTypes'


export const loadTargets = function (project_id=undefined) {
    console.log("ACTIONS: " + project_id);
    return {
        type: LOAD_TARGETS,
        project_id: project_id
    };
}

export const loadMolGroups = function (target_id,group_type="MC") {
    console.log("ACTIONS: " + target_id + " " + group_type);
    return {
        type: LOAD_MOL_GROUPS,
        target_id: target_id,
        group_type: group_type
    };
}

export const setTargetIdList = function (input_json) {
    console.log("ACTIONS: " + input_json);
    return {
        type: SET_TARGET_ID_LIST,
        target_id_list: input_json
    };
}

export const setDuckYankData = function (input_json){
    console.log("ACTIONS: " + input_json);
    return {
        type: SET_DUCK_YANK_DATA,
        duck_yank_data: input_json
    };

}

export const setTargetOn = function (target_id){
    console.log("ACTIONS: "+ target_id)
    return {
        type: SET_TARGET_ON,
        target_on: target_id
    }
}

export const setPanddaSiteList = function (pandda_site_list){
    console.log("ACTIONS: "+ pandda_site_list)
    return {
        type: SET_PANNDA_SITE_LIST,
        pandda_site_list: pandda_site_list
    }
}

export const setPanddaEventList = function (pandda_event_list){
    console.log("ACTIONS: "+ pandda_event_list)
    return {
        type: SET_PANNDA_EVENT_LIST,
        pandda_event_list: pandda_event_list
    }
}

export const setPanddaSiteOn = function (pandda_site_id){
    console.log("ACTIONS: "+ pandda_site_id)
    return {
        type: SET_PANNDA_SITE_ON,
        pandda_site_id: pandda_site_id
    }
}
export const setPanddaEventOn = function (pandda_event_id){
    console.log("ACTIONS: "+ pandda_event_id)
    return {
        type: SET_PANNDA_EVENT_ON,
        pandda_event_id: pandda_event_id
    }
}

export const setMolGroupOn = function (mol_group_id){
    console.log("ACTIONS: "+ mol_group_id)
    return {
        type: SET_MOL_GROUP_ON,
        mol_group_on: mol_group_id
    }
}

export const setAppOn = function (app_on){
    console.log("ACTIONS: "+ app_on)
    return {
        type: SET_APP_ON,
        app_on: app_on}
}

export const setMolGroupList = function (mol_group_list){
    console.log("ACTIONS: "+ mol_group_list)
    return {
        type: SET_MOL_GROUP_LIST,
        mol_group_list: mol_group_list
    }
}

export const setMoleculeList = function (molecule_list){
    console.log("ACTIONS: "+ molecule_list)
    return {
        type: SET_MOLECULE_LIST,
        molecule_list: molecule_list
    }
}

export const loadMolecules = function (target_id=undefined,group_id=undefined) {
    console.log("ACTIONS: " + target_id + " " + group_id);
    return {
        type: LOAD_MOLECULES,
        target_id: target_id,
        group_id: group_id
    };
}

export const setHotspotList = function (input_json) {
    console.log("ACTIONS: " + input_json);
    return {
        type: SET_HOTSPOT_LIST,
        hotspot_list: input_json
    };
}

export const setHotspotOn = function (hotspot){
    console.log("ACTIONS: "+ hotspot)
    return {
        type: SET_HOTSPOT_ON,
        hotspot_on: hotspot
    }
}

export const getFromApi = function (element_type){
    console.log("ACTIONS: " + element_type);
    return {
        type: GET_FROM_API,
        isFetching: true,
        element_type: element_type
    }
}

export const getFromApiSuccess = function (response){
    console.log("ACTIONS: " + response);
    return {
        type: GET_FROM_API_SUCCESS,
        isFetching: false,
        response: response
    }
}

export const getFromApiFailure = function (){
    console.log("REQUEST FAILED");
    return {
        type: GET_FROM_API_FAILURE,
        isFetching: false,
        error: 'Request failed'
    }
}

export const receiveDataFromApi = function (json, element_type) {
    console.log("ACTIONS: ");
    return {
        type: RECEIVE_DATA_FROM_API,
        element_type: element_type,
        // Perhaps need to handle pagination here
        children: json.data.children.map(child => child.data),
        receivedAt: Date.now()
    }
}

export const reloadApiState = function (apiReducers) {
    console.log("RELOAD API STATE " + apiReducers);
    return {
        type: RELOAD_API_STATE,
        target_on_name: apiReducers.target_on_name,
        target_on: apiReducers.target_on,
        molecule_list: apiReducers.molecule_list,
        mol_group_list: apiReducers.mol_group_list,
        mol_group_on: apiReducers.mol_group_on,
        hotspot_list: apiReducers.hotspot_list,
        hotspot_on: apiReducers.hotspot_on,
        app_on: apiReducers.app_on
    }
}

export function renderData(element_type, div_id) {

}

export function fetchDataFillDiv(url) {
    return dispatch => {
        // Set the URL and the get params
        return fetch(url)
            .then(response => response.json(),
                error => console.log('An error occurred.', error)
            )
            .then(json => dispatch(receiveDataFromApi(json, element_type)))
  }
}
