import { constants } from './constants';

export const addDataset = dataset => ({ type: constants.ADD_DATASET, payload: dataset });

// datasetList has to contain follow structure
//[{ id: 0, title: 'First dataset' },...]
export const setDataset = datasetList => ({
  type: constants.SET_DATASET,
  payload: datasetList.map(ds => ({ id: ds.id, title: ds.title }))
});

export const addMoleculeList = (datasetID, moleculeList) => ({
  type: constants.ADD_MOLECULELIST,
  payload: { datasetID, moleculeList }
});
export const removeMoleculeList = datasetID => ({ type: constants.REMOVE_MOLECULELIST, payload: datasetID });

export const setMoleculeListIsLoading = isLoading => ({
  type: constants.SET_IS_LOADING_MOLECULE_LIST,
  payload: isLoading
});

export const setFilterSettings = (datasetID, filter) => ({
  type: constants.SET_FILTER_SETTINGS,
  payload: { datasetID, filter }
});

export const setFilterProperties = (datasetID, properties) => ({
  type: constants.SET_FILTER_PROPERTIES,
  payload: { datasetID, properties }
});

export const setFilterDialogOpen = filterDialogOpen => ({
  type: constants.SET_FILTER_DIALOG_OPEN,
  payload: filterDialogOpen
});

export const setLigandList = function(datsetID, ligandList) {
  return {
    type: constants.SET_LIGAND_LIST,
    payload: {
      datasetID: datsetID,
      ligandList: ligandList
    }
  };
};
export const appendLigandList = function(datsetID, item) {
  return {
    type: constants.APPEND_LIGAND_LIST,
    payload: {
      datasetID: datsetID,
      item: item
    }
  };
};
export const removeFromLigandList = function(datsetID, item) {
  return {
    type: constants.REMOVE_FROM_LIGAND_LIST,
    payload: {
      datasetID: datsetID,
      item: item
    }
  };
};

export const setProteinList = function(datsetID, proteinList) {
  return {
    type: constants.SET_PROTEIN_LIST,
    payload: {
      datasetID: datsetID,
      proteinList: proteinList
    }
  };
};
export const appendProteinList = function(datsetID, item) {
  return {
    type: constants.APPEND_PROTEIN_LIST,
    payload: {
      datasetID: datsetID,
      item: item
    }
  };
};
export const removeFromProteinList = function(datsetID, item) {
  return {
    type: constants.REMOVE_FROM_PROTEIN_LIST,
    payload: {
      datasetID: datsetID,
      item: item
    }
  };
};

export const setComplexList = function(datsetID, complexList) {
  return {
    type: constants.SET_COMPLEX_LIST,
    payload: {
      datasetID: datsetID,
      complexList: complexList
    }
  };
};
export const appendComplexList = function(datsetID, item) {
  return {
    type: constants.APPEND_COMPLEX_LIST,
    payload: {
      datasetID: datsetID,
      item: item
    }
  };
};
export const removeFromComplexList = function(datsetID, item) {
  return {
    type: constants.REMOVE_FROM_COMPLEX_LIST,
    payload: {
      datasetID: datsetID,
      item: item
    }
  };
};

export const setSurfaceList = function(datsetID, surfaceList) {
  return {
    type: constants.SET_SURFACE_LIST,
    payload: {
      datasetID: datsetID,
      surfaceList: surfaceList
    }
  };
};
export const appendSurfaceList = function(datsetID, item) {
  return {
    type: constants.APPEND_SURFACE_LIST,
    payload: {
      datasetID: datsetID,
      item: item
    }
  };
};
export const removeFromSurfaceList = function(datsetID, item) {
  return {
    type: constants.REMOVE_FROM_SURFACE_LIST,
    payload: {
      datasetID: datsetID,
      item: item
    }
  };
};

export const setInspirationList = function(datasetID, inspirationList) {
  return {
    type: constants.SET_INSPIRATION_LIST,
    payload: {
      datasetID,
      inspirationList
    }
  };
};
export const appendInspirationList = function(datasetID, itemID) {
  return {
    type: constants.APPEND_INSPIRATION_LIST,
    payload: {
      datasetID,
      itemID
    }
  };
};
export const removeFromInspirationList = function(datasetID, itemID) {
  return {
    type: constants.REMOVE_FROM_INSPIRATION_LIST,
    payload: {
      datasetID,
      itemID
    }
  };
};

export const appendToScoreDatasetMap = (datasetID, scoreList) => ({
  type: constants.APPEND_TO_SCORE_DATASET_MAP,
  payload: { key: datasetID, value: scoreList }
});

export const removeFromScoreDatasetMap = datasetID => ({
  type: constants.REMOVE_FROM_SCORE_DATASET_MAP,
  payload: datasetID
});

export const appendToScoreCompoundMapByScoreCategory = scoreListCategories => ({
  type: constants.APPEND_TO_SCORE_COMPOUND_MAP_BY_SCORE_CATEGORY,
  payload: scoreListCategories
});

export const appendToScoreCompoundMap = (compoundID, scoreList) => ({
  type: constants.APPEND_TO_SCORE_COMPOUND_MAP,
  payload: { key: compoundID, value: scoreList }
});

export const removeFromScoreCompoundMap = compoundID => ({
  type: constants.REMOVE_FROM_SCORE_COMPOUND_MAP,
  payload: compoundID
});

export const clearScoreCompoundMap = () => ({ type: constants.CLEAR_SCORE_COMPOUND_MAP });

export const updateFilterShowedScoreProperties = ({ datasetID, scoreList = [] }) => ({
  type: constants.UPDATE_FILTER_SHOWED_SCORE_PROPERTIES,
  payload: { datasetID, scoreList }
});

export const removeFromFilterShowedScoreProperties = datasetID => ({
  type: constants.REMOVE_FROM_FILTER_SHOWED_SCORE_PROPERTIES,
  payload: datasetID
});

export const setSearchStringOfCompoundSet = searchString => ({
  type: constants.SET_SEARCH_STRING,
  payload: searchString
});

export const setIsLoadingInspirationListOfMolecules = isLoading => ({
  type: constants.SET_IS_LOADING_INSPIRATION_LIST_OF_MOLECULES,
  payload: isLoading
});

export const setInspirationMoleculeDataList = (moleculeList = []) => ({
  type: constants.SET_INSPIRATION_MOLECULE_DATA_LIST,
  payload: moleculeList
});

export const appendToInspirationMoleculeDataList = molecule => ({
  type: constants.APPEND_TO_INSPIRATION_MOLECULE_DATA_LIST,
  payload: molecule
});

export const removeFromInspirationMoleculeDataList = moleculeID => ({
  type: constants.REMOVE_FROM_INSPIRATION_MOLECULE_DATA_LIST,
  payload: moleculeID
});
