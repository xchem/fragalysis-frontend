/**
 * Created by abradley on 15/03/2018.
 */
import * as actions from '../actions/actonTypes'

const INITIALSTATE = {
    to_buy_list: [],
    to_select: {},
    vector_list: [],
    this_vector_list: {},
    querying: false,
    to_query: undefined,
    counter: 0
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
            var to_buy_list = state.to_buy_list
            to_buy_list.push(action.item)
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
                if( to_buy_list[item]["smiles"]==action.item["smiles"]){
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
                to_select: {},
                querying: true
            });

        case actions.SET_MOL:
            return  Object.assign({}, state, {
                to_query: action.mol
            });

        case actions.GOT_FULL_GRAPH:
            var input_mol_dict = action.input_mol_dict;
            // Check if JSON
            if(input_mol_dict.startsWith("{")){
                input_mol_dict = JSON.parse(input_mol_dict);
            }
            else{
                input_mol_dict={"NO_JSON":-1}
            }
            return  Object.assign({}, state, {
                to_select: input_mol_dict,
                querying: false
            });

        case actions.SELECT_VECTOR:
            var input_mol_key = action.vector;
            var this_vector_list = new Array()
            for (var key in  state.to_select){
                if (key.split("_")[0]==input_mol_key){
                    this_vector_list[key] = state.to_select[key]
                }
            }
            return  Object.assign({}, state, {
                this_vector_list: this_vector_list
            });

        case actions.COUNTER:
            var counter = state.counter
            return Object.assign({}, state, {
                counter += 1
            });


        // Cases like: @@redux/INIT
        default:
            return state;
    }
}


