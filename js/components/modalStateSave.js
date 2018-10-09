/**
 * Created by ricgillams on 14/06/2018.
 */

import React from "react";
import {connect} from "react-redux";
import ReactModal from "react-modal";
import {Button} from 'react-bootstrap';
import * as apiActions from "../actions/apiActions";
import {CopyToClipboard} from 'react-copy-to-clipboard';

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

export class ModalStateSave extends React.Component {
    constructor(props) {
        super(props);
        this.closeModal = this.closeModal.bind(this);
        this.state = {fraggleBoxLoc: undefined}
        this.openFraggleLink = this.openFraggleLink.bind(this)
    }

    openFraggleLink(){
        var url = window.location.protocol + "//" + window.location.hostname + "/viewer/react/fragglebox/" + this.props.latestFraggleBox.slice(1, -1);
        window.open(url);
    }

    closeModal(){
        this.setState(prevState => ({fraggleBoxLoc: undefined}));
        this.props.setLatestFraggleBox(undefined);
        this.props.setSavingState(false);
    }

    componentWillMount() {
        ReactModal.setAppElement('body')
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.latestFraggleBox != undefined && nextProps.savingState == true){
            this.setState(prevState => ({fraggleBoxLoc: nextProps.latestFraggleBox}))
        }
    }

    render() {
        if (this.state.fraggleBoxLoc != undefined) {
            return (
                <ReactModal isOpen={this.props.savingState} style={customStyles}>
                    <div>
                        <h3>State can be viewed at: {window.location.protocol}//{window.location.hostname}/viewer/react/fragglebox/{this.props.latestFraggleBox.slice(1, -1)}</h3>
                        <CopyToClipboard text={window.location.protocol + "//" + window.location.hostname + "/viewer/react/fragglebox/" + this.props.latestFraggleBox.slice(1, -1)} >
                            <Button bsSize="large" bsStyle="success" >Copy FraggleLink</Button>
                        </CopyToClipboard>
                        <Button bsSize="large" bsStyle="success" onClick={this.openFraggleLink}>Open in new tab</Button>
                        <Button bsSize="large" bsStyle="success" onClick={this.closeModal}>Close</Button>
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
