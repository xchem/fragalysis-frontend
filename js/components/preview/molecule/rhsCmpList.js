/**
 * Created by abradley on 14/03/2018.
 */
import { Grid, Tooltip, makeStyles, CircularProgress, IconButton, ButtonGroup } from '@material-ui/core';
import React, { useState, useEffect, memo, useRef, useContext, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { colourList, getRandomColor } from './utils/color';
import InfiniteScroll from 'react-infinite-scroller';
import { Button } from '../../common/Inputs/Button';
import { Panel } from '../../common/Surfaces/Panel';
import { ARROW_TYPE, VIEWS } from '../../../constants/constants';
import { NglContext } from '../../nglView/nglProvider';
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
  withDisabledDatasetMoleculesNglControlButtons,
  moveDatasetMolecule,
  deleteDataset,
  getTrackingActions,
  moveDatasetMoleculeUpDown,
  getAllVisibleButNotLockedCompounds,
  getObservationForLHSReference,
  getCurrentDatasetIterator,
  resetDatasetIterator,
  getInspirationsForMol
} from '../../datasets/redux/dispatchActions';
import {
  setAskLockCompoundsQuestion,
  setCrossReferenceCompoundName,
  setDragDropState,
  setIsOpenLockVisibleCompoundsDialogGlobal,
  setSearchStringOfCompoundSet,
  setCompoundToSelectedCompoundsByDataset,
  setSelectAllButtonForDataset,
  setInspirationDialogAction
} from '../../datasets/redux/actions';
import { FilterList, Link, DeleteForever, ArrowUpward, ArrowDownward, Edit } from '@material-ui/icons';
import { AlertModal } from '../../common/Modal/AlertModal';
import { setSelectedAllByType, setDeselectedAllByType } from '../../datasets/redux/actions';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import SearchField from '../../common/Components/SearchField';
import { compoundsColors } from '../compounds/redux/constants';
import {
  addComplex,
  addHitProtein,
  addSurface,
  removeComplex,
  removeHitProtein,
  removeSurface
} from './redux/dispatchActions';
import ObservationUnifiedViewWrapper from './observationUnifiedView/observationUnifiedViewWrapper';
import { v4 } from 'uuid';
import { setPanelsExpanded } from '../../../reducers/layout/actions';
import { layoutItemNames } from '../../../reducers/layout/constants';
import { useScrollToSelected } from '../../datasets/useScrollToSelected';
import useDisableDatasetNglControlButtons from '../../datasets/useDisableDatasetNglControlButtons';
import GroupDatasetNglControlButtonsContext from '../../datasets/groupDatasetNglControlButtonsContext';
import { CrossReferenceDialog } from '../../datasets/crossReferenceDialog';
import { getRHSCompoundsList } from './redux/selectors';
import { setRHSCompoundsList } from '../../../reducers/api/actions';
import { TooltipPathProvider } from '../../tooltip/TooltipPathContext';
import { RHS_OBSERVATION_VIEW_CONFIG } from './observationUnifiedView/viewConfigs';

const useStyles = makeStyles(theme => ({
  container: {
    height: '97%',
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
    height: `calc(97% - ${theme.spacing(6)}px - ${theme.spacing(2)}px)`,
    width: '100%'
  },
  gridItemListSmallSize: {
    overflow: 'auto',
    height: `calc(85% - ${theme.spacing(6)}px - ${theme.spacing(2)}px)`,
    width: '100%'
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
  paintAllButton: {
    minWidth: 'fit-content',
    paddingLeft: theme.spacing(1) / 4,
    paddingRight: theme.spacing(1) / 4,
    paddingBottom: 0,
    paddingTop: 0,
    fontWeight: 'bold',
    fontSize: 9,
    borderRadius: 0,
    borderColor: theme.palette.primary.main,
    backgroundColor: 'white',
    '&:hover': {
      backgroundColor: 'white'
      // color: theme.palette.primary.contrastText
    },
    '&:disabled': {
      borderRadius: 0,
      borderColor: 'white'
    }
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
  contColButtonUnselect: {
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
      borderColor: 'white',
      color: 'white'
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
    width: 140
  },
  loading: {
    paddingTop: theme.spacing(2)
  },
  total: {
    ...theme.typography.button,
    color: theme.palette.primary.main,
    fontStyle: 'italic'
  },
  arrowsHighlight: {
    borderColor: theme.palette.primary.main,
    border: 'solid 2px',
    backgroundColor: theme.palette.primary.main
  },
  arrow: {
    width: 20,
    height: 25,
    color: 'white',
    stroke: 'white',
    strokeWidth: 2
  },
  iconButton: {
    padding: 0
  },
  invisArrow: {
    width: 20,
    height: 25,
    visibility: 'hidden'
  },
  arrows: {
    height: '100%',
    border: 'solid 1px',
    borderColor: theme.palette.background.divider,
    borderStyle: 'solid solid solid solid'
  },
  [compoundsColors.blue.key]: {
    backgroundColor: compoundsColors.blue.color
  },
  [compoundsColors.red.key]: {
    backgroundColor: compoundsColors.red.color
  },
  [compoundsColors.green.key]: {
    backgroundColor: compoundsColors.green.color
  },
  [compoundsColors.purple.key]: {
    backgroundColor: compoundsColors.purple.color
  },
  [compoundsColors.apricot.key]: {
    backgroundColor: compoundsColors.apricot.color
  },
  textField: {
    marginLeft: theme.spacing(0.5),
    // marginRight: theme.spacing(1),
    width: 90,
    borderRadius: 10,

    '& .MuiFormLabel-root': {
      paddingLeft: theme.spacing(1)
    },
    '& .MuiInput-underline:before': {
      borderBottom: '0px solid'
    },
    '& .MuiInput-underline:after': {
      borderBottom: '0px solid'
    }
  },
  selectedInput: {
    border: `2px groove ${theme.palette.primary.main}`
  },
  classCheckbox: {
    padding: '0px'
  },
  editClassNameIcon: {
    padding: '0px',
    color: 'inherit'
  },
  editClassNameIconSelected: {
    padding: '0px',
    // color: theme.palette.primary.main
    color: 'red'
  },
  activeFilterIcon: {
    color: theme.palette.success.main,
    '&:hover': {
      color: theme.palette.success.dark
    }
  },
  dotOverlay: {
    fontSize: 9,
    position: 'absolute',
    top: 1,
    right: 3
  }
}));

//TODO: delte this in the end - now it's reimplemented via PoseListRHS
const RhsCmpList = ({ expandHandler }) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const [nextXMolecules, setNextXMolecules] = useState(0);
  const moleculesPerPage = 5;
  const [currentPage, setCurrentPage] = useState(0);

  const isOpenCrossReferenceDialog = useSelector(state => state.datasetsReducers.isOpenCrossReferenceDialog);
  const rhsWidth = useSelector(state => state.selectionReducers.rhsWidth);

  const moleculeLists = useSelector(state => state.datasetsReducers.moleculeLists);
  const isLoadingMoleculeList = useSelector(state => state.datasetsReducers.isLoadingMoleculeList);
  const filteredScoreProperties = useSelector(state => state.datasetsReducers.filteredScoreProperties);

  const searchString = useSelector(state => state.datasetsReducers.searchString);

  // const isActiveFilter = !!(filterSettings || {}).active;
  const { getNglView } = useContext(NglContext);

  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;
  const [selectedMoleculeRef, setSelectedMoleculeRef] = useState(null);

  // TODO there will be tags from datasets in future
  const datasetID = useSelector(state => state.datasetsReducers.datasets[0]?.id);

  const askLockCompoundsQuestion = useSelector(state => state.datasetsReducers.askLockCompoundsQuestion);

  const selectAllPressed = useSelector(state => state.datasetsReducers.isSelectedSelectAllButtonForDataset);

  const allMoleculesList = useSelector(state => state.apiReducers.all_mol_lists);

  const rhsCompoundsList = useSelector(state => getRHSCompoundsList(state));
  const currentMoleculeList = useSelector(state => state.datasetsReducers.moleculeLists[datasetID] || []);
  // const joinedMoleculeLists = useSelector(state => getJoinedMoleculeLists(datasetID, state), shallowEqual);
  // const joinedMoleculeLists = rhsCompoundsList?.filter(mol => currentMoleculeList.some(m => m.id === mol.main_site_observation));
  const joinedMoleculeLists = useMemo(() => {
    return rhsCompoundsList?.filter(mol => currentMoleculeList.some(m => m.id === mol.main_site_observation));
  }, [rhsCompoundsList, currentMoleculeList]);

  useEffect(() => {
    if (!!!rhsCompoundsList || rhsCompoundsList.length === 0) {
      const generatedPoses = [];
      if (currentMoleculeList?.length > 0) {
        currentMoleculeList.forEach(m => {
          const observation = allMoleculesList.find(mol => mol.id === m.id);
          if (observation) {
            generatedPoses.push({
              id: v4(),
              // id: 'virtual-' + observation.id,
              // id: observation.id + 1000,
              display_name: m.name,
              canon_site: null,
              compound: observation.cmpd,
              main_site_observation: observation.id,
              site_observations: [observation.id],
              main_site_observation_cmpd_code: observation.cmpd_code,
              smiles: observation.smiles,
              code: observation.code,
              canonSiteConf: observation.canon_site_conf,
              canonSite: null,
              associatedObs: [{ ...observation }]
            });
          }
        });
        dispatch(setRHSCompoundsList(generatedPoses));
      }
    }
  }, [rhsCompoundsList, currentMoleculeList, allMoleculesList, dispatch]);

  // console.log('DatasetMoleculeList - update');

  // const disableUserInteraction = useDisableUserInteraction();

  // TODO: Reset Infinity scroll

  const loadNextMolecules = useCallback(async () => {
    await setNextXMolecules(0);
    setCurrentPage(prevPage => prevPage + 1);
  }, []);
  const listItemOffset = (currentPage + 1) * moleculesPerPage + nextXMolecules;

  const currentMolecules = joinedMoleculeLists.slice(0, listItemOffset);
  // setCurrentMolecules(currentMolecules);
  const canLoadMore = listItemOffset < joinedMoleculeLists.length;

  const selectedAll = useRef(false);

  const { addMoleculeViewRef, setScrollToMoleculeId, getNode } = useScrollToSelected(
    datasetID,
    moleculesPerPage,
    setCurrentPage
  );

  const ligandList = useSelector(state => state.datasetsReducers.ligandLists[datasetID]);
  const proteinListDataset = useSelector(state => state.datasetsReducers.proteinLists[datasetID]);
  const complexListDataset = useSelector(state => state.datasetsReducers.complexLists[datasetID]);
  const surfaceListDataset = useSelector(state => state.datasetsReducers.surfaceLists[datasetID]);
  // #1249 dataset molecules currently could use side observation molecule for some renders

  // const { proteinList, complexList, surfaceList } = useSelector(state => getLHSVisibleListsForRHS(state, datasetID));
  const proteinList = useSelector(state => state.selectionReducers.proteinList);
  const complexList = useSelector(state => state.selectionReducers.complexList);
  const surfaceList = useSelector(state => state.selectionReducers.surfaceList);

  const allMolecules = moleculeLists[datasetID];
  let lockedMolecules = useSelector(state => state.datasetsReducers.selectedCompoundsByDataset[datasetID]) ?? [];

  const allInspirations = useSelector(state => state.datasetsReducers.allInspirations);

  const isSelectedTypeOn = (typeList, isLHSReference) => {
    if (typeList) {
      if (!isLHSReference) {
        return typeList?.some(molId => allMolecules?.some(mol => mol.id === molId));
      } else {
        const molsWithLHSReference = allMolecules?.filter(mol => mol.site_observation_code);
        return typeList?.some(molId =>
          molsWithLHSReference?.some(
            mol => mol.site_observation_code === allMoleculesList?.find(m => m.id === molId)?.code
          )
        );
      }
    }
    return false;
  };

  const isTypeOn = typeList => {
    return typeList && typeList.length > 0;
  };

  let isLigandOn = isSelectedTypeOn(ligandList, false);
  let isProteinOn = isSelectedTypeOn(proteinList, true) || isSelectedTypeOn(proteinListDataset, false);
  let isComplexOn = isSelectedTypeOn(complexList, true) || isSelectedTypeOn(complexListDataset, false);
  let isSurfaceOn = isSelectedTypeOn(surfaceList, true) || isSelectedTypeOn(surfaceListDataset, false);

  let areArrowsVisible = isLigandOn || isProteinOn || isComplexOn || isSurfaceOn;

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

  const addLHSType = {
    ligand: addDatasetLigand,
    protein: addHitProtein,
    complex: addComplex,
    surface: addSurface
  };

  const removeLHSType = {
    ligand: removeDatasetLigand,
    protein: removeHitProtein,
    complex: removeComplex,
    surface: removeSurface
  };

  const removeSelectedType = (type, skipTracking) => {
    for (const cid of lockedMolecules) {
      let molecule = getCompoundForId(cid);
      //this is dumb... I know but this original mechanism using eval and array of functions is even dumber
      if ((type === 'protein' || type === 'complex') && !molecule.pdb_info) {
        continue;
      }
      if (type === 'ligand') {
        dispatch(
          removeType[type](stage, molecule, colourList[molecule.id % colourList.length], datasetID, skipTracking)
        );
      } else {
        if (molecule.site_observation_code) {
          const lhsMol = allMoleculesList?.find(mol => mol.code === molecule.site_observation_code);
          if (lhsMol) {
            dispatch(removeLHSType[type](stage, lhsMol, colourList[molecule.id % colourList.length], skipTracking));
          }
        } else if (molecule.isCustomPdb) {
          dispatch(
            removeType[type](stage, molecule, colourList[molecule.id % colourList.length], datasetID, skipTracking)
          );
        }
      }
    }

    selectedAll.current = false;
  };

  const addNewType = (type, skipTracking) => {
    dispatch(
      withDisabledDatasetMoleculesNglControlButtons([datasetID], lockedMolecules, type, async () => {
        const promises = [];

        for (const cid of lockedMolecules) {
          let molecule = getCompoundForId(cid);
          //this is dumb... I know but this original mechanism using eval and array of functions is even dumber
          if ((type === 'protein' || type === 'complex') && !molecule.pdb_info) {
            continue;
          }
          if (type === 'ligand') {
            promises.push(
              dispatch(
                addType[type](stage, molecule, colourList[molecule.id % colourList.length], datasetID, skipTracking)
              )
            );
          } else {
            if (molecule.site_observation_code) {
              const lhsMol = allMoleculesList?.find(mol => mol.code === molecule.site_observation_code);
              if (lhsMol) {
                if (type === 'protein') {
                  promises.push(
                    dispatch(
                      addLHSType[type](
                        stage,
                        lhsMol,
                        colourList[molecule.id % colourList.length],
                        true,
                        skipTracking,
                        undefined,
                        true
                      )
                    )
                  );
                } else if (type === 'complex') {
                  promises.push(
                    dispatch(
                      addLHSType[type](
                        stage,
                        lhsMol,
                        colourList[molecule.id % colourList.length],
                        skipTracking,
                        undefined,
                        true
                      )
                    )
                  );
                }
              }
            } else if (molecule.isCustomPdb) {
              promises.push(
                dispatch(
                  addType[type](stage, molecule, colourList[molecule.id % colourList.length], datasetID, skipTracking)
                )
              );
            }
          }
        }

        await Promise.all(promises);
      })
    );
  };

  const ucfirst = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const onButtonToggle = (type, calledFromSelectAll = false) => {
    resetIterator();
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

  const getCompoundForId = id => {
    return joinedMoleculeLists?.find(m => m.id === id);
  };

  const getMoleculesToSelect = list => {
    let molecules = lockedMolecules.filter(cid => !list.includes(cid));
    let data = molecules.map(cid => {
      return { datasetID, molecule: getCompoundForId(cid) };
    });
    return data;
  };

  const getMoleculesToDeselect = list => {
    let molecules = lockedMolecules.filter(cid => list.includes(cid));
    let data = molecules.map(cid => {
      return { datasetID, molecule: getCompoundForId(cid) };
    });
    return data;
  };

  const actions = useMemo(
    () => [
      <SearchField
        className={classes.search}
        id="input-with-icon-textfield"
        placeholder="Search"
        onChange={value => {
          dispatch(setSearchStringOfCompoundSet(datasetID, value));
          dispatch(setDragDropState(datasetID, null));
        }}
        disabled={isLoadingMoleculeList}
        searchString={searchString ?? ''}
      />
    ],
    [classes, datasetID, dispatch, isLoadingMoleculeList, searchString]
  );

  const crossReferenceDialogRef = useRef();
  const inspirationDialogRef = useRef();
  const scrollBarRef = useRef();
  const lockVisibleCompoundsDialogRef = useRef();

  const [isOpenAlert, setIsOpenAlert] = useState(false);
  const [isDeleteDatasetAlertOpen, setIsDeleteDatasetAlertOpen] = useState(false);
  const [lockCompoundsDialogAnchorE1, setLockCompoundsDialogAnchorE1] = useState(null);

  const moveMolecule = useCallback(
    (dragIndex, hoverIndex) => {
      dispatch(moveDatasetMolecule(datasetID, dragIndex, hoverIndex));
    },
    [dispatch, datasetID]
  );

  const groupDatasetsNglControlButtonsDisabledState = useDisableDatasetNglControlButtons(
    lockedMolecules.map(cid => ({ datasetID, molecule: getCompoundForId(cid) }))
  );

  const resetIterator = () => {
    dispatch(resetDatasetIterator(datasetID));
  };

  const getFirstItemForIterationStart = () => {
    let firstItem = dispatch(getCurrentDatasetIterator(datasetID));
    if (!firstItem) {
      firstItem = joinedMoleculeLists.find(mol => {
        if (!mol.isCustomPdb) {
          const obs = dispatch(getObservationForLHSReference(mol));
          if (obs) {
            return (
              (ligandList.includes(mol.id) ||
                proteinList.includes(obs.id) ||
                complexList.includes(obs.id) ||
                surfaceList.includes(obs.id)) &&
              !lockedMolecules.includes(mol.id)
            );
          } else {
            return false;
          }
        } else {
          return (
            (ligandList.includes(mol.id) ||
              proteinListDataset.includes(mol.id) ||
              complexListDataset.includes(mol.id) ||
              surfaceListDataset.includes(mol.id)) &&
            !lockedMolecules.includes(mol.id)
          );
        }
      });
      // if (firstItem) {
      //   dispatch(setDatasetIterator(datasetID, firstItem));
      // }
    }

    return firstItem;
  };

  const getNextItemForIteration = currentItemId => {
    const nextItem = joinedMoleculeLists.find(mol => !lockedMolecules.includes(mol.id) && mol.id > currentItemId);
    return nextItem;
  };

  const getPrevItemForIteration = currentItemId => {
    const reversedCompounds = [...joinedMoleculeLists].reverse();
    const firstUnlockedCompound = reversedCompounds.find(compound => {
      return !lockedMolecules.includes(compound.id) && compound.id < currentItemId;
    });

    return firstUnlockedCompound;
  };

  const handleClickOnDownArrow = async event => {
    const unlockedVisibleCompounds = dispatch(getAllVisibleButNotLockedCompounds(datasetID));
    //one unlocked compound is what we want because it designate where the iteration will start
    if (unlockedVisibleCompounds?.length > 1 && askLockCompoundsQuestion) {
      setLockCompoundsDialogAnchorE1(event.currentTarget);
      dispatch(setIsOpenLockVisibleCompoundsDialogGlobal(true));
    } else {
      const firstItem = getFirstItemForIterationStart();
      const nextItem = getNextItemForIteration(firstItem.id);

      if (firstItem && nextItem) {
        const moleculeTitleNext = nextItem && nextItem.name;
        const node = getNode(nextItem.id);
        setScrollToMoleculeId(nextItem.id);

        let firstItemIdToUse = firstItem.id;
        let isCustomPdb = true;
        if (!firstItem.isCustomPdb) {
          isCustomPdb = false;
          const obs = dispatch(getObservationForLHSReference(firstItem));
          if (obs) {
            firstItemIdToUse = obs.id;
          }
        }

        let dataValue = {
          colourToggle: getRandomColor(firstItem),
          isLigandOn: ligandList.includes(firstItem.id),
          isProteinOn: isCustomPdb
            ? proteinListDataset.includes(firstItemIdToUse)
            : proteinList.includes(firstItemIdToUse),
          isComplexOn: isCustomPdb
            ? complexListDataset.includes(firstItemIdToUse)
            : complexList.includes(firstItemIdToUse),
          isSurfaceOn: isCustomPdb
            ? surfaceListDataset.includes(firstItemIdToUse)
            : surfaceList.includes(firstItemIdToUse)
        };

        dispatch(setCrossReferenceCompoundName(moleculeTitleNext));

        if (node) {
          setSelectedMoleculeRef(node);
        }

        dispatch(
          setInspirationDialogAction(
            datasetID,
            nextItem.id,
            getInspirationsForMol(allInspirations, datasetID, nextItem.id),
            true,
            0,
            []
          )
        );

        dispatch(
          moveDatasetMoleculeUpDown(stage, datasetID, firstItem, datasetID, nextItem, dataValue, ARROW_TYPE.DOWN)
        );
      }
    }
  };

  const handleClickOnUpArrow = async event => {
    const unlockedVisibleCompounds = dispatch(getAllVisibleButNotLockedCompounds(datasetID));
    //one unlocked compound is what we want because it designate where the iteration will start
    if (unlockedVisibleCompounds?.length > 1 && askLockCompoundsQuestion) {
      setLockCompoundsDialogAnchorE1(event.currentTarget);
      dispatch(setIsOpenLockVisibleCompoundsDialogGlobal(true));
    } else {
      const firstItem = getFirstItemForIterationStart();
      const prevItem = getPrevItemForIteration(firstItem.id);

      if (firstItem && prevItem) {
        const moleculeTitlePrev = prevItem && prevItem.name;
        const node = getNode(prevItem.id);
        setScrollToMoleculeId(prevItem.id);

        let firstItemIdToUse = firstItem.id;
        let isCustomPdb = true;
        if (!firstItem.isCustomPdb) {
          isCustomPdb = false;
          const obs = dispatch(getObservationForLHSReference(firstItem));
          if (obs) {
            firstItemIdToUse = obs.id;
          }
        }

        let dataValue = {
          colourToggle: getRandomColor(firstItem),
          isLigandOn: ligandList.includes(firstItem.id),
          isProteinOn: isCustomPdb
            ? proteinListDataset.includes(firstItemIdToUse)
            : proteinList.includes(firstItemIdToUse),
          isComplexOn: isCustomPdb
            ? complexListDataset.includes(firstItemIdToUse)
            : complexList.includes(firstItemIdToUse),
          isSurfaceOn: isCustomPdb
            ? surfaceListDataset.includes(firstItemIdToUse)
            : surfaceList.includes(firstItemIdToUse)
        };

        dispatch(setCrossReferenceCompoundName(moleculeTitlePrev));
        if (node) {
          setSelectedMoleculeRef(node);
        }

        dispatch(
          setInspirationDialogAction(
            datasetID,
            prevItem.id,
            getInspirationsForMol(allInspirations, datasetID, prevItem.id),
            true,
            0,
            []
          )
        );

        dispatch(moveDatasetMoleculeUpDown(stage, datasetID, firstItem, datasetID, prevItem, dataValue, ARROW_TYPE.UP));
      }
    }
  };

  const selectAllDatasetMolecule = selectAll => {
    selectedAll.current = true;

    lockedMolecules = [];

    if (selectAll === true) {
      joinedMoleculeLists.map(molecule => {
        lockedMolecules.push(molecule.id);
      });
      dispatch(setCompoundToSelectedCompoundsByDataset(datasetID, lockedMolecules));
    } else {
      dispatch(setCompoundToSelectedCompoundsByDataset(datasetID, []));
    }
  };

  return (
    <Panel
      hasHeader
      title={'RHS list'}
      withTooltip
      headerActions={actions}
      // style={{ height: '94%' }}
      hasExpansion
      defaultExpanded
      onExpandChange={useCallback(
        expanded => {
          dispatch(setPanelsExpanded(layoutItemNames.COMPOUNDS_VIEW, expanded));
          expandHandler && expandHandler(expanded);
        },
        [dispatch, expandHandler]
      )}
    >
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
      {isOpenCrossReferenceDialog && (
        <TooltipPathProvider path="crossReferenceDialog">
          <CrossReferenceDialog open anchorEl={selectedMoleculeRef} ref={crossReferenceDialogRef} />
        </TooltipPathProvider>
      )}
      <Grid container direction="row" justifyContent="flex-start" className={classes.container}>
        <Grid item>
          {/* Header */}
          {isLoadingMoleculeList === false && (
            <Grid
              container
              justifyContent="flex-start"
              direction="row"
              className={classes.molHeader}
              wrap="nowrap"
              style={{ width: '100%' }}
            >
              <Grid item container justifyContent="flex-start" direction="row">
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
                {lockedMolecules && (
                  <Grid item>
                    <Grid
                      container
                      direction="row"
                      justifyContent="flex-start"
                      alignItems="center"
                      wrap="nowrap"
                      className={classes.contButtonsMargin}
                    >
                      <Tooltip title="all ligands">
                        <Grid item>
                          <Button
                            variant="outlined"
                            className={classNames(
                              lockedMolecules.length === 0 ? classes.contColButton : classes.contColButtonUnselect,
                              {
                                [classes.contColButtonSelected]: isLigandOn
                              }
                            )}
                            onClick={() => {
                              dispatch(setAskLockCompoundsQuestion(true));
                              onButtonToggle('ligand');
                            }}
                            disabled={
                              groupDatasetsNglControlButtonsDisabledState.ligand || lockedMolecules.length === 0
                            }
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
                            onClick={() => {
                              dispatch(setAskLockCompoundsQuestion(true));
                              onButtonToggle('protein');
                            }}
                            disabled={lockedMolecules.length === 0}
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
                            onClick={() => {
                              dispatch(setAskLockCompoundsQuestion(true));
                              onButtonToggle('complex');
                            }}
                            disabled={lockedMolecules.length === 0}
                          >
                            C
                          </Button>
                        </Grid>
                      </Tooltip>
                    </Grid>
                  </Grid>
                )}
                <Grid item>
                  <Grid container direction="row" /*className={classes.arrows}*/>
                    <Grid item>
                      <IconButton
                        color="primary"
                        size="medium"
                        // disabled={false || !previousItemData || !areArrowsVisible}
                        disabled={false}
                        onClick={handleClickOnUpArrow}
                        className={classes.iconButton}
                      >
                        <ArrowUpward
                          className={classNames(
                            areArrowsVisible ? classes.arrow : classes.invisArrow,
                            areArrowsVisible && classes.arrowsHighlight
                          )}
                        />
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <IconButton
                        color="primary"
                        size="medium"
                        // disabled={false || !nextItemData || !areArrowsVisible}
                        disabled={false}
                        onClick={handleClickOnDownArrow}
                        className={classes.iconButton}
                      >
                        <ArrowDownward
                          className={classNames(
                            areArrowsVisible ? classes.arrow : classes.invisArrow,
                            areArrowsVisible && classes.arrowsHighlight
                          )}
                        />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  <Tooltip title={selectAllPressed ? 'Unselect all' : 'Select all'}>
                    <Grid item style={{ margin: '4px', marginLeft: '5px' }}>
                      <Button
                        variant="outlined"
                        className={classNames(classes.contColButton, {
                          [classes.contColButtonHalfSelected]: false
                        })}
                        onClick={() => {
                          dispatch(setSelectAllButtonForDataset(!selectAllPressed));
                          selectAllDatasetMolecule(!selectAllPressed);
                        }}
                        disabled={false}
                      >
                        {selectAllPressed ? 'Unselect all' : 'Select all'}
                      </Button>
                    </Grid>
                  </Tooltip>
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>
        {isLoadingMoleculeList && (
          <Grid item container alignItems="center" justifyContent="center" className={classes.loading}>
            <Grid item>
              <CircularProgress />
            </Grid>
          </Grid>
        )}
        {isLoadingMoleculeList === false && currentMolecules.length > 0 && (
          <>
            <Grid
              item
              className={
                rhsWidth > 480 || rhsWidth === undefined ? classes.gridItemList : classes.gridItemListSmallSize
              }
              ref={scrollBarRef}
            >
              <InfiniteScroll
                // getScrollParent={() =>
                //   dispatch(
                //     autoHideDatasetDialogsOnScroll({
                //       inspirationDialogRef,
                //       crossReferenceDialogRef,
                //       scrollBarRef
                //     })
                //   )
                // }
                pageStart={0}
                loadMore={loadNextMolecules}
                hasMore={canLoadMore}
                loader={
                  <div className="loader" key={0}>
                    <Grid
                      container
                      direction="row"
                      justifyContent="center"
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
                  <GroupDatasetNglControlButtonsContext.Provider value={groupDatasetsNglControlButtonsDisabledState}>
                    <DndProvider backend={HTML5Backend}>
                      <ObservationUnifiedViewWrapper
                        viewConfig={RHS_OBSERVATION_VIEW_CONFIG}
                        items={currentMolecules}
                        // allSelectedMolecules={allSelectedMolecules}
                        addMoleculeViewRef={addMoleculeViewRef}
                        // handleSetTagEditorAnchorEl={setTagEditorAnchorEl}
                        // fragmentDisplayList={fragmentDisplayList}
                        proteinList={proteinList}
                        complexList={complexList}
                        surfaceList={surfaceList}
                        // densityList={densityList}
                        // qualityList={qualityList}
                        // vectorOnList={vectorOnList}
                        // informationList={informationList}
                      />
                    </DndProvider>
                  </GroupDatasetNglControlButtonsContext.Provider>
                )}
              </InfiniteScroll>
            </Grid>
            <Grid item>
              <Grid container justifyContent="space-between" alignItems="center" direction="row">
                <Grid item>
                  <span className={classes.total}>{`Total ${joinedMoleculeLists?.length}`}</span>
                </Grid>
                <Grid item>
                  <ButtonGroup variant="text" size="medium" color="primary" aria-label="contained primary button group">
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
  );
};

export default memo(RhsCmpList);
