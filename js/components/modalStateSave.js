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
        this.state = {loading: undefined, fraggleBoxLoc: undefined}
    }

    closeModal(){
        this.props.setSavingState(false)
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
                <div>
                    <ReactModal isOpen={this.props.savingState} style={customStyles}>
                        <div>
                            <h3>State can be viewed
                                at: {window.location.protocol}//{window.location.hostname}/viewer/react/fragglebox/{JSON.parse(this.props.latestFraggleBox)}</h3>
                            <CopyToClipboard text={window.location.protocol + window.location.hostname + "/viewer/react/fragglebox/" + JSON.parse(this.props.latestFraggleBox)} >
                                <Button bsSize="large" bsStyle="success" >Copy FraggleLink</Button>
                            </CopyToClipboard>
                            <Button bsSize="large" bsStyle="success" onClick={this.closeModal}>Close</Button>
                        </div>
                    </ReactModal>
                </div>
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
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalStateSave);
