/**
 * Created by abradley on 03/03/2018.
 */
import {LOAD_OBJECT, LOAD_OBJECT_SUCCESS, LOAD_OBJECT_FAILURE,
    DELETE_OBJECT, DELETE_OBJECT_FAILURE, DELETE_OBJECT_SUCCESS} from './actonTypes'


export const loadObject = function (group) {
    console.log("ACTIONS: " + group);
    return {
        type: LOAD_OBJECT,
        group: group
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