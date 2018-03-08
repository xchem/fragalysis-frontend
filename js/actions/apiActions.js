/**
 * Created by abradley on 03/03/2018.
 */
import {LOAD_TARGETS, LOAD_MOLECULES, LOAD_MOL_GROUPS, GET_FROM_API, GET_FROM_API_FAILURE, GET_FROM_API_SUCCESS, RECEIVE_DATA_FROM_API} from './actonTypes'


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

export const loadMolecules = function (target_id=undefined,group_id=undefined) {
    console.log("ACTIONS: " + target_id + " " + group_id);
    return {
        type: LOAD_MOLECULES,
        target_id: target_id,
        group_id: group_id
    };
}


export const getFromApi = function (request_url, get_params, element_type){
    console.log("ACTIONS: " + request_url);
    return {
        type: GET_FROM_API,
        isFetching: true,
        get_params: get_params,
        element_type: element_type,
        url: request_url
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

export function fetchDataFillDiv(url, get_params, ) {
    return dispatch => {
        // Set the URL and the get params
      dispatch(getFromApi())
      return fetch()
          .then(response => response.json())
          .then(json => dispatch(receiveDataFromApi(json, element_type)))
  }
}