/**
 * Created by abradley on 15/03/2018.
 */
import * as actions from '../actions/actonTypes';

const INITIAL_STATE = {
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
  bondColorMap: undefined,
  complexList: new Set(),
  vectorOnList: new Set(),
  currentVector: undefined,
  highlightedCompound: {},
  compoundClasses: {
    1: 'Blue',
    2: 'Red',
    3: 'Green',
    4: 'Purple',
    5: 'Apricot'
  },
  currentCompoundClass: 1
};

export default function selectionReducers(state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case actions.SET_TO_BUY_LIST:
      return Object.assign({}, state, {
        to_buy_list: action.to_buy_list
      });

    case actions.APPEND_TO_BUY_LIST:
      const current_to_buy_list = state.to_buy_list.slice();
      let exists = false;
      for (let current_to_buy_item in current_to_buy_list) {
        if (current_to_buy_list[current_to_buy_item].smiles === action.item.smiles) {
          exists = true;
          if (current_to_buy_list[current_to_buy_item].class !== action.item.class) {
            Object.assign(current_to_buy_list[current_to_buy_item], { class: action.item.class });
          }
        }
      }
      if (exists === false) {
        current_to_buy_list.push(action.item);
      }
      return Object.assign({}, state, {
        to_buy_list: current_to_buy_list
      });

    case actions.SET_VECTOR_LIST:
      return Object.assign({}, state, {
        vector_list: action.vector_list
      });

    case actions.REMOVE_FROM_TO_BUY_LIST:
      const to_buy_list = state.to_buy_list.slice();
      let itemIndex = -1;
      for (var item in to_buy_list) {
        if (to_buy_list[item].smiles === action.item.smiles) {
          itemIndex = item;
          break;
        }
      }
      if (itemIndex !== -1) {
        to_buy_list.splice(itemIndex, 1);
        return Object.assign({}, state, { to_buy_list: to_buy_list });
      } else {
        return state;
      }

    case actions.GET_FULL_GRAPH:
      var input_mol = action.item;
      return Object.assign({}, state, {
        to_query: input_mol.smiles,
        to_query_pk: input_mol.id,
        to_query_sdf_info: input_mol.sdf_info,
        to_query_prot: input_mol.prot_id,
        to_select: {},
        querying: true
      });

    case actions.SET_MOL:
      return Object.assign({}, state, {
        to_query: action.mol
      });

    case actions.GOT_FULL_GRAPH:
      const input_mol_dict = action.input_mol_dict;
      var new_dict = {};
      // Uniquify
      for (var input_mol_dict_key in input_mol_dict) {
        var smiSet = new Set();
        new_dict[input_mol_dict_key] = {};
        new_dict[input_mol_dict_key]['addition'] = [];
        new_dict[input_mol_dict_key]['vector'] = input_mol_dict[input_mol_dict_key]['vector'];
        for (var index in input_mol_dict[input_mol_dict_key]['addition']) {
          var newSmi = input_mol_dict[input_mol_dict_key]['addition'][index]['end'];
          if (smiSet.has(newSmi) !== true) {
            new_dict[input_mol_dict_key]['addition'].push(input_mol_dict[input_mol_dict_key]['addition'][index]);
            smiSet.add(newSmi);
          }
        }
      }
      return Object.assign({}, state, {
        to_select: new_dict,
        querying: false
      });

    case actions.SELECT_VECTOR:
      var input_mol_key = action.vector;
      var new_this_vector_list = [];
      for (var key_to_select in state.to_select) {
        if (key_to_select.split('_')[0] === input_mol_key) {
          new_this_vector_list[key_to_select] = state.to_select[key_to_select];
        }
      }
      return Object.assign({}, state, {
        this_vector_list: new_this_vector_list,
        currentVector: action.vector
      });

    case actions.SET_FRAGMENT_DISPLAY_LIST:
      return Object.assign({}, state, {
        fragmentDisplayList: new Set(action.fragmentDisplayList)
      });

    case actions.APPEND_FRAGMENT_DISPLAY_LIST:
      return Object.assign({}, state, {
        fragmentDisplayList: new Set(state.fragmentDisplayList.add(action.item.id))
      });

    case actions.REMOVE_FROM_FRAGMENT_DISPLAY_LIST:
      const diminishedFragmentDisplayList = new Set(state.fragmentDisplayList);
      diminishedFragmentDisplayList.delete(action.item.id);
      return Object.assign({}, state, {
        fragmentDisplayList: diminishedFragmentDisplayList
      });

    case actions.SET_COMPLEX_LIST:
      return Object.assign({}, state, {
        complexList: new Set(action.complexList)
      });

    case actions.APPEND_COMPLEX_LIST:
      return Object.assign({}, state, {
        complexList: new Set(state.complexList.add(action.item.id))
      });

    case actions.REMOVE_FROM_COMPLEX_LIST:
      const diminishedComplexList = new Set(state.complexList);
      diminishedComplexList.delete(action.item.id);
      return Object.assign({}, state, {
        complexList: diminishedComplexList
      });

    case actions.SET_VECTOR_ON_LIST:
      return Object.assign({}, state, {
        vectorOnList: new Set(action.vectorOnList)
      });

    case actions.APPEND_VECTOR_ON_LIST:
      const newVectorOnList = new Set(state.vectorOnList.clear());
      newVectorOnList.add(action.item.id);
      return Object.assign({}, state, {
        vectorOnList: newVectorOnList
      });

    case actions.REMOVE_FROM_VECTOR_ON_LIST:
      const diminishedVectorOnList = new Set(state.vectorOnList);
      diminishedVectorOnList.delete(action.item.id);
      return Object.assign({}, state, {
        vectorOnList: diminishedVectorOnList
      });

    case actions.SET_HIGHLIGHTED:
      return Object.assign({}, state, {
        highlightedCompound: action.highlightedCompound
      });

    case actions.SET_COMPOUND_CLASSES:
      return Object.assign({}, state, {
        compoundClasses: action.compoundClasses
      });

    case actions.SET_CURRENT_COMPOUND_CLASS:
      return Object.assign({}, state, {
        currentCompoundClass: action.currentCompoundClass
      });

    case actions.SET_BOND_COLOR_MAP:
      return Object.assign({}, state, {
        bondColorMap: action.bondColorMap
      });

    case actions.RELOAD_SELECTION_STATE:
      var this_vector_list = [];
      for (var to_select_item in action.savedSelectionReducers.to_select) {
        if (to_select_item.split('_')[0] === action.savedSelectionReducers.currentVector) {
          this_vector_list[to_select_item] = action.savedSelectionReducers.to_select[to_select_item];
        }
      }
      return Object.assign({}, state, {
        this_vector_list: this_vector_list,
        fragmentDisplayList: new Set(action.savedSelectionReducers.fragmentDisplayList),
        complexList: new Set(action.savedSelectionReducers.complexList),
        vectorOnList: new Set(action.savedSelectionReducers.vectorOnList),
        to_query: action.savedSelectionReducers.to_query,
        vector_list: action.savedSelectionReducers.vector_list,
        to_select: action.savedSelectionReducers.to_select,
        to_buy_list: action.savedSelectionReducers.to_buy_list,
        to_query_pk: action.savedSelectionReducers.to_query_pk,
        to_query_prot: action.savedSelectionReducers.to_query_prot,
        to_query_sdf_info: action.savedSelectionReducers.to_query_sdf_info,
        currentVector: action.savedSelectionReducers.currentVector,
        compoundClasses: action.savedSelectionReducers.compoundClasses,
        currentCompoundClass: action.savedSelectionReducers.currentCompoundClass,
        highlightedCompound: action.savedSelectionReducers.highlightedCompound
      });

    case actions.RESET_SELECTION_STATE:
      return INITIAL_STATE;

    // Cases like: @@redux/INIT
    default:
      return state;
  }
}
