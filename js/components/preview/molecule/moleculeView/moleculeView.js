/**
 * Created by abradley on 14/03/2018.
 */

import React, { memo, useEffect, useState, useRef, useContext, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Grid, makeStyles, Tooltip, IconButton, Popper, CircularProgress } from '@material-ui/core';
import { Panel } from '../../../common';
import { MyLocation, Warning, Assignment, AssignmentTurnedIn } from '@material-ui/icons';
import SVGInline from 'react-svg-inline';
import classNames from 'classnames';
import { PLURAL_TO_SINGULAR, VIEWS } from '../../../../constants/constants';
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
  getProteinData,
  withDisabledMoleculeNglControlButton,
  getCategoryById
} from '../redux/dispatchActions';
import {
  setSelectedAll,
  setDeselectedAll,
  setMoleculeForTagEdit,
  setTagEditorOpenObs,
  appendToMolListToEdit,
  removeFromMolListToEdit
} from '../../../../reducers/selection/actions';
import { moleculeProperty } from '../helperConstants';
import { centerOnLigandByMoleculeID } from '../../../../reducers/ngl/dispatchActions';
import { SvgTooltip } from '../../../common';
import { MOL_TYPE } from '../redux/constants';
import { DensityMapsModal } from '../modals/densityMapsModal';
import { getRandomColor } from '../utils/color';
import { DEFAULT_TAG_COLOR, getAllTagsForCategories, getAllTagsForLHSCmp, getAllTagsForMol, getAllTagsForObservation, getAllTagsForObservationPopover } from '../../tags/utils/tagUtils';
import MoleculeSelectCheckbox from './moleculeSelectCheckbox';
import useClipboard from 'react-use-clipboard';
import Typography from '@mui/material/Typography';
import { Edit } from '@material-ui/icons';
import { DJANGO_CONTEXT } from '../../../../utils/djangoContext';
import { getFontColorByBackgroundColor } from '../../../../utils/colors';
import { api, METHOD } from '../../../../utils/api';
import { base_url } from '../../../routes/constants';

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(1) / 4,
    color: 'black'
    // height: 54
  },
  containerHeight: {
    height: 54
  },
  contColButtonMenu: {
    // ...theme.typography.button,
    height: '100%',
    width: '100%',
    minWidth: '20px',
    // paddingLeft: theme.spacing(1) / 4,
    // paddingRight: theme.spacing(1) / 4,
    // paddingBottom: 0,
    // paddingTop: 0,
    fontWeight: 'bold',
    fontSize: 12,
    borderRadius: 0,
    borderColor: theme.palette.background.divider,
    borderLeft: '1px solid',
    backgroundColor: 'orange',
    alignContent: 'center',
    textAlign: 'center',
    '&:hover': {
      // backgroundColor: 'orange'
      // color: theme.palette.primary.contrastText
    },
    '&:disabled': {
      borderRadius: 0,
      borderColor: 'darkorange'
    }
  },
  contButtonsMargin: {
    margin: theme.spacing(1) / 2,
    width: 'inherit',
    marginTop: 0
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
  detailsCol: {
    border: 'solid 1px',
    borderColor: theme.palette.background.divider,
    borderStyle: 'solid solid solid solid',
    minWidth: 327
    // width: 'inherit'
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
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    lineHeight: '1.45',
    // fontWeight: 500,
    fontSize: '0.8rem',
    letterSpacing: '0.02em'
  },
  moleculeTitleLabelMain: {
    fontWeight: 'bold',
    fontSize: '0.9rem'
  },
  moleculeTitleLabelMainObs: {
    fontWeight: 'bolder',
    // fontStyle: 'italic',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted'
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
  categoryCell: {
    padding: '4px 8px',
    fontWeight: 'bold',
    textWrap: 'nowrap',
    fontSize: 12
  }
}));

export const img_data_init = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="25px" height="25px"><g>
  <circle cx="50" cy="50" fill="none" stroke="#3f51b5" stroke-width="4" r="26" stroke-dasharray="150.79644737231007 52.26548245743669" transform="rotate(238.988 50 50)">
    <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="0.689655172413793s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform>
  </circle>  '</svg>`;

const MoleculeView = memo(
  ({
    imageHeight,
    imageWidth,
    data,
    searchMoleculeGroup,
    index,
    previousItemData,
    nextItemData,
    setRef,
    removeSelectedTypes,
    L,
    P,
    C,
    S,
    D,
    D_C,
    Q,
    V,
    I,
    isTagEditorInvokedByMolecule,
    isTagEditorOpen,
    selected,
    disableL,
    disableP,
    disableC,
    hideImage,
    showExpandedView,
    headerWidths,
    setHeaderWidthsHandler
  }) => {
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
    const tagEditorOpenObs = useSelector(state => state.selectionReducers.tagEditorOpenedObs);
    const tagCategories = useSelector(state => state.apiReducers.categoryList);

    const [tagEditModalOpenNew, setTagEditModalOpenNew] = useState(tagEditorOpenObs);

    const { getNglView } = useContext(NglContext);
    const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

    const isLigandOn = L;
    const isProteinOn = P;
    const isComplexOn = C;
    const isSurfaceOn = S;
    const isDensityOn = D;
    const isDensityCustomOn = D_C;
    const isQualityOn = Q;
    const isVectorOn = V;
    const hasAdditionalInformation = I;

    const allMolecules = useSelector(state => state.apiReducers.all_mol_lists);
    const allPoses = useSelector(state => state.apiReducers.lhs_compounds_list);

    //for some reason when tags are changed for this molecule the data are stale so I need to retrieve them from list of all molecules
    data = allMolecules.filter(mol => mol.id === data.id)[0];

    const [isCopied, setCopied] = useClipboard(data.smiles, { successDuration: 5000 });

    const hasAllValuesOn = isLigandOn && isProteinOn && isComplexOn;
    const hasSomeValuesOn = !hasAllValuesOn && (isLigandOn || isProteinOn || isComplexOn);

    let warningIconVisible = viewParams[COMMON_PARAMS.warningIcon] === true && hasAdditionalInformation === true;
    let isWireframeStyle = viewParams[NGL_PARAMS.contour_DENSITY];

    const disableMoleculeNglControlButtons =
      useSelector(state => state.previewReducers.molecule.disableNglControlButtons[currentID]) || {};

    const colourToggle = getRandomColor(data);

    const pose = useMemo(() => allPoses.find(p => p.id === data.pose), [allPoses, data]);

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
    const [centroidRes, setCentroidRes] = useState('');

    const moleculeImgRef = useRef(null);

    const open = tagPopoverOpen ? true : false;

    let proteinData = data?.proteinData;

    const hasMap = proteinData?.diff_info || proteinData?.event_info || proteinData?.sigmaa_info;

    useEffect(() => {
      setTagEditModalOpenNew(tagEditorOpenObs);
    }, [tagEditorOpenObs]);

    const XCA_TAGS_CATEGORIES = ['CanonSites', 'ConformerSites', 'Quatassemblies', 'Crystalforms', 'CrystalformSites'];
    const XCA_TAGS_CATEGORIES_EXPANDED = ['Quatassemblies', 'ConformerSites', 'Crystalforms', 'CrystalformSites', 'CanonSites'];

    useEffect(() => {
      api({
        url: `${base_url}/api/canon_site_confs/`,
        method: METHOD.GET
      })
        .then(resp => {
          const canonSiteConf = resp.data.results.find(canonSiteConf => canonSiteConf.id === data.canon_site_conf);
          if (canonSiteConf) {
            api({
              url: `${base_url}/api/canon_sites/`,
              method: METHOD.GET
            })
              .then(resp => {
                const canonSite = resp.data.results.find(canonSite => canonSite.id === canonSiteConf.canon_site);
                if (canonSite) {
                  setCentroidRes(canonSite.centroid_res);
                } else {
                  console.log('there is not any matching canonSite object with ' + canonSiteConf.canon_site + ' id');
                  setCentroidRes('');
                }
              })
              .catch(err => {
                console.log('error fetching centroid_res from canon_sites', err);
                setCentroidRes('');
              });
          } else {
            console.log('there is not any matching canonSiteConf object with ' + data.canon_site_conf + ' id');
            setCentroidRes('');
          }
        })
        .catch(err => {
          console.log('error fetching centroid_res from canon_sites', err);
          setCentroidRes('');
        });
    }, [data.canon_site_conf]);

    useEffect(() => {
      if (showExpandedView) {
        setHeaderWidthsHandler(centroidRes, 'CentroidRes');
        setHeaderWidthsHandler(data.longcode, 'LongCode');
        XCA_TAGS_CATEGORIES.forEach(tagCategory => {
          setHeaderWidthsHandler(getTagLabel(tagCategory), tagCategory);
        })
      }
    }, [showExpandedView, getTagType, getTagLabel, centroidRes, data.longcode, setHeaderWidthsHandler, XCA_TAGS_CATEGORIES]);

    const handlePopoverOpen = event => {
      setTagPopoverOpen(event.currentTarget);
    };

    const handlePopoverClose = () => {
      setTagPopoverOpen(null);
    };

    const getDataForTagsTooltip = () => {
      const assignedTags = getAllTagsForMol(data, tagList);
      return assignedTags;
    };

    const resolveTagBackgroundColor = tag => {
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
    };

    const resolveTagForegroundColor = tag => {
      const bgColor = resolveTagBackgroundColor(tag);
      return getFontColorByBackgroundColor(bgColor);
    };

    const getAllTags = useCallback(() => getAllTagsForCategories(data, tagList, tagCategories), [data, tagList, tagCategories]);

    /**
     * Get tag for render
     */
    const getTagType = useCallback((type) => {
      // TODO change this to null maybe?
      const defaultTagObject = { tag_prefix: '-', color: 'orange', upload_name: '-' };
      const tagCategory = tagCategories.find(tag => tag.category === type);
      const tagObject = tagCategory ? getAllTags().find(tag => tag.category === tagCategory.id) : defaultTagObject;
      return tagObject ?? defaultTagObject;
    }, [getAllTags, tagCategories]);

    const generateTagPopover = () => {
      // const allData = getAllTagsForObservation(data, tagList, tagCategories);
      const allData = getAllTagsForObservationPopover(data, tagList, tagCategories);
      // const sortedData = [...allData].sort((a, b) => a.tag.localeCompare(b.tag));

      const modifiedObjects = allData.map(obj => {
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
      const popperPadding = 150; // allTagsLength > 1 ? 250 : 420;

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
                style={{ width: '50px', marginBottom: 3 }}
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
                    <></>
                  )
                )}
                {DJANGO_CONTEXT['username'] === 'NOT_LOGGED_IN' ? (
                  <></>
                ) : (
                  <div style={{ width: '10px' }}>
                    <Grid item xs={1}>
                      <IconButton
                        color={'inherit'}
                        disabled={!modifiedObjects}
                        onClick={() => {
                          if (tagEditModalOpenNew) {
                            setTagEditModalOpenNew(false);
                            dispatch(setTagEditorOpenObs(!tagEditModalOpenNew));
                            dispatch(setMoleculeForTagEdit([]));
                          } else {
                            setTagEditModalOpenNew(true);
                            dispatch(setMoleculeForTagEdit([data.id]));
                            dispatch(setTagEditorOpenObs(true));
                            if (setRef) {
                              setRef(ref.current);
                            }
                          }
                        }}
                        style={{ padding: 0, paddingBottom: 3, marginRight: 5, position: 'right' }}
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
                style={{ marginBottom: 3 }}
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
                      <></>
                    )
                  )}
                </div>
                {DJANGO_CONTEXT['username'] === 'NOT_LOGGED_IN' ? (
                  <></>
                ) : (
                  <IconButton
                    color={'inherit'}
                    disabled={!modifiedObjects}
                    onClick={() => {
                      if (tagEditModalOpenNew) {
                        setTagEditModalOpenNew(false);
                        dispatch(setTagEditorOpenObs(!tagEditModalOpenNew));
                        dispatch(setMoleculeForTagEdit([]));
                      } else {
                        setTagEditModalOpenNew(true);
                        dispatch(setMoleculeForTagEdit([data.id]));
                        dispatch(setTagEditorOpenObs(true));
                        if (setRef) {
                          setRef(ref.current);
                        }
                      }
                    }}
                    style={{ padding: 0, paddingBottom: 3, marginRight: 5, cursor: 'pointer' }}
                  >
                    <Tooltip title="Edit tags" className={classes.editButtonIcon}>
                      <Edit />
                    </Tooltip>
                  </IconButton>
                )}
              </Grid>
            )}
          </Typography>
          {tagEditorOpenObs === false ? (
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
            <></>
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
                dispatch(setTagEditorOpenObs(!tagEditModalOpenNew));
                dispatch(setMoleculeForTagEdit([]));
              } else {
                setTagEditModalOpenNew(true);
                dispatch(setMoleculeForTagEdit([data.id]));
                dispatch(setTagEditorOpenObs(true));
                if (setRef) {
                  setRef(ref.current);
                }
              }
            }}
            style={{ padding: 0, paddingRight: 5, marginTop: -8, cursor: 'pointer' }}
          >
            <Tooltip title="Edit tags" className={classes.editButtonIcon}>
              <Edit />
            </Tooltip>
          </IconButton>
        </Grid>
      );
    };

    // componentDidMount
    useEffect(() => {
      dispatch(getMolImage(data.id, MOL_TYPE.HIT, imageWidth, imageHeight)).then(i => {
        setImg_data(i);
      });
    }, [data.id, data.smiles, imageHeight, imageWidth, dispatch]);

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
          await dispatch(addLigand(stage, data, colourToggle, false, true, skipTracking));
        })
      );
    };

    const removeSelectedLigand = (skipTracking = false) => {
      dispatch(removeLigand(stage, data, skipTracking));
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
      dispatch(removeHitProtein(stage, data, colourToggle, skipTracking));
      selectedAll.current = false;
    };

    const addNewProtein = (skipTracking = false) => {
      // if (selectMoleculeSite) {
      //   selectMoleculeSite(data.site);
      // }
      dispatch(
        withDisabledMoleculeNglControlButton(currentID, 'protein', async () => {
          await dispatch(addHitProtein(stage, data, colourToggle, true, skipTracking));
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
      dispatch(removeComplex(stage, data, colourToggle, skipTracking));
      selectedAll.current = false;
    };

    const addNewComplex = (skipTracking = false) => {
      dispatch(
        withDisabledMoleculeNglControlButton(currentID, 'complex', async () => {
          await dispatch(addComplex(stage, data, colourToggle, skipTracking));
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
      dispatch(removeSurface(stage, data, colourToggle));
    };

    const addNewSurface = () => {
      dispatch(
        withDisabledMoleculeNglControlButton(currentID, 'surface', async () => {
          await dispatch(addSurface(stage, data, colourToggle));
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
      dispatch(removeDensity(stage, data, colourToggle, false));
    };

    const addNewDensityCustom = async () => {
      dispatch(
        withDisabledMoleculeNglControlButton(currentID, 'density', async () => {
          await dispatch(addDensityCustomView(stage, data, colourToggle, isWireframeStyle));
        })
      );
    };

    const addNewDensity = async () => {
      dispatch(
        withDisabledMoleculeNglControlButton(currentID, 'ligand', async () => {
          await dispatch(
            withDisabledMoleculeNglControlButton(currentID, 'density', async () => {
              await dispatch(addDensity(stage, data, colourToggle, isWireframeStyle));
            })
          );
        })
      );
    };

    const [loadingDensity, setLoadingDensity] = useState(false);
    const onDensity = () => {
      setLoadingDensity(true);
      if (isDensityOn === false && isDensityCustomOn === false) {
        dispatch(getDensityMapData(data)).then(r => {
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
      dispatch(removeQuality(stage, data, colourToggle));
    };

    const addNewQuality = () => {
      dispatch(
        withDisabledMoleculeNglControlButton(currentID, 'ligand', async () => {
          await dispatch(addQuality(stage, data, colourToggle));
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
      dispatch(removeVector(stage, data));
    };

    const addNewVector = () => {
      dispatch(
        withDisabledMoleculeNglControlButton(currentID, 'vector', async () => {
          await dispatch(addVector(stage, data));
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
    // let moleculeTitle = data?.code;
    let moleculeTitle = data?.code.replaceAll(`${target_on_name}-`, '');
    const moleculeTitleTruncated = moleculeTitle.substring(0, 20) + (moleculeTitle.length > 20 ? '...' : '');

    const [isNameCopied, setNameCopied] = useClipboard(moleculeTitle, { successDuration: 5000 });

    const moleculeLPCControlButtonDisabled = ['ligand', 'protein', 'complex'].some(
      type => disableMoleculeNglControlButtons[type]
    );

    const groupMoleculeLPCControlButtonDisabled = disableL || disableP || disableC;

    const getFontSize = string => {
      let fontSize = 12;
      switch (string?.length) {
        case 1:
        case 2:
          fontSize = 18
          break;
        case 4:
          fontSize = 10
          break;
        default:
          break;
      }
      return fontSize;
    };

    const getTagLabel = useCallback(tagCategory => {
      const tagTypeObject = getTagType(tagCategory);
      let tagLabel = '';
      if (tagTypeObject) {
        tagLabel = tagTypeObject.tag;
      }
      return tagLabel;
    }, [getTagType]);

    const getTagTooltip = useCallback(tagCategory => {
      const tagTypeObject = getTagType(tagCategory);
      let tagTooltip = '';
      if (tagTypeObject) {
        tagTooltip = tagTypeObject.upload_name;
      }
      return tagTooltip;
    }, [getTagType]);

    return (
      <>
        <Grid
          container
          justifyContent="space-between"
          direction="row"
          className={classNames(
            classes.container,
            {
              [classes.containerHeight]: !hideImage
            }
          )}
          wrap="nowrap"
          ref={ref}
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
                    dispatch(appendToMolListToEdit(currentID));
                  } else {
                    dispatch(removeFromMolListToEdit(currentID));
                  }
                }}
              />
            </Grid>
            <Grid item className={classes.rank}>
              {index + 1}.
            </Grid>
          </Grid>
          <Grid item container className={classes.detailsCol} justifyContent="space-between" direction="row">
            <Grid item container direction="column" alignItems="center" xs>
              <Grid item container justifyContent="flex-start" alignItems="center" direction="row">
                <Grid item container justifyContent="space-between" direction="column" xs={3}>
                  {/* Title label */}
                  <Tooltip title={data.prefix_tooltip ?? '-' + (data.id === pose?.main_site_observation ? " - main observation" : "")} placement="bottom-start">
                    <Grid
                      item
                      onCopy={e => {
                        e.preventDefault();
                        setNameCopied(moleculeTitle);
                      }}
                      className={classNames(classes.moleculeTitleLabel, { [classes.moleculeTitleLabelMainObs]: data.id === pose?.main_site_observation })}
                    >
                      <span className={classNames(classes.moleculeTitleLabelMain, { [classes.moleculeTitleLabelMainObs]: data.id === pose?.main_site_observation })}>{moleculeTitleTruncated}</span>
                      <br />
                      {data?.compound_code}
                    </Grid>
                  </Tooltip>
                  {/* Molecule properties */}
                  {getCalculatedProps().length > 0 &&
                    <Grid item container justifyContent="space-between" direction="row">
                      {/* Molecule properties */}
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
                              {item.name === moleculeProperty.logP && Math.round(item.value) /*.toPrecision(1)*/}
                              {item.name === moleculeProperty.tpsa && Math.round(item.value)}
                              {item.name !== moleculeProperty.mw &&
                                item.name !== moleculeProperty.logP &&
                                item.name !== moleculeProperty.tpsa &&
                                item.value}
                            </Grid>
                          </Tooltip>
                        ))}
                      </Grid>
                    </Grid>
                  }
                </Grid>
                <Grid item container justifyContent="flex-start" alignItems="flex-end" direction="column" xs={4}>
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
                              dispatch(centerOnLigandByMoleculeID(stage, data.id));
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
                  {/* Tags */}
                  {generateTagPopover()}
                </Grid>
                {/* Show specific tags */}
                <Grid
                  item
                  xs={5}
                  container
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  // wrap="nowrap"
                  style={{ height: "100%" }}
                >
                  {XCA_TAGS_CATEGORIES.map(tagCategory => {
                    const tagTypeObject = getTagType(tagCategory);
                    const tagLabel = tagCategory === 'ConformerSites' ? tagTypeObject.tag_prefix.replace(getTagType('CanonSites')?.tag_prefix, '') : tagTypeObject?.tag_prefix;
                    return <Tooltip
                      key={`tag-category-${tagCategory}`}
                      title={<div style={{ whiteSpace: 'pre-line' }}>{PLURAL_TO_SINGULAR[tagCategory]} - {tagTypeObject.tag}</div>}
                    >
                      <Grid item xs
                        className={classNames(classes.contColButtonMenu)}
                        style={{
                          backgroundColor: resolveTagBackgroundColor(tagTypeObject),
                          color: resolveTagForegroundColor(tagTypeObject),
                          fontSize: getFontSize(tagLabel)
                        }}
                      >
                        {tagLabel}
                      </Grid>
                    </Tooltip>
                  }
                  )}
                </Grid>
              </Grid>
            </Grid>
            {/* Image */}
            {(hideImage !== true) &&
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
              </div>}
          </Grid>
          {showExpandedView && <Grid item container alignItems='center' wrap="nowrap">
            {XCA_TAGS_CATEGORIES_EXPANDED.map((tagCategory, index) => {
              return <Tooltip title={`${PLURAL_TO_SINGULAR[tagCategory]} - ${getTagTooltip(tagCategory)}`} key={index}>
                <Grid item align="center" className={classes.categoryCell} style={{ minWidth: headerWidths[tagCategory] }}>
                  {getTagLabel(tagCategory)}
                </Grid>
              </Tooltip>
            })}
            <Tooltip title={"CentroidRes"}>
              <Grid item align="center" className={classes.categoryCell} style={{ minWidth: headerWidths.CentroidRes }}>
                {centroidRes}
              </Grid>
            </Tooltip>
            <Tooltip title={"LongCode"}>
              <Grid item align="center" className={classes.categoryCell} style={{ minWidth: headerWidths.LongCode }}>
                {data.longcode}
              </Grid>
            </Tooltip>
          </Grid>}
        </Grid >
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
          data={data}
          setDensity={addNewDensity}
          isQualityOn={isQualityOn}
        />
      </>
    );
  }
);

MoleculeView.displayName = 'MoleculeView';
export default MoleculeView;
