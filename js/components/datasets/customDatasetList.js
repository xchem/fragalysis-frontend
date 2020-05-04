/**
 * Created by abradley on 14/03/2018.
 */
import React, { useState, useEffect, memo, useRef, useContext } from 'react';
import { Button } from '../common/Inputs/Button';
import { FilterList } from '@material-ui/icons';
import { connect, useDispatch } from 'react-redux';
import * as apiActions from '../../reducers/api/actions';
import * as listType from '../../constants/listTypes';
import { filterMolecules } from '../preview/molecule/moleculeListSortFilterDialog';
import { getJoinedMoleculeList } from '../preview/molecule/redux/selectors';
import { getUrl, loadFromServer } from '../../utils/genericList';
import { setFilterDialogOpen } from './redux/actions';
import { VIEWS } from '../../constants/constants';
import { NglContext } from '../nglView/nglProvider';
import { initializeFilter } from './redux/dispatchActions';
import { setFilter } from './redux/actions';
import { DatasetMoleculeList } from './datasetMoleculeList';

const CustomDatasetList = memo(
  ({
    dataset,
    object_selection,
    height,
    cached_mol_lists,
    target_on,
    mol_group_on,
    setMoleculeList,
    setCachedMolLists,
    setFilterItemsHeight,
    filterItemsHeight,
    moleculeLists,
    filter,
    sortDialogOpen,
    setFilterDialogOpen,
    firstLoad,
    hideProjects
  }) => {
    const dispatch = useDispatch();
    const list_type = listType.MOLECULE;
    const oldUrl = useRef('');
    const setOldUrl = url => {
      oldUrl.current = url;
    };

    const isActiveFilter = !!(filter || {}).active;
    const [sortDialogAnchorEl, setSortDialogAnchorEl] = useState(null);

    const { getNglView } = useContext(NglContext);
    const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

    let joinedMoleculeLists = moleculeLists[dataset.id];

    // TODO Reset Infinity scroll
    /*useEffect(() => {
      // setCurrentPage(0);
    }, [object_selection]);*/

    if (isActiveFilter) {
      joinedMoleculeLists = filterMolecules(joinedMoleculeLists, filter);
    } else {
      // default sort is by site
      joinedMoleculeLists.sort((a, b) => a.site - b.site);
    }

    // prevent loading molecules multiple times
    const firstLoadRef = useRef(!firstLoad);

    useEffect(() => {
      // TODO this reloads too much..
      loadFromServer({
        url: getUrl({ list_type, target_on, mol_group_on }),
        setOldUrl: url => setOldUrl(url),
        old_url: oldUrl.current,
        list_type,
        setObjectList: setMoleculeList,
        setCachedMolLists,
        mol_group_on,
        cached_mol_lists
      })
        .then(() => {
          console.log('initializing filter');
          // setPredefinedFilter(dispatch(initializeFilter()).predefined);
          dispatch(initializeFilter());
          // initialize molecules on first target load
          if (
            stage &&
            cached_mol_lists &&
            cached_mol_lists[mol_group_on] &&
            firstLoadRef &&
            firstLoadRef.current &&
            hideProjects
          ) {
            console.log('initializing molecules');
            firstLoadRef.current = false;
            // dispatch(initializeMolecules(stage, cached_mol_lists[mol_group_on]));
          }
        })
        .catch(error => {
          throw new Error(error);
        });
    }, [
      list_type,
      mol_group_on,
      setMoleculeList,
      stage,
      firstLoad,
      target_on,
      setCachedMolLists,
      cached_mol_lists,
      hideProjects,
      dispatch
    ]);

    useEffect(() => {
      if (isActiveFilter === false) {
        setFilterItemsHeight(0);
      }
    }, [isActiveFilter, setFilterItemsHeight]);

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
        title={dataset.title}
        height={height}
        setFilterItemsHeight={setFilterItemsHeight}
        filterItemsHeight={filterItemsHeight}
        hideProjects={hideProjects}
        moleculeDataList={joinedMoleculeLists}
        object_selection={object_selection}
        cached_mol_lists={cached_mol_lists}
        filter={filter}
        setFilter={setFilter}
        actions={actions}
        sortDialogAnchorEl={sortDialogAnchorEl}
        datasetID={dataset.id}
      />
    );
  }
);

function mapStateToProps(state) {
  return {
    group_type: state.apiReducers.group_type,
    target_on: state.apiReducers.target_on,
    mol_group_on: state.apiReducers.mol_group_on,
    object_selection: state.selectionReducers.mol_group_selection,
    object_list: state.apiReducers.molecule_list,
    cached_mol_lists: state.apiReducers.cached_mol_lists,
    moleculeLists: state.datasetsReducers.moleculeLists,
    filter: state.datasetsReducers.filter,
    sortDialogOpen: state.datasetsReducers.filterDialogOpen,
    firstLoad: state.selectionReducers.firstLoad
  };
}
const mapDispatchToProps = {
  setMoleculeList: apiActions.setMoleculeList,
  setCachedMolLists: apiActions.setCachedMolLists,
  setFilterDialogOpen
};
CustomDatasetList.displayName = 'CustomDatasetList';
export default connect(mapStateToProps, mapDispatchToProps)(CustomDatasetList);
