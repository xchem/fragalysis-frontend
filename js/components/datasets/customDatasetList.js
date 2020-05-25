/**
 * Created by abradley on 14/03/2018.
 */
import React, { useEffect, memo } from 'react';
import { useDispatch } from 'react-redux';
import {
  clearScoreCompoundMap,
  setInspirationList,
  setInspirationMoleculeDataList,
  setIsOpenInspirationDialog,
  setMoleculeListIsLoading
} from './redux/actions';
import {
  initializeDatasetFilter,
  loadCompoundScoresListOfDataSet,
  loadMoleculesOfDataSet
} from './redux/dispatchActions';
import { DatasetMoleculeList } from './datasetMoleculeList';

export const CustomDatasetList = memo(({ dataset, height, setFilterItemsHeight, filterItemsHeight, hideProjects }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (dataset && dataset.id) {
      dispatch(setMoleculeListIsLoading(true));
      Promise.all([dispatch(loadMoleculesOfDataSet(dataset.id)), dispatch(loadCompoundScoresListOfDataSet(dataset.id))])
        .catch(error => {
          throw new Error(error);
        })
        .finally(() => {
          dispatch(setMoleculeListIsLoading(false));
          dispatch(initializeDatasetFilter(dataset && dataset.id));
        });
    }
    return () => {
      if (dataset && dataset.id) {
        dispatch(clearScoreCompoundMap());

        // clear inspirations
        dispatch(setInspirationList(dataset.id, []));
        dispatch(setIsOpenInspirationDialog(false));
      }
    };
  }, [dataset, dispatch]);

  return (
    <DatasetMoleculeList
      title={dataset && dataset.title}
      height={height}
      setFilterItemsHeight={setFilterItemsHeight}
      filterItemsHeight={filterItemsHeight}
      hideProjects={hideProjects}
      datasetID={dataset && dataset.id}
    />
  );
});
