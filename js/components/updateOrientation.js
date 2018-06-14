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
        this.handleRenderState = this.handleRenderState.bind(this);
        this.handleJson = this.handleJson.bind(this);
        this.handleRenderOrientation = this.handleRenderOrientation.bind(this);
    }
    
    handleJson(myJson){
        if(myJson.scene==undefined){
            return;
        }
        var myPreDict = JSON.parse(JSON.parse(myJson.scene));
        for(var div_id in myPreDict){
            var orientation = myPreDict[div_id]["orientation"];
            var components = myPreDict[div_id]["components"];
            for (var component in components){
                this.props.loadObject(components[component]);
            }
            this.props.setNGLOrientation(div_id, orientation);
        }
    };

    handleRenderState(){
        var pk = document.getElementById("state_selector").value;
        fetch("/api/viewscene/"+pk)
        .then(function(response) {
            return response.json();
        }).then(json => this.handleJson(json))
    }

    handleRenderOrientation(){
        var pk = document.getElementById("state_selector").value;
        fetch("/api/viewscene/"+pk)
        .then(function(response) {
            return response.json();
        }).then(json => this.handleJson(json))
    }

    postToServer() {
        // Refresh orientation
        for(var key in this.props.nglOrientations){
            this.props.setOrientation(key,"REFRESH")
        }
    }

    componentDidUpdate() {
        var hasBeenRefreshed = true
        if(this.props.uuid!="UNSET"){
            fetch("/api/viewscene/?uuid="+this.props.uuid)
                .then(function(response) {
                    return response.json();
                }).then(json => this.handleJson(json.results[0]))
        }
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
                alert("VIEW SAVED - send this link: " +
                    window.location.protocol + "//" + window.location.hostname + "/viewer/react/fraggledocs/" + myJson.uuid.toString())
            });
        }
    }


    render() {
        return <div>
            <Button bsSize="large" bsStyle="success" onClick={this.postToServer}>Save the NGL Orientation</Button>
           </div>
    }
}

function mapStateToProps(state) {
  return {
      uuid: state.nglReducers.uuid,
      nglOrientations: state.nglReducers.nglOrientations,
  }
}
const mapDispatchToProps = {
    loadObject: nglLoadActions.loadObject,
    setNGLOrientation: nglLoadActions.setNGLOrientation,
    setOrientation: nglLoadActions.setOrientation
}
export default connect(mapStateToProps, mapDispatchToProps)(UpdateOrientation);