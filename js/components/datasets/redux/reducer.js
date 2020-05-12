import { constants } from './constants';

export const INITIAL_STATE = {
  datasets: [], // list of dataset objects
  moleculeLists: {}, // map of $datasetID and its $moleculeList
  isLoadingMoleculeList: false,
  scoreDatasetMap: {}, // map of $datasetID and its $scoreList
  scoreCompoundMap: {}, // map of $compoundID and its $scoreList

  // filter
  filter: undefined,
  filterDialogOpen: false,

  // control buttons
  ligandLists: {}, // map of $datasetID and its $list
  proteinLists: {}, // map of $datasetID and its $list
  complexLists: {}, // map of $datasetID and its $list
  surfaceLists: {} // map of $datasetID and its $list
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

/**
 * Initialize all control containers for given dataset
 *
 * @param {Object} state
 * @param {Number} datasetID
 */
const initializeContainerLists = (state, datasetID) => {
  state.ligandLists[datasetID] = [];
  state.proteinLists[datasetID] = [];
  state.complexLists[datasetID] = [];
  state.surfaceLists[datasetID] = [];
};

export const datasetsReducers = (state = INITIAL_STATE, action = {}) => {
  switch (action.type) {
    case constants.ADD_DATASET:
      const increasedDatasets = state.datasets.slice();
      increasedDatasets.push(action.payload);

      return Object.assign({}, state, { datasets: increasedDatasets });

    case constants.SET_DATASET:
      return Object.assign({}, state, { datasets: action.payload });

    case constants.ADD_MOLECULELIST:
      const increasedMolecules = Object.assign({}, state.moleculeLists);

      if (increasedMolecules[action.payload.datasetID] === undefined) {
        increasedMolecules[action.payload.datasetID] = action.payload.moleculeList;
        // initialize also control containers
        initializeContainerLists(state, action.payload.datasetID);
      }
      return Object.assign({}, state, { moleculeLists: increasedMolecules });

    case constants.REMOVE_MOLECULELIST:
      const decreasedMolecules = Object.assign({}, state.moleculeLists);
      if (decreasedMolecules[action.payload] !== undefined) {
        delete decreasedMolecules[action.payload];
      }
      return Object.assign({}, state, { moleculeLists: decreasedMolecules });

    case constants.SET_IS_LOADING_MOLECULE_LIST:
      return Object.assign({}, state, { isLoadingMoleculeList: action.payload });

    case constants.SET_FILTER:
      return Object.assign({}, state, { filter: action.payload });

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

    case constants.APPEND_TO_SCORE_DATASET_MAP:
      const currentScoreDatasetMap = JSON.parse(JSON.stringify(state.scoreDatasetMap));
      currentScoreDatasetMap[action.payload.key] = action.payload.value;
      return Object.assign({}, state, { scoreDatasetMap: currentScoreDatasetMap });

    case constants.REMOVE_FROM_SCORE_DATASET_MAP:
      const diminishedScoreDatasetMap = JSON.parse(JSON.stringify(state.scoreDatasetMap));
      delete diminishedScoreDatasetMap[action.payload];
      return Object.assign({}, state, { scoreDatasetMap: diminishedScoreDatasetMap });

    case constants.APPEND_TO_SCORE_COMPOUND_MAP:
      const currentScoreCompoundMap = JSON.parse(JSON.stringify(state.scoreCompoundMap));
      currentScoreCompoundMap[action.payload.key] = action.payload.value;
      return Object.assign({}, state, { scoreCompoundMap: currentScoreCompoundMap });

    case constants.REMOVE_FROM_SCORE_COMPOUND_MAP:
      const diminishedScoreCompoundMap = JSON.parse(JSON.stringify(state.scoreCompoundMap));
      delete diminishedScoreCompoundMap[action.payload];
      return Object.assign({}, state, { scoreCompoundMap: diminishedScoreCompoundMap });

    default:
      return state;
  }
};
