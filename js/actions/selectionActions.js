/**
 * Created by abradley on 15/03/2018.
 */

import {SET_TO_BUY_LIST, APPEND_TO_BUY_LIST, REMOVE_FROM_TO_BUY_LIST, GET_FULL_GRAPH, GOT_FULL_GRAPH, SET_VECTOR_LIST,
    SELECT_VECTOR, SET_MOL, SET_FRAGMENT_DISPLAY_LIST, APPEND_FRAGMENT_DISPLAY_LIST, REMOVE_FROM_FRAGMENT_DISPLAY_LIST,
    SET_COMPLEX_LIST, APPEND_COMPLEX_LIST, REMOVE_FROM_COMPLEX_LIST, SET_VECTOR_ON_LIST, APPEND_VECTOR_ON_LIST,
    REMOVE_FROM_VECTOR_ON_LIST, RELOAD_SELECTION_STATE} from './actonTypes'

export const setToBuyList = function (to_buy_list){
    console.log("ACTIONS: "+ to_buy_list)
    return {
        type: SET_TO_BUY_LIST,
        to_buy_list: to_buy_list
    }
}

export const appendToBuyList = function (item){
    console.log("ACTIONS: "+ item)
    return {
        type: APPEND_TO_BUY_LIST,
        item: item
    }
}

export const removeFromToBuyList = function (item){
    console.log("ACTIONS: "+ item)
    return {
        type: REMOVE_FROM_TO_BUY_LIST,
        item: item
    }
}

export const getFullGraph = function (item) {
    console.log("ACTIONS: " + item)
    return {
        type: GET_FULL_GRAPH,
        item: item
    }
}

export const gotFullGraph = function (result){
    console.log("ACTIONS: "+ result)
    return {
        type: GOT_FULL_GRAPH,
        input_mol_dict: result
    }
}

export const setMol = function(mol){
    console.log("ACTIONS: "+ mol)
    return {
        type: SET_MOL,
        mol: mol
    }
}

export const setVectorList = function (vectList){
    console.log("ACTIONS: "+ vectList)
    return {
        type: SET_VECTOR_LIST,
        vector_list: vectList
    }
}

export const selectVector = function (vector){
    console.log("ACTIONS: "+ vector)
    return {
        type: SELECT_VECTOR,
        vector: vector
    }
}

export const setFragmentDisplayList = function (fragmentDisplayList){
    console.log("ACTIONS: "+ fragmentDisplayList)
    return {
        type: SET_FRAGMENT_DISPLAY_LIST,
        fragmentDisplayList: fragmentDisplayList
    }
}

export const appendFragmentDisplayList = function (item) {
    console.log("ACTIONS: " + item)
    return {
        type: APPEND_FRAGMENT_DISPLAY_LIST,
        item: item
    }
}

export const removeFromFragmentDisplayList = function (item){
    console.log("ACTIONS: "+ item)
    return {
        type: REMOVE_FROM_FRAGMENT_DISPLAY_LIST,
	item: item
    }
}

export const setComplexList = function (complexList){
    console.log("ACTIONS: "+ complexList)
    return {
        type: SET_COMPLEX_LIST,
        complexList: complexList
    }
}

export const appendComplexList = function (item){
    console.log("ACTIONS: "+ item)
    return {
        type: APPEND_COMPLEX_LIST,
        item: item
    }
}

export const removeFromComplexList = function (item){
    console.log("ACTIONS: "+ item)
    return {
        type: REMOVE_FROM_COMPLEX_LIST,
        item: item
    }
}

export const setVectorOnList = function (vectorOnList){
    console.log("ACTIONS: "+ vectorOnList)
    return {
        type: SET_VECTOR_ON_LIST,
        vectorList: vectorOnList
    }
}

export const appendVectorOnList = function (item){
    console.log("ACTIONS: "+ item)
    return {
        type: APPEND_VECTOR_ON_LIST,
        item: item
    }
}

export const removeFromVectorOnList = function (item){
    console.log("ACTIONS: "+ item)
    return {
        type: REMOVE_FROM_VECTOR_ON_LIST,
        item: item
    }
}

export const reloadSelectionState = function (item){
    console.log("RELOAD STATE: " + item)
    return {
        type: RELOAD_SELECTION_STATE,
        fragmentDisplayList: new Set(item.fragmentDisplayList),
        complexList: new Set(item.complexList),
        vectorOnList: new Set(item.vectorOnList),
        to_query: item.to_query,
        vector_list: item.vector_list,
        to_select: item.to_select,
        to_buy_list: item.to_buy_list,
        to_query_pk: item.to_query_pk,
        to_query_prot: item.to_query_prot,
        to_query_sdf_info: item.to_query_sdf_info,
        currentVector: item.currentVector,
    }
}
