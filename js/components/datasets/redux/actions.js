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

export const setFilter = filter => ({ type: constants.SET_FILTER, payload: filter });
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

export const appendToScoreDatasetMap = (datasetID, scoreList) => ({
  type: constants.APPEND_TO_SCORE_DATASET_MAP,
  payload: { key: datasetID, value: scoreList }
});

export const removeFromScoreDatasetMap = datasetID => ({
  type: constants.REMOVE_FROM_SCORE_DATASET_MAP,
  payload: datasetID
});
