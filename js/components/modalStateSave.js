/**
 * Created by ricgillams on 14/06/2018.
 */

import React, {Component} from "react";
import {connect} from "react-redux";
import ReactModal from "react-modal";
import {Tooltip, OverlayTrigger, ButtonToolbar, Row} from 'react-bootstrap';
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
        this.closeModal = this.closeModal.bind(this);
        this.state = {fraggleBoxLoc: undefined}
        this.openFraggleLink = this.openFraggleLink.bind(this)
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

    closeModal() {
        this.setState(prevState => ({fraggleBoxLoc: undefined}));
        this.props.setSavingState("UNSET");
    }

    componentWillMount() {
        ReactModal.setAppElement('body');
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.latestSession != undefined) {
            this.setState(prevState => ({fraggleBoxLoc: nextProps.latestSession}))
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
        if (this.state.fraggleBoxLoc != undefined) {
            if (this.props.savingState == "savingSnapshot") {
                urlToCopy = window.location.protocol + "//" + window.location.hostname + "/viewer/react/snapshot/" + this.props.latestSnapshot.slice(1, -1);
                information = "A permanent, fixed snapshot of the current state has been saved ";
            } else if (this.props.savingState == "savingSession") {
                urlToCopy = window.location.protocol + "//" + window.location.hostname + "/viewer/react/fragglebox/" + this.props.latestSession.slice(1, -1);
                information = "A new session has been generated ";
            } else if (this.props.savingState == "overwritingSession") {
                urlToCopy = window.location.protocol + "//" + window.location.hostname + "/viewer/react/fragglebox/" + this.props.latestSession.slice(1, -1);
                information = "Your session has been overwritten and remains ";
            }
            return (
                <ReactModal isOpen={this.props.savingState.startsWith("saving") || this.props.savingState.startsWith("overwriting")} style={customStyles}>
                    <Row>
                        <strong>
                            {information}<a href={urlToCopy}>here.</a>
                        </strong>
                    </Row>
                    <Row>
                        <ButtonToolbar>
                            <OverlayTrigger trigger="click" placement="bottom" overlay={tooltip}>
                                <Clipboard option-container="modal" data-clipboard-text={urlToCopy}
                                           button-title="Copy me!">Copy link</Clipboard>
                            </OverlayTrigger>
                            <button onClick={this.openFraggleLink}>Open in new tab</button>
                            <button onClick={this.closeModal}>Close</button>
                        </ButtonToolbar>
                    </Row>
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
    }
}

const mapDispatchToProps = {
    setSavingState: apiActions.setSavingState,
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalStateSave);
