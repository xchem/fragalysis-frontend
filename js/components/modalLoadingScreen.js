/**
 * Created by ricgillams on 14/06/2018.
 */
import React from 'react';
import {connect} from 'react-redux';
import * as nglLoadActions from "../actions/nglLoadActions";
import ReactModal from 'react-modal';
import ReactDOM from 'react-dom';

export class ModalLoadingScreen extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        // var loadingState = this.props.loadingState;
        // if (!loadingState) {
        //     return null;
        // }
        return (
            <div>
                <button bsSize="large" bsStyle="success" onClick={this.props.setLoadingState(true)}>set to load</button>
                <button bsSize="large" bsStyle="success" onClick={this.setLoadingStateTrue}>Toggle LoadingState</button>
                <ReactModal isOpen={this.props.loadingState} onRequestClose={this.props.setLoadingState(false)}>
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
