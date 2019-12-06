/**
 * Created by abradley on 14/03/2018.
 */

import React, { memo, useEffect, useState, useRef, useContext } from 'react';
import { connect } from 'react-redux';
import { Grid, Button, makeStyles, Typography, useTheme } from '@material-ui/core';
import * as nglLoadActions from '../../reducers/ngl/nglActions';
import * as selectionActions from '../../reducers/selection/selectionActions';
import * as listTypes from '../listTypes';
import SVGInline from 'react-svg-inline';
import MoleculeStatusView, { molStatusTypes } from './moleculeStatusView';
import classNames from 'classnames';
import { api } from '../../utils/api';
import { VIEWS } from '../../constants/constants';
import { loadFromServer } from '../../utils/genericView';
import { OBJECT_TYPE } from '../nglView/constants';
import { NglContext } from '../nglView/nglProvider';
import { useDisableUserInteraction } from '../useEnableUserInteracion';

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
    minWidth: 190
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
    vector_list,
    complexList,
    fragmentDisplayList,
    vectorOnList,
    getFullGraph,
    setVectorList,
    setBondColorMap,
    selectVector,
    gotFullGraph,
    setMol,
    deleteObject,
    loadObject,
    appendComplexList,
    removeFromComplexList,
    appendVectorOnList,
    removeFromVectorOnList,
    appendFragmentDisplayList,
    removeFromFragmentDisplayList,
    incrementCountOfPendingVectorLoadRequests,
    decrementCountOfPendingVectorLoadRequests
  }) => {
    const theme = useTheme();
    const [state, setState] = useState();
    const currentID = (data && data.id) || undefined;
    const classes = useStyles();
    const key = 'mol_image';
    const base_url = window.location.protocol + '//' + window.location.host;
    const url = new URL(base_url + '/api/molimg/' + data.id + '/');
    const [img_data, setImg_data] = useState(img_data_init);

    const { getNglView } = useContext(NglContext);
    const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

    const isLigandOn = (currentID && fragmentDisplayList.has(currentID)) || false;
    const isComplexOn = (currentID && complexList.has(currentID)) || false;
    const isVectorOn = (currentID && vectorOnList.has(currentID)) || false;
    const hasAllValuesOn = isLigandOn && isComplexOn && isVectorOn;

    const disableUserInteraction = useDisableUserInteraction();

    const oldUrl = useRef('');
    const setOldUrl = url => {
      oldUrl.current = url;
    };
    const refOnCancel = useRef();
    const getRandomColor = () => colourList[data.id % colourList.length];
    const colourToggle = getRandomColor();

    const getViewUrl = get_view => {
      return new URL(base_url + '/api/' + get_view + '/' + data.id + '/');
    };

    const generateArrowObject = (start, end, name, colour) => ({
      name: listTypes.VECTOR + '_' + name,
      OBJECT_TYPE: OBJECT_TYPE.ARROW,
      start: start,
      end: end,
      colour: colour,
      site: data.site
    });

    const generateCylinderObject = (start, end, name, colour) => ({
      name: listTypes.VECTOR + '_' + name,
      OBJECT_TYPE: OBJECT_TYPE.CYLINDER,
      start: start,
      end: end,
      colour: colour,
      site: data.site
    });

    /**
     * Convert the JSON into a list of arrow objects
     */
    const generateObjectList = out_data => {
      const colour = [1, 0, 0];
      const deletions = out_data.deletions;
      const additions = out_data.additions;
      const linkers = out_data.linkers;
      const rings = out_data.ring;
      let outList = [];

      for (let item in deletions) {
        outList.push(generateArrowObject(deletions[item][0], deletions[item][1], item.split('_')[0], colour));
      }

      for (let item in additions) {
        outList.push(generateArrowObject(additions[item][0], additions[item][1], item.split('_')[0], colour));
      }

      for (let item in linkers) {
        outList.push(generateCylinderObject(linkers[item][0], linkers[item][1], item.split('_')[0], colour));
      }

      for (let item in rings) {
        outList.push(generateCylinderObject(rings[item][0], rings[item][2], item.split('_')[0], colour));
      }

      return outList;
    };

    const generateMolObject = () => ({
      name: 'MOLLOAD' + '_' + data.id.toString(),
      OBJECT_TYPE: OBJECT_TYPE.MOLECULE,
      colour: colourToggle,
      sdf_info: data.sdf_info
    });

    const generateMolId = () => ({
      id: data.id
    });

    const generateObject = () => ({
      name: data.protein_code + '_COMP',
      OBJECT_TYPE: OBJECT_TYPE.COMPLEX,
      sdf_info: data.sdf_info,
      colour: colourToggle,
      prot_url: base_url + data.molecule_protein
    });

    const generateBondColorMap = inputDict => {
      var out_d = {};
      for (let keyItem in inputDict) {
        for (let vector in inputDict[keyItem]) {
          const vect = vector.split('_')[0];
          out_d[vect] = inputDict[keyItem][vector];
        }
      }
      return out_d;
    };

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

    const onLigand = () => {
      if (isLigandOn) {
        deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMolObject()), stage);
        removeFromFragmentDisplayList(generateMolId());
      } else {
        loadObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMolObject(colourToggle)), stage);
        appendFragmentDisplayList(generateMolId());
      }
    };

    const onComplex = () => {
      if (isComplexOn) {
        deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateObject()), stage);
        removeFromComplexList(generateMolId());
      } else {
        loadObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateObject()), stage);
        appendComplexList(generateMolId());
      }
    };

    const handleVector = json => {
      var objList = generateObjectList(json['3d']);
      setVectorList(objList);
      var vectorBondColorMap = generateBondColorMap(json['indices']);
      setBondColorMap(vectorBondColorMap);
    };

    const onVector = () => {
      if (isVectorOn) {
        vector_list.forEach(item => deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, item), stage));
        setMol('');
        removeFromVectorOnList(generateMolId());
      } else {
        vector_list.forEach(item => deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, item), stage));
        // Set this
        getFullGraph(data);
        // Do the query
        incrementCountOfPendingVectorLoadRequests();
        Promise.all([
          api({ url: getViewUrl('vector') })
            .then(response => handleVector(response.data['vectors']))
            .catch(error => {
              setState(() => {
                throw error;
              });
            }),
          api({ url: getViewUrl('graph') })
            .then(response => gotFullGraph(response.data['graph']))
            .catch(error => {
              setState(() => {
                throw error;
              });
            })
        ]).finally(() => {
          decrementCountOfPendingVectorLoadRequests();
        });
        appendVectorOnList(generateMolId());
        selectVector(undefined);
      }
    };

    const onSelectAll = () => {
      onLigand();
      onComplex();
      onVector();
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
              onClick={onSelectAll}
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
              onClick={onLigand}
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
              onClick={onComplex}
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
              onClick={onVector}
              disabled={disableUserInteraction}
            >
              <Typography variant="caption">V</Typography>
            </Button>
          </Grid>
        </Grid>
        <Grid item container className={classes.detailsCol} wrap="nowrap">
          {/* Status code */}
          <Grid item container direction="column" justify="space-between" className={classes.statusCol}>
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
          </Grid>

          {/* Image */}
          <Grid item style={current_style}>
            <div>{svg_image}</div>
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
    vector_list: state.selectionReducers.present.vector_list,
    complexList: state.selectionReducers.present.complexList,
    fragmentDisplayList: state.selectionReducers.present.fragmentDisplayList,
    vectorOnList: state.selectionReducers.present.vectorOnList
  };
}
const mapDispatchToProps = {
  getFullGraph: selectionActions.getFullGraph,
  setVectorList: selectionActions.setVectorList,
  setBondColorMap: selectionActions.setBondColorMap,
  selectVector: selectionActions.selectVector,
  gotFullGraph: selectionActions.gotFullGraph,
  setMol: selectionActions.setMol,
  deleteObject: nglLoadActions.deleteObject,
  loadObject: nglLoadActions.loadObject,
  appendComplexList: selectionActions.appendComplexList,
  removeFromComplexList: selectionActions.removeFromComplexList,
  appendVectorOnList: selectionActions.appendVectorOnList,
  removeFromVectorOnList: selectionActions.removeFromVectorOnList,
  appendFragmentDisplayList: selectionActions.appendFragmentDisplayList,
  removeFromFragmentDisplayList: selectionActions.removeFromFragmentDisplayList,
  incrementCountOfPendingVectorLoadRequests: selectionActions.incrementCountOfPendingVectorLoadRequests,
  decrementCountOfPendingVectorLoadRequests: selectionActions.decrementCountOfPendingVectorLoadRequests
};

MoleculeView.displayName = 'MoleculeView';
export default connect(mapStateToProps, mapDispatchToProps)(MoleculeView);
