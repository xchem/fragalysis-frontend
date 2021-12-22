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
// import { useDisableUserInteraction } from '../../helpers/useEnableUserInteracion';
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
  removeSelectedMolTypes,
  addQuality,
  removeQuality
} from './redux/dispatchActions';
import { DEFAULT_FILTER, PREDEFINED_FILTERS } from '../../../reducers/selection/constants';
import { Edit, FilterList, Search } from '@material-ui/icons';
import { selectAllMoleculeList, selectJoinedMoleculeList } from './redux/selectors';
import { debounce } from 'lodash';
import { MOL_ATTRIBUTES } from './redux/constants';
import { setFilter, setDisplayAllMolecules } from '../../../reducers/selection/actions';
import { initializeFilter } from '../../../reducers/selection/dispatchActions';
import * as listType from '../../../constants/listTypes';
import { useRouteMatch } from 'react-router-dom';
import { setSortDialogOpen } from './redux/actions';
import { AlertModal } from '../../common/Modal/AlertModal';
import {
  setSelectedAllByType,
  setDeselectedAllByType,
  setTagEditorOpen,
  setDisplayedMoleculesInHitNav,
  setIsTagGlobalEdit
} from '../../../reducers/selection/actions';
import { TagEditor } from '../tags/modal/tagEditor';
import { getMoleculeForId, selectTag } from '../tags/redux/dispatchActions';

const useStyles = makeStyles(theme => ({
  container: {
    minHeight: '100px',
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
  },
  total: {
    ...theme.typography.button,
    color: theme.palette.primary.main,
    fontStyle: 'italic'
  }
}));

export const MoleculeList = memo(({ height, setFilterItemsHeight, filterItemsHeight, hideProjects }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  let match = useRouteMatch();
  let target = match && match.params && match.params.target;

  const [nextXMolecules, setNextXMolecules] = useState(0);
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
  const displayAllMolecules = useSelector(state => state.selectionReducers.displayAllMolecules);

  const object_selection = useSelector(state => state.selectionReducers.mol_group_selection);

  const allInspirationMoleculeDataList = useSelector(state => state.datasetsReducers.allInspirationMoleculeDataList);

  const all_mol_lists = useSelector(state => state.apiReducers.all_mol_lists);
  const directDisplay = useSelector(state => state.apiReducers.direct_access);
  const directAccessProcessed = useSelector(state => state.apiReducers.direct_access_processed);
  const isTrackingRestoring = useSelector(state => state.trackingReducers.isTrackingMoleculesRestoring);
  const tags = useSelector(state => state.selectionReducers.tagList);
  const noTagsReceived = useSelector(state => state.apiReducers.noTagsReceived);
  const categories = useSelector(state => state.selectionReducers.categoryList);

  const proteinsHasLoaded = useSelector(state => state.nglReducers.proteinsHasLoaded);

  const [predefinedFilter, setPredefinedFilter] = useState(filter !== undefined ? filter.predefined : DEFAULT_FILTER);

  const isActiveFilter = !!(filter || {}).active;

  const { getNglView } = useContext(NglContext);
  const majorViewStage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;
  const stageSummaryView = getNglView(VIEWS.SUMMARY_VIEW) && getNglView(VIEWS.SUMMARY_VIEW).stage;

  const filterRef = useRef();
  const tagEditorRef = useRef();
  const [tagEditorAnchorEl, setTagEditorAnchorEl] = useState(null);

  // const disableUserInteraction = useDisableUserInteraction();

  if (directDisplay && directDisplay.target) {
    target = directDisplay.target;
  }

  // TODO Reset Infinity scroll
  /*useEffect(() => {
      // setCurrentPage(0);
    }, [object_selection]);*/

  let joinedMoleculeLists = useMemo(() => {
    if (searchString) {
      return allMoleculesList.filter(molecule =>
        molecule.protein_code.toLowerCase().includes(searchString.toLowerCase())
      );
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
  joinedMoleculeLists = useMemo(() => addSelectedMoleculesFromUnselectedSites(joinedMoleculeLists, proteinList), [
    addSelectedMoleculesFromUnselectedSites,
    joinedMoleculeLists,
    proteinList,
    molForTagEditId,
    isTagEditorOpen
  ]);
  joinedMoleculeLists = useMemo(() => addSelectedMoleculesFromUnselectedSites(joinedMoleculeLists, complexList), [
    addSelectedMoleculesFromUnselectedSites,
    joinedMoleculeLists,
    complexList,
    molForTagEditId,
    isTagEditorOpen
  ]);
  joinedMoleculeLists = useMemo(
    () => addSelectedMoleculesFromUnselectedSites(joinedMoleculeLists, fragmentDisplayList),
    [
      addSelectedMoleculesFromUnselectedSites,
      joinedMoleculeLists,
      fragmentDisplayList,
      molForTagEditId,
      isTagEditorOpen
    ]
  );
  joinedMoleculeLists = useMemo(() => addSelectedMoleculesFromUnselectedSites(joinedMoleculeLists, surfaceList), [
    addSelectedMoleculesFromUnselectedSites,
    joinedMoleculeLists,
    surfaceList,
    molForTagEditId,
    isTagEditorOpen
  ]);
  joinedMoleculeLists = useMemo(() => addSelectedMoleculesFromUnselectedSites(joinedMoleculeLists, densityList), [
    addSelectedMoleculesFromUnselectedSites,
    joinedMoleculeLists,
    densityList,
    molForTagEditId,
    isTagEditorOpen
  ]);
  joinedMoleculeLists = useMemo(() => addSelectedMoleculesFromUnselectedSites(joinedMoleculeLists, vectorOnList), [
    addSelectedMoleculesFromUnselectedSites,
    joinedMoleculeLists,
    vectorOnList,
    molForTagEditId,
    isTagEditorOpen
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
        if (a.protein_code < b.protein_code) {
          return -1;
        }
        if (a.protein_code > b.protein_code) {
          return 1;
        }
        return 0;
      });
    }
  }

  const listItemOffset = (currentPage + 1) * moleculesPerPage + nextXMolecules;
  const currentMolecules = joinedMoleculeLists.slice(0, listItemOffset);
  dispatch(setDisplayedMoleculesInHitNav(currentMolecules));
  const canLoadMore = listItemOffset < joinedMoleculeLists.length;

  const wereMoleculesInitialized = useRef(false);

  useEffect(() => {
    if ((proteinsHasLoaded === true || proteinsHasLoaded === null) && all_mol_lists.length > 0) {
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

  useEffect(() => {
    if (isActiveFilter === false) {
      setFilterItemsHeight(0);
    }
  }, [isActiveFilter, setFilterItemsHeight]);

  const joinedMoleculeListsCopy = useMemo(() => [...joinedMoleculeLists], [joinedMoleculeLists]);

  useEffect(() => {
    if (!joinedMoleculeListsCopy.length) {
      dispatch(setSortDialogOpen(false));
    }
  }, [dispatch, joinedMoleculeListsCopy.length]);

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
      newFilter = dispatch(initializeFilter(object_selection, joinedMoleculeLists));
    }
    // currently do not filter molecules by excluding them
    /*setFilteredCount(getFilteredMoleculesCount(getListedMolecules(object_selection, cached_mol_lists), newFilter));
      handleFilterChange(newFilter);*/
  };

  const joinedGivenMatch = useCallback(
    givenList => {
      return givenList.filter(element => joinedMoleculeLists.filter(element2 => element2.id === element).length > 0)
        .length;
    },
    [joinedMoleculeLists]
  );

  const joinedLigandMatchLength = useMemo(() => joinedGivenMatch(fragmentDisplayList), [
    fragmentDisplayList,
    joinedGivenMatch
  ]);
  const joinedProteinMatchLength = useMemo(() => joinedGivenMatch(proteinList), [proteinList, joinedGivenMatch]);
  const joinedComplexMatchLength = useMemo(() => joinedGivenMatch(complexList), [complexList, joinedGivenMatch]);

  const changeButtonClassname = (givenList = [], matchListLength) => {
    if (joinedMoleculeLists.length === matchListLength) {
      return true;
    } else if (givenList.length > 0 && matchListLength > 0) {
      return null;
    }
    return false;
  };

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

  // TODO "currentMolecules" do not need to correspondent to selections in {type}List
  // TODO so this could lead to inconsistend behaviour while scrolling
  // TODO maybe change "currentMolecules.forEach" to "{type}List.forEach"

  const removeSelectedType = (type, skipTracking = false) => {
    if (type === 'ligand') {
      joinedMoleculeLists.forEach(molecule => {
        dispatch(removeType[type](majorViewStage, molecule, skipTracking));
      });
    } else {
      joinedMoleculeLists.forEach(molecule => {
        dispatch(removeType[type](majorViewStage, molecule, colourList[molecule.id % colourList.length], skipTracking));
      });
    }

    selectedAll.current = false;
  };

  const removeSelectedTypes = (skipMolecules = [], skipTracking = false) => {
    const molecules = [...getJoinedMoleculeList, ...allInspirationMoleculeDataList].filter(
      molecule => !skipMolecules.includes(molecule)
    );
    dispatch(removeSelectedMolTypes(majorViewStage, molecules, skipTracking, false));
  };

  const selectMoleculeTags = moleculeTagsSet => {
    const moleculeTags = tags.filter(tag => moleculeTagsSet.includes(tag.id));
    moleculeTags.forEach(tag => {
      dispatch(selectTag(tag));
    });
  };

  const addNewType = (type, skipTracking = false) => {
    if (type === 'ligand') {
      joinedMoleculeLists.forEach(molecule => {
        selectMoleculeTags(molecule.tags_set);
        dispatch(
          addType[type](
            majorViewStage,
            molecule,
            colourList[molecule.id % colourList.length],
            false,
            true,
            skipTracking
          )
        );
      });
    } else {
      joinedMoleculeLists.forEach(molecule => {
        selectMoleculeTags(molecule.tags_set);
        dispatch(addType[type](majorViewStage, molecule, colourList[molecule.id % colourList.length], skipTracking));
      });
    }
  };

  const ucfirst = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const onButtonToggle = (type, calledFromSelectAll = false) => {
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
        dispatch(setSelectedAllByType(type, molecules));
        addNewType(type, true);
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
    let molecules = joinedMoleculeLists.filter(m => !list.includes(m.id));
    return molecules;
  };

  const getMoleculesToDeselect = list => {
    let molecules = joinedMoleculeLists.filter(m => list.includes(m.id));
    return molecules;
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

  const openGlobalTagEditor = () => {};

  const actions = [
    <FormControl className={classes.formControl} disabled={!joinedMoleculeListsCopy.length || sortDialogOpen}>
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
      disabled={false || (getJoinedMoleculeList && getJoinedMoleculeList.length === 0)}
    />,

    <IconButton
      color={'inherit'}
      disabled={!joinedMoleculeListsCopy.length || noTagsReceived}
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
      disabled={!joinedMoleculeListsCopy.length || predefinedFilter !== 'none'}
    >
      <Tooltip title="Filter/Sort">
        <FilterList />
      </Tooltip>
    </IconButton>
  ];

  const [isOpenAlert, setIsOpenAlert] = useState(false);

  return (
    <ComputeSize
      componentRef={filterRef.current}
      setHeight={setFilterItemsHeight}
      height={filterItemsHeight}
      forceCompute={isActiveFilter}
    >
      <Panel hasHeader title="Hit navigator" headerActions={actions}>
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
        {isTagEditorOpen && (
          <TagEditor
            open={isTagEditorOpen}
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
                <Grid item>
                  <Grid
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="center"
                    wrap="nowrap"
                    className={classes.contButtonsMargin}
                  >
                    {currentMolecules.length > 0 && (
                      <>
                        <Tooltip title="all ligands">
                          <Grid item>
                            <Button
                              variant="outlined"
                              className={classNames(classes.contColButton, {
                                [classes.contColButtonSelected]: isLigandOn === true,
                                [classes.contColButtonHalfSelected]: isLigandOn === null
                              })}
                              onClick={() => onButtonToggle('ligand')}
                              disabled={false}
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
                              disabled={false}
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
                              disabled={false}
                            >
                              C
                            </Button>
                          </Grid>
                        </Tooltip>
                      </>
                    )}
                    {false && (
                      <Tooltip title="Show all hits">
                        <Grid item>
                          <Button
                            variant="outlined"
                            className={classNames(classes.contColButton, {
                              [classes.contColButtonSelected]: displayAllMolecules,
                              [classes.contColButtonHalfSelected]: false
                            })}
                            onClick={() => {
                              dispatch(setDisplayAllMolecules(!displayAllMolecules));
                            }}
                            disabled={false}
                          >
                            Display all molecules
                          </Button>
                        </Grid>
                      </Tooltip>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          {currentMolecules.length > 0 && (
            <>
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
                  {currentMolecules.map((data, index, array) => (
                    <MoleculeView
                      key={data.id}
                      index={index}
                      imageHeight={imgHeight}
                      imageWidth={imgWidth}
                      data={data}
                      previousItemData={index > 0 && array[index - 1]}
                      nextItemData={index < array?.length && array[index + 1]}
                      setRef={setTagEditorAnchorEl}
                      removeSelectedTypes={removeSelectedTypes}
                      L={fragmentDisplayList.includes(data.id)}
                      P={proteinList.includes(data.id)}
                      C={complexList.includes(data.id)}
                      S={surfaceList.includes(data.id)}
                      D={densityList.includes(data.id)}
                      D_C={densityListCustom.includes(data.id)}
                      Q={qualityList.includes(data.id)}
                      V={vectorOnList.includes(data.id)}
                      I={informationList.includes(data.id)}
                      selectMoleculeSite={selectMoleculeTags}
                      eventInfo={data?.proteinData?.event_info}
                      sigmaaInfo={data?.proteinData?.sigmaa_info}
                      diffInfo={data?.proteinData?.diff_info}
                    />
                  ))}
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
});
