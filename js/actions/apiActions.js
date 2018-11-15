/**
 * Created by abradley on 03/03/2018.
 */
import {
    LOAD_TARGETS,
    SET_TARGET_ON,
    SET_TARGET_ID_LIST,
    SET_MOLECULE_LIST,
    SET_MOL_GROUP_LIST,
    SET_MOL_GROUP_ON,
    LOAD_MOLECULES,
    LOAD_MOL_GROUPS,
    GET_FROM_API,
    GET_FROM_API_FAILURE,
    GET_FROM_API_SUCCESS,
    RECEIVE_DATA_FROM_API,
    SET_PANNDA_EVENT_LIST,
    SET_PANNDA_EVENT_ON,
    SET_PANNDA_SITE_ON,
    SET_PANNDA_SITE_LIST,
    SET_APP_ON,
    SET_HOTSPOT_LIST,
    SET_HOTSPOT_ON,
    SET_DUCK_YANK_DATA,
    RELOAD_API_STATE,
    SET_SAVING_STATE,
    SET_LATEST_SNAPSHOT,
    SET_LATEST_SESSION,
    SET_SESSION_TITLE,
    SET_SESSION_ID,
    SET_SESSION_ID_LIST,
    UPDATE_SESSION_ID_LIST,
    SET_ERROR_MESSAGE,
    SET_TARGET_UNRECOGNISED,
    SET_UUID,
    SET_USER_ID,
} from "./actonTypes";

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

export const setSavingState = function (savingState) {
    console.log("ACTIONS: setting saving state to " + savingState);
    return {
        type: SET_SAVING_STATE,
        savingState: savingState
    };
}

export const setLatestSnapshot = function (uuid) {
    console.log("ACTIONS: latest state snapshot is " + uuid)
    return {
        type: SET_LATEST_SNAPSHOT,
        latestSnapshot: uuid
    }
}

export const setLatestSession = function (uuid) {
    console.log("ACTIONS: latest session uuid is " + uuid)
    return {
        type: SET_LATEST_SESSION,
        latestSession: uuid
    }
}

export const setSessionTitle = function (sessionTitle) {
    console.log("ACTIONS: set session title to " + sessionTitle)
    return {
        type: SET_SESSION_TITLE,
        sessionTitle: sessionTitle
    }
}

export const setSessionId = function (id) {
    console.log("ACTIONS: django session ID is " + id)
    return {
        type: SET_SESSION_ID,
        sessionId: id
    }
}

export const setSessionIdList = function (input_json) {
    console.log("ACTIONS: sessionList summary written to state");
    return {
        type: SET_SESSION_ID_LIST,
        sessionIdList: input_json
    };
}

export const updateSessionIdList = function (input_json) {
    console.log("ACTIONS: sessionList summary written to state");
    return {
        type: UPDATE_SESSION_ID_LIST,
        sessionIdList: input_json,
    };
}

export const setErrorMessage = function (errorMessage) {
    console.log("ACTIONS: errorMessage is " + errorMessage)
    return {
        type: SET_ERROR_MESSAGE,
        errorMessage: errorMessage
    }
}

export const setTargetUnrecognised = function (bool) {
    console.log("ACTIONS: set targetUnrecognised to " + bool);
    return {
        type: SET_TARGET_UNRECOGNISED,
        targetUnrecognised: bool
    };
}

export const setUuid = function (uuid){
        console.log("ACTIONS: " + uuid);
    return {
        type: SET_UUID,
        uuid: uuid,
    }
}

export const setUserId = function (user_id){
    console.log("ACTIONS: Set userId " + user_id);
    return {
        type: SET_USER_ID,
        user_id: user_id,
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
        app_on: apiReducers.app_on,
        sessionId: apiReducers.sessionId,
        sessionTitle: apiReducers.sessionTitle,
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
