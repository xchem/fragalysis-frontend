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
  IconButton,
  ButtonGroup
} from '@material-ui/core';
import React, { useState, useEffect, memo, useRef, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DatasetMoleculeView } from './datasetMoleculeView';
import { colourList } from '../preview/molecule/utils/color';
import InfiniteScroll from 'react-infinite-scroller';
import { Button } from '../common/Inputs/Button';
import { Panel } from '../common/Surfaces/Panel';
import { ComputeSize } from '../../utils/computeSize';
import { VIEWS } from '../../constants/constants';
import { NglContext } from '../nglView/nglProvider';
// import { useDisableUserInteraction } from '../helpers/useEnableUserInteracion';
import classNames from 'classnames';
import {
  addDatasetLigand,
  removeDatasetLigand,
  addDatasetHitProtein,
  removeDatasetHitProtein,
  addDatasetComplex,
  removeDatasetComplex,
  addDatasetSurface,
  removeDatasetSurface,
  autoHideDatasetDialogsOnScroll,
  moveMoleculeInspirationsSettings,
  removeSelectedDatasetMolecules,
  removeAllSelectedDatasetMolecules,
  dragDropMoleculeInProgress
} from './redux/dispatchActions';
import { setFilterDialogOpen, setSearchStringOfCompoundSet } from './redux/actions';
import { DatasetFilter } from './datasetFilter';
import { FilterList, Search, Link } from '@material-ui/icons';
import { getFilteredDatasetMoleculeList } from './redux/selectors';
import { debounce } from 'lodash';
import { InspirationDialog } from './inspirationDialog';
import { CrossReferenceDialog } from './crossReferenceDialog';
import { AlertModal } from '../common/Modal/AlertModal';
import { hideAllSelectedMolecules } from '../preview/molecule/redux/dispatchActions';
import { getMoleculeList } from '../preview/molecule/redux/selectors';
import { setSelectedAllByType, setDeselectedAllByType } from './redux/actions';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { sortMoleculesByDragDropState } from './helpers';
import useDisableNglControlButtons from '../../hooks/useDisableNglControlButtons';

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
    height: `calc(100% - ${theme.spacing(6)}px - ${theme.spacing(2)}px)`
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
    width: 'inherit'
  },
  rank: {
    width: theme.spacing(3),
    marginLeft: -theme.spacing(1) / 4,
    fontStyle: 'italic',
    fontSize: 8,
    overflow: 'hidden',
    textAlign: 'center',
    borderRight: '1px solid',
    borderRightColor: theme.palette.background.divider
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
      backgroundColor: theme.palette.primary.light
      // color: theme.palette.primary.contrastText
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
      backgroundColor: theme.palette.primary.main
      // color: theme.palette.black
    }
  },
  contColButtonHalfSelected: {
    backgroundColor: theme.palette.primary.semidark,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.semidark
      // color: theme.palette.black
    }
  },
  propertyChip: {
    fontWeight: 'bolder'
  },
  search: {
    margin: theme.spacing(1),
    width: 140,
    '& .MuiInputBase-root': {
      color: theme.palette.white
    },
    '& .MuiInput-underline:before': {
      borderBottomColor: theme.palette.white
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: theme.palette.white
    }
  },
  loading: {
    paddingTop: theme.spacing(2)
  },
  total: {
    ...theme.typography.button,
    color: theme.palette.primary.main,
    fontStyle: 'italic'
  }
}));

export const DatasetMoleculeList = memo(
  ({ height, setFilterItemsHeight, filterItemsHeight, title, datasetID, url }) => {
    const classes = useStyles();
    const dispatch = useDispatch();

    const [nextXMolecules, setNextXMolecules] = useState(0);
    const moleculesPerPage = 5;
    const [currentPage, setCurrentPage] = useState(0);

    const imgHeight = 34;
    const imgWidth = 150;
    const sortDialogOpen = useSelector(state => state.datasetsReducers.filterDialogOpen);
    const isOpenInspirationDialog = useSelector(state => state.datasetsReducers.isOpenInspirationDialog);
    const isOpenCrossReferenceDialog = useSelector(state => state.datasetsReducers.isOpenCrossReferenceDialog);
    const searchString = useSelector(state => state.datasetsReducers.searchString);

    const moleculeLists = useSelector(state => state.datasetsReducers.moleculeLists);
    const dragDropMap = useSelector(state => state.datasetsReducers.dragDropMap);
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
    const [selectedMoleculeRef, setSelectedMoleculeRef] = useState(null);

    const [disableAllNglControlButtonsMap, withDisabledNglControlButton] = useDisableNglControlButtons();

    const filterRef = useRef();
    let joinedMoleculeLists = moleculeLists[datasetID] || [];
    const dragDropState = dragDropMap[datasetID];

    const getJoinedMoleculeList = useSelector(state => getMoleculeList(state));
    const inspirationMoleculeDataList = useSelector(state => state.datasetsReducers.allInspirationMoleculeDataList);

    // const disableUserInteraction = useDisableUserInteraction();

    // TODO Reset Infinity scroll

    if (isActiveFilter) {
      if (dragDropState) {
        joinedMoleculeLists = sortMoleculesByDragDropState(filteredDatasetMolecules, dragDropState);
      } else {
        joinedMoleculeLists = filteredDatasetMolecules;
      }
    } else {
      if (dragDropState) {
        joinedMoleculeLists = sortMoleculesByDragDropState(joinedMoleculeLists, dragDropState);
      } else {
        // default sort is by site
        joinedMoleculeLists.sort((a, b) => a.site - b.site);
      }
    }

    if (searchString !== null) {
      joinedMoleculeLists = joinedMoleculeLists.filter(molecule =>
        molecule.name.toLowerCase().includes(searchString.toLowerCase())
      );
    }
    const loadNextMolecules = async () => {
      await setNextXMolecules(0);
      setCurrentPage(currentPage + 1);
    };
    const listItemOffset = (currentPage + 1) * moleculesPerPage + nextXMolecules;

    const currentMolecules = joinedMoleculeLists.slice(0, listItemOffset);
    // setCurrentMolecules(currentMolecules);
    const canLoadMore = listItemOffset < joinedMoleculeLists.length;
    useEffect(() => {
      if (isActiveFilter === false) {
        setFilterItemsHeight(0);
      }
    }, [isActiveFilter, setFilterItemsHeight]);

    const selectedAll = useRef(false);

    const objectsInView = useSelector(state => state.nglReducers.objectsInView) || {};

    const proteinListMolecule = useSelector(state => state.selectionReducers.proteinList);
    const complexListMolecule = useSelector(state => state.selectionReducers.complexList);
    const fragmentDisplayListMolecule = useSelector(state => state.selectionReducers.fragmentDisplayList);
    const surfaceListMolecule = useSelector(state => state.selectionReducers.surfaceList);
    const densityListMolecule = useSelector(state => state.selectionReducers.densityList);
    const densityListCustomMolecule = useSelector(state => state.selectionReducers.densityListCustom);
    const vectorOnListMolecule = useSelector(state => state.selectionReducers.vectorOnList);
    const qualityListMolecule = useSelector(state => state.selectionReducers.qualityList);

    const ligandList = useSelector(state => state.datasetsReducers.ligandLists[datasetID]);
    const proteinList = useSelector(state => state.datasetsReducers.proteinLists[datasetID]);
    const complexList = useSelector(state => state.datasetsReducers.complexLists[datasetID]);
    const surfaceList = useSelector(state => state.datasetsReducers.surfaceLists[datasetID]);

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

    const removeSelectedTypesOfInspirations = (skipMolecules = [], skipTracking = false) => {
      const molecules = [...getJoinedMoleculeList, ...inspirationMoleculeDataList].filter(
        molecule => !skipMolecules.includes(molecule)
      );
      dispatch(hideAllSelectedMolecules(stage, [...molecules], false, skipTracking));
    };

    const removeOfSelectedTypes = (skipMolecules = {}, skipTracking = false) => {
      dispatch(removeSelectedDatasetMolecules(stage, skipTracking, skipMolecules));
    };

    const moveSelectedMoleculeInspirationsSettings = (data, newItemData, skipTracking) => (dispatch, getState) => {
      return dispatch(
        moveMoleculeInspirationsSettings(
          data,
          newItemData,
          stage,
          objectsInView,
          fragmentDisplayListMolecule,
          proteinListMolecule,
          complexListMolecule,
          surfaceListMolecule,
          densityListMolecule,
          densityListCustomMolecule,
          vectorOnListMolecule,
          qualityListMolecule,
          skipTracking
        )
      );
    };

    // TODO "currentMolecules" do not need to correspondent to selections in {type}List
    // TODO so this could lead to inconsistend behaviour while scrolling
    // TODO maybe change "currentMolecules.forEach" to "{type}List.forEach"

    const removeSelectedType = (type, skipTracking) => {
      joinedMoleculeLists.forEach(molecule => {
        dispatch(
          removeType[type](stage, molecule, colourList[molecule.id % colourList.length], datasetID, skipTracking)
        );
      });
      selectedAll.current = false;
    };

    const addNewType = (type, skipTracking) => {
      withDisabledNglControlButton(type, async () => {
        const promises = [];

        joinedMoleculeLists.forEach(molecule => {
          promises.push(
            dispatch(
              addType[type](stage, molecule, colourList[molecule.id % colourList.length], datasetID, skipTracking)
            )
          );
        });

        await Promise.all(promises);
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
          let molecules = getSelectedMoleculesByType(type, true);
          dispatch(setSelectedAllByType(type, datasetID, molecules));
          addNewType(type, true);
        } else {
          let molecules = getSelectedMoleculesByType(type, false);
          dispatch(setDeselectedAllByType(type, datasetID, molecules));
          removeSelectedType(type, true);
        }
      }
    };

    const getSelectedMoleculesByType = (type, isAdd) => {
      switch (type) {
        case 'ligand':
          return isAdd ? getMoleculesToSelect(ligandList) : getMoleculesToDeselect(ligandList);
        case 'protein':
          return isAdd ? getMoleculesToSelect(proteinList) : getMoleculesToDeselect(proteinList);
        case 'complex':
          return isAdd ? getMoleculesToSelect(complexList) : getMoleculesToDeselect(complexList);
        default:
          return null;
      }
    };

    const getMoleculesToSelect = list => {
      let molecules = joinedMoleculeLists.filter(m => !list.includes(m.id));
      let data = molecules.map(m => {
        return { datasetID, molecule: m };
      });
      return data;
    };

    const getMoleculesToDeselect = list => {
      let molecules = joinedMoleculeLists.filter(m => list.includes(m.id));
      let data = molecules.map(m => {
        return { datasetID, molecule: m };
      });
      return data;
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
    /*useEffect(() => {
      // setCurrentPage(0);
    }, [object_selection]);*/

    const crossReferenceDialogRef = useRef();
    const inspirationDialogRef = useRef();
    const scrollBarRef = useRef();

    const [isOpenAlert, setIsOpenAlert] = useState(false);

    const moveMolecule = (dragIndex, hoverIndex) => {
      dispatch(dragDropMoleculeInProgress(datasetID, joinedMoleculeLists, dragIndex, hoverIndex));
    };

    return (
      <ComputeSize
        componentRef={filterRef.current}
        setHeight={setFilterItemsHeight}
        height={filterItemsHeight}
        forceCompute={isActiveFilter}
      >
        <Panel hasHeader title={title} withTooltip headerActions={actions}>
          <AlertModal
            title="Are you sure?"
            description={`Loading of ${joinedMoleculeLists?.length} may take a long time`}
            open={isOpenAlert}
            handleOnOk={() => {
              setNextXMolecules(joinedMoleculeLists?.length || 0);
              setIsOpenAlert(false);
            }}
            handleOnCancel={() => {
              setIsOpenAlert(false);
            }}
          />
          {sortDialogOpen && (
            <DatasetFilter
              open={sortDialogOpen}
              anchorEl={sortDialogAnchorEl}
              datasetID={datasetID}
              filterProperties={filterProperties}
              active={filterSettings && filterSettings.active}
              predefined={filterSettings && filterSettings.predefined}
              priorityOrder={filterSettings && filterSettings.priorityOrder}
              setSortDialogAnchorEl={setSortDialogAnchorEl}
            />
          )}
          {isOpenInspirationDialog && (
            <InspirationDialog open anchorEl={selectedMoleculeRef} datasetID={datasetID} ref={inspirationDialogRef} />
          )}
          {isOpenCrossReferenceDialog && (
            <CrossReferenceDialog open anchorEl={selectedMoleculeRef} ref={crossReferenceDialogRef} />
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
                    <Tooltip title="Total count of compounds">
                      <Grid item className={classes.rank}>
                        {`Total ${joinedMoleculeLists?.length}`}
                      </Grid>
                    </Tooltip>
                    {datasetID &&
                      filteredScoreProperties &&
                      filteredScoreProperties[datasetID] &&
                      filteredScoreProperties[datasetID].map(score => (
                        <Tooltip key={score.id} title={`${score.name} - ${score.description}`}>
                          <Grid item className={classes.rightBorder}>
                            {score?.name?.substring(0, 4)}
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
                                disabled={disableAllNglControlButtonsMap.ligand}
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
                                disabled={disableAllNglControlButtonsMap.protein}
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
                                disabled={disableAllNglControlButtonsMap.complex}
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
            {isLoadingMoleculeList && (
              <Grid item container alignItems="center" justify="center" className={classes.loading}>
                <Grid item>
                  <CircularProgress />
                </Grid>
              </Grid>
            )}
            {isLoadingMoleculeList === false && currentMolecules.length > 0 && (
              <>
                <Grid item className={classes.gridItemList} ref={scrollBarRef}>
                  <InfiniteScroll
                    getScrollParent={() =>
                      dispatch(
                        autoHideDatasetDialogsOnScroll({
                          inspirationDialogRef,
                          crossReferenceDialogRef,
                          scrollBarRef
                        })
                      )
                    }
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
                    {datasetID && (
                      <DndProvider backend={HTML5Backend}>
                        {currentMolecules.map((data, index, array) => (
                          <DatasetMoleculeView
                            key={data.id}
                            index={index}
                            imageHeight={imgHeight}
                            imageWidth={imgWidth}
                            data={data}
                            datasetID={datasetID}
                            setRef={setSelectedMoleculeRef}
                            showCrossReferenceModal
                            previousItemData={index > 0 && array[index - 1]}
                            nextItemData={index < array?.length && array[index + 1]}
                            removeSelectedTypes={removeOfSelectedTypes}
                            removeSelectedTypesOfInspirations={removeSelectedTypesOfInspirations}
                            moveSelectedMoleculeInspirationsSettings={moveSelectedMoleculeInspirationsSettings}
                            L={ligandList.includes(data.id)}
                            P={proteinList.includes(data.id)}
                            C={complexList.includes(data.id)}
                            S={surfaceList.includes(data.id)}
                            V={false}
                            moveMolecule={moveMolecule}
                            disableAllNglControlsButtonMap={disableAllNglControlButtonsMap}
                          />
                        ))}
                      </DndProvider>
                    )}
                  </InfiniteScroll>
                </Grid>
                <Grid item>
                  <Grid container justify="space-between" alignItems="center" direction="row">
                    <Grid item>
                      <span className={classes.total}>{`Total ${joinedMoleculeLists?.length}`}</span>
                    </Grid>
                    <Grid item>
                      <ButtonGroup
                        variant="text"
                        size="medium"
                        color="primary"
                        aria-label="contained primary button group"
                      >
                        <Button
                          onClick={() => {
                            setNextXMolecules(30);
                          }}
                        >
                          Load next 30
                        </Button>
                        <Button
                          onClick={() => {
                            setNextXMolecules(100);
                          }}
                        >
                          Load next 100
                        </Button>
                        <Button
                          onClick={() => {
                            if (joinedMoleculeLists?.length > 300) {
                              setIsOpenAlert(true);
                            } else {
                              setNextXMolecules(joinedMoleculeLists?.length || 0);
                            }
                          }}
                        >
                          Load full list
                        </Button>
                      </ButtonGroup>
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}
          </Grid>
        </Panel>
      </ComputeSize>
    );
  }
);
