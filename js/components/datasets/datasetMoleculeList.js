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
  TextField,
  InputAdornment,
  IconButton
} from '@material-ui/core';
import React, { useState, useEffect, memo, useRef, useContext, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DatasetMoleculeView, colourList } from './datasetMoleculeView';
import InfiniteScroll from 'react-infinite-scroller';
import { Button } from '../common/Inputs/Button';
import { Panel } from '../common/Surfaces/Panel';
import { ComputeSize } from '../../utils/computeSize';
import { VIEWS } from '../../constants/constants';
import { NglContext } from '../nglView/nglProvider';
import { useDisableUserInteraction } from '../helpers/useEnableUserInteracion';
import classNames from 'classnames';
import {
  addDatasetLigand,
  removeDatasetLigand,
  addDatasetHitProtein,
  removeDatasetHitProtein,
  addDatasetComplex,
  removeDatasetComplex,
  addDatasetSurface,
  removeDatasetSurface
} from './redux/dispatchActions';
import { setFilterDialogOpen, setSearchStringOfCompoundSet } from './redux/actions';
import { DatasetFilter } from './datasetFilter';
import { FilterList, Search, Link } from '@material-ui/icons';
import { getFilteredDatasetMoleculeList } from './redux/selectors';
import { debounce } from 'lodash';
import { InspirationDialog } from './inspirationDialog';

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
    marginLeft: 3,
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
    width: 32,
    textAlign: 'center',
    '&:last-child': {
      borderRight: 'none',
      width: 32
    },
    overflow: 'hidden',
    whiteSpace: 'nowrap'
  },
  contButtonsMargin: {
    margin: theme.spacing(1) / 2
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
  propertyChip: {
    fontWeight: 'bolder'
  },
  search: {
    margin: theme.spacing(1),
    width: 140,
    '& .MuiInputBase-root': {
      color: 'white'
    },
    '& .MuiInput-underline:before': {
      borderBottomColor: 'white'
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: 'white'
    }
  }
}));

export const DatasetMoleculeList = memo(
  ({ height, setFilterItemsHeight, filterItemsHeight, moleculeGroupList, title, datasetID, url }) => {
    const classes = useStyles();
    const dispatch = useDispatch();

    const moleculesPerPage = 5;
    const [currentPage, setCurrentPage] = useState(0);

    const imgHeight = 34;
    const imgWidth = 150;
    const sortDialogOpen = useSelector(state => state.datasetsReducers.filterDialogOpen);
    const isOpenInspirationDialog = useSelector(state => state.datasetsReducers.isOpenInspirationDialog);

    const searchString = useSelector(state => state.datasetsReducers.searchString);
    const moleculeLists = useSelector(state => state.datasetsReducers.moleculeLists);
    const isLoadingMoleculeList = useSelector(state => state.datasetsReducers.isLoadingMoleculeList);
    const filteredScoreProperties = useSelector(state => state.datasetsReducers.filteredScoreProperties);
    const filterMap = useSelector(state => state.datasetsReducers.filterDatasetMap);
    const filterSettings = filterMap && datasetID && filterMap[datasetID];
    const filterPropertiesMap = useSelector(state => state.datasetsReducers.filterPropertiesDatasetMap);
    const filterProperties = filterPropertiesMap && datasetID && filterPropertiesMap[datasetID];
    const filteredDatasetMolecules = useSelector(state => getFilteredDatasetMoleculeList(state, datasetID));

    const [sortDialogAnchorEl, setSortDialogAnchorEl] = useState(null);
    const isActiveFilter = !!(filterSettings || {}).active;

    const { getNglView } = useContext(NglContext);
    const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

    const [selectedInspirationMoleculeRef, setSelectedInspirationMoleculeRef] = useState(null);
    const filterRef = useRef();

    let joinedMoleculeLists = moleculeLists[datasetID] || [];

    const disableUserInteraction = useDisableUserInteraction();

    // TODO Reset Infinity scroll
    /*useEffect(() => {
      // setCurrentPage(0);
    }, [object_selection]);*/

    if (isActiveFilter) {
      joinedMoleculeLists = filteredDatasetMolecules;
    } else {
      // default sort is by site
      joinedMoleculeLists.sort((a, b) => a.site - b.site);
    }
    if (searchString !== null) {
      joinedMoleculeLists = joinedMoleculeLists.filter(molecule =>
        molecule.name.toLowerCase().includes(searchString.toLowerCase())
      );
    }

    const loadNextMolecules = () => {
      setCurrentPage(currentPage + 1);
    };

    const listItemOffset = (currentPage + 1) * moleculesPerPage;
    const currentMolecules = joinedMoleculeLists.slice(0, listItemOffset);
    // setCurrentMolecules(currentMolecules);
    const canLoadMore = listItemOffset < joinedMoleculeLists.length;

    useEffect(() => {
      if (isActiveFilter === false) {
        setFilterItemsHeight(0);
      }
    }, [isActiveFilter, setFilterItemsHeight]);

    const selectedAll = useRef(false);
    const ligandList = useSelector(state => state.datasetsReducers.ligandLists[datasetID]);
    const proteinList = useSelector(state => state.datasetsReducers.proteinLists[datasetID]);
    const complexList = useSelector(state => state.datasetsReducers.complexLists[datasetID]);

    const isLigandOn = (ligandList && ligandList.length > 0) || false;
    const isProteinOn = (proteinList && proteinList.length > 0) || false;
    const isComplexOn = (complexList && complexList.length > 0) || false;

    const addType = {
      ligand: addDatasetLigand,
      protein: addDatasetHitProtein,
      complex: addDatasetComplex,
      surface: addDatasetSurface
    };

    const removeType = {
      ligand: removeDatasetLigand,
      protein: removeDatasetHitProtein,
      complex: removeDatasetComplex,
      surface: removeDatasetSurface
    };

    // TODO "currentMolecules" do not need to correspondent to selections in {type}List
    // TODO so this could lead to inconsistend behaviour while scrolling
    // TODO maybe change "currentMolecules.forEach" to "{type}List.forEach"

    const removeSelectedType = type => {
      joinedMoleculeLists.forEach(molecule => {
        dispatch(removeType[type](stage, molecule, colourList[molecule.id % colourList.length], datasetID));
      });
      selectedAll.current = false;
    };

    const addNewType = type => {
      joinedMoleculeLists.forEach(molecule => {
        dispatch(addType[type](stage, molecule, colourList[molecule.id % colourList.length], datasetID));
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
          dispatch(setSearchStringOfCompoundSet(event.target.value !== '' ? event.target.value : null));
        }, 350);
      }
      debouncedFn();
    };
    const actions = [
      <TextField
        className={classes.search}
        id="input-with-icon-textfield"
        placeholder="Search"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search color="inherit" />
            </InputAdornment>
          )
        }}
        onChange={handleSearch}
        disabled={isLoadingMoleculeList}
      />,
      <IconButton color={'inherit'} onClick={() => window.open(url, '_blank')}>
        <Tooltip title="Link to dataset">
          <Link />
        </Tooltip>
      </IconButton>,
      <IconButton
        onClick={event => {
          if (sortDialogOpen === false) {
            setSortDialogAnchorEl(filterRef.current);
            dispatch(setFilterDialogOpen(true));
          } else {
            setSortDialogAnchorEl(null);
            dispatch(setFilterDialogOpen(false));
          }
        }}
        color={'inherit'}
        disabled={isLoadingMoleculeList}
      >
        <Tooltip title="Filter/Sort">
          <FilterList />
        </Tooltip>
      </IconButton>
    ];

    const inspirationDialogRef = useRef();
    const scrollBarRef = useRef();

    const handleIntersect = (changes, observer) => {
      //useCallback(
      let previousY = 0;
      let previousRatio = 0;
      console.log(changes, observer);

      changes.forEach(entry => {
        const currentY = entry.boundingClientRect.y;
        const currentRatio = entry.intersectionRatio;
        const isIntersecting = entry.isIntersecting;

        // Scrolling down/up
        if (currentY < previousY) {
          if (currentRatio > previousRatio && isIntersecting) {
            console.log('Scrolling down enter');
          } else {
            console.log('Scrolling down leave');
          }
        } else if (currentY > previousY && isIntersecting) {
          if (currentRatio < previousRatio) {
            console.log('Scrolling up leave');
          } else {
            console.log('Scrolling up enter');
          }
        }

        previousY = currentY;
        previousRatio = currentRatio;
      });
    }; //, []);

    //  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, {
      // root: scrollBarRef && scrollBarRef.current,
      rootMargin: '100px'
      //threshold: [0.98, 0.99, 1]
    });
    // if (inspirationDialogRef.current) {
    console.log('has observed');
    if (inspirationDialogRef && inspirationDialogRef.current) {
      observer.observe(inspirationDialogRef.current);
    }
    // }
    // }, [handleIntersect]);

    return (
      <ComputeSize
        componentRef={filterRef.current}
        setHeight={setFilterItemsHeight}
        height={filterItemsHeight}
        forceCompute={isActiveFilter}
      >
        <Panel hasHeader title={title} withTooltip headerActions={actions} isLoading={isLoadingMoleculeList}>
          {sortDialogOpen && (
            <DatasetFilter
              open={sortDialogOpen}
              anchorEl={sortDialogAnchorEl}
              moleculeGroupList={moleculeGroupList}
              datasetID={datasetID}
              filterProperties={filterProperties}
              active={filterSettings && filterSettings.active}
              predefined={filterSettings && filterSettings.predefined}
              priorityOrder={filterSettings && filterSettings.priorityOrder}
            />
          )}
          {isOpenInspirationDialog && (
            <InspirationDialog
              open
              anchorEl={selectedInspirationMoleculeRef}
              datasetID={datasetID}
              ref={inspirationDialogRef}
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
                              title={`${filterProperties[attr].minValue}-${filterProperties[attr].maxValue} ${
                                filterProperties[attr].order === 1 ? '\u2191' : '\u2193'
                              }`}
                              placement="top"
                            >
                              <Chip size="small" label={attr} className={classes.propertyChip} />
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
              {isLoadingMoleculeList === false && (
                <Grid container justify="flex-start" direction="row" className={classes.molHeader} wrap="nowrap">
                  <Grid item container justify="flex-start" direction="row">
                    {datasetID &&
                      filteredScoreProperties &&
                      filteredScoreProperties[datasetID] &&
                      filteredScoreProperties[datasetID].map(score => (
                        <Tooltip key={score.id} title={`${score.name} - ${score.description}`}>
                          <Grid item className={classes.rightBorder}>
                            {score.name.substring(0, 4)}
                          </Grid>
                        </Tooltip>
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
                                  [classes.contColButtonSelected]: isLigandOn
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
                                  [classes.contColButtonSelected]: isProteinOn
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
                                  [classes.contColButtonSelected]: isComplexOn
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
              )}
            </Grid>
            {isLoadingMoleculeList === false && currentMolecules.length > 0 && (
              <Grid item className={classes.gridItemList} ref={scrollBarRef}>
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
                  {datasetID &&
                    currentMolecules.map((data, index) => (
                      <DatasetMoleculeView
                        key={index}
                        imageHeight={imgHeight}
                        imageWidth={imgWidth}
                        data={data}
                        datasetID={datasetID}
                        setRef={setSelectedInspirationMoleculeRef}
                      />
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
