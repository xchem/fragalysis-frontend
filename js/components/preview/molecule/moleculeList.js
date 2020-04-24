/**
 * Created by abradley on 14/03/2018.
 */
import {
  Grid,
  Chip,
  Tooltip,
  makeStyles,
  CircularProgress,
  Divider,
  Typography,
  Select,
  MenuItem,
  FormControl
} from '@material-ui/core';
import { FilterList, ClearAll } from '@material-ui/icons';
import React, { useState, useEffect, memo, useRef, useContext } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import * as apiActions from '../../../reducers/api/actions';
import * as listType from '../../../constants/listTypes';
import MoleculeView, { colourList } from './moleculeView';
import { MoleculeListSortFilterDialog, filterMolecules, getAttrDefinition } from './moleculeListSortFilterDialog';
import { getJoinedMoleculeList } from './redux/selectors';
import { getUrl, loadFromServer } from '../../../utils/genericList';
import InfiniteScroll from 'react-infinite-scroller';
import { Button } from '../../common/Inputs/Button';
import { Panel } from '../../common/Surfaces/Panel';
import { ComputeSize } from '../../../utils/computeSize';
import { moleculeProperty } from './helperConstants';
import { setSortDialogOpen } from './redux/actions';
import { VIEWS } from '../../../constants/constants';
import { NglContext } from '../../nglView/nglProvider';
import { hideAllSelectedMolecules, initializeMolecules } from './redux/dispatchActions';
import { setFilter, setFilterSettings, setFirstLoad } from '../../../reducers/selection/actions';
import { initializeFilter, getListedMolecules } from '../../../reducers/selection/dispatchActions';
import { PREDEFINED_FILTERS, DEFAULT_FILTER } from '../../../reducers/selection/constants';
import { MOL_ATTRIBUTES } from './redux/constants';
import { getFilteredMoleculesCount } from './moleculeListSortFilterDialog';
import { useDisableUserInteraction } from '../../helpers/useEnableUserInteracion';
import classNames from 'classnames';
import {
  addVector,
  removeVector,
  addProtein,
  removeProtein,
  addComplex,
  removeComplex,
  addSurface,
  removeSurface,
  addDensity,
  removeDensity,
  addLigand,
  removeLigand
} from './redux/dispatchActions';
import { useRouteMatch } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  container: {
    height: '100%',
    width: 'inherit',
    color: theme.palette.black
  },
  gridItemHeader: {
    height: '32px',
    fontSize: '8px',
    color: '#7B7B7B'
  },
  gridItemHeaderVert: {
    transform: 'rotate(-90deg)',
    height: 'fit-content'
  },
  gridItemHeaderHoriz: {
    width: 'fit-content'
  },
  gridItemList: {
    overflow: 'auto',
    height: `calc(100% - ${theme.spacing(6)}px)`
  },
  centered: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  button: {
    minWidth: 'unset'
  },
  buttonActive: {
    border: 'solid 1px #009000',
    color: '#009000',
    '&:hover': {
      backgroundColor: '#E3EEDA',
      borderColor: '#003f00',
      color: '#003f00'
    }
  },
  paddingProgress: {
    padding: theme.spacing(1)
  },
  filterSection: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  filterTitle: {
    transform: 'rotate(-90deg)'
  },
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
  },
  molHeader: {
    marginLeft: 19,
    width: 'inherit'
  },
  rightBorder: {
    borderRight: '1px solid',
    borderRightColor: theme.palette.background.divider,
    fontWeight: 'bold',
    paddingLeft: theme.spacing(1) / 2,
    paddingRight: theme.spacing(1) / 2,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    fontSize: 8,
    width: 25,
    textAlign: 'center',
    '&:last-child': {
      borderRight: 'none',
      width: 32
    }
  },
  contButtonsMargin: {
    margin: theme.spacing(1) / 2
  },
  contColButton: {
    minWidth: 'fit-content',
    paddingLeft: theme.spacing(1) / 2,
    paddingRight: theme.spacing(1) / 2,
    paddingBottom: theme.spacing(1) / 8,
    paddingTop: theme.spacing(1) / 8,
    borderRadius: 0,
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText
    },
    '&:disabled': {
      borderRadius: 0,
      borderColor: 'white'
    }
  },
  contColButtonSelected: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.black
    }
  },
  contColButtonHalfSelected: {
    backgroundColor: theme.palette.primary.semidark,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.black
    }
  }
}));

const MoleculeList = memo(
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
    const [sortDialogAnchorEl, setSortDialogAnchorEl] = useState(null);
    const moleculesPerPage = 5;
    const [currentPage, setCurrentPage] = useState(0);
    const imgHeight = 34;
    const imgWidth = 150;
    let match = useRouteMatch();
    const target = match && match.params && match.params.target;

    const [predefinedFilter, setPredefinedFilter] = useState(filter !== undefined ? filter.predefined : DEFAULT_FILTER);

    const isActiveFilter = !!(filterSettings || {}).active;

    const { getNglView } = useContext(NglContext);
    const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

    const filterRef = useRef();

    let joinedMoleculeLists = getJoinedMoleculeList;

    const disableUserInteraction = useDisableUserInteraction();

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

    const loadNextMolecules = () => {
      setCurrentPage(currentPage + 1);
    };

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
          setPredefinedFilter(dispatch(initializeFilter()).predefined);
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
            dispatch(setFirstLoad(false));
            dispatch(initializeMolecules(stage, cached_mol_lists[mol_group_on].results));
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

    const listItemOffset = (currentPage + 1) * moleculesPerPage;
    const currentMolecules = joinedMoleculeLists.slice(0, listItemOffset);
    const canLoadMore = listItemOffset < joinedMoleculeLists.length;

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

    const selectedAll = useRef(false);
    const proteinList = useSelector(state => state.selectionReducers.proteinList);
    const complexList = useSelector(state => state.selectionReducers.complexList);
    const surfaceList = useSelector(state => state.selectionReducers.surfaceList);
    const densityList = useSelector(state => state.selectionReducers.densityList);
    const fragmentDisplayList = useSelector(state => state.selectionReducers.fragmentDisplayList);
    const vectorOnList = useSelector(state => state.selectionReducers.vectorOnList);

    const isLigandOn = fragmentDisplayList.length > 0 || false;
    const isProteinOn = proteinList.length > 0 || false;
    const isComplexOn = complexList.length > 0 || false;
    const isSurfaceOn = surfaceList.length > 0 || false;
    const isDensityOn = densityList.length > 0 || false;
    const isVectorOn = vectorOnList.length > 0 || false;
    const hasAllValuesOn = isLigandOn && isProteinOn && isComplexOn && isSurfaceOn; // && isVectorOn;
    const hasSomeValuesOn = !hasAllValuesOn && (isLigandOn || isProteinOn || isComplexOn || isSurfaceOn || isVectorOn);

    const addType = {
      ligand: addLigand,
      protein: addProtein,
      complex: addComplex,
      surface: addSurface,
      density: addDensity,
      vector: addVector
    };

    const removeType = {
      ligand: removeLigand,
      protein: removeProtein,
      complex: removeComplex,
      surface: removeSurface,
      density: removeDensity,
      vector: removeVector
    };

    // TODO "currentMolecules" do not need to correspondent to selections in {type}List
    // TODO so this could lead to inconsistend behaviour while scrolling
    // TODO maybe change "currentMolecules.forEach" to "{type}List.forEach"

    const removeSelectedType = type => {
      joinedMoleculeLists.forEach(molecule => {
        dispatch(removeType[type](stage, molecule, colourList[molecule.id % colourList.length]));
      });
      selectedAll.current = false;
    };

    const addNewType = type => {
      joinedMoleculeLists.forEach(molecule => {
        dispatch(addType[type](stage, molecule, colourList[molecule.id % colourList.length]));
      });
    };

    const ucfirst = string => {
      return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const onButtonToggle = (type, calledFromSelectAll = false) => {
      if (calledFromSelectAll === true && selectedAll.current === true) {
        // REDO
        if (eval('is' + ucfirst(type) + 'On') === false) {
          addNewType(type);
        }
      } else if (calledFromSelectAll && selectedAll.current === false) {
        removeSelectedType(type);
      } else if (!calledFromSelectAll) {
        if (eval('is' + ucfirst(type) + 'On') === false) {
          addNewType(type);
        } else {
          removeSelectedType(type);
        }
      }
    };

    return (
      <ComputeSize
        componentRef={filterRef.current}
        setHeight={setFilterItemsHeight}
        height={filterItemsHeight}
        forceCompute={isActiveFilter}
      >
        <Panel
          hasHeader
          title="Hit navigator"
          headerActions={[
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
          ]}
        >
          {sortDialogOpen && (
            <MoleculeListSortFilterDialog
              open={sortDialogOpen}
              anchorEl={sortDialogAnchorEl}
              molGroupSelection={object_selection}
              cachedMolList={cached_mol_lists}
              filter={filter}
              filterSettings={filterSettings}
            />
          )}
          <div ref={filterRef}>
            {isActiveFilter && (
              <>
                <div className={classes.filterSection}>
                  <Grid container spacing={1}>
                    <Grid item xs={1} container alignItems="center">
                      <Typography variant="subtitle2" className={classes.filterTitle}>
                        Filters
                      </Typography>
                    </Grid>
                    <Grid item xs={11}>
                      <Grid container direction="row" justify="flex-start" spacing={1}>
                        {filterSettings.priorityOrder.map(attr => (
                          <Grid item key={`Mol-Tooltip-${attr}`}>
                            <Tooltip
                              title={`${filterSettings.filter[attr].minValue}-${filterSettings.filter[attr].maxValue} ${
                                filterSettings.filter[attr].order === 1 ? '\u2191' : '\u2193'
                              }`}
                              placement="top"
                            >
                              <Chip
                                size="small"
                                label={attr}
                                style={{ backgroundColor: getAttrDefinition(attr).color }}
                              />
                            </Tooltip>
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  </Grid>
                </div>
                <Divider />
              </>
            )}
          </div>
          <Grid
            container
            direction="column"
            justify="flex-start"
            className={classes.container}
            style={{ height: height }}
          >
            <Grid item>
              {/* Header */}
              <Grid container justify="flex-start" direction="row" className={classes.molHeader} wrap="nowrap">
                <Grid item container justify="flex-start" direction="row">
                  {Object.keys(moleculeProperty).map(key => (
                    <Grid item key={key} className={classes.rightBorder}>
                      {moleculeProperty[key]}
                    </Grid>
                  ))}
                  {currentMolecules.length > 0 && (
                    <Grid item>
                      <Grid
                        container
                        direction="row"
                        justify="flex-start"
                        alignItems="center"
                        wrap="nowrap"
                        className={classes.contButtonsMargin}
                      >
                        <Tooltip title="all alls">
                          <Grid item>
                            <Button
                              variant="outlined"
                              className={classNames(
                                classes.contColButton,
                                {
                                  [classes.contColButtonSelected]: hasAllValuesOn
                                },
                                {
                                  [classes.contColButtonHalfSelected]: hasSomeValuesOn
                                }
                              )}
                              onClick={() => {
                                // TODO rework all these buttons into a separate component!
                                // always deselect all if are selected only some of options
                                selectedAll.current = hasSomeValuesOn ? false : !selectedAll.current;

                                onButtonToggle('ligand', true);
                                onButtonToggle('protein', true);
                                onButtonToggle('complex', true);
                                onButtonToggle('surface', true);
                                // onDensity(true);
                                // onVector(true);
                              }}
                              disabled={disableUserInteraction}
                            >
                              <Typography variant="subtitle2">A</Typography>
                            </Button>
                          </Grid>
                        </Tooltip>
                        <Tooltip title="all ligands">
                          <Grid item>
                            <Button
                              variant="outlined"
                              className={classNames(classes.contColButton, {
                                [classes.contColButtonSelected]: isLigandOn
                              })}
                              onClick={() => onButtonToggle('ligand')}
                              disabled={disableUserInteraction}
                            >
                              <Typography variant="subtitle2">L</Typography>
                            </Button>
                          </Grid>
                        </Tooltip>
                        <Tooltip title="all sidechains">
                          <Grid item>
                            <Button
                              variant="outlined"
                              className={classNames(classes.contColButton, {
                                [classes.contColButtonSelected]: isProteinOn
                              })}
                              onClick={() => onButtonToggle('protein')}
                              disabled={disableUserInteraction}
                            >
                              <Typography variant="subtitle2">P</Typography>
                            </Button>
                          </Grid>
                        </Tooltip>
                        <Tooltip title="all interactions">
                          <Grid item>
                            {/* C stands for contacts now */}
                            <Button
                              variant="outlined"
                              className={classNames(classes.contColButton, {
                                [classes.contColButtonSelected]: isComplexOn
                              })}
                              onClick={() => onButtonToggle('complex')}
                              disabled={disableUserInteraction}
                            >
                              <Typography variant="subtitle2">C</Typography>
                            </Button>
                          </Grid>
                        </Tooltip>
                        <Tooltip title="all surfaces">
                          <Grid item>
                            <Button
                              variant="outlined"
                              className={classNames(classes.contColButton, {
                                [classes.contColButtonSelected]: isSurfaceOn
                              })}
                              onClick={() => onButtonToggle('surface')}
                              disabled={disableUserInteraction}
                            >
                              <Typography variant="subtitle2">S</Typography>
                            </Button>
                          </Grid>
                        </Tooltip>
                        <Tooltip title="all electron densities">
                          <Grid item>
                            {/* TODO waiting for backend data */}
                            <Button
                              variant="outlined"
                              className={classNames(classes.contColButton, {
                                [classes.contColButtonSelected]: isDensityOn
                              })}
                              onClick={() => onButtonToggle('density')}
                              disabled={true || disableUserInteraction}
                            >
                              <Typography variant="subtitle2">D</Typography>
                            </Button>
                          </Grid>
                        </Tooltip>
                        <Tooltip title="all vectors">
                          <Grid item>
                            <Button
                              variant="outlined"
                              className={classNames(classes.contColButton, {
                                [classes.contColButtonSelected]: isVectorOn
                              })}
                              onClick={() => onButtonToggle('vector')}
                              disabled={true || disableUserInteraction}
                            >
                              <Typography variant="subtitle2">V</Typography>
                            </Button>
                          </Grid>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Grid>
            {currentMolecules.length > 0 && (
              <Grid item className={classes.gridItemList}>
                <InfiniteScroll
                  pageStart={0}
                  loadMore={loadNextMolecules}
                  hasMore={canLoadMore}
                  loader={
                    <div className="loader" key={0}>
                      <Grid
                        container
                        direction="row"
                        justify="center"
                        alignItems="center"
                        className={classes.paddingProgress}
                      >
                        <CircularProgress />
                      </Grid>
                    </div>
                  }
                  useWindow={false}
                >
                  {currentMolecules.map(data => (
                    <MoleculeView key={data.id} imageHeight={imgHeight} imageWidth={imgWidth} data={data} />
                  ))}
                </InfiniteScroll>
              </Grid>
            )}
          </Grid>
        </Panel>
      </ComputeSize>
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
MoleculeList.displayName = 'MoleculeList';
export default connect(mapStateToProps, mapDispatchToProps)(MoleculeList);
