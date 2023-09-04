/**
 * Created by abradley on 14/03/2018.
 */
import React, { useEffect, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearDatasetSettings, initializeDatasetFilter } from './redux/dispatchActions';
import DatasetMoleculeList from './datasetMoleculeList';

export const CustomDatasetList = memo(({ dataset, hideProjects, isActive }) => {
  const dispatch = useDispatch();
  const isLoadingMoleculeList = useSelector(state => state.datasetsReducers.isLoadingMoleculeList);

  useEffect(() => {
    if (isLoadingMoleculeList === false) {
      if (dataset && dataset.id && isActive) {
        dispatch(initializeDatasetFilter(dataset && dataset.id));
      } else if (dataset && dataset.id && !isActive) {
        dispatch(clearDatasetSettings(dataset.id));
      }
    }
    return () => {
      dispatch(clearDatasetSettings(dataset?.id));
    };
  }, [dataset, dispatch, isActive, isLoadingMoleculeList]);

  const title = dataset && `${dataset.title} v.${dataset.version}`;

  return (
    <DatasetMoleculeList
      title={title}
      url={dataset && dataset.url}
      hideProjects={hideProjects}
      datasetID={dataset && dataset.id}
    />
  );
});
