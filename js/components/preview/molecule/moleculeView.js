/**
 * Created by abradley on 14/03/2018.
 */

import React, { memo, useEffect, useState, useRef, useContext, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Button, makeStyles, Typography, Tooltip } from '@material-ui/core';
import SVGInline from 'react-svg-inline';
import MoleculeStatusView, { molStatusTypes } from './moleculeStatusView';
import classNames from 'classnames';
import { VIEWS } from '../../../constants/constants';
import { loadFromServer } from '../../../utils/genericView';
import { NglContext } from '../../nglView/nglProvider';
import { useDisableUserInteraction } from '../../helpers/useEnableUserInteracion';
import { addVector, removeVector, addComplex, removeComplex, addLigand, removeLigand } from './redux/dispatchActions';
import { base_url } from '../../routes/constants';
import { moleculeProperty } from './helperConstants';
import { api } from '../../../utils/api';
import { generateObjectList } from '../../session/helpers';
import { getTotalCountOfCompounds } from './molecules_helpers';

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
  contColButtonHalfSelected: {
    backgroundColor: theme.palette.primary.semidark
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
    borderColor: theme.palette.background.divider
  },
  qualityLabel: {
    paddingLeft: theme.spacing(1) / 4,
    paddingRight: theme.spacing(1) / 4
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

const MoleculeView = memo(({ imageHeight, imageWidth, data }) => {
  // const [countOfVectors, setCountOfVectors] = useState('-');
  // const [cmpds, setCmpds] = useState('-');
  const selectedAll = useRef(false);
  const currentID = (data && data.id) || undefined;
  const classes = useStyles();
  const key = 'mol_image';

  const dispatch = useDispatch();
  const to_query = useSelector(state => state.selectionReducers.to_query);
  const complexList = useSelector(state => state.selectionReducers.complexList);
  const fragmentDisplayList = useSelector(state => state.selectionReducers.fragmentDisplayList);
  const vectorOnList = useSelector(state => state.selectionReducers.vectorOnList);
  const target_on_name = useSelector(state => state.apiReducers.target_on_name);

  const url = new URL(base_url + '/api/molimg/' + data.id + '/');
  const [img_data, setImg_data] = useState(img_data_init);

  const { getNglView } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

  const isLigandOn = (currentID && fragmentDisplayList.includes(currentID)) || false;
  const isComplexOn = (currentID && complexList.includes(currentID)) || false;
  const isVectorOn = (currentID && vectorOnList.includes(currentID)) || false;

  const hasAllValuesOn = isLigandOn && isComplexOn && isVectorOn;
  const hasSomeValuesOn = !hasAllValuesOn && (isLigandOn || isComplexOn || isVectorOn);

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
  }, [complexList, data.id, data.smiles, fragmentDisplayList, imageHeight, to_query, url, vectorOnList, imageWidth]);

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
  const current_style = isLigandOn || isComplexOn || isVectorOn ? selected_style : not_selected_style;

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

  const removeSelectedVector = () => {
    dispatch(removeVector(stage, data));
    selectedAll.current = false;
  };

  const addNewVector = () => {
    dispatch(addVector(stage, data)).catch(error => {
      throw new Error(error);
    });
  };

  const onVector = calledFromSelectAll => {
    if (calledFromSelectAll === true && selectedAll.current === true) {
      if (isVectorOn === false) {
        addNewVector();
      }
    } else if (calledFromSelectAll && selectedAll.current === false) {
      removeSelectedVector();
    } else if (!calledFromSelectAll) {
      if (isVectorOn === false) {
        addNewVector();
      } else {
        removeSelectedVector();
      }
    }
  };

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
        <Grid item>
          <Typography variant="button" noWrap>
            {target_on_name && data.protein_code && data.protein_code.replace(`${target_on_name}-`, '')}
          </Typography>
        </Grid>
        {/* Status code */}
        <Grid item>
          <Grid container direction="row" justify="space-between" alignItems="center">
            {Object.values(molStatusTypes).map(type => (
              <Grid item key={`molecule-status-${type}`} className={classes.qualityLabel}>
                <MoleculeStatusView type={type} data={data} />
              </Grid>
            ))}
          </Grid>
        </Grid>

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
                  onComplex(true);
                  onVector(true);
                }}
                disabled={disableUserInteraction}
              >
                <Typography variant="subtitle2">A</Typography>
              </Button>
            </Grid>
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
            <Grid item>
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
            <Grid item>
              <Button
                variant="outlined"
                className={classNames(classes.contColButton, {
                  [classes.contColButtonSelected]: isVectorOn
                })}
                onClick={() => onVector()}
                disabled={disableUserInteraction}
              >
                <Typography variant="subtitle2">V</Typography>
              </Button>
            </Grid>
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
                <Grid item className={classes.rightBorder}>
                  {item.name === moleculeProperty.mw && Math.round(item.value)}
                  {item.name === moleculeProperty.logP && Math.round(item.value).toPrecision(1)}
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

MoleculeView.displayName = 'MoleculeView';
export default MoleculeView;
