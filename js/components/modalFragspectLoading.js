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
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-20%',
        transform: 'translate(-50%, -50%)',
        border: '10px solid #7a7a7a'
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
                        {/*<img src={ require('../img/fragspectLogo_v0.1.png')}/>*/}
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
