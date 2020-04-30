/**
 * Created by abradley on 14/03/2018.
 */
import React, { useState, useEffect, memo, useRef, useContext } from 'react';
import { Select, MenuItem, FormControl, makeStyles } from '@material-ui/core';
import { Button } from '../../common/Inputs/Button';
import { FilterList, ClearAll } from '@material-ui/icons';
import { connect, useDispatch } from 'react-redux';
import * as apiActions from '../../../reducers/api/actions';
import * as listType from '../../../constants/listTypes';
import { filterMolecules } from './moleculeListSortFilterDialog';
import { getJoinedMoleculeList } from './redux/selectors';
import { getUrl, loadFromServer } from '../../../utils/genericList';
import { setSortDialogOpen } from './redux/actions';
import { VIEWS } from '../../../constants/constants';
import { NglContext } from '../../nglView/nglProvider';
import { setFilter, setFilterSettings } from '../../../reducers/selection/actions';
import { initializeFilter } from '../../../reducers/selection/dispatchActions';
import { MOL_ATTRIBUTES } from './redux/constants';
import { MoleculeList } from './moleculeList';
import { hideAllSelectedMolecules, initializeMolecules } from './redux/dispatchActions';
import { PREDEFINED_FILTERS, DEFAULT_FILTER } from '../../../reducers/selection/constants';
import { initializeDatasetMoleculeLists } from '../../datasets/redux/dispatchActions';
import { useRouteMatch } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  formControl: {
    color: 'inherit',
    margin: theme.spacing(1),
    minWidth: 87,
    fontSize: '1.2rem'
  },
  select: {
    color: 'inherit',
    fill: 'inherit',
    '&:hover:not(.Mui-disabled):before': {
      borderColor: 'inherit'
    },
    '&:before': {
      borderColor: 'inherit'
    },
    '&:not(.Mui-disabled)': {
      fill: theme.palette.white
    }
  },
  selectIcon: {
    fill: 'inherit'
  }
}));

const HitNavigator = memo(
  ({
    object_selection,
    height,
    cached_mol_lists,
    target_on,
    mol_group_on,
    setMoleculeList,
    setCachedMolLists,
    setFilterItemsHeight,
    filterItemsHeight,
    getJoinedMoleculeList,
    filter,
    filterSettings,
    sortDialogOpen,
    setSortDialogOpen,
    firstLoad,
    hideProjects
  }) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const list_type = listType.MOLECULE;
    const oldUrl = useRef('');
    const setOldUrl = url => {
      oldUrl.current = url;
    };

    let match = useRouteMatch();
    const target = match && match.params && match.params.target;

    const isActiveFilter = !!(filterSettings || {}).active;
    const [sortDialogAnchorEl, setSortDialogAnchorEl] = useState(null);
    const [currentMolecules, setCurrentMolecules] = useState(null);

    const { getNglView } = useContext(NglContext);
    const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

    let joinedMoleculeLists = getJoinedMoleculeList;

    // TODO Reset Infinity scroll
    /*useEffect(() => {
      // setCurrentPage(0);
    }, [object_selection]);*/

    if (isActiveFilter) {
      joinedMoleculeLists = filterMolecules(joinedMoleculeLists, filterSettings);
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
            hideProjects &&
            target !== undefined
          ) {
            console.log('initializing molecules');
            firstLoadRef.current = false;
            dispatch(initializeMolecules(stage, cached_mol_lists[mol_group_on]));
            dispatch(initializeDatasetMoleculeLists(cached_mol_lists[mol_group_on]));
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
      dispatch,
      hideProjects,
      target
    ]);

    useEffect(() => {
      if (isActiveFilter === false) {
        setFilterItemsHeight(0);
      }
    }, [isActiveFilter, setFilterItemsHeight]);

    const handleFilterChange = filter => {
      const filterSet = Object.assign({}, filter);
      for (let attr of MOL_ATTRIBUTES) {
        if (filterSet.filter[attr.key].priority === undefined || filterSet.filter[attr.key].priority === '') {
          filterSet.filter[attr.key].priority = 0;
        }
      }
      dispatch(setFilterSettings(filterSet));
    };

    const [predefinedFilter, setPredefinedFilter] = useState(filter !== undefined ? filter.predefined : DEFAULT_FILTER);
    const changePredefinedFilter = event => {
      let newFilter = Object.assign({}, filter);

      const preFilterKey = event.target.value;
      setPredefinedFilter(preFilterKey);

      if (preFilterKey !== 'none') {
        newFilter.active = true;
        newFilter.predefined = preFilterKey;
        Object.keys(PREDEFINED_FILTERS[preFilterKey].filter).forEach(attr => {
          const maxValue = PREDEFINED_FILTERS[preFilterKey].filter[attr];
          newFilter.filter[attr].maxValue = maxValue;
          newFilter.filter[attr].max = newFilter.filter[attr].max < maxValue ? maxValue : newFilter.filter[attr].max;
        });
        dispatch(setFilter(newFilter));
      } else {
        // close filter dialog options
        setSortDialogAnchorEl(null);
        setSortDialogOpen(false);
        // reset filter
        dispatch(setFilter(undefined));
        newFilter = dispatch(initializeFilter());
      }
      // currently do not filter molecules by excluding them
      /*setFilteredCount(getFilteredMoleculesCount(getListedMolecules(object_selection, cached_mol_lists), newFilter));
      handleFilterChange(newFilter);*/
    };

    const actions = [
      <FormControl className={classes.formControl} disabled={!(object_selection || []).length || sortDialogOpen}>
        <Select
          className={classes.select}
          value={predefinedFilter}
          onChange={changePredefinedFilter}
          inputProps={{
            name: 'predefined',
            id: 'predefined-label-placeholder',
            classes: { icon: classes.selectIcon }
          }}
          displayEmpty
          name="predefined"
        >
          {Object.keys(PREDEFINED_FILTERS).map(preFilterKey => (
            <MenuItem key={`Predefined-filter-${preFilterKey}`} value={preFilterKey}>
              {PREDEFINED_FILTERS[preFilterKey].name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>,
      <Button
        color={'inherit'}
        size="small"
        variant="text"
        startIcon={<ClearAll />}
        disabled={!(object_selection || []).length}
        onClick={() => dispatch(hideAllSelectedMolecules(stage, currentMolecules))}
      >
        Hide all
      </Button>,
      <Button
        onClick={event => {
          if (sortDialogOpen === false) {
            setSortDialogAnchorEl(event.currentTarget);
            setSortDialogOpen(true);
          } else {
            setSortDialogAnchorEl(null);
            setSortDialogOpen(false);
          }
        }}
        color={'inherit'}
        disabled={!(object_selection || []).length || predefinedFilter !== 'none'}
        variant="text"
        startIcon={<FilterList />}
        size="small"
      >
        sort/filter
      </Button>
    ];

    return (
      <MoleculeList
        title={'Hit navigator'}
        height={height}
        setFilterItemsHeight={setFilterItemsHeight}
        filterItemsHeight={filterItemsHeight}
        hideProjects={hideProjects}
        moleculeDataList={joinedMoleculeLists}
        object_selection={object_selection}
        cached_mol_lists={cached_mol_lists}
        filterSettings={filterSettings}
        filter={filter}
        actions={actions}
        sortDialogAnchorEl={sortDialogAnchorEl}
        setCurrentMolecules={setCurrentMolecules}
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
    getJoinedMoleculeList: getJoinedMoleculeList(state),
    filter: state.selectionReducers.filter,
    filterSettings: state.selectionReducers.filterSettings,
    sortDialogOpen: state.previewReducers.molecule.sortDialogOpen,
    firstLoad: state.selectionReducers.firstLoad
  };
}
const mapDispatchToProps = {
  setMoleculeList: apiActions.setMoleculeList,
  setCachedMolLists: apiActions.setCachedMolLists,
  setSortDialogOpen
};
HitNavigator.displayName = 'HitNavigator';
export default connect(mapStateToProps, mapDispatchToProps)(HitNavigator);
