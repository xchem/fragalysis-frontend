/**
 * Created by rgillams on 22/05/2018.
 */
import React from 'react';
import { connect } from 'react-redux'
import { Button, Well, Col, Row } from 'react-bootstrap'
import fetch from 'cross-fetch'
import * as nglLoadActions from '../actions/nglLoadActions'
import * as nglRenderActions from '../actions/nglRenderActions'
import { Stage, Shape, concatStructures, Selection } from 'ngl';

class StateView extends React.Component{
    constructor(props) {
        super(props);
        this.handleStateLoading = this.handleStateLoading.bind(this);
        this.handlePostState = this.handlePostState.bind(this);
        this.handleRenderState = this.handleRenderState.bind(this);
        this.handleJson = this.handleJson.bind(this);
        this.handleOrientationJson = this.handleOrientationJson.bind(this);
        this.handleRenderOrientation = this.handleRenderOrientation.bind(this);
        this.handleFullStateSave = this.handleFullStateSave.bind(this);
    }

     componentWillReceiveProps() {
        this.handlePostState();
        this.render();
    }

    handleStateLoading(){
        var stateLoading = JSON.stringify(this.props.objects_to_load);
        var TITLE = 'To Load';
        var formattedState =
            {
            title: TITLE,
            scene: stateLoading
        };
        return alert(JSON.stringify(formattedState))
    }

    handlePostState() {
        if (this.props.orientationCollectedFlag === true) {
            this.props.confirmOrientationCollection()
            var stateState = JSON.stringify(this.props.objects_in_view);
            var currentOrientation = JSON.stringify(this.props.nglOrientation.elements);
            const uuidv4 = require('uuid/v4');
            var TITLE = 'need to define title';
            var formattedState = {
                uuid: uuidv4(),
                title: TITLE,
                scene: JSON.stringify({components: stateState, orientation: currentOrientation})
            };
            fetch("/api/viewscene/", {
                method: "post",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formattedState)
            }).then(function (response) {
                return response.json();
            }).then(function (myJson) {
                // window.location.protocol + window.location.hostname + "/api/viewscene/" + myJson.id.toString()
                alert(myJson.id.toString())
            });
        }
    }

    handleJson(myJson){
        var myPreDict = JSON.parse(myJson.scene);
        var myDict = JSON.parse(myPreDict.components);
        for(var key in myDict){
            this.props.load_object(myDict[key]);
        }
    };

    handleRenderState(){
        var pk = document.getElementById("state_selector").value;
        fetch("/api/viewscene/"+pk)
        .then(function(response) {
            return response.json();
        }).then(json => this.handleJson(json))
    }

    handleOrientationJson(myJson){
        var myPreDict = JSON.parse(myJson.scene);
        var orientationToSet = JSON.parse(myPreDict.orientation);
        this.props.requestToSetOrientation();
        this.props.setNglOrientation(orientationToSet);
    }

    handleRenderOrientation(){
        var pk = document.getElementById("state_selector").value;
        fetch("/api/viewscene/"+pk)
        .then(function(response) {
            return response.json();
        }).then(json => this.handleOrientationJson(json))
    }

    handleFullStateSave(){
        this.props.requestOrientation()
    }

        render(){
        return <div>
            <Well>
                <Row>
                <Col xs={12} md={12}>
                    <Button bsSize="large" bsStyle="danger" onClick={this.handleFullStateSave}>THE BIG DADDY</Button>
                    <p>state saving</p>
                    <Button bsSize="large" bsStyle="success" onClick={this.handlePostState}>Save State</Button>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <input id="state_selector" type="text" name="name" />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <Button bsSize="large" bsStyle="success" onClick={this.handleRenderState}>Reload State</Button>
                    <p>orientation saving</p>
                    <Button bsSize="large" bsStyle="success" onClick={this.props.requestOrientation}>Prime Orientation</Button>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <input id="orientation_selector" type="text" name="name" />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <Button bsSize="large" bsStyle="success" onClick={this.handleRenderOrientation}>Reload Orientation</Button>
                    <p>Orientation: <b>{JSON.stringify(this.props.nglOrientation.elements)}</b></p>
                    <p>Target on? <b>{this.props.target_on}</b></p>
                    <p>Number of objects? <b>{Object.keys(this.props.objects_in_view).length}</b></p>
                    <p>Stringified state: <b>{JSON.stringify(this.props.objects_in_view)}</b></p>
                    <p>orientation flag: <b>{JSON.stringify(this.props.orientationFlag)}</b></p>
                    <p>orientation collected flag: <b>{JSON.stringify(this.props.orientationCollectedFlag)}</b></p>
                    <p>orientation to set flag: <b>{JSON.stringify(this.props.orientationToSetFlag)}</b></p>
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
      orientation: state.nglReducers.spin,
      color: state.nglReducers.color,
      objects_in_view: state.nglReducers.objectsInView,
      objects_to_load: state.nglReducers.objectsToLoad,
      orientationFlag: state.nglReducers.orientationFlag,
      nglOrientation: state.nglReducers.nglOrientation,
      orientationToSetFlag: state.nglReducers.orientationToSetFlag,
      orientationToSet: state.nglReducers.orientationToSet,
      orientationCollectedFlag: state.nglReducers.orientationCollectedFlag
  }
}

const mapDispatchToProps = {
    load_object: nglLoadActions.loadObject,
    requestOrientation: nglRenderActions.requestOrientation,
    getNglOrientation: nglRenderActions.getNglOrientation,
    requestToSetOrientation: nglRenderActions.requestToSetOrientation,
    setNglOrientation: nglRenderActions.setNglOrientation
}

export default connect(mapStateToProps, mapDispatchToProps)(StateView);