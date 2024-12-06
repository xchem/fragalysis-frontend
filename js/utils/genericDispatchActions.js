export const getCompoundById = (id, datasetId) => (dispatch, getState) => {
  const state = getState();
  const datasetCmps = state.datasetsReducers.moleculeLists[datasetId];
  return datasetCmps?.find(cmp => cmp.id === id);
};
