import { constants } from './constants';

export const INITIAL_STATE = {
  datasets: [], // list of dataset objects
  moleculeLists: {}, // map of $datasetID and its $moleculeList
  isLoadingMoleculeList: false,
  scoreDatasetMap: {}, // map of $datasetID and its $scoreList
  scoreCompoundMap: {}, // map of $compoundID and its $scoreList

  selectedDatasetIndex: 0,
  tabValue: 0,

  // filter
  filterDatasetMap: {}, // map of $datasetID and its $filterSettings
  filterPropertiesDatasetMap: {}, // map of $datasetID and its $filterProperties
  filterDialogOpen: false,
  filteredScoreProperties: {}, // map of $datasetID and its $scoreList
  filterWithInspirations: false,

  // control buttons
  ligandLists: {}, // map of $datasetID and its $list
  proteinLists: {}, // map of $datasetID and its $list
  complexLists: {}, // map of $datasetID and its $list
  surfaceLists: {}, // map of $datasetID and its $list
  inspirationLists: {}, // map of $datasetID and its $list

  moleculeAllSelection: {},
  moleculeAllTypeSelection: {},

  // search
  searchString: null,

  // inspirations
  isOpenInspirationDialog: false,
  inspirationFragmentList: [],
  isLoadingInspirationListOfMolecules: false,
  inspirationMoleculeDataList: [],
  allInspirationMoleculeDataList: [],
  allInspirations: {},

  // cross reference
  isOpenCrossReferenceDialog: false,
  crossReferenceCompoundName: null,
  isLoadingCrossReferenceScores: false,
  crossReferenceCompoundsDataList: [],

  // shopping cart
  compoundsToBuyDatasetMap: {} // map of $datasetID and its list of moleculeID
};

/**
 * Helper function to set list for given container and dataset
 *
 * @param {string} listsName 'alteringLists' (ligandLists, ..)
 * @param {*} datasetId
 * @param {*} list action.givenList
 */
const setList = (state, listsName, datasetId, list) => {
  let newListSet = new Set();
  list.forEach(element => {
    newListSet.add(element);
  });

  const newState = Object.assign({}, state);
  newState[listsName][datasetId] = [...newListSet];

  return newState;
};

/**
 * Helper function to add item to list for given container and dataset
 *
 * @param {string} listsName 'alteringLists' (ligandLists, ..)
 * @param {*} datasetId
 * @param {*} itemId action.item.id
 */
const appendToList = (state, listsName, datasetId, itemId) => {
  const newState = Object.assign({}, state);

  newState[listsName][datasetId] = [...new Set([...newState[listsName][datasetId], itemId])];

  return newState;
};

/**
 * Helper function to remove item from list for given container and dataset
 *
 * @param {string} listsName 'alteringLists' (ligandLists, ..)
 * @param {*} datasetId
 * @param {*} itemId action.item.id
 */
const removeFromList = (state, listsName, datasetId, itemId) => {
  const newState = Object.assign({}, state);

  let diminishedLigandList = new Set(newState[listsName][datasetId]);
  diminishedLigandList.delete(itemId);
  newState[listsName][datasetId] = [...diminishedLigandList];

  return newState;
};

const reloadLists = (state, listsName) => {
  const lists = {};
  for (const datasetID in state[listsName]) {
    const list = [];
    for (const itemId of state[listsName][datasetID]) {
      list.push(itemId);
    }

    lists[datasetID] = list;
  }
  return lists;
};

/**
 * Initialize all control containers for given dataset
 *
 * @param {Object} state
 * @param {Number} datasetID
 */
const initializeContainerLists = (state, datasetID) => {
  //The lists might be already initialized (loading state)
  state.ligandLists[datasetID] = state.ligandLists[datasetID] || [];
  state.proteinLists[datasetID] = state.proteinLists[datasetID] || [];
  state.complexLists[datasetID] = state.complexLists[datasetID] || [];
  state.surfaceLists[datasetID] = state.surfaceLists[datasetID] || [];
  state.inspirationLists[datasetID] = state.inspirationLists[datasetID] || [];
  state.moleculeAllSelection[datasetID] = state.moleculeAllSelection[datasetID] || [];
  return state;
};

export const datasetsReducers = (state = INITIAL_STATE, action = {}) => {
  switch (action.type) {
    case constants.ADD_DATASET:
      const increasedDatasets = state.datasets.slice();
      increasedDatasets.push(action.payload);

      return Object.assign({}, state, { datasets: increasedDatasets });

    case constants.SET_DATASET:
      return Object.assign({}, state, { datasets: action.payload });

    case constants.REPLACE_ALL_MOLECULELISTS:
      return { ...state, moleculeLists: action.payload };

    case constants.ADD_MOLECULELIST:
      // initialize also control containers
      const initializedState = initializeContainerLists(state, action.payload.datasetID);
      action.payload.moleculeList.forEach(mol => (mol.numerical_scores['_id'] = mol.id));
      return Object.assign({}, initializedState, {
        moleculeLists: { ...initializedState.moleculeLists, [action.payload.datasetID]: action.payload.moleculeList }
      });

    case constants.REMOVE_MOLECULELIST:
      const decreasedMolecules = Object.assign({}, state.moleculeLists);
      if (decreasedMolecules[action.payload] !== undefined) {
        delete decreasedMolecules[action.payload];
      }
      return Object.assign({}, state, { moleculeLists: decreasedMolecules });

    case constants.SET_FILTER_WITH_INSPIRATIONS:
      return Object.assign({}, state, { filterWithInspirations: action.payload });

    case constants.SET_IS_LOADING_MOLECULE_LIST:
      return Object.assign({}, state, { isLoadingMoleculeList: action.payload });

    case constants.SET_SELECTED_DATASET_INDEX:
      return Object.assign({}, state, { selectedDatasetIndex: action.payload.value });

    case constants.SET_TAB_VALUE:
      return Object.assign({}, state, { tabValue: action.payload.value });

    case constants.SET_FILTER_SETTINGS:
      const { datasetID, filter } = action.payload;
      return { ...state, filterDatasetMap: { ...state.filterDatasetMap, [datasetID]: filter } };

    case constants.SET_FILTER_PROPERTIES:
      return {
        ...state,
        filterPropertiesDatasetMap: {
          ...state.filterPropertiesDatasetMap,
          [action.payload.datasetID]: action.payload.properties
        }
      };

    case constants.SET_FILTER_DIALOG_OPEN:
      return Object.assign({}, state, { filterDialogOpen: action.payload });

    case constants.SET_LIGAND_LIST:
      return setList(state, 'ligandLists', action.payload.datasetID, action.payload.ligandList);

    case constants.APPEND_LIGAND_LIST:
      return appendToList(state, 'ligandLists', action.payload.datasetID, action.payload.item.id);

    case constants.REMOVE_FROM_LIGAND_LIST:
      return removeFromList(state, 'ligandLists', action.payload.datasetID, action.payload.item.id);

    case constants.SET_PROTEIN_LIST:
      return setList(state, 'proteinLists', action.payload.datasetID, action.payload.proteinList);

    case constants.APPEND_PROTEIN_LIST:
      return appendToList(state, 'proteinLists', action.payload.datasetID, action.payload.item.id);

    case constants.REMOVE_FROM_PROTEIN_LIST:
      return removeFromList(state, 'proteinLists', action.payload.datasetID, action.payload.item.id);

    case constants.SET_COMPLEX_LIST:
      return setList(state, 'complexLists', action.payload.datasetID, action.payload.complexList);

    case constants.APPEND_COMPLEX_LIST:
      return appendToList(state, 'complexLists', action.payload.datasetID, action.payload.item.id);

    case constants.REMOVE_FROM_COMPLEX_LIST:
      return removeFromList(state, 'complexLists', action.payload.datasetID, action.payload.item.id);

    case constants.SET_SURFACE_LIST:
      return setList(state, 'surfaceLists', action.payload.datasetID, action.payload.surfaceList);

    case constants.APPEND_SURFACE_LIST:
      return appendToList(state, 'surfaceLists', action.payload.datasetID, action.payload.item.id);

    case constants.REMOVE_FROM_SURFACE_LIST:
      return removeFromList(state, 'surfaceLists', action.payload.datasetID, action.payload.item.id);

    case constants.SET_INSPIRATION_LIST:
      return setList(state, 'inspirationLists', action.payload.datasetID, action.payload.inspirationList);

    case constants.APPEND_INSPIRATION_LIST:
      return appendToList(state, 'inspirationLists', action.payload.datasetID, action.payload.itemID);

    case constants.REMOVE_FROM_INSPIRATION_LIST:
      return removeFromList(state, 'inspirationLists', action.payload.datasetID, action.payload.itemID);

    case constants.APPEND_TO_SCORE_DATASET_MAP:
      return Object.assign({}, state, {
        scoreDatasetMap: {
          ...state.scoreDatasetMap,
          [action.payload.datasetID]: {
            ...state.scoreDatasetMap[action.payload.datasetID],
            [action.payload.score.name]: action.payload.score
          }
        }
      });

    case constants.REMOVE_FROM_SCORE_DATASET_MAP:
      const diminishedScoreDatasetMap = JSON.parse(JSON.stringify(state.scoreDatasetMap));
      delete diminishedScoreDatasetMap[action.payload];
      return Object.assign({}, state, { scoreDatasetMap: diminishedScoreDatasetMap });

    case constants.APPEND_TO_SCORE_COMPOUND_MAP_BY_SCORE_CATEGORY:
      const extendedScoreCompoundMap = JSON.parse(JSON.stringify(state.scoreCompoundMap));

      action.payload.forEach(score => {
        let array = [];
        if (extendedScoreCompoundMap && extendedScoreCompoundMap[score.compound]) {
          array = extendedScoreCompoundMap[score.compound];
        }
        array.push(score);
        extendedScoreCompoundMap[score.compound] = array;
      });

      return Object.assign({}, state, { scoreCompoundMap: extendedScoreCompoundMap });

    case constants.APPEND_TO_SCORE_COMPOUND_MAP:
      const currentScoreCompoundMap = JSON.parse(JSON.stringify(state.scoreCompoundMap));
      currentScoreCompoundMap[action.payload.key] = action.payload.value;
      return Object.assign({}, state, { scoreCompoundMap: currentScoreCompoundMap });

    case constants.REMOVE_FROM_SCORE_COMPOUND_MAP:
      const diminishedScoreCompoundMap = JSON.parse(JSON.stringify(state.scoreCompoundMap));
      delete diminishedScoreCompoundMap[action.payload];
      return Object.assign({}, state, { scoreCompoundMap: diminishedScoreCompoundMap });

    case constants.CLEAR_SCORE_COMPOUND_MAP:
      return Object.assign({}, state, { scoreCompoundMap: {} });

    case constants.UPDATE_FILTER_SHOWED_SCORE_PROPERTIES:
      if (state.filteredScoreProperties[action.payload.datasetID]) {
        return {...state};
      } else {
        return {
          ...state,
          filteredScoreProperties: {
            ...state.filteredScoreProperties,
            [action.payload.datasetID]: action.payload.scoreList
          }
        };
      };

    case constants.REMOVE_FROM_FILTER_SHOWED_SCORE_PROPERTIES:
      const diminishedFilterShowedScoreProperties = JSON.parse(JSON.stringify(state.filteredScoreProperties));
      delete diminishedFilterShowedScoreProperties[action.payload];
      return Object.assign({}, state, { filteredScoreProperties: diminishedFilterShowedScoreProperties });

    case constants.SET_SEARCH_STRING:
      return Object.assign({}, state, { searchString: action.payload });

    case constants.SET_IS_OPEN_INSPIRATION_DIALOG:
      return Object.assign({}, state, { isOpenInspirationDialog: action.payload });

    case constants.SET_IS_OPEN_CROSS_REFERENCE_DIALOG:
      return Object.assign({}, state, { isOpenCrossReferenceDialog: action.payload });

    case constants.SET_CROSS_REFERENCE_COMPOUND_NAME:
      return Object.assign({}, state, { crossReferenceCompoundName: action.payload });

    case constants.SET_IS_LOADING_CROSS_REFERENCE_SCORES:
      return Object.assign({}, state, { isLoadingCrossReferenceScores: action.payload });

    case constants.SET_IS_LOADING_INSPIRATION_LIST_OF_MOLECULES:
      return Object.assign({}, state, { isLoadingInspirationListOfMolecules: action.payload });

    case constants.SET_INSPIRATION_MOLECULE_DATA_LIST:
      return Object.assign({}, state, { inspirationMoleculeDataList: action.payload });

    case constants.SET_ALL_INSPIRATION_MOLECULE_DATA_LIST:
      return Object.assign({}, state, { allInspirationMoleculeDataList: action.payload });

    case constants.APPEND_TO_INSPIRATION_MOLECULE_DATA_LIST:
      const extendedInspirationMoleculeDataList = new Set(state.inspirationMoleculeDataList);
      extendedInspirationMoleculeDataList.add(action.payload);
      return Object.assign({}, state, { inspirationMoleculeDataList: [...extendedInspirationMoleculeDataList] });

    case constants.APPEND_TO_ALL_INSPIRATION_MOLECULE_DATA_LIST:
      const molecules = new Set(state.allInspirationMoleculeDataList);
      if (!molecules.has(action.payload)) {
        molecules.add(action.payload);
      }
      return Object.assign({}, state, { allInspirationMoleculeDataList: [...molecules] });

    case constants.REMOVE_FROM_INSPIRATION_MOLECULE_DATA_LIST:
      const diminishedInspirationMoleculeDataList = new Set(state.inspirationMoleculeDataList);

      let foundedItem;
      diminishedInspirationMoleculeDataList.forEach(item => {
        if (item && item.id === action.payload) {
          foundedItem = item;
        }
      });
      if (foundedItem) {
        diminishedInspirationMoleculeDataList.delete(foundedItem);
      }
      return Object.assign({}, state, { inspirationMoleculeDataList: [...extendedInspirationMoleculeDataList] });

    case constants.SET_INSPIRATION_FRAGMENT_LIST:
      return Object.assign({}, state, { inspirationFragmentList: action.payload });

    case constants.REMOVE_FROM_INSPIRATION_FRAGMENT_LIST:
      const diminishedInspirationFragmentList = new Set(state.inspirationFragmentList);

      let foundtem;
      diminishedInspirationFragmentList.forEach(item => {
        if (item === action.payload) {
          foundtem = item;
        }
      });
      if (foundtem) {
        diminishedInspirationFragmentList.delete(foundtem);
      }
      return Object.assign({}, state, { inspirationFragmentList: [...diminishedInspirationFragmentList] });

    case constants.SET_ALL_INSPIRATIONS:
      return { ...state, allInspirations: action.payload };

    case constants.APPEND_MOLECULE_TO_COMPOUNDS_TO_BUY_OF_DATASET:
      const setOfMolecules = new Set(state.compoundsToBuyDatasetMap[action.payload.datasetID]);
      setOfMolecules.add(action.payload.moleculeID);
      return {
        ...state,
        compoundsToBuyDatasetMap: {
          ...state.compoundsToBuyDatasetMap,
          [action.payload.datasetID]: [...setOfMolecules]
        }
      };

    case constants.REMOVE_MOLECULE_FROM_COMPOUNDS_TO_BUY_OF_DATASET:
      const listOfMolecules = new Set(state.compoundsToBuyDatasetMap[action.payload.datasetID]);
      listOfMolecules.delete(action.payload.moleculeID);
      return {
        ...state,
        compoundsToBuyDatasetMap: {
          ...state.compoundsToBuyDatasetMap,
          [action.payload.datasetID]: [...listOfMolecules]
        }
      };

    case constants.RELOAD_DATASETS_REDUCER:
      const lists = {
        ligandLists: reloadLists(action.payload, 'ligandLists'),
        proteinLists: reloadLists(action.payload, 'proteinLists'),
        complexLists: reloadLists(action.payload, 'complexLists'),
        surfaceLists: reloadLists(action.payload, 'surfaceLists'),
        inspirationLists: reloadLists(action.payload, 'inspirationLists'),

        compoundsToBuyDatasetMap: reloadLists(action.payload, 'compoundsToBuyDatasetMap')
      };

      return Object.assign({}, state, lists);

    case constants.RESET_DATASETS_STATE:
      const datasetsLists = {
        ligandLists: reloadLists([], 'ligandLists'),
        proteinLists: reloadLists([], 'proteinLists'),
        complexLists: reloadLists([], 'complexLists'),
        surfaceLists: reloadLists([], 'surfaceLists'),
        inspirationLists: reloadLists([], 'inspirationLists'),
        compoundsToBuyDatasetMap: reloadLists([], 'compoundsToBuyDatasetMap')
      };
      return Object.assign({}, state, { ...INITIAL_STATE, ...datasetsLists });

    case constants.SET_SELECTED_ALL:
      return appendToList(state, 'moleculeAllSelection', action.payload.datasetID, action.payload.item.id);

    case constants.SET_DESELECTED_ALL:
      return removeFromList(state, 'moleculeAllSelection', action.payload.datasetID, action.payload.item.id);

    case constants.SET_SELECTED_ALL_BY_TYPE:
      return Object.assign({}, state, {
        moleculeAllTypeSelection: action.payload.type
      });

    case constants.SET_DESELECTED_ALL_BY_TYPE:
      return Object.assign({}, state, {
        moleculeAllTypeSelection: action.payload.type
      });
    default:
      return state;
  }
};
