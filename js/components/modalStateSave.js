/**
 * Created by ricgillams on 14/06/2018.
 */

import React, {Component} from "react";
import {connect} from "react-redux";
import ReactModal from "react-modal";
import {Tooltip, OverlayTrigger, ButtonToolbar, Row, Col, Button} from 'react-bootstrap';
import * as apiActions from "../actions/apiActions";
import Clipboard from 'react-clipboard.js';


const customStyles = {
    overlay : {
        zIndex: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.85)'
    },
    content : {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-20%',
        transform: 'translate(-50%, -50%)',
        border: '10px solid #7a7a7a'
    }
};

export class ModalStateSave extends Component {
    constructor(props) {
        super(props);
        this.openFraggleLink = this.openFraggleLink.bind(this);
        this.handleSessionNaming = this.handleSessionNaming.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.state = {
            fraggleBoxLoc: undefined,
            snapshotLoc: undefined,
        };
    }

    openFraggleLink() {
        var url = "";
        if (this.props.savingState == "savingSnapshot") {
            url = window.location.protocol + "//" + window.location.hostname + "/viewer/react/snapshot/" + this.props.latestSnapshot.slice(1, -1);
            window.open(url);
        } else if (this.props.savingState == "savingSession" || this.props.savingState == "overwritingSession") {
            url = window.location.protocol + "//" + window.location.hostname + "/viewer/react/fragglebox/" + this.props.latestSession.slice(1, -1);
            window.open(url);
        }
    }

    handleSessionNaming(e){
        if (e.keyCode === 13) {
            console.log('submit new session name ' + e.target.value);
            this.props.setSessionTitle(e.target.value);
        }
    }

    closeModal() {
        this.setState(prevState => ({fraggleBoxLoc: undefined}));
        this.setState(prevState => ({snapshotLoc: undefined}));
        this.props.setSavingState("UNSET");
    }

    componentWillMount() {
        ReactModal.setAppElement('body');
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.latestSession != undefined || nextProps.latestSnapshot != undefined) {
            this.setState(prevState => ({fraggleBoxLoc: nextProps.latestSession}));
            this.setState(prevState => ({snapshotLoc: nextProps.latestSnapshot}));
        }
    }

    render() {
        const tooltip = (
            <Tooltip id="tooltip">
                <strong>Copied!</strong>
            </Tooltip>
        );
        var urlToCopy = "";
        var information = "";
        var linkSection;
        if (this.state.fraggleBoxLoc != undefined || this.state.snapshotLoc != undefined) {
            if (this.props.savingState == "savingSnapshot") {
                var urlToCopy = window.location.protocol + "//" + window.location.hostname + "/viewer/react/snapshot/" + this.props.latestSnapshot.slice(1, -1);
                var linkSection = <Row><strong>"A permanent, fixed snapshot of the current state has been saved:"<br></br><a href={urlToCopy}>{urlToCopy}</a></strong></Row>
            } else if (this.props.savingState == "savingSession") {
                var urlToCopy = window.location.protocol + "//" + window.location.hostname + "/viewer/react/fragglebox/" + this.props.latestSession.slice(1, -1);
                var linkSection = <Row><strong>"A new session has been generated:"<br></br><a href={urlToCopy}>{urlToCopy}</a></strong></Row>
            } else if (this.props.savingState == "overwritingSession") {
                var urlToCopy = window.location.protocol + "//" + window.location.hostname + "/viewer/react/fragglebox/" + this.props.latestSession.slice(1, -1);
                var linkSection = <Row><strong>"Your session has been overwritten and remains:"<br></br><a href={urlToCopy}>{urlToCopy}</a></strong></Row>
            }
            if (this.props.savingState == "overwritingSession") {
                // Session address:
            } else {

            }
            if (this.props.savingState == "overwritingSession") {
                // Session address:
            } else {

            }
            return (
                <ReactModal isOpen={this.props.savingState.startsWith("saving") || this.props.savingState.startsWith("overwriting")} style={customStyles}>
                    <Col xs={1} md={1}>
                    </Col>
                    <Col xs={10} md={10}>
                    <Row>
                        <p></p>
                    </Row>
                    <Row>
                        <input id="sessionRename" key="sessionRename" style={{ width:300 }} defaultValue={this.state.sessionTitle} onKeyDown={this.handleSessionNaming}></input>
                    </Row>
                    <Row>
                        <p></p>
                    </Row>
                        {linkSection}
                    <Row>
                        <p></p>
                    </Row>
                    <Row>
                        <p></p>
                    </Row>
                    <Row>
                        <ButtonToolbar>
                            <OverlayTrigger trigger="click" placement="bottom" overlay={tooltip}>
                                <Clipboard option-container="modal" data-clipboard-text={urlToCopy}
                                           button-title="Copy me!">Copy link</Clipboard>
                            </OverlayTrigger>
                            <h3 style={{display: "inline"}}> </h3>
                            <button onClick={this.openFraggleLink}>Open in new tab</button>
                            <h3 style={{display: "inline"}}> </h3>
                            <button onClick={this.closeModal}>Close</button>
                        </ButtonToolbar>
                    </Row>
                    </Col>
                    <Col xs={1} md={1}>
                    </Col>
                </ReactModal>
            );
        } else {
            return null;
        }
    }
}

function mapStateToProps(state) {
    return {
        savingState: state.apiReducers.present.savingState,
        latestSession: state.apiReducers.present.latestSession,
        latestSnapshot: state.apiReducers.present.latestSnapshot,
        sessionTitle: state.apiReducers.present.sessionTitle,
    }
}

const mapDispatchToProps = {
    setSavingState: apiActions.setSavingState,
    setSessionTitle: apiActions.setSessionTitle,
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalStateSave);
