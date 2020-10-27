/**
 * Created by abradley on 14/03/2018.
 */

import React, { memo, useEffect, useState, useRef, useContext, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Button, makeStyles, Typography, Tooltip, IconButton } from '@material-ui/core';
import { MyLocation, ArrowDownward, ArrowUpward } from '@material-ui/icons';
import SVGInline from 'react-svg-inline';
import classNames from 'classnames';
import { VIEWS } from '../../../constants/constants';
import { loadFromServer } from '../../../utils/genericView';
import { NglContext } from '../../nglView/nglProvider';
import { useDisableUserInteraction } from '../../helpers/useEnableUserInteracion';
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
  searchMoleculeGroupByMoleculeID
} from './redux/dispatchActions';
import { base_url } from '../../routes/constants';
import { moleculeProperty } from './helperConstants';
import { centerOnLigandByMoleculeID } from '../../../reducers/ngl/dispatchActions';
import { SvgTooltip } from '../../common';
import { OBJECT_TYPE } from '../../nglView/constants';
import { getRepresentationsByType } from '../../nglView/generatingObjects';

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

const MoleculeView = memo(
  ({
    imageHeight,
    imageWidth,
    data,
    searchMoleculeGroup,
    index,
    previousItemData,
    nextItemData,
    removeOfAllSelectedTypes
  }) => {
    // const [countOfVectors, setCountOfVectors] = useState('-');
    // const [cmpds, setCmpds] = useState('-');
    const selectedAll = useRef(false);
    const ref = useRef(null);
    const currentID = (data && data.id) || undefined;
    const classes = useStyles();
    const key = 'mol_image';
    const [moleculeGroupID, setMoleculeGroupID] = useState();

    const dispatch = useDispatch();
    const proteinList = useSelector(state => state.selectionReducers.proteinList);
    const complexList = useSelector(state => state.selectionReducers.complexList);
    const surfaceList = useSelector(state => state.selectionReducers.surfaceList);
    const densityList = useSelector(state => state.selectionReducers.densityList);
    const fragmentDisplayList = useSelector(state => state.selectionReducers.fragmentDisplayList);
    const vectorOnList = useSelector(state => state.selectionReducers.vectorOnList);
    const target_on_name = useSelector(state => state.apiReducers.target_on_name);
    const filter = useSelector(state => state.selectionReducers.filter);
    const url = new URL(base_url + '/api/molimg/' + data.id + '/');
    const [img_data, setImg_data] = useState(img_data_init);

    const objectsInView = useSelector(state => state.nglReducers.objectsInView) || {};

    const { getNglView } = useContext(NglContext);
    const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

    const isLigandOn = (currentID && fragmentDisplayList.includes(currentID)) || false;
    const isProteinOn = (currentID && proteinList.includes(currentID)) || false;
    const isComplexOn = (currentID && complexList.includes(currentID)) || false;
    const isSurfaceOn = (currentID && surfaceList.includes(currentID)) || false;
    const isDensityOn = (currentID && densityList.includes(currentID)) || false;
    const isVectorOn = (currentID && vectorOnList.includes(currentID)) || false;

    const hasAllValuesOn = isLigandOn && isProteinOn && isComplexOn;
    const hasSomeValuesOn = !hasAllValuesOn && (isLigandOn || isProteinOn || isComplexOn);

    const areArrowsVisible = isLigandOn || isProteinOn || isComplexOn || isSurfaceOn || isDensityOn || isVectorOn;

    const disableUserInteraction = useDisableUserInteraction();

    const oldUrl = useRef('');
    const setOldUrl = url => {
      oldUrl.current = url;
    };
    const refOnCancel = useRef();
    const getRandomColor = () => colourList[data.id % colourList.length];
    const colourToggle = getRandomColor();

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
      if (refOnCancel.current === undefined) {
        let onCancel = () => {};
        Promise.all([
          loadFromServer({
            width: imageHeight,
            height: imageWidth,
            key,
            old_url: oldUrl.current,
            setImg_data,
            setOld_url: newUrl => setOldUrl(newUrl),
            url,
            cancel: onCancel
          })
          /*  api({ url: `${base_url}/api/vector/${data.id}` }).then(response => {
          const vectors = response.data.vectors['3d'];
          setCountOfVectors(generateObjectList(vectors).length);
        }),
        api({ url: `${base_url}/api/graph/${data.id}` }).then(response => {
          setCmpds(getTotalCountOfCompounds(response.data.graph));
        })*/
        ]).catch(error => {
          throw new Error(error);
        });
        refOnCancel.current = onCancel;
      }
      return () => {
        if (refOnCancel) {
          refOnCancel.current();
        }
      };
    }, [complexList, data.id, data.smiles, fragmentDisplayList, imageHeight, url, vectorOnList, imageWidth]);

    useEffect(() => {
      if (searchMoleculeGroup) {
        dispatch(searchMoleculeGroupByMoleculeID(currentID))
          .then(molGroupID => {
            setMoleculeGroupID(molGroupID);
          })
          .catch(error => {
            throw new Error(error);
          });
      }
    }, [currentID, dispatch, searchMoleculeGroup]);

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
      isLigandOn || isProteinOn || isComplexOn || isSurfaceOn || isVectorOn ? selected_style : not_selected_style;

    const addNewLigand = () => {
      dispatch(addLigand(stage, data, colourToggle));
    };

    const removeSelectedLigand = () => {
      dispatch(removeLigand(stage, data));
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
      dispatch(removeHitProtein(stage, data, colourToggle));
      selectedAll.current = false;
    };

    const addNewProtein = () => {
      dispatch(addHitProtein(stage, data, colourToggle));
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
      dispatch(removeComplex(stage, data, colourToggle));
      selectedAll.current = false;
    };

    const addNewComplex = () => {
      dispatch(addComplex(stage, data, colourToggle));
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
      dispatch(removeSurface(stage, data, colourToggle));
    };

    const addNewSurface = () => {
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
      dispatch(removeDensity(stage, data, colourToggle));
    };

    const addNewDensity = () => {
      dispatch(addDensity(stage, data, colourToggle));
    };

    const onDensity = () => {
      if (isDensityOn === false) {
        addNewDensity();
      } else {
        removeSelectedDensity();
      }
    };

    const removeSelectedVector = () => {
      dispatch(removeVector(stage, data));
    };

    const addNewVector = () => {
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

    const moveSelectedMolSettings = newItemDataset => {
      if (newItemDataset) {
        if (isLigandOn) {
          let representations = getRepresentationsByType(objectsInView, data, OBJECT_TYPE.LIGAND);
          dispatch(addLigand(stage, newItemDataset, colourToggle, false, representations));
        }
        if (isProteinOn) {
          let representations = getRepresentationsByType(objectsInView, data, OBJECT_TYPE.HIT_PROTEIN);
          dispatch(addHitProtein(stage, newItemDataset, colourToggle, representations));
        }
        if (isComplexOn) {
          let representations = getRepresentationsByType(objectsInView, data, OBJECT_TYPE.COMPLEX);
          dispatch(addComplex(stage, newItemDataset, colourToggle, representations));
        }
        if (isSurfaceOn) {
          let representations = getRepresentationsByType(objectsInView, data, OBJECT_TYPE.SURFACE);
          dispatch(addSurface(stage, newItemDataset, colourToggle, representations));
        }
        if (isDensityOn) {
          let representations = getRepresentationsByType(objectsInView, data, OBJECT_TYPE.DENSITY);
          dispatch(addDensity(stage, newItemDataset, colourToggle, representations));
        }
        if (isVectorOn) {
          dispatch(addVector(stage, newItemDataset)).catch(error => {
            throw new Error(error);
          });
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
      moveSelectedMolSettings(nextItemData);
    };

    const handleClickOnUpArrow = () => {
      const refPrevious = ref.current.previousSibling;
      scrollToElement(refPrevious);

      removeOfAllSelectedTypes();
      moveSelectedMolSettings(previousItemData);
    };

    let moleculeTitle = data?.protein_code.replace(`${target_on_name}-`, '');

    return (
      <>
        <Grid container justify="space-between" direction="row" className={classes.container} wrap="nowrap" ref={ref}>
          {/* Site number */}
          <Grid item container justify="space-between" direction="column" className={classes.site}>
            <Grid item>
              <Typography variant="subtitle2">{data.site || moleculeGroupID}</Typography>
            </Grid>
            <Grid item className={classes.rank}>
              {index + 1}.
            </Grid>
          </Grid>
          <Grid item container className={classes.detailsCol} justify="space-between" direction="row">
            {/* Title label */}
            <Grid item xs={7}>
              <Tooltip title={moleculeTitle} placement="bottom-start">
                <div className={classes.moleculeTitleLabel}>{moleculeTitle}</div>
              </Tooltip>
            </Grid>
            {/* Control Buttons A, L, C, V */}
            <Grid item xs={5}>
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
                        dispatch(centerOnLigandByMoleculeID(stage, data?.id));
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
                <Tooltip title="electron density">
                  <Grid item>
                    {/* TODO waiting for backend data */}
                    <Button
                      variant="outlined"
                      className={classNames(classes.contColButton, {
                        [classes.contColButtonSelected]: isDensityOn
                      })}
                      onClick={() => onDensity()}
                      disabled={true || disableUserInteraction}
                    >
                      D
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
                      disabled={disableUserInteraction}
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
          imgData={img_data}
          width={imageWidth}
          height={imageHeight}
        />
      </>
    );
  }
);

MoleculeView.displayName = 'MoleculeView';
export default MoleculeView;
