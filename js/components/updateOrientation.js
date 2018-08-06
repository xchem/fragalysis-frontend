/**
 * Created by abradley on 01/03/2018.
 */
import React from 'react';
import { connect } from 'react-redux'
import * as nglLoadActions from '../actions/nglLoadActions'
import * as apiActions from '../actions/apiActions'
import { Button } from 'react-bootstrap'


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
            var targetOn = JSON.parse(JSON.parse(myJson.scene)).targetOn;
            this.props.setTargetOn(targetOn);
            var molGroupList = JSON.parse(JSON.parse(myJson.scene)).molGroupList;
            // this.props.setMolGroupList(molGroupList);
            var mol_group_id = JSON.parse(JSON.parse(myJson.scene)).mol_group_id;
            // this.props.setMolGroupOn(mol_group_id);
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
            var fullState = Object.assign(this.props.nglOrientations, {targetOn: this.props.target_on}, {molGroupList: this.props.mol_group_list}, {mol_group_id: this.props.mol_group_on})
            const uuidv4 = require('uuid/v4');
            var TITLE = 'need to define title';
            var formattedState = {
                uuid: uuidv4(),
                title: TITLE,
                scene: JSON.stringify(JSON.stringify(fullState))
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
                    window.location.protocol + "//" + window.location.hostname + "/viewer/react/fragglebox/" + myJson.uuid.toString())
            });
        }
    }

    render() {
        return <div>
            <Button bsSize="large" bsStyle="success" onClick={this.postToServer}>Save view in Fragglebox</Button>
           </div>
    }
}

function mapStateToProps(state) {
  return {
      uuid: state.nglReducers.uuid,
      nglOrientations: state.nglReducers.nglOrientations,
      loadingState: state.nglReducers.loadingState,
      target_on: state.apiReducers.target_on,
      mol_group_on: state.apiReducers.mol_group_on,
      mol_group_list: state.apiReducers.mol_group_list,
  }
}
const mapDispatchToProps = {
    loadObject: nglLoadActions.loadObject,
    setNGLOrientation: nglLoadActions.setNGLOrientation,
    setOrientation: nglLoadActions.setOrientation,
    setLoadingState: nglLoadActions.setLoadingState,
    setTargetOn: apiActions.setTargetOn,
    setMolGroupOn: apiActions.setMolGroupOn,
    setMolGroupList: apiActions.setMolGroupList,
}
export default connect(mapStateToProps, mapDispatchToProps)(UpdateOrientation);