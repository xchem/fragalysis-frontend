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
        this.setLoadingStateFalse = this.setLoadingStateFalse.bind(this);
    }

    setLoadingStateFalse() {
        this.props.setLoadingState(false)
    }

    componentWillMount() {
        ReactModal.setAppElement('body')
    }

    render() {
        // var loadingState = this.props.loadingState;
        // if (!loadingState) {
        //     return null;
        // }
        return (
            <div>
                <ReactModal isOpen={this.props.loadingState}
                            onRequestClose={this.setLoadingStateFalse()}
                                closeTimeoutMS={6000}>
                    Here's some content for the modal
                    <Button bsSize="large" bsStyle="success" onClick={this.setLoadingStateFalse}>loadingState to False</Button>
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
