/**
 * Created by ricgillams on 14/06/2018.
 */

import React, {Component} from "react";
import {connect} from "react-redux";
import ReactModal from "react-modal";
import {Button, Tooltip, OverlayTrigger, ButtonToolbar} from 'react-bootstrap';
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
        var url = window.location.protocol + "//" + window.location.hostname + "/viewer/react/fragglebox/" + this.props.latestFraggleBox.slice(1, -1);
        window.open(url);
    }

    closeModal() {
        this.setState(prevState => ({fraggleBoxLoc: undefined}));
        this.props.setLatestFraggleBox(undefined);
        this.props.setSavingState(false);
    }

    componentWillMount() {
        ReactModal.setAppElement('body');
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.latestFraggleBox != undefined && nextProps.savingState == true) {
            this.setState(prevState => ({fraggleBoxLoc: nextProps.latestFraggleBox}))
        }
    }


    render() {

        const tooltip = (
            <Tooltip id="tooltip">
                <strong>Copied!</strong>
            </Tooltip>
        );

        if (this.state.fraggleBoxLoc != undefined) {
            var url_to_copy = window.location.protocol + "//" + window.location.hostname + "/viewer/react/fragglebox/" + this.props.latestFraggleBox.slice(1, -1)
            return (
                <ReactModal isOpen={this.props.savingState} style={customStyles}>
                    <div>
                        <h3>State can be viewed at: {url_to_copy}</h3>
                        <ButtonToolbar>
                        <OverlayTrigger trigger="click" placement="bottom" overlay={tooltip}>
                            <Clipboard option-container="modal" data-clipboard-text={url_to_copy} button-title="Copy me!" >Copy FraggleLink</Clipboard>
                        </OverlayTrigger>
                        <button onClick={this.openFraggleLink}>Open in new tab</button>
                        <button onClick={this.closeModal}>Close</button>
                            </ButtonToolbar>
                    </div>
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
        latestFraggleBox: state.apiReducers.present.latestFraggleBox,
    }
}

const mapDispatchToProps = {
    setSavingState: apiActions.setSavingState,
    setLatestFraggleBox: apiActions.setLatestFraggleBox,
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalStateSave);
