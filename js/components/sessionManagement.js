/**
 * Created by ricgillams on 13/06/2018.
 */

import React from "react";
import {connect} from "react-redux";
import * as nglLoadActions from "../actions/nglLoadActions";
import * as apiActions from "../actions/apiActions";
import {Button,  ButtonToolbar, Row} from "react-bootstrap";
import { css } from 'react-emotion';
import { RingLoader } from 'react-spinners';
import {getStore} from "../containers/globalStore";
import * as selectionActions from "../actions/selectionActions";
import {withRouter} from "react-router-dom";


const override = css`
    display: block;
    margin: 0 auto;
    border-color: red;
`;

export class SessionManagement extends React.Component {
    constructor(props) {
        super(props);
        this.updateFraggleBox = this.updateFraggleBox.bind(this);
        this.deployErrorModal = this.deployErrorModal.bind(this);
        this.postToServer = this.postToServer.bind(this);
        this.handleJson = this.handleJson.bind(this);
        this.getCookie = this.getCookie.bind(this);
        this.newSession = this.newSession.bind(this);
        this.saveSession = this.saveSession.bind(this);
        this.newSnapshot = this.newSnapshot.bind(this);
        this.state = {
            saveType: ""
        };
    }

    updateFraggleBox(myJson){
        if (this.state.saveType == "sessionNew") {
            this.props.setLatestSession(JSON.stringify(myJson.uuid));
            this.props.setSessionId(JSON.stringify(myJson.id));
            this.setState(prevState => ({saveType: ""}));
            this.props.setSavingState("savingSession");
        } else if (this.state.saveType == "sessionSave") {
            this.setState(prevState => ({saveType: ""}));
            this.props.setSavingState("overwritingSession");
        } else if (this.state.saveType == "snapshotNew") {
            this.props.setLatestSnapshot(JSON.stringify(myJson.uuid));
            this.setState(prevState => ({saveType: ""}));
            this.props.setSavingState("savingSnapshot");
        }
    }

    newSession(){
        this.setState(prevState => ({saveType: "sessionNew"}));
        this.postToServer();
    }

    saveSession(){
        this.setState(prevState => ({saveType: "sessionSave"}));
        this.postToServer();
    }

    newSnapshot(){
        this.setState(prevState => ({saveType: "snapshotNew"}));
        this.postToServer();
    }

    deployErrorModal(error) {
        this.props.setErrorMessage(error);
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
            var TITLE = 'need to define title';
            var userId = DJANGO_CONTEXT["pk"];
            if (this.state.saveType == "sessionNew") {
                const uuidv4 = require('uuid/v4');
                var formattedState = {
                    uuid: uuidv4(),
                    title: TITLE,
                    user_id: userId,
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
            } else if (this.state.saveType == "sessionSave") {
                var uuid = this.props.latestSession.slice(1, -1);
                var formattedState = {
                    uuid: uuid,
                    title: TITLE,
                    user_id: userId,
                    scene: JSON.stringify(JSON.stringify(fullState))
                };
                fetch("/api/viewscene/" + JSON.parse(this.props.sessionId), {
                    method: "put",
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
            } else if (this.state.saveType == "snapshotNew") {
                const uuidv4 = require('uuid/v4');
                var formattedState = {
                    uuid: uuidv4(),
                    title: TITLE,
                    user_id: userId,
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
    }

    render() {
        const {pathname} = this.props.location;
        var button = ""
        if (pathname != "/viewer/react/landing") {
            if (this.props.latestSession == undefined) {
                button = <div>
                    <Row>
                    <Button bsSize="sm" bsStyle="success" onClick={this.newSession}>New session</Button>
                    <Button bsSize="sm" bsStyle="success" disabled>Save session</Button>
                    <Button bsSize="sm" bsStyle="success" onClick={this.newSnapshot}>New snapshot</Button>
                    </Row>
                    <Row>
                    <p>Currently no active session.</p>
                    </Row>
                </div>
            } else {
                button = <div>
                    <Row>
                    <Button bsSize="sm" bsStyle="success" onClick={this.newSession}>New Session</Button>
                    <Button bsSize="sm" bsStyle="success" onClick={this.saveSession}>Save Session</Button>
                    <Button bsSize="sm" bsStyle="success" onClick={this.newSnapshot}>New snapshot</Button>
                    </Row>
                    <Row>
                    <p>Session: {this.props.latestSession}, author: tbd</p>
                    </Row>
                </div>
            }
        }
        if (this.props.savingState.startsWith("saving") || this.props.savingState.startsWith("overwriting")) {
            return <RingLoader className={override} sizeUnit={"px"} size={30} color={'#7B36D7'} loading={(this.props.savingState.startsWith("saving") || this.props.savingState.startsWith("overwriting"))}/>
        } else {
            return <ButtonToolbar>
                {button}
            </ButtonToolbar>
        }
    }
}

function mapStateToProps(state) {
  return {
      nglOrientations: state.nglReducers.present.nglOrientations,
      savingState: state.apiReducers.present.savingState,
      uuid: state.apiReducers.present.uuid,
      latestSession: state.apiReducers.present.latestSession,
      sessionId: state.apiReducers.present.sessionId,
  }
}
const mapDispatchToProps = {
    setSavingState: apiActions.setSavingState,
    setOrientation: nglLoadActions.setOrientation,
    setNGLOrientation: nglLoadActions.setNGLOrientation,
    loadObject: nglLoadActions.loadObject,
    reloadApiState: apiActions.reloadApiState,
    reloadSelectionState: selectionActions.reloadSelectionState,
    setLatestSession: apiActions.setLatestSession,
    setLatestSnapshot: apiActions.setLatestSnapshot,
    setErrorMessage: apiActions.setErrorMessage,
    selectVector: selectionActions.selectVector,
    setStageColor: nglLoadActions.setStageColor,
    setCompoundClasses: selectionActions.setCompoundClasses,
    setSessionId: apiActions.setSessionId,
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SessionManagement));