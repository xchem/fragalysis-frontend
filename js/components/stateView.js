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

    convert_state_to_template(input_json) {
        var templateOut = {uuid: "UUID", title: "TITLE", scene : "JSON_OF_SCENE"}
//        templateOut.scene = input_json;
        return templateOut;
    }

    handleExport() {
        var content = this.convert_state_to_template(this.props.objects_in_view);
        var encodedUri = encodeURI(JSON.stringify(content));
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "follow_ups.csv");
        document.body.appendChild(link); // Required for FF
        link.click();
    }

    handleStateExport(){
        var jsonNglState = JSON.stringify(this.props.objects_in_view);
        var encodedUri = encodeURI(jsonNglState);
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
                    <h3>Objects in view: <b>{Object.keys(this.props.objects_in_view)}</b></h3>
                    <h3>Number of objects? <b>{Object.keys(this.props.objects_in_view).length}</b></h3>
                    <h3>Stringified: <b>{JSON.stringify(this.props.objects_in_view)}</b></h3>
                    <h3>Template: <b>this.convert_state_to_template(this.props.objects_in_view)</b></h3>
                    <Button bsSize="large" bsStyle="success" onClick={this.handleExport}>Display State</Button>
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
      objects_in_view: state.nglReducers.objectsInView,
      objects_to_load: state.nglReducers.objectsToLoad,
  }
}

const mapDispatchToProps = {
    stateAlert: stateActions.stateAlert,
    stateSpecify: stateActions.stateSpecify
}

export default connect(mapStateToProps, mapDispatchToProps)(SummaryView);