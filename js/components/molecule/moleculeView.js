/**
 * Created by abradley on 14/03/2018.
 */

import React, { memo, useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import { Grid, Button, makeStyles } from '@material-ui/core';
import * as nglLoadActions from '../../reducers/ngl/nglLoadActions';
import * as selectionActions from '../../reducers/selection/selectionActions';
import * as listTypes from '../listTypes';
import SVGInline from 'react-svg-inline';
import MoleculeStatusView, { molStatusTypes } from './moleculeStatusView';
import classNames from 'classnames';
import { fetchWithMemoize } from '../generalComponents';
import { VIEWS } from '../../constants/constants';
import { loadFromServer } from '../../utils/genericView';
import { OBJECT_TYPE } from '../nglView/constants';

const useStyles = makeStyles(theme => ({
  container: {
    width: '100%',
    padding: '4px 0',
    color: 'black'
  },
  siteCol: {
    width: '24px',
    fontSize: '24px'
  },
  contCol: {
    width: '24px'
  },
  contColGridItem: {
    height: '16px',
    display: 'flex'
  },
  contColButton: {
    padding: 0,
    minWidth: 'unset',
    borderRadius: 0,
    borderColor: 'white',
    backgroundColor: '#D8E7F4',
    '&:hover': {
      backgroundColor: '#2B69AA'
    }
  },
  contColButtonSelected: {
    backgroundColor: '#2B69AA'
  },
  detailsCol: {
    // - 24px (siteCol) - 24px (contCol)
    width: 'calc(100% - 24px - 24px)',
    border: 'solid 1px #DEDEDE'
  },
  statusCol: {
    width: '30%'
  },
  statusColStatusRow: {
    paddingTop: '8px'
  },
  statusColStatusRowItem: {
    width: '33%'
  },
  textBold: {
    fontWeight: 'bold'
  },
  imageCol: {
    width: '30%',
    display: 'flex',
    justifyContent: 'center'
  },
  propsCol: {
    width: '40%',
    fontSize: '10px'
  },
  propsColItem: {
    width: '20%'
  },
  centered: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
}));

const controlValues = {
  COMPLEX: 1,
  LIGAND: 2,
  VECTOR: 3
};

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

const img_data_init =
  '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="50px" height="50px"><g>' +
  '<circle cx="50" cy="0" r="5" transform="translate(5 5)"/>' +
  '<circle cx="75" cy="6.6987298" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="93.3012702" cy="25" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="100" cy="50" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="93.3012702" cy="75" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="75" cy="93.3012702" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="50" cy="100" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="25" cy="93.3012702" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="6.6987298" cy="75" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="0" cy="50" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="6.6987298" cy="25" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="25" cy="6.6987298" r="5" transform="translate(5 5)"/> ' +
  '<animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 55 55" to="360 55 55" dur="3s" repeatCount="indefinite" /> </g> ' +
  '</svg>';

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
    removeFromFragmentDisplayList
  }) => {
    const currentID = (data && data.id) || undefined;
    const classes = useStyles();
    const key = 'mol_image';
    const base_url = window.location.protocol + '//' + window.location.host;
    const url = new URL(base_url + '/api/molimg/' + data.id + '/');
    const [img_data, setImg_data] = useState(img_data_init);

    const isLigandOn = (currentID && fragmentDisplayList.has(currentID)) || false;
    const isComplexOn = (currentID && complexList.has(currentID)) || false;
    const isVectorOn = (currentID && vectorOnList.has(currentID)) || false;
    const hasAllValuesOn = isLigandOn && isComplexOn && isVectorOn;

    const oldUrl = useRef('');
    const setOldUrl = url => {
      oldUrl.current = url;
    };
    const refDidMount = useRef(false);
    const getRandomColor = () => colourList[data.id % colourList.length];
    const colourToggle = getRandomColor();

    const getViewUrl = get_view => {
      return new URL(base_url + '/api/' + get_view + '/' + data.id + '/');
    };

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

    const generateArrowObject = (start, end, name, colour) => ({
      name: listTypes.VECTOR + '_' + name,
      OBJECT_TYPE: OBJECT_TYPE.ARROW,
      start: start,
      end: end,
      colour: colour
    });

    const generateCylinderObject = (start, end, name, colour) => ({
      name: listTypes.VECTOR + '_' + name,
      OBJECT_TYPE: OBJECT_TYPE.CYLINDER,
      start: start,
      end: end,
      colour: colour
    });

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

    const handleVector = json => {
      var objList = generateObjectList(json['3d']);
      setVectorList(objList);
      var vectorBondColorMap = generateBondColorMap(json['indices']);
      setBondColorMap(vectorBondColorMap);
    };

    // componentDidMount
    useEffect(() => {
      if (refDidMount.current === false) {
        loadFromServer({
          width,
          height,
          key,
          old_url: oldUrl.current,
          setImg_data,
          setOld_url: newUrl => setOldUrl(newUrl),
          url
        });

        refDidMount.current = true;
      }
    }, [complexList, data.id, data.smiles, fragmentDisplayList, height, to_query, url, vectorOnList, width]);

    const svg_image = <SVGInline svg={img_data} />;
    // Here add the logic that updates this based on the information
    // const refinement = <Label bsStyle="success">{"Refined"}</Label>;
    const selected_style = {
      height: height.toString() + 'px',
      backgroundColor: colourToggle
    };
    const not_selected_style = { height: height.toString() + 'px' };
    const current_style = isLigandOn || isComplexOn || isVectorOn ? selected_style : not_selected_style;

    const onLigand = () => {
      if (isLigandOn) {
        deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMolObject()));
        removeFromFragmentDisplayList(generateMolId());
      } else {
        loadObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMolObject(colourToggle)));
        appendFragmentDisplayList(generateMolId());
      }
    };

    const onComplex = () => {
      if (isComplexOn) {
        deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateObject()));
        removeFromComplexList(generateMolId());
      } else {
        loadObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateObject()));
        appendComplexList(generateMolId());
      }
    };

    const onVector = () => {
      if (isVectorOn) {
        vector_list.forEach(item => deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, item)));
        setMol('');
        removeFromVectorOnList(generateMolId());
      } else {
        vector_list.forEach(item => deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, item)));
        fetchWithMemoize(getViewUrl('vector')).then(json => handleVector(json['vectors']));
        // Set this
        getFullGraph(data);
        // Do the query
        fetchWithMemoize(getViewUrl('graph')).then(json => gotFullGraph(json['graph']));
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
      <Grid container className={classes.container}>
        <Grid item className={classNames(classes.siteCol, classes.centered)}>
          {data.site}
        </Grid>
        <Grid item container direction="column" alignItems="stretch" className={classes.contCol}>
          <Grid item className={classes.contColGridItem}>
            <Button
              variant="outlined"
              fullWidth
              className={classNames(classes.contColButton, {
                [classes.contColButtonSelected]: hasAllValuesOn
              })}
              onClick={onSelectAll}
            >
              A
            </Button>
          </Grid>
          <Grid item className={classes.contColGridItem}>
            <Button
              variant="outlined"
              fullWidth
              className={classNames(classes.contColButton, {
                [classes.contColButtonSelected]: isLigandOn
              })}
              onClick={onLigand}
            >
              L
            </Button>
          </Grid>
          <Grid item className={classes.contColGridItem}>
            <Button
              variant="outlined"
              fullWidth
              className={classNames(classes.contColButton, {
                [classes.contColButtonSelected]: isComplexOn
              })}
              onClick={onComplex}
            >
              C
            </Button>
          </Grid>
          <Grid item className={classes.contColGridItem}>
            <Button
              variant="outlined"
              fullWidth
              className={classNames(classes.contColButton, {
                [classes.contColButtonSelected]: isVectorOn
              })}
              onClick={onVector}
            >
              V
            </Button>
          </Grid>
        </Grid>
        <Grid item container className={classes.detailsCol}>
          <Grid item container direction="column" alignItems="center" justify="center" className={classes.statusCol}>
            <Grid item className={classes.textBold}>
              {data.protein_code}
            </Grid>
            <Grid item container justify="space-around" className={classes.statusColStatusRow}>
              {Object.values(molStatusTypes).map(type => (
                <Grid item key={`molecule-status-${type}`} className={classes.statusColStatusRowItem}>
                  <MoleculeStatusView type={type} data={data} />
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid item className={classes.imageCol}>
            <div style={current_style}>{svg_image}</div>
          </Grid>
          <Grid item container className={classes.propsCol}>
            {getCalculatedProps().map(p => (
              <Grid
                item
                container
                justify="space-around"
                alignItems="center"
                direction="column"
                key={`calc-prop-${p.name}`}
                className={classes.propsColItem}
              >
                <Grid item className={classes.textBold}>
                  {p.name}
                </Grid>
                <Grid item>{p.value}</Grid>
              </Grid>
            ))}
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
  removeFromFragmentDisplayList: selectionActions.removeFromFragmentDisplayList
};

MoleculeView.displayName = 'MoleculeView';
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MoleculeView);
