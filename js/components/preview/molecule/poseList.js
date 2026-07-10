/**
 * Created by abradley on 14/03/2018.
 */
import { GridLegacy as Grid, CircularProgress, Typography, IconButton, Select, MenuItem, Checkbox } from '@mui/material';
import { makeStyles } from '../../../ui/styles';
import React, { useState, useEffect, useCallback, memo, useRef, useContext, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { colourList } from './utils/color';
import { filterMolecules } from './moleculeListSortFilterDialog';
import InfiniteScroll from 'react-infinite-scroller';
import { Button } from '../../common/Inputs/Button';
import { Panel } from '../../common/Surfaces/Panel';
import { VIEWS } from '../../../constants/constants';
import { NglContext } from '../../nglView/nglProvider';
import classNames from 'classnames';
import { Edit, FilterList } from '@mui/icons-material';
import { setTagEditorOpen, setObservationsDialogSide } from '../../../reducers/selection/actions';
import { useRouteMatch } from 'react-router-dom';
import { AlertModal } from '../../common/Modal/AlertModal';
import { TagEditor } from '../tags/modal/tagEditor';
import SearchField from '../../common/Components/SearchField';
import useDisableNglControlButtons from './useDisableNglControlButtons';
import { extractTargetFromURLParam } from '../utils';
import { LoadingContext } from '../../loading';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
import { ObservationsDialog } from './observationsDialog';
import { ObservationInspirationDialog } from './observationInspirationDialog';
import { useScrollToSelectedPose } from './useScrollToSelectedPose';
import { SearchSettingsDialog } from './searchSettingsDialog';
import { TOAST_LEVELS } from '../../toast/constants';
import { FilterSettingsModal } from './observationUnifiedView/table';
import ObservationUnifiedViewWrapper from './observationUnifiedView/observationUnifiedViewWrapper';
import RichTooltip from '../../tooltip/RichTooltip';
import { TooltipPathProvider } from '../../tooltip/TooltipPathContext';

const useStyles = makeStyles(theme => ({
  container: {
    flex: '1 1 auto',
    minHeight: 0,
    height: 'auto',
    width: '100%',
    overflow: 'hidden',
    flexWrap: 'nowrap',
    color: theme.palette.black
  },
  panelContent: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden'
  },
  toolbar: {
    flex: '0 0 auto',
    width: '100%',
    minWidth: 0,
    alignItems: 'flex-start'
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
    flex: '1 1 auto',
    minHeight: 0,
    height: 'auto',
    overflowY: 'auto',
    overflowX: 'hidden',
    width: '100%'
  },
  footer: {
    flex: '0 0 auto',
    width: '100%',
    minWidth: 0,
    overflow: 'hidden'
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
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
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
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    marginLeft: theme.spacing(2)
  },
  contColButton: {
    minWidth: 'fit-content',
    paddingLeft: theme.spacing(0.25),
    paddingRight: theme.spacing(0.25),
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
    paddingLeft: theme.spacing(0.25),
    paddingRight: theme.spacing(0.25),
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
    flex: '1 1 84px',
    minWidth: 0,
    maxWidth: '100%',
    padding: '8px 2px 4px !important',
    '& .MuiButton-root': {
      width: '100%',
      minWidth: 0,
      whiteSpace: 'normal',
      lineHeight: 1.15
    }
  },
  toolbarSmallButtons: {
    flex: '0 0 auto',
    marginTop: 4,
    whiteSpace: 'nowrap'
  },
  toolbarTextItem: {
    flex: '0 1 auto',
    minWidth: 0,
    marginTop: 4
  },
  toolbarSelectItem: {
    flex: '0 1 75px',
    minWidth: 0,
    marginTop: 4,
    marginLeft: 4
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
    fontStyle: 'italic',
    whiteSpace: 'normal'
  },
  footerRow: {
    width: '100%',
    minWidth: 0,
    flexWrap: 'wrap',
    overflow: 'hidden'
  },
  footerSummary: {
    flex: '0 1 auto',
    minWidth: 0,
    maxWidth: '45%',
    paddingRight: 4,
    boxSizing: 'border-box'
  },
  footerActions: {
    flex: '1 1 292px',
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden'
  },
  footerButtonGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    columnGap: 6,
    rowGap: 4,
    width: '100%',
    maxHeight: 48,
    overflow: 'hidden'
  },
  footerButton: {
    flex: '0 0 94px',
    height: 22,
    minHeight: 0,
    minWidth: 94,
    maxWidth: '100%',
    margin: '0 !important',
    padding: '2px 4px',
    fontSize: 12,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  }
}));
let selectedDisplayHits = false;

export const PoseList = memo(
  ({
    nextXMolecules,
    searchString,
    filter,
    getJoinedMoleculeList,
    allMoleculesList,
    dataAreDownloading,
    dataAreDownloaded,
    errorOccuredDuringDownload,
    proteinList,
    artefactsChainList = [],
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
    viewConfig,
    getComputedInspirations = undefined,
    ligandRepresentations = undefined,
    isTagEditorForCurrentSide = false,
    handlers = {},
    instanceConfig = {},
    expandHandler = null,
    navigatorTitle = 'Hit navigator'
  }) => {
    const dispatch = useDispatch();
    const classes = useStyles();
    let match = useRouteMatch();
    let target = match && match.params && extractTargetFromURLParam(match.params[0]);

    const [selectAllHitsPressed, setSelectAllHitsPressed] = useState(false);

    const moleculesPerPage = 30;
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsToBeDisplayed, setItemsToBeDisplayed] = useState([]);
    const [sortSettingsChanged, setSortSettingsChanged] = useState(false);
    const [visuallyReadyPoseIds, setVisuallyReadyPoseIds] = useState(() => new Set());

    const selectedAll = useRef(false);
    const allMolListsLength = all_mol_lists?.length || 0;

    const sortDialogOpen = useSelector(instanceConfig.selectSortDialogOpen || (() => false));
    const isObservationDialogOpen = useSelector(instanceConfig.selectIsObservationDialogOpen || (() => false));
    const searchSettingsDialogOpen = useSelector(instanceConfig.selectSearchSettingsDialogOpen || (() => false));
    const areLSHCompoundsInitialized = useSelector(instanceConfig.selectAreLHSCompoundsInitialized || (() => false));
    const observationsDialogSide = useSelector(state => state.selectionReducers.observationsDialogSide);
    const poseIdForObservationsDialog = useSelector(state => state.selectionReducers.poseIdForObservationsDialog);
    const instanceSide = instanceConfig.instanceSide || 'lhs';
    const isObsInspirationDialogOpen = useSelector(state => state.selectionReducers.isObsInspirationDialogOpen);

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
      if (dataAreDownloaded && !errorOccuredDuringDownload && allMolListsLength <= 0) {
        handlers.addToastMessage({
          text: `Target data downloaded but no molecules found. This is usually caused by network issues so please try again later. If the issue persists, please contact us.`,
          level: TOAST_LEVELS.ERROR
        });
      }
    }, [dataAreDownloaded, errorOccuredDuringDownload, handlers, allMolListsLength]);

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

    const tagEditorRef = useRef();
    const inspirationDialogRef = useRef();
    const scrollBarRef = useRef();
    const hitNavigatorRef = useRef();
    const [tagEditorAnchorEl, setTagEditorAnchorEl] = useState(null);
    const tagEditorProps = {
      compounds: lhsCompoundsList || [],
      molForTagEditId,
      moleculesToEditIds,
      isGlobalEdit,
      metaCategory: instanceConfig.metaCategory,
      getMoleculeForId: handlers.getMoleculeForId,
      updateCompound: handlers.updateTagEditorCompound,
      updateMoleculeInObservations: handlers.updateMoleculeInTagEditorObservations,
      resetTagEditorSide: handlers.resetTagEditorSide
    };
    const [hitNavigatorWidth, setHitNavigatorWidth] = useState(0);
    const [hitNavigatorListWidth, setHitNavigatorListWidth] = useState(0);
    useEffect(() => {
      if (!isTagEditorOpen || !isTagEditorForCurrentSide) {
        setTagEditorAnchorEl(null);
      }
    }, [isTagEditorOpen, isTagEditorForCurrentSide]);

    useEffect(() => {
      if (dataAreDownloading || !dataAreDownloaded) {
        setVisuallyReadyPoseIds(new Set());
      }
    }, [dataAreDownloaded, dataAreDownloading]);

    const handlePoseVisuallyReady = useCallback(poseId => {
      if (poseId === null || poseId === undefined) {
        return;
      }

      setVisuallyReadyPoseIds(currentReadyPoseIds => {
        if (currentReadyPoseIds.has(poseId)) {
          return currentReadyPoseIds;
        }

        const nextReadyPoseIds = new Set(currentReadyPoseIds);
        nextReadyPoseIds.add(poseId);
        return nextReadyPoseIds;
      });
    }, []);

    const readyVisiblePoseCount = useMemo(() => {
      return itemsToBeDisplayed.reduce((count, pose) => count + (visuallyReadyPoseIds.has(pose.id) ? 1 : 0), 0);
    }, [itemsToBeDisplayed, visuallyReadyPoseIds]);

    useEffect(() => {
      if (hitNavigatorRef && hitNavigatorRef.current) {
        const resizeObserver = new ResizeObserver(() => {
          const nextWidth = hitNavigatorRef.current.offsetWidth;
          setHitNavigatorWidth(currentWidth => (Math.abs(currentWidth - nextWidth) > 1 ? nextWidth : currentWidth));
        });

        resizeObserver.observe(hitNavigatorRef.current);

        return function cleanup() {
          resizeObserver.disconnect();
        };
      }
    }, [itemsToBeDisplayed.length]);

    useEffect(() => {
      if (scrollBarRef && scrollBarRef.current) {
        const updateListWidth = () => {
          const nextWidth = scrollBarRef.current.offsetWidth;
          setHitNavigatorListWidth(currentWidth => (Math.abs(currentWidth - nextWidth) > 1 ? nextWidth : currentWidth));
        };
        const resizeObserver = new ResizeObserver(updateListWidth);

        updateListWidth();
        resizeObserver.observe(scrollBarRef.current);

        return function cleanup() {
          resizeObserver.disconnect();
        };
      }
    }, [itemsToBeDisplayed.length]);

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
        return (
          handlers.searchHitNavigator?.(searchString, getJoinedMoleculeList, lhsCompoundsList, searchSettings) ??
          handlers.searchForObservations(searchString, getJoinedMoleculeList, searchSettings)
        );
      } else {
        return getJoinedMoleculeList;
      }
    }, [searchString, handlers, getJoinedMoleculeList, lhsCompoundsList, searchSettings]);

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
    joinedMoleculeLists = useMemo(
      () => addSelectedMoleculesFromUnselectedSites(joinedMoleculeLists, artefactsChainList),
      [
        addSelectedMoleculesFromUnselectedSites,
        joinedMoleculeLists,
        artefactsChainList,
        molForTagEditId,
        isTagEditorOpen,
        moleculesToEditIds
      ]
    );
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

    const loadNextMolecules = useCallback(() => {
      const newCurrentPage = currentPage + 1;

      setCurrentPage(newCurrentPage);
      setItemsToBeDisplayed(filteredLHSCompoundsList.slice(0, newCurrentPage * moleculesPerPage));
    }, [currentPage, filteredLHSCompoundsList, moleculesPerPage]);

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
      handlers.onInitialize?.({
        majorViewStage,
        target,
        joinedMoleculeLists,
        areLSHCompoundsInitialized,
        proteinsHasLoaded,
        all_mol_lists,
        lhsCompoundsList,
        directAccessProcessed,
        directDisplay,
        object_selection,
        tags,
        categories,
        noTagsReceived
      });
    }, [
      handlers,
      majorViewStage,
      target,
      joinedMoleculeLists,
      areLSHCompoundsInitialized,
      proteinsHasLoaded,
      all_mol_lists,
      lhsCompoundsList,
      directAccessProcessed,
      directDisplay,
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

    const allSelectedMolecules = useMemo(
      () => allMoleculesList.filter(molecule => moleculesToEditIds.includes(molecule.id)),
      [allMoleculesList, moleculesToEditIds]
    );
    const lpcControlMolecules = allSelectedMolecules.length > 0 ? allSelectedMolecules : joinedMoleculeLists;
    const proteinControlList = useMemo(() => [...new Set([...proteinList, ...artefactsChainList])], [
      artefactsChainList,
      proteinList
    ]);

    let currentMolecules = joinedMoleculeLists.slice(0, listItemOffset);
    if (
      fragmentDisplayList.length === 0 &&
      proteinList.length === 0 &&
      artefactsChainList.length === 0 &&
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
              artefactsChainList.includes(selectedMolecule.id) ||
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
            const danglingArtefactChains = artefactsChainList.filter(
              id => !allSelectedMolecules.filter(m => m.id === id).length > 0
            );
            if (danglingArtefactChains && danglingArtefactChains.length > 0) {
              notSelectedMols.push(danglingArtefactChains);
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
      if (artefactsChainList.includes(data.id)) {
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

    const joinedGivenMatch = useCallback(
      givenList => {
        return givenList.filter(element => lpcControlMolecules.filter(element2 => element2.id === element).length > 0)
          .length;
      },
      [lpcControlMolecules]
    );

    const joinedLigandMatchLength = useMemo(() => joinedGivenMatch(fragmentDisplayList), [
      fragmentDisplayList,
      joinedGivenMatch
    ]);
    const joinedProteinMatchLength = useMemo(() => joinedGivenMatch(proteinControlList), [
      proteinControlList,
      joinedGivenMatch
    ]);
    const joinedComplexMatchLength = useMemo(() => joinedGivenMatch(complexList), [complexList, joinedGivenMatch]);

    const changeButtonClassname = (givenList = [], matchListLength) => {
      if (!matchListLength) {
        return false;
      } else if (lpcControlMolecules.length === matchListLength) {
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

    const { addMoleculeViewRef, registeredMoleculeViewCount } = useScrollToSelectedPose({
      poses: filteredLHSCompoundsList,
      moleculesPerPage,
      setCurrentPage,
      scrollContainerRef: scrollBarRef,
      isDataLoaded: lhsDataIsLoaded,
      isObservationsDialogOpen: isObservationDialogOpen,
      poseIdForObservationsDialog,
      shouldPrioritizeObservationsDialogPose:
        observationsDialogSide === null || observationsDialogSide === instanceSide,
      ligandIds: fragmentDisplayList,
      proteinIds: proteinControlList,
      complexIds: complexList,
      surfaceIds: surfaceList,
      densityList,
      vectorIds: vectorOnList
    });

    useEffect(() => {
      if (dataAreDownloading || !dataAreDownloaded || !areLSHCompoundsInitialized) {
        return;
      }

      const expectedRenderedItemsCount =
        currentPage > 0 ? Math.min(filteredLHSCompoundsList.length, currentPage * moleculesPerPage) : 0;
      const hasRenderedVisibleSlice =
        expectedRenderedItemsCount > 0 &&
        registeredMoleculeViewCount >= expectedRenderedItemsCount &&
        readyVisiblePoseCount >= expectedRenderedItemsCount;
      const hasNoVisibleContent =
        expectedRenderedItemsCount === 0 &&
        registeredMoleculeViewCount === 0 &&
        filteredLHSCompoundsList.length === 0 &&
        joinedMoleculeLists.length === 0;

      if (!hasRenderedVisibleSlice && !hasNoVisibleContent) {
        return;
      }

      let outerAnimationFrameId = null;
      let innerAnimationFrameId = null;

      outerAnimationFrameId = requestAnimationFrame(() => {
        innerAnimationFrameId = requestAnimationFrame(() => {
          handlers.setFullyRendered(true);
        });
      });

      return () => {
        if (outerAnimationFrameId !== null) {
          cancelAnimationFrame(outerAnimationFrameId);
        }
        if (innerAnimationFrameId !== null) {
          cancelAnimationFrame(innerAnimationFrameId);
        }
      };
    }, [
      areLSHCompoundsInitialized,
      currentPage,
      dataAreDownloaded,
      dataAreDownloading,
      filteredLHSCompoundsList.length,
      handlers,
      joinedMoleculeLists.length,
      lhsCompoundsList.length,
      allMolListsLength,
      readyVisiblePoseCount,
      registeredMoleculeViewCount
    ]);

    // Claim dialog ownership when this instance contains the compound the dialog was opened for.
    // This prevents the other side's cleanup from closing a dialog it doesn't own.
    useEffect(() => {
      if (isObservationDialogOpen && observationsForLHSCmp?.length > 0 && lhsDataIsLoaded) {
        const cmpId = observationsForLHSCmp[0].cmpd;
        const cmp = filteredLHSCompoundsList.find(c => c.compound === cmpId);
        if (cmp && observationsDialogSide !== instanceSide) {
          dispatch(setObservationsDialogSide(instanceSide));
        }
      } else if (!isObservationDialogOpen && observationsDialogSide === instanceSide) {
        dispatch(setObservationsDialogSide(null));
      }
    }, [
      isObservationDialogOpen,
      filteredLHSCompoundsList,
      observationsForLHSCmp,
      lhsDataIsLoaded,
      observationsDialogSide,
      instanceSide,
      dispatch
    ]);

    // Close dialog if its compound is no longer visible in this instance's list,
    // but only if this instance owns the dialog.
    useEffect(() => {
      if (
        instanceSide === observationsDialogSide &&
        isObservationDialogOpen &&
        observationsForLHSCmp?.length > 0 &&
        lhsDataIsLoaded
      ) {
        const cmpId = observationsForLHSCmp[0].cmpd;
        const cmp = filteredLHSCompoundsList.find(c => c.compound === cmpId);
        if (!cmp) {
          handlers.setObservationsForLHSCmp([]);
          handlers.setOpenObservationsDialog(false);
          handlers.setPoseIdForObservationsDialog(0);
        }
      }
    }, [
      instanceSide,
      observationsDialogSide,
      isObservationDialogOpen,
      filteredLHSCompoundsList,
      observationsForLHSCmp,
      handlers,
      lhsDataIsLoaded
    ]);

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
    const isProteinOn = changeButtonClassname(proteinControlList, joinedProteinMatchLength);
    const isComplexOn = changeButtonClassname(complexList, joinedComplexMatchLength);

    const removeType = {
      ligand: handlers.removeLigand,
      protein: handlers.removeHitProtein,
      artefact: handlers.removeArtefactChain,
      complex: handlers.removeComplex,
      surface: handlers.removeSurface,
      quality: handlers.removeQuality,
      density: handlers.removeDensity,
      vector: handlers.removeVector
    };

    const removeSelectedType = (type, skipTracking = false) => {
      if (type === 'ligand') {
        lpcControlMolecules.forEach(molecule => {
          removeType[type](majorViewStage, molecule, skipTracking);
        });
      } else if (type === 'protein') {
        lpcControlMolecules.forEach(molecule => {
          const colour = colourList[molecule.id % colourList.length];
          removeType.protein?.(majorViewStage, molecule, colour, skipTracking);
          removeType.artefact?.(majorViewStage, molecule, colour, skipTracking);
        });
      } else {
        lpcControlMolecules.forEach(molecule => {
          removeType[type](majorViewStage, molecule, colourList[molecule.id % colourList.length], skipTracking);
        });
      }

      selectedAll.current = false;
    };

    const addNewType = (type, skipTracking = false) => {
      handlers.addNewType(type, lpcControlMolecules, majorViewStage, skipTracking, ligandRepresentations);
    };

    const onButtonToggle = (type, calledFromSelectAll = false) => {
      const isTypeOn = {
        ligand: isLigandOn,
        protein: isProteinOn,
        complex: isComplexOn
      }[type];

      setLastProcessedLPCType(type);
      if (calledFromSelectAll === true && selectedAll.current === true) {
        // REDO
        if (isTypeOn === false) {
          addNewType(type, true);
        }
      } else if (calledFromSelectAll && selectedAll.current === false) {
        removeSelectedType(type, true);
      } else if (!calledFromSelectAll) {
        if (isTypeOn === false) {
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
          return isAdd ? getMoleculesToSelect(proteinControlList) : getMoleculesToDeselect(proteinControlList);
        case 'complex':
          return isAdd ? getMoleculesToSelect(complexList) : getMoleculesToDeselect(complexList);
        default:
          return null;
      }
    };

    const getMoleculesToSelect = list => {
      let molecules = lpcControlMolecules.filter(m => !list.includes(m.id));
      return molecules;
    };

    const getMoleculesToDeselect = list => {
      let molecules = lpcControlMolecules.filter(m => list.includes(m.id));
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
            handlers.setIsTagEditorForCurrentSide();
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
            handlers.setSortDialogOpen(true);
          } else {
            handlers.setSortDialogOpen(false);
          }
        }}
        color={'inherit'}
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

    const groupNglControlButtonsDisabledState = useDisableNglControlButtons(lpcControlMolecules);

    const anyControlButtonDisabled = Object.values(groupNglControlButtonsDisabledState).some(
      buttonState => buttonState
    );

    // const listItemOffset = (currentPage + 1) * moleculesPerPage + nextXMolecules;
    const listItemOffset = currentPage * moleculesPerPage + nextXMolecules;
    const canLoadMore =
      listItemOffset < filteredLHSCompoundsList?.length ||
      (listItemOffset > filteredLHSCompoundsList?.length &&
        itemsToBeDisplayed?.length < filteredLHSCompoundsList?.length);
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
      const whatToDisplay = filteredLHSCompoundsList?.slice(0, currentPage * moleculesPerPage) || [];
      setItemsToBeDisplayed(currentItems => {
        const displayedItemsChanged =
          currentItems?.length !== whatToDisplay.length ||
          currentItems.some((item, index) => item !== whatToDisplay[index]);
        return displayedItemsChanged ? [...whatToDisplay] : currentItems;
      });
    }, [currentPage, filteredLHSCompoundsList, moleculesPerPage]);

    const handleExpandChange = useCallback(
      expanded => {
        if (expandHandler) expandHandler(expanded);
      },
      [expandHandler]
    );

    return (
      <Panel
        hasHeader
        title={navigatorTitle}
        headerActions={actions}
        ref={hitNavigatorRef}
        hasExpansion={!!expandHandler}
        defaultExpanded
        onExpandChange={handleExpandChange}
      >
        <div className={classes.panelContent}>
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
            description={`Displaying of ${lpcControlMolecules?.length} may take a long time`}
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
          {isObservationDialogOpen && instanceSide === observationsDialogSide && (
            <TooltipPathProvider path="observationsDialog">
              <ObservationsDialog
                open={isObservationDialogOpen}
                anchorEl={tagEditorAnchorEl}
                tagEditorProps={tagEditorProps}
                ligandRepresentations={ligandRepresentations}
                ref={tagEditorRef}
              />
            </TooltipPathProvider>
          )}
          {isObsInspirationDialogOpen && instanceSide === 'rhs' && (
            <TooltipPathProvider path="observationInspirationDialog">
              <ObservationInspirationDialog
                open={isObsInspirationDialogOpen}
                anchorEl={tagEditorAnchorEl}
                ligandRepresentations={ligandRepresentations}
                ref={inspirationDialogRef}
              />
            </TooltipPathProvider>
          )}
          {isTagEditorOpen && isTagEditorForCurrentSide && !!tagEditorAnchorEl && (
            <TagEditor
              {...tagEditorProps}
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
                  handlers.setSortDialogOpen(false);
                }}
              />
            </TooltipPathProvider>
          )}
          <Grid container spacing={1} className={classes.toolbar}>
            <Grid item className={classes.toolbarSmallButtons}>
              <RichTooltip path="allLigands">
                <Button
                  id="hit-navigator-all-ligands"
                  variant="outlined"
                  className={classNames(classes.contColButton, {
                    [classes.contColButtonSelected]: isLigandOn === true,
                    [classes.contColButtonHalfSelected]: isLigandOn === null
                  })}
                  onClick={() => onButtonToggle('ligand')}
                  disabled={groupNglControlButtonsDisabledState.ligand || lpcControlMolecules.length === 0}
                >
                  L
                </Button>
              </RichTooltip>
              <RichTooltip path="allSidechains">
                <Button
                  id="hit-navigator-all-sidechains"
                  variant="outlined"
                  className={classNames(classes.contColButton, {
                    [classes.contColButtonSelected]: isProteinOn,
                    [classes.contColButtonHalfSelected]: isProteinOn === null
                  })}
                  onClick={() => onButtonToggle('protein')}
                  disabled={groupNglControlButtonsDisabledState.protein || lpcControlMolecules.length === 0}
                >
                  P
                </Button>
              </RichTooltip>
              <RichTooltip path="allInteractions">
                {/* C stands for contacts now */}
                <Button
                  id="hit-navigator-all-interactions"
                  variant="outlined"
                  className={classNames(classes.contColButton, {
                    [classes.contColButtonSelected]: isComplexOn,
                    [classes.contColButtonHalfSelected]: isComplexOn === null
                  })}
                  onClick={() => onButtonToggle('complex')}
                  disabled={groupNglControlButtonsDisabledState.complex || lpcControlMolecules.length === 0}
                >
                  C
                </Button>
              </RichTooltip>
            </Grid>

            {
              <RichTooltip path={selectAllHitsPressed ? 'allHits.deselectAllHits' : 'allHits.selectAllHits'}>
                <Grid item className={classes.selectButton}>
                  <Button
                    id="hit-navigator-select-all-hits"
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
                    id="hit-navigator-unselect-displayed-hits"
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
                    id="hit-navigator-select-displayed-hits"
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
            <Grid item className={classes.toolbarTextItem}>
              <Typography variant="caption">{`Selected: ${
                allSelectedMolecules ? allSelectedMolecules.length : 0
              }`}</Typography>
            </Grid>
            <Grid item className={classes.toolbarTextItem}>
              <Typography variant="caption" style={{ paddingLeft: 3 }}>
                Sort by
              </Typography>
            </Grid>
            <Grid item className={classes.toolbarSelectItem}>
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
              <Grid item className={classes.toolbarTextItem}>
                <Checkbox
                  id="hit-navigator-sorting-checkbox"
                  checked={ascending}
                  onChange={handleAscendingChecked}
                  size="small"
                  style={{ padding: 0 }}
                />
                <Typography variant="caption">
                  {(selectAllHitsPressed && hitNavigatorWidth > 508) ||
                  (!selectAllHitsPressed && hitNavigatorWidth > 491)
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
                    getScrollParent={() => scrollBarRef.current}
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
                      viewConfig={viewConfig}
                      ligandRepresentations={ligandRepresentations}
                      items={itemsToBeDisplayed}
                      allSelectedMolecules={allSelectedMolecules}
                      addMoleculeViewRef={addMoleculeViewRef}
                      onPoseVisuallyReady={handlePoseVisuallyReady}
                      availableWidth={hitNavigatorListWidth}
                      handleSetTagEditorAnchorEl={setTagEditorAnchorEl}
                      fragmentDisplayList={fragmentDisplayList}
                      proteinList={proteinList}
                      complexList={complexList}
                      surfaceList={surfaceList}
                      densityList={densityList}
                      qualityList={qualityList}
                      vectorOnList={vectorOnList}
                      informationList={informationList}
                      getComputedInspirations={getComputedInspirations}
                    />
                  </InfiniteScroll>
                </Grid>
                <Grid item className={classes.footer}>
                  <Grid container alignItems="flex-start" direction="row" className={classes.footerRow}>
                    <Grid item className={classes.footerSummary}>
                      <span
                        className={classes.total}
                      >{`#Poses=${filteredLHSCompoundsList?.length}, #Obs=${joinedMoleculeLists?.length}`}</span>
                    </Grid>
                    <Grid item className={classes.footerActions}>
                      <div className={classes.footerButtonGroup} aria-label="contained primary button group">
                        <Button
                          id="hit-navigator-load-next-30"
                          variant="text"
                          size="medium"
                          color="primary"
                          className={classes.footerButton}
                          onClick={() => {
                            handlers.setNextXMolecules(30);
                          }}
                        >
                          Load next 30
                        </Button>
                        <Button
                          id="hit-navigator-load-next-100"
                          variant="text"
                          size="medium"
                          color="primary"
                          className={classes.footerButton}
                          onClick={() => {
                            handlers.setNextXMolecules(100);
                          }}
                        >
                          Load next 100
                        </Button>
                        <Button
                          id="hit-navigator-load-full-list"
                          variant="text"
                          size="medium"
                          color="primary"
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
                      </div>
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
        </div>
      </Panel>
    );
  }
);
