/**
 * Created by ricgillams on 13/06/2018.
 */

import React from "react";
import {connect} from "react-redux";
import * as nglLoadActions from "../actions/nglLoadActions";
import * as apiActions from "../actions/apiActions";
import {Button} from "react-bootstrap";
import { css } from 'react-emotion';
import { RingLoader } from 'react-spinners';
import {getStore} from "../containers/globalStore";
import * as selectionActions from "../actions/selectionActions";

const override = css`
    display: block;
    margin: 0 auto;
    border-color: red;
`;

export class UpdateOrientation extends React.Component {
    constructor(props) {
        super(props);
        this.updateFraggleBox = this.updateFraggleBox.bind(this);
        this.deployErrorModal = this.deployErrorModal.bind(this);
        this.postToServer = this.postToServer.bind(this);
        this.handleJson = this.handleJson.bind(this);
        this.getCookie = this.getCookie.bind(this);
    }

    updateFraggleBox(myJson){
        this.props.setLatestFraggleBox(JSON.stringify(myJson.uuid));
    }

    deployErrorModal(error) {
        this.props.setErrorMessage(error);
    }

    postToServer() {
        this.props.setSavingState(true);
        this.props.setLatestFraggleBox(undefined);
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
        this.props.selectVector(jsonOfView.selectionReducers.present.currentVector);
        this.props.setStageColor(jsonOfView.nglReducers.present.stageColor);
        this.props.setCompoundClasses(jsonOfView.selectionReducers.present.compoundClasses);
    };

    componentDidUpdate() {
        var hasBeenRefreshed = true
        if (this.props.uuid!="UNSET") {
            fetch("/api/viewscene/?uuid="+this.props.uuid)
                .then(function(response) {
                    return response.json();
                }).then(json => this.handleJson(json.results[0]))
        }
        for (var key in this.props.nglOrientations){
            if(this.props.nglOrientations[key]=="REFRESH") {
                hasBeenRefreshed = false;
            }
            if(this.props.nglOrientations[key]=="STARTED"){
                hasBeenRefreshed = false
            }
        }
        if (hasBeenRefreshed==true) {
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
            }).then((myJson) => {
                this.updateFraggleBox(myJson);
            }).catch((error) => {
                this.deployErrorModal(error);
            });
        }
    }

    render() {
        if (this.props.savingState == true) {
            return <RingLoader className={override} sizeUnit={"px"} size={30} color={'#7B36D7'} loading={this.props.savingState}/>
        } else {
            return <Button bsSize="sm" bsStyle="success" onClick={this.postToServer}>Save Page</Button>
        }
    }
}

function mapStateToProps(state) {
  return {
      nglOrientations: state.nglReducers.present.nglOrientations,
      savingState: state.apiReducers.present.savingState,
      uuid: state.nglReducers.present.uuid,
  }
}
const mapDispatchToProps = {
    setSavingState: apiActions.setSavingState,
    setOrientation: nglLoadActions.setOrientation,
    setNGLOrientation: nglLoadActions.setNGLOrientation,
    loadObject: nglLoadActions.loadObject,
    reloadApiState: apiActions.reloadApiState,
    reloadSelectionState: selectionActions.reloadSelectionState,
    setLatestFraggleBox: apiActions.setLatestFraggleBox,
    setErrorMessage: apiActions.setErrorMessage,
    selectVector: selectionActions.selectVector,
    setStageColor: nglLoadActions.setStageColor,
    setCompoundClasses: selectionActions.setCompoundClasses,
}
export default connect(mapStateToProps, mapDispatchToProps)(UpdateOrientation);