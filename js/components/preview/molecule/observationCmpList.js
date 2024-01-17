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
  ButtonGroup
} from '@material-ui/core';
import React, { useState, useEffect, useCallback, memo, useRef, useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MoleculeView from './moleculeView';
import { colourList } from './utils/color';
import { MoleculeListSortFilterDialog, filterMolecules, getAttrDefinition } from './moleculeListSortFilterDialog';
import InfiniteScroll from 'react-infinite-scroller';
import { Button } from '../../common/Inputs/Button';
import { Panel } from '../../common/Surfaces/Panel';
import { ComputeSize } from '../../../utils/computeSize';
import { moleculeProperty } from './helperConstants';
import { VIEWS } from '../../../constants/constants';
import { NglContext } from '../../nglView/nglProvider';
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
  initializeMolecules,
  applyDirectSelection,
  addQuality,
  removeQuality,
  withDisabledMoleculesNglControlButtons,
  removeSelectedTypesInHitNavigator,
  selectAllHits,
  autoHideTagEditorDialogsOnScroll
} from './redux/dispatchActions';
import { DEFAULT_FILTER, PREDEFINED_FILTERS } from '../../../reducers/selection/constants';
import { Edit, FilterList } from '@material-ui/icons';
import { getLHSCompoundsList, selectAllMoleculeList, selectJoinedMoleculeList } from './redux/selectors';
import { MOL_ATTRIBUTES } from './redux/constants';
import {
  setFilter,
  setMolListToEdit,
  setNextXMolecules,
  setMoleculeForTagEdit,
  setObservationsForLHSCmp,
  setOpenObservationsDialog
} from '../../../reducers/selection/actions';
import { initializeFilter } from '../../../reducers/selection/dispatchActions';
import * as listType from '../../../constants/listTypes';
import { useRouteMatch } from 'react-router-dom';
import { setSortDialogOpen, setSearchStringOfHitNavigator } from './redux/actions';
import { AlertModal } from '../../common/Modal/AlertModal';
import {
  setSelectedAllByType,
  setDeselectedAllByType,
  setTagEditorOpen,
  setIsTagGlobalEdit
} from '../../../reducers/selection/actions';
import { TagEditor } from '../tags/modal/tagEditor';
import { getMoleculeForId, selectTag } from '../tags/redux/dispatchActions';
import SearchField from '../../common/Components/SearchField';
import useDisableNglControlButtons from './useDisableNglControlButtons';
import GroupNglControlButtonsContext from './groupNglControlButtonsContext';
import { extractTargetFromURLParam } from '../utils';
import { LoadingContext } from '../../loading';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
import ObservationCmpView from './observationCmpView';
import { ObservationsDialog } from './observationsDialog';

const useStyles = makeStyles(theme => ({
  container: {
    minHeight: '100px',
    height: '100%',
    width: 'inherit',
    color: theme.palette.black
  },
  noOfSelectedHits: {
    marginLeft: '5px'
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
    height: `calc(99% - ${theme.spacing(6)}px - ${theme.spacing(2)}px)`
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
      backgroundColor: theme.palette.primary.light
      // color: theme.palette.primary.contrastText
    },
    '&:disabled': {
      borderRadius: 0,
      borderColor: 'white'
    }
  },
  contColButtonUnselected: {
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
      //color: theme.palette.black
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
    width: 116
  },
  total: {
    ...theme.typography.button,
    color: theme.palette.primary.main,
    fontStyle: 'italic'
  }
}));
let selectedDisplayHits = false;

export const ObservationCmpList = memo(({ hideProjects }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  let match = useRouteMatch();
  // let target = match && match.params && match.params.target;
  let target = match && match.params && extractTargetFromURLParam(match.params[0]);

  const nextXMolecules = useSelector(state => state.selectionReducers.nextXMolecules);
  const [selectAllHitsPressed, setSelectAllHitsPressed] = useState(false);
  const [selectDisplayedHitsPressed, setSelectDisplayedHitsPressed] = useState(false);
  const moleculesPerPage = 30;
  const [currentPage, setCurrentPage] = useState(0);
  const searchString = useSelector(state => state.previewReducers.molecule.searchStringLHS);
  // const [searchString, setSearchString] = useState(null);
  const [sortDialogAnchorEl, setSortDialogAnchorEl] = useState(null);
  const oldUrl = useRef('');
  const setOldUrl = url => {
    oldUrl.current = url;
  };
  const list_type = listType.MOLECULE;
  const imgHeight = 49;
  const imgWidth = 150;
  const sortDialogOpen = useSelector(state => state.previewReducers.molecule.sortDialogOpen);
  const filter = useSelector(state => state.selectionReducers.filter);
  const getJoinedMoleculeList = useSelector(state => selectJoinedMoleculeList(state));
  const allMoleculesList = useSelector(state => selectAllMoleculeList(state));

  const selectedAll = useRef(false);

  const proteinList = useSelector(state => state.selectionReducers.proteinList);
  const complexList = useSelector(state => state.selectionReducers.complexList);
  const fragmentDisplayList = useSelector(state => state.selectionReducers.fragmentDisplayList);
  const surfaceList = useSelector(state => state.selectionReducers.surfaceList);
  const densityList = useSelector(state => state.selectionReducers.densityList);
  const densityListCustom = useSelector(state => state.selectionReducers.densityListCustom);
  const qualityList = useSelector(state => state.selectionReducers.qualityList);
  const vectorOnList = useSelector(state => state.selectionReducers.vectorOnList);
  const informationList = useSelector(state => state.selectionReducers.informationList);
  const isTagEditorOpen = useSelector(state => state.selectionReducers.tagEditorOpened);
  const molForTagEditId = useSelector(state => state.selectionReducers.molForTagEdit);
  const moleculesToEditIds = useSelector(state => state.selectionReducers.moleculesToEdit);
  const obsCmpsToEditIds = useSelector(state => state.selectionReducers.obsCmpsToEdit);
  const isGlobalEdit = useSelector(state => state.selectionReducers.isGlobalEdit);

  const isObservationDialogOpen = useSelector(state => state.selectionReducers.isObservationDialogOpen);

  const object_selection = useSelector(state => state.selectionReducers.mol_group_selection);

  const all_mol_lists = useSelector(state => state.apiReducers.all_mol_lists);
  const directDisplay = useSelector(state => state.apiReducers.direct_access);
  const directAccessProcessed = useSelector(state => state.apiReducers.direct_access_processed);
  const tags = useSelector(state => state.apiReducers.tagList);
  const noTagsReceived = useSelector(state => state.apiReducers.noTagsReceived);
  const categories = useSelector(state => state.apiReducers.categoryList);

  const observationsForLHSCmp = useSelector(state => state.selectionReducers.observationsForLHSCmp);

  const lhsCompoundsList = useSelector(state => getLHSCompoundsList(state));
  const visibleObservations = useSelector(state => selectJoinedMoleculeList(state));

  const proteinsHasLoaded = useSelector(state => state.nglReducers.proteinsHasLoaded);

  const [predefinedFilter, setPredefinedFilter] = useState(filter !== undefined ? filter.predefined : DEFAULT_FILTER);

  const isActiveFilter = !!(filter || {}).active;

  const { getNglView } = useContext(NglContext);
  const { moleculesAndTagsAreLoading } = useContext(LoadingContext);
  const majorViewStage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

  const filterRef = useRef();
  const tagEditorRef = useRef();
  const scrollBarRef = useRef();
  const [tagEditorAnchorEl, setTagEditorAnchorEl] = useState(null);

  if (directDisplay && directDisplay.target) {
    target = directDisplay.target;
  }

  let selectedMolecule = [];
  // TODO: Reset Infinity scroll
  /*useEffect(() => {
      // setCurrentPage(0);
    }, [object_selection]);*/

  let joinedMoleculeLists = useMemo(() => {
    // const searchedString = currentActionList.find(action => action.type === 'SEARCH_STRING_HIT_NAVIGATOR');
    if (searchString) {
      return allMoleculesList.filter(molecule => molecule.code.toLowerCase().includes(searchString.toLowerCase()));
      // } else if (searchedString) {
      //   return getJoinedMoleculeList.filter(molecule =>
      //     molecule.protein_code.toLowerCase().includes(searchedString.searchStringHitNavigator.toLowerCase())
      //   );
    } else {
      return getJoinedMoleculeList;
    }
  }, [getJoinedMoleculeList, allMoleculesList, searchString]);

  const addSelectedMoleculesFromUnselectedSites = useCallback(
    (joinedMoleculeLists, list) => {
      const addedMols = [...joinedMoleculeLists];
      const onlyAlreadySelected = [];
      list?.forEach(moleculeID => {
        const foundJoinedMolecule = addedMols.find(mol => mol.id === moleculeID);
        if (!foundJoinedMolecule) {
          const molecule = allMoleculesList.find(mol => mol.id === moleculeID);
          if (molecule) {
            addedMols.push(molecule);
            onlyAlreadySelected.push(molecule);
          }
        }
      });

      const result = [...onlyAlreadySelected, ...joinedMoleculeLists];
      return result;
    },
    [allMoleculesList]
  );

  //the dependencies which are marked by compiler as unnecessary are actually necessary because without them the memo returns
  //old joinedMoleculeLists in situation where we want to preserve molecule in view which shouldn't be there
  //but want to remove it after the tag editor dialog is closed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  joinedMoleculeLists = useMemo(() => addSelectedMoleculesFromUnselectedSites(joinedMoleculeLists, proteinList), [
    addSelectedMoleculesFromUnselectedSites,
    joinedMoleculeLists,
    proteinList,
    molForTagEditId,
    isTagEditorOpen,
    obsCmpsToEditIds
  ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  joinedMoleculeLists = useMemo(() => addSelectedMoleculesFromUnselectedSites(joinedMoleculeLists, complexList), [
    addSelectedMoleculesFromUnselectedSites,
    joinedMoleculeLists,
    complexList,
    molForTagEditId,
    isTagEditorOpen,
    obsCmpsToEditIds
  ]);
  joinedMoleculeLists = useMemo(
    () => addSelectedMoleculesFromUnselectedSites(joinedMoleculeLists, fragmentDisplayList),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      addSelectedMoleculesFromUnselectedSites,
      joinedMoleculeLists,
      fragmentDisplayList,
      molForTagEditId,
      isTagEditorOpen,
      obsCmpsToEditIds
    ]
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  joinedMoleculeLists = useMemo(() => addSelectedMoleculesFromUnselectedSites(joinedMoleculeLists, surfaceList), [
    addSelectedMoleculesFromUnselectedSites,
    joinedMoleculeLists,
    surfaceList,
    molForTagEditId,
    isTagEditorOpen,
    obsCmpsToEditIds
  ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  joinedMoleculeLists = useMemo(() => addSelectedMoleculesFromUnselectedSites(joinedMoleculeLists, densityList), [
    addSelectedMoleculesFromUnselectedSites,
    joinedMoleculeLists,
    densityList,
    molForTagEditId,
    isTagEditorOpen,
    obsCmpsToEditIds
  ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  joinedMoleculeLists = useMemo(() => addSelectedMoleculesFromUnselectedSites(joinedMoleculeLists, vectorOnList), [
    addSelectedMoleculesFromUnselectedSites,
    joinedMoleculeLists,
    vectorOnList,
    molForTagEditId,
    isTagEditorOpen,
    obsCmpsToEditIds
  ]);

  if (isActiveFilter) {
    joinedMoleculeLists = filterMolecules(joinedMoleculeLists, filter);
  }

  const loadNextMolecules = () => {
    setCurrentPage(currentPage + 1);
  };

  if (molForTagEditId && !joinedMoleculeLists.some(m => m.id === molForTagEditId)) {
    const tagEditMol = dispatch(getMoleculeForId(molForTagEditId));
    if (tagEditMol) {
      // joinedMoleculeLists = [tagEditMol, ...joinedMoleculeLists];
      joinedMoleculeLists.push(tagEditMol);
      joinedMoleculeLists.sort((a, b) => {
        if (a.code < b.code) {
          return -1;
        }
        if (a.code > b.code) {
          return 1;
        }
        return 0;
      });
    }
  }

  if (obsCmpsToEditIds && obsCmpsToEditIds.length > 0 && isGlobalEdit) {
    obsCmpsToEditIds.forEach(mid => {
      if (!joinedMoleculeLists.some(m => m.id === mid)) {
        const tagEditMol = dispatch(getMoleculeForId(mid));
        if (tagEditMol) {
          joinedMoleculeLists.push(tagEditMol);
        }
      }
    });
    joinedMoleculeLists.sort((a, b) => {
      if (a.code < b.code) {
        return -1;
      }
      if (a.code > b.code) {
        return 1;
      }
      return 0;
    });
  }

  const listItemOffset = (currentPage + 1) * moleculesPerPage + nextXMolecules;
  const canLoadMore = listItemOffset < joinedMoleculeLists.length;

  const wereMoleculesInitialized = useRef(false);

  useEffect(() => {
    if (
      (proteinsHasLoaded === true || proteinsHasLoaded === null) &&
      all_mol_lists?.length > 0 &&
      lhsCompoundsList?.length > 0
    ) {
      if (!directAccessProcessed && directDisplay && directDisplay.molecules && directDisplay.molecules.length > 0) {
        dispatch(applyDirectSelection(majorViewStage));
        wereMoleculesInitialized.current = true;
      }
      if (
        majorViewStage &&
        all_mol_lists &&
        hideProjects &&
        target !== undefined &&
        wereMoleculesInitialized.current === false &&
        tags &&
        tags.length > 0 &&
        categories &&
        categories.length > 0
      ) {
        dispatch(initializeFilter(object_selection, joinedMoleculeLists));
        dispatch(initializeMolecules(majorViewStage));
        wereMoleculesInitialized.current = true;
      }
      if (
        majorViewStage &&
        all_mol_lists &&
        target !== undefined &&
        wereMoleculesInitialized.current === false &&
        noTagsReceived
      ) {
        dispatch(initializeFilter(object_selection, joinedMoleculeLists));
        dispatch(initializeMolecules(majorViewStage));
        wereMoleculesInitialized.current = true;
      }
    }
  }, [
    list_type,
    lhsCompoundsList,
    majorViewStage,
    dispatch,
    hideProjects,
    target,
    proteinsHasLoaded,
    joinedMoleculeLists,
    all_mol_lists,
    directDisplay,
    directAccessProcessed,
    object_selection,
    tags,
    categories,
    noTagsReceived
  ]);

  const joinedMoleculeListsCopy = useMemo(() => [...joinedMoleculeLists], [joinedMoleculeLists]);

  // useEffect(() => {
  //   if (!joinedMoleculeListsCopy.length) {
  //     dispatch(setSortDialogOpen(false));
  //   }
  // }, [dispatch, joinedMoleculeListsCopy.length]);

  const handleFilterChange = filter => {
    const filterSet = Object.assign({}, filter);
    for (let attr of MOL_ATTRIBUTES) {
      if (filterSet.filter[attr.key].priority === undefined || filterSet.filter[attr.key].priority === '') {
        filterSet.filter[attr.key].priority = 0;
      }
    }
    dispatch(setFilter(filterSet));
  };

  const allSelectedMolecules = useMemo(
    () =>
      allMoleculesList.filter(
        molecule => moleculesToEditIds.includes(molecule.id) /* || molecule.id === molForTagEditId*/
      ),
    [allMoleculesList, moleculesToEditIds, molForTagEditId]
  );

  const allSelectedLHSCmps = useMemo(
    () => lhsCompoundsList.filter(cmp => obsCmpsToEditIds.includes(cmp.id) /* || molecule.id === molForTagEditId*/),
    [lhsCompoundsList, obsCmpsToEditIds, molForTagEditId]
  );

  let currentMolecules = joinedMoleculeLists.slice(0, listItemOffset);
  if (
    fragmentDisplayList.length === 0 &&
    proteinList.length === 0 &&
    complexList.length === 0 &&
    surfaceList.length === 0 &&
    densityList.length === 0 &&
    vectorOnList.length === 0
  ) {
    if (allSelectedMolecules.length === 0) {
      selectedDisplayHits = false;
    }
  } else {
    if (allSelectedMolecules.length === 0) {
      selectedDisplayHits = false;
    } else {
      if (allSelectedMolecules.length !== 0) {
        for (let i = 0; i < allSelectedMolecules.length; i++) {
          const selectedMolecule = allSelectedMolecules[i];
          if (
            fragmentDisplayList.includes(selectedMolecule.id) ||
            proteinList.includes(selectedMolecule.id) ||
            complexList.includes(selectedMolecule.id) ||
            surfaceList.includes(selectedMolecule.id) ||
            densityList.includes(selectedMolecule.id) ||
            vectorOnList.includes(selectedMolecule.id)
          ) {
            selectedDisplayHits = true;
          } else {
            selectedDisplayHits = false;
            break;
          }
        }
        if (selectedDisplayHits) {
          const notSelectedMols = [];
          const danglingFrags = fragmentDisplayList.filter(
            id => !allSelectedMolecules.filter(m => m.id === id).length > 0
          );
          if (danglingFrags && danglingFrags.length > 0) {
            notSelectedMols.push(danglingFrags);
          }
          const danglingProteins = proteinList.filter(id => !allSelectedMolecules.filter(m => m.id === id).length > 0);
          if (danglingProteins && danglingProteins.length > 0) {
            notSelectedMols.push(danglingProteins);
          }
          const danglingComplexes = complexList.filter(id => !allSelectedMolecules.filter(m => m.id === id).length > 0);
          if (danglingComplexes && danglingComplexes.length > 0) {
            notSelectedMols.push(danglingComplexes);
          }
          const danglingSurfaces = surfaceList.filter(id => !allSelectedMolecules.filter(m => m.id === id).length > 0);
          if (danglingSurfaces && danglingSurfaces.length > 0) {
            notSelectedMols.push(danglingSurfaces);
          }
          const danglingDensities = densityList.filter(id => !allSelectedMolecules.filter(m => m.id === id).length > 0);
          if (danglingDensities && danglingDensities.length > 0) {
            notSelectedMols.push(danglingDensities);
          }
          const danglingVectors = vectorOnList.filter(id => !allSelectedMolecules.filter(m => m.id === id).length > 0);
          if (danglingVectors && danglingVectors.length > 0) {
            notSelectedMols.push(danglingVectors);
          }
          if (notSelectedMols && notSelectedMols.length > 0) {
            selectedDisplayHits = false;
          }
        }
      }
    }
  }

  joinedMoleculeListsCopy.map(data => {
    if (fragmentDisplayList.includes(data.id)) {
      selectedMolecule.push(data);
    }
    if (proteinList.includes(data.id)) {
      selectedMolecule.push(data);
    }
    if (complexList.includes(data.id)) {
      selectedMolecule.push(data);
    }
    if (surfaceList.includes(data.id)) {
      selectedMolecule.push(data);
    }
    if (densityList.includes(data.id)) {
      selectedMolecule.push(data);
    }
    if (vectorOnList.includes(data.id)) {
      selectedMolecule.push(data);
    }
  });
  const uniqueSelectedMoleculeForHitNavigator = [...new Set(selectedMolecule)];

  const newMolsToEdit = [];
  currentMolecules.forEach(cm => {
    if (moleculesToEditIds.includes(cm.id)) {
      newMolsToEdit.push(cm.id);
    }
  });
  if (newMolsToEdit.length !== moleculesToEditIds.length) {
    dispatch(setMolListToEdit(newMolsToEdit));
  }

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
      newFilter = dispatch(initializeFilter(object_selection, joinedMoleculeLists));
    }
    // currently do not filter molecules by excluding them
    /*setFilteredCount(getFilteredMoleculesCount(getListedMolecules(object_selection, cached_mol_lists), newFilter));
      handleFilterChange(newFilter);*/
  };

  const joinedGivenMatch = useCallback(
    givenList => {
      return givenList.filter(element => allSelectedMolecules.filter(element2 => element2.id === element).length > 0)
        .length;
    },
    [allSelectedMolecules]
  );

  const joinedLigandMatchLength = useMemo(() => joinedGivenMatch(fragmentDisplayList), [
    fragmentDisplayList,
    joinedGivenMatch
  ]);
  const joinedProteinMatchLength = useMemo(() => joinedGivenMatch(proteinList), [proteinList, joinedGivenMatch]);
  const joinedComplexMatchLength = useMemo(() => joinedGivenMatch(complexList), [complexList, joinedGivenMatch]);

  const changeButtonClassname = (givenList = [], matchListLength) => {
    if (!matchListLength) {
      return false;
    } else if (allSelectedMolecules.length === matchListLength) {
      return true;
    }
    return null;
  };

  let filteredLHSCompoundsList = useMemo(() => {
    const compounds = [];
    lhsCompoundsList.forEach(compound => {
      const molsForCmp = joinedMoleculeLists.filter(molecule => molecule.cmpd === compound.id);
      if (molsForCmp.length > 0) {
        compounds.push(compound);
      }
    });
    return compounds;
  }, [lhsCompoundsList, joinedMoleculeLists]);

  let compoundMolecules = useMemo(() => {
    const compoundMolecules = {};

    filteredLHSCompoundsList.forEach(compound => {
      const molsForCmp = allMoleculesList.filter(molecule => molecule.cmpd === compound.id);
      compoundMolecules[compound.id] = molsForCmp.sort((a, b) => {
        if (a.code < b.code) {
          return -1;
        }
        if (a.code > b.code) {
          return 1;
        }
        return 0;
      });
    });

    return compoundMolecules;
  }, [filteredLHSCompoundsList, allMoleculesList]);

  useEffect(() => {
    if (isObservationDialogOpen && observationsForLHSCmp?.length > 0) {
      const cmpId = observationsForLHSCmp[0].cmpd;
      const cmp = filteredLHSCompoundsList.find(c => c.id === cmpId);
      if (!cmp) {
        dispatch(setObservationsForLHSCmp([]));
        dispatch(setOpenObservationsDialog(false));
      }
    }
  }, [isObservationDialogOpen, filteredLHSCompoundsList, observationsForLHSCmp, dispatch]);

  const isLigandOn = changeButtonClassname(fragmentDisplayList, joinedLigandMatchLength);
  const isProteinOn = changeButtonClassname(proteinList, joinedProteinMatchLength);
  const isComplexOn = changeButtonClassname(complexList, joinedComplexMatchLength);

  const addType = {
    ligand: addLigand,
    protein: addHitProtein,
    complex: addComplex,
    surface: addSurface,
    quality: addQuality,
    density: addDensity,
    vector: addVector
  };

  const removeType = {
    ligand: removeLigand,
    protein: removeHitProtein,
    complex: removeComplex,
    surface: removeSurface,
    quality: removeQuality,
    density: removeDensity,
    vector: removeVector
  };

  // TODO: "currentMolecules" do not need to correspondent to selections in {type}List
  // TODO: so this could lead to inconsistend behaviour while scrolling
  // TODO: maybe change "currentMolecules.forEach" to "{type}List.forEach"

  const removeSelectedType = (type, skipTracking = false) => {
    if (type === 'ligand') {
      allSelectedMolecules.forEach(molecule => {
        dispatch(removeType[type](majorViewStage, molecule, skipTracking));
      });
    } else {
      allSelectedMolecules.forEach(molecule => {
        dispatch(removeType[type](majorViewStage, molecule, colourList[molecule.id % colourList.length], skipTracking));
      });
    }

    selectedAll.current = false;
  };

  const removeSelectedTypes = useCallback(
    (skipMolecules = [], skipTracking = false) => {
      dispatch(removeSelectedTypesInHitNavigator(skipMolecules, majorViewStage, skipTracking));
    },
    [dispatch, majorViewStage]
  );

  const selectMoleculeTags = moleculeTagsSet => {
    const moleculeTags = tags.filter(tag => moleculeTagsSet.includes(tag.id));
    moleculeTags.forEach(tag => {
      dispatch(selectTag(tag));
    });
  };

  const addNewType = (type, skipTracking = false) => {
    dispatch(
      withDisabledMoleculesNglControlButtons(
        allSelectedMolecules.map(molecule => molecule.id),
        type,
        async () => {
          const promises = [];

          if (type === 'ligand') {
            allSelectedMolecules.forEach(molecule => {
              //selectMoleculeTags(molecule.tags_set);

              promises.push(
                dispatch(
                  addType[type](
                    majorViewStage,
                    molecule,
                    colourList[molecule.id % colourList.length],
                    false,
                    true,
                    skipTracking
                  )
                )
              );
            });
          } else {
            allSelectedMolecules.forEach(molecule => {
              //selectMoleculeTags(molecule.tags_set);
              promises.push(
                dispatch(
                  addType[type](majorViewStage, molecule, colourList[molecule.id % colourList.length], skipTracking)
                )
              );
            });
          }

          await Promise.all(promises);
        }
      )
    );
  };

  const ucfirst = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const onButtonToggle = (type, calledFromSelectAll = false) => {
    setLastProcessedLPCType(type);
    if (calledFromSelectAll === true && selectedAll.current === true) {
      // REDO
      if (eval('is' + ucfirst(type) + 'On') === false) {
        addNewType(type, true);
      }
    } else if (calledFromSelectAll && selectedAll.current === false) {
      removeSelectedType(type, true);
    } else if (!calledFromSelectAll) {
      if (eval('is' + ucfirst(type) + 'On') === false) {
        let molecules = getSelectedMoleculesByType(type, true);
        if (molecules && molecules.length > 100) {
          setIsOpenLPCAlert(true);
        } else {
          dispatch(setSelectedAllByType(type, molecules));
          addNewType(type, true);
        }
      } else {
        let molecules = getSelectedMoleculesByType(type, false);
        dispatch(setDeselectedAllByType(type, molecules));
        removeSelectedType(type, true);
      }
    }
  };

  const getSelectedMoleculesByType = (type, isAdd) => {
    switch (type) {
      case 'ligand':
        return isAdd ? getMoleculesToSelect(fragmentDisplayList) : getMoleculesToDeselect(fragmentDisplayList);
      case 'protein':
        return isAdd ? getMoleculesToSelect(proteinList) : getMoleculesToDeselect(proteinList);
      case 'complex':
        return isAdd ? getMoleculesToSelect(complexList) : getMoleculesToDeselect(complexList);
      default:
        return null;
    }
  };

  const getMoleculesToSelect = list => {
    let molecules = allSelectedMolecules.filter(m => !list.includes(m.id));
    return molecules;
  };

  const getMoleculesToDeselect = list => {
    let molecules = allSelectedMolecules.filter(m => list.includes(m.id));
    return molecules;
  };

  const actions = [
    <SearchField
      className={classes.search}
      id="search-hit-navigator"
      onChange={value => {
        // setSearchString(value);
        dispatch(setSearchStringOfHitNavigator(value));
      }}
      disabled={false || (getJoinedMoleculeList && getJoinedMoleculeList.length === 0)}
      // searchString={filterSearchString?.searchStringHitNavigator ?? ''}
      searchString={searchString ?? ''}
      placeholder="Search"
    />,

    <IconButton
      color={'inherit'}
      disabled={
        !joinedMoleculeListsCopy.length ||
        noTagsReceived ||
        !tags.length ||
        DJANGO_CONTEXT['username'] === 'NOT_LOGGED_IN'
      }
      onClick={event => {
        if (isTagEditorOpen === false) {
          setTagEditorAnchorEl(event.currentTarget);
          dispatch(setIsTagGlobalEdit(true));
          dispatch(setTagEditorOpen(true));
        } else {
          setTagEditorAnchorEl(null);
          dispatch(setIsTagGlobalEdit(false));
          dispatch(setTagEditorOpen(false));
        }
      }}
    >
      <Tooltip title="Edit tags">
        <Edit />
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
      // disabled={predefinedFilter !== 'none'}
      disabled={true}
    >
      <Tooltip title="Filter/Sort">
        <FilterList />
      </Tooltip>
    </IconButton>
  ];

  const [isOpenAlert, setIsOpenAlert] = useState(false);
  const [isOpenLPCAlert, setIsOpenLPCAlert] = useState(false);
  const [lastProcessedLPCType, setLastProcessedLPCType] = useState(null);

  const groupNglControlButtonsDisabledState = useDisableNglControlButtons(allSelectedMolecules);

  const anyControlButtonDisabled = Object.values(groupNglControlButtonsDisabledState).some(buttonState => buttonState);

  const containsAtLeastOne = (list, molsList) => {
    for (const mol in molsList) {
      if (list.includes(mol.id)) {
        return true;
      }
    }

    return false;
  };

  return (
    <Panel hasHeader title="Hit navigator" headerActions={actions}>
      <AlertModal
        title="Are you sure?"
        description={`Loading of ${joinedMoleculeLists?.length} may take a long time`}
        open={isOpenAlert}
        handleOnOk={() => {
          dispatch(setNextXMolecules(joinedMoleculeLists?.length || 0));
          setIsOpenAlert(false);
        }}
        handleOnCancel={() => {
          setIsOpenAlert(false);
        }}
      />
      <AlertModal
        title="Are you sure?"
        description={`Displaying of ${allSelectedMolecules?.length} may take a long time`}
        open={isOpenLPCAlert}
        handleOnOk={() => {
          let molecules = getSelectedMoleculesByType(lastProcessedLPCType, true);
          dispatch(setSelectedAllByType(lastProcessedLPCType, molecules));
          addNewType(lastProcessedLPCType, true);
          setIsOpenLPCAlert(false);
        }}
        handleOnCancel={() => {
          setIsOpenLPCAlert(false);
        }}
      />
      {isObservationDialogOpen && (
        <ObservationsDialog open={isObservationDialogOpen} anchorEl={tagEditorAnchorEl} ref={tagEditorRef} />
      )}
      {isTagEditorOpen && (
        <TagEditor
          open={isTagEditorOpen}
          closeDisabled={anyControlButtonDisabled}
          setOpenDialog={setTagEditorOpen}
          anchorEl={tagEditorAnchorEl}
          ref={tagEditorRef}
        />
      )}
      {sortDialogOpen && (
        <MoleculeListSortFilterDialog
          open={sortDialogOpen}
          anchorEl={sortDialogAnchorEl}
          filter={filter}
          setSortDialogAnchorEl={setSortDialogAnchorEl}
          joinedMoleculeLists={joinedMoleculeListsCopy}
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
                  <Grid container direction="row" justifyContent="flex-start" spacing={1}>
                    {filter.priorityOrder.map(attr => (
                      <Grid item key={`Mol-Tooltip-${attr}`}>
                        <Tooltip
                          title={`${filter.filter[attr].minValue}-${filter.filter[attr].maxValue} ${
                            filter.filter[attr].order === 1 ? '\u2191' : '\u2193'
                          }`}
                          placement="top"
                        >
                          <Chip size="small" label={attr} style={{ backgroundColor: getAttrDefinition(attr).color }} />
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
      <Grid container spacing={1}>
        <Grid style={{ marginTop: '4px' }}>
          <Tooltip title="all ligands" style={{ marginLeft: '1px' }}>
            {/* Tooltip should not have disabled element as a direct child */}
            <>
              <Button
                variant="outlined"
                className={classNames(classes.contColButton, {
                  [classes.contColButtonSelected]: isLigandOn === true,
                  [classes.contColButtonHalfSelected]: isLigandOn === null
                })}
                onClick={() => onButtonToggle('ligand')}
                disabled={groupNglControlButtonsDisabledState.ligand || allSelectedMolecules.length === 0}
              >
                L
              </Button>
            </>
          </Tooltip>
          <Tooltip title="all sidechains" style={{ marginLeft: '1px' }}>
            {/* Tooltip should not have disabled element as a direct child */}
            <>
              <Button
                variant="outlined"
                className={classNames(
                  allSelectedMolecules.length === 0 ? classes.contColButton : classes.contColButtonUnselected,
                  {
                    [classes.contColButtonSelected]: isProteinOn,
                    [classes.contColButtonHalfSelected]: isProteinOn === null
                  }
                )}
                onClick={() => onButtonToggle('protein')}
                disabled={groupNglControlButtonsDisabledState.protein || allSelectedMolecules.length === 0}
              >
                P
              </Button>
            </>
          </Tooltip>
          <Tooltip title="all interactions" style={{ marginLeft: '1px' }}>
            {/* Tooltip should not have disabled element as a direct child */}
            <>
              {/* C stands for contacts now */}
              <Button
                variant="outlined"
                className={classNames(
                  allSelectedMolecules.length === 0 ? classes.contColButton : classes.contColButtonUnselected,
                  {
                    [classes.contColButtonSelected]: isComplexOn,
                    [classes.contColButtonHalfSelected]: isComplexOn === null
                  }
                )}
                onClick={() => onButtonToggle('complex')}
                disabled={groupNglControlButtonsDisabledState.complex || allSelectedMolecules.length === 0}
              >
                C
              </Button>
            </>
          </Tooltip>
        </Grid>

        {
          <Tooltip title={selectAllHitsPressed ? 'Unselect all hits' : 'Select all hits'}>
            <Grid item style={{ marginLeft: '20px' }}>
              <Button
                variant="outlined"
                className={classNames(classes.contColButton, {
                  [classes.contColButtonSelected]: selectAllHitsPressed,
                  [classes.contColButtonHalfSelected]: false
                })}
                onClick={() => {
                  dispatch(selectAllHits(joinedMoleculeLists, setNextXMolecules, selectAllHitsPressed));
                  setSelectAllHitsPressed(!selectAllHitsPressed);
                }}
                disabled={false}
              >
                {selectAllHitsPressed ? 'Unselect all hits' : 'Select all hits'}
              </Button>
            </Grid>
          </Tooltip>
        }
        {selectedDisplayHits === true ? (
          <Tooltip title={'Unselect displayed hits'}>
            <Grid item style={{ marginLeft: '20px' }}>
              <Button
                variant="outlined"
                className={classNames(classes.contColButton, {
                  [classes.contColButtonSelected]: selectedDisplayHits,
                  [classes.contColButtonHalfSelected]: false
                })}
                onClick={() => {
                  dispatch(selectAllHits([], null, false));
                  // setSelectDisplayedHitsPressed(!selectDisplayedHitsPressed);
                }}
                disabled={false}
              >
                Unselect displayed hits
              </Button>
            </Grid>
          </Tooltip>
        ) : (
          <Tooltip title={'Select displayed hits'}>
            <Grid item style={{ marginLeft: '20px' }}>
              <Button
                variant="outlined"
                className={classNames(classes.contColButton, {
                  [classes.contColButtonSelected]: selectedDisplayHits,
                  [classes.contColButtonHalfSelected]: false
                })}
                onClick={() => {
                  dispatch(selectAllHits(uniqueSelectedMoleculeForHitNavigator, null, false));
                  // setSelectDisplayedHitsPressed(!selectDisplayedHitsPressed);
                }}
                disabled={false}
              >
                Select displayed hits
              </Button>
            </Grid>
          </Tooltip>
        )}
        <Grid style={{ marginTop: '4px' }}>
          <Typography variant="caption" className={classes.noOfSelectedHits}>{`Selected: ${
            allSelectedMolecules ? allSelectedMolecules.length : 0
          }`}</Typography>
        </Grid>
      </Grid>
      <Grid container spacing={1} direction="column" justifyContent="flex-start" className={classes.container}>
        <Grid item>
          {/* Header */}
          <Grid
            container
            spacing={1}
            justifyContent="flex-start"
            direction="row"
            className={classes.molHeader}
            wrap="nowrap"
          >
            <Grid item container justifyContent="flex-start" direction="row">
              {/* {Object.keys(moleculeProperty).map(key => (
                <Grid item key={key} className={classes.rightBorder}>
                  {moleculeProperty[key]}
                </Grid>
              ))} */}
            </Grid>
          </Grid>
        </Grid>
        {currentMolecules.length > 0 && (
          <>
            <Grid item className={classes.gridItemList} ref={scrollBarRef}>
              <InfiniteScroll
                getScrollParent={() =>
                  dispatch(
                    autoHideTagEditorDialogsOnScroll({
                      tagEditorRef,
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
                {filteredLHSCompoundsList.map((data, index, array) => {
                  const molsForCmp = compoundMolecules[data.id];
                  // const selected = allSelectedLHSCmps.some(molecule => molecule.id === data.id);
                  const selected = allSelectedMolecules.some(molecule => molecule.cmpd === data.id);

                  return (
                    <ObservationCmpView
                      key={data.id}
                      imageHeight={imgHeight}
                      imageWidth={imgWidth}
                      data={data}
                      index={index}
                      setRef={setTagEditorAnchorEl}
                      L={containsAtLeastOne(fragmentDisplayList, molsForCmp)}
                      P={containsAtLeastOne(proteinList, molsForCmp)}
                      C={containsAtLeastOne(complexList, molsForCmp)}
                      S={containsAtLeastOne(surfaceList, molsForCmp)}
                      D={containsAtLeastOne(densityList, molsForCmp)}
                      D_C={containsAtLeastOne(densityListCustom, molsForCmp)}
                      Q={containsAtLeastOne(qualityList, molsForCmp)}
                      V={containsAtLeastOne(vectorOnList, molsForCmp)}
                      I={containsAtLeastOne(informationList, molsForCmp)}
                      selected={selected}
                      disableL={false}
                      disableP={false}
                      disableC={false}
                      observations={molsForCmp}
                    />
                  );
                })}
              </InfiniteScroll>
            </Grid>
            <Grid item>
              <Grid container spacing={1} justifyContent="space-between" alignItems="center" direction="row">
                <Grid item>
                  <span className={classes.total}>{`Total ${joinedMoleculeLists?.length}`}</span>
                </Grid>
                <Grid item>
                  <ButtonGroup variant="text" size="medium" color="primary" aria-label="contained primary button group">
                    <Button
                      onClick={() => {
                        dispatch(setNextXMolecules(30));
                      }}
                    >
                      Load next 30
                    </Button>
                    <Button
                      onClick={() => {
                        dispatch(setNextXMolecules(100));
                      }}
                    >
                      Load next 100
                    </Button>
                    <Button
                      onClick={() => {
                        if (joinedMoleculeLists?.length > 300) {
                          setIsOpenAlert(true);
                        } else {
                          dispatch(setNextXMolecules(joinedMoleculeLists?.length || 0));
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
        {moleculesAndTagsAreLoading && (
          <Grid container direction="row" justifyContent="center">
            <Grid item>
              <CircularProgress />
            </Grid>
          </Grid>
        )}
      </Grid>
    </Panel>
  );
});
