/**
 * Created by ricgillams on 14/06/2018.
 */
import React from 'react';
import {connect} from 'react-redux';
import ReactModal from 'react-modal';
import { Button, Well, Col, Row } from 'react-bootstrap'


const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-20%',
    transform             : 'translate(-50%, -50%)'
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
                        <img src={ require('../img/Fragglebox_logo_v0.2.png')} width="1200" height="606" />
                    </div>
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
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalLoadingScreen);
