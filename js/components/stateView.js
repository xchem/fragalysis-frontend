/**
 * Created by rgillams on 22/05/2018.
 */
import React from 'react';
import { connect } from 'react-redux'
import { Button, Well, Col, Row } from 'react-bootstrap'
import * as selectionActions from '../actions/selectionActions'
import * as nglLoadActions from '../actions/nglLoadActions'
import * as apiActions from '../actions/apiActions'
import CompoundList from './compoundList';
import SummaryCmpd from './SummaryCmpd';
import * as stateActions from '../actions/stateActions'

class SummaryView extends React.Component{
    constructor(props) {
        super(props);
        this.handleStateExport = this.handleStateExport.bind(this);
        this.handleStateImport = this.handleStateImport.bind(this);
    }

    convert_data_to_list(input_list){
        var outArray = new Array();
        var headerArray = ["smiles"];
        outArray.push(headerArray)
        for(var item in input_list){
            var newArray = new Array();
            newArray.push(input_list[item].smiles)
            outArray.push(newArray)
        }
        return outArray;
    }

    handleStateExport(){
        const rows = this.convert_data_to_list(this.props.objects_in_view);
        let jsonContent = "data:text/csv;charset=utf-8,";
        rows.forEach(function(rowArray){
            let row = rowArray.join(",");
            jsonContent += row + "\r\n";
        });
        var encodedUri = encodeURI(jsonContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "savedState.json");
        document.body.appendChild(link); // Required for FF
        link.click();
    }

    handleStateImport(){
        var insertedState = prompt("Please insert state here:");
        return insertedState;
        this.props.objects_to_load = insertedState;
    }

        render(){
        return <div>
            <Well>
                <Row>
                <Col xs={6} md={6}>
                    <h3><b>Current State:</b></h3>
                    <h3>Target on? <b>{this.props.target_on}</b></h3>
                    <h3>Objects in view? <b>{this.props.objects_in_view.length}</b></h3>
                    <h3>Objects to load? <b>{JSON.stringify(this.props.objects_in_view)}</b></h3>
                    <Button bsSize="large" bsStyle="success" onClick={this.handleStateExport}>Display State</Button>
                    <Button bsSize="large" bsStyle="success" onClick={this.handleStateImport}>Load State</Button>
                </Col>
                </Row>
            </Well>
        </div>
    }
}
function mapStateToProps(state) {
  return {
      to_buy_list: state.selectionReducers.to_buy_list,
      to_select: state.selectionReducers.to_select,
      this_vector_list: state.selectionReducers.this_vector_list,
      vector_list: state.selectionReducers.vector_list,
      querying: state.selectionReducers.querying,
      to_query: state.selectionReducers.to_query,
      target_on: state.apiReducers.target_on,
      group_type: state.apiReducers.group_type,
      objects_in_view: state.nglReducers.objectsInView,
      objects_to_load: state.nglReducers.objectsToLoad
  }
}

const mapDispatchToProps = {
    stateAlert: stateActions.stateAlert,
    stateSpecify: stateActions.stateSpecify
}

export default connect(mapStateToProps, mapDispatchToProps)(SummaryView);