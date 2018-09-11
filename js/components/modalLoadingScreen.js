/**
 * Created by ricgillams on 14/06/2018.
 */

import React from "react";
import {connect} from "react-redux";
import ReactModal from "react-modal";
import {Button, Well, Col, Row} from "react-bootstrap";

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

export class ModalLoadingScreen extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        ReactModal.setAppElement('body')
    }

    render() {
        return (
            <div>
                <ReactModal isOpen={this.props.loadingState} style={customStyles}>
                    <div>
                        <img src={ require('../img/Fragglebox_logo_v0.2.png')} width="494" height="349" />
                    </div>
                </ReactModal>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        loadingState: state.nglReducers.present.loadingState
    }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalLoadingScreen);
