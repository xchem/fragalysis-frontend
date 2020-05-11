/**
 * Created by abradley on 14/03/2018.
 */
import React, { useState, useEffect, memo, useContext } from 'react';
import { Button } from '../common/Inputs/Button';
import { FilterList } from '@material-ui/icons';
import { connect, useDispatch } from 'react-redux';
import * as apiActions from '../../reducers/api/actions';
import { setFilterDialogOpen, setMoleculeListIsLoading } from './redux/actions';
import { loadMoleculesOfDataSet } from './redux/dispatchActions';
import { setFilter } from './redux/actions';
import { DatasetMoleculeList } from './datasetMoleculeList';

const CustomDatasetList = memo(
  ({
    dataset,
    object_selection,
    height,
    setFilterItemsHeight,
    filterItemsHeight,
    filter,
    sortDialogOpen,
    setFilterDialogOpen,
    hideProjects
  }) => {
    const dispatch = useDispatch();

    const [sortDialogAnchorEl, setSortDialogAnchorEl] = useState(null);

    useEffect(() => {
      if (dataset && dataset.id) {
        dispatch(setMoleculeListIsLoading(true));
        dispatch(loadMoleculesOfDataSet(dataset.id)).finally(() => {
          dispatch(setMoleculeListIsLoading(false));
        });
      }
    }, [dataset, dispatch]);

    const actions = [
      <Button
        onClick={event => {
          if (sortDialogOpen === false) {
            setSortDialogAnchorEl(event.currentTarget);
            setFilterDialogOpen(true);
          } else {
            setSortDialogAnchorEl(null);
            setFilterDialogOpen(false);
          }
        }}
        color={'inherit'}
        disabled={!(object_selection || []).length}
        variant="text"
        startIcon={<FilterList />}
        size="small"
      >
        sort/filter
      </Button>
    ];

    return (
      <DatasetMoleculeList
        title={dataset && dataset.title}
        height={height}
        setFilterItemsHeight={setFilterItemsHeight}
        filterItemsHeight={filterItemsHeight}
        hideProjects={hideProjects}
        object_selection={object_selection}
        filter={filter}
        setFilter={setFilter}
        actions={actions}
        sortDialogAnchorEl={sortDialogAnchorEl}
        datasetID={dataset && dataset.id}
      />
    );
  }
);
function mapStateToProps(state) {
  return {
    group_type: state.apiReducers.group_type,
    object_selection: state.selectionReducers.mol_group_selection,
    object_list: state.apiReducers.molecule_list,
    filter: state.datasetsReducers.filter,
    sortDialogOpen: state.datasetsReducers.filterDialogOpen
  };
}
const mapDispatchToProps = {
  setMoleculeList: apiActions.setMoleculeList,
  setFilterDialogOpen
};
CustomDatasetList.displayName = 'CustomDatasetList';
export default connect(mapStateToProps, mapDispatchToProps)(CustomDatasetList);
