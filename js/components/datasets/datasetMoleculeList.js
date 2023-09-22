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
  IconButton,
  ButtonGroup,
  TextField,
  Checkbox,
  InputAdornment,
  setRef
} from '@material-ui/core';
import React, { useState, useEffect, memo, useRef, useContext, useCallback, useMemo } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import DatasetMoleculeView from './datasetMoleculeView';
import { colourList, getRandomColor } from '../preview/molecule/utils/color';
import InfiniteScroll from 'react-infinite-scroller';
import { Button } from '../common/Inputs/Button';
import { Panel } from '../common/Surfaces/Panel';
import { ComputeSize } from '../../utils/computeSize';
import { ARROW_TYPE, VIEWS } from '../../constants/constants';
import { NglContext } from '../nglView/nglProvider';
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
  getAllVisibleButNotLockedCompounds
} from './redux/dispatchActions';
import {
  setAskLockCompoundsQuestion,
  setCrossReferenceCompoundName,
  setDragDropState,
  setFilterDialogOpen,
  setIsOpenLockVisibleCompoundsDialogGlobal,
  setSearchStringOfCompoundSet,
  setCompoundToSelectedCompoundsByDataset,
  setSelectAllButtonForDataset
} from './redux/actions';
import { DatasetFilter } from './datasetFilter';
import { FilterList, Link, DeleteForever, ArrowUpward, ArrowDownward, Edit } from '@material-ui/icons';
import { getJoinedMoleculeLists } from './redux/selectors';
import { InspirationDialog } from './inspirationDialog';
import { CrossReferenceDialog } from './crossReferenceDialog';
import { AlertModal } from '../common/Modal/AlertModal';
import { setSelectedAllByType, setDeselectedAllByType } from './redux/actions';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import SearchField from '../common/Components/SearchField';
import useDisableDatasetNglControlButtons from './useDisableDatasetNglControlButtons';
import GroupDatasetNglControlButtonsContext from './groupDatasetNglControlButtonsContext';
import { useScrollToSelected } from './useScrollToSelected';
import { useEffectDebugger } from '../../utils/effects';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { compoundsColors } from '../preview/compounds/redux/constants';
import {
  onChangeCompoundClassCheckbox,
  onChangeCompoundClassValue,
  onClickCompoundClass,
  onKeyDownCompoundClass,
  onStartEditColorClassName
} from '../preview/compounds/redux/dispatchActions';
import { LockVisibleCompoundsDialog } from './lockVisibleCompoundsDialog';

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
  }
}));

const DatasetMoleculeList = ({ title, datasetID, url }) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const [nextXMolecules, setNextXMolecules] = useState(0);
  const moleculesPerPage = 5;
  const [currentPage, setCurrentPage] = useState(0);

  const imgHeight = 49;
  const imgWidth = 150;
  const sortDialogOpen = useSelector(state => state.datasetsReducers.filterDialogOpen);
  const isOpenInspirationDialog = useSelector(state => state.datasetsReducers.isOpenInspirationDialog);
  const isOpenCrossReferenceDialog = useSelector(state => state.datasetsReducers.isOpenCrossReferenceDialog);
  const isLockVisibleCompoundsDialogOpenGlobal = useSelector(
    state => state.datasetsReducers.isLockVisibleCompoundsDialogOpenGlobal
  );

  const moleculeLists = useSelector(state => state.datasetsReducers.moleculeLists);
  const isLoadingMoleculeList = useSelector(state => state.datasetsReducers.isLoadingMoleculeList);
  const filteredScoreProperties = useSelector(state => state.datasetsReducers.filteredScoreProperties);
  const filterMap = useSelector(state => state.datasetsReducers.filterDatasetMap);
  const filterSettings = filterMap && datasetID && filterMap[datasetID];
  const filterPropertiesMap = useSelector(state => state.datasetsReducers.filterPropertiesDatasetMap);
  const filterProperties = filterPropertiesMap && datasetID && filterPropertiesMap[datasetID];
  const [sortDialogAnchorEl, setSortDialogAnchorEl] = useState(null);

  const searchString = useSelector(state => state.datasetsReducers.searchString);

  const currentActionList = useSelector(state => state.trackingReducers.current_actions_list);

  const isActiveFilter = !!(filterSettings || {}).active;
  const { getNglView } = useContext(NglContext);

  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;
  const [selectedMoleculeRef, setSelectedMoleculeRef] = useState(null);

  const filterRef = useRef();

  const joinedMoleculeLists = useSelector(state => getJoinedMoleculeLists(datasetID, state), shallowEqual);

  const datasetObj = useSelector(state => state.datasetsReducers.datasets.find(d => d.id === datasetID));

  const askLockCompoundsQuestion = useSelector(state => state.datasetsReducers.askLockCompoundsQuestion);

  const selectAllPressed = useSelector(state => state.datasetsReducers.isSelectedSelectAllButtonForDataset);

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

  const compoundsToBuyList = useSelector(state => state.datasetsReducers.compoundsToBuyDatasetMap[datasetID]);

  const { addMoleculeViewRef, setScrollToMoleculeId, getNode } = useScrollToSelected(
    datasetID,
    moleculesPerPage,
    setCurrentPage
  );

  const ligandList = useSelector(state => state.datasetsReducers.ligandLists[datasetID]);
  const proteinList = useSelector(state => state.datasetsReducers.proteinLists[datasetID]);
  const complexList = useSelector(state => state.datasetsReducers.complexLists[datasetID]);
  const surfaceList = useSelector(state => state.datasetsReducers.surfaceLists[datasetID]);

  // const [selectedMolecules, setSelectedMolecules] = useState([]);

  // useEffect(() => {
  //   setSelectedMolecules((moleculeLists[datasetID] || []).filter(mol => compoundsToBuyList?.includes(mol.id)));
  // }, [compoundsToBuyList, datasetID, moleculeLists]);

  const allMolecules = moleculeLists[datasetID];
  let lockedMolecules = useSelector(state => state.datasetsReducers.selectedCompoundsByDataset[datasetID]) ?? [];
  const editedColorGroup = useSelector(state => state.datasetsReducers.editedColorGroup);

  const currentCompoundClass = useSelector(state => state.previewReducers.compounds.currentCompoundClass);

  const blueInput = useSelector(state => state.previewReducers.compounds[compoundsColors.blue.key]);
  const redInput = useSelector(state => state.previewReducers.compounds[compoundsColors.red.key]);
  const greenInput = useSelector(state => state.previewReducers.compounds[compoundsColors.green.key]);
  const purpleInput = useSelector(state => state.previewReducers.compounds[compoundsColors.purple.key]);
  const apricotInput = useSelector(state => state.previewReducers.compounds[compoundsColors.apricot.key]);

  const inputs = {
    [compoundsColors.blue.key]: blueInput,
    [compoundsColors.red.key]: redInput,
    [compoundsColors.green.key]: greenInput,
    [compoundsColors.purple.key]: purpleInput,
    [compoundsColors.apricot.key]: apricotInput
  };

  const inputRefs = {
    [compoundsColors.blue.key]: useRef(),
    [compoundsColors.red.key]: useRef(),
    [compoundsColors.green.key]: useRef(),
    [compoundsColors.purple.key]: useRef(),
    [compoundsColors.apricot.key]: useRef()
  };

  const compoundColors = useSelector(state => state.datasetsReducers.compoundColorByDataset[datasetID]) ?? {};

  const isSelectedTypeOn = typeList => {
    if (typeList) {
      return typeList.some(molId => allMolecules.some(mol => mol.id === molId));
    }
    return false;
  };

  const isTypeOn = typeList => {
    return typeList && typeList.length > 0;
  };

  let isLigandOn = isSelectedTypeOn(ligandList);
  let isProteinOn = isSelectedTypeOn(proteinList);
  let isComplexOn = isSelectedTypeOn(complexList);

  let areArrowsVisible =
    isTypeOn(ligandList) || isTypeOn(proteinList) || isTypeOn(complexList) || isTypeOn(surfaceList);

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

  // TODO: "currentMolecules" do not need to correspondent to selections in {type}List
  // TODO: so this could lead to inconsistend behaviour while scrolling
  // TODO: maybe change "currentMolecules.forEach" to "{type}List.forEach"

  const removeSelectedType = (type, skipTracking) => {
    lockedMolecules.forEach(cid => {
      let molecule = getCompoundForId(cid);
      dispatch(removeType[type](stage, molecule, colourList[molecule.id % colourList.length], datasetID, skipTracking));
    });
    selectedAll.current = false;
  };

  const addNewType = (type, skipTracking) => {
    dispatch(
      withDisabledDatasetMoleculesNglControlButtons([datasetID], lockedMolecules, type, async () => {
        const promises = [];

        lockedMolecules.forEach(cid => {
          let molecule = getCompoundForId(cid);
          promises.push(
            dispatch(
              addType[type](stage, molecule, colourList[molecule.id % colourList.length], datasetID, skipTracking)
            )
          );
        });

        await Promise.all(promises);
      })
    );
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

  // getting searched string to input filed
  // let filterSearchString = '';
  // const getSearchedString = () => {
  //   filterSearchString = currentActionList.find(action => action.type === 'SEARCH_STRING');
  // };
  // getSearchedString();

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
      />,
      <IconButton className={classes.panelButton} color={'inherit'} onClick={() => window.open(url, '_blank')}>
        <Tooltip title="Link to dataset">
          <Link />
        </Tooltip>
      </IconButton>,
      <IconButton
        className={classes.panelButton}
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
      </IconButton>,
      <IconButton
        disabled={DJANGO_CONTEXT['authenticated'] !== true}
        className={classes.panelButton}
        color={'inherit'}
        onClick={event => {
          setIsDeleteDatasetAlertOpen(true);
        }}
      >
        <Tooltip title="Delete dataset">
          <DeleteForever />
        </Tooltip>
      </IconButton>
    ],
    [classes, datasetID, dispatch, filterRef, isLoadingMoleculeList, sortDialogOpen, url, searchString]
  );

  // useEffectDebugger(
  //   () => {},
  //   [classes, datasetID, dispatch, filterRef, isLoadingMoleculeList, sortDialogOpen, url],
  //   ['classes', 'datasetID', 'dispatch', 'filterRef', 'isLoadingMoleculeList', 'sortDialogOpen', 'url'],
  //   'DatasetMoleculeList - headerActions'
  // );

  /*useEffect(() => {
      // setCurrentPage(0);
    }, [object_selection]);*/

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

  // useEffectDebugger(
  //   () => {},
  //   [setSortDialogAnchorEl, loadNextMolecules, addMoleculeViewRef, setSelectedMoleculeRef, moveMolecule],
  //   ['setSortDialogAnchorEl', 'loadNextMolecules', 'addMoleculeViewRef', 'setSelectedMoleculeRef', 'moveMolecule'],
  //   'DatasetMoleculeList - functions'
  // );

  // useEffectDebugger(
  //   () => {},
  //   [
  //     title,
  //     datasetID,
  //     url,
  //     sortDialogOpen,
  //     isOpenInspirationDialog,
  //     isOpenCrossReferenceDialog,
  //     moleculeLists,
  //     isLoadingMoleculeList,
  //     filteredScoreProperties,
  //     filterMap,
  //     filterSettings,
  //     filterPropertiesMap,
  //     filterProperties,
  //     sortDialogAnchorEl,
  //     isActiveFilter,
  //     selectedMoleculeRef,
  //     joinedMoleculeLists,
  //     nextXMolecules,
  //     currentPage,
  //     compoundsToBuyList,
  //     ligandList,
  //     proteinList,
  //     complexList,
  //     surfaceList,
  //     isOpenAlert
  //   ],
  //   [
  //     'title',
  //     'datasetID',
  //     'url',
  //     'sortDialogOpen',
  //     'isOpenInspirationDialog',
  //     'isOpenCrossReferenceDialog',
  //     'moleculeLists',
  //     'isLoadingMoleculeList',
  //     'filteredScoreProperties',
  //     'filterMap',
  //     'filterSettings',
  //     'filterPropertiesMap',
  //     'filterProperties',
  //     'sortDialogAnchorEl',
  //     'isActiveFilter',
  //     'selectedMoleculeRef',
  //     'joinedMoleculeLists',
  //     'nextXMolecules',
  //     'currentPage',
  //     'compoundsToBuyList',
  //     'ligandList',
  //     'proteinList',
  //     'complexList',
  //     'surfaceList',
  //     'isOpenAlert'
  //   ],
  //   'DatasetMoleculeList'
  // );

  const getFirstItemForIterationStart = () => {
    const firstItem = joinedMoleculeLists.find(
      mol =>
        (ligandList.includes(mol.id) ||
          proteinList.includes(mol.id) ||
          complexList.includes(mol.id) ||
          surfaceList.includes(mol.id)) &&
        !lockedMolecules.includes(mol.id)
    );

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

        let dataValue = {
          colourToggle: getRandomColor(firstItem),
          isLigandOn: ligandList.includes(firstItem.id),
          isProteinOn: proteinList.includes(firstItem.id),
          isComplexOn: complexList.includes(firstItem.id),
          isSurfaceOn: surfaceList.includes(firstItem.id)
        };

        dispatch(setCrossReferenceCompoundName(moleculeTitleNext));

        if (node) {
          setSelectedMoleculeRef(node);
        }
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

        let dataValue = {
          colourToggle: getRandomColor(firstItem),
          isLigandOn: ligandList.includes(firstItem.id),
          isProteinOn: proteinList.includes(firstItem.id),
          isComplexOn: complexList.includes(firstItem.id),
          isSurfaceOn: surfaceList.includes(firstItem.id)
        };

        dispatch(setCrossReferenceCompoundName(moleculeTitlePrev));
        if (node) {
          setSelectedMoleculeRef(node);
        }
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
      <AlertModal
        title="Are you sure?"
        description={`Are you sure to permanentaly delete dataset: ${datasetObj.title}`}
        open={isDeleteDatasetAlertOpen}
        handleOnOk={() => {
          dispatch(deleteDataset(datasetID, stage));
          setIsDeleteDatasetAlertOpen(false);
        }}
        handleOnCancel={() => {
          setIsDeleteDatasetAlertOpen(false);
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
      {askLockCompoundsQuestion && isLockVisibleCompoundsDialogOpenGlobal && (
        <LockVisibleCompoundsDialog
          open
          ref={lockVisibleCompoundsDialogRef}
          anchorEl={lockCompoundsDialogAnchorE1}
          datasetId={datasetID}
        />
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
      <Grid container direction="row" justify="flex-start" className={classes.container}>
        <Grid item>
          {/* Selection */}
          <Grid container direction="row" alignItems="center">
            {Object.keys(compoundsColors).map(item => (
              <>
                <Grid item key={`${item}-txtfield`}>
                  <TextField
                    InputProps={{
                      readOnly: editedColorGroup !== item,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            className={
                              editedColorGroup !== item ? classes.editClassNameIcon : classes.editClassNameIconSelected
                            }
                            color={'inherit'}
                            value={`${item}`}
                            onClick={e => {
                              dispatch(onStartEditColorClassName(e));
                              inputRefs[item].current.focus();
                              inputRefs[item].current.select();
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </InputAdornment>
                      ),
                      startAdornment: (
                        <InputAdornment position="start">
                          <Checkbox
                            className={classes.classCheckbox}
                            key={`CHCK_${item}`}
                            value={`${item}`}
                            onChange={e => dispatch(onChangeCompoundClassCheckbox(e))}
                            checked={currentCompoundClass === item}
                          ></Checkbox>
                        </InputAdornment>
                      )
                    }}
                    inputRef={inputRefs[item]}
                    autoComplete="off"
                    id={`${item}`}
                    key={`CLASS_${item}`}
                    variant="standard"
                    className={classNames(
                      classes.textField,
                      classes[item],
                      currentCompoundClass === item && classes.selectedInput
                    )}
                    onChange={e => dispatch(onChangeCompoundClassValue(e))}
                    onKeyDown={e => dispatch(onKeyDownCompoundClass(e))}
                    // onClick={e => dispatch(onClickCompoundClass(e))}
                    value={inputs[item] || ''}
                  />
                </Grid>
              </>
            ))}
          </Grid>
        </Grid>
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
                {lockedMolecules && lockedMolecules.length > 0 && (
                  <Grid item>
                    <Grid
                      container
                      direction="row"
                      justify="flex-start"
                      alignItems="center"
                      wrap="nowrap"
                      className={classes.contButtonsMargin}
                    >
                      {console.log('isLigandOn', isLigandOn)}
                      <Tooltip title="all ligands">
                        <Grid item>
                          <Button
                            variant="outlined"
                            className={classNames(classes.contColButton, {
                              [classes.contColButtonSelected]: isLigandOn
                            })}
                            onClick={() => {
                              dispatch(setAskLockCompoundsQuestion(true));
                              onButtonToggle('ligand');
                            }}
                            disabled={groupDatasetsNglControlButtonsDisabledState.ligand}
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
                            disabled={groupDatasetsNglControlButtonsDisabledState.protein}
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
                            disabled={groupDatasetsNglControlButtonsDisabledState.complex}
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
                  {
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
                  }
                </Grid>
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
                  <GroupDatasetNglControlButtonsContext.Provider value={groupDatasetsNglControlButtonsDisabledState}>
                    <DndProvider backend={HTML5Backend}>
                      {currentMolecules.map((data, index, array) => {
                        // const isAddedToShoppingCart = selectedMolecules.some(molecule => molecule.id === data.id);
                        let isAddedToShoppingCart = false;
                        const locked = lockedMolecules?.includes(data.id);
                        let shoppingCartColors = null;
                        // if (isAddedToShoppingCart) {
                        if (compoundColors.hasOwnProperty(data.id)) {
                          isAddedToShoppingCart = true;
                          shoppingCartColors = compoundColors[data.id];
                        }
                        // }

                        return (
                          <DatasetMoleculeView
                            ref={addMoleculeViewRef}
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
                            L={ligandList?.includes(data.id)}
                            P={proteinList?.includes(data.id)}
                            C={complexList?.includes(data.id)}
                            S={surfaceList?.includes(data.id)}
                            V={false}
                            moveMolecule={moveMolecule}
                            isLocked={locked}
                            isAddedToShoppingCart={isAddedToShoppingCart}
                            shoppingCartColors={shoppingCartColors}
                            disableL={locked && groupDatasetsNglControlButtonsDisabledState.ligand}
                            disableP={locked && groupDatasetsNglControlButtonsDisabledState.protein}
                            disableC={locked && groupDatasetsNglControlButtonsDisabledState.complex}
                            dragDropEnabled
                            getNode={getNode}
                          />
                        );
                      })}
                    </DndProvider>
                  </GroupDatasetNglControlButtonsContext.Provider>
                )}
              </InfiniteScroll>
            </Grid>
            <Grid item>
              <Grid container justify="space-between" alignItems="center" direction="row">
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

export default memo(DatasetMoleculeList);
