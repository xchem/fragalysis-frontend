/**
 * Row in Hit navigator
 */

import React, { memo, useEffect, useState, useRef, useContext, useCallback, forwardRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Grid, makeStyles, Tooltip, IconButton, Popper, CircularProgress } from '@material-ui/core';
import { Panel } from '../../../common';
import { MyLocation, Warning, Assignment, AssignmentTurnedIn } from '@material-ui/icons';
import SVGInline from 'react-svg-inline';
import classNames from 'classnames';
import { VIEWS } from '../../../../constants/constants';
import { NGL_PARAMS, COMMON_PARAMS } from '../../../nglView/constants';
import { NglContext } from '../../../nglView/nglProvider';
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
  addDensityCustomView,
  removeDensity,
  addLigand,
  removeLigand,
  getMolImage,
  removeQuality,
  addQuality,
  getQualityInformation,
  getDensityMapData,
  withDisabledMoleculeNglControlButton,
  getCategoryById
} from '../redux/dispatchActions';
import {
  setSelectedAll,
  setDeselectedAll,
  setMoleculeForTagEdit,
  setTagEditorOpen,
  appendToMolListToEdit,
  removeFromMolListToEdit,
  setOpenObservationsDialog,
  setObservationsForLHSCmp,
  setIsLHSCmpTagEdit,
  setPoseIdForObservationsDialog,
  setObservationDialogAction
} from '../../../../reducers/selection/actions';
import { moleculeProperty } from '../helperConstants';
import { centerOnLigandByMoleculeID } from '../../../../reducers/ngl/dispatchActions';
import { SvgTooltip } from '../../../common';
import { MOL_TYPE } from '../redux/constants';
import { DensityMapsModal } from '../modals/densityMapsModal';
import { getRandomColor } from '../utils/color';
import { DEFAULT_TAG_COLOR, getAllTagsForLHSCmp, getAllTagsForMol } from '../../tags/utils/tagUtils';
import useClipboard from 'react-use-clipboard';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { Edit } from '@material-ui/icons';
import { DJANGO_CONTEXT } from '../../../../utils/djangoContext';
import { getFontColorByBackgroundColor } from '../../../../utils/colors';
import MoleculeSelectCheckbox from '../moleculeView/moleculeSelectCheckbox';
import { isAnyObservationTurnedOnForCmp } from '../../../../reducers/selection/selectors';
import { first } from 'lodash';

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
    margin: theme.spacing(1) / 2,
    width: 'inherit',
    marginTop: 0
    // border: 'solid 1px',
    // borderColor: theme.palette.background.divider,
    // borderStyle: 'solid none none none'
  },
  buttonsTagsWrapper: {
    border: 'solid 1px',
    borderColor: theme.palette.background.divider,
    borderStyle: 'solid solid solid none'
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
    border: 'solid 1px',
    borderColor: theme.palette.background.divider,
    borderStyle: 'solid none solid solid',
    width: 'inherit'
  },
  image: {
    border: 'solid 1px',
    borderColor: theme.palette.background.divider,
    borderStyle: 'solid solid solid none',
    position: 'relative'
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
    paddingBottom: theme.spacing(1) / 2
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
    paddingLeft: 2,
    // fontWeight: 400,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    lineHeight: '1.45',
    fontSize: '0.8rem',
    letterSpacing: '0.02em'
  },
  moleculeTitleLabelMain: {
    fontWeight: 'bold',
    fontSize: '0.9rem'
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
  }
}));

export const img_data_init = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="25px" height="25px"><g>
  <circle cx="50" cy="50" fill="none" stroke="#3f51b5" stroke-width="4" r="26" stroke-dasharray="150.79644737231007 52.26548245743669" transform="rotate(238.988 50 50)">
    <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="0.689655172413793s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform>
  </circle>  '</svg>`;

const ObservationCmpView = memo(
  forwardRef(
    (
      {
        imageHeight,
        imageWidth,
        data,
        index,
        setRef,
        L,
        P,
        C,
        S,
        D,
        D_C,
        Q,
        V,
        I,
        selected,
        disableL,
        disableP,
        disableC,
        observations
      },
      outsideRef
    ) => {
      // const [countOfVectors, setCountOfVectors] = useState('-');
      // const [cmpds, setCmpds] = useState('-');
      const selectedAll = useRef(false);
      const ref = useRef(null);
      const currentID = (data && data.id) || undefined;
      const classes = useStyles();

      const dispatch = useDispatch();
      const target_on_name = useSelector(state => state.apiReducers.target_on_name);
      const filter = useSelector(state => state.selectionReducers.filter);
      const [img_data, setImg_data] = useState(img_data_init);

      const viewParams = useSelector(state => state.nglReducers.viewParams);
      const tagList = useSelector(state => state.apiReducers.tagList);
      const tagCategories = useSelector(state => state.apiReducers.categoryList);
      const tagEditorOpen = useSelector(state => state.selectionReducers.tagEditorOpened);

      const isObservationDialogOpen = useSelector(state => state.selectionReducers.isObservationDialogOpen);

      const [tagEditModalOpenNew, setTagEditModalOpenNew] = useState(tagEditorOpen);

      const [hasMap, setHasMap] = useState(false);

      const { getNglView } = useContext(NglContext);
      const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

      const poseIdForObservationsDialog = useSelector(state => state.selectionReducers.poseIdForObservationsDialog);

      useEffect(() => {
        if (isObservationDialogOpen && poseIdForObservationsDialog === currentID) {
          dispatch(setObservationsForLHSCmp(observations));
          if (setRef) {
            setRef(ref.current);
          }
        }
      }, [observations, isObservationDialogOpen, dispatch, poseIdForObservationsDialog, currentID, setRef]);

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

      const getFirstObservationWithDensity = useCallback(() => {
        let result = null;

        for (const obs of observations) {
          if (obs?.proteinData?.diff_info || obs?.proteinData?.sigmaa_info || obs?.proteinData?.event_info) {
            result = obs;
            break;
          }
        }

        return result;
      }, [observations]);

      useEffect(() => {
        for (let i = 0; i < observations.length; i++) {
          const obs = observations[i];
          if (obs?.proteinData?.diff_info || obs?.proteinData?.sigmaa_info || obs?.proteinData?.event_info) {
            setHasMap(true);
            break;
          }
        }
      }, [observations]);

      const fragmentDisplayList = useSelector(state => state.selectionReducers.fragmentDisplayList);
      const proteinList = useSelector(state => state.selectionReducers.proteinList);
      const complexList = useSelector(state => state.selectionReducers.complexList);
      const surfaceList = useSelector(state => state.selectionReducers.surfaceList);
      const densityList = useSelector(state => state.selectionReducers.densityList);
      const densityListCustom = useSelector(state => state.selectionReducers.densityListCustom);
      const qualityList = useSelector(state => state.selectionReducers.qualityList);
      const vectorOnList = useSelector(state => state.selectionReducers.vectorOnList);

      const isLigandOn = isAtLeastOneObservationOnInList(fragmentDisplayList);
      const isProteinOn = isAtLeastOneObservationOnInList(proteinList);
      // C stands for contacts now
      const isComplexOn = isAtLeastOneObservationOnInList(complexList);
      const isSurfaceOn = isAtLeastOneObservationOnInList(surfaceList);
      const isDensityOn = isAtLeastOneObservationOnInList(densityList);
      const isDensityCustomOn = isAtLeastOneObservationOnInList(densityListCustom);
      const isQualityOn = isAtLeastOneObservationOnInList(qualityList);
      const isVectorOn = isAtLeastOneObservationOnInList(vectorOnList);
      const hasAdditionalInformation = I;

      const [isCopied, setCopied] = useClipboard(data.smiles, { successDuration: 5000 });

      const hasAllValuesOn = isLigandOn && isProteinOn && isComplexOn;
      const hasSomeValuesOn = !hasAllValuesOn && (isLigandOn || isProteinOn || isComplexOn);

      let warningIconVisible = viewParams[COMMON_PARAMS.warningIcon] === true && hasAdditionalInformation === true;
      let isWireframeStyle = viewParams[NGL_PARAMS.contour_DENSITY];

      const disableMoleculeNglControlButtons =
        useSelector(state => state.previewReducers.molecule.disableNglControlButtons[currentID]) || {};

      const colourToggle = getRandomColor(getMainObservation());

      const getCalculatedProps = useCallback(
        () => [
          // { name: moleculeProperty.mw, value: data.mw ?? 0 },
          // { name: moleculeProperty.logP, value: data.logp ?? 0 },
          // { name: moleculeProperty.tpsa, value: data.tpsa ?? 0 },
          // { name: moleculeProperty.ha, value: data.ha ?? 0 },
          // { name: moleculeProperty.hacc, value: data.hacc ?? 0 },
          // { name: moleculeProperty.hdon, value: data.hdon ?? 0 },
          // { name: moleculeProperty.rots, value: data.rots ?? 0 },
          // { name: moleculeProperty.rings, value: data.rings ?? 0 },
          // { name: moleculeProperty.velec, value: data.velec ?? 0 }
          //   { name: moleculeProperty.vectors, value: countOfVectors },
          //   { name: moleculeProperty.cpd, value: cmpds }
        ],
        [data.ha, data.hacc, data.hdon, data.logp, data.mw, data.rings, data.rots, data.tpsa, data.velec]
      );

      const [densityModalOpen, setDensityModalOpen] = useState(false);
      const [moleculeTooltipOpen, setMoleculeTooltipOpen] = useState(false);
      const [tagPopoverOpen, setTagPopoverOpen] = useState(null);

      const isAnyObservationOn = useSelector(state =>
        isAnyObservationTurnedOnForCmp(state, observations?.map(obs => obs.id) || [])
      );

      const moleculeImgRef = useRef(null);

      const open = tagPopoverOpen ? true : false;

      useEffect(() => {
        setTagEditModalOpenNew(tagEditorOpen);
      }, [tagEditorOpen]);

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

      /**
       * Get ConformerSites tags for render and modify for larger set
       */
      const getConformerSites = useCallback(() => {
        const conformerSitesCategory = getConformerSitesTagCategory();
        let conformerSites = conformerSitesCategory
          ? getAllTagsForLHSCmp(observations, tagList, []).filter(tag => tag.category === conformerSitesCategory.id)
          : [];

        if (conformerSites.length > 3) {
          conformerSites = conformerSites.slice(0, 2);
          conformerSites.push({ tag_prefix: '3+', color: 'orange' });
        }
        return conformerSites;
      }, [getConformerSitesTagCategory, observations, tagList]);

      /**
       * Get CanonSites tag for render
       */
      const getCanonSitesTag = useCallback(() => {
        const canonSitesCategory = getCanonSitesTagCategory();
        const canonSites = canonSitesCategory
          ? getAllTagsForLHSCmp(observations, tagList, []).filter(tag => tag.category === canonSitesCategory.id)
          : [];
        return canonSites.length > 0 ? canonSites[0] : {};
      }, [getCanonSitesTagCategory, observations, tagList]);

      const generateTagPopover = useCallback(() => {
        // console.log('generateTagPopover');
        const allTagsData = getAllTagsForLHSCmp(observations, tagList, tagCategories);
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
        const popperPadding = 250; // allTagsLength > 1 ? 250 : 420;

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
                            if (tagEditModalOpenNew) {
                              setTagEditModalOpenNew(false);
                              dispatch(setTagEditorOpen(!tagEditModalOpenNew));
                              dispatch(setMoleculeForTagEdit([]));
                              dispatch(setIsLHSCmpTagEdit(false));
                            } else {
                              dispatch(setIsLHSCmpTagEdit(true));
                              setTagEditModalOpenNew(true);
                              dispatch(setMoleculeForTagEdit(observations.map(obs => obs.id)));
                              dispatch(setTagEditorOpen(true));
                              if (setRef) {
                                setRef(ref.current);
                              }
                            }
                          }}
                          style={{ padding: 0, paddingBottom: 3, marginRight: 5, position: 'right' }}
                        // className={classes.editIcon}
                        >
                          <Tooltip title="Edit tag" className={classes.editButtonIcon}>
                            <Edit />
                          </Tooltip>
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
                          if (tagEditModalOpenNew) {
                            setTagEditModalOpenNew(false);
                            dispatch(setTagEditorOpen(!tagEditModalOpenNew));
                            dispatch(setMoleculeForTagEdit([]));
                            dispatch(setIsLHSCmpTagEdit(false));
                          } else {
                            dispatch(setIsLHSCmpTagEdit(true));
                            setTagEditModalOpenNew(true);
                            dispatch(setMoleculeForTagEdit(observations.map(obs => obs.id)));
                            dispatch(setTagEditorOpen(true));
                            if (setRef) {
                              setRef(ref.current);
                            }
                          }
                        }}
                        style={{ padding: 0, paddingBottom: 3, paddingRight: 5, cursor: 'pointer' }}
                      // className={classes.editIcon}
                      >
                        <Tooltip title="Edit tags" className={classes.editButtonIcon}>
                          <Edit />
                        </Tooltip>
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
                <Popper open={open} placement="right-start" anchorEl={tagPopoverOpen} style={{ display: 'flex' }}>
                  <Panel
                    secondaryBackground
                    className={classes.paper}
                    style={{
                      background: '',
                      width: '320px',
                      display: 'flex',
                      transform: 'translate(' + popperPadding + 'px, -10%)'
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
                if (tagEditModalOpenNew) {
                  setTagEditModalOpenNew(false);
                  dispatch(setTagEditorOpen(!tagEditModalOpenNew));
                  dispatch(setMoleculeForTagEdit([]));
                  dispatch(setIsLHSCmpTagEdit(false));
                } else {
                  dispatch(setIsLHSCmpTagEdit(true));
                  setTagEditModalOpenNew(true);
                  dispatch(setMoleculeForTagEdit(observations.map(obs => obs.id)));
                  dispatch(setTagEditorOpen(true));
                  if (setRef) {
                    setRef(ref.current);
                  }
                }
              }}
              style={{ padding: 0, paddingBottom: 8, paddingRight: 5, cursor: 'pointer' }}
            // className={classes.editIcon}
            >
              <Tooltip title="Edit tags" className={classes.editButtonIcon}>
                <Edit />
              </Tooltip>
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
        observations,
        open,
        resolveTagBackgroundColor,
        resolveTagForegroundColor,
        setRef,
        tagCategories,
        tagEditModalOpenNew,
        tagEditorOpen,
        tagList,
        tagPopoverOpen
      ]);

      // componentDidMount
      useEffect(() => {
        const obs = getMainObservation();
        dispatch(getMolImage(obs.id, MOL_TYPE.HIT, imageWidth, imageHeight)).then(i => {
          setImg_data(i);
        });
      }, [data.id, data.smiles, imageHeight, imageWidth, dispatch, getMainObservation]);

      useEffect(() => {
        dispatch(getQualityInformation(data));
      }, [data, dispatch]);

      const svg_image = (
        <SVGInline
          component="div"
          svg={img_data}
          // className={classes.imageMargin}
          style={{
            height: `${imageHeight}px`,
            width: `${imageWidth}px`
          }}
        />
      );
      // Here add the logic that updates this based on the information
      // const refinement = <Label bsStyle="success">{"Refined"}</Label>;
      const selected_style = {
        backgroundColor: colourToggle
      };
      const not_selected_style = {};
      const current_style =
        isLigandOn || isProteinOn || isComplexOn || isSurfaceOn || isDensityOn || isVectorOn
          ? selected_style
          : not_selected_style;

      const addNewLigand = (skipTracking = false) => {
        // if (selectMoleculeSite) {
        //   selectMoleculeSite(data.site);
        // }
        dispatch(
          withDisabledMoleculeNglControlButton(currentID, 'ligand', async () => {
            const firstObs = getMainObservation();
            if (firstObs) {
              const color = getRandomColor(firstObs);
              await dispatch(addLigand(stage, firstObs, color, false, true, skipTracking));
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

      const [loadingProtein, setLoadingProtein] = useState(false);

      const onProtein = calledFromSelectAll => {
        setLoadingProtein(true);
        if (calledFromSelectAll === true && selectedAll.current === true) {
          if (isProteinOn === false) {
            addNewProtein(calledFromSelectAll);
          }
        } else if (calledFromSelectAll && selectedAll.current === false) {
          removeSelectedProtein(calledFromSelectAll);
        } else if (!calledFromSelectAll) {
          if (isProteinOn === false) {
            addNewProtein();
          } else {
            removeSelectedProtein();
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
        const firstObs = getFirstObservationWithDensity();
        dispatch(removeDensity(stage, firstObs, colourToggle, false));
      };

      const addNewDensityCustom = async () => {
        dispatch(
          withDisabledMoleculeNglControlButton(currentID, 'density', async () => {
            const firstObs = getFirstObservationWithDensity();
            await dispatch(addDensityCustomView(stage, firstObs, colourToggle, isWireframeStyle));
          })
        );
      };

      const addNewDensity = async () => {
        dispatch(
          withDisabledMoleculeNglControlButton(currentID, 'ligand', async () => {
            await dispatch(
              withDisabledMoleculeNglControlButton(currentID, 'density', async () => {
                const firstObs = getFirstObservationWithDensity();
                await dispatch(addDensity(stage, firstObs, colourToggle, isWireframeStyle));
              })
            );
          })
        );
      };

      const [loadingDensity, setLoadingDensity] = useState(false);

      const onDensity = () => {
        setLoadingDensity(true);
        if (isDensityOn === false && isDensityCustomOn === false) {
          const firstObs = getFirstObservationWithDensity();
          dispatch(getDensityMapData(firstObs)).then(r => {
            if (r) {
              dispatch(setDensityModalOpen(true));
            } else {
              addNewDensity();
            }
          });
        } else if (isDensityCustomOn === false) {
          addNewDensityCustom();
        } else {
          removeSelectedDensity();
        }
        setLoadingDensity(false);
      };

      const removeSelectedQuality = () => {
        const selectedObs = getAllObservationsSelectedInList(qualityList);
        for (const obs of selectedObs) {
          dispatch(removeQuality(stage, obs, colourToggle));
        }
      };

      const addNewQuality = () => {
        dispatch(
          withDisabledMoleculeNglControlButton(currentID, 'ligand', async () => {
            const firstObs = getMainObservation();
            if (firstObs) {
              const color = getRandomColor(firstObs);
              await dispatch(addQuality(stage, firstObs, color));
            }
          })
        );
      };

      const onQuality = () => {
        if (isQualityOn === false) {
          addNewQuality();
        } else {
          removeSelectedQuality();
        }
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

      /**
       * Check if given molecule is matching current filter
       * @param Object item - item.name is attribute name, item.value is its value
       * @return boolean
       */
      const isMatchingValue = item => {
        let match = false;
        if (!(item.value < filter.filter[item.name].minValue || item.value > filter.filter[item.name].maxValue)) {
          match = true;
        }
        return match;
      };

      /**
       * Get css class for value regarding to its filter match
       * @param Object item - item.name is attribute name, item.value is its value
       * @return string - css class
       */
      const getValueMatchingClass = item => {
        let cssClass = '';
        if (filter && filter.predefined !== 'none') {
          cssClass = isMatchingValue(item) ? classes.matchingValue : classes.unmatchingValue;
        }
        return cssClass;
      };

      const scrollToElement = element => {
        element.scrollIntoView({
          behavior: 'auto',
          block: 'nearest',
          inline: 'nearest'
        });
      };

      // let moleculeTitle = data?.code.replace(new RegExp(`${target_on_name}-`, 'i'), '');
      // let moleculeTitle = data.code;
      let moleculeTitle = data?.code.replaceAll(`${target_on_name}-`, '');
      if (observations?.length > 0 && observations[0].compound_code) {
        moleculeTitle += ` - ${observations[0].compound_code}`;
      }
      const moleculeTitleTruncated = moleculeTitle.substring(0, 20) + (moleculeTitle.length > 20 ? '...' : '');

      const [isNameCopied, setNameCopied] = useClipboard(moleculeTitle, { successDuration: 5000 });

      const moleculeLPCControlButtonDisabled = ['ligand', 'protein', 'complex'].some(
        type => disableMoleculeNglControlButtons[type]
      );

      const groupMoleculeLPCControlButtonDisabled = disableL || disableP || disableC;

      return (
        <>
          <Grid
            ref={node => {
              if (outsideRef) {
                outsideRef(data.id, node);
              }
              ref.current = node;
            }}
            container
            justifyContent="space-between"
            direction="row"
            className={classNames(classes.container, {
              [classes.siteOpenObservations]: poseIdForObservationsDialog === data.id && isObservationDialogOpen
            })}
            wrap="nowrap"
          // ref={ref}
          >
            {/* Site number */}
            <Grid item container justifyContent="space-between" direction="column" className={classes.site}>
              <Grid item>
                <MoleculeSelectCheckbox
                  moleculeID={currentID}
                  checked={selected}
                  className={classes.checkbox}
                  size="small"
                  color="primary"
                  onChange={e => {
                    const result = e.target.checked;
                    if (result) {
                      if (observations?.length > 0) {
                        const mainObs = getMainObservation();
                        mainObs && dispatch(appendToMolListToEdit(mainObs.id));
                      }
                      // dispatch(appendToObsCmpListToEdit(currentID));
                    } else {
                      observations?.forEach(obs => {
                        dispatch(removeFromMolListToEdit(obs.id));
                      });
                      // dispatch(removeFromObsCmpListToEdit(currentID));
                    }
                  }}
                />
              </Grid>
              <Grid item className={classes.rank}>
                {index + 1}.
              </Grid>
            </Grid>
            <Grid item container className={classes.detailsCol} justifyContent="space-evenly" direction="column" xs={2}>
              {/* Title label */}
              <Tooltip title={getMainObservation()?.prefix_tooltip ?? '-'} placement="bottom-start">
                <Grid
                  item
                  onCopy={e => {
                    e.preventDefault();
                    setNameCopied(moleculeTitle);
                  }}
                  className={classes.moleculeTitleLabel}
                >
                  <span className={classes.moleculeTitleLabelMain}>
                    {getMainObservation()?.code.replaceAll(`${target_on_name}-`, '')}
                  </span>
                  <br />
                  {data?.main_site_observation_cmpd_code}
                </Grid>
              </Tooltip>
              {/* "Filtered"/calculated props
            <Grid item>
              <Grid
                item
                container
                justifyContent="flex-start"
                alignItems="flex-end"
                direction="row"
                wrap="nowrap"
                className={classes.fullHeight}
              >
                {getCalculatedProps().map(item => (
                  <Tooltip title={item.name} key={item.name}>
                    <Grid item className={classNames(classes.rightBorder, getValueMatchingClass(item))}>
                      {item.name === moleculeProperty.mw && Math.round(item.value)}
                      {item.name === moleculeProperty.logP && Math.round(item.value)}
                      {item.name === moleculeProperty.tpsa && Math.round(item.value)}
                      {item.name !== moleculeProperty.mw &&
                        item.name !== moleculeProperty.logP &&
                        item.name !== moleculeProperty.tpsa &&
                        item.value}
                    </Grid>
                  </Tooltip>
                ))}
              </Grid>
            </Grid> */}
            </Grid>
            {/* Tags */}
            <Grid
              item
              container
              justifyContent="flex-start"
              alignItems="flex-end"
              direction="column"
              className={classes.buttonsTagsWrapper}
            >
              {/* Control Buttons A, L, C, V */}
              <Grid item>
                <Grid
                  container
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="center"
                  wrap="nowrap"
                  className={classes.contButtonsMargin}
                >
                  <Tooltip title="centre on">
                    <Grid item>
                      <Button
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
                  </Tooltip>
                  <Tooltip title="all">
                    <Grid item>
                      <Button
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
                  </Tooltip>
                  <Tooltip title="ligand">
                    <Grid item>
                      <Button
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
                  </Tooltip>
                  <Tooltip title="sidechains">
                    <Grid item>
                      <Button
                        variant="outlined"
                        className={classNames(classes.contColButton, {
                          [classes.contColButtonSelected]: isProteinOn
                        })}
                        onClick={() => onProtein()}
                        disabled={disableP || disableMoleculeNglControlButtons.protein}
                      >
                        P
                        {loadingProtein && (
                          <CircularProgress
                            className={classNames(classes.buttonLoadingOverlay, {
                              [classes.buttonSelectedLoadingOverlay]: isProteinOn
                            })}
                          />
                        )}
                      </Button>
                    </Grid>
                  </Tooltip>
                  <Tooltip title="interactions">
                    <Grid item>
                      {/* C stands for contacts now */}
                      <Button
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
                  </Tooltip>
                  <Tooltip title="surface">
                    <Grid item>
                      <Button
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
                  </Tooltip>
                  <Tooltip title="electron density">
                    <Grid item>
                      <Button
                        variant="outlined"
                        className={classNames(
                          classes.contColButton,
                          {
                            [classes.contColButtonHalfSelected]: isDensityOn && !isDensityCustomOn
                          },
                          {
                            [classes.contColButtonSelected]: isDensityCustomOn
                          }
                        )}
                        onClick={() => onDensity()}
                        disabled={!hasMap || disableMoleculeNglControlButtons.density}
                      >
                        D
                        {loadingDensity && (
                          <CircularProgress
                            className={classNames(classes.buttonLoadingOverlay, {
                              [classes.buttonSelectedLoadingOverlay]: isDensityOn || isDensityCustomOn
                            })}
                          />
                        )}
                      </Button>
                    </Grid>
                  </Tooltip>
                  <Tooltip title="vectors">
                    <Grid item>
                      <Button
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
                  </Tooltip>
                </Grid>
              </Grid>
              {generateTagPopover()}
            </Grid>
            {/* Image */}
            <div
              style={{
                ...current_style,
                width: imageWidth
              }}
              className={classes.image}
              onMouseEnter={() => setMoleculeTooltipOpen(true)}
              onMouseLeave={() => setMoleculeTooltipOpen(false)}
              ref={moleculeImgRef}
            >
              {svg_image}
              <div className={classes.imageActions}>
                {moleculeTooltipOpen && (
                  <Tooltip title={!isCopied ? 'Copy smiles' : 'Copied'}>
                    <IconButton className={classes.copyIcon} onClick={setCopied}>
                      {!isCopied ? <Assignment /> : <AssignmentTurnedIn />}
                    </IconButton>
                  </Tooltip>
                )}
                {warningIconVisible && (
                  <Tooltip title="Warning">
                    <IconButton className={classes.warningIcon} onClick={() => onQuality()}>
                      <Warning />
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* CanonSites */}
            <Grid item xs container direction="column" justifyContent="center" alignItems="stretch" wrap="nowrap">
              <Tooltip
                title={<div style={{ whiteSpace: 'pre-line' }}>CanonSite - {getCanonSitesTag().upload_name}</div>}
              >
                <Grid
                  item
                  xs
                  className={classNames(classes.contColMenu, classes.contColButtonMenu)}
                  style={{
                    backgroundColor: resolveTagBackgroundColor(getCanonSitesTag()),
                    color: resolveTagForegroundColor(getCanonSitesTag())
                  }}
                >
                  {getCanonSitesTag().tag_prefix}
                </Grid>
              </Tooltip>
            </Grid>
            {/* ConformerSites */}
            <Grid item xs container direction="column" justifyContent="flex-start" alignItems="stretch" wrap="nowrap">
              {getConformerSites().map((conformerSite, i, sites) => (
                <Tooltip
                  key={conformerSite.id + i}
                  title={<div style={{ whiteSpace: 'pre-line' }}>ConformerSite - {conformerSite.upload_name}</div>}
                >
                  <Grid
                    item
                    xs
                    className={classNames(classes.contColMenu, classes.contColButtonMenu, {
                      [classes.smallConformerSite]: sites.length >= 3
                    })}
                    style={{
                      backgroundColor: resolveTagBackgroundColor(conformerSite),
                      color: resolveTagForegroundColor(conformerSite),
                      borderBottom: i === sites.length - 1 ? 1 : 0,
                      borderRight: 0
                    }}
                  >
                    {conformerSite.tag_prefix.replace(getCanonSitesTag().tag_prefix, '')}
                  </Grid>
                </Tooltip>
              ))}
            </Grid>
            {/* Observations*/}
            <Grid item xs container direction="column" justifyContent="center" alignItems="stretch" wrap="nowrap">
              <Grid item xs>
                <Tooltip title={<div style={{ whiteSpace: 'pre-line' }}>Show Observations</div>}>
                  <Button
                    variant="outlined"
                    className={classNames(classes.contColButtonMenu, {
                      [classes.contColButtonMenuSelected]: isAnyObservationOn && observations.length > 1
                    })}
                    style={{
                      backgroundColor: `color-mix(in lch, lightgrey, orange ${(observations.length > 10
                        ? 10
                        : observations.length) * 10}%)`
                    }}
                    onClick={() => {
                      // setLoadingInspiration(true);

                      // do not close modal on pose change
                      if (!isObservationDialogOpen || poseIdForObservationsDialog !== data.id) {
                        dispatch(setObservationsForLHSCmp(observations));
                      }
                      if (
                        poseIdForObservationsDialog !== data.id ||
                        poseIdForObservationsDialog === 0 ||
                        (poseIdForObservationsDialog === data.id && !isObservationDialogOpen)
                      ) {
                        dispatch(setOpenObservationsDialog(true));
                        dispatch(setObservationDialogAction(data.id, observations, true, 0, []));
                      } else {
                        dispatch(setOpenObservationsDialog(false));
                        dispatch(setObservationDialogAction(0, [], false, data.id, observations));
                      }
                      dispatch(setPoseIdForObservationsDialog(data.id));

                      if (setRef) {
                        setRef(ref.current);
                      }
                      // setLoadingInspiration(false);
                    }}
                    disabled={observations.length <= 0}
                  >
                    {observations?.length}
                  </Button>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
          <SvgTooltip
            open={moleculeTooltipOpen}
            anchorEl={moleculeImgRef.current}
            imgData={img_data}
            width={imageWidth}
            height={imageHeight}
          />
          <DensityMapsModal
            openDialog={densityModalOpen}
            setOpenDialog={setDensityModalOpen}
            data={getFirstObservationWithDensity()}
            setDensity={addNewDensity}
            isQualityOn={isQualityOn}
          />
        </>
      );
    }
  )
);

ObservationCmpView.displayName = 'ObservationCmpView';
export default ObservationCmpView;
