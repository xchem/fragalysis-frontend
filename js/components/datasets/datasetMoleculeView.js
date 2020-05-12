/**
 * Created by abradley on 14/03/2018.
 */

import React, { memo, useEffect, useState, useRef, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Button, makeStyles, Typography, Tooltip, LinearProgress } from '@material-ui/core';
import SVGInline from 'react-svg-inline';
import classNames from 'classnames';
import { VIEWS } from '../../constants/constants';
import { loadFromServer } from '../../utils/genericView';
import { NglContext } from '../nglView/nglProvider';
import { useDisableUserInteraction } from '../helpers/useEnableUserInteracion';
import {
  addLigand,
  removeLigand,
  addProtein,
  removeProtein,
  addComplex,
  removeComplex,
  addSurface,
  removeSurface,
  loadCompoundScoreList
} from './redux/dispatchActions';
import { base_url } from '../routes/constants';

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
    paddingLeft: theme.spacing(1) / 2,
    paddingRight: theme.spacing(1) / 2,
    paddingBottom: theme.spacing(1) / 8,
    paddingTop: theme.spacing(1) / 8,
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
    borderColor: theme.palette.background.divider
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
  loadingProgress: {
    height: 2,
    width: '100%'
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

const DatasetMoleculeView = memo(({ imageHeight, imageWidth, data, datasetID }) => {
  // const [countOfVectors, setCountOfVectors] = useState('-');
  // const [cmpds, setCmpds] = useState('-');
  const selectedAll = useRef(false);
  const currentID = (data && data.id) || undefined;
  const classes = useStyles();
  const key = 'mol_image';

  const dispatch = useDispatch();
  const ligandList = useSelector(state => state.datasetsReducers.ligandLists[datasetID]);
  const proteinList = useSelector(state => state.datasetsReducers.proteinLists[datasetID]);
  const complexList = useSelector(state => state.datasetsReducers.complexLists[datasetID]);
  const surfaceList = useSelector(state => state.datasetsReducers.surfaceLists[datasetID]);
  const scoreCompoundMap = useSelector(state => state.datasetsReducers.scoreCompoundMap[data.id]);
  const filter = useSelector(state => state.selectionReducers.filter);

  const url = new URL(base_url + '/api/molimg/' + data.id + '/');
  const [img_data, setImg_data] = useState(img_data_init);

  const { getNglView } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

  const isLigandOn = (currentID && ligandList.includes(currentID)) || false;
  const isProteinOn = (currentID && proteinList.includes(currentID)) || false;
  const isComplexOn = (currentID && complexList.includes(currentID)) || false;
  const isSurfaceOn = (currentID && surfaceList.includes(currentID)) || false;

  const hasAllValuesOn = isLigandOn && isProteinOn && isComplexOn && isSurfaceOn;
  const hasSomeValuesOn = !hasAllValuesOn && (isLigandOn || isProteinOn || isComplexOn || isSurfaceOn);

  const disableUserInteraction = useDisableUserInteraction();

  const oldUrl = useRef('');
  const setOldUrl = url => {
    oldUrl.current = url;
  };
  const refOnCancelImage = useRef();
  const refOnCancelScore = useRef();
  const getRandomColor = () => colourList[data.id % colourList.length];
  const colourToggle = getRandomColor();

  // componentDidMount
  useEffect(() => {
    if (refOnCancelImage.current === undefined) {
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
      refOnCancelImage.current = onCancel;
    }
    return () => {
      if (refOnCancelImage) {
        refOnCancelImage.current();
      }
    };
  }, [complexList, data.id, data.smiles, ligandList, imageHeight, url, imageWidth]);

  useEffect(() => {
    if (refOnCancelScore.current === undefined && data && data.id) {
      let onCancel = () => {};
      dispatch(loadCompoundScoreList(data.id, onCancel)).catch(error => {
        throw new Error(error);
      });
      refOnCancelScore.current = onCancel;
    }
    return () => {
      if (refOnCancelScore) {
        refOnCancelScore.current();
      }
    };
  });

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
  const current_style = isLigandOn || isProteinOn || isComplexOn || isSurfaceOn ? selected_style : not_selected_style;

  const addNewLigand = () => {
    dispatch(addLigand(stage, data, colourToggle, datasetID));
  };

  const removeSelectedLigand = () => {
    dispatch(removeLigand(stage, data, colourToggle, datasetID));
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
    dispatch(removeProtein(stage, data, colourToggle, datasetID));
    selectedAll.current = false;
  };

  const addNewProtein = () => {
    dispatch(addProtein(stage, data, colourToggle, datasetID));
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
    dispatch(removeComplex(stage, data, colourToggle, datasetID));
    selectedAll.current = false;
  };

  const addNewComplex = () => {
    dispatch(addComplex(stage, data, colourToggle, datasetID));
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
    dispatch(removeSurface(stage, data, colourToggle, datasetID));
    selectedAll.current = false;
  };

  const addNewSurface = () => {
    dispatch(addSurface(stage, data, colourToggle, datasetID));
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
    if (filter.predefined !== 'none') {
      cssClass = isMatchingValue(item) ? classes.matchingValue : classes.unmatchingValue;
    }
    return cssClass;
  };

  const moleculeTitle = data && data.name;

  return (
    <Grid container justify="space-between" direction="row" className={classes.container} wrap="nowrap">
      {/* Site number */}
      <Grid item container justify="center" direction="column" className={classes.site}>
        <Grid item>
          <Typography variant="subtitle2">{data.site}</Typography>
        </Grid>
      </Grid>

      <Grid item container className={classes.detailsCol} justify="space-between" direction="row">
        {/* Title label */}
        <Grid item xs={7}>
          <Tooltip title={moleculeTitle} placement="bottom-start">
            <div className={classes.moleculeTitleLabel}>{moleculeTitle}</div>
          </Tooltip>
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
                    onSurface(true);
                  }}
                  disabled={disableUserInteraction}
                >
                  <Typography variant="subtitle2">A</Typography>
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
                  <Typography variant="subtitle2">L</Typography>
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
                  <Typography variant="subtitle2">P</Typography>
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
                  <Typography variant="subtitle2">C</Typography>
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
                  <Typography variant="subtitle2">S</Typography>
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
            {scoreCompoundMap &&
              scoreCompoundMap.map(item => (
                <Tooltip title={`${item.score.name} - ${item.score.description}`} key={item.id}>
                  <Grid item className={classNames(classes.rightBorder, getValueMatchingClass(item))}>
                    {item.value && Math.round(item.value)}
                  </Grid>
                </Tooltip>
              ))}
            {!scoreCompoundMap && (
              <LinearProgress variant="query" color="secondary" className={classes.loadingProgress} />
            )}
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
      >
        <Grid item>{svg_image}</Grid>
      </Grid>
    </Grid>
  );
});

DatasetMoleculeView.displayName = 'DatasetMoleculeView';
export default DatasetMoleculeView;
