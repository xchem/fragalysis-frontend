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
  FormControl,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton
} from '@material-ui/core';
import React, { useState, useEffect, memo, useRef, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MoleculeView, { colourList } from './moleculeView';
import { MoleculeListSortFilterDialog, filterMolecules, getAttrDefinition } from './moleculeListSortFilterDialog';
import InfiniteScroll from 'react-infinite-scroller';
import { Button } from '../../common/Inputs/Button';
import { Panel } from '../../common/Surfaces/Panel';
import { ComputeSize } from '../../../utils/computeSize';
import { moleculeProperty } from './helperConstants';
import { VIEWS } from '../../../constants/constants';
import { NglContext } from '../../nglView/nglProvider';
import { useDisableUserInteraction } from '../../helpers/useEnableUserInteracion';
import classNames from 'classnames';
import {
  addVector,
  removeVector,
  addHitProtein,
  removeHitProtein,
  addComplex,
  removeComplex,
  addSurface,
  removeSurface,
  addDensity,
  removeDensity,
  addLigand,
  removeLigand,
  hideAllSelectedMolecules,
  initializeMolecules
} from './redux/dispatchActions';
import { DEFAULT_FILTER, PREDEFINED_FILTERS } from '../../../reducers/selection/constants';
import { DeleteSweep, FilterList, Search } from '@material-ui/icons';
import { selectJoinedMoleculeList } from './redux/selectors';
import { debounce } from 'lodash';
import { MOL_ATTRIBUTES } from './redux/constants';
import { setFilter } from '../../../reducers/selection/actions';
import { initializeFilter } from '../../../reducers/selection/dispatchActions';
import { getUrl, loadFromServer } from '../../../utils/genericList';
import * as listType from '../../../constants/listTypes';
import { useRouteMatch } from 'react-router-dom';
import { setSortDialogOpen } from './redux/actions';
import { setCachedMolLists, setMoleculeList } from '../../../reducers/api/actions';

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
    marginTop: theme.spacing(1) / 2,
    marginBottom: theme.spacing(1) / 2,
    marginLeft: theme.spacing(2)
  },
  contColButton: {
    minWidth: 'fit-content',
    paddingLeft: theme.spacing(1) / 4,
    paddingRight: theme.spacing(1) / 4,
    paddingBottom: 0,
    paddingTop: 0,
    fontWeight: 'bold',
    fontSize: 9,
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
  },
  formControl: {
    color: 'inherit',
    margin: theme.spacing(1),
    width: 87
    //   fontSize: '1.2rem'
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
  search: {
    margin: theme.spacing(1),
    width: 116,
    '& .MuiInputBase-root': {
      color: 'inherit'
    },
    '& .MuiInput-underline:before': {
      borderBottomColor: 'inherit'
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: 'inherit'
    }
  }
}));

export const MoleculeList = memo(({ height, setFilterItemsHeight, filterItemsHeight, hideProjects }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  let match = useRouteMatch();
  const target = match && match.params && match.params.target;

  const moleculesPerPage = 5;
  const [currentPage, setCurrentPage] = useState(0);
  const [searchString, setSearchString] = useState(null);
  const [sortDialogAnchorEl, setSortDialogAnchorEl] = useState(null);
  const oldUrl = useRef('');
  const setOldUrl = url => {
    oldUrl.current = url;
  };
  const list_type = listType.MOLECULE;
  const imgHeight = 34;
  const imgWidth = 150;
  const sortDialogOpen = useSelector(state => state.previewReducers.molecule.sortDialogOpen);
  const filter = useSelector(state => state.selectionReducers.filter);
  const getJoinedMoleculeList = useSelector(state => selectJoinedMoleculeList(state));
  const selectedAll = useRef(false);
  const proteinList = useSelector(state => state.selectionReducers.proteinList);
  const complexList = useSelector(state => state.selectionReducers.complexList);
  const object_selection = useSelector(state => state.selectionReducers.mol_group_selection);
  const fragmentDisplayList = useSelector(state => state.selectionReducers.fragmentDisplayList);
  const firstLoad = useSelector(state => state.selectionReducers.firstLoad);
  const target_on = useSelector(state => state.apiReducers.target_on);
  const mol_group_on = useSelector(state => state.apiReducers.mol_group_on);
  const cached_mol_lists = useSelector(state => state.apiReducers.cached_mol_lists);

  const [predefinedFilter, setPredefinedFilter] = useState(filter !== undefined ? filter.predefined : DEFAULT_FILTER);

  const isActiveFilter = !!(filter || {}).active;

  const { getNglView } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

  const filterRef = useRef();

  const disableUserInteraction = useDisableUserInteraction();

  // TODO Reset Infinity scroll
  /*useEffect(() => {
      // setCurrentPage(0);
    }, [object_selection]);*/

  let joinedMoleculeLists = [];
  if (searchString !== null) {
    joinedMoleculeLists = getJoinedMoleculeList.filter(molecule =>
      molecule.protein_code.toLowerCase().includes(searchString.toLowerCase())
    );
  } else {
    joinedMoleculeLists = getJoinedMoleculeList;
  }

  if (isActiveFilter) {
    joinedMoleculeLists = filterMolecules(joinedMoleculeLists, filter);
  } else {
    // default sort is by site
    joinedMoleculeLists.sort((a, b) => a.site - b.site);
  }

  const loadNextMolecules = () => {
    setCurrentPage(currentPage + 1);
  };

  const listItemOffset = (currentPage + 1) * moleculesPerPage;
  const currentMolecules = joinedMoleculeLists.slice(0, listItemOffset);
  const canLoadMore = listItemOffset < joinedMoleculeLists.length;

  const wereMoleculesInitialized = useRef(false);

  useEffect(() => {
    loadFromServer({
      url: getUrl({ list_type, target_on, mol_group_on }),
      setOldUrl: url => setOldUrl(url),
      old_url: oldUrl.current,
      list_type,
      setObjectList: list => {
        dispatch(setMoleculeList(list));
      },
      setCachedMolLists: list => {
        dispatch(setCachedMolLists(list));
      },
      mol_group_on,
      cached_mol_lists
    })
      .then(() => {
        dispatch(initializeFilter());
        if (
          stage &&
          cached_mol_lists &&
          cached_mol_lists[mol_group_on] &&
          hideProjects &&
          target !== undefined &&
          wereMoleculesInitialized.current === false
        ) {
          dispatch(initializeMolecules(stage, cached_mol_lists[mol_group_on]));
          wereMoleculesInitialized.current = true;
        }
      })
      .catch(error => {
        throw new Error(error);
      });
  }, [list_type, mol_group_on, stage, firstLoad, target_on, cached_mol_lists, dispatch, hideProjects, target]);

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
    dispatch(setFilter(filterSet));
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
      dispatch(setSortDialogOpen(false));
      // reset filter
      dispatch(setFilter(undefined));
      newFilter = dispatch(initializeFilter());
    }
    // currently do not filter molecules by excluding them
    /*setFilteredCount(getFilteredMoleculesCount(getListedMolecules(object_selection, cached_mol_lists), newFilter));
      handleFilterChange(newFilter);*/
  };

  const changeButtonClassname = (givenList = []) => {
    if (joinedMoleculeLists.length === givenList.length) {
      return true;
    } else if (givenList.length > 0) {
      return null;
    }
    return false;
  };

  const isLigandOn = changeButtonClassname(fragmentDisplayList);
  const isProteinOn = changeButtonClassname(proteinList);
  const isComplexOn = changeButtonClassname(complexList);

  const addType = {
    ligand: addLigand,
    protein: addHitProtein,
    complex: addComplex,
    surface: addSurface,
    density: addDensity,
    vector: addVector
  };

  const removeType = {
    ligand: removeLigand,
    protein: removeHitProtein,
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

  let debouncedFn;

  const handleSearch = event => {
    /* signal to React not to nullify the event object */
    event.persist();
    if (!debouncedFn) {
      debouncedFn = debounce(() => {
        setSearchString(event.target.value !== '' ? event.target.value : null);
      }, 350);
    }
    debouncedFn();
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
    <TextField
      className={classes.search}
      id="search-hit-navigator"
      placeholder="Search"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search color="inherit" />
          </InputAdornment>
        )
      }}
      onChange={handleSearch}
      disabled={disableUserInteraction || (getJoinedMoleculeList && getJoinedMoleculeList.length === 0)}
    />,

    <IconButton
      color={'inherit'}
      disabled={!(object_selection || []).length}
      onClick={() => dispatch(hideAllSelectedMolecules(stage, joinedMoleculeLists))}
    >
      <Tooltip title="Hide all">
        <DeleteSweep />
      </Tooltip>
    </IconButton>,
    <IconButton
      onClick={event => {
        if (sortDialogOpen === false) {
          setSortDialogAnchorEl(event.currentTarget);
          dispatch(setSortDialogOpen(true));
        } else {
          setSortDialogAnchorEl(null);
          dispatch(setSortDialogOpen(false));
        }
      }}
      color={'inherit'}
      disabled={!(object_selection || []).length || predefinedFilter !== 'none'}
    >
      <Tooltip title="Filter/Sort">
        <FilterList />
      </Tooltip>
    </IconButton>
  ];

  return (
    <ComputeSize
      componentRef={filterRef.current}
      setHeight={setFilterItemsHeight}
      height={filterItemsHeight}
      forceCompute={isActiveFilter}
    >
      <Panel hasHeader title="Hit navigator" headerActions={actions}>
        {sortDialogOpen && (
          <MoleculeListSortFilterDialog
            open={sortDialogOpen}
            anchorEl={sortDialogAnchorEl}
            molGroupSelection={object_selection}
            cachedMolList={cached_mol_lists}
            filter={filter}
            setSortDialogAnchorEl={setSortDialogAnchorEl}
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
                      {filter.priorityOrder.map(attr => (
                        <Grid item key={`Mol-Tooltip-${attr}`}>
                          <Tooltip
                            title={`${filter.filter[attr].minValue}-${filter.filter[attr].maxValue} ${
                              filter.filter[attr].order === 1 ? '\u2191' : '\u2193'
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
                      <Tooltip title="all ligands">
                        <Grid item>
                          <Button
                            variant="outlined"
                            className={classNames(classes.contColButton, {
                              [classes.contColButtonSelected]: isLigandOn === true,
                              [classes.contColButtonHalfSelected]: isLigandOn === null
                            })}
                            onClick={() => onButtonToggle('ligand')}
                            disabled={disableUserInteraction}
                          >
                            L
                          </Button>
                        </Grid>
                      </Tooltip>
                      <Tooltip title="all sidechains">
                        <Grid item>
                          <Button
                            variant="outlined"
                            className={classNames(classes.contColButton, {
                              [classes.contColButtonSelected]: isProteinOn,
                              [classes.contColButtonHalfSelected]: isProteinOn === null
                            })}
                            onClick={() => onButtonToggle('protein')}
                            disabled={disableUserInteraction}
                          >
                            P
                          </Button>
                        </Grid>
                      </Tooltip>
                      <Tooltip title="all interactions">
                        <Grid item>
                          {/* C stands for contacts now */}
                          <Button
                            variant="outlined"
                            className={classNames(classes.contColButton, {
                              [classes.contColButtonSelected]: isComplexOn,
                              [classes.contColButtonHalfSelected]: isComplexOn === null
                            })}
                            onClick={() => onButtonToggle('complex')}
                            disabled={disableUserInteraction}
                          >
                            C
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
});
