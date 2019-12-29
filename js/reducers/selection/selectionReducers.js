/**
 * Created by abradley on 15/03/2018.
 */
import * as actions from '../actonTypes';
import { constants } from './selectionConstants';

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
  currentCompoundClass: 1,
  countOfPendingVectorLoadRequests: 0,
  mol_group_selection: []
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
      var new_this_vector_list = {};
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
      console.log('SET_FRAGMENT_DISPLAY_LIST');
      state.fragmentDisplayList.clear();
      action.fragmentDisplayList.forEach(f => {
        state.fragmentDisplayList.add(f);
      });

      return state;

    case actions.APPEND_FRAGMENT_DISPLAY_LIST:
      console.log('APPEND_FRAGMENT_DISPLAY_LIST');
      state.fragmentDisplayList.add(action.item.id);
      return state;

    case actions.REMOVE_FROM_FRAGMENT_DISPLAY_LIST:
      console.log('REMOVE_FROM_FRAGMENT_DISPLAY_LIST');
      state.fragmentDisplayList.delete(action.item.id);
      return state;

    case actions.SET_COMPLEX_LIST:
      state.complexList.clear();
      action.complexList.forEach(f => {
        state.complexList.add(f);
      });
      return state;

    case actions.APPEND_COMPLEX_LIST:
      state.complexList.add(action.item.id);
      return state;

    case actions.REMOVE_FROM_COMPLEX_LIST:
      state.complexList.delete(action.item.id);
      return state;

    case actions.SET_VECTOR_ON_LIST:
      state.vectorOnList.clear();
      action.vectorOnList.forEach(v => {
        state.vectorOnList.add(v);
      });
      return state;

    case actions.APPEND_VECTOR_ON_LIST:
      state.vectorOnList.clear();
      state.vectorOnList.add(action.item.id);
      return state;

    case actions.REMOVE_FROM_VECTOR_ON_LIST:
      state.vectorOnList.delete(action.item.id);
      return state;

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
      var this_vector_list = {};
      for (var to_select_item in action.savedSelectionReducers.to_select) {
        if (to_select_item === action.savedSelectionReducers.currentVector) {
          this_vector_list[to_select_item] = action.savedSelectionReducers.to_select[to_select_item];
        }
      }
      state.fragmentDisplayList.clear();
      action.savedSelectionReducers.fragmentDisplayList.forEach(f => {
        state.fragmentDisplayList.add(f);
      });
      state.complexList.clear();
      action.savedSelectionReducers.complexList.forEach(c => {
        state.complexList.add(c);
      });
      state.vectorOnList.clear();
      action.savedSelectionReducers.vectorOnList.forEach(v => {
        state.vectorOnList.add(v);
      });
      return Object.assign({}, state, {
        this_vector_list: this_vector_list,
        ...action.savedSelectionReducers,
        fragmentDisplayList: state.fragmentDisplayList,
        complexList: state.complexList,
        vectorOnList: state.vectorOnList
      });

    case actions.RESET_SELECTION_STATE:
      console.log('RESET_SELECTION_STATE');
      state.fragmentDisplayList.clear();
      state.complexList.clear();
      state.vectorOnList.clear();
      return Object.assign({}, state, {
        ...INITIAL_STATE,
        fragmentDisplayList: state.fragmentDisplayList,
        complexList: state.complexList,
        vectorOnList: state.vectorOnList
      });

    case constants.INCREMENT_COUNT_OF_PENDING_VECTOR_LOAD_REQUESTS: {
      return Object.assign({}, state, {
        countOfPendingVectorLoadRequests: state.countOfPendingVectorLoadRequests + 1
      });
    }
    case constants.DECREMENT_COUNT_OF_PENDING_VECTOR_LOAD_REQUESTS: {
      return Object.assign({}, state, {
        countOfPendingVectorLoadRequests: state.countOfPendingVectorLoadRequests - 1
      });
    }

    case actions.SET_MOL_GROUP_SELECTION:
      return Object.assign({}, state, {
        mol_group_selection: action.mol_group_selection
      });

    // Cases like: @@redux/INIT
    default:
      return state;
  }
}
