/**
 * Created by abradley on 14/03/2018.
 */

import React, { memo, useEffect, useState, useRef, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Button, makeStyles, Tooltip, Checkbox, IconButton } from '@material-ui/core';
import { ClearOutlined, CheckOutlined } from '@material-ui/icons';
import SVGInline from 'react-svg-inline';
import classNames from 'classnames';
import { VIEWS } from '../../constants/constants';
import { NglContext } from '../nglView/nglProvider';
import { useDisableUserInteraction } from '../helpers/useEnableUserInteracion';
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
  getDatasetMoleculeID
} from './redux/dispatchActions';

import { base_url } from '../routes/constants';
import { api } from '../../utils/api';
import { isAnyInspirationTurnedOn, getFilteredDatasetMoleculeList } from './redux/selectors';
import {
  appendMoleculeToCompoundsOfDatasetToBuy,
  removeMoleculeFromCompoundsOfDatasetToBuy,
  setCrossReferenceCompoundName,
  setIsOpenCrossReferenceDialog,
  setInspirationFragmentList
} from './redux/actions';
import { centerOnLigandByMoleculeID } from '../../reducers/ngl/dispatchActions';
import { ArrowDownward, ArrowUpward, MyLocation } from '@material-ui/icons';
import { isNumber, isString } from 'lodash';
import { SvgTooltip } from '../common';
import { OBJECT_TYPE } from '../nglView/constants';
import { getRepresentationsByType } from '../nglView/generatingObjects';

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(1) / 4,
    color: 'black',
    height: 54
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

export const colourList = [
  '#EFCDB8',
  '#CC6666',
  '#FF6E4A',
  '#78DBE2',
  '#1F75FE',
  '#FAE7B5',
  '#FDBCB4',
  '#C5E384',
  '#95918C',
  '#F75394',
  '#80DAEB',
  '#ADADD6'
];

export const img_data_init = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="25px" height="25px"><g>
  <circle cx="50" cy="50" fill="none" stroke="#3f51b5" stroke-width="4" r="26" stroke-dasharray="150.79644737231007 52.26548245743669" transform="rotate(238.988 50 50)">
    <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="0.689655172413793s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform>
  </circle>  '</svg>`;

export const DatasetMoleculeView = memo(
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
    removeOfAllSelectedTypes,
    removeOfAllSelectedTypesOfInspirations,
    moveSelectedMoleculeInspirationsSettings
  }) => {
    const selectedAll = useRef(false);
    const currentID = (data && data.id) || undefined;
    const classes = useStyles();
    const ref = useRef(null);
    const dispatch = useDispatch();
    const compoundsToBuyList = useSelector(state => state.datasetsReducers.compoundsToBuyDatasetMap[datasetID]);

    const ligandList = useSelector(state => state.datasetsReducers.ligandLists[datasetID]);
    const proteinList = useSelector(state => state.datasetsReducers.proteinLists[datasetID]);
    const complexList = useSelector(state => state.datasetsReducers.complexLists[datasetID]);
    const surfaceList = useSelector(state => state.datasetsReducers.surfaceLists[datasetID]);
    const datasets = useSelector(state => state.datasetsReducers.datasets);
    const filteredScoreProperties = useSelector(state => state.datasetsReducers.filteredScoreProperties);
    const filter = useSelector(state => state.selectionReducers.filter);
    const isAnyInspirationOn = useSelector(state =>
      isAnyInspirationTurnedOn(state, (data && data.computed_inspirations) || [])
    );

    const filteredDatasetMoleculeList = useSelector(state => getFilteredDatasetMoleculeList(state, datasetID));
    const objectsInView = useSelector(state => state.nglReducers.objectsInView) || {};

    const [image, setImage] = useState(img_data_init);

    const { getNglView } = useContext(NglContext);
    const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

    const isLigandOn = (currentID && ligandList.includes(currentID)) || false;
    const isProteinOn = (currentID && proteinList.includes(currentID)) || false;
    const isComplexOn = (currentID && complexList.includes(currentID)) || false;
    const isSurfaceOn = (currentID && surfaceList.includes(currentID)) || false;

    const isCheckedToBuy = (currentID && compoundsToBuyList && compoundsToBuyList.includes(currentID)) || false;

    const hasAllValuesOn = isLigandOn && isProteinOn && isComplexOn && isSurfaceOn;
    const hasSomeValuesOn = !hasAllValuesOn && (isLigandOn || isProteinOn || isComplexOn || isSurfaceOn);

    const areArrowsVisible = isLigandOn || isProteinOn || isComplexOn || isSurfaceOn;

    const disableUserInteraction = useDisableUserInteraction();

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
      if (/*refOnCancelImage.current === undefined && */ data && data.smiles) {
        let onCancel = () => {};
        let url = new URL(`${base_url}/viewer/img_from_smiles/`);
        const params = {
          width: imageHeight,
          height: imageWidth,
          smiles: data.smiles
        };
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

        api({
          url,
          cancel: onCancel
        })
          .then(response => {
            if (response.data !== undefined) {
              setImage(response.data);
            }
          })
          .catch(error => {
            throw new Error(error);
          });
        refOnCancelImage.current = onCancel;
      }
      return () => {
        if (refOnCancelImage) {
          refOnCancelImage.current();
        }
      };
    }, [
      complexList,
      currentID,
      data,
      ligandList,
      imageHeight,
      imageWidth,
      data.smiles,
      data.id,
      filteredDatasetMoleculeList
    ]);

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

    const addNewLigand = () => {
      dispatch(addDatasetLigand(stage, data, colourToggle, datasetID));
    };

    const removeSelectedLigand = () => {
      dispatch(removeDatasetLigand(stage, data, colourToggle, datasetID));
      selectedAll.current = false;
    };

    const onLigand = calledFromSelectAll => {
      if (calledFromSelectAll === true && selectedAll.current === true) {
        if (isLigandOn === false) {
          addNewLigand();
        }
      } else if (calledFromSelectAll && selectedAll.current === false) {
        removeSelectedLigand();
      } else if (!calledFromSelectAll) {
        if (isLigandOn === false) {
          addNewLigand();
        } else {
          removeSelectedLigand();
        }
      }
    };

    const removeSelectedProtein = () => {
      dispatch(removeDatasetHitProtein(stage, data, colourToggle, datasetID));
      selectedAll.current = false;
    };

    const addNewProtein = () => {
      dispatch(addDatasetHitProtein(stage, data, colourToggle, datasetID));
    };

    const onProtein = calledFromSelectAll => {
      if (calledFromSelectAll === true && selectedAll.current === true) {
        if (isProteinOn === false) {
          addNewProtein();
        }
      } else if (calledFromSelectAll && selectedAll.current === false) {
        removeSelectedProtein();
      } else if (!calledFromSelectAll) {
        if (isProteinOn === false) {
          addNewProtein();
        } else {
          removeSelectedProtein();
        }
      }
    };

    const removeSelectedComplex = () => {
      dispatch(removeDatasetComplex(stage, data, colourToggle, datasetID));
      selectedAll.current = false;
    };

    const addNewComplex = () => {
      dispatch(addDatasetComplex(stage, data, colourToggle, datasetID));
    };

    const onComplex = calledFromSelectAll => {
      if (calledFromSelectAll === true && selectedAll.current === true) {
        if (isComplexOn === false) {
          addNewComplex();
        }
      } else if (calledFromSelectAll && selectedAll.current === false) {
        removeSelectedComplex();
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

    const addNewSurface = () => {
      dispatch(addDatasetSurface(stage, data, colourToggle, datasetID));
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

    const moveSelectedMoleculeSettings = (newItemData, datasetIdOfMolecule) => {
      if (newItemData) {
        if (isLigandOn) {
          let representations = getRepresentationsByType(objectsInView, data, OBJECT_TYPE.LIGAND, datasetID);
          dispatch(addDatasetLigand(stage, newItemData, colourToggle, datasetIdOfMolecule, representations));
        }
        if (isProteinOn) {
          let representations = getRepresentationsByType(objectsInView, data, OBJECT_TYPE.PROTEIN, datasetID);
          dispatch(addDatasetHitProtein(stage, newItemData, colourToggle, datasetIdOfMolecule, representations));
        }
        if (isComplexOn) {
          let representations = getRepresentationsByType(objectsInView, data, OBJECT_TYPE.COMPLEX, datasetID);
          dispatch(addDatasetComplex(stage, newItemData, colourToggle, datasetIdOfMolecule, representations));
        }
        if (isSurfaceOn) {
          let representations = getRepresentationsByType(objectsInView, data, OBJECT_TYPE.SURFACE, datasetID);
          dispatch(addDatasetSurface(stage, newItemData, colourToggle, datasetIdOfMolecule, representations));
        }
      }
    };

    const scrollToElement = element => {
      element.scrollIntoView({
        behavior: 'auto',
        block: 'nearest',
        inline: 'nearest'
      });
    };

    const handleClickOnDownArrow = () => {
      const refNext = ref.current.nextSibling;
      scrollToElement(refNext);

      removeOfAllSelectedTypes();
      removeOfAllSelectedTypesOfInspirations();

      const nextItem = (nextItemData.hasOwnProperty('molecule') && nextItemData.molecule) || nextItemData;
      const nextDatasetID = (nextItemData.hasOwnProperty('datasetID') && nextItemData.datasetID) || datasetID;
      const moleculeTitleNext = nextItem && nextItem.name;

      moveSelectedMoleculeSettings(nextItem, nextDatasetID);
      dispatch(moveSelectedMoleculeInspirationsSettings(data, nextItem));
      dispatch(setInspirationFragmentList(nextItem.computed_inspirations));
      dispatch(setCrossReferenceCompoundName(moleculeTitleNext));
      if (setRef && ref.current) {
        setRef(refNext);
      }
    };

    const handleClickOnUpArrow = () => {
      const refPrevious = ref.current.previousSibling;
      scrollToElement(refPrevious);

      removeOfAllSelectedTypes();
      removeOfAllSelectedTypesOfInspirations();

      const previousItem =
        (previousItemData.hasOwnProperty('molecule') && previousItemData.molecule) || previousItemData;
      const previousDatasetID =
        (previousItemData.hasOwnProperty('datasetID') && previousItemData.datasetID) || datasetID;
      const moleculeTitlePrev = previousItem && previousItem.name;

      moveSelectedMoleculeSettings(previousItem, previousDatasetID);
      dispatch(moveSelectedMoleculeInspirationsSettings(data, previousItem));
      dispatch(setInspirationFragmentList(previousItem.computed_inspirations));
      dispatch(setCrossReferenceCompoundName(moleculeTitlePrev));
      if (setRef && ref.current) {
        setRef(refPrevious);
      }
    };

    const moleculeTitle = data && data.name;
    const datasetTitle = datasets?.find(item => `${item.id}` === `${datasetID}`)?.title;

    const allScores = { ...data?.numerical_scores, ...data?.text_scores };

    return (
      <>
        <Grid container justify="space-between" direction="row" className={classes.container} wrap="nowrap" ref={ref}>
          {/*Site number*/}
          <Grid item container justify="space-between" direction="column" className={classes.site}>
            <Grid item>
              <Checkbox
                checked={isCheckedToBuy}
                className={classes.checkbox}
                size="small"
                color="primary"
                onChange={e => {
                  const result = e.target.checked;
                  if (result) {
                    dispatch(appendMoleculeToCompoundsOfDatasetToBuy(datasetID, currentID));
                  } else {
                    dispatch(removeMoleculeFromCompoundsOfDatasetToBuy(datasetID, currentID));
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
            <Grid item xs={!showCrossReferenceModal && hideFButton ? 8 : 7} container direction="column">
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
                      disabled={disableUserInteraction || !isLigandOn}
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

                        onLigand(true);
                        onProtein(true);
                        onComplex(true);
                      }}
                      disabled={disableUserInteraction}
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
                      disabled={disableUserInteraction}
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
                      disabled={disableUserInteraction}
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
                      disabled={disableUserInteraction}
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
                      disabled={disableUserInteraction}
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
                          dispatch(
                            clickOnInspirations({
                              datasetID,
                              currentID,
                              computed_inspirations: data && data.computed_inspirations
                            })
                          );
                          if (setRef) {
                            setRef(ref.current);
                          }
                        }}
                        disabled={disableUserInteraction}
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
                        disabled={true || disableUserInteraction}
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
                    const value = allScores[score.name];
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
                  disabled={disableUserInteraction || !previousItemData || !areArrowsVisible}
                  onClick={handleClickOnUpArrow}
                >
                  <ArrowUpward className={areArrowsVisible ? classes.arrow : classes.invisArrow} />
                </IconButton>
              </Grid>
              <Grid item>
                <IconButton
                  color="primary"
                  size="small"
                  disabled={disableUserInteraction || !nextItemData || !areArrowsVisible}
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
