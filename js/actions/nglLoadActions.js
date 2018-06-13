/**
 * Created by abradley on 03/03/2018.
 */
import {LOAD_OBJECT, LOAD_OBJECT_SUCCESS, LOAD_OBJECT_FAILURE, OBJECT_LOADING,
    DELETE_OBJECT, DELETE_OBJECT_FAILURE, DELETE_OBJECT_SUCCESS,
    DELETE_OBJECT_TYPE, SET_ORIENTATION, SET_NGL_ORIENTATION, SET_UUID} from './actonTypes'


export const loadObject = function (group) {
    console.log("ACTIONS: " + group);
    return {
        type: LOAD_OBJECT,
        group: group
    };
}

export const objectLoading = function (group) {
    console.log("ACTIONS: " + group);
    return {
        type: OBJECT_LOADING,
        group: group
    };
}

export const setOrientation = function (div_id, orientation){
    console.log("ACTIONS: " + orientation + " " + div_id);
        return {
        type: SET_ORIENTATION,
        orientation: orientation,
            div_id: div_id,
    };
}

export const loadObjectSuccess = function (group) {
    console.log("ACTIONS: " + group);
    return {
        type: LOAD_OBJECT_SUCCESS,
        group: group,
        success: true
    };
}

export const deleteObjectType = function (object_type) {
    console.log("ACTIONS: " + object_type);
    return {
        type: DELETE_OBJECT_TYPE,
        object_type: object_type
    }

}

export const setNGLOrientation = function (div_id, orientation){
    console.log("ACTIONS: " + orientation + " " + div_id);
        return {
        type: SET_NGL_ORIENTATION,
        orientation: orientation,
            div_id: div_id,
    };


}

export const setUuid = function (uuid){
        console.log("ACTIONS: " + uuid);
    return {
        type: SET_UUID,
        uuid: uuid,

    }


}

export const loadObjectFailure = function (group) {
    console.log("ACTIONS: " + group);
    return {
        type: LOAD_OBJECT_FAILURE,
        group: group,
        success: false
    };
}


export const deleteObject = function (group) {
    console.log("ACTIONS: " + group);
    return {
        type: DELETE_OBJECT,
        group: group
    };
}

export const deleteObjectSuccess = function (group) {
    console.log("ACTIONS: " + group);
    return {
        type: DELETE_OBJECT_SUCCESS,
        group: group,
        success: true
    };
}

export const deleteObjectFailure = function (group) {
    console.log("ACTIONS: " + group);
    return {
        type: DELETE_OBJECT_FAILURE,
        group: group,
        success: false
    };
}

