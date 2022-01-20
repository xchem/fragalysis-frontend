/**
 * Created by abradley on 14/03/2018.
 */

import React, { memo, useEffect, useState, useRef, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Button, makeStyles, Tooltip, IconButton } from '@material-ui/core';
import { ClearOutlined, CheckOutlined } from '@material-ui/icons';
import SVGInline from 'react-svg-inline';
import classNames from 'classnames';
import { VIEWS, ARROW_TYPE } from '../../../constants/constants';
import { NglContext } from '../../nglView/nglProvider';
// import { useDisableUserInteraction } from '../helpers/useEnableUserInteracion';
import {
  addDatasetLigand,
  removeDatasetLigand,
  addDatasetHitProtein,
  removeDatasetHitProtein,
  addDatasetComplex,
  removeDatasetComplex,
  addDatasetSurface,
  removeDatasetSurface,
  clickOnInspirations,
  getDatasetMoleculeID,
  getInspirationsForMol,
  withDisabledDatasetMoleculeNglControlButton,
  moveDatasetMoleculeUpDown
} from '../redux/dispatchActions';

import { isAnyInspirationTurnedOn, getFilteredDatasetMoleculeList } from '../redux/selectors';
import {
  appendMoleculeToCompoundsOfDatasetToBuy,
  removeMoleculeFromCompoundsOfDatasetToBuy,
  setCrossReferenceCompoundName,
  setIsOpenCrossReferenceDialog,
  setSelectedAll,
  setDeselectedAll
} from '../redux/actions';
import { centerOnLigandByMoleculeID } from '../../../reducers/ngl/dispatchActions';
import { ArrowDownward, ArrowUpward, MyLocation } from '@material-ui/icons';
import { isString } from 'lodash';
import { SvgTooltip } from '../../common';
import { getMolImage } from '../../preview/molecule/redux/dispatchActions';
import { MOL_TYPE } from '../../preview/molecule/redux/constants';
import {
  deselectVectorCompound,
  isCompoundFromVectorSelector,
  showHideLigand
} from '../../preview/compounds/redux/dispatchActions';
import { colourList } from '../../preview/molecule/utils/color';
import { useDragDropMoleculeView } from '../useDragDropMoleculeView';
import DatasetMoleculeSelectCheckbox from './datasetMoleculeSelectCheckbox';

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(1) / 4,
    color: 'black',
    height: 54
  },
  dragDropCursor: {
    cursor: 'move'
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
  detailsCol: {
    border: 'solid 1px',
    borderColor: theme.palette.background.divider,
    borderStyle: 'solid none solid solid'
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
    width: 32,
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
    textOverflow: 'ellipsis',
    paddingLeft: theme.spacing(1) / 4
  },
  datasetTitleLabel: {
    ...theme.typography.caption,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    paddingLeft: theme.spacing(1) / 4,
    paddingRight: theme.spacing(1) / 4,
    marginTop: -theme.spacing(1)
  },
  selectedMolecule: {
    color: theme.palette.primary.main
  },
  loadingProgress: {
    height: 2,
    width: '100%'
  },
  checkbox: {
    padding: 0
  },
  inheritWidth: {
    width: 'inherit'
  },
  widthOverflow: {
    maxWidth: '180px',
    overflow: 'hidden'
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
  cancelIcon: {
    color: theme.palette.primary.main,
    width: theme.spacing(2),
    height: theme.spacing(2)
  },
  checkIcon: {
    color: theme.palette.primary.main,
    width: theme.spacing(2),
    height: theme.spacing(2)
  }
}));

export const img_data_init = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="25px" height="25px"><g>
  <circle cx="50" cy="50" fill="none" stroke="#3f51b5" stroke-width="4" r="26" stroke-dasharray="150.79644737231007 52.26548245743669" transform="rotate(238.988 50 50)">
    <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="0.689655172413793s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform>
  </circle>  '</svg>`;

const DatasetMoleculeView = memo(
  ({
    imageHeight,
    imageWidth,
    data,
    datasetID,
    setRef,
    showCrossReferenceModal,
    hideFButton,
    showDatasetName,
    index,
    previousItemData,
    nextItemData,
    L,
    P,
    C,
    S,
    V,
    arrowsHidden = false,
    dragDropEnabled = false,
    moveMolecule,
    isCheckedToBuy,
    disableL,
    disableP,
    disableC
  }) => {
    const ref = useRef(null);

    const { handlerId, isDragging } = useDragDropMoleculeView(ref, datasetID, data, index, moveMolecule);
    const opacity = isDragging ? 0 : 1;

    const selectedAll = useRef(false);
    const currentID = (data && data.id) || (data && data.smiles) || undefined;
    const isFromVectorSelector = isCompoundFromVectorSelector(data);
    const classes = useStyles();
    const dispatch = useDispatch();

    const datasets = useSelector(state => state.datasetsReducers.datasets);
    const filteredScoreProperties = useSelector(state => state.datasetsReducers.filteredScoreProperties);
    const filter = useSelector(state => state.selectionReducers.filter);
    const isAnyInspirationOn = useSelector(state =>
      isAnyInspirationTurnedOn(state, (data && data.computed_inspirations) || [])
    );

    const disableMoleculeNglControlButtons =
      useSelector(state => state.datasetsReducers.disableDatasetsNglControlButtons[datasetID]?.[currentID]) || {};

    const filteredDatasetMoleculeList = useSelector(state => getFilteredDatasetMoleculeList(state, datasetID));

    const [image, setImage] = useState(img_data_init);

    const { getNglView } = useContext(NglContext);
    const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

    const isLigandOn = L;
    const isProteinOn = P;
    const isComplexOn = C;
    const isSurfaceOn = S;

    const hasAllValuesOn = isLigandOn && isProteinOn && isComplexOn;
    const hasSomeValuesOn = !hasAllValuesOn && (isLigandOn || isProteinOn || isComplexOn || isSurfaceOn);

    let areArrowsVisible = isLigandOn || isProteinOn || isComplexOn || isSurfaceOn;

    if (arrowsHidden) {
      areArrowsVisible = false;
    }

    // const disableUserInteraction = useDisableUserInteraction();

    const refOnCancelImage = useRef();
    const getRandomColor = () => colourList[currentID % colourList.length];
    const colourToggle = getRandomColor();

    const [moleculeTooltipOpen, setMoleculeTooltipOpen] = useState(false);
    const moleculeImgRef = useRef(null);
    const openMoleculeTooltip = () => {
      setMoleculeTooltipOpen(true);
    };
    const closeMoleculeTooltip = () => {
      setMoleculeTooltipOpen(false);
    };

    // componentDidMount
    useEffect(() => {
      dispatch(getMolImage(data.smiles, MOL_TYPE.DATASET, imageHeight, imageWidth)).then(i => {
        setImage(i);
      });
    }, [C, currentID, data, L, imageHeight, imageWidth, data.smiles, data.id, filteredDatasetMoleculeList, dispatch]);

    const svg_image = (
      <SVGInline
        component="div"
        svg={image}
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
    const current_style = isLigandOn || isProteinOn || isComplexOn || isSurfaceOn ? selected_style : not_selected_style;

    const addNewLigand = (skipTracking = false) => {
      dispatch(
        withDisabledDatasetMoleculeNglControlButton(datasetID, currentID, 'ligand', async () => {
          await dispatch(addDatasetLigand(stage, data, colourToggle, datasetID, skipTracking));
        })
      );
    };

    const removeSelectedLigand = (skipTracking = false) => {
      dispatch(removeDatasetLigand(stage, data, colourToggle, datasetID, skipTracking));
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
        if (isFromVectorSelector) {
          dispatch(showHideLigand(data, stage));
        } else {
          if (isLigandOn === false) {
            addNewLigand();
          } else {
            removeSelectedLigand();
          }
        }
      }
    };

    const removeSelectedProtein = (skipTracking = false) => {
      dispatch(removeDatasetHitProtein(stage, data, colourToggle, datasetID, skipTracking));
      selectedAll.current = false;
    };

    const addNewProtein = (skipTracking = false) => {
      dispatch(
        withDisabledDatasetMoleculeNglControlButton(datasetID, currentID, 'protein', async () => {
          await dispatch(addDatasetHitProtein(stage, data, colourToggle, datasetID, skipTracking));
        })
      );
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
      dispatch(removeDatasetComplex(stage, data, colourToggle, datasetID, skipTracking));
      selectedAll.current = false;
    };

    const addNewComplex = (skipTracking = false) => {
      dispatch(
        withDisabledDatasetMoleculeNglControlButton(datasetID, currentID, 'complex', async () => {
          await dispatch(addDatasetComplex(stage, data, colourToggle, datasetID, skipTracking));
        })
      );
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
      dispatch(removeDatasetSurface(stage, data, colourToggle, datasetID));
      selectedAll.current = false;
    };

    const addNewSurface = async () => {
      dispatch(
        withDisabledDatasetMoleculeNglControlButton(datasetID, currentID, 'surface', async () => {
          await dispatch(addDatasetSurface(stage, data, colourToggle, datasetID));
        })
      );
    };

    const onSurface = calledFromSelectAll => {
      if (calledFromSelectAll === true && selectedAll.current === true) {
        if (isSurfaceOn === false) {
          addNewSurface();
        }
      } else if (calledFromSelectAll && selectedAll.current === false) {
        removeSelectedSurface();
      } else if (!calledFromSelectAll) {
        if (isSurfaceOn === false) {
          addNewSurface();
        } else {
          removeSelectedSurface();
        }
      }
    };

    const setCalledFromAll = () => {
      let isSelected = selectedAll.current === true;
      if (isSelected) {
        dispatch(setSelectedAll(datasetID, data, true, true, true));
      } else {
        dispatch(setDeselectedAll(datasetID, data, isLigandOn, isProteinOn, isComplexOn));
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

      const nextItem = (nextItemData.hasOwnProperty('molecule') && nextItemData.molecule) || nextItemData;
      const nextDatasetID = (nextItemData.hasOwnProperty('datasetID') && nextItemData.datasetID) || datasetID;
      const moleculeTitleNext = nextItem && nextItem.name;

      let dataValue = { colourToggle, isLigandOn, isProteinOn, isComplexOn, isSurfaceOn };

      dispatch(setCrossReferenceCompoundName(moleculeTitleNext));
      if (setRef && ref.current) {
        setRef(refNext);
      }

      dispatch(moveDatasetMoleculeUpDown(stage, datasetID, data, nextDatasetID, nextItem, dataValue, ARROW_TYPE.DOWN));
    };

    const handleClickOnUpArrow = async () => {
      const refPrevious = ref.current.previousSibling;
      scrollToElement(refPrevious);

      const previousItem =
        (previousItemData.hasOwnProperty('molecule') && previousItemData.molecule) || previousItemData;
      const previousDatasetID =
        (previousItemData.hasOwnProperty('datasetID') && previousItemData.datasetID) || datasetID;
      const moleculeTitlePrev = previousItem && previousItem.name;

      let dataValue = { colourToggle, isLigandOn, isProteinOn, isComplexOn, isSurfaceOn };

      dispatch(setCrossReferenceCompoundName(moleculeTitlePrev));
      if (setRef && ref.current) {
        setRef(refPrevious);
      }

      dispatch(
        moveDatasetMoleculeUpDown(stage, datasetID, data, previousDatasetID, previousItem, dataValue, ARROW_TYPE.UP)
      );
    };

    const moleculeTitle = data && data.name;
    const datasetTitle = datasets?.find(item => `${item.id}` === `${datasetID}`)?.title;

    const allScores = { ...data?.numerical_scores, ...data?.text_scores };

    const moleculeLPCControlButtonDisabled = ['ligand', 'protein', 'complex'].some(
      type => disableMoleculeNglControlButtons[type]
    );

    const groupMoleculeLPCControlButtonDisabled = disableL || disableP || disableC;

    return (
      <>
        <Grid
          container
          justify="space-between"
          direction="row"
          className={classNames(classes.container, dragDropEnabled ? classes.dragDropCursor : undefined)}
          wrap="nowrap"
          ref={dragDropEnabled ? ref : undefined}
          data-handler-id={dragDropEnabled ? handlerId : undefined}
          style={{ opacity }}
        >
          {/*Site number*/}
          <Grid item container justify="space-between" direction="column" className={classes.site}>
            <Grid item>
              <DatasetMoleculeSelectCheckbox
                checked={isCheckedToBuy}
                className={classes.checkbox}
                size="small"
                color="primary"
                onChange={e => {
                  const result = e.target.checked;
                  if (result) {
                    dispatch(appendMoleculeToCompoundsOfDatasetToBuy(datasetID, currentID, moleculeTitle));
                  } else {
                    dispatch(removeMoleculeFromCompoundsOfDatasetToBuy(datasetID, currentID, moleculeTitle));
                    dispatch(deselectVectorCompound(data));
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
            <Grid
              item
              xs={!showCrossReferenceModal && hideFButton ? 8 : 7}
              container
              direction="column"
              className={!showCrossReferenceModal && hideFButton ? classes.widthOverflow : ''}
            >
              <Grid item className={classes.inheritWidth}>
                <Tooltip title={moleculeTitle} placement="bottom-start">
                  <div className={classNames(classes.moleculeTitleLabel, isCheckedToBuy && classes.selectedMolecule)}>
                    {moleculeTitle}
                  </div>
                </Tooltip>
              </Grid>
              {showDatasetName && (
                <Grid item className={classes.inheritWidth}>
                  <Tooltip title={datasetTitle} placement="bottom-start">
                    <div className={classes.datasetTitleLabel}>{datasetTitle}</div>
                  </Tooltip>
                </Grid>
              )}
            </Grid>
            {/* Status code - #208 Remove the status labels (for now - until they are in the back-end/loader properly)
        <Grid item>
          <Grid container direction="row" justify="space-between" alignItems="center">
            {Object.values(molStatusTypes).map(type => (
              <Grid item key={`molecule-status-${type}`} className={classes.qualityLabel}>
                <MoleculeStatusView type={type} data={data} />
              </Grid>
            ))}
          </Grid>
        </Grid>*/}
            {/* Control Buttons A, L, C, V */}
            <Grid item>
              <Grid
                container
                direction="row"
                justify="flex-start"
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
                        dispatch(centerOnLigandByMoleculeID(stage, getDatasetMoleculeID(datasetID, currentID)));
                      }}
                      disabled={false || !isLigandOn || isCompoundFromVectorSelector(data)}
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
                        selectedAll.current = hasSomeValuesOn ? false : !selectedAll.current;

                        setCalledFromAll();
                        onLigand(true);
                        onProtein(true);
                        onComplex(true);
                      }}
                      disabled={
                        isFromVectorSelector ||
                        groupMoleculeLPCControlButtonDisabled ||
                        moleculeLPCControlButtonDisabled
                      }
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
                      disabled={disableL || disableMoleculeNglControlButtons.ligand}
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
                      disabled={isFromVectorSelector || disableP || disableMoleculeNglControlButtons.protein}
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
                      disabled={isFromVectorSelector || disableC || disableMoleculeNglControlButtons.complex}
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
                      disabled={isFromVectorSelector || disableMoleculeNglControlButtons.surface}
                    >
                      S
                    </Button>
                  </Grid>
                </Tooltip>
                {!hideFButton && (
                  <Tooltip title="computed inspirations">
                    <Grid item>
                      <Button
                        variant="outlined"
                        className={classNames(classes.contColButton, {
                          [classes.contColButtonSelected]: isAnyInspirationOn
                        })}
                        onClick={() => {
                          dispatch((dispatch, getState) => {
                            const allInspirations = getState().datasetsReducers.allInspirations;

                            clickOnInspirations({
                              datasetID,
                              currentID,
                              computed_inspirations: getInspirationsForMol(allInspirations, datasetID, currentID)
                            });
                          });
                          if (setRef) {
                            setRef(ref.current);
                          }
                        }}
                        disabled={isFromVectorSelector}
                      >
                        F
                      </Button>
                    </Grid>
                  </Tooltip>
                )}
                {showCrossReferenceModal && (
                  <Tooltip title="cross reference">
                    <Grid item>
                      <Button
                        variant="outlined"
                        className={classNames(classes.contColButton, {
                          // [classes.contColButtonSelected]: isAnyInspirationOn
                        })}
                        onClick={() => {
                          dispatch(setCrossReferenceCompoundName(moleculeTitle));
                          dispatch(setIsOpenCrossReferenceDialog(true));
                          if (setRef) {
                            setRef(ref.current);
                          }
                        }}
                        disabled={isFromVectorSelector}
                      >
                        X
                      </Button>
                    </Grid>
                  </Tooltip>
                )}
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
                {filteredScoreProperties &&
                  datasetID &&
                  filteredScoreProperties[datasetID] &&
                  filteredScoreProperties[datasetID].map(score => {
                    //const item = scoreCompoundMap && scoreCompoundMap[data?.compound]?.find(o => o.score.id === score.id);
                    let value = allScores[score.name];
                    if (!value) {
                      value = data[score.name];
                    }
                    return (
                      <Tooltip title={`${score.name} - ${score.description} : ${value}`} key={score.name}>
                        {(value && (
                          <Grid
                            item
                            className={classNames(
                              classes.rightBorder
                              // getValueMatchingClass(item)
                            )}
                          >
                            {/*{item.value && Math.round(item.value)}*/}
                            {(value === 'N' && <ClearOutlined className={classes.cancelIcon} />) ||
                              (value === 'Y' && <CheckOutlined className={classes.checkIcon} />) ||
                              (isString(value) && value?.slice(0, 4)) ||
                              (!isNaN(value) && `${value}`?.slice(0, 4)) ||
                              null}
                          </Grid>
                        )) || (
                          <Grid item className={classes.rightBorder}>
                            -
                          </Grid>
                        )}
                      </Tooltip>
                    );
                  })}
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
            <Grid item>{svg_image}</Grid>
          </Grid>
        </Grid>
        <SvgTooltip
          open={moleculeTooltipOpen}
          anchorEl={moleculeImgRef.current}
          imgData={image}
          width={imageWidth}
          height={imageHeight}
        />
      </>
    );
  }
);

DatasetMoleculeView.displayName = 'DatasetMoleculeView';
export default DatasetMoleculeView;
