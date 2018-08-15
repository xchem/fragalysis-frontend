/**
 * Created by abradley on 15/03/2018.
 */
import * as actions from '../actions/actonTypes'

const INITIALSTATE = {
    to_buy_list: [],
    to_select: {},
    vector_list: [],
    to_query_pk: undefined,
    to_query_prot: undefined,
    to_query_sdf_info: undefined,
    this_vector_list: {},
    querying: false,
    to_query: undefined,
    fragmentDisplayList: [],
    complexList: [],
}

export default function selectionReducers(state = INITIALSTATE, action) {
    console.log('REDUCERS FIRED OFF. OLD STATE');
    console.log(state);
    console.log('action.type=' + action.type);

    switch (action.type) {

        case actions.SET_TO_BUY_LIST:
            return Object.assign({}, state, {
                to_buy_list: action.to_buy_list,
            });s

        case actions.APPEND_TO_BUY_LIST:
            var to_buy_list = state.to_buy_list.slice();
            var exists = false;
            for(var item in to_buy_list){
                if( to_buy_list[item].smiles==action.item.smiles){
                    exists = true;
                }
            }
            if(exists==false) {
                to_buy_list.push(action.item)
            }
            return  Object.assign({}, state, {
                to_buy_list: to_buy_list
            })
        
        case actions.SET_VECTOR_LIST:
            return  Object.assign({}, state, {
                vector_list: action.vector_list
            })

        case actions.REMOVE_FROM_TO_BUY_LIST:
            var to_buy_list = state.to_buy_list
            var index = -1;
            for(var item in to_buy_list){
                if( to_buy_list[item].smiles==action.item.smiles){
                    index = item
                    break;
                }
            }
            to_buy_list.splice(index,1);
            return  Object.assign({}, state, {
                to_buy_list: to_buy_list
            });

        case actions.GET_FULL_GRAPH:
            var input_mol = action.item;
            return  Object.assign({}, state, {
                to_query: input_mol.smiles,
                to_query_pk: input_mol.id,
                to_query_sdf_info: input_mol.sdf_info,
                to_query_prot: input_mol.prot_id,
                to_select: {},
                querying: true
            });

        case actions.SET_MOL:
            return  Object.assign({}, state, {
                to_query: action.mol
            });

        case actions.GOT_FULL_GRAPH:
            var input_mol_dict = action.input_mol_dict;
            var new_dict = {}
            // Check if JSON
            // Uniquify the dictionrary
            for (var key in input_mol_dict) {
                new_dict[key] = input_mol_dict[key].filter((x, i, a) => a.indexOf(x) == i)
            }
            return  Object.assign({}, state, {
                to_select: new_dict,
                querying: false
            });

        case actions.SELECT_VECTOR:
            var input_mol_key = action.vector;
            var this_vector_list = []
            for (var key in  state.to_select){
                if (key.split("_")[0]==input_mol_key){
                    this_vector_list[key] = state.to_select[key]
                }
            }
            return  Object.assign({}, state, {
                this_vector_list: this_vector_list
            });

        case actions.SET_FRAGMENT_DISPLAY_LIST:
            return Object.assign({}, state, {
                fragmentDisplayList: action.fragmentDisplayList,
            });

        case actions.APPEND_FRAGMENT_DISPLAY_LIST:
            var fragmentDisplayList = state.fragmentDisplayList.slice();
            var exists = false;
            for (var item in fragmentDisplayList) {
                if (fragmentDisplayList[item].id == action.item.id) {
                    exists = true;
                }
            }
            if (exists == false) {
                fragmentDisplayList.push(action.item)
            }
            return Object.assign({}, state, {
                fragmentDisplayList: fragmentDisplayList
            })

        case actions.REMOVE_FROM_FRAGMENT_DISPLAY_LIST:
            var fragmentDisplayList = state.fragmentDisplayList
            var index = -1;
            for (var item in fragmentDisplayList) {
                index = item
                break;
            }
            fragmentDisplayList.splice(index, 1);
            return Object.assign({}, state, {
                fragmentDisplayList: fragmentDisplayList
            })

        case actions.SET_COMPLEX_LIST:
            return Object.assign({}, state, {
                complexList: action.complexList,
            });

        case actions.APPEND_COMPLEX_LIST:
            var complexList = state.complexList.slice();
            var exists = false;
            for (var item in complexList) {
                if (complexList[item].id == action.item.id) {
                    exists = true;
                }
            }
            if (exists == false) {
                complexList.push(action.item)
            }
            return Object.assign({}, state, {
                complexList: complexList
            })

        case actions.REMOVE_FROM_COMPLEX_LIST:
            var complexList = state.complexList
            var index = -1;
            for (var item in complexList) {
                index = item
                break;
            }
            complexList.splice(index, 1);
            return Object.assign({}, state, {
                complexList: complexList
            })

        case actions.RELOAD_SELECTION_STATE:
            return Object.assign({}, state, {
                fragmentDisplayList: action.fragmentDisplayList,
                complexList: action.complexList,
                to_query: action.to_query,
                vector_list: action.vector_list,
                to_select: action.to_select
            });

        // Cases like: @@redux/INIT
        default:
            return state;
    }
}
