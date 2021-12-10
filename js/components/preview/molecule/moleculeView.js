/**
 * Created by abradley on 14/03/2018.
 */

import React, { memo, useEffect, useState, useRef, useContext, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Button, makeStyles, Typography, Tooltip, IconButton, Checkbox, Paper } from '@material-ui/core';
import { MyLocation, ArrowDownward, ArrowUpward, Warning, Label, Edit } from '@material-ui/icons';
import SVGInline from 'react-svg-inline';
import classNames from 'classnames';
import { VIEWS, ARROW_TYPE } from '../../../constants/constants';
import { NGL_PARAMS, COMMON_PARAMS } from '../../nglView/constants';
import { NglContext } from '../../nglView/nglProvider';
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
  moveSelectedMolSettings,
  removeQuality,
  addQuality,
  getQualityInformation,
  getDensityMapData,
  getProteinData
} from './redux/dispatchActions';
import {
  setSelectedAll,
  setDeselectedAll,
  setArrowUpDown,
  setMoleculeForTagEdit,
  setTagEditorOpen,
  appendToMolListToEdit,
  removeFromMolListToEdit
} from '../../../reducers/selection/actions';
import { base_url } from '../../routes/constants';
import { moleculeProperty } from './helperConstants';
import { centerOnLigandByMoleculeID } from '../../../reducers/ngl/dispatchActions';
import { SvgTooltip } from '../../common';
import { MOL_TYPE } from './redux/constants';
import { DensityMapsModal } from './modals/densityMapsModal';
import { getRandomColor } from './utils/color';
import { getAllTagsForMol } from '../tags/utils/tagUtils';
import TagView from '../tags/tagView';

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(1) / 4,
    color: 'black',
    height: 54
  },
  contButtonsMargin: {
    margin: theme.spacing(1) / 2,
    width: 'inherit'
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
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText
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
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.black
    }
  },
  contColButtonHalfSelected: {
    backgroundColor: theme.palette.primary.semidark,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.black
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
    borderStyle: 'solid solid solid none'
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
    ...theme.typography.button,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
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
    padding: '0px',
    color: theme.palette.warning.darkLight,
    '&:hover': {
      color: theme.palette.warning.dark
    }
  },
  tagIcon: {
    padding: '0px',
    color: theme.palette.primary.main,
    '&:hover': {
      color: theme.palette.primary.dark
    }
  },
  tooltip: {
    backgroundColor: theme.palette.white
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
    selectMoleculeSite
  }) => {
    // const [countOfVectors, setCountOfVectors] = useState('-');
    // const [cmpds, setCmpds] = useState('-');
    const selectedAll = useRef(false);
    const ref = useRef(null);
    const currentID = (data && data.id) || undefined;
    const classes = useStyles();
    const key = 'mol_image';

    const dispatch = useDispatch();
    const target_on_name = useSelector(state => state.apiReducers.target_on_name);
    const filter = useSelector(state => state.selectionReducers.filter);
    const url = new URL(base_url + '/api/molimg/' + data.id + '/');
    const [img_data, setImg_data] = useState(img_data_init);

    const viewParams = useSelector(state => state.nglReducers.viewParams);
    const objectsInView = useSelector(state => state.nglReducers.objectsInView) || {};
    const isTagEditorOpen = useSelector(state => state.selectionReducers.tagEditorOpened);
    const molIdForTagEditor = useSelector(state => state.selectionReducers.molForTagEdit);
    const tagList = useSelector(state => state.selectionReducers.tagList);
    const moleculesToEdit = useSelector(state => state.selectionReducers.moleculesToEdit);

    const noTagsReceived = useSelector(state => state.apiReducers.noTagsReceived);

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

    const [hasMap, setHasMap] = useState();

    const hasAllValuesOn = isLigandOn && isProteinOn && isComplexOn;
    const hasSomeValuesOn = !hasAllValuesOn && (isLigandOn || isProteinOn || isComplexOn);

    const areArrowsVisible = isLigandOn || isProteinOn || isComplexOn || isSurfaceOn || isDensityOn || isVectorOn;

    let warningIconVisible = viewParams[COMMON_PARAMS.warningIcon] === true && hasAdditionalInformation === true;
    let isWireframeStyle = viewParams[NGL_PARAMS.contour_DENSITY];

    let tagEditIconVisible = true;
    // const disableUserInteraction = useDisableUserInteraction();

    const oldUrl = useRef('');
    const setOldUrl = url => {
      oldUrl.current = url;
    };
    const refOnCancel = useRef();

    const colourToggle = getRandomColor(data);

    const getCalculatedProps = useCallback(
      () => [
        { name: moleculeProperty.mw, value: data.mw },
        { name: moleculeProperty.logP, value: data.logp },
        { name: moleculeProperty.tpsa, value: data.tpsa },
        { name: moleculeProperty.ha, value: data.ha },
        { name: moleculeProperty.hacc, value: data.hacc },
        { name: moleculeProperty.hdon, value: data.hdon },
        { name: moleculeProperty.rots, value: data.rots },
        { name: moleculeProperty.rings, value: data.rings },
        { name: moleculeProperty.velec, value: data.velec }
        //   { name: moleculeProperty.vectors, value: countOfVectors },
        //   { name: moleculeProperty.cpd, value: cmpds }
      ],
      [data.ha, data.hacc, data.hdon, data.logp, data.mw, data.rings, data.rots, data.tpsa, data.velec]
    );

    const [densityModalOpen, setDensityModalOpen] = useState(false);
    const [tagAddModalOpen, setTagAddModalOpen] = useState(false);
    const [moleculeTooltipOpen, setMoleculeTooltipOpen] = useState(false);
    const moleculeImgRef = useRef(null);
    const openMoleculeTooltip = () => {
      setMoleculeTooltipOpen(true);
    };
    const closeMoleculeTooltip = () => {
      setMoleculeTooltipOpen(false);
    };

    const proteinData = data?.proteinData;
    const isMolSelectedForEdit = moleculesToEdit.some(mid => mid === currentID);

    const getDataForTagsTooltip = () => {
      const assignedTags = getAllTagsForMol(data, tagList);
      return assignedTags;
      /*const dataForTooltip = [];
      assignedTags &&
        assignedTags.forEach(tag => {
          dataForTooltip.push(tag.tag);
        });

      return dataForTooltip;*/
    };

    const generateTooltip = () => {
      const data = getDataForTagsTooltip();
      return (
        <Paper className={classes.tooltip}>
          {data.map((t, idx) => (
            /*<Typography color="inherit">{t}</Typography>*/
            <TagView key={t.id} tag={t} selected={true} ></TagView>
          ))}
        </Paper>
      );
    };

    useEffect(() => {
      if (!proteinData) {
        dispatch(getProteinData(data)).then(i => {
          if (i && i.length > 0) {
            const proteinData = i[0];
            data.proteinData = proteinData;
            const result =
              data.proteinData &&
              (data.proteinData.diff_info || data.proteinData.event_info || data.proteinData.sigmaa_info);
            setHasMap(result);
          }
        });
      }
    }, [data, dispatch, proteinData]);

    // componentDidMount
    useEffect(() => {
      dispatch(getMolImage(data.id, MOL_TYPE.HIT, imageHeight, imageWidth)).then(i => {
        setImg_data(i);
      });
    }, [data.id, data.smiles, imageHeight, url, imageWidth, dispatch]);

    useEffect(() => {
      dispatch(getQualityInformation(data));
    }, [data, dispatch]);

    const svg_image = (
      <SVGInline
        component="div"
        svg={img_data}
        className={classes.imageMargin}
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

      dispatch(addLigand(stage, data, colourToggle, false, true, skipTracking));
    };

    const removeSelectedLigand = (skipTracking = false) => {
      dispatch(removeLigand(stage, data, skipTracking));
      selectedAll.current = false;
    };

    const onLigand = calledFromSelectAll => {
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
    };

    const removeSelectedProtein = (skipTracking = false) => {
      dispatch(removeHitProtein(stage, data, colourToggle, skipTracking));
      selectedAll.current = false;
    };

    const addNewProtein = (skipTracking = false) => {
      // if (selectMoleculeSite) {
      //   selectMoleculeSite(data.site);
      // }
      dispatch(addHitProtein(stage, data, colourToggle, skipTracking));
    };

    const onProtein = calledFromSelectAll => {
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
    };

    const removeSelectedComplex = (skipTracking = false) => {
      dispatch(removeComplex(stage, data, colourToggle, skipTracking));
      selectedAll.current = false;
    };

    const addNewComplex = (skipTracking = false) => {
      // if (selectMoleculeSite) {
      //   selectMoleculeSite(data.site);
      // }
      dispatch(addComplex(stage, data, colourToggle, skipTracking));
    };

    const onComplex = calledFromSelectAll => {
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
    };

    const removeSelectedSurface = () => {
      dispatch(removeSurface(stage, data, colourToggle));
    };

    const addNewSurface = () => {
      // if (selectMoleculeSite) {
      //   selectMoleculeSite(data.site);
      // }
      dispatch(addSurface(stage, data, colourToggle));
    };

    const onSurface = () => {
      if (isSurfaceOn === false) {
        addNewSurface();
      } else {
        removeSelectedSurface();
      }
    };

    const removeSelectedDensity = () => {
      dispatch(removeDensity(stage, data, colourToggle, false));
    };

    const addNewDensityCustom = () => {
      dispatch(addDensityCustomView(stage, data, colourToggle, isWireframeStyle));
    };

    const addNewDensity = () => {
      // if (selectMoleculeSite) {
      //   selectMoleculeSite(data.site);
      // }
      dispatch(addDensity(stage, data, colourToggle, isWireframeStyle));
    };

    const onDensity = () => {
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
    };

    const removeSelectedQuality = () => {
      dispatch(removeQuality(stage, data, colourToggle));
    };

    const addNewQuality = () => {
      dispatch(addQuality(stage, data, colourToggle));
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
      // if (selectMoleculeSite) {
      //   selectMoleculeSite(data.site);
      // }
      dispatch(addVector(stage, data)).catch(error => {
        throw new Error(error);
      });
    };

    const onVector = () => {
      if (isVectorOn === false) {
        addNewVector();
      } else {
        removeSelectedVector();
      }
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

    const handleClickOnDownArrow = async () => {
      const refNext = ref.current.nextSibling;
      scrollToElement(refNext);

      let dataValue = {
        isLigandOn: isLigandOn,
        isProteinOn: isProteinOn,
        isComplexOn: isComplexOn,
        isSurfaceOn: isSurfaceOn,
        isQualityOn: isQualityOn,
        isDensityOn: isDensityOn,
        isDensityCustomOn: isDensityCustomOn,
        isVectorOn: isVectorOn,
        objectsInView: objectsInView,
        colourToggle: colourToggle
      };
      // Needs to be awaited since adding elements to NGL viewer is done asynchronously
      await dispatch(moveSelectedMolSettings(stage, data, nextItemData, dataValue, true));
      dispatch(setArrowUpDown(data, nextItemData, ARROW_TYPE.DOWN, dataValue));
      removeSelectedTypes([nextItemData], true);
    };

    const handleClickOnUpArrow = async () => {
      const refPrevious = ref.current.previousSibling;
      scrollToElement(refPrevious);

      let dataValue = {
        isLigandOn: isLigandOn,
        isProteinOn: isProteinOn,
        isComplexOn: isComplexOn,
        isSurfaceOn: isSurfaceOn,
        isQualityOn: isQualityOn,
        isDensityOn: isDensityOn,
        isDensityCustomOn: isDensityCustomOn,
        isVectorOn: isVectorOn,
        objectsInView: objectsInView,
        colourToggle: colourToggle
      };
      // Needs to be awaited since adding elements to NGL viewer is done asynchronously
      await dispatch(moveSelectedMolSettings(stage, data, previousItemData, dataValue, true));
      dispatch(setArrowUpDown(data, previousItemData, ARROW_TYPE.UP, dataValue));
      removeSelectedTypes([previousItemData], true);
    };

    let moleculeTitle = data?.protein_code.replace(new RegExp(`${target_on_name}-`, 'i'), '');

    return (
      <>
        <Grid container justify="space-between" direction="row" className={classes.container} wrap="nowrap" ref={ref}>
          {/* Site number */}
          <Grid item container justify="space-between" direction="column" className={classes.site}>
            <Grid item>
              <Checkbox
                checked={isMolSelectedForEdit || molIdForTagEditor === data.id}
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
          <Grid item container className={classes.detailsCol} justify="space-between" direction="row">
            {/* Title label */}
            <Grid item xs={6}>
              <Tooltip title={moleculeTitle} placement="bottom-start">
                <div className={classes.moleculeTitleLabel}>{moleculeTitle}</div>
              </Tooltip>
            </Grid>
            {/* Control Buttons A, L, C, V */}
            <Grid item xs={6}>
              <Grid
                container
                direction="row"
                justify="flex-end"
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
                        dispatch(centerOnLigandByMoleculeID(stage, data?.id));
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
                        // always deselect all if are selected only some of options
                        selectedAll.current = hasSomeValuesOn || hasAllValuesOn ? false : !selectedAll.current;

                        setCalledFromAll();
                        onLigand(true);
                        onProtein(true);
                        onComplex(true);
                      }}
                      disabled={false}
                    >
                      A
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
                      disabled={false}
                    >
                      L
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
                      disabled={false}
                    >
                      P
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
                      disabled={false}
                    >
                      C
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
                      disabled={false}
                    >
                      S
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
                      disabled={!hasMap}
                    >
                      D
                    </Button>
                  </Grid>
                </Tooltip>
                <Tooltip title="atom quality">
                  <Grid item>
                    <Button
                      variant="outlined"
                      className={classNames(classes.contColButton, {
                        [classes.contColButtonSelected]: isQualityOn
                      })}
                      onClick={() => onQuality()}
                      disabled={!hasAdditionalInformation}
                    >
                      Q
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
                      disabled={false}
                    >
                      V
                    </Button>
                  </Grid>
                </Tooltip>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              {/* Molecule properties */}
              <Grid
                item
                container
                justify="flex-start"
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
          </Grid>
          {/* Up/Down arrows */}
          <Grid item>
            <Grid container direction="column" justify="space-between" className={classes.arrows}>
              <Grid item>
                <IconButton
                  color="primary"
                  size="small"
                  disabled={false || !previousItemData || !areArrowsVisible}
                  onClick={handleClickOnUpArrow}
                >
                  <ArrowUpward className={areArrowsVisible ? classes.arrow : classes.invisArrow} />
                </IconButton>
              </Grid>
              <Grid item>
                <IconButton
                  color="primary"
                  size="small"
                  disabled={false || !nextItemData || !areArrowsVisible}
                  onClick={handleClickOnDownArrow}
                >
                  <ArrowDownward className={areArrowsVisible ? classes.arrow : classes.invisArrow} />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
          {/* Image */}
          <Grid
            item
            style={{
              ...current_style,
              width: imageWidth
            }}
            container
            justify="center"
            className={classes.image}
            onMouseEnter={openMoleculeTooltip}
            onMouseLeave={closeMoleculeTooltip}
            ref={moleculeImgRef}
          >
            <Grid
              item
              xs={
                warningIconVisible === true
                  ? moleculeTooltipOpen === true
                    ? 8
                    : 10
                  : moleculeTooltipOpen === true
                  ? 10
                  : 12
              }
            >
              {svg_image}
            </Grid>
            {moleculeTooltipOpen === true && (
              <Grid item xs={2}>
                <IconButton
                  color="primary"
                  disabled={noTagsReceived}
                  className={classes.tagIcon}
                  onClick={() => {
                    // setTagAddModalOpen(!tagAddModalOpen);
                    if (molIdForTagEditor === data.id) {
                      dispatch(setTagEditorOpen(!isTagEditorOpen));
                      dispatch(setMoleculeForTagEdit(null));
                      dispatch(setTagEditorOpen(false));
                    } else {
                      dispatch(setMoleculeForTagEdit(data.id));
                      dispatch(setTagEditorOpen(true));
                      if (setRef) {
                        setRef(ref.current);
                      }
                    }
                  }}
                >
                  <Tooltip title={generateTooltip()}>
                    <Checkbox
                      checked={molIdForTagEditor === data.id}
                      className={classes.checkbox}
                      size="small"
                      color="primary"
                    />
                  </Tooltip>
                </IconButton>
              </Grid>
            )}
            {warningIconVisible === true && (
              <Grid item xs={2}>
                <IconButton className={classes.warningIcon} onClick={() => onQuality()}>
                  <Tooltip title="Warning">
                    <Warning />
                  </Tooltip>
                </IconButton>
              </Grid>
            )}
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
          data={data}
          setDensity={addNewDensity}
        />
      </>
    );
  }
);

MoleculeView.displayName = 'MoleculeView';
export default MoleculeView;
