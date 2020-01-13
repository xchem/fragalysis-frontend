/**
 * Created by abradley on 15/03/2018.
 */
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import CompoundView from './compoundView';
import { Panel } from '../../common/Surfaces/Panel';
import { Button } from '../../common/Inputs/Button';
import { TextField } from '../../common/Inputs/TextField';
import { Grid, Box, makeStyles } from '@material-ui/core';
import { SelectAll, Delete } from '@material-ui/icons';
import * as selectionActions from '../../../reducers/selection/selectionActions';

const useStyles = makeStyles(theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 50
  }
}));

const CompoundList = memo(
  ({
    thisVectorList,
    to_query,
    compoundClasses,
    currentCompoundClass,
    to_select,
    querying,
    setToBuyList,
    appendToBuyList,
    setCompoundClasses,
    height
  }) => {
    const classes = useStyles();
    const panelRef = useRef(null);
    const [compoundClassesLocal, setCompoundClassesLocal] = useState({
      1: 'blue',
      2: 'red',
      3: 'green',
      4: 'purple',
      5: 'apricot'
    });

    const updateClassNames = useCallback(() => {
      setCompoundClassesLocal(compoundClasses);
    }, [compoundClasses]);

    const handleClassNaming = e => {
      if (e.keyCode === 13) {
        const newClassDescription = { [e.target.id]: e.target.value };
        const descriptionToSet = Object.assign(compoundClasses, newClassDescription);
        setCompoundClasses(descriptionToSet, e.target.id);
      }
    };

    const selectAll = () => {
      for (let key in thisVectorList) {
        for (let index in thisVectorList[key]) {
          if (index !== 'vector') {
            for (let fUCompound in thisVectorList[key][index]) {
              var thisObj = {
                smiles: thisVectorList[key][index][fUCompound].end,
                vector: thisVectorList[key].vector.split('_')[0],
                mol: to_query,
                class: parseInt(currentCompoundClass)
              };
              appendToBuyList(thisObj);
            }
          }
        }
      }
    };

    const clearAll = () => {
      setToBuyList([]);
    };

    const getNum = () => {
      let tot_num = 0;
      for (let key in to_select) {
        tot_num += to_select[key]['addition'].length;
      }
      return tot_num;
    };

    const colourClassBoxes = useCallback(() => {
      const colourList = {
        1: '#b3cde3',
        2: '#fbb4ae',
        3: '#ccebc5',
        4: '#decbe4',
        5: '#fed9a6'
      };
      for (var i in colourList) {
        if (!!document.getElementById(i)) {
          let inputId = document.getElementById(i);
          inputId.style.backgroundColor = colourList[i];
          inputId.style.border = '1px solid black';
          if (currentCompoundClass === i) {
            inputId.style.border = '2px solid red';
          }
        }
      }
    }, [currentCompoundClass]);

    useEffect(() => {
      updateClassNames();
      colourClassBoxes();
    }, [updateClassNames, colourClassBoxes]);

    var numMols = getNum();
    let mol_string = 'No molecules found!';
    if (numMols) {
      mol_string = 'Compounds to pick. Mol total: ' + numMols;
    }
    if (to_query === '' || to_query === undefined) {
      mol_string = '';
    }

    if (to_query !== undefined) {
      var retArray = [];
      for (var key in thisVectorList) {
        const vector_smi = thisVectorList[key]['vector'];
        const change_list = thisVectorList[key]['addition'];
        for (var ele in change_list) {
          const data_transfer = change_list[ele];
          const input_data = {};
          input_data.smiles = data_transfer['end'];
          // Set this back for now - because it's confusing - alter to change if want later
          input_data.show_frag = data_transfer['end'];
          input_data.vector = vector_smi;
          input_data.mol = to_query;
          input_data.index = ele;
          input_data.class = currentCompoundClass;
          retArray.push(<CompoundView height={100} width={100} key={ele + '__' + key} data={input_data} />);
        }
      }

      return (
        <Panel hasHeader title={querying ? 'Loading....' : mol_string} ref={panelRef}>
          <Box height={height} overflow="auto">
            <Grid container direction="row" justify="space-between" alignItems="center">
              {[1, 2, 3, 4, 5].map(item => (
                <Grid item key={item}>
                  <TextField
                    id={`${item}`}
                    key={`CLASS_${item}`}
                    label={compoundClassesLocal[item]}
                    onKeyDown={handleClassNaming}
                    className={classes.textField}
                  />
                </Grid>
              ))}
            </Grid>
            <Box overflow="auto">
              <Grid container justify="flex-start">
                {retArray.map((item, index) => (
                  <Grid item key={index}>
                    {item}
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
          <Button color="primary" onClick={selectAll} startIcon={<SelectAll />}>
            Select All
          </Button>
          <Button color="primary" onClick={clearAll} startIcon={<Delete />}>
            Clear Selection
          </Button>
        </Panel>
      );
    } else {
      return null;
    }
  }
);

function mapStateToProps(state) {
  return {
    thisVectorList: state.selectionReducers.present.this_vector_list,
    to_query: state.selectionReducers.present.to_query,
    compoundClasses: state.selectionReducers.present.compoundClasses,
    currentCompoundClass: state.selectionReducers.present.currentCompoundClass,
    to_select: state.selectionReducers.present.to_select,
    querying: state.selectionReducers.present.querying
  };
}
const mapDispatchToProps = {
  setToBuyList: selectionActions.setToBuyList,
  appendToBuyList: selectionActions.appendToBuyList,
  setCompoundClasses: selectionActions.setCompoundClasses
};

export default connect(mapStateToProps, mapDispatchToProps)(CompoundList);
