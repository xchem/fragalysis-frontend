/**
 * Created by abradley on 14/03/2018.
 */
import {
  Grid,
  makeStyles,
  CircularProgress,
  Typography,
  IconButton,
  ButtonGroup,
  Select,
  MenuItem,
  Checkbox
} from '@material-ui/core';
import React, { useState, useEffect, useCallback, memo, useRef, useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { colourList } from './utils/color';
import { filterMolecules } from './moleculeListSortFilterDialog';
import InfiniteScroll from 'react-infinite-scroller';
import { Button } from '../../common/Inputs/Button';
import { Panel } from '../../common/Surfaces/Panel';
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
  selectAllVisibleObservations,
  searchForObservations
} from './redux/dispatchActions';
import { DEFAULT_FILTER, PREDEFINED_FILTERS } from '../../../reducers/selection/constants';
import { Edit, FilterList } from '@material-ui/icons';
import { getLHSCompoundsList, selectAllMoleculeList, selectJoinedMoleculeList } from './redux/selectors';
import { MOL_ATTRIBUTES } from './redux/constants';
import {
  setFilter,
  setMolListToEdit,
  setNextXMolecules,
  setObservationsForLHSCmp,
  setOpenObservationsDialog,
  setLHSCompoundsInitialized,
  setPoseIdForObservationsDialog,
  setSearchSettingsDialogOpen,
  setLHSIsFullyRendered,
  setSelectedAllByType,
  setDeselectedAllByType,
  setTagEditorOpen,
  setIsTagGlobalEdit,
  addToastMessage
} from '../../../reducers/selection/actions';
import { initializeFilter } from '../../../reducers/selection/dispatchActions';
import * as listType from '../../../constants/listTypes';
import { useRouteMatch } from 'react-router-dom';
import { setSortDialogOpen, setSearchStringOfHitNavigator } from './redux/actions';
import { AlertModal } from '../../common/Modal/AlertModal';
import { TagEditor } from '../tags/modal/tagEditor';
import { getMoleculeForId, selectTag } from '../tags/redux/dispatchActions';
import SearchField from '../../common/Components/SearchField';
import useDisableNglControlButtons from './useDisableNglControlButtons';
import { extractTargetFromURLParam } from '../utils';
import { LoadingContext } from '../../loading';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
import { ObservationsDialog } from './observationsDialog';
import { useScrollToSelectedPose } from './useScrollToSelectedPose';
import { SearchSettingsDialog } from './searchSettingsDialog';
import { TOAST_LEVELS } from '../../toast/constants';
import { FilterSettingsModal } from './observationUnifiedView/table';
import ObservationUnifiedViewWrapper from './observationUnifiedView/observationUnifiedViewWrapper';
import RichTooltip from '../../tooltip/RichTooltip';
import { TooltipPathProvider } from '../../tooltip/TooltipPathContext';

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
    height: `calc(99% - ${theme.spacing(6)}px - ${theme.spacing(2)}px)`,
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
  selectButton: {
    padding: '4px 2px !important'
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
  },
  footerButton: {
    padding: '6px 7px'
  }
}));
let selectedDisplayHits = false;

/**
 * Generic ObservationCmpList component.
 *
 * All Redux data is provided via props. Mutation operations are provided via the `handlers` prop
 * (polymorphism / dependency injection). Auxiliary UI state (dialog open/close flags) stays
 * inside this component via `useSelector`, but the selector functions are injected through
 * `instanceConfig` so that multiple independent instances can each track their own state.
 *
 * Props:
 *   handlers      - All mutation functions, replacing direct dispatch calls.
 *   instanceConfig - Selector functions for auxiliary UI state + action creators needed by
 *                    child components that call dispatch(prop) internally (e.g. TagEditor).
 */
export const ObservationCmpList = memo(
  ({
    // --- Core data (formerly from useSelector) ---
    nextXMolecules,
    searchString,
    filter,
    getJoinedMoleculeList,
    allMoleculesList,
    dataAreDownloading,
    dataAreDownloaded,
    errorOccuredDuringDownload,
    proteinList,
    complexList,
    fragmentDisplayList,
    surfaceList,
    densityList,
    qualityList,
    vectorOnList,
    informationList,
    isTagEditorOpen,
    molForTagEditId,
    moleculesToEditIds,
    isGlobalEdit,
    object_selection,
    all_mol_lists,
    directDisplay,
    directAccessProcessed,
    tags,
    noTagsReceived,
    categories,
    lhsDataIsLoaded,
    observationsForLHSCmp,
    lhsCompoundsList,
    proteinsHasLoaded,
    searchSettings,
    // --- Polymorphic handlers: caller provides implementations for all mutation operations ---
    handlers = {},
    // --- Instance config: injected selector functions + action creators for auxiliary state ---
    instanceConfig = {}
  }) => {
    const classes = useStyles();
    let match = useRouteMatch();
    let target = match && match.params && extractTargetFromURLParam(match.params[0]);

    const [selectAllHitsPressed, setSelectAllHitsPressed] = useState(false);

    const moleculesPerPage = 30;
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsToBeDisplayed, setItemsToBeDisplayed] = useState([]);
    const [sortSettingsChanged, setSortSettingsChanged] = useState(false);

    const [sortDialogAnchorEl, setSortDialogAnchorEl] = useState(null);
    const oldUrl = useRef('');
    const setOldUrl = url => {
      oldUrl.current = url;
    };
    const list_type = listType.MOLECULE;

    const selectedAll = useRef(false);
    const allMolListsLength = all_mol_lists?.length || 0;

    // --- Auxiliary UI state: selector functions injected via instanceConfig for instance differentiation ---
    const sortDialogOpen = useSelector(instanceConfig.selectSortDialogOpen || (() => false));
    const isObservationDialogOpen = useSelector(instanceConfig.selectIsObservationDialogOpen || (() => false));
    const searchSettingsDialogOpen = useSelector(instanceConfig.selectSearchSettingsDialogOpen || (() => false));
    const areLSHCompoundsInitialized = useSelector(instanceConfig.selectAreLHSCompoundsInitialized || (() => false));

    const [predefinedFilter, setPredefinedFilter] = useState(filter !== undefined ? filter.predefined : DEFAULT_FILTER);

    const [ascending, setAscending] = useState(true);
    const handleAscendingChecked = event => {
      setAscending(event.target.checked);
      setSortSettingsChanged(true);
    };
    const SORT_OPTIONS = [
      'POSE_NAME',
      'COMPOUND_CODE',
      'CANONSITE_NUMBER',
      'CONFORMERSITE_NUMBER',
      'OBSERVATION_COUNT'
    ];
    const sortOptions = {
      POSE_NAME: {
        title: 'Pose name',
        handler: (a, b, asc) => compareByPoseName(a, b, asc)
      },
      COMPOUND_CODE: {
        title: 'Compound code',
        handler: (a, b, asc) => compareByCompoundCode(a, b, asc)
      },
      CANONSITE_NUMBER: {
        title: 'CanonSite number',
        handler: (a, b, asc) => compareByCanonSiteNumber(a, b, asc)
      },
      CONFORMERSITE_NUMBER: {
        title: 'ConformerSite number',
        handler: (a, b, asc) => compareByConformerSiteNumber(a, b, asc)
      },
      OBSERVATION_COUNT: {
        title: 'Observation count',
        handler: (a, b, asc) => compareByObservationCount(a, b, asc)
      }
    };
    const [sortOption, setSortOption] = useState(SORT_OPTIONS[0]);

    const compareByPoseName = (a, b, asc) => {
      const aName = a.code;
      const bName = b.code;
      return asc
        ? aName?.localeCompare(bName, undefined, { numeric: true, sensitivity: 'base' })
        : bName?.localeCompare(aName, undefined, { numeric: true, sensitivity: 'base' });
    };
    const compareByCompoundCode = (a, b, asc) => {
      const aName = a.main_site_observation_cmpd_code;
      const bName = b.main_site_observation_cmpd_code;
      return asc
        ? aName?.localeCompare(bName, undefined, { numeric: true, sensitivity: 'base' })
        : bName?.localeCompare(aName, undefined, { numeric: true, sensitivity: 'base' });
    };
    const compareByCanonSiteNumber = (a, b, asc) => {
      const aName = getCanonSiteTagPrefix(a);
      const bName = getCanonSiteTagPrefix(b);
      return asc
        ? aName?.localeCompare(bName, undefined, { numeric: true, sensitivity: 'base' })
        : bName?.localeCompare(aName, undefined, { numeric: true, sensitivity: 'base' });
    };
    const compareByConformerSiteNumber = (a, b, asc) => {
      const aName = getConformerSiteTagPrefix(a);
      const bName = getConformerSiteTagPrefix(b);
      return asc
        ? aName?.localeCompare(bName, undefined, { numeric: true, sensitivity: 'base' })
        : bName?.localeCompare(aName, undefined, { numeric: true, sensitivity: 'base' });
    };
    const compareByObservationCount = (a, b, asc) => {
      const aCount = a.site_observations.length;
      const bCount = b.site_observations.length;
      return asc ? aCount - bCount : bCount - aCount;
    };

    useEffect(() => {
      if (!dataAreDownloading && dataAreDownloaded /*all_mol_lists?.length > 0*/) {
        requestAnimationFrame(() => {
          // Add another frame just to be sure rendering is done
          requestAnimationFrame(() => {
            handlers.setFullyRendered(true);
          });
        });
      }
    }, [dataAreDownloading, all_mol_lists, handlers, dataAreDownloaded]);

    useEffect(() => {
      if (dataAreDownloaded && !errorOccuredDuringDownload && allMolListsLength <= 0) {
        handlers.addToastMessage({
          text: `Target data downloaded but no molecules found. This is usually caused by network issues so please try again later. If the issue persists, please contact us.`,
          level: TOAST_LEVELS.ERROR
        });
      }
    }, [dataAreDownloaded, errorOccuredDuringDownload, handlers, allMolListsLength]);

    // NOTE: areLSHCompoundsInitialized is declared above via instanceConfig.selectAreLHSCompoundsInitialized

    /**
     * Get CanonSites tag for sorting
     */
    const getCanonSiteTagPrefix = useCallback(
      pose => {
        const mainObservation = pose.associatedObs.find(observation => observation.id === pose.main_site_observation);
        const canonSitesTag = categories.find(tagCategory => tagCategory.category === 'CanonSites');
        const canonSite = tags.find(
          tag => tag.category === canonSitesTag.id && tag.site_observations.includes(mainObservation.id)
        );
        return canonSite !== undefined ? canonSite.tag_prefix : '';
      },
      [categories, tags]
    );

    /**
     * Get ConformerSites tag for sorting
     */
    const getConformerSiteTagPrefix = useCallback(
      pose => {
        const mainObservation = pose.associatedObs.find(observation => observation.id === pose.main_site_observation);
        const conformerSitesTag = categories.find(tagCategory => tagCategory.category === 'ConformerSites');
        const conformerSite = tags.find(
          tag => tag.category === conformerSitesTag.id && tag.site_observations.includes(mainObservation.id)
        );
        return conformerSite !== undefined ? conformerSite.tag_prefix : '';
      },
      [categories, tags]
    );

    const isActiveFilter = !!(filter || {}).active;

    const { getNglView } = useContext(NglContext);
    const { moleculesAndTagsAreLoading } = useContext(LoadingContext);
    const majorViewStage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

    const filterRef = useRef();
    const tagEditorRef = useRef();
    const scrollBarRef = useRef();
    const hitNavigatorRef = useRef();
    const [tagEditorAnchorEl, setTagEditorAnchorEl] = useState(null);
    const [hitNavigatorWidth, setHitNavigatorWidth] = useState(0);

    useEffect(() => {
      if (hitNavigatorRef && hitNavigatorRef.current) {
        const resizeObserver = new ResizeObserver(() => {
          if (hitNavigatorRef.current.offsetWidth !== hitNavigatorWidth) {
            setHitNavigatorWidth(hitNavigatorRef.current.offsetWidth);
          }
        });

        resizeObserver.observe(hitNavigatorRef.current);

        return function cleanup() {
          resizeObserver.disconnect();
        };
      }
    }, [hitNavigatorRef, hitNavigatorWidth]);

    if (directDisplay && directDisplay.target) {
      target = directDisplay.target;
    }

    // const { addMoleculeViewRef, setScrollToMoleculeId, getNode } = useScrollToSelectedPose(
    //   moleculesPerPage,
    //   setCurrentPage,
    //   loadMolecules
    // );

    let selectedMolecule = [];
    // TODO: Reset Infinity scroll
    /*useEffect(() => {
      // setCurrentPage(0);
    }, [object_selection]);*/

    let joinedMoleculeLists = useMemo(() => {
      if (searchString) {
        setCurrentPage(0);
        setItemsToBeDisplayed([]);
        return handlers.searchForObservations(searchString, allMoleculesList, searchSettings);
      } else {
        return getJoinedMoleculeList;
      }
    }, [searchString, handlers, allMoleculesList, getJoinedMoleculeList, searchSettings]);

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
      moleculesToEditIds
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    joinedMoleculeLists = useMemo(() => addSelectedMoleculesFromUnselectedSites(joinedMoleculeLists, complexList), [
      addSelectedMoleculesFromUnselectedSites,
      joinedMoleculeLists,
      complexList,
      molForTagEditId,
      isTagEditorOpen,
      moleculesToEditIds
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
        moleculesToEditIds
      ]
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    joinedMoleculeLists = useMemo(() => addSelectedMoleculesFromUnselectedSites(joinedMoleculeLists, surfaceList), [
      addSelectedMoleculesFromUnselectedSites,
      joinedMoleculeLists,
      surfaceList,
      molForTagEditId,
      isTagEditorOpen,
      moleculesToEditIds
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    joinedMoleculeLists = useMemo(() => {
      const addedMols = [...joinedMoleculeLists];
      const onlyAlreadySelected = [];
      densityList?.forEach(d => {
        const foundJoinedMolecule = addedMols.find(mol => mol.id === d.id);
        if (!foundJoinedMolecule) {
          const molecule = allMoleculesList.find(mol => mol.id === d.id);
          if (molecule) {
            addedMols.push(molecule);
            onlyAlreadySelected.push(molecule);
          }
        }
      });

      const result = [...onlyAlreadySelected, ...joinedMoleculeLists];
      return result;
    }, [joinedMoleculeLists, densityList, allMoleculesList]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    joinedMoleculeLists = useMemo(() => addSelectedMoleculesFromUnselectedSites(joinedMoleculeLists, vectorOnList), [
      addSelectedMoleculesFromUnselectedSites,
      joinedMoleculeLists,
      vectorOnList,
      molForTagEditId,
      isTagEditorOpen,
      moleculesToEditIds
    ]);

    if (isActiveFilter) {
      joinedMoleculeLists = filterMolecules(joinedMoleculeLists, filter);
    }

    const loadNextMolecules = () => {
      setCurrentPage(currentPage + 1);
      setItemsToBeDisplayed(filteredLHSCompoundsList.slice(0, (currentPage + 1) * moleculesPerPage));
    };

    const loadMolecules = () => {
      setItemsToBeDisplayed(filteredLHSCompoundsList.slice(0, currentPage * moleculesPerPage));
    };

    const { addMoleculeViewRef, setScrollToMoleculeId, getNode } = useScrollToSelectedPose(
      moleculesPerPage,
      setCurrentPage,
      loadMolecules
    );

    useEffect(() => {
      if (nextXMolecules || sortSettingsChanged) {
        const newCurrentPage = currentPage + Math.ceil(nextXMolecules / moleculesPerPage);
        setCurrentPage(newCurrentPage);
        setItemsToBeDisplayed(filteredLHSCompoundsList.slice(0, newCurrentPage * moleculesPerPage));
        handlers.setNextXMolecules(0);
        setSortSettingsChanged(false);
      }
    }, [currentPage, handlers, filteredLHSCompoundsList, nextXMolecules, sortSettingsChanged]);

    if (molForTagEditId && !joinedMoleculeLists.some(m => m.id === molForTagEditId.some(mid => mid === m.id))) {
      molForTagEditId.forEach(mid => {
        const tagEditMol = handlers.getMoleculeForId(molForTagEditId);
        if (tagEditMol) {
          joinedMoleculeLists.push(tagEditMol);
        }
      });
      // joinedMoleculeLists = [tagEditMol, ...joinedMoleculeLists];
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

    if (moleculesToEditIds && moleculesToEditIds.length > 0 && isGlobalEdit) {
      moleculesToEditIds.forEach(mid => {
        if (!joinedMoleculeLists.some(m => m.id === mid)) {
          const tagEditMol = handlers.getMoleculeForId(mid);
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

    useEffect(() => {
      if (
        (proteinsHasLoaded === true || proteinsHasLoaded === null) &&
        all_mol_lists?.length > 0 &&
        lhsCompoundsList?.length > 0
      ) {
        if (!directAccessProcessed && directDisplay && directDisplay.molecules && directDisplay.molecules.length > 0) {
          handlers.applyDirectSelection(majorViewStage);
          handlers.setCompoundsInitialized(true);
        }
        if (
          majorViewStage &&
          all_mol_lists &&
          target !== undefined &&
          !areLSHCompoundsInitialized &&
          tags &&
          tags.length > 0 &&
          categories &&
          categories.length > 0
        ) {
          handlers.initializeFilter(object_selection, joinedMoleculeLists);
          handlers.initializeMolecules(majorViewStage);
          handlers.setCompoundsInitialized(true);
        }
        if (majorViewStage && all_mol_lists && target !== undefined && !areLSHCompoundsInitialized && noTagsReceived) {
          handlers.initializeFilter(object_selection, joinedMoleculeLists);
          handlers.initializeMolecules(majorViewStage);
          handlers.setCompoundsInitialized(true);
        }
      }
    }, [
      list_type,
      lhsCompoundsList,
      majorViewStage,
      handlers,
      target,
      proteinsHasLoaded,
      joinedMoleculeLists,
      all_mol_lists,
      directDisplay,
      directAccessProcessed,
      object_selection,
      tags,
      categories,
      noTagsReceived,
      areLSHCompoundsInitialized
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
      handlers.setFilter(filterSet);
    };

    const allSelectedMolecules = useMemo(
      () => allMoleculesList.filter(molecule => moleculesToEditIds.includes(molecule.id)),
      [allMoleculesList, moleculesToEditIds]
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
              densityList.some(d => d.id === selectedMolecule.id) ||
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
            const danglingProteins = proteinList.filter(
              id => !allSelectedMolecules.filter(m => m.id === id).length > 0
            );
            if (danglingProteins && danglingProteins.length > 0) {
              notSelectedMols.push(danglingProteins);
            }
            const danglingComplexes = complexList.filter(
              id => !allSelectedMolecules.filter(m => m.id === id).length > 0
            );
            if (danglingComplexes && danglingComplexes.length > 0) {
              notSelectedMols.push(danglingComplexes);
            }
            const danglingSurfaces = surfaceList.filter(
              id => !allSelectedMolecules.filter(m => m.id === id).length > 0
            );
            if (danglingSurfaces && danglingSurfaces.length > 0) {
              notSelectedMols.push(danglingSurfaces);
            }
            const danglingDensities = densityList.filter(
              d => !allSelectedMolecules.filter(m => m.id === d.id).length > 0
            );
            if (danglingDensities && danglingDensities.length > 0) {
              notSelectedMols.push(danglingDensities);
            }
            const danglingVectors = vectorOnList.filter(
              id => !allSelectedMolecules.filter(m => m.id === id).length > 0
            );
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
      if (densityList.some(d => d.id === data.id)) {
        selectedMolecule.push(data);
      }
      if (vectorOnList.includes(data.id)) {
        selectedMolecule.push(data);
      }
    });
    const uniqueSelectedMoleculeForHitNavigator = [...new Set(selectedMolecule)];

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
        handlers.setFilter(newFilter);
      } else {
        // close filter dialog options
        setSortDialogAnchorEl(null);
        handlers.setSortDialogOpen(false);
        // reset filter
        handlers.setFilter(undefined);
        newFilter = handlers.initializeFilter(object_selection, joinedMoleculeLists);
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
        const molsForCmp = joinedMoleculeLists.some(molecule => molecule.cmpd === compound.compound);
        if (molsForCmp && compound.associatedObs.some(obs => joinedMoleculeLists.some(mol => mol.id === obs.id))) {
          compounds.push(compound);
        }
      });
      compounds.sort((a, b) => sortOptions[sortOption].handler(a, b, ascending));
      return compounds;
    }, [joinedMoleculeLists, lhsCompoundsList, sortOptions, sortOption, ascending]);

    useEffect(() => {
      if (isObservationDialogOpen && observationsForLHSCmp?.length > 0 && lhsDataIsLoaded) {
        const cmpId = observationsForLHSCmp[0].cmpd;
        const cmp = filteredLHSCompoundsList.find(c => c.compound === cmpId);
        if (!cmp) {
          handlers.setObservationsForLHSCmp([]);
          handlers.setOpenObservationsDialog(false);
          handlers.setPoseIdForObservationsDialog(0);
        }
      }
    }, [isObservationDialogOpen, filteredLHSCompoundsList, observationsForLHSCmp, handlers, lhsDataIsLoaded]);

    const newMolsToEdit = [];
    allMoleculesList.forEach(cm => {
      if (moleculesToEditIds.includes(cm.id)) {
        newMolsToEdit.push(cm.id);
      }
    });
    if (newMolsToEdit.length !== moleculesToEditIds.length && allMoleculesList?.length > 0) {
      handlers.setMolListToEdit(newMolsToEdit);
    }

    const isLigandOn = changeButtonClassname(fragmentDisplayList, joinedLigandMatchLength);
    const isProteinOn = changeButtonClassname(proteinList, joinedProteinMatchLength);
    const isComplexOn = changeButtonClassname(complexList, joinedComplexMatchLength);

    const addType = {
      ligand: handlers.addLigand,
      protein: handlers.addHitProtein,
      complex: handlers.addComplex,
      surface: handlers.addSurface,
      quality: handlers.addQuality,
      density: handlers.addDensity,
      vector: handlers.addVector
    };

    const removeType = {
      ligand: handlers.removeLigand,
      protein: handlers.removeHitProtein,
      complex: handlers.removeComplex,
      surface: handlers.removeSurface,
      quality: handlers.removeQuality,
      density: handlers.removeDensity,
      vector: handlers.removeVector
    };

    const removeSelectedType = (type, skipTracking = false) => {
      if (type === 'ligand') {
        allSelectedMolecules.forEach(molecule => {
          removeType[type](majorViewStage, molecule, skipTracking);
        });
      } else {
        allSelectedMolecules.forEach(molecule => {
          removeType[type](majorViewStage, molecule, colourList[molecule.id % colourList.length], skipTracking);
        });
      }

      selectedAll.current = false;
    };

    const removeSelectedTypes = useCallback(
      (skipMolecules = [], skipTracking = false) => {
        handlers.removeSelectedTypesInHitNavigator(skipMolecules, majorViewStage, skipTracking);
      },
      [handlers, majorViewStage]
    );

    const selectMoleculeTags = moleculeTagsSet => {
      const moleculeTags = tags.filter(tag => moleculeTagsSet.includes(tag.id));
      moleculeTags.forEach(tag => {
        handlers.selectTag(tag);
      });
    };

    const addNewType = (type, skipTracking = false) => {
      handlers.addNewType(type, allSelectedMolecules, majorViewStage, skipTracking);
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
            handlers.setSelectedAllByType(type, molecules);
            addNewType(type, true);
          }
        } else {
          let molecules = getSelectedMoleculesByType(type, false);
          handlers.setDeselectedAllByType(type, molecules);
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

    const openSearchSettingsDialog = open => {
      handlers.setSearchSettingsDialogOpen(open);
    };

    const actions = [
      <SearchField
        className={classes.search}
        id="search-hit-navigator"
        onChange={value => {
          // setSearchString(value);
          handlers.setSearchString(value);
        }}
        disabled={false || (getJoinedMoleculeList && getJoinedMoleculeList.length === 0)}
        // searchString={filterSearchString?.searchStringHitNavigator ?? ''}
        searchString={searchString ?? ''}
        placeholder="Search"
        searchIconAction={openSearchSettingsDialog}
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
            handlers.setIsTagGlobalEdit(true);
            handlers.setTagEditorOpen(true);
          } else {
            setTagEditorAnchorEl(null);
            handlers.setIsTagGlobalEdit(false);
            handlers.setTagEditorOpen(false);
          }
        }}
      >
        <RichTooltip path="editTags">
          <Edit />
        </RichTooltip>
      </IconButton>,
      <IconButton
        onClick={event => {
          if (sortDialogOpen === false) {
            setSortDialogAnchorEl(event.currentTarget);
            handlers.setSortDialogOpen(true);
          } else {
            setSortDialogAnchorEl(null);
            handlers.setSortDialogOpen(false);
          }
        }}
        color={'inherit'}
        // disabled={predefinedFilter !== 'none'}
        disabled={DJANGO_CONTEXT['username'] === 'NOT_LOGGED_IN'}
      >
        <RichTooltip path="lhsSettings">
          <FilterList />
        </RichTooltip>
      </IconButton>
    ];

    const [isOpenAlert, setIsOpenAlert] = useState(false);
    const [isOpenLPCAlert, setIsOpenLPCAlert] = useState(false);
    const [lastProcessedLPCType, setLastProcessedLPCType] = useState(null);

    const groupNglControlButtonsDisabledState = useDisableNglControlButtons(allSelectedMolecules);

    const anyControlButtonDisabled = Object.values(groupNglControlButtonsDisabledState).some(
      buttonState => buttonState
    );

    // const listItemOffset = (currentPage + 1) * moleculesPerPage + nextXMolecules;
    const listItemOffset = currentPage * moleculesPerPage + nextXMolecules;
    const canLoadMore =
      listItemOffset < filteredLHSCompoundsList?.length ||
      (listItemOffset > filteredLHSCompoundsList?.length &&
        itemsToBeDisplayed?.length < filteredLHSCompoundsList?.length);
    console.log(
      `Infinity scroll: listItemOffset: ${listItemOffset}, currentPage: ${currentPage}, moleculesPerPage: ${moleculesPerPage}, nextXMolecules: ${nextXMolecules}, canLoadMore: ${canLoadMore}, listItemOffset: ${listItemOffset}, filteredLHSCompoundsList: ${filteredLHSCompoundsList.length}`
    );

    useEffect(() => {
      let updatedCurrentPage = currentPage;
      if (filteredLHSCompoundsList?.length < currentPage * moleculesPerPage) {
        //we are always only adding +1 to current page so we need to check if there is a oportunity to scale back
        updatedCurrentPage = Math.ceil(filteredLHSCompoundsList?.length / moleculesPerPage); // - 1;

        if (currentPage > updatedCurrentPage) {
          setCurrentPage(0);
          setItemsToBeDisplayed([]);
        }
      }
    }, [filteredLHSCompoundsList, currentPage, moleculesPerPage]);

    useEffect(() => {
      //if something goes wrong and we are displaying what we shoudn't we need to reset itemsToBeDisplayed to proper slice of filteredLHSCompoundsList
      //kind of hacky solution but I think it's good failsafe
      const whatToDisplay = filteredLHSCompoundsList?.slice(0, currentPage * moleculesPerPage);
      if (itemsToBeDisplayed?.length !== whatToDisplay?.length) {
        setItemsToBeDisplayed([...whatToDisplay]);
      }
    }, [currentPage, filteredLHSCompoundsList, itemsToBeDisplayed.length]);

    return (
      <Panel hasHeader title="Hit navigator" headerActions={actions} ref={hitNavigatorRef}>
        <AlertModal
          title="Are you sure?"
          description={`Loading of ${joinedMoleculeLists?.length} may take a long time`}
          open={isOpenAlert}
          handleOnOk={() => {
            handlers.setNextXMolecules(joinedMoleculeLists?.length || 0);
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
            handlers.setSelectedAllByType(lastProcessedLPCType, molecules);
            addNewType(lastProcessedLPCType, true);
            setIsOpenLPCAlert(false);
          }}
          handleOnCancel={() => {
            setIsOpenLPCAlert(false);
          }}
        />
        {searchSettingsDialogOpen && (
          <SearchSettingsDialog openDialog={searchSettingsDialogOpen} setOpenDialog={openSearchSettingsDialog} />
        )}
        {isObservationDialogOpen && (
          <TooltipPathProvider path="observationsDialog">
            <ObservationsDialog open={isObservationDialogOpen} anchorEl={tagEditorAnchorEl} ref={tagEditorRef} />
          </TooltipPathProvider>
        )}
        {isTagEditorOpen && (
          <TagEditor
            open={isTagEditorOpen}
            closeDisabled={anyControlButtonDisabled}
            setOpenDialog={instanceConfig.tagEditorOpenActionCreator || setTagEditorOpen}
            anchorEl={tagEditorAnchorEl}
            ref={tagEditorRef}
          />
        )}
        {sortDialogOpen && (
          <TooltipPathProvider path="filterSettings">
            <FilterSettingsModal
              openModal={sortDialogOpen}
              onModalClose={() => {
                setSortDialogAnchorEl(null);
                handlers.setSortDialogOpen(false);
              }}
            />
          </TooltipPathProvider>
        )}
        <Grid container spacing={1}>
          <Grid style={{ marginTop: '4px' }}>
            <RichTooltip path="allLigands">
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
            </RichTooltip>
            <RichTooltip path="allSidechains">
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
            </RichTooltip>
            <RichTooltip path="allInteractions">
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
            </RichTooltip>
          </Grid>

          {
            <RichTooltip path={selectAllHitsPressed ? 'allHits.deselectAllHits' : 'allHits.selectAllHits'}>
              <Grid item style={{ marginLeft: '2px' }} className={classes.selectButton}>
                <Button
                  variant="outlined"
                  className={classNames(classes.contColButton, {
                    [classes.contColButtonSelected]: selectAllHitsPressed,
                    [classes.contColButtonHalfSelected]: false
                  })}
                  onClick={() => {
                    handlers.selectAllHits(filteredLHSCompoundsList, selectAllHitsPressed);
                    setSelectAllHitsPressed(!selectAllHitsPressed);
                  }}
                  disabled={false}
                >
                  {selectAllHitsPressed ? 'Unselect all hits' : 'Select all hits'}
                </Button>
              </Grid>
            </RichTooltip>
          }
          {selectedDisplayHits === true ? (
            <RichTooltip path="displayedHits.deselectDisplayedHits">
              <Grid item className={classes.selectButton}>
                <Button
                  variant="outlined"
                  className={classNames(classes.contColButton, {
                    [classes.contColButtonSelected]: selectedDisplayHits,
                    [classes.contColButtonHalfSelected]: false
                  })}
                  onClick={() => {
                    handlers.selectAllVisibleObservations([], null, false);
                  }}
                  disabled={false}
                >
                  Unselect displayed hits
                </Button>
              </Grid>
            </RichTooltip>
          ) : (
            <RichTooltip path="displayedHits.selectDisplayedHits">
              <Grid item className={classes.selectButton}>
                <Button
                  variant="outlined"
                  className={classNames(classes.contColButton, {
                    [classes.contColButtonSelected]: selectedDisplayHits,
                    [classes.contColButtonHalfSelected]: false
                  })}
                  onClick={() => {
                    handlers.selectAllVisibleObservations(uniqueSelectedMoleculeForHitNavigator, null, false);
                  }}
                  disabled={false}
                >
                  Select displayed hits
                </Button>
              </Grid>
            </RichTooltip>
          )}
          <Grid style={{ marginTop: '4px' }}>
            <Typography variant="caption">{`Selected: ${
              allSelectedMolecules ? allSelectedMolecules.length : 0
            }`}</Typography>
          </Grid>
          <Grid style={{ marginTop: '4px' }}>
            <Typography variant="caption" style={{ paddingLeft: 3 }}>
              Sort by
            </Typography>
          </Grid>
          <Grid style={{ marginTop: '4px', marginLeft: '4px' }}>
            <RichTooltip
              path={sortOption ? 'sort.sortOption' : 'sort.sortBy'}
              values={{ sortOption: sortOptions[sortOption].title }}
            >
              <Select
                value={sortOption}
                onChange={event => {
                  setSortOption(event.target.value);
                  setSortSettingsChanged(true);
                }}
                // fullWidth
                size="small"
                style={{ fontSize: 10, width: 75 }}
              >
                {SORT_OPTIONS.map((option, index) => (
                  <MenuItem key={`${index}-${option}`} value={option} style={{ fontSize: 12, padding: '3px 7px' }}>
                    {sortOptions[option].title}
                  </MenuItem>
                ))}
              </Select>
            </RichTooltip>
          </Grid>
          <RichTooltip path={ascending ? 'sortOrder.ascending' : 'sortOrder.descending'}>
            <Grid style={{ marginTop: '4px' }}>
              <Checkbox checked={ascending} onChange={handleAscendingChecked} size="small" style={{ padding: 0 }} />
              <Typography variant="caption">
                {(selectAllHitsPressed && hitNavigatorWidth > 508) || (!selectAllHitsPressed && hitNavigatorWidth > 491)
                  ? 'Ascending'
                  : 'ASC'}
              </Typography>
            </Grid>
          </RichTooltip>
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
                  // getScrollParent={() =>
                  //   dispatch(
                  //     autoHideTagEditorDialogsOnScroll({
                  //       tagEditorRef,
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
                  <ObservationUnifiedViewWrapper
                    items={itemsToBeDisplayed}
                    allSelectedMolecules={allSelectedMolecules}
                    addMoleculeViewRef={addMoleculeViewRef}
                    handleSetTagEditorAnchorEl={setTagEditorAnchorEl}
                    fragmentDisplayList={fragmentDisplayList}
                    proteinList={proteinList}
                    complexList={complexList}
                    surfaceList={surfaceList}
                    densityList={densityList}
                    qualityList={qualityList}
                    vectorOnList={vectorOnList}
                    informationList={informationList}
                  />
                </InfiniteScroll>
              </Grid>
              <Grid item>
                <Grid container justifyContent="space-between" alignItems="center" direction="row">
                  <Grid item>
                    <span
                      className={classes.total}
                    >{`#Poses=${filteredLHSCompoundsList?.length}, #Obs=${joinedMoleculeLists?.length}`}</span>
                  </Grid>
                  <Grid item>
                    <ButtonGroup
                      variant="text"
                      size="medium"
                      color="primary"
                      aria-label="contained primary button group"
                    >
                      <Button
                        className={classes.footerButton}
                        onClick={() => {
                          handlers.setNextXMolecules(30);
                        }}
                      >
                        Load next 30
                      </Button>
                      <Button
                        className={classes.footerButton}
                        onClick={() => {
                          handlers.setNextXMolecules(100);
                        }}
                      >
                        Load next 100
                      </Button>
                      <Button
                        className={classes.footerButton}
                        onClick={() => {
                          if (joinedMoleculeLists?.length > 300) {
                            setIsOpenAlert(true);
                          } else {
                            handlers.setNextXMolecules(joinedMoleculeLists?.length || 0);
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
  }
);

export const ObservationCmpListLHS = memo(({}) => {
  const dispatch = useDispatch();

  const nextXMolecules = useSelector(state => state.selectionReducers.nextXMolecules);
  const searchString = useSelector(state => state.previewReducers.molecule.searchStringLHS);
  const filter = useSelector(state => state.selectionReducers.filter);
  const getJoinedMoleculeList = useSelector(state => selectJoinedMoleculeList(state));
  const allMoleculesList = useSelector(state => selectAllMoleculeList(state));
  const dataAreDownloading = useSelector(state => state.apiReducers.dataAreDownloading);
  const dataAreDownloaded = useSelector(state => state.apiReducers.dataAreDownloaded);
  const errorOccuredDuringDownload = useSelector(state => state.apiReducers.errorOccuredDuringDownload);
  const proteinList = useSelector(state => state.selectionReducers.proteinList);
  const complexList = useSelector(state => state.selectionReducers.complexList);
  const fragmentDisplayList = useSelector(state => state.selectionReducers.fragmentDisplayList);
  const surfaceList = useSelector(state => state.selectionReducers.surfaceList);
  const densityList = useSelector(state => state.selectionReducers.densityList);
  const qualityList = useSelector(state => state.selectionReducers.qualityList);
  const vectorOnList = useSelector(state => state.selectionReducers.vectorOnList);
  const informationList = useSelector(state => state.selectionReducers.informationList);
  const isTagEditorOpen = useSelector(state => state.selectionReducers.tagEditorOpened);
  const molForTagEditId = useSelector(state => state.selectionReducers.molForTagEdit);
  const moleculesToEditIds = useSelector(state => state.selectionReducers.moleculesToEdit);
  const isGlobalEdit = useSelector(state => state.selectionReducers.isGlobalEdit);
  const object_selection = useSelector(state => state.selectionReducers.mol_group_selection);
  const all_mol_lists = useSelector(state => state.apiReducers.all_mol_lists);
  const directDisplay = useSelector(state => state.apiReducers.direct_access);
  const directAccessProcessed = useSelector(state => state.apiReducers.direct_access_processed);
  const tags = useSelector(state => state.apiReducers.tagList);
  const noTagsReceived = useSelector(state => state.apiReducers.noTagsReceived);
  const categories = useSelector(state => state.apiReducers.categoryList);
  const lhsDataIsLoaded = useSelector(state => state.apiReducers.lhsDataIsLoaded);
  const observationsForLHSCmp = useSelector(state => state.selectionReducers.observationsForLHSCmp);
  const lhsCompoundsList = useSelector(state => getLHSCompoundsList(state));
  const proteinsHasLoaded = useSelector(state => state.nglReducers.proteinsHasLoaded);
  const searchSettings = useSelector(state => state.selectionReducers.searchSettings);

  const handlers = useMemo(
    () => ({
      setFullyRendered: value => dispatch(setLHSIsFullyRendered(value)),
      addToastMessage: payload => dispatch(addToastMessage(payload)),
      searchForObservations: (searchTerm, observations, settings) =>
        dispatch(searchForObservations(searchTerm, observations, settings)),
      setNextXMolecules: value => dispatch(setNextXMolecules(value)),
      getMoleculeForId: moleculeId => dispatch(getMoleculeForId(moleculeId)),
      applyDirectSelection: majorViewStage => dispatch(applyDirectSelection(majorViewStage)),
      setCompoundsInitialized: value => dispatch(setLHSCompoundsInitialized(value)),
      initializeFilter: (objectSelection, joinedMolecules) =>
        dispatch(initializeFilter(objectSelection, joinedMolecules)),
      initializeMolecules: majorViewStage => dispatch(initializeMolecules(majorViewStage)),
      setFilter: filterValue => dispatch(setFilter(filterValue)),
      setObservationsForLHSCmp: observations => dispatch(setObservationsForLHSCmp(observations)),
      setOpenObservationsDialog: open => dispatch(setOpenObservationsDialog(open)),
      setPoseIdForObservationsDialog: poseId => dispatch(setPoseIdForObservationsDialog(poseId)),
      setMolListToEdit: molecules => dispatch(setMolListToEdit(molecules)),
      addLigand: (...args) => dispatch(addLigand(...args)),
      addHitProtein: (...args) => dispatch(addHitProtein(...args)),
      addComplex: (...args) => dispatch(addComplex(...args)),
      addSurface: (...args) => dispatch(addSurface(...args)),
      addQuality: (...args) => dispatch(addQuality(...args)),
      addDensity: (...args) => dispatch(addDensity(...args)),
      addVector: (...args) => dispatch(addVector(...args)),
      removeLigand: (...args) => dispatch(removeLigand(...args)),
      removeHitProtein: (...args) => dispatch(removeHitProtein(...args)),
      removeComplex: (...args) => dispatch(removeComplex(...args)),
      removeSurface: (...args) => dispatch(removeSurface(...args)),
      removeQuality: (...args) => dispatch(removeQuality(...args)),
      removeDensity: (...args) => dispatch(removeDensity(...args)),
      removeVector: (...args) => dispatch(removeVector(...args)),
      removeSelectedTypesInHitNavigator: (...args) => dispatch(removeSelectedTypesInHitNavigator(...args)),
      selectTag: tag => dispatch(selectTag(tag)),
      addNewType: (type, selectedMolecules, majorViewStage, skipTracking = false) => {
        const addType = {
          ligand: addLigand,
          protein: addHitProtein,
          complex: addComplex,
          surface: addSurface,
          quality: addQuality,
          density: addDensity,
          vector: addVector
        };

        return dispatch(
          withDisabledMoleculesNglControlButtons(
            selectedMolecules.map(molecule => molecule.id),
            type,
            async () => {
              const promises = [];
              const actionCreator = addType[type];

              if (!actionCreator) {
                return;
              }

              if (type === 'ligand') {
                selectedMolecules.forEach(molecule => {
                  promises.push(
                    dispatch(
                      actionCreator(
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
                selectedMolecules.forEach(molecule => {
                  promises.push(
                    dispatch(
                      actionCreator(majorViewStage, molecule, colourList[molecule.id % colourList.length], skipTracking)
                    )
                  );
                });
              }

              await Promise.all(promises);
            }
          )
        );
      },
      setSelectedAllByType: (type, molecules) => dispatch(setSelectedAllByType(type, molecules)),
      setDeselectedAllByType: (type, molecules) => dispatch(setDeselectedAllByType(type, molecules)),
      setSearchSettingsDialogOpen: open => dispatch(setSearchSettingsDialogOpen(open)),
      setSearchString: value => dispatch(setSearchStringOfHitNavigator(value)),
      setIsTagGlobalEdit: value => dispatch(setIsTagGlobalEdit(value)),
      setTagEditorOpen: value => dispatch(setTagEditorOpen(value)),
      setSortDialogOpen: value => dispatch(setSortDialogOpen(value)),
      selectAllHits: (allFilteredLhsCompounds, unselect) =>
        dispatch(selectAllHits(allFilteredLhsCompounds, setNextXMolecules, unselect)),
      selectAllVisibleObservations: (visibleObservations, setNextXMoleculesFn, unselect) =>
        dispatch(selectAllVisibleObservations(visibleObservations, setNextXMoleculesFn, unselect))
    }),
    [dispatch]
  );

  const instanceConfig = useMemo(
    () => ({
      selectSortDialogOpen: state => state.previewReducers.molecule.sortDialogOpen,
      selectIsObservationDialogOpen: state => state.selectionReducers.isObservationDialogOpen,
      selectSearchSettingsDialogOpen: state => state.selectionReducers.searchSettingsDialogOpen,
      selectAreLHSCompoundsInitialized: state => state.selectionReducers.areLSHCompoundsInitialized,
      tagEditorOpenActionCreator: setTagEditorOpen
    }),
    []
  );

  return (
    <ObservationCmpList
      nextXMolecules={nextXMolecules}
      searchString={searchString}
      filter={filter}
      getJoinedMoleculeList={getJoinedMoleculeList}
      allMoleculesList={allMoleculesList}
      dataAreDownloading={dataAreDownloading}
      dataAreDownloaded={dataAreDownloaded}
      errorOccuredDuringDownload={errorOccuredDuringDownload}
      proteinList={proteinList}
      complexList={complexList}
      fragmentDisplayList={fragmentDisplayList}
      surfaceList={surfaceList}
      densityList={densityList}
      qualityList={qualityList}
      vectorOnList={vectorOnList}
      informationList={informationList}
      isTagEditorOpen={isTagEditorOpen}
      molForTagEditId={molForTagEditId}
      moleculesToEditIds={moleculesToEditIds}
      isGlobalEdit={isGlobalEdit}
      object_selection={object_selection}
      all_mol_lists={all_mol_lists}
      directDisplay={directDisplay}
      directAccessProcessed={directAccessProcessed}
      tags={tags}
      noTagsReceived={noTagsReceived}
      categories={categories}
      lhsDataIsLoaded={lhsDataIsLoaded}
      observationsForLHSCmp={observationsForLHSCmp}
      lhsCompoundsList={lhsCompoundsList}
      proteinsHasLoaded={proteinsHasLoaded}
      searchSettings={searchSettings}
      handlers={handlers}
      instanceConfig={instanceConfig}
    />
  );
});
