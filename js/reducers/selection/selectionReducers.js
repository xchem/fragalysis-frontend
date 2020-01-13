/**
 * Created by abradley on 15/03/2018.
 */
import * as actions from '../actonTypes';
import { constants } from './selectionConstants';

export const INITIAL_STATE = {
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
  bondColorMap: undefined,
  complexList: [],
  vectorOnList: [],
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
        return Object.assign({}, state);
      }

    case actions.SET_INITIAL_FULL_GRAPH:
      var input_mol = action.item;
      return Object.assign({}, state, {
        to_query: input_mol.smiles,
        to_query_pk: input_mol.id,
        to_query_sdf_info: input_mol.sdf_info,
        to_query_prot: input_mol.prot_id,
        to_select: {},
        querying: true
      });

    case actions.SET_TO_QUERY:
      return Object.assign({}, state, {
        to_query: action.to_query
      });

    case actions.UPDATE_FULL_GRAPH:
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
      let newFragmentSet = new Set();
      action.fragmentDisplayList.forEach(f => {
        newFragmentSet.add(f);
      });

      return Object.assign({}, state, {
        fragmentDisplayList: [...newFragmentSet]
      });

    case actions.APPEND_FRAGMENT_DISPLAY_LIST:
      console.log('APPEND_FRAGMENT_DISPLAY_LIST');
      return Object.assign({}, state, {
        fragmentDisplayList: [...new Set([...state.fragmentDisplayList, action.item.id])]
      });

    case actions.REMOVE_FROM_FRAGMENT_DISPLAY_LIST:
      console.log('REMOVE_FROM_FRAGMENT_DISPLAY_LIST');
      let diminishedFragmentList = new Set(state.fragmentDisplayList);
      diminishedFragmentList.delete(action.item.id);
      return Object.assign({}, state, {
        fragmentDisplayList: [...diminishedFragmentList]
      });

    case actions.SET_COMPLEX_LIST:
      let newComplexList = new Set();
      action.complexList.forEach(f => {
        newComplexList.add(f);
      });
      return Object.assign({}, state, { complexList: [...newComplexList] });

    case actions.APPEND_COMPLEX_LIST:
      return Object.assign({}, state, { complexList: [...new Set([...state.complexList, action.item.id])] });

    case actions.REMOVE_FROM_COMPLEX_LIST:
      let diminishedComplexList = new Set(state.complexList);
      diminishedComplexList.delete(action.item.id);
      return Object.assign({}, state, { complexList: [...diminishedComplexList] });

    case actions.SET_VECTOR_ON_LIST:
      let newVectorOnList = new Set();

      action.vectorOnList.forEach(v => {
        newVectorOnList.add(v);
      });
      return Object.assign({}, state, { vectorOnList: [...newVectorOnList] });

    case actions.APPEND_VECTOR_ON_LIST:
      return Object.assign({}, state, { vectorOnList: [action.item.id] });

    case actions.REMOVE_FROM_VECTOR_ON_LIST:
      let diminishedVectorOnList = new Set(state.vectorOnList);
      diminishedVectorOnList.delete(action.item.id);
      return Object.assign({}, state, { vectorOnList: [...diminishedVectorOnList] });

    case actions.SET_HIGHLIGHTED:
      return Object.assign({}, state, {
        highlightedCompound: action.highlightedCompound
      });

    case actions.SET_COMPOUND_CLASSES:
      return Object.assign({}, state, {
        compoundClasses: action.compoundClasses,
        currentCompoundClass: action.currentCompoundClass
      });

    case actions.SET_BOND_COLOR_MAP:
      return Object.assign({}, state, {
        bondColorMap: action.bondColorMap
      });

    case actions.RELOAD_SELECTION_REDUCER:
      var this_vector_list = {};
      for (var to_select_item in action.savedSelectionReducers.to_select) {
        if (to_select_item === action.savedSelectionReducers.currentVector) {
          this_vector_list[to_select_item] = action.savedSelectionReducers.to_select[to_select_item];
        }
      }
      let newFraments = new Set();
      action.savedSelectionReducers.fragmentDisplayList.forEach(f => {
        newFraments.add(f);
      });
      let newComplexes = new Set();
      action.savedSelectionReducers.complexList.forEach(c => {
        newComplexes.add(c);
      });
      let newVectors = new Set();
      action.savedSelectionReducers.vectorOnList.forEach(v => {
        newVectors.add(v);
      });
      return Object.assign({}, state, {
        this_vector_list: this_vector_list,
        ...action.savedSelectionReducers,
        fragmentDisplayList: [...newFraments],
        complexList: [...newComplexes],
        vectorOnList: [...newVectors]
      });

    case actions.RESET_SELECTION_STATE:
      console.log('RESET_SELECTION_STATE');
      return INITIAL_STATE;

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
