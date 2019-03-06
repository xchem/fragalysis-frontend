/**
 * Created by ricgillams on 14/06/2018.
 */

import React from "react";
import {connect} from "react-redux";
import ReactModal from "react-modal";

const customStyles = {
    overlay : {
        zIndex: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.85)'
    },
    content : {
        top: '10%',
        left: '10%',
        right: '10%',
        bottom: '10%',
        marginRight: '-20%',
        transform: 'translate(0%, 0%)',
        border: '10px solid #7a7a7a',
        width: '80%',
        height:'80%'
    }
};

export class ModalFragspectLoading extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        ReactModal.setAppElement('body')
    }

    render() {
        return (
            <div>
                <ReactModal isOpen={this.props.fragspectLoadingState} style={customStyles}>
                    <div>
                        <img src={ require('../img/fragspectLogo_v0.3.png')}/>
                    </div>
                </ReactModal>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        fragspectLoadingState: state.apiReducers.present.fragspectLoadingState
    }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalFragspectLoading);
