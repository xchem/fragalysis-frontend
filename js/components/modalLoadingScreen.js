/**
 * Created by ricgillams on 14/06/2018.
 */
import React from 'react';
import {connect} from 'react-redux';
import ReactModal from 'react-modal';
import { Button, Well, Col, Row } from 'react-bootstrap'
// import fraggleBoxLogo from '../img/Fragglebox_logo_v0.2.jpg';


const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
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
                    <h3> FraggleBox loading</h3>
                    <div>
                        <img src="https://www.dropbox.com/s/k615mrlhs7a19ae/Fragglebox_logo_v0.2.jpg?dl=0"/>
                    </div>
                    Loading your FraggleBox structure...
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
