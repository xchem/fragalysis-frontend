/**
 * Created by rgillams on 22/05/2018.
 */
import React from 'react';
import { connect } from 'react-redux'
import { Button, Well, Col, Row } from 'react-bootstrap'
import fetch from 'cross-fetch'
import * as nglactions from '../actions/nglLoadActions'

class StateView extends React.Component{
    constructor(props) {
        super(props);
        this.handleStateState = this.handleStateState.bind(this);
        this.handleStateLoading = this.handleStateLoading.bind(this);
        this.handleStateOrientation = this.handleStateOrientation.bind(this);
        this.handlePostState = this.handlePostState.bind(this);
        this.handleRenderState = this.handleRenderState.bind(this);
        this.handleJson = this.handleJson.bind(this);
    }

    handleStateState(){
        var stateState = JSON.stringify(this.props.objects_in_view);
        const uuidv4 = require('uuid/v4');
        var TITLE = 'need to define title';
        var formattedState = {
            uuid: uuidv4(),
            title: TITLE,
            scene: stateState
        };
        return alert(JSON.stringify(formattedState))
    }

    handleStateOrientation(){
        var stateOrientation = JSON.stringify(this.props.ngl_orientation);
        var formattedOrientation = {
            orientation: stateOrientation
        };
        return alert(JSON.stringify(formattedOrientation))
    }

    handleStateLoading(){
        var stateLoading = JSON.stringify(this.props.objects_to_load);
        var TITLE = 'To Load';
        var formattedState = {
            title: TITLE,
            scene: stateLoading
        };
        return alert(JSON.stringify(formattedState))
    }

    handlePostState(){
        var stateState = JSON.stringify(this.props.objects_in_view);
        const uuidv4 = require('uuid/v4');
        var TITLE = 'need to define title';
        var formattedState = {
            uuid: uuidv4(),
            title: TITLE,
            scene: stateState
        };
        fetch("/api/viewscene/", {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formattedState)
        }).then(function(response) {
            return response.json();
        }).then(function(myJson) {
            console.log(myJson);
        }).then(function(myJson) {
            alert(myJson.scene)
        };
    }

    handleJson(myJson){
        var myDict = JSON.parse(myJson.scene)
        for(var key in myDict){
            this.props.load_object(myDict[key]);
        }
    };

    handleRenderState(){
        var pk = 31;
        fetch("/api/viewscene/"+pk.toString())
        .then(function(response) {
            return response.json();
        }).then(json => this.handleJson(json))
    }
        render(){
        return <div>
            <Well>
                <Row>
                <Col xs={6} md={6}>
                    <Button bsSize="large" bsStyle="success" onClick={this.handlePostState}>Save State</Button>
                    <Button bsSize="large" bsStyle="success" onClick={this.handleRenderState}>Reload State</Button>
                    <form>
                        <label> Insert state here: <input type="text" name="name" />
                        </label><input type="submit" value="Reload State" />
                    </form>
                    <h3><b>Current State:</b></h3>
                    <h3>Last saved pk:
                    <h3>Target on? <b>{this.props.target_on}</b></h3>
                    <h3>Number of objects? <b>{Object.keys(this.props.objects_in_view).length}</b></h3>
                    <h3>Orientation? <b>{JSON.stringify(this.props.ngl_orientation)}</b></h3>
                    <h3>Stringified state: <b>{JSON.stringify(this.props.objects_in_view)}</b></h3>
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
      ngl_orientation: state.nglReducers.nglOrientation
  }
}

const mapDispatchToProps = {
    load_object: nglactions.loadObject,
}

export default connect(mapStateToProps, mapDispatchToProps)(StateView);