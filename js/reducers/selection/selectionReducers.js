/**
 * Created by abradley on 15/03/2018.
 */
import { constants } from './constants';

export const INITIAL_STATE = {
  to_buy_list: [],
  vector_list: [],
  fragmentDisplayList: [],
  proteinList: [],
  complexList: [],
  surfaceList: [],
  densityList: [],
  densityListCustom: [],
  qualityList: [],
  informationList: [],
  vectorOnList: [],
  countOfPendingVectorLoadRequests: 0,
  mol_group_selection: [],
  object_selection: undefined,
  filter: undefined,
  moleculeAllSelection: [],
  moleculeAllTypeSelection: [],

  categoryList: [],
  tagList: [],
  selectedTagList: [],
  specialTagList: [],

  compoundsOfVectors: null, // list of all vector's compounds to pick
  // compoundsOfVectors: {
  //   [vectorID] :{}  // this object replaces to_select, based on vector smile
  // }
  bondColorMapOfVectors: null, // list of all vector's compounds to pick
  // bondColorMapOfVectors: {
  //   [vectorID] :{}  // based on currentVector  (smile)
  // }
  currentVector: null // selected vector smile (ID) of compoundsOfVectors
};

export function selectionReducers(state = INITIAL_STATE, action = {}) {
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

    case constants.SET_CURRENT_VECTOR:
      return Object.assign({}, state, {
        currentVector: action.payload
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

    case constants.SET_DENSITY_LIST_CUSTOM:
      let newDensityListCustom = new Set();
      action.densityListCustom.forEach(f => {
        newDensityListCustom.add(f);
      });
      return Object.assign({}, state, { densityListCustom: [...newDensityListCustom] });

    case constants.APPEND_DENSITY_LIST_CUSTOM:
      return Object.assign({}, state, {
        densityListCustom: [...new Set([...state.densityListCustom, action.item.id])]
      });

    case constants.REMOVE_FROM_DENSITY_LIST_CUSTOM:
      let diminishedDensityListCustom = new Set(state.densityListCustom);
      diminishedDensityListCustom.delete(action.item.id);
      return Object.assign({}, state, { densityListCustom: [...diminishedDensityListCustom] });

    case constants.SET_QUALITY_LIST:
      let newQualityList = new Set();
      action.qualityList.forEach(f => {
        newQualityList.add(f);
      });
      return Object.assign({}, state, { qualityList: [...newQualityList] });

    case constants.APPEND_QUALITY_LIST:
      return Object.assign({}, state, { qualityList: [...new Set([...state.qualityList, action.item.id])] });

    case constants.REMOVE_FROM_QUALITY_LIST:
      let diminishedQualityList = new Set(state.qualityList);
      diminishedQualityList.delete(action.item.id);
      return Object.assign({}, state, { qualityList: [...diminishedQualityList] });

    case constants.APPEND_INFORMATION_LIST:
      return Object.assign({}, state, { informationList: [...new Set([...state.informationList, action.item.id])] });

    case constants.REMOVE_FROM_INFORMATION_LIST:
      let diminishedInformationList = new Set(state.informationList);
      diminishedInformationList.delete(action.item.id);
      return Object.assign({}, state, { informationList: [...diminishedInformationList] });

    case constants.SET_VECTOR_ON_LIST:
      let newVectorOnList = new Set();

      action.vectorOnList.forEach(v => {
        newVectorOnList.add(v);
      });
      return Object.assign({}, state, { vectorOnList: [...newVectorOnList] });

    case constants.APPEND_VECTOR_ON_LIST:
      return Object.assign({}, state, { vectorOnList: [...new Set([...state.vectorOnList, action.item.id])] });

    case constants.REMOVE_FROM_VECTOR_ON_LIST:
      let diminishedVectorOnList = new Set(state.vectorOnList);
      diminishedVectorOnList.delete(action.item.id);
      return Object.assign({}, state, {
        vectorOnList: [...diminishedVectorOnList],
        currentVector: action.item.id === state.currentVector ? null : state.currentVector
      });

    case constants.RELOAD_SELECTION_REDUCER:
      let newFraments = new Set();
      action.payload.fragmentDisplayList.forEach(f => {
        newFraments.add(f);
      });
      let newProteins = new Set();
      action.payload.proteinList.forEach(p => {
        newProteins.add(p);
      });
      let newComplexes = new Set();
      action.payload.complexList.forEach(c => {
        newComplexes.add(c);
      });
      let newSurfaces = new Set();
      action.payload.surfaceList.forEach(s => {
        newSurfaces.add(s);
      });
      let newDensities = new Set();
      action.payload.densityList.forEach(d => {
        newDensities.add(d);
      });
      let newVectors = new Set();
      action.payload.vectorOnList.forEach(v => {
        newVectors.add(v);
      });

      return Object.assign({}, state, {
        ...action.payload,
        fragmentDisplayList: [...newFraments],
        proteinList: [...newProteins],
        complexList: [...newComplexes],
        surfaceList: [...newSurfaces],
        densityList: [...newDensities],
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

    case constants.RESET_COMPOUNDS_OF_VECTORS:
      return Object.assign({}, state, {
        compoundsOfVectors: null
      });

    case constants.UPDATE_VECTOR_COMPOUNDS:
      let compoundsOfVectors = JSON.parse(JSON.stringify(state.compoundsOfVectors));
      if (!compoundsOfVectors) {
        compoundsOfVectors = {};
      }
      compoundsOfVectors[action.payload.key] = action.payload.value;

      return Object.assign({}, state, {
        compoundsOfVectors: compoundsOfVectors
      });

    case constants.RESET_BOND_COLOR_MAP_OF_VECTORS:
      return Object.assign({}, state, {
        bondColorMapOfVectors: null
      });

    case constants.UPDATE_BOND_COLOR_MAP_OF_COMPOUNDS:
      let bondColorMapOfVectors = JSON.parse(JSON.stringify(state.bondColorMapOfVectors));
      if (!bondColorMapOfVectors) {
        bondColorMapOfVectors = {};
      }
      bondColorMapOfVectors[action.payload.key] = action.payload.value;

      return Object.assign({}, state, {
        bondColorMapOfVectors
      });

    case constants.SET_SELECTED_ALL:
      return Object.assign({}, state, {
        moleculeAllSelection: [...new Set([...state.moleculeAllSelection, action.item.id])]
      });

    case constants.SET_DESELECTED_ALL:
      let selectedMolecules = new Set(state.moleculeAllSelection);
      selectedMolecules.delete(action.item.id);
      return Object.assign({}, state, {
        moleculeAllSelection: [...selectedMolecules]
      });

    case constants.SET_SELECTED_ALL_BY_TYPE:
      return Object.assign({}, state, {
        moleculeAllTypeSelection: action.payload.type
      });

    case constants.SET_DESELECTED_ALL_BY_TYPE:
      return Object.assign({}, state, {
        moleculeAllTypeSelection: action.payload.type
      });

    case constants.SET_HIDE_ALL:
      return state;

    case constants.SET_CATEGORY_LIST:
      let newCategoryList = new Set();
      action.categoryList.forEach(f => {
        newCategoryList.add(f);
      });
      return Object.assign({}, state, { categoryList: [...newCategoryList] });

    case constants.APPEND_CATEGORY_LIST:
      return Object.assign({}, state, { categoryList: [...new Set([...state.categoryList, action.item])] });

    case constants.REMOVE_FROM_CATEGORY_LIST:
      let diminishedCategoryList = new Set(state.categoryList);
      diminishedCategoryList.delete(action.item);
      return Object.assign({}, state, { categoryList: [...diminishedCategoryList] });

    case constants.SET_SPECIAL_TAG_LIST:
      let newSpecialTagList = new Set();
      action.tagList.forEach(f => {
        newSpecialTagList.add(f);
      });
      return Object.assign({}, state, { specialTagList: [...newSpecialTagList] });

    case constants.SET_TAG_LIST:
      let newTagList = new Set();
      action.tagList.forEach(f => {
        newTagList.add(f);
      });
      return Object.assign({}, state, { tagList: [...newTagList] });

    case constants.APPEND_TAG_LIST:
      return Object.assign({}, state, { tagList: [...new Set([...state.tagList, action.item])] });

    case constants.REMOVE_FROM_TAG_LIST:
      let diminishedTagList = new Set(state.tagList);
      diminishedTagList.delete(action.item);
      return Object.assign({}, state, { tagList: [...diminishedTagList] });

    case constants.SET_SELECTED_TAG_LIST:
      let newSelectedTagList = new Set();
      action.selectedTagList.forEach(f => {
        newSelectedTagList.add(f);
      });
      return Object.assign({}, state, { selectedTagList: [...newSelectedTagList] });

    case constants.APPEND_SELECTED_TAG_LIST:
      return Object.assign({}, state, { selectedTagList: [...new Set([...state.selectedTagList, action.item])] });

    case constants.REMOVE_FROM_SELECTED_TAG_LIST:
      let diminishedSelectedTagList = new Set(state.selectedTagList);
      diminishedSelectedTagList.delete(action.item);
      return Object.assign({}, state, { selectedTagList: [...diminishedSelectedTagList] });

    // Cases like: @@redux/INIT
    default:
      return state;
  }
}
