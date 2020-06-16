/**
 * Created by abradley on 14/03/2018.
 */
import React, { useEffect, memo } from 'react';
import { useDispatch } from 'react-redux';
import { setMoleculeListIsLoading } from './redux/actions';
import {
  clearDatasetSettings,
  initializeDatasetFilter,
  loadCompoundScoresListOfDataSet,
  loadMoleculesOfDataSet
} from './redux/dispatchActions';
import { DatasetMoleculeList } from './datasetMoleculeList';

export const CustomDatasetList = memo(
  ({ dataset, height, setFilterItemsHeight, filterItemsHeight, hideProjects, isActive }) => {
    const dispatch = useDispatch();

    console.log(dataset, isActive);

    useEffect(() => {
      if (dataset && dataset.id && isActive) {
        dispatch(setMoleculeListIsLoading(true));
        Promise.all([
          dispatch(loadMoleculesOfDataSet(dataset.id)),
          dispatch(loadCompoundScoresListOfDataSet(dataset.id))
        ])
          .catch(error => {
            throw new Error(error);
          })
          .finally(() => {
            dispatch(setMoleculeListIsLoading(false));
            dispatch(initializeDatasetFilter(dataset && dataset.id));
          });
      } else if (dataset && dataset.id && !isActive) {
        dispatch(clearDatasetSettings(dataset.id));
      }

      return () => {
        dispatch(clearDatasetSettings(dataset?.id));
      };
    }, [dataset, dispatch, isActive]);

    const title = dataset && `${dataset.title} v.${dataset.version}`;

    return (
      <DatasetMoleculeList
        title={title}
        url={dataset && dataset.url}
        height={height}
        setFilterItemsHeight={setFilterItemsHeight}
        filterItemsHeight={filterItemsHeight}
        hideProjects={hideProjects}
        datasetID={dataset && dataset.id}
      />
    );
  }
);
