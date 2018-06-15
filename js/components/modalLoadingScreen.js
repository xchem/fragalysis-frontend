/**
 * Created by ricgillams on 14/06/2018.
 */
import React from 'react';
import {connect} from 'react-redux';
import * as nglLoadActions from "../actions/nglLoadActions";
import ReactModal from 'react-modal';
import { Button, Well, Col, Row } from 'react-bootstrap'
import {setLoadingState} from "../actions/nglLoadActions";

const customStyles = {
  content : {
    top                   : '20%',
    left                  : '20%',
    right                 : '-20%',
    bottom                : '-20%',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

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
        return (
            <div>
                <ReactModal isOpen={this.props.loadingState} style={customStyles}>
                    FraggleBox is currently loading your shared structure...

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
