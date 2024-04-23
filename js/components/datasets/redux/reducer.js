import { compoundsColors } from '../../preview/compounds/redux/constants';
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
  compoundsToBuyDatasetMap: {}, // map of $datasetID and its list of moleculeID
  selectedCompoundsByDataset: {}, // map of $datasetID and its list of moleculeID
  compoundColorByDataset: {}, // map of $datasetID and its list of moleculeID

  selectedCompounds: [], // list of selected compounds

  selectedColorsInFilter: {
    [compoundsColors.blue.key]: compoundsColors.blue.key,
    [compoundsColors.red.key]: compoundsColors.red.key,
    [compoundsColors.green.key]: compoundsColors.green.key,
    [compoundsColors.purple.key]: compoundsColors.purple.key,
    [compoundsColors.apricot.key]: compoundsColors.apricot.key
  },

  // drag and drop state
  dragDropMap: {},
  dragDropStatus: {
    inProgress: false,
    startingDragDropState: {},
    startingIndex: -1
  },

  // disables NGL control buttons for molecules
  disableDatasetsNglControlButtons: {}, // datasetID.moleculeID.nglButtonDisableState

  // Used for initially scrolling to firstly selected molecule when loading up a project
  datasetScrolledMap: {},

  isLockVisibleCompoundsDialogOpenGlobal: false,
  isLockVisibleCompoundsDialogOpenLocal: false,
  cmpForLocalLockVisibleCompoundsDialog: null,
  askLockCompoundsQuestion: true,
  editedColorGroup: null,
  askLockSelectedCompoundsQuestion: true,

  //iterator functionality for dataset tabs and also selected compounds tab
  iteratorDatasets: {},
  iteratorSelectedCompounds: null
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

/**
 *  Helper function which takes the datasetReducers and removes any mention of the given dataset
 */
const removeDatasetFromState = (state, datasetId) => {
  console.log('removeDatasetFromState - start');
  const newState = { ...state };
  Object.keys(state).forEach(key => {
    if (typeof state[key] === 'object') {
      if (newState[key] && newState[key].hasOwnProperty(datasetId)) {
        delete newState[key][datasetId];
      }
    }
  });

  console.log('removeDatasetFromState - end');
  return newState;
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

    case constants.SET_DATASET_ITERATOR: {
      if (action.payload.currentCmp) {
        return {
          ...state,
          iteratorDatasets: { ...state.iteratorDatasets, [action.payload.datasetID]: { ...action.payload.currentCmp } }
        };
      } else {
        return {
          ...state,
          iteratorDatasets: { ...state.iteratorDatasets, [action.payload.datasetID]: null }
        };
      }
    }

    case constants.SET_SELECTED_COMPOUNDS_ITERATOR: {
      if (action.payload) {
        return { ...state, iteratorSelectedCompounds: { ...action.payload } };
      } else {
        return { ...state, iteratorSelectedCompounds: null };
      }
    }

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
      //why is this implemeted like this? I think it should be implemented like my uncommented implementation
      // if (state.filteredScoreProperties[action.payload.datasetID]) {
      //   return { ...state };
      // } else {
      //   return {
      //     ...state,
      //     filteredScoreProperties: {
      //       ...state.filteredScoreProperties,
      //       [action.payload.datasetID]: action.payload.scoreList
      //     }
      //   };
      // }
      // if (state.filteredScoreProperties[action.payload.datasetID]) {
      return {
        ...state,
        filteredScoreProperties: {
          ...state.filteredScoreProperties,
          [action.payload.datasetID]: action.payload.scoreList
        }
      };
    // } else {
    //   return { ...state };
    // }

    case constants.REMOVE_FROM_FILTER_SHOWED_SCORE_PROPERTIES:
      const diminishedFilterShowedScoreProperties = JSON.parse(JSON.stringify(state.filteredScoreProperties));
      delete diminishedFilterShowedScoreProperties[action.payload];
      return Object.assign({}, state, { filteredScoreProperties: diminishedFilterShowedScoreProperties });

    case constants.SET_SEARCH_STRING:
      return Object.assign({}, state, { searchString: action.payload.searchString });

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

    case constants.SET_COMPOUND_TO_SELECTED_COMPOUNDS_BY_DATASET:
      return setList(state, 'selectedCompoundsByDataset', action.payload.datasetID, action.payload.selectedCompounds);

    case constants.SET_SELECT_ALL_BUTTON_FOR_DATASET:
      return Object.assign({}, state, { isSelectedSelectAllButtonForDataset: action.payload });

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

    case constants.APPEND_COMPOUND_TO_SELECTED_COMPOUNDS_BY_DATASET:
      const setOfcompounds = new Set(state.selectedCompoundsByDataset[action.payload.datasetID]);
      setOfcompounds.add(action.payload.compoundID);
      return {
        ...state,
        selectedCompoundsByDataset: {
          ...state.selectedCompoundsByDataset,
          [action.payload.datasetID]: [...setOfcompounds]
        }
      };

    case constants.REMOVE_COMPOUND_FROM_SELECTED_COMPOUNDS_BY_DATASET:
      const listOfcompounds = new Set(state.selectedCompoundsByDataset[action.payload.datasetID]);
      listOfcompounds.delete(action.payload.compoundID);
      return {
        ...state,
        selectedCompoundsByDataset: {
          ...state.selectedCompoundsByDataset,
          [action.payload.datasetID]: [...listOfcompounds]
        }
      };

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

    case constants.APPEND_COMPOUND_COLOR_OF_DATASET:
      const setOfCompoundColors = { ...state.compoundColorByDataset[action.payload.datasetID] };
      if (setOfCompoundColors.hasOwnProperty(action.payload.compoundID)) {
        if (!setOfCompoundColors[action.payload.compoundID].includes(action.payload.colorClass)) {
          setOfCompoundColors[action.payload.compoundID] = [
            ...setOfCompoundColors[action.payload.compoundID],
            action.payload.colorClass
          ];
        }
      } else {
        setOfCompoundColors[action.payload.compoundID] = [action.payload.colorClass];
      }
      return {
        ...state,
        compoundColorByDataset: {
          ...state.compoundColorByDataset,
          [action.payload.datasetID]: { ...setOfCompoundColors }
        }
      };

    case constants.REMOVE_COMPOUND_COLOR_OF_DATASET:
      const listOfCompoundColors = { ...state.compoundColorByDataset[action.payload.datasetID] };
      if (listOfCompoundColors.hasOwnProperty(action.payload.compoundID)) {
        const colors = listOfCompoundColors[action.payload.compoundID].filter(c => c !== action.payload.colorClass);
        if (colors.length > 0) {
          listOfCompoundColors[action.payload.compoundID] = [...colors];
        } else {
          delete listOfCompoundColors[action.payload.compoundID];
        }
      }
      return {
        ...state,
        compoundColorByDataset: {
          ...state.compoundColorByDataset,
          [action.payload.datasetID]: { ...listOfCompoundColors }
        }
      };

    case constants.SET_EDITED_COLOR_GROUP:
      return { ...state, editedColorGroup: action.colorGroup };

    case constants.APPEND_COLOR_TO_SELECTED_COLOR_FILTERS:
      const newColorMap = { ...state.selectedColorsInFilter };
      if (!newColorMap.hasOwnProperty(action.payload.colorClass)) {
        newColorMap[action.payload.colorClass] = action.payload.colorClass;
        return { ...state, selectedColorsInFilter: newColorMap };
      } else {
        return state;
      }

    case constants.REMOVE_COLOR_FROM_SELECTED_COLOR_FILTERS:
      const newColorMap2 = { ...state.selectedColorsInFilter };
      if (newColorMap2.hasOwnProperty(action.payload.colorClass)) {
        delete newColorMap2[action.payload.colorClass];
        return { ...state, selectedColorsInFilter: newColorMap2 };
      } else {
        return state;
      }

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

    case constants.SET_SELECTED_BY_TYPE:
      return Object.assign({}, state, {
        moleculeAllTypeSelection: action.payload.type
      });

    case constants.SET_DESELECTED_ALL_BY_TYPE:
      return Object.assign({}, state, {
        moleculeAllTypeSelection: action.payload.type
      });

    case constants.SET_DRAG_DROP_STATE: {
      const { datasetID, dragDropState } = action.payload;
      const dragDropMap = { ...state.dragDropMap, [datasetID]: dragDropState };
      return { ...state, dragDropMap };
    }

    case constants.DRAG_DROP_STARTED: {
      const { datasetID, startIndex } = action.payload;
      const { dragDropMap } = state;
      const dragDropStatus = {
        inProgress: true,
        startingDragDropState: dragDropMap[datasetID],
        startingIndex: startIndex
      };
      return { ...state, dragDropStatus };
    }

    case constants.DRAG_DROP_FINISHED: {
      const dragDropStatus = {
        inProgress: false
      };
      return { ...state, dragDropStatus };
    }

    case constants.DELETE_DATASET: {
      const newState = { ...state, datasets: state.datasets.filter(dataset => dataset.id !== action.datasetId) };
      return removeDatasetFromState(newState, action.datasetId);
    }

    case constants.DISABLE_DATASET_NGL_CONTROL_BUTTON: {
      const { datasetId, moleculeId, type } = action.payload;

      const disableDatasetsNglControlButtons = { ...state.disableDatasetsNglControlButtons };
      const disableDatasetNglControlButtons = { ...(disableDatasetsNglControlButtons[datasetId] || {}) };
      const moleculeNglControlButtons = { ...(disableDatasetNglControlButtons[moleculeId] || {}) };

      moleculeNglControlButtons[type] = true;
      disableDatasetNglControlButtons[moleculeId] = moleculeNglControlButtons;
      disableDatasetsNglControlButtons[datasetId] = disableDatasetNglControlButtons;

      return {
        ...state,
        disableDatasetsNglControlButtons
      };
    }

    case constants.ENABLE_DATASET_NGL_CONTROL_BUTTON: {
      const { datasetId, moleculeId, type } = action.payload;

      const disableDatasetsNglControlButtons = { ...state.disableDatasetsNglControlButtons };
      const disableDatasetNglControlButtons = { ...(disableDatasetsNglControlButtons[datasetId] || {}) };
      const moleculeNglControlButtons = { ...(disableDatasetNglControlButtons[moleculeId] || {}) };

      moleculeNglControlButtons[type] = false;
      disableDatasetNglControlButtons[moleculeId] = moleculeNglControlButtons;
      disableDatasetsNglControlButtons[datasetId] = disableDatasetNglControlButtons;

      return {
        ...state,
        disableDatasetsNglControlButtons
      };
    }

    case constants.SET_IS_OPEN_LOCK_VISIBLE_COMPOUNDS_DIALOG_GLOBAL: {
      return { ...state, isLockVisibleCompoundsDialogOpenGlobal: action.isOpen };
    }

    case constants.SET_IS_OPEN_LOCK_VISIBLE_COMPOUNDS_DIALOG_LOCAL: {
      return { ...state, isLockVisibleCompoundsDialogOpenLocal: action.isOpen };
    }

    case constants.SET_CMP_FOR_LOCAL_LOCK_VISIBLE_COMPOUNDS_DIALOG: {
      return { ...state, cmpForLocalLockVisibleCompoundsDialog: action.cmp };
    }

    case constants.SET_ASK_LOCK_COMPOUNDS_QUESTION: {
      return { ...state, askLockCompoundsQuestion: action.askLockCompoundsQuestion };
    }

    case constants.SET_ASK_LOCK_SELECTED_COMPOUNDS_QUESTION: {
      return { ...state, askLockSelectedCompoundsQuestion: action.askLockCompoundsQuestion };
    }

    case constants.SET_SELECTED_COMPOUNDS_LIST: {
      return { ...state, selectedCompounds: action.compoundsList };
    }

    case constants.RESET_DATASETS_STATE_ON_SNAPSHOT_CHANGE: {
      const {
        datasets,
        moleculeLists,
        scoreDatasetMap,
        scoreCompoundMap,
        allInspirations,
        filteredScoreProperties,
        selectedDatasetIndex,
        tabValue,
        ligandLists,
        proteinLists,
        complexLists,
        surfaceLists
      } = state;

      const newState = {
        ...INITIAL_STATE,
        datasets,
        moleculeLists,
        scoreDatasetMap,
        scoreCompoundMap,
        allInspirations,
        filteredScoreProperties,
        selectedDatasetIndex,
        tabValue,
        inspirationLists: {},
        moleculeAllSelection: {},
        ligandLists,
        proteinLists,
        complexLists,
        surfaceLists
      };

      Object.keys(moleculeLists).forEach(datasetID => initializeContainerLists(newState, datasetID));

      return newState;
    }

    case constants.SET_DATASET_SCROLLED: {
      const datasetId = action.payload;

      return { ...state, datasetScrolledMap: { ...state.datasetScrolledMap, [datasetId]: true } };
    }

    case constants.RESET_DATASET_SCROLLED_MAP: {
      return { ...state, datasetScrolledMap: {} };
    }

    case constants.SET_COMPOUND_SET:
      return Object.assign({}, state, { expandCompoundSet: action.payload });

    case constants.SET_UPDATED_DATASETS:
      return Object.assign({}, state, { updatedDatasets: action.payload.updatedDataset });

    default:
      return state;
  }
};
