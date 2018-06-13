/**
 * Created by abradley on 01/03/2018.
 */
import React from 'react';
import { connect } from 'react-redux'
import * as nglLoadActions from '../actions/nglLoadActions'
import { Button, Well, Col, Row } from 'react-bootstrap'


export class UpdateOrientation extends React.Component {
    constructor(props) {
        super(props);
        this.postToServer = this.postToServer.bind(this);
//        this.handlePostState = this.handlePostState.bind(this);
        this.handleRenderState = this.handleRenderState.bind(this);
        this.handleJson = this.handleJson.bind(this);
        this.handleOrientationJson = this.handleOrientationJson.bind(this);
        this.handleRenderOrientation = this.handleRenderOrientation.bind(this);
//        this.handleFullStateSave = this.handleFullStateSave.bind(this);
    }

    componentDidMount() {
    }


    handleJson(myJson){
        var myPreDict = JSON.parse(myJson.scene);
        var myDict = JSON.parse(myPreDict.components);
        for(var key in myDict){
            this.props.load_object(myDict[key]);
        }
    };

    handleRenderState(){
        this.props.toggleOrientationCollection(true);
        var pk = document.getElementById("state_selector").value;
        fetch("/api/viewscene/"+pk)
        .then(function(response) {
            return response.json();
        }).then(json => this.handleJson(json))
    }

    handleOrientationJson(myJson){
        var myPreDict = JSON.parse(myJson.scene);
        var orientationToSet = JSON.parse(myPreDict.orientation);
        this.props.ToggleToSetOrientation();
        this.props.setNglOrientation(orientationToSet);
    }

    handleRenderOrientation(){
        var pk = document.getElementById("state_selector").value;
        fetch("/api/viewscene/"+pk)
        .then(function(response) {
            return response.json();
        }).then(json => this.handleOrientationJson(json))
    }

    postToServer() {
        // Refresh orientation
        for(var key in this.props.nglOrientations){
            this.props.setOrientation(key,"REFRESH")
        }
    }

    componentDidUpdate() {
        var hasBeenRefreshed = true
        for(var key in this.props.nglOrientations){
            if(this.props.nglOrientations[key]=="REFRESH"){
                hasBeenRefreshed = false;
            }
            if(this.props.nglOrientations[key]=="STARTED"){
                hasBeenRefreshed = false
            }
        }
        if (hasBeenRefreshed==true){
            // Post the data to the server as usual
            const uuidv4 = require('uuid/v4');
            var TITLE = 'need to define title';
            var formattedState = {
                uuid: uuidv4(),
                title: TITLE,
                scene: JSON.stringify(JSON.stringify(this.props.nglOrientations))
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


    render() {
        return <div>
            <Button bsSize="large" bsStyle="success" onClick={this.postToServer}>REFRESH</Button>
            {JSON.stringify(this.props.nglOrientations)}
           </div>
    }
}

function mapStateToProps(state) {
  return {
      nglOrientations: state.nglReducers.nglOrientations,
  }
}
const mapDispatchToProps = {
    setOrientation: nglLoadActions.setOrientation
}
export default connect(mapStateToProps, mapDispatchToProps)(UpdateOrientation);