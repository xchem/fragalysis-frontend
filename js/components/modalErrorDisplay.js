/**
 * Created by ricgillams on 14/06/2018.
 */

import React from "react";
import {connect} from "react-redux";
import ReactModal from "react-modal";
import {Button} from 'react-bootstrap';
import * as apiActions from "../actions/apiActions";

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

export class ModalErrorMessage extends React.Component {
    constructor(props) {
        super(props);
        this.closeModal = this.closeModal.bind(this);
        this.state = {errorMessage: undefined};
    }

    closeModal(){
        this.setState(prevState => ({errorMessage: undefined}));
        this.props.setErrorMessage(undefined);
        this.props.setSavingState(false);
    }

    componentWillMount() {
        ReactModal.setAppElement('body')
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.errorMessage != undefined && nextProps.savingState == true){
            this.setState(prevState => ({errorMessage: nextProps.errorMessage}))
        }
    }

    render() {
        if (this.state.errorMessage != undefined) {
            return (
                <ReactModal isOpen={this.props.savingState} style={customStyles}>
                    <div>
                        <h3>Error occurred during state saving. Please contact Fragalysis support!</h3>
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
        errorMessage: state.apiReducers.present.errorMessage,
        savingState: state.apiReducers.present.savingState,
    }
}

const mapDispatchToProps = {
    setErrorMessage: apiActions.setErrorMessage,
    setSavingState: apiActions.setSavingState,
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalErrorMessage);
