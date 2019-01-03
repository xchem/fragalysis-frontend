/**
 * Created by ricgillams on 13/06/2018.
 */

import React from "react";
import {connect} from "react-redux";
import * as nglLoadActions from "../actions/nglLoadActions";
import * as apiActions from "../actions/apiActions";
import {Button,  ButtonToolbar, Row, Col} from "react-bootstrap";
import { css } from 'react-emotion';
import { RingLoader } from 'react-spinners';
import {getStore} from "../containers/globalStore";
import * as selectionActions from "../actions/selectionActions";
import {withRouter} from "react-router-dom";
import * as listTypes from "./listTypes";
import * as nglObjectTypes from "./nglObjectTypes";
import DownloadPdb from "./downloadPdb";

const override = css`
    display: block;
    margin: 0 auto;
    border-color: red;
`;

export class SessionManagement extends React.Component {
    constructor(props) {
        super(props);
        this.getCookie = this.getCookie.bind(this);
        this.updateFraggleBox = this.updateFraggleBox.bind(this);
        this.newSession = this.newSession.bind(this);
        this.saveSession = this.saveSession.bind(this);
        this.newSnapshot = this.newSnapshot.bind(this);
        this.deployErrorModal = this.deployErrorModal.bind(this);
        this.postToServer = this.postToServer.bind(this);
        this.handleJson = this.handleJson.bind(this);
        this.restoreOrientation = this.restoreOrientation.bind(this);
        this.generateArrowObject = this.generateArrowObject.bind(this);
        this.generateCylinderObject = this.generateCylinderObject.bind(this);
        this.generateObjectList = this.generateObjectList.bind(this);
        this.generateBondColorMap = this.generateBondColorMap.bind(this);
        this.handleVector = this.handleVector.bind(this);
        this.redeployVectors = this.redeployVectors.bind(this);
        this.generateNextUuid = this.generateNextUuid.bind(this);
        this.getSessionDetails = this.getSessionDetails.bind(this);
        this.checkTarget = this.checkTarget.bind(this);
        this.reloadSession = this.reloadSession.bind(this);
        this.state = {
            saveType: "",
            nextUuid: "",
            newSessionFlag: 0,
        };
    }

    checkTarget(myJson) {
        var jsonOfView = JSON.parse(JSON.parse(JSON.parse(myJson.scene)).state);
        var target = jsonOfView.apiReducers.present.target_on_name
        var targetUnrecognised = true;
        for (var i in this.props.targetIdList) {
            if (target == this.props.targetIdList[i].title) {
                targetUnrecognised = false;
            }
        }
        if (targetUnrecognised == true) {
            this.props.setLoadingState(false);
        }
        this.props.setTargetUnrecognised(targetUnrecognised);
        if (targetUnrecognised == false) {
            this.reloadSession(myJson)
        }
    }

    reloadSession(myJson) {
        var jsonOfView = JSON.parse(JSON.parse(JSON.parse(myJson.scene)).state);
        this.props.reloadApiState(jsonOfView.apiReducers.present);
        this.props.reloadSelectionState(jsonOfView.selectionReducers.present);
        this.props.setStageColor(jsonOfView.nglReducers.present.stageColor);
        this.restoreOrientation(jsonOfView.nglReducers.present.nglOrientations);
        if (jsonOfView.selectionReducers.present.vectorOnList.length != 0) {
            var url = window.location.protocol + "//" + window.location.host + '/api/vector/' + jsonOfView.selectionReducers.present.vectorOnList[JSON.stringify(0)] + "/"
            this.redeployVectors(url);
        }
        this.props.setSessionTitle(myJson.title);
        this.props.setSessionId(myJson.id);
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

    updateFraggleBox(myJson){
        if (this.state.saveType == "sessionNew") {
            this.props.setLatestSession(myJson.uuid);
            this.props.setSessionId(myJson.id);
            this.props.setSessionTitle(myJson.title);
            this.setState(prevState => ({saveType: ""}));
            this.props.setSavingState("savingSession");
            this.setState(prevState => ({nextUuid: ""}));
            this.getSessionDetails();
        } else if (this.state.saveType == "sessionSave") {
            this.setState(prevState => ({saveType: ""}));
            this.props.setSavingState("overwritingSession");
            this.getSessionDetails();
        } else if (this.state.saveType == "snapshotNew") {
            this.props.setLatestSnapshot(myJson.uuid);
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
            this.props.setOrientation(key,"REFRESH");
        }
    }

    handleJson(myJson) {
        if (myJson.scene == undefined) {
            return;
        }
        this.checkTarget(myJson);
    };

    restoreOrientation(myOrientDict) {
        for (var div_id in myOrientDict) {
            var orientation = myOrientDict[div_id]["orientation"];
            var components = myOrientDict[div_id]["components"];
            for (var component in components) {
                this.props.loadObject(components[component]);
            }
            this.props.setNGLOrientation(div_id, orientation);
        }
    }

    generateArrowObject(start, end, name, colour) {
        return {
            "name": listTypes.VECTOR+"_"+name,
            "OBJECT_TYPE": nglObjectTypes.ARROW,
            "start": start,
            "end": end,
            "colour": colour
        }
    }

    generateCylinderObject(start, end, name, colour) {
        return {
            "name": listTypes.VECTOR+"_"+name,
            "OBJECT_TYPE": nglObjectTypes.CYLINDER,
            "start": start,
            "end": end,
            "colour": colour
        }
    }

    generateObjectList(out_data) {
        var colour = [1,0,0]
        var deletions = out_data.deletions
        var outList = [];
        for(var key in deletions) {
            outList.push(this.generateArrowObject(deletions[key][0],
                deletions[key][1],key.split("_")[0],colour))
        }
        var additions = out_data.additions
        for(var key in additions) {
            outList.push(this.generateArrowObject(additions[key][0],
                additions[key][1],key.split("_")[0],colour))
        }
        var linker = out_data.linkers
        for(var key in linker) {
            outList.push(this.generateCylinderObject(linker[key][0],
                linker[key][1],key.split("_")[0],colour))
        }
        var rings = out_data.ring
        for (var key in rings){
            outList.push(this.generateCylinderObject(rings[key][0],
                rings[key][2],key.split("_")[0],colour))
        }
        return outList;
    }

    generateBondColorMap(inputDict){
        var out_d = {}
        for(var key in inputDict){
            for(var vector in inputDict[key]){
                var vect = vector.split("_")[0]
                out_d[vect]=inputDict[key][vector];
            }
        }
        return out_d;
    }

    handleVector(json) {
        var objList = this.generateObjectList(json["3d"]);
        this.props.setVectorList(objList);
        var vectorBondColorMap = this.generateBondColorMap(json["indices"]);
        this.props.setBondColorMap(vectorBondColorMap);
    }

    redeployVectors(url) {
        fetch(url)
            .then(
                response => response.json(),
                error => console.log('An error occurred.', error)
            )
            .then(json => this.handleVector(json["vectors"]))
    }

    generateNextUuid() {
        if (this.state.nextUuid == "") {
            const uuidv4 = require('uuid/v4');
            this.setState(prevState => ({nextUuid: uuidv4()}));
            this.setState(prevState => ({newSessionFlag: 1}));
        }
    }

    getSessionDetails() {
        fetch("/api/viewscene/?uuid=" + this.props.latestSession, {
            method: "get",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        }).catch((error) => {
            this.props.setErrorMessage(error);
        }).then(function (response) {
            return response.json();
        }).then(function (myJson) {
            var title = myJson.results[JSON.stringify(0)].title;
            return title;
        }).then(title => this.props.setSessionTitle(title))
    }

    componentDidUpdate() {
        this.generateNextUuid();
        var hasBeenRefreshed = true
        if (this.props.uuid!="UNSET") {
            fetch("/api/viewscene/?uuid="+this.props.uuid)
                .then(function(response) {
                    return response.json();
                }).then(json => this.handleJson(json.results[0]))
            this.props.setUuid("UNSET");
        }
        for (var key in this.props.nglOrientations){
            if(this.props.nglOrientations[key]=="REFRESH") {
                hasBeenRefreshed = false;
            }
            if(this.props.nglOrientations[key]=="STARTED"){
                hasBeenRefreshed = false;
            }
        }
        if (hasBeenRefreshed==true) {
            var store = JSON.stringify(getStore().getState());
            const csrfToken = this.getCookie("csrftoken");
            const timeOptions = {year:'numeric', month:'numeric', day:'numeric', hour: 'numeric', minute: 'numeric',
            second: 'numeric', hour12: false,}
            var TITLE = 'Created on ' + new Intl.DateTimeFormat('en-GB', timeOptions).format(Date.now());
            var userId = DJANGO_CONTEXT["pk"];
            var stateObject = JSON.parse(store);
            var newPresentObject = Object.assign(stateObject.apiReducers.present, {latestSession: this.state.nextUuid});
            var newApiObject = Object.assign(stateObject.apiReducers, {present: newPresentObject});
            var newStateObject = Object.assign(JSON.parse(store), {apiReducers: newApiObject});
            var fullState = {state: JSON.stringify(newStateObject)};
            if (this.state.saveType == "sessionNew" && this.state.newSessionFlag == 1) {
                this.setState(prevState => ({newSessionFlag: 0}));
                var formattedState = {
                    uuid: this.state.nextUuid,
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
                var formattedState = {
                    scene: JSON.stringify(JSON.stringify(fullState))
                };
                fetch("/api/viewscene/" + JSON.parse(this.props.sessionId), {
                    method: "PATCH",
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
                    title: "undefined",
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
        var buttons = "";
        if (pathname != "/viewer/react/landing" && pathname != "/viewer/react/funders" && pathname != "/viewer/react/sessions" && pathname != "/viewer/react/targetmanagement") {
            if (this.props.sessionTitle == undefined || this.props.sessionTitle == "undefined") {
                buttons = <Col>
                    <Col xs={9}>
                        <ButtonToolbar>
                            <Button bsSize="sm" bsStyle="info" disabled>Save Session</Button>
                            <Button bsSize="sm" bsStyle="info" onClick={this.newSession}>Save Session As...</Button>
                            <Button bsSize="sm" bsStyle="info" onClick={this.newSnapshot}>Share Snapshot</Button>
                        </ButtonToolbar>
                    </Col>
                    <Col xs={3}>
                         <DownloadPdb/>
                    </Col>
                    <Row>
                        <p>Currently no active session.</p>
                    </Row>
                </Col>
            } else {
                buttons = <Col>
                    <Col xs={9}>
                        <ButtonToolbar>
                            <Button bsSize="sm" bsStyle="info" onClick={this.saveSession}>Save Session</Button>
                            <Button bsSize="sm" bsStyle="info" onClick={this.newSession}>Save Session As...</Button>
                            <Button bsSize="sm" bsStyle="info" onClick={this.newSnapshot}>Share Snapshot</Button>
                        </ButtonToolbar>
                    </Col>
                    <Col xs={3}>
                        <DownloadPdb/>
                    </Col>
                    <Row>
                        <p>Session: {this.props.sessionTitle}</p>
                    </Row>
                </Col>
            }
        }
        if (this.props.savingState.startsWith("saving") || this.props.savingState.startsWith("overwriting")) {
            return <RingLoader className={override} sizeUnit={"px"} size={30} color={'#7B36D7'} loading={(this.props.savingState.startsWith("saving") || this.props.savingState.startsWith("overwriting"))}/>
        } else {
            return <ButtonToolbar>
                {buttons}
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
      sessionTitle: state.apiReducers.present.sessionTitle,
      targetIdList: state.apiReducers.present.target_id_list,
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
    setStageColor: nglLoadActions.setStageColor,
    setSessionId: apiActions.setSessionId,
    setUuid: apiActions.setUuid,
    setSessionTitle: apiActions.setSessionTitle,
    redeployVectors: nglLoadActions.redeployVectors,
    setVectorList: selectionActions.setVectorList,
    setBondColorMap: selectionActions.setBondColorMap,
    setMolGroupOn: apiActions.setMolGroupOn,
    setTargetUnrecognised: apiActions.setTargetUnrecognised,
    setLoadingState: nglLoadActions.setLoadingState,
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SessionManagement));