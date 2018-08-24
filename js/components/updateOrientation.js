/**
 * Created by ricgillams on 13/06/2018.
 */
import React from 'react';
import { connect } from 'react-redux'
import * as nglLoadActions from '../actions/nglLoadActions'
import * as apiActions from '../actions/apiActions'
import * as selectionActions from '../actions/selectionActions'
import { Button, Well, Col, Row } from 'react-bootstrap'
import { getStore } from '../containers/globalStore';
import { saveStore } from '../containers/globalStore';


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
        var jsonOfView = JSON.parse(JSON.parse(JSON.parse(myJson.scene)).state);
        // saveStore(jsonOfView)
        this.props.reloadApiState(jsonOfView.apiReducers.present);
        this.props.reloadSelectionState(jsonOfView.selectionReducers.present);
        var myOrientDict = jsonOfView.nglReducers.present.nglOrientations;
        for(var div_id in myOrientDict){
            var orientation = myOrientDict[div_id]["orientation"];
            var components = myOrientDict[div_id]["components"];
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
        for(var key in this.props.nglOrientations){
            this.props.setOrientation(key,"REFRESH")
        }
    }

    getCookie(name) {
        if (!document.cookie) {
            return null;
        }
        const xsrfCookies = document.cookie.split(';')
            .map(c => c.trim())
            .filter(c => c.startsWith(name + '='));
        if (xsrfCookies.length === 0) {
            return null;
        }
        return decodeURIComponent(xsrfCookies[0].split('=')[1]);
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
            var store = JSON.stringify(getStore().getState());
            const csrfToken = this.getCookie("csrftoken");
            var fullState = {"state": store};
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
                    'X-CSRFToken': csrfToken,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formattedState)
            }).then(function (response) {
                return response.json();
            }).then(function (myJson) {
                alert("VIEW SAVED - send this link: " +
                    window.location.protocol + "//" + window.location.hostname + "/viewer/react/fragglebox/" + myJson.uuid.toString())
                hasBeenRefreshed = false;
            });
        }
    }

    render() {
        return <div>
            <Button bsSize="large" bsStyle="success" onClick={this.postToServer}>Save NGL Orientation</Button>
           </div>
    }
}

function mapStateToProps(state) {
  return {
      uuid: state.nglReducers.present.uuid,
      nglOrientations: state.nglReducers.present.nglOrientations,
      loadingState: state.nglReducers.present.loadingState,
  }
}
const mapDispatchToProps = {
    reloadApiState: apiActions.reloadApiState,
    reloadSelectionState: selectionActions.reloadSelectionState,
    loadObject: nglLoadActions.loadObject,
    setNGLOrientation: nglLoadActions.setNGLOrientation,
    setOrientation: nglLoadActions.setOrientation,
    setLoadingState: nglLoadActions.setLoadingState,
}
export default connect(mapStateToProps, mapDispatchToProps)(UpdateOrientation);