import { setSelectedDatasetIndex, setTabValue } from '../../../datasets/redux/actions';
import { turnSide } from '../../viewerControls/redux/actions';
import { getCompoundById } from '../../../../reducers/tracking/dispatchActionsSwitchSnapshot';
import {
  removeDatasetLigand,
  removeDatasetHitProtein,
  removeDatasetComplex,
  removeDatasetSurface,
  addDatasetLigand
} from '../../../datasets/redux/dispatchActions';
import { getRandomColor } from '../../molecule/utils/color';
import { getJoinedMoleculeLists } from '../../../datasets/redux/selectors';

const removeRHSfromNGL = stage => (dispatch, getState) => {
  const state = getState();

  state.datasetsReducers.ligandLists.entries().forEach(([datasetId, value]) => {
    value.forEach(cmpId => {
      const cmp = dispatch(getCompoundById(cmpId, datasetId));
      if (cmp) {
        dispatch(removeDatasetLigand(stage, cmp, getRandomColor(cmp), datasetId, true));
      }
    });
  });

  state.datasetsReducers.proteinLists.entries().forEach(([datasetId, value]) => {
    value.forEach(cmpId => {
      const cmp = dispatch(getCompoundById(cmpId, datasetId));
      if (cmp) {
        dispatch(removeDatasetHitProtein(stage, cmp, getRandomColor(cmp), datasetId, true));
      }
    });
  });

  state.datasetsReducers.complexLists.entries().forEach(([datasetId, value]) => {
    value.forEach(cmpId => {
      const cmp = dispatch(getCompoundById(cmpId, datasetId));
      if (cmp) {
        dispatch(removeDatasetComplex(stage, cmp, getRandomColor(cmp), datasetId, true));
      }
    });
  });

  state.datasetsReducers.surfaceLists.entries().forEach(([datasetId, value]) => {
    value.forEach(cmpId => {
      const cmp = dispatch(getCompoundById(cmpId, datasetId));
      if (cmp) {
        dispatch(removeDatasetSurface(stage, cmp, getRandomColor(cmp), datasetId, true));
      }
    });
  });
};

const showFirstCompound = (stage, datasetId) => async (dispatch, getState) => {
  const state = getState();

  const cmpList = getJoinedMoleculeLists(datasetId, state);

  if (cmpList && cmpList.length > 0) {
    const cmp = dispatch(getCompoundById(cmpList[0], datasetId));
    await dispatch(addDatasetLigand(stage, cmp, getRandomColor(cmp), datasetId, true));
  }
};

export const selectDatasetResultsForJob = (jobInfo, stage) => async (dispatch, getState) => {
  const state = getState();
  const datasetsList = state.datasetsReducers.datasets;
  const currentDatasetIndex = state.datasetsReducers.selectedDatasetIndex;
  const tabValue = state.datasetsReducers.tabValue;

  dispatch(removeRHSfromNGL(stage));

  let datasetIndex = datasetsList.findIndex(dataset => dataset.id === jobInfo.computed_set);
  console.log(`Found dataset index ${datasetIndex} for job ${JSON.stringify(jobInfo)}`);
  if (datasetIndex >= 0) {
    dispatch(turnSide('RHS', true));
    const oldTitle = datasetsList[currentDatasetIndex]?.title;
    const newTitle = datasetsList[datasetIndex]?.title;
    // datasetIndex = datasetIndex + 2;
    console.log(`Selecting dataset index ${datasetIndex}`);
    console.log(
      `from job table - currentDatasetIndex: ${currentDatasetIndex} datasetIndex: ${datasetIndex} newTitle: ${newTitle} oldTitle: ${oldTitle}`
    );
    dispatch(setSelectedDatasetIndex(currentDatasetIndex, datasetIndex, newTitle, oldTitle));
    dispatch(setTabValue(tabValue, 2, oldTitle, newTitle));

    await dispatch(showFirstCompound(stage, jobInfo.computed_set));
  }
};
