import { setSelectedDatasetIndex } from '../../../datasets/redux/actions';
import { turnSide } from '../../viewerControls/redux/actions';

export const selectDatasetResultsForJob = jobInfo => (dispatch, getState) => {
  const state = getState();
  const datasetsList = state.datasetsReducers.datasets;
  let datasetIndex = datasetsList.findIndex(dataset => dataset.id === jobInfo.computed_set);
  console.log(`Found dataset index ${datasetIndex} for job ${JSON.stringify(jobInfo)}`);
  if (datasetIndex >= 0) {
    dispatch(turnSide('RHS', true));
    datasetIndex = datasetIndex + 2;
    console.log(`Selecting dataset index ${datasetIndex}`);
    dispatch(setSelectedDatasetIndex(datasetIndex));
  }
};
