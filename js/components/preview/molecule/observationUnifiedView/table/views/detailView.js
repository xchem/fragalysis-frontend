/**
 * Row in Hit navigator
 */

import React, { memo, useEffect, useState, useRef, useContext, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Grid, makeStyles, IconButton, Popper, CircularProgress } from '@material-ui/core';
import { Panel } from '../../../../../common';
import { MyLocation, Assignment } from '@material-ui/icons';
import classNames from 'classnames';
import { VIEWS } from '../../../../../../constants/constants';
import { NglContext } from '../../../../../nglView/nglProvider';
import {
  addVector,
  removeVector,
  addHitProtein,
  removeHitProtein,
  addArtefactChain,
  removeArtefactChain,
  addComplex,
  removeComplex,
  addSurface,
  removeSurface,
  addDensity,
  removeDensity,
  addLigand,
  removeLigand,
  getDensityMapData,
  withDisabledMoleculeNglControlButton,
  getCategoryById
} from '../../../redux/dispatchActions';
import {
  setSelectedAll,
  setDeselectedAll,
  setMoleculeForTagEdit,
  setTagEditorOpen,
  setObservationsForLHSCmp,
  setIsLHSCmpTagEdit,
  removeProteinSettings
} from '../../../../../../reducers/selection/actions';
import { centerOnLigandByMoleculeID } from '../../../../../../reducers/ngl/dispatchActions';
import { getRandomColor } from '../../../utils/color';
import { DEFAULT_TAG_COLOR, getAllTagsForLHSCmp } from '../../../../tags/utils/tagUtils';
import useClipboard from 'react-use-clipboard';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { Edit } from '@material-ui/icons';
import { DJANGO_CONTEXT } from '../../../../../../utils/djangoContext';
import { getFontColorByBackgroundColor } from '../../../../../../utils/colors';
import { CopyDataTable } from '../../copyDataTable';
import { getCurrentTarget } from '../../../../../../reducers/api/selectors';
import { DENSITY_MAP_TYPES, MAP_RENDERING_MODES } from '../../../utils/constants';
import DensityButtonPopover from './DensityButtonPopover';
import ProteinButtonPopover, { DEFAULT_PROTEIN_SETTINGS } from './ProteinButtonPopover';
import RichTooltip from '../../../../../tooltip/RichTooltip';
import { TooltipPathProvider } from '../../../../../tooltip/TooltipPathContext';
import { isAnyInspirationTurnedOn } from '../../../../../datasets/redux/selectors';
import { setCrossReferenceCompoundName, setIsOpenCrossReferenceDialog } from '../../../../../datasets/redux/actions';
import {
  setIsObsInspirationDialogOpen,
  setObsInspirationDialogObsIds,
  setObsInspirationDialogPoseId
} from '../../../../../../reducers/selection/actions';
import { isCompoundFromVectorSelector } from '../../../../compounds/redux/dispatchActions';
import { LHS_OBSERVATION_VIEW_CONFIG } from '../../viewConfigs';
import { getDefaultComputedInspirations } from '../../../utils/computedInspirations';

const DETAIL_TEXT_ACTION_BUFFER = 28;
const DETAIL_SINGLE_CONTROL_WIDTH = 24;
const DETAIL_MIN_TEXT_WIDTH = 24;
const DETAIL_CONTROLS_WIDTH = {
  lhs: 116,
  rhs: 100
};
const DETAIL_LOCATION_CONTROL_WIDTH = 22;
const DETAIL_CONTROL_BUTTON_WIDTH = 13;

const getPackedControlsWidth = (maxWidth, buttonWidths) => {
  if (!buttonWidths.length) {
    return DETAIL_SINGLE_CONTROL_WIDTH;
  }

  let lineWidth = 0;
  let widestLine = 0;

  buttonWidths.forEach(buttonWidth => {
    if (lineWidth > 0 && lineWidth + buttonWidth > maxWidth) {
      widestLine = Math.max(widestLine, lineWidth);
      lineWidth = 0;
    }

    lineWidth += buttonWidth;
  });

  return Math.max(widestLine, lineWidth, DETAIL_SINGLE_CONTROL_WIDTH);
};

let textMeasureCanvas = null;

const getTextMeasureContext = () => {
  if (typeof document === 'undefined') {
    return null;
  }

  if (!textMeasureCanvas) {
    textMeasureCanvas = document.createElement('canvas');
  }

  return textMeasureCanvas.getContext('2d');
};

const measureTextWidth = (text, font) => {
  if (!text) {
    return 0;
  }

  const context = getTextMeasureContext();

  if (!context) {
    return String(text).length * 8;
  }

  context.font = font;
  return context.measureText(String(text)).width;
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(1) / 4,
    color: 'black',
    height: 54
  },
  siteOpenObservations: {
    // instead of coloring every specific part of border, just use inner shadow to fake it
    boxShadow: 'inset 0 0 0 2px ' + theme.palette.primary.main
  },
  buttonsRow: {
    lineHeight: '1'
  },
  contButtonsMargin: {
    // margin: theme.spacing(1) / 2,
    margin: '2px 1px',
    width: '100%',
    minWidth: DETAIL_SINGLE_CONTROL_WIDTH,
    maxWidth: '100%',
    alignContent: 'flex-start'
    // border: 'solid 1px',
    // borderColor: theme.palette.background.divider,
    // borderStyle: 'solid none none none'
  },
  buttonsTagsWrapper: {
    border: 'solid 1px',
    borderColor: theme.palette.background.divider,
    borderStyle: 'solid solid solid none',
    flex: '0 0 auto',
    width: DETAIL_CONTROLS_WIDTH.lhs,
    minWidth: DETAIL_SINGLE_CONTROL_WIDTH,
    maxWidth: '100%',
    overflow: 'hidden',
    alignSelf: 'stretch',
    boxSizing: 'border-box'
  },
  contColMenu: {
    // ...theme.typography.button,
    border: '1px solid',
    borderLeft: 0,
    alignContent: 'center',
    textAlign: 'center'
  },
  contColButtonMenu: {
    height: '100%',
    // width: '100%',
    minWidth: 20,
    width: 22,
    paddingLeft: theme.spacing(1) / 4,
    paddingRight: theme.spacing(1) / 4,
    paddingBottom: 0,
    paddingTop: 0,
    fontWeight: 'bold',
    fontSize: 14,
    borderRadius: 0,
    borderColor: theme.palette.background.divider,
    // backgroundColor: 'orange',
    '&:hover': {
      // backgroundColor: 'orange'
      // color: theme.palette.primary.contrastText
    },
    '&:disabled': {
      borderRadius: 0,
      borderColor: 'darkorange'
    }
  },
  contColButtonMenuSelected: {
    backgroundColor: 'darkorange',
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: 'darkorange'
      // color: theme.palette.black
    }
  },
  contColButton: {
    lineHeight: '1.62',
    minWidth: 'fit-content',
    width: 13,
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
  detailsCol: {
    position: 'relative',
    border: 'solid 1px',
    borderColor: theme.palette.background.divider,
    borderStyle: 'solid none solid solid',
    flex: '1 1 auto',
    width: 'auto',
    minWidth: 0,
    overflow: 'visible',
    alignSelf: 'stretch',
    boxSizing: 'border-box'
    // width: 'inherit'
  },
  detailViewRoot: {
    width: '100%',
    minWidth: 0,
    overflow: 'visible',
    alignItems: 'stretch',
    boxSizing: 'border-box'
  },
  image: {
    border: 'solid 1px',
    borderColor: theme.palette.background.divider,
    borderStyle: 'solid solid solid none',
    position: 'relative',
    alignSelf: 'stretch',
    boxSizing: 'border-box'
  },
  imageMargin: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  rightBorder: {
    borderRight: '1px solid',
    borderRightColor: theme.palette.background.divider,
    fontWeight: 'bold',
    fontSize: 11,
    paddingLeft: theme.spacing(1) / 2,
    paddingRight: theme.spacing(1) / 2,
    paddingBottom: theme.spacing(1) / 4,
    width: 25,
    textAlign: 'center',
    '&:last-child': {
      borderRight: 'none',
      width: 32
    }
  },
  fullHeight: {
    height: '100%'
  },
  site: {
    width: theme.spacing(3),
    textAlign: 'center',
    backgroundColor: theme.palette.background.default,
    border: `solid 1px`,
    borderColor: theme.palette.background.divider,
    paddingBottom: theme.spacing(1) / 4
  },
  qualityLabel: {
    paddingLeft: theme.spacing(1) / 4,
    paddingRight: theme.spacing(1) / 4
  },
  matchingValue: {
    backgroundColor: theme.palette.success.lighter
  },
  unmatchingValue: {
    backgroundColor: theme.palette.error.lighter
  },
  moleculeTitleLabel: {
    paddingLeft: 3,
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'nowrap',
    width: '100%',
    minHeight: '100%',
    // fontWeight: 400,
    overflow: 'visible',
    lineHeight: '1.45',
    fontSize: '0.8rem',
    letterSpacing: '0.02em',
    minWidth: 0,
    maxWidth: '100%',
    overflowWrap: 'anywhere'
  },
  moleculeTitleText: {
    flex: '1 1 auto',
    minWidth: 0,
    overflow: 'visible'
  },
  moleculeTitleLabelMain: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    overflow: 'visible',
    whiteSpace: 'normal',
    overflowWrap: 'anywhere'
  },
  moleculeTitleLabelSub: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    minHeight: '1.45em',
    overflow: 'visible',
    whiteSpace: 'normal',
    overflowWrap: 'anywhere'
  },
  checkbox: {
    padding: 0
  },
  rank: {
    fontStyle: 'italic',
    fontSize: 7
  },
  myLocation: {
    width: 10.328,
    height: 15
  },
  myLocationButton: {
    minWidth: 'fit-content',
    paddingLeft: theme.spacing(1) / 4,
    paddingRight: theme.spacing(1) / 4,
    paddingBottom: 0,
    paddingTop: 0,
    fontWeight: 'bold',
    fontSize: 9,
    borderRadius: 0,
    borderStyle: 'none',
    borderColor: theme.palette.white,
    '&:disabled': {
      borderRadius: 0,
      borderStyle: 'none',
      borderColor: theme.palette.white
    }
  },
  arrows: {
    height: '100%',
    border: 'solid 1px',
    borderColor: theme.palette.background.divider,
    borderStyle: 'solid solid solid solid'
  },
  arrow: {
    width: 12,
    height: 15
  },
  invisArrow: {
    width: 12,
    height: 15,
    visibility: 'hidden'
  },
  warningIcon: {
    padding: 0,
    color: theme.palette.warning.darkLight,
    '&:hover': {
      color: theme.palette.warning.dark
    }
  },
  tagIcon: {
    padding: 0,
    color: theme.palette.primary.main,
    '&:hover': {
      color: theme.palette.primary.dark
    }
  },
  copyIcon: {
    padding: 0,
    color: theme.palette.success.main,
    '&:hover': {
      color: theme.palette.success.dark
    }
  },
  tooltip: {
    backgroundColor: theme.palette.white
  },
  imageActions: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  imageTagActions: {
    position: 'absolute',
    top: 0,
    right: 0
  },
  tagPopover: {
    height: '10px',
    // width: '220px',
    padding: '0px',
    fontSize: '9px',
    borderRadius: '6px',
    textAlign: 'center',
    verticalAlign: 'center',
    paddingBottom: '14px'
  },
  tagPopoverSingle: {
    height: '10px',
    width: '18px',
    padding: '0px',
    fontSize: '9px',
    borderRadius: '7px',
    verticalAlign: 'center',
    paddingBottom: '14px',
    paddingLeft: '2px',
    paddingRight: '3px',
    textAlign: 'center'
  },
  popover: {
    paddingLeft: '5px',
    fontSize: '14px',
    fontWeight: 'bold',
    borderRadius: '5px',
    border: '0px black solid',
    paddingRight: '5px',
    minWidth: '35px',
    textAlign: 'center',
    verticalAlign: 'center'
  },
  editButtonIcon: {
    width: '0.7em',
    height: '0.7em',
    padding: '0px',
    marginLeft: '11px',
    border: 'solid 1px black',
    borderRadius: '5px'
  },
  gridTagsPopover: {
    width: '400px'
  },
  paper: {
    maxHeight: 343,
    height: 'auto',
    overflowY: 'auto',
    top: '50%',
    left: '50%'
    //transform: 'translate(86%, 0%)'
  },
  buttonLoadingOverlay: {
    position: 'absolute',
    width: '11px !important',
    height: '11px !important'
  },
  buttonSelectedLoadingOverlay: {
    color: theme.palette.primary.contrastText
  },
  smallConformerSite: {
    height: 16,
    lineHeight: 1
  },
  editIcon: {
    padding: 0,
    paddingBottom: 3,
    paddingRight: 3,
    cursor: 'pointer',
    marginRight: 5,
    position: 'right'
  },
  posePropertiesIconSlot: {
    flex: '0 0 20px',
    width: 20,
    minWidth: 20,
    alignSelf: 'stretch',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: 4,
    boxSizing: 'border-box'
  },
  posePropertiesTableIcon: {
    position: 'static',
    padding: 0,
    width: 18,
    height: 18,
    minWidth: 18,
    '& svg': {
      fontSize: 15
    },
    color: theme.palette.grey[500]
  },
  posePropertiesTableIconActive: {
    position: 'static',
    padding: 0,
    width: 18,
    height: 18,
    minWidth: 18,
    '& svg': {
      fontSize: 15
    },
    color: theme.palette.grey[700]
  }
}));

export const DetailView = memo(
  ({
    data,
    index,
    detailWidth = 0,
    detailContentRef = undefined,
    handleRef,
    disableL,
    disableP,
    disableC,
    observations,
    ligandRepresentations = undefined,
    viewConfig = LHS_OBSERVATION_VIEW_CONFIG,
    getComputedInspirations = undefined
  }) => {
    const [proteinSettings, setProteinSettings] = useState(DEFAULT_PROTEIN_SETTINGS);
    const [densityPopoverAnchor, setDensityPopoverAnchor] = useState(null);
    const [densityPopoverOpen, setDensityPopoverOpen] = useState(false);
    const [proteinPopoverAnchor, setProteinPopoverAnchor] = useState(null);
    const [proteinPopoverOpen, setProteinPopoverOpen] = useState(false);

    const [loadingInspiration, setLoadingInspiration] = useState(false);
    const [loadingReference, setLoadingReference] = useState(false);

    const showCrossReferenceModal = false;
    const hideFButton = viewConfig.kind === 'lhs';
    const isRHSView = viewConfig.kind === 'rhs';

    const isObsInspirationDialogOpen = useSelector(state => state.selectionReducers.isObsInspirationDialogOpen);
    const obsInspirationDialogPoseId = useSelector(state => state.selectionReducers.obsInspirationDialogPoseId);

    const handleDensityPopoverClose = () => {
      setDensityPopoverOpen(false);
      setDensityPopoverAnchor(null);
    };

    const [densityTooltipOpen, setDensityTooltipOpen] = React.useState(false);
    const [proteinTooltipOpen, setProteinTooltipOpen] = React.useState(false);

    const handleTooltipOpen = () => {
      if (!densityPopoverOpen) {
        setDensityTooltipOpen(true);
      }
    };

    const handleTooltipClose = () => {
      setDensityTooltipOpen(false);
    };

    const handleDensityButtonContextMenu = event => {
      event.preventDefault();

      setDensityTooltipOpen(false);

      setDensityPopoverAnchor(event.currentTarget);
      setDensityPopoverOpen(true);
    };

    const handleProteinButtonContextMenu = event => {
      event.preventDefault();

      setProteinTooltipOpen(false);

      setProteinPopoverAnchor(event.currentTarget);
      setProteinPopoverOpen(true);
    };

    const handleProteinPopoverClose = () => {
      setProteinPopoverOpen(false);
      setProteinPopoverAnchor(null);
    };

    const handleProteinTooltipOpen = () => {
      if (!proteinPopoverOpen) {
        setProteinTooltipOpen(true);
      }
    };

    const handleProteinTooltipClose = () => {
      setProteinTooltipOpen(false);
    };

    // const [countOfVectors, setCountOfVectors] = useState('-');
    // const [cmpds, setCmpds] = useState('-');
    const selectedAll = useRef(false);
    const currentID = (data && data.id) || undefined;
    const classes = useStyles();

    const dispatch = useDispatch();

    const target_on_name = useSelector(state => state.apiReducers.target_on_name);

    const tagList = useSelector(state => state.apiReducers.tagList);
    const tagCategories = useSelector(state => state.apiReducers.categoryList);
    const tagEditorOpen = useSelector(state => state.selectionReducers.tagEditorOpened);
    const molForTagEditId = useSelector(state => state.selectionReducers.molForTagEdit);

    const isObservationDialogOpen = useSelector(state => state.selectionReducers.isObservationDialogOpen);

    // True only when the tag editor was opened specifically for this row
    const isRowTagEditorOpen =
      tagEditorOpen && (molForTagEditId || []).some(id => observations.some(obs => obs.id === id));

    const [hasMap, setHasMap] = useState(false);

    const { getNglView } = useContext(NglContext);
    const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

    const poseIdForObservationsDialog = useSelector(state => state.selectionReducers.poseIdForObservationsDialog);

    useEffect(() => {
      if (isObservationDialogOpen && poseIdForObservationsDialog === currentID) {
        dispatch(setObservationsForLHSCmp(observations));
        handleRef();
      }
    }, [observations, isObservationDialogOpen, dispatch, poseIdForObservationsDialog, currentID, handleRef]);

    const getMainObservation = useCallback(() => {
      let result = null;

      if (observations && observations.length > 0 && data.main_site_observation) {
        result = observations.find(o => o.id === data.main_site_observation);
      }

      return result;
    }, [data, observations]);

    const getAllObservationsSelectedInList = list => {
      let result = [];

      if (list && list.length > 0 && observations && observations.length > 0) {
        observations.forEach(obs => {
          const isPresent = list.some(id => obs.id === id);
          if (isPresent) {
            result.push(obs);
          }
        });
      }

      return result;
    };

    const isAtLeastOneObservationOnInList = list => {
      let result = false;

      if (list && list.length > 0 && observations && observations.length > 0) {
        for (const obs of observations) {
          const isPresent = list.some(id => obs.id === id);
          if (isPresent) {
            result = true;
            break;
          }
        }
      }

      return result;
    };

    const isAtLeastOneObservationOnDensity = list => {
      let result = false;

      if (list && list.length > 0 && observations && observations.length > 0) {
        for (const obs of observations) {
          const isPresent = list.some(d => obs.id === d.id);
          if (isPresent) {
            result = true;
            break;
          }
        }
      }

      return result;
    };

    useEffect(() => {
      for (let i = 0; i < observations.length; i++) {
        const obs = observations[i];
        if (
          (obs?.proteinData?.diff_info || obs?.proteinData?.sigmaa_info || obs?.proteinData?.event_info) &&
          (!obs?.proteinData?.diff_info.endsWith('None') ||
            !obs?.proteinData?.sigmaa_info.endsWith('None') ||
            !obs?.proteinData?.event_info.endsWith('None'))
        ) {
          setHasMap(true);
          break;
        }
      }
    }, [observations]);

    const fragmentDisplayList = useSelector(state => state.selectionReducers.fragmentDisplayList);
    const proteinList = useSelector(state => state.selectionReducers.proteinList);
    const artefactsChainList = useSelector(state => state.selectionReducers.artefactsChainList);
    const complexList = useSelector(state => state.selectionReducers.complexList);
    const surfaceList = useSelector(state => state.selectionReducers.surfaceList);
    const densityList = useSelector(state => state.selectionReducers.densityList);
    const vectorOnList = useSelector(state => state.selectionReducers.vectorOnList);
    // const currentTarget = useSelector(state => getCurrentTarget(state));
    const aliasOrder = useSelector(state => state.apiReducers.target_on_aliases);
    const computedInspirations = useMemo(() => {
      if (getComputedInspirations) {
        return getComputedInspirations({ data, observations });
      }

      return getDefaultComputedInspirations({ data, observations });
    }, [data, getComputedInspirations, observations]);

    const isAnyInspirationOn = useSelector(state => isAnyInspirationTurnedOn(state, computedInspirations));
    const isFromVectorSelector = isCompoundFromVectorSelector(data);

    const activeTarget = useSelector(state => getCurrentTarget(state));
    const defaultMapType = activeTarget?.settings?.electron_density_map_type || DENSITY_MAP_TYPES.EVENT;
    const defaultMapRendering =
      activeTarget?.settings?.electron_density_rendering_mode || MAP_RENDERING_MODES.WIREFRAME;

    const isLigandOn = isAtLeastOneObservationOnInList(fragmentDisplayList);
    const isProteinOn = isAtLeastOneObservationOnInList(proteinList);
    const isArtefactChainOn = isAtLeastOneObservationOnInList(artefactsChainList);
    // C stands for contacts now
    const isComplexOn = isAtLeastOneObservationOnInList(complexList);
    const isSurfaceOn = isAtLeastOneObservationOnInList(surfaceList);
    const isDensityOn = isAtLeastOneObservationOnDensity(densityList);
    const isVectorOn = isAtLeastOneObservationOnInList(vectorOnList);

    const hasAllValuesOn = isLigandOn && isProteinOn && isArtefactChainOn && isComplexOn;
    const hasSomeValuesOn = !hasAllValuesOn && (isLigandOn || isProteinOn || isArtefactChainOn || isComplexOn);

    let isWireframeStyle = defaultMapRendering === MAP_RENDERING_MODES.WIREFRAME ? true : false;

    const disableMoleculeNglControlButtons =
      useSelector(state => state.previewReducers.molecule.disableNglControlButtons[currentID]) || {};

    const colourToggle = getRandomColor(getMainObservation());

    const [tagPopoverOpen, setTagPopoverOpen] = useState(null);

    const open = tagPopoverOpen ? true : false;

    const handlePopoverOpen = event => {
      setTagPopoverOpen(event.currentTarget);
    };

    const handlePopoverClose = () => {
      setTagPopoverOpen(null);
    };

    const resolveTagBackgroundColor = useCallback(
      tag => {
        let color = DEFAULT_TAG_COLOR;

        if (tag.colour && tag.colour !== '') {
          color = tag.colour;
        } else {
          const category = dispatch(getCategoryById(tag.category));
          if (category) {
            color = `#${category.colour}`;
          }
        }

        return color;
      },
      [dispatch]
    );

    const resolveTagForegroundColor = useCallback(
      tag => {
        const bgColor = resolveTagBackgroundColor(tag);
        return getFontColorByBackgroundColor(bgColor);
      },
      [resolveTagBackgroundColor]
    );

    const getConformerSitesTagCategory = useCallback(() => {
      const conformerSitesTag = tagCategories.find(tag => tag.category === 'ConformerSites');
      return conformerSitesTag ? conformerSitesTag : null;
    }, [tagCategories]);

    const getCanonSitesTagCategory = useCallback(() => {
      const canonSitesTag = tagCategories.find(tag => tag.category === 'CanonSites');
      return canonSitesTag ? canonSitesTag : null;
    }, [tagCategories]);

    const generateTagPopover = useCallback(() => {
      // console.log('generateTagPopover');
      const allTagsData = getAllTagsForLHSCmp(observations, tagList, tagCategories, viewConfig.kind);
      const allData = allTagsData.filter(
        tagData =>
          !tagData.hidden &&
          ![getConformerSitesTagCategory()?.id, getCanonSitesTagCategory()?.id].includes(tagData.category)
      );

      // console.log(
      //   `generateTagPopover ${observations[0].compound_code} assigned tags: ${observations[0].tags_set} count: ` +
      //     allData?.length +
      //     ' ' +
      //     JSON.stringify(allData)
      // );
      // const sortedData = [...allData].sort((a, b) => a.tag.localeCompare(b.tag));

      const modifiedObjects = allData.map((obj, index) => {
        let result = obj;

        if (obj.tag_prefix) {
          result = { ...obj, tag: obj.tag_prefix };
        } else {
          const tagNameShortLength = 3;
          if (obj.tag.length > tagNameShortLength) {
            result = { ...obj, tag: obj.tag.slice(0, tagNameShortLength) };
          }
        }

        return result;
      });

      const allTagsLength = allData.length > 9 ? 9 : allData.length;

      return modifiedObjects?.length > 0 ? (
        <Grid item>
          <Typography
            aria-owns={open ? 'mouse-over-popover' : undefined}
            aria-haspopup="true"
            style={{ fontSize: '10px' }}
            component={'div'}
          >
            {modifiedObjects.length < 2 ? (
              <Grid
                className={classes.tagPopover}
                container
                direction="row"
                style={{ width: '50px' }}
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
              >
                {modifiedObjects.map((item, index) =>
                  index < allTagsLength ? (
                    <Grid
                      style={{
                        backgroundColor: resolveTagBackgroundColor(modifiedObjects[index]),
                        color: resolveTagForegroundColor(modifiedObjects[index]),
                        display: 'block',
                        maxWidth: '20px'
                      }}
                      className={classes.tagPopover}
                      item
                      xs={9}
                      key={index}
                    >
                      <div>{item.tag} </div>
                    </Grid>
                  ) : (
                    <div></div>
                  )
                )}
                {DJANGO_CONTEXT['username'] === 'NOT_LOGGED_IN' ? (
                  <div></div>
                ) : (
                  <div style={{ width: '10px' }}>
                    <Grid item xs={1}>
                      <IconButton
                        color={'inherit'}
                        disabled={!modifiedObjects}
                        onClick={() => {
                          if (isRowTagEditorOpen) {
                            dispatch(setTagEditorOpen(false));
                            dispatch(setMoleculeForTagEdit([]));
                            dispatch(setIsLHSCmpTagEdit(false));
                          } else {
                            dispatch(setIsLHSCmpTagEdit(!isRHSView));
                            dispatch(setMoleculeForTagEdit(observations.map(obs => obs.id)));
                            dispatch(setTagEditorOpen(true));
                            handleRef();
                          }
                        }}
                        style={{ padding: 0, paddingBottom: 3, marginRight: 5, position: 'right' }}
                        // className={classes.editIcon}
                      >
                        <RichTooltip path="tags.editTag" className={classes.editButtonIcon}>
                          <Edit />
                        </RichTooltip>
                      </IconButton>
                    </Grid>
                  </div>
                )}
              </Grid>
            ) : (
              <Grid
                className={classes.tagPopover}
                container
                direction="row"
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
              >
                <div style={{ display: 'flex', width: `${20 * allTagsLength}` + 'px' }}>
                  {modifiedObjects.map((item, index) =>
                    index < allTagsLength ? (
                      <Grid
                        style={{
                          backgroundColor: resolveTagBackgroundColor(modifiedObjects[index]),
                          color: resolveTagForegroundColor(modifiedObjects[index]),
                          display: 'flex',
                          width: '20px',
                          paddingLeft: '3px'
                        }}
                        className={classes.tagPopover}
                        item
                        xs={12}
                        key={index}
                      >
                        <div>{item.tag} </div>
                      </Grid>
                    ) : (
                      <div></div>
                    )
                  )}
                </div>
                <div>
                  {DJANGO_CONTEXT['username'] === 'NOT_LOGGED_IN' ? (
                    <div></div>
                  ) : (
                    <IconButton
                      color={'inherit'}
                      disabled={!modifiedObjects}
                      onClick={() => {
                        if (isRowTagEditorOpen) {
                          dispatch(setTagEditorOpen(false));
                          dispatch(setMoleculeForTagEdit([]));
                          dispatch(setIsLHSCmpTagEdit(false));
                        } else {
                          dispatch(setIsLHSCmpTagEdit(!isRHSView));
                          dispatch(setMoleculeForTagEdit(observations.map(obs => obs.id)));
                          dispatch(setTagEditorOpen(true));
                          handleRef();
                        }
                      }}
                      style={{ padding: 0, paddingBottom: 3, paddingRight: 5, cursor: 'pointer' }}
                      // className={classes.editIcon}
                    >
                      <RichTooltip path="tags.editTags" className={classes.editButtonIcon}>
                        <Edit />
                      </RichTooltip>
                    </IconButton>
                  )}
                </div>
              </Grid>
            )}
          </Typography>
          {tagEditorOpen === false ? (
            <Typography
              aria-owns={open ? 'mouse-over-popper' : undefined}
              aria-haspopup="true"
              style={{ fontSize: '10px', display: 'flex' }}
              component={'div'}
            >
              <Popper
                open={open}
                placement={isRHSView ? 'left-start' : 'right-start'}
                anchorEl={tagPopoverOpen}
                style={{ display: 'flex' }}
              >
                <Panel
                  secondaryBackground
                  className={classes.paper}
                  style={{
                    background: '',
                    width: '320px',
                    display: 'flex',
                    marginLeft: isRHSView ? 0 : 8,
                    marginRight: isRHSView ? 8 : 0
                  }}
                >
                  <Grid alignItems="center" direction="row" container>
                    {allData.map((item, index) => (
                      <Grid
                        style={{
                          backgroundColor: resolveTagBackgroundColor(allData[index]),
                          color: resolveTagForegroundColor(allData[index]),
                          border: `${resolveTagBackgroundColor(allData[index])} solid 1px`,
                          display: 'grid',
                          placeItems: 'center'
                        }}
                        className={classes.popover}
                        item
                        xs={allData.length === 1 ? 12 : allData.length === 2 ? 6 : 4}
                        key={index}
                      >
                        <div>{item.tag_prefix ? `${item.tag_prefix} - ${item.tag}` : item.tag}</div>
                      </Grid>
                    ))}
                  </Grid>
                </Panel>
              </Popper>
            </Typography>
          ) : (
            <div> </div>
          )}
        </Grid>
      ) : DJANGO_CONTEXT['username'] === 'NOT_LOGGED_IN' ? (
        <></>
      ) : (
        <Grid item>
          <IconButton
            color={'inherit'}
            disabled={!modifiedObjects}
            onClick={() => {
              if (isRowTagEditorOpen) {
                dispatch(setTagEditorOpen(false));
                dispatch(setMoleculeForTagEdit([]));
                dispatch(setIsLHSCmpTagEdit(false));
              } else {
                dispatch(setIsLHSCmpTagEdit(!isRHSView));
                dispatch(setMoleculeForTagEdit(observations.map(obs => obs.id)));
                dispatch(setTagEditorOpen(true));
                handleRef();
              }
            }}
            style={{ padding: 0, paddingBottom: 8, paddingRight: 5, cursor: 'pointer' }}
            // className={classes.editIcon}
          >
            <RichTooltip path="tags.editTags" className={classes.editButtonIcon}>
              <Edit />
            </RichTooltip>
          </IconButton>
        </Grid>
      );
    }, [
      // classes.editIcon,
      classes.editButtonIcon,
      classes.paper,
      classes.popover,
      classes.tagPopover,
      dispatch,
      getCanonSitesTagCategory,
      getConformerSitesTagCategory,
      isRHSView,
      observations,
      open,
      resolveTagBackgroundColor,
      resolveTagForegroundColor,
      handleRef,
      tagCategories,
      isRowTagEditorOpen,
      tagEditorOpen,
      tagList,
      tagPopoverOpen,
      viewConfig.kind
    ]);

    const addNewLigand = (skipTracking = false) => {
      // if (selectMoleculeSite) {
      //   selectMoleculeSite(data.site);
      // }
      dispatch(
        withDisabledMoleculeNglControlButton(currentID, 'ligand', async () => {
          const firstObs = getMainObservation();
          if (firstObs) {
            const color = getRandomColor(firstObs);
            await dispatch(addLigand(stage, firstObs, color, false, true, skipTracking, ligandRepresentations));
          }
        })
      );
    };

    const removeSelectedLigand = (skipTracking = false) => {
      const selectedObs = getAllObservationsSelectedInList(fragmentDisplayList);
      for (const obs of selectedObs) {
        dispatch(removeLigand(stage, obs, skipTracking));
      }
      selectedAll.current = false;
    };

    const [loadingAll, setLoadingAll] = useState(false);
    const [loadingLigand, setLoadingLigand] = useState(false);

    const onLigand = calledFromSelectAll => {
      setLoadingLigand(true);
      if (calledFromSelectAll === true && selectedAll.current === true) {
        if (isLigandOn === false) {
          addNewLigand(calledFromSelectAll);
        }
      } else if (calledFromSelectAll && selectedAll.current === false) {
        removeSelectedLigand(calledFromSelectAll);
      } else if (!calledFromSelectAll) {
        if (isLigandOn === false) {
          addNewLigand();
        } else {
          removeSelectedLigand();
        }
      }
      setLoadingLigand(false);
    };

    const removeSelectedProtein = (skipTracking = false) => {
      const selectedObs = getAllObservationsSelectedInList(proteinList);
      for (const obs of selectedObs) {
        dispatch(removeHitProtein(stage, obs, colourToggle, skipTracking));
      }
      selectedAll.current = false;
    };

    const removeSelectedArtefactChain = (skipTracking = false) => {
      const selectedObs = getAllObservationsSelectedInList(artefactsChainList);
      for (const obs of selectedObs) {
        dispatch(removeArtefactChain(stage, obs, colourToggle, skipTracking));
      }
      selectedAll.current = false;
    };

    const addNewProtein = (skipTracking = false) => {
      // if (selectMoleculeSite) {
      //   selectMoleculeSite(data.site);
      // }
      dispatch(
        withDisabledMoleculeNglControlButton(currentID, 'protein', async () => {
          const firstObs = getMainObservation();
          if (firstObs) {
            const color = getRandomColor(firstObs);
            await dispatch(addHitProtein(stage, firstObs, color, true, skipTracking));
          }
        })
      );
    };

    const addNewArtefactChain = (skipTracking = false) => {
      dispatch(
        withDisabledMoleculeNglControlButton(currentID, 'protein', async () => {
          const firstObs = getMainObservation();
          if (firstObs) {
            const color = getRandomColor(firstObs);
            await dispatch(addArtefactChain(stage, firstObs, color, true, skipTracking));
          }
        })
      );
    };

    const [loadingProtein, setLoadingProtein] = useState(false);

    const onProtein = (calledFromSelectAll, type = 'both', desiredVisible) => {
      setLoadingProtein(true);
      if (calledFromSelectAll === true && selectedAll.current === true) {
        if (proteinSettings.protein && isProteinOn === false) {
          addNewProtein(calledFromSelectAll);
        }
        if (proteinSettings.artefact && isArtefactChainOn === false) {
          addNewArtefactChain(calledFromSelectAll);
        }
      } else if (calledFromSelectAll && selectedAll.current === false) {
        removeSelectedProtein(calledFromSelectAll);
        removeSelectedArtefactChain(calledFromSelectAll);
      } else if (!calledFromSelectAll) {
        switch (type) {
          case 'protein':
            if (desiredVisible ?? !isProteinOn) {
              if (!isProteinOn) {
                addNewProtein();
              }
            } else if (isProteinOn) {
              removeSelectedProtein();
            }
            break;
          case 'artefact':
            if (desiredVisible ?? !isArtefactChainOn) {
              if (!isArtefactChainOn) {
                addNewArtefactChain();
              }
            } else if (isArtefactChainOn) {
              removeSelectedArtefactChain();
            }
            break;
          case 'both':
            if (proteinSettings.protein) {
              if (isProteinOn) {
                removeSelectedProtein();
              } else {
                addNewProtein();
              }
            }
            if (proteinSettings.artefact) {
              if (isArtefactChainOn) {
                removeSelectedArtefactChain();
              } else {
                addNewArtefactChain();
              }
            }
            if (!proteinSettings.protein && !proteinSettings.artefact) {
              dispatch(removeProteinSettings({ id: getMainObservation()?.id }));
              setProteinSettings(DEFAULT_PROTEIN_SETTINGS);
              addNewProtein(false);
            }
            break;
          default:
            break;
        }
      }
      setLoadingProtein(false);
    };

    const removeSelectedComplex = (skipTracking = false) => {
      const selectedObs = getAllObservationsSelectedInList(complexList);
      for (const obs of selectedObs) {
        dispatch(removeComplex(stage, obs, colourToggle, skipTracking));
      }
      selectedAll.current = false;
    };

    const addNewComplex = (skipTracking = false) => {
      dispatch(
        withDisabledMoleculeNglControlButton(currentID, 'complex', async () => {
          const firstObs = getMainObservation();
          if (firstObs) {
            const color = getRandomColor(firstObs);
            await dispatch(addComplex(stage, firstObs, color, skipTracking));
          }
        })
      );
    };

    const [loadingComplex, setLoadingComplex] = useState(false);

    const onComplex = calledFromSelectAll => {
      setLoadingComplex(true);
      if (calledFromSelectAll === true && selectedAll.current === true) {
        if (isComplexOn === false) {
          addNewComplex(calledFromSelectAll);
        }
      } else if (calledFromSelectAll && selectedAll.current === false) {
        removeSelectedComplex(calledFromSelectAll);
      } else if (!calledFromSelectAll) {
        if (isComplexOn === false) {
          addNewComplex();
        } else {
          removeSelectedComplex();
        }
      }
      setLoadingComplex(false);
    };

    const removeSelectedSurface = () => {
      const selectedObs = getAllObservationsSelectedInList(surfaceList);
      for (const obs of selectedObs) {
        dispatch(removeSurface(stage, obs, colourToggle));
      }
    };

    const addNewSurface = () => {
      dispatch(
        withDisabledMoleculeNglControlButton(currentID, 'surface', async () => {
          const firstObs = getMainObservation();
          if (firstObs) {
            const color = getRandomColor(firstObs);
            await dispatch(addSurface(stage, firstObs, color));
          }
        })
      );
    };

    const [loadingSurface, setLoadingSurface] = useState(false);

    const onSurface = () => {
      setLoadingSurface(true);
      if (isSurfaceOn === false) {
        addNewSurface();
      } else {
        removeSelectedSurface();
      }
      setLoadingSurface(false);
    };

    const removeSelectedDensity = () => {
      // const firstObs = getFirstObservationWithDensity();
      observations.forEach(obs => {
        if (isAtLeastOneObservationOnDensity([obs])) {
          dispatch(removeDensity(stage, obs, colourToggle, isWireframeStyle));
        }
      });
    };

    const addNewDensity = async densityObject => {
      dispatch(
        withDisabledMoleculeNglControlButton(currentID, 'ligand', async () => {
          await dispatch(
            withDisabledMoleculeNglControlButton(currentID, 'density', async () => {
              // const firstObs = getFirstObservationWithDensity();
              const firstObs = getMainObservation();
              await dispatch(addDensity(firstObs, densityObject));
            })
          );
        })
      );
    };

    const [loadingDensity, setLoadingDensity] = useState(false);

    const isDensityAvailable = url => {
      if (!url || url.endsWith('None')) {
        return false;
      }
      return true;
    };

    const onDensity = () => {
      setLoadingDensity(true);
      if (!isDensityOn) {
        // let firstObs = getFirstObservationWithDensity();
        let firstObs = getMainObservation();
        dispatch(getDensityMapData(firstObs)).then(r => {
          if (r) {
            const densityObject = {};
            densityObject.id = firstObs.id;
            densityObject.isWireframeStyle = isWireframeStyle;
            densityObject.color = colourToggle;
            densityObject.contour_event = 1.0;
            densityObject.contour_2FoFc = 1.2;
            densityObject.contour_FoFc = 3.0;
            if (defaultMapType === DENSITY_MAP_TYPES.EVENT) {
              //this is ugly but more "elegant/clever" way is to unreadable
              if (isDensityAvailable(firstObs?.proteinData?.event_info)) {
                densityObject.render_event = true;
              } else if (isDensityAvailable(firstObs?.proteinData?.sigmaa_info)) {
                densityObject.render_2FoFc = true;
              } else if (isDensityAvailable(firstObs?.proteinData?.diff_info)) {
                densityObject.render_FoFc = true;
              }
            } else if (defaultMapType === DENSITY_MAP_TYPES._2FoFc) {
              if (isDensityAvailable(firstObs?.proteinData?.sigmaa_info)) {
                densityObject.render_2FoFc = true;
              } else if (isDensityAvailable(firstObs?.proteinData?.event_info)) {
                densityObject.render_event = true;
              } else if (isDensityAvailable(firstObs?.proteinData?.diff_info)) {
                densityObject.render_FoFc = true;
              }
            } else if (defaultMapType === DENSITY_MAP_TYPES.FoFC) {
              if (isDensityAvailable(firstObs?.proteinData?.diff_info)) {
                densityObject.render_FoFc = true;
              } else if (isDensityAvailable(firstObs?.proteinData?.event_info)) {
                densityObject.render_event = true;
              } else if (isDensityAvailable(firstObs?.proteinData?.sigmaa_info)) {
                densityObject.render_2FoFc = true;
              }
            } else {
              //unknown type so defaulting first available
              if (isDensityAvailable(firstObs?.proteinData?.event_info)) {
                densityObject.render_event = true;
              } else if (isDensityAvailable(firstObs?.proteinData?.sigmaa_info)) {
                densityObject.render_2FoFc = true;
              } else if (isDensityAvailable(firstObs?.proteinData?.diff_info)) {
                densityObject.render_FoFc = true;
              }
            }
            addNewDensity(densityObject);
          }
        });
      } else {
        removeSelectedDensity();
      }
      setLoadingDensity(false);
    };

    const removeSelectedVector = () => {
      const selectedObs = getAllObservationsSelectedInList(vectorOnList);
      for (const obs of selectedObs) {
        dispatch(removeVector(stage, obs));
      }
    };

    const addNewVector = () => {
      dispatch(
        withDisabledMoleculeNglControlButton(currentID, 'vector', async () => {
          const firstObs = getMainObservation();
          if (firstObs) {
            await dispatch(addVector(stage, firstObs));
          }
        })
      );
    };

    const [loadingVector, setLoadingVector] = useState(false);

    const onVector = () => {
      setLoadingVector(true);
      if (isVectorOn === false) {
        addNewVector();
      } else {
        removeSelectedVector();
      }
      setLoadingVector(false);
    };

    const setCalledFromAll = () => {
      let isSelected = selectedAll.current === true;
      if (isSelected) {
        dispatch(setSelectedAll(data, true, true, true));
      } else {
        dispatch(setDeselectedAll(data, isLigandOn, isProteinOn, isComplexOn));
      }
    };

    // let moleculeTitle = data?.code.replace(new RegExp(`${target_on_name}-`, 'i'), '');
    let moleculeTitle = data.code;
    // let moleculeTitle = data?.code?.replaceAll(`${target_on_name}-`, '') || '';
    if (observations?.length > 0 && observations[0].compound_code) {
      moleculeTitle += ` - ${observations[0].compound_code}`;
    }

    const [, setNameCopied] = useClipboard(moleculeTitle, { successDuration: 5000 });

    const moleculeLPCControlButtonDisabled = ['ligand', 'protein', 'complex'].some(
      type => disableMoleculeNglControlButtons[type]
    );

    const groupMoleculeLPCControlButtonDisabled = disableL || disableP || disableC;
    const shouldRenderDetailTrailingButtons =
      viewConfig.shouldRenderDetailTrailingButtons?.({ data, observations }) ?? true;

    const getDisplayName = useCallback(
      (shortened = false) => {
        const mainObservation = getMainObservation();
        let displayName = '';
        const defaultName = viewConfig.getDetailDefaultName?.(mainObservation) ?? mainObservation?.compound_code;

        if (aliasOrder) {
          for (let index = 0; index < aliasOrder.length; index++) {
            const preferredIdentifierType = aliasOrder[index];
            if (preferredIdentifierType === 'compound_code') {
              displayName = defaultName;
              break;
            } else {
              // id: 81
              // compound: 34
              // name: "nonsense-34"
              // type: "nonsense_id"
              // url: null
              const searchedIdentifier = mainObservation?.identifiers.find(
                identifier => identifier.type === preferredIdentifierType
              );
              if (searchedIdentifier) {
                displayName = searchedIdentifier.name;
                break;
              }
            }
          }
        }
        if (!displayName) {
          displayName = defaultName;
        }

        if (shortened) {
          displayName = displayName?.length > 12 ? `${displayName?.substring(0, 9)}...` : displayName;
        }

        return displayName;
      },
      [aliasOrder, getMainObservation, viewConfig]
    );

    const visibleControlButtonWidths = useMemo(() => {
      const widths = [
        DETAIL_LOCATION_CONTROL_WIDTH,
        DETAIL_CONTROL_BUTTON_WIDTH,
        DETAIL_CONTROL_BUTTON_WIDTH,
        DETAIL_CONTROL_BUTTON_WIDTH,
        DETAIL_CONTROL_BUTTON_WIDTH,
        DETAIL_CONTROL_BUTTON_WIDTH
      ];

      if (shouldRenderDetailTrailingButtons) {
        return widths.concat(DETAIL_CONTROL_BUTTON_WIDTH, DETAIL_CONTROL_BUTTON_WIDTH);
      }

      if (!hideFButton) {
        widths.push(DETAIL_CONTROL_BUTTON_WIDTH);
      }

      if (showCrossReferenceModal) {
        widths.push(DETAIL_CONTROL_BUTTON_WIDTH);
      }

      return widths;
    }, [hideFButton, shouldRenderDetailTrailingButtons, showCrossReferenceModal]);

    const detailLayout = useMemo(() => {
      const availableWidth = Number(detailWidth) || 0;
      const mainObservation = getMainObservation();
      const codeWidth = measureTextWidth(mainObservation?.code || '', '700 14.4px Roboto, Arial, sans-serif');
      const displayNameWidth = measureTextWidth(getDisplayName() || '', '400 12.8px Roboto, Arial, sans-serif');
      const preferredTextWidth = Math.ceil(Math.max(codeWidth, displayNameWidth) + DETAIL_TEXT_ACTION_BUFFER);
      const fullControlsWidth = DETAIL_CONTROLS_WIDTH[viewConfig.kind] || DETAIL_CONTROLS_WIDTH.lhs;

      if (!availableWidth) {
        return {
          controlsWidth: fullControlsWidth,
          textColumnWidth: undefined
        };
      }

      const maxControlsWidth = Math.max(
        DETAIL_SINGLE_CONTROL_WIDTH,
        Math.min(fullControlsWidth, availableWidth - DETAIL_MIN_TEXT_WIDTH)
      );
      const controlsWidth =
        maxControlsWidth >= fullControlsWidth
          ? fullControlsWidth
          : getPackedControlsWidth(maxControlsWidth, visibleControlButtonWidths);

      return {
        controlsWidth: Math.ceil(controlsWidth),
        textColumnWidth: Math.max(DETAIL_MIN_TEXT_WIDTH, Math.min(preferredTextWidth, availableWidth - controlsWidth))
      };
    }, [detailWidth, getDisplayName, getMainObservation, viewConfig.kind, visibleControlButtonWidths]);

    const [anchorElTable, setAnchorElTable] = useState(null);
    const handleTablePopoverOpen = event => {
      setAnchorElTable(anchorElTable ? null : event.currentTarget);
    };
    const handleTablePopoverClose = () => {
      setAnchorElTable(null);
    };
    const popoverOpen = Boolean(anchorElTable);

    const generateLastButtons = () => {
      return shouldRenderDetailTrailingButtons ? (
        <>
          <RichTooltip
            path="electronDensity"
            open={densityTooltipOpen}
            onOpen={handleTooltipOpen}
            onClose={handleTooltipClose}
            disableHoverListener={densityPopoverOpen}
            disableFocusListener={densityPopoverOpen}
            disableTouchListener={densityPopoverOpen}
          >
            <Grid item>
              <Button
                id={'detail-view-electron-density-' + index}
                variant="outlined"
                className={classNames(classes.contColButton, {
                  [classes.contColButtonSelected]: isDensityOn
                })}
                onClick={() => onDensity()}
                onContextMenu={handleDensityButtonContextMenu}
                disabled={!hasMap || disableMoleculeNglControlButtons.density}
              >
                D
                {loadingDensity && (
                  <CircularProgress
                    className={classNames(classes.buttonLoadingOverlay, {
                      [classes.buttonSelectedLoadingOverlay]: isDensityOn
                    })}
                  />
                )}
              </Button>

              <Popover
                open={densityPopoverOpen}
                anchorEl={densityPopoverAnchor}
                onClose={handleDensityPopoverClose}
                anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
                transformOrigin={{ vertical: 'center', horizontal: 'left' }}
              >
                <DensityButtonPopover mol={getMainObservation()} />
              </Popover>
            </Grid>
          </RichTooltip>
          <RichTooltip path="vectors">
            <Grid item>
              <Button
                id={'detail-view-vectors-' + index}
                variant="outlined"
                className={classNames(classes.contColButton, {
                  [classes.contColButtonSelected]: isVectorOn
                })}
                onClick={() => onVector()}
                disabled={disableMoleculeNglControlButtons.vector}
              >
                V
                {loadingVector && (
                  <CircularProgress
                    className={classNames(classes.buttonLoadingOverlay, {
                      [classes.buttonSelectedLoadingOverlay]: isVectorOn
                    })}
                  />
                )}
              </Button>
            </Grid>
          </RichTooltip>
        </>
      ) : (
        <>
          {!hideFButton && (
            <RichTooltip path="computedInspirations">
              <Grid item>
                <Button
                  variant="outlined"
                  className={classNames(classes.contColButton, {
                    [classes.contColButtonSelected]: isAnyInspirationOn
                  })}
                  onClick={() => {
                    setLoadingInspiration(true);
                    if (!isObsInspirationDialogOpen || obsInspirationDialogPoseId !== currentID) {
                      handleRef();
                      dispatch(setObsInspirationDialogObsIds(computedInspirations));
                      dispatch(setObsInspirationDialogPoseId(currentID));
                      dispatch(setIsObsInspirationDialogOpen(true));
                    } else {
                      dispatch(setIsObsInspirationDialogOpen(false));
                      dispatch(setObsInspirationDialogPoseId(0));
                    }
                    setLoadingInspiration(false);
                  }}
                  disabled={isFromVectorSelector}
                >
                  F
                  {loadingInspiration && (
                    <CircularProgress
                      className={classNames(classes.buttonLoadingOverlay, {
                        [classes.buttonSelectedLoadingOverlay]: isAnyInspirationOn
                      })}
                    />
                  )}
                </Button>
              </Grid>
            </RichTooltip>
          )}
          {showCrossReferenceModal && (
            <RichTooltip path="crossReference">
              <Grid item>
                <Button
                  variant="outlined"
                  className={classNames(classes.contColButton, {
                    // [classes.contColButtonSelected]: isAnyInspirationOn
                  })}
                  onClick={() => {
                    setLoadingReference(true);
                    dispatch(setCrossReferenceCompoundName(moleculeTitle));
                    dispatch(setIsOpenCrossReferenceDialog(true));
                    // TODO
                    // if (setRef) {
                    //   setRef(outsideRef.current);
                    // }
                    setLoadingReference(false);
                  }}
                  disabled={isFromVectorSelector}
                >
                  X
                  {loadingReference && (
                    <CircularProgress
                      className={classNames(classes.buttonLoadingOverlay, {
                        // [classes.buttonSelectedLoadingOverlay]: isAnyInspirationOn
                      })}
                    />
                  )}
                </Button>
              </Grid>
            </RichTooltip>
          )}
        </>
      );
    };

    return (
      <Grid
        container
        justifyContent="flex-start"
        direction="row"
        wrap="nowrap"
        ref={detailContentRef}
        className={classes.detailViewRoot}
        data-lhs-compound-code={getMainObservation()?.compound_code || ''}
        data-lhs-observation-code={getMainObservation()?.code || ''}
      >
        <Grid
          item
          container
          className={classes.detailsCol}
          justifyContent="space-evenly"
          direction="column"
          style={{
            flexBasis: detailLayout.textColumnWidth
          }}
        >
          {/* Title label */}
          <Grid
            item
            container
            direction="row"
            alignItems="center"
            wrap="nowrap"
            onCopy={e => {
              e.preventDefault();
              setNameCopied(moleculeTitle);
            }}
            className={classes.moleculeTitleLabel}
          >
            <Grid item className={classes.moleculeTitleText}>
              <RichTooltip
                path="code"
                values={{ code: getMainObservation()?.code?.replaceAll(`${target_on_name}-`, '') || '' }}
              >
                <span className={classes.moleculeTitleLabelMain}>{getMainObservation()?.code || ''}</span>
              </RichTooltip>
              <RichTooltip path="displayName" values={{ displayName: getDisplayName() || '' }}>
                <span className={classes.moleculeTitleLabelSub}>{getDisplayName()}</span>
              </RichTooltip>
            </Grid>
            <Grid item className={classes.posePropertiesIconSlot}>
              <IconButton
                className={popoverOpen ? classes.posePropertiesTableIconActive : classes.posePropertiesTableIcon}
                onClick={handleTablePopoverOpen}
              >
                <Assignment />
              </IconButton>
              <Popover
                id="pose-properties-popover"
                open={popoverOpen}
                anchorEl={anchorElTable}
                anchorOrigin={{
                  vertical: 'center',
                  horizontal: 'right'
                }}
                transformOrigin={{
                  vertical: 'center',
                  horizontal: 'left'
                }}
                onClose={handleTablePopoverClose}
                disableRestoreFocus
              >
                <TooltipPathProvider path="copyDataTable">
                  <CopyDataTable
                    mainObservation={getMainObservation()}
                    target_on_name={target_on_name}
                    data={data}
                    aliasOrder={aliasOrder}
                  />
                </TooltipPathProvider>
              </Popover>
            </Grid>
          </Grid>
        </Grid>
        {/* Tags */}
        <Grid
          item
          container
          justifyContent="flex-start"
          alignItems="flex-end"
          direction="column"
          className={classes.buttonsTagsWrapper}
          style={{
            flexBasis: detailLayout.controlsWidth,
            width: detailLayout.controlsWidth,
            maxWidth: detailLayout.controlsWidth
          }}
        >
          {/* Control Buttons A, L, C, V */}
          <Grid item style={{ width: '100%' }}>
            <Grid
              container
              direction="row"
              justifyContent="flex-start"
              alignItems="center"
              wrap="wrap"
              className={classes.contButtonsMargin}
            >
              <RichTooltip path="centerOn">
                <Grid item>
                  <Button
                    id={'detail-view-center-on-' + index}
                    variant="outlined"
                    className={classes.myLocationButton}
                    onClick={() => {
                      dispatch(centerOnLigandByMoleculeID(stage, getMainObservation()?.id));
                    }}
                    disabled={false || !isLigandOn}
                  >
                    <MyLocation className={classes.myLocation} />
                  </Button>
                </Grid>
              </RichTooltip>
              <RichTooltip path="all">
                <Grid item>
                  <Button
                    id={'detail-view-all-' + index}
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
                      setLoadingAll(true);
                      // always deselect all if are selected only some of options
                      selectedAll.current = hasSomeValuesOn || hasAllValuesOn ? false : !selectedAll.current;

                      setCalledFromAll();
                      onLigand(true);
                      onProtein(true);
                      onComplex(true);
                      setLoadingAll(false);
                    }}
                    disabled={groupMoleculeLPCControlButtonDisabled || moleculeLPCControlButtonDisabled}
                  >
                    A
                    {loadingAll && (
                      <CircularProgress
                        className={classNames(classes.buttonLoadingOverlay, {
                          [classes.buttonSelectedLoadingOverlay]: hasAllValuesOn || hasSomeValuesOn
                        })}
                      />
                    )}
                  </Button>
                </Grid>
              </RichTooltip>
              <RichTooltip
                path="ligand"
                values={{
                  ligandName: getMainObservation()?.code?.replaceAll(`${target_on_name}-`, '') || '',
                  smiles: getMainObservation()?.smiles
                }}
              >
                <Grid item>
                  <Button
                    id={'detail-view-sidechains-' + index}
                    variant="outlined"
                    className={classNames(classes.contColButton, {
                      [classes.contColButtonSelected]: isLigandOn
                    })}
                    onClick={() => onLigand()}
                    disabled={disableL || disableMoleculeNglControlButtons.ligand}
                  >
                    L
                    {loadingLigand && (
                      <CircularProgress
                        className={classNames(classes.buttonLoadingOverlay, {
                          [classes.buttonSelectedLoadingOverlay]: isLigandOn
                        })}
                      />
                    )}
                  </Button>
                </Grid>
              </RichTooltip>
              <RichTooltip
                path="sidechains"
                open={proteinTooltipOpen}
                onOpen={handleProteinTooltipOpen}
                onClose={handleProteinTooltipClose}
                disableHoverListener={proteinPopoverOpen}
                disableFocusListener={proteinPopoverOpen}
                disableTouchListener={proteinPopoverOpen}
              >
                <Grid item>
                  <Button
                    id={'detail-view-ligand-' + index}
                    variant="outlined"
                    className={classNames(classes.contColButton, {
                      [classes.contColButtonSelected]: isProteinOn || isArtefactChainOn
                    })}
                    onClick={() => onProtein(undefined, 'both')}
                    onContextMenu={handleProteinButtonContextMenu}
                    disabled={disableP || disableMoleculeNglControlButtons.protein}
                  >
                    P
                    {loadingProtein && (
                      <CircularProgress
                        className={classNames(classes.buttonLoadingOverlay, {
                          [classes.buttonSelectedLoadingOverlay]: isProteinOn || isArtefactChainOn
                        })}
                      />
                    )}
                  </Button>
                  <Popover
                    open={proteinPopoverOpen}
                    anchorEl={proteinPopoverAnchor}
                    onClose={handleProteinPopoverClose}
                    anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'center', horizontal: 'left' }}
                  >
                    <ProteinButtonPopover
                      moleculeId={getMainObservation()?.id}
                      proteinSettings={proteinSettings}
                      setProteinSettingsState={setProteinSettings}
                      toggleProtein={onProtein}
                      disabled={disableP || disableMoleculeNglControlButtons.protein}
                    />
                  </Popover>
                </Grid>
              </RichTooltip>
              <RichTooltip path="interactions">
                <Grid item>
                  {/* C stands for contacts now */}
                  <Button
                    id={'detail-view-interactions-' + index}
                    variant="outlined"
                    className={classNames(classes.contColButton, {
                      [classes.contColButtonSelected]: isComplexOn
                    })}
                    onClick={() => onComplex()}
                    disabled={disableC || disableMoleculeNglControlButtons.complex}
                  >
                    C
                    {loadingComplex && (
                      <CircularProgress
                        className={classNames(classes.buttonLoadingOverlay, {
                          [classes.buttonSelectedLoadingOverlay]: isComplexOn
                        })}
                      />
                    )}
                  </Button>
                </Grid>
              </RichTooltip>
              <RichTooltip path="surface">
                <Grid item>
                  <Button
                    id={'detail-view-surface-' + index}
                    variant="outlined"
                    className={classNames(classes.contColButton, {
                      [classes.contColButtonSelected]: isSurfaceOn
                    })}
                    onClick={() => onSurface()}
                    disabled={disableMoleculeNglControlButtons.surface}
                  >
                    S
                    {loadingSurface && (
                      <CircularProgress
                        className={classNames(classes.buttonLoadingOverlay, {
                          [classes.buttonSelectedLoadingOverlay]: isSurfaceOn
                        })}
                      />
                    )}
                  </Button>
                </Grid>
              </RichTooltip>
              {generateLastButtons()}
            </Grid>
          </Grid>
          {generateTagPopover()}
        </Grid>
      </Grid>
    );
  }
);
