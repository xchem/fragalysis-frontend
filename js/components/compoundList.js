/**
 * Created by abradley on 15/03/2018.
 */
import { Row, Well, Button, ButtonToolbar } from 'react-bootstrap';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import CompoundView from './compoundView';
import * as selectionActions from '../reducers/selection/selectionActions';

const molStyle = { height: '400px', overflow: 'scroll' };

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
    setCurrentCompoundClass
  }) => {
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
        setCompoundClasses(descriptionToSet);
        setCurrentCompoundClass(e.target.id);
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
      var totArray = [];
      totArray.push(
        <p key={'breakup'}>
          <br />
        </p>
      );
      totArray.push(
        <input
          id="1"
          key="CLASS_1"
          style={{ width: 100 }}
          defaultValue={compoundClassesLocal[1]}
          onKeyDown={handleClassNaming}
        />
      );
      totArray.push(
        <input
          id="2"
          key="CLASS_2"
          style={{ width: 100 }}
          defaultValue={compoundClassesLocal[2]}
          onKeyDown={handleClassNaming}
        />
      );
      totArray.push(
        <input
          id="3"
          key="CLASS_3"
          style={{ width: 100 }}
          defaultValue={compoundClassesLocal[3]}
          onKeyDown={handleClassNaming}
        />
      );
      totArray.push(
        <input
          id="4"
          key="CLASS_4"
          style={{ width: 100 }}
          defaultValue={compoundClassesLocal[4]}
          onKeyDown={handleClassNaming}
        />
      );
      totArray.push(
        <input
          id="5"
          key="CLASS_5"
          style={{ width: 100 }}
          defaultValue={compoundClassesLocal[5]}
          onKeyDown={handleClassNaming}
        />
      );
      totArray.push(
        <p key={'breakdown'}>
          <br />
        </p>
      );
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
      totArray.push(
        <Row style={molStyle} key={'CMPD_ROW'}>
          {retArray}
        </Row>
      );
      return (
        <Well>
          <h3>
            <b>{querying ? 'Loading....' : mol_string}</b>
          </h3>
          <ButtonToolbar>
            <Button bsSize="sm" bsStyle="success" onClick={selectAll}>
              Select All
            </Button>
            <Button bsSize="sm" bsStyle="success" onClick={clearAll}>
              Clear Selection
            </Button>
          </ButtonToolbar>
          <div>{totArray}</div>
        </Well>
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
  setCompoundClasses: selectionActions.setCompoundClasses,
  setCurrentCompoundClass: selectionActions.setCurrentCompoundClass
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CompoundList);
