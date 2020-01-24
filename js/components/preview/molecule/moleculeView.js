/**
 * Created by abradley on 14/03/2018.
 */

import React, { memo, useEffect, useState, useRef, useContext } from 'react';
import { connect } from 'react-redux';
import { Grid, Button, makeStyles, Typography, useTheme } from '@material-ui/core';
import SVGInline from 'react-svg-inline';
import MoleculeStatusView, { molStatusTypes } from './moleculeStatusView';
import classNames from 'classnames';
import { VIEWS } from '../../../constants/constants';
import { loadFromServer } from '../../../utils/genericView';
import { NglContext } from '../../nglView/nglProvider';
import { useDisableUserInteraction } from '../../helpers/useEnableUserInteracion';
import { ComputeSize } from '../../../utils/computeSize';
import { addVector, removeVector, addComplex, removeComplex, addLigand, removeLigand } from './redux/dispatchActions';
import { base_url } from '../../routes/constants';

const containerHeight = 76;

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(1) / 4,
    color: 'black',
    height: containerHeight
  },
  contButtonsDimensions: {
    width: theme.spacing(2),
    height: theme.spacing(2)
  },
  contColButton: {
    padding: 0,
    minWidth: 'unset',
    borderRadius: 0,
    borderColor: 'white',
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
    color: theme.palette.primary.contrastText
  },
  detailsCol: {
    border: 'solid 1px #DEDEDE'
  },
  statusCol: {
    width: 'fit-content',
    height: '100%',
    paddingLeft: 2
  },
  propsCol: {
    fontSize: '10px',
    width: 183
  },
  fitContentWidth: {
    width: 'fit-content'
  },
  fitContentWidthAndPadding: {
    width: 'fit-content',
    paddingLeft: theme.spacing(1) / 2,
    paddingRight: theme.spacing(1) / 2,
    paddingTop: theme.spacing(1) / 4,
    paddingBottom: theme.spacing(1) / 4
  },
  fitContentHeight: {
    height: 'fit-content'
  },
  imageMargin: {
    marginTop: -theme.spacing(2)
  }
}));

const colourList = [
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
    height,
    width,
    data,
    to_query,
    complexList,
    fragmentDisplayList,
    vectorOnList,
    addVector,
    removeVector,
    addComplex,
    removeComplex,
    addLigand,
    removeLigand
  }) => {
    const theme = useTheme();
    const statusCodeRef = useRef(null);
    const [statusCodeWidth, setStatusCodeWidth] = useState(0);

    const [state, setState] = useState();
    const selectedAll = useRef(false);
    const currentID = (data && data.id) || undefined;
    const classes = useStyles();
    const key = 'mol_image';

    const url = new URL(base_url + '/api/molimg/' + data.id + '/');
    const [img_data, setImg_data] = useState(img_data_init);

    const { getNglView } = useContext(NglContext);
    const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

    const isLigandOn = (currentID && fragmentDisplayList.includes(currentID)) || false;
    const isComplexOn = (currentID && complexList.includes(currentID)) || false;
    const isVectorOn = (currentID && vectorOnList.includes(currentID)) || false;

    const hasAllValuesOn = isLigandOn && isComplexOn && isVectorOn;

    const disableUserInteraction = useDisableUserInteraction();

    const oldUrl = useRef('');
    const setOldUrl = url => {
      oldUrl.current = url;
    };
    const refOnCancel = useRef();
    const getRandomColor = () => colourList[data.id % colourList.length];
    const colourToggle = getRandomColor();

    const getCalculatedProps = () => [
      { name: 'MW', value: data.mw },
      { name: 'logP', value: data.logp },
      { name: 'TPSA', value: data.tpsa },
      { name: 'HA', value: data.ha },
      { name: 'Hacc', value: data.hacc },
      { name: 'Hdon', value: data.hdon },
      { name: 'Rots', value: data.rots },
      { name: 'Rings', value: data.rings },
      { name: 'Velec', value: data.velec },
      { name: '#cpd', value: '???' }
    ];

    // componentDidMount
    useEffect(() => {
      if (refOnCancel.current === undefined) {
        let onCancel = () => {};
        loadFromServer({
          width,
          height,
          key,
          old_url: oldUrl.current,
          setImg_data,
          setOld_url: newUrl => setOldUrl(newUrl),
          url,
          cancel: onCancel
        }).catch(error => {
          setState(() => {
            throw error;
          });
        });
        refOnCancel.current = onCancel;
      }
      return () => {
        if (refOnCancel) {
          refOnCancel.current();
        }
      };
    }, [complexList, data.id, data.smiles, fragmentDisplayList, height, to_query, url, vectorOnList, width]);

    const svg_image = (
      <SVGInline
        component="div"
        svg={img_data}
        height="inherit"
        width="inherit"
        className={classes.imageMargin}
        style={{
          height: `${height}px`,
          width: `${width}px`,
          marginTop: `-10px`
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
      addLigand(stage, data, colourToggle);
    };

    const removeSelectedLigand = () => {
      removeLigand(stage, data);
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
      removeComplex(stage, data, colourToggle);
      selectedAll.current = false;
    };

    const addNewComplex = () => {
      addComplex(stage, data, colourToggle);
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
      removeVector(stage, data);
      selectedAll.current = false;
    };

    const addNewVector = () => {
      addVector(stage, data).catch(error => {
        setState(() => {
          throw error;
        });
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
      <Grid container justify="flex-start" direction="row" className={classes.container} wrap="nowrap">
        {/* Site number */}
        <Grid item container justify="center" direction="column" className={classes.fitContentWidth}>
          <Grid item>
            <Typography variant="h4">{data.site}</Typography>
          </Grid>
        </Grid>

        {/* Control Buttons A, L, C, V */}
        <Grid
          item
          container
          direction="column"
          justify="flex-start"
          alignItems="center"
          className={classes.fitContentWidth}
        >
          <Grid item className={classes.contButtonsDimensions}>
            <Button
              variant="outlined"
              fullWidth
              className={classNames(classes.contColButton, {
                [classes.contColButtonSelected]: hasAllValuesOn
              })}
              onClick={() => {
                selectedAll.current = !selectedAll.current;

                onLigand(true);
                onComplex(true);
                onVector(true);
              }}
              disabled={disableUserInteraction}
            >
              <Typography variant="caption">A</Typography>
            </Button>
          </Grid>
          <Grid item className={classes.contButtonsDimensions}>
            <Button
              variant="outlined"
              fullWidth
              className={classNames(classes.contColButton, {
                [classes.contColButtonSelected]: isLigandOn
              })}
              onClick={() => onLigand()}
              disabled={disableUserInteraction}
            >
              <Typography variant="caption">L</Typography>
            </Button>
          </Grid>
          <Grid item className={classes.contButtonsDimensions}>
            <Button
              variant="outlined"
              fullWidth
              className={classNames(classes.contColButton, {
                [classes.contColButtonSelected]: isComplexOn
              })}
              onClick={() => onComplex()}
              disabled={disableUserInteraction}
            >
              <Typography variant="caption">C</Typography>
            </Button>
          </Grid>
          <Grid item className={classes.contButtonsDimensions}>
            <Button
              variant="outlined"
              fullWidth
              className={classNames(classes.contColButton, {
                [classes.contColButtonSelected]: isVectorOn
              })}
              onClick={() => onVector()}
              disabled={disableUserInteraction}
            >
              <Typography variant="caption">V</Typography>
            </Button>
          </Grid>
        </Grid>
        <Grid item container className={classes.detailsCol} wrap="nowrap" justify="space-between">
          {/* Status code */}
          <Grid
            item
            container
            direction="column"
            justify="space-between"
            className={classes.statusCol}
            ref={statusCodeRef}
          >
            <ComputeSize componentRef={statusCodeRef.current} width={statusCodeWidth} setWidth={setStatusCodeWidth}>
              <Grid item>
                <Typography variant="subtitle2" noWrap>
                  {data.protein_code}
                </Typography>
              </Grid>
              <Grid item container justify="space-around" direction="row">
                {Object.values(molStatusTypes).map(type => (
                  <Grid item key={`molecule-status-${type}`} className={classes.fitContentHeight}>
                    <MoleculeStatusView type={type} data={data} />
                  </Grid>
                ))}
              </Grid>
            </ComputeSize>
          </Grid>

          {/* Image */}
          <Grid
            item
            style={{
              ...current_style,
              width: `calc(100% - 183px - ${statusCodeWidth}px - ${theme.spacing(1) / 2}px)`,
              marginLeft: theme.spacing(1) / 2
            }}
            container
            justify="center"
          >
            <Grid item>{svg_image}</Grid>
          </Grid>

          {/* Molecule preperties */}
          <Grid item container className={classes.propsCol} direction="row" justify="center">
            <Grid item xs={12} container direction="row" justify="flex-end">
              {getCalculatedProps()
                .slice(0, 5)
                .map(p => (
                  <Grid
                    item
                    container
                    justify="space-around"
                    alignItems="center"
                    direction="column"
                    key={`calc-prop-${p.name}`}
                    className={classes.fitContentWidthAndPadding}
                  >
                    <Grid item>
                      <Typography variant="subtitle2">{p.name}</Typography>
                    </Grid>
                    <Grid item>{p.value}</Grid>
                  </Grid>
                ))}
            </Grid>
            <Grid item xs={12} container direction="row" justify="flex-end">
              {getCalculatedProps()
                .slice(5)
                .map(p => (
                  <Grid
                    item
                    container
                    justify="space-around"
                    alignItems="center"
                    direction="column"
                    key={`calc-prop-${p.name}`}
                    className={classes.fitContentWidthAndPadding}
                  >
                    <Grid item>
                      <Typography variant="subtitle2">{p.name}</Typography>
                    </Grid>
                    <Grid item>{p.value}</Grid>
                  </Grid>
                ))}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
);
function mapStateToProps(state) {
  return {
    to_query: state.selectionReducers.present.to_query,
    complexList: state.selectionReducers.present.complexList,
    fragmentDisplayList: state.selectionReducers.present.fragmentDisplayList,
    vectorOnList: state.selectionReducers.present.vectorOnList
  };
}
const mapDispatchToProps = {
  addVector,
  removeVector,
  addComplex,
  removeComplex,
  addLigand,
  removeLigand
};

MoleculeView.displayName = 'MoleculeView';
export default connect(mapStateToProps, mapDispatchToProps)(MoleculeView);
