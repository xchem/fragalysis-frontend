/**
 * Created by abradley on 15/03/2018.
 */
import * as actions from "../actions/actonTypes";

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
    fragmentDisplayList: new Set(),
    complexList: new Set(),
    vectorOnList: new Set(),
    currentVector: undefined,
    highlightedCompound: {},
    compoundClasses: {1: "Blue", 2: "Red", 3: "Green", 4: "Purple", 5: "Apricot"},
    currentCompoundClass: 1,
}

export default function selectionReducers(state = INITIALSTATE, action) {
    console.log('REDUCERS FIRED OFF. OLD STATE');
    console.log(state);
    console.log('action.type=' + action.type);

    switch (action.type) {

        case actions.SET_TO_BUY_LIST:
            return Object.assign({}, state, {
                to_buy_list: action.to_buy_list,
            });

        case actions.APPEND_TO_BUY_LIST:
            var to_buy_list = state.to_buy_list.slice();
            var exists = false;
            for (var item in to_buy_list) {
                if (to_buy_list[item].smiles == action.item.smiles) {
                    exists = true;
                    if (to_buy_list[item].class != action.item.class) {
                        Object.assign(to_buy_list[item], {class: action.item.class})
                    }
                }
            }
            if (exists == false) {
                to_buy_list.push(action.item)
            }
            return Object.assign({}, state, {
                to_buy_list: to_buy_list
            })

        case actions.SET_VECTOR_LIST:
            return Object.assign({}, state, {
                vector_list: action.vector_list
            })

        case actions.REMOVE_FROM_TO_BUY_LIST:
            var to_buy_list = state.to_buy_list.slice();
            var index = -1;
            for (var item in to_buy_list) {
                if (to_buy_list[item].smiles == action.item.smiles) {
                    index = item
                    break;
                }
            }
            if (index != -1) {
                to_buy_list.splice(index, 1);
                return Object.assign({}, state, {to_buy_list: to_buy_list});
            } else {
                return state;
            }

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
            // Uniquify
                for (var key in input_mol_dict) {
                    var smiSet = new Set()
                    new_dict[key] = {}
                    new_dict[key]["addition"] = []
                    new_dict[key]["vector"] = input_mol_dict[key]["vector"]
                    for (var index in input_mol_dict[key]["addition"]){
                        var newSmi = input_mol_dict[key]["addition"][index]["end"]
                        if(smiSet.has(newSmi)!=true) {
                            new_dict[key]["addition"].push(input_mol_dict[key]["addition"][index])
                            smiSet.add(newSmi)
                        }
                    }
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
                this_vector_list: this_vector_list,
                currentVector: action.vector
            });

        case actions.SET_FRAGMENT_DISPLAY_LIST:
            return Object.assign({}, state, {
                fragmentDisplayList: action.fragmentDisplayList,
            });

        case actions.APPEND_FRAGMENT_DISPLAY_LIST:
            var fragmentDisplayList = new Set(state.fragmentDisplayList.add(action.item.id));
            return Object.assign({}, state, {
                fragmentDisplayList: fragmentDisplayList
            })

        case actions.REMOVE_FROM_FRAGMENT_DISPLAY_LIST:
            var fragmentDisplayList = new Set(state.fragmentDisplayList);
            fragmentDisplayList.delete(action.item.id);
            return Object.assign({}, state, {
                fragmentDisplayList: fragmentDisplayList
            })

        case actions.SET_COMPLEX_LIST:
            return Object.assign({}, state, {
                complexList: action.complexList,
            });

        case actions.APPEND_COMPLEX_LIST:
            var complexList = new Set(state.complexList.add(action.item.id));
            return Object.assign({}, state, {
                complexList: complexList
            })

        case actions.REMOVE_FROM_COMPLEX_LIST:
            var complexList = new Set(state.complexList);
            complexList.delete(action.item.id);
            return Object.assign({}, state, {
                complexList: complexList
            })

        case actions.SET_VECTOR_ON_LIST:
            return Object.assign({}, state, {
                vectorOnList: action.vectorOnList,
            });

        case actions.APPEND_VECTOR_ON_LIST:
            var vectorOnList = new Set(state.vectorOnList.clear())
            vectorOnList.add(action.item.id);
            return Object.assign({}, state, {
                vectorOnList: vectorOnList
            })

        case actions.REMOVE_FROM_VECTOR_ON_LIST:
            var vectorOnList = new Set(state.vectorOnList)
            vectorOnList.delete(action.item.id)
            return Object.assign({}, state, {
                vectorOnList: vectorOnList
            })

        case actions.SET_HIGHLIGHTED:
            return Object.assign({}, state, {
                highlightedCompound: action.highlightedCompound,
            })

        case actions.SET_COMPOUND_CLASSES:
            return Object.assign({}, state, {
                compoundClasses: action.compoundClasses
            })

        case actions.SET_CURRENT_COMPOUND_CLASS:
            return Object.assign({}, state, {
                currentCompoundClass: action.currentCompoundClass
            })

        case actions.RELOAD_SELECTION_STATE:
            var input_mol_key = action.currentVector;
            var this_vector_list = []
            for (var key in  state.to_select){
                if (key.split("_")[0]==input_mol_key){
                    this_vector_list[key] = state.to_select[key]
                }
            }
            return  Object.assign({}, state, {
                this_vector_list: this_vector_list,
                fragmentDisplayList: new Set(action.item.fragmentDisplayList),
                complexList: new Set(action.item.complexList),
                vectorOnList: new Set(action.item.vectorOnList),
                to_query: action.item.to_query,
                vector_list: action.item.vector_list,
                to_select: action.item.to_select,
                to_buy_list: action.item.to_buy_list,
                to_query_pk: action.item.to_query_pk,
                to_query_prot: action.item.to_query_prot,
                to_query_sdf_info: action.item.to_query_sdf_info,
                currentVector: action.item.currentVector,
            });

        // Cases like: @@redux/INIT
        default:
            return state;
    }
}
