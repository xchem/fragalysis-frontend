/**
 * Created by abradley on 15/03/2018.
 */
import { constants } from './constants';

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
  proteinList: [],
  complexList: [],
  surfaceList: [],
  densityList: [],
  vectorOnList: [],
  currentVector: undefined,
  countOfPendingVectorLoadRequests: 0,
  mol_group_selection: [],
  object_selection: undefined,
  filter: undefined,
  filterSettings: undefined
};

export default function selectionReducers(state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case constants.SET_TO_BUY_LIST:
      return Object.assign({}, state, {
        to_buy_list: action.to_buy_list
      });

    case constants.APPEND_TO_BUY_LIST:
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

    case constants.SET_VECTOR_LIST:
      return Object.assign({}, state, {
        vector_list: action.vector_list
      });

    case constants.REMOVE_FROM_TO_BUY_LIST:
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

    case constants.SET_INITIAL_FULL_GRAPH:
      var input_mol = action.item;
      return Object.assign({}, state, {
        to_query: input_mol.smiles,
        to_query_pk: input_mol.id,
        to_query_sdf_info: input_mol.sdf_info,
        to_query_prot: input_mol.prot_id,
        to_select: {},
        querying: true
      });

    case constants.SET_TO_QUERY:
      return Object.assign({}, state, {
        to_query: action.to_query
      });

    case constants.UPDATE_FULL_GRAPH:
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

    case constants.SELECT_VECTOR:
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

    case constants.SET_FRAGMENT_DISPLAY_LIST:
      let newFragmentSet = new Set();
      action.fragmentDisplayList.forEach(f => {
        newFragmentSet.add(f);
      });

      return Object.assign({}, state, {
        fragmentDisplayList: [...newFragmentSet]
      });

    case constants.APPEND_FRAGMENT_DISPLAY_LIST:
      return Object.assign({}, state, {
        fragmentDisplayList: [...new Set([...state.fragmentDisplayList, action.item.id])]
      });

    case constants.REMOVE_FROM_FRAGMENT_DISPLAY_LIST:
      let diminishedFragmentList = new Set(state.fragmentDisplayList);
      diminishedFragmentList.delete(action.item.id);
      return Object.assign({}, state, {
        fragmentDisplayList: [...diminishedFragmentList]
      });

    case constants.SET_PROTEIN_LIST:
      let newProteinList = new Set();
      action.proteinList.forEach(f => {
        newProteinList.add(f);
      });
      return Object.assign({}, state, { proteinList: [...newProteinList] });

    case constants.APPEND_PROTEIN_LIST:
      return Object.assign({}, state, { proteinList: [...new Set([...state.proteinList, action.item.id])] });

    case constants.REMOVE_FROM_PROTEIN_LIST:
      let diminishedProteinList = new Set(state.proteinList);
      diminishedProteinList.delete(action.item.id);
      return Object.assign({}, state, { proteinList: [...diminishedProteinList] });

    case constants.SET_COMPLEX_LIST:
      let newComplexList = new Set();
      action.complexList.forEach(f => {
        newComplexList.add(f);
      });
      return Object.assign({}, state, { complexList: [...newComplexList] });

    case constants.APPEND_COMPLEX_LIST:
      return Object.assign({}, state, { complexList: [...new Set([...state.complexList, action.item.id])] });

    case constants.REMOVE_FROM_COMPLEX_LIST:
      let diminishedComplexList = new Set(state.complexList);
      diminishedComplexList.delete(action.item.id);
      return Object.assign({}, state, { complexList: [...diminishedComplexList] });

    case constants.SET_SURFACE_LIST:
      let newSurfaceList = new Set();
      action.surfaceList.forEach(f => {
        newSurfaceList.add(f);
      });
      return Object.assign({}, state, { surfaceList: [...newSurfaceList] });

    case constants.APPEND_SURFACE_LIST:
      return Object.assign({}, state, { surfaceList: [...new Set([...state.surfaceList, action.item.id])] });

    case constants.REMOVE_FROM_SURFACE_LIST:
      let diminishedSurfaceList = new Set(state.surfaceList);
      diminishedSurfaceList.delete(action.item.id);
      return Object.assign({}, state, { surfaceList: [...diminishedSurfaceList] });

    case constants.SET_DENSITY_LIST:
      let newDensityList = new Set();
      action.densityList.forEach(f => {
        newDensityList.add(f);
      });
      return Object.assign({}, state, { densityList: [...newDensityList] });

    case constants.APPEND_DENSITY_LIST:
      return Object.assign({}, state, { densityList: [...new Set([...state.densityList, action.item.id])] });

    case constants.REMOVE_FROM_DENSITY_LIST:
      let diminishedDensityList = new Set(state.densityList);
      diminishedDensityList.delete(action.item.id);
      return Object.assign({}, state, { densityList: [...diminishedDensityList] });

    case constants.SET_VECTOR_ON_LIST:
      let newVectorOnList = new Set();

      action.vectorOnList.forEach(v => {
        newVectorOnList.add(v);
      });
      return Object.assign({}, state, { vectorOnList: [...newVectorOnList] });

    case constants.APPEND_VECTOR_ON_LIST:
      return Object.assign({}, state, { vectorOnList: [action.item.id] });

    case constants.REMOVE_FROM_VECTOR_ON_LIST:
      let diminishedVectorOnList = new Set(state.vectorOnList);
      diminishedVectorOnList.delete(action.item.id);
      return Object.assign({}, state, { vectorOnList: [...diminishedVectorOnList], currentVector: undefined });

    case constants.SET_BOND_COLOR_MAP:
      return Object.assign({}, state, {
        bondColorMap: action.bondColorMap
      });

    case constants.RELOAD_SELECTION_REDUCER:
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

    case constants.RESET_SELECTION_STATE:
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

    case constants.SET_MOL_GROUP_SELECTION:
      return Object.assign({}, state, {
        mol_group_selection: action.mol_group_selection
      });
    case constants.SET_OBJECT_SELECTION:
      return Object.assign({}, state, {
        object_selection: action.payload
      });

    case constants.SET_FILTER:
      return Object.assign({}, state, {
        filter: action.payload
      });

    case constants.SET_FILTER_SETTINGS:
      return Object.assign({}, state, {
        filterSettings: action.payload
      });

    // Cases like: @@redux/INIT
    default:
      return state;
  }
}
