/**
 * Created by ricgillams on 14/06/2018.
 */
import React from 'react';
import {connect} from 'react-redux';
import * as nglLoadActions from "../actions/nglLoadActions";
import ReactModal from 'react-modal';
import { Button, Well, Col, Row } from 'react-bootstrap'
import {setLoadingState} from "../actions/nglLoadActions";

export class ModalLoadingScreen extends React.Component {
    constructor(props) {
        super(props);
        this.setLoadingStateFalse() = this.setLoadingStateFalse.bind(this);

    }

    setLoadingStateFalse() {
        this.props.setLoadingState(false)
    }

    render() {
        // var loadingState = this.props.loadingState;
        // if (!loadingState) {
        //     return null;
        // }
        return (
            <div>
                <ReactModal isOpen={this.props.loadingState} onRequestClose={this.setLoadingStateFalse()}>
                    Here's some content for the modal
                </ReactModal>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        loadingState: state.nglReducers.loadingState
    }
}

const mapDispatchToProps = {
    setLoadingState: nglLoadActions.setLoadingState
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalLoadingScreen);
