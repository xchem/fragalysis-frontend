/**
 * Created by ricgillams on 14/06/2018.
 */

import React from "react";
import {connect} from "react-redux";
import ReactModal from "react-modal";
import {Button} from 'react-bootstrap';
import * as apiActions from "../actions/apiActions";
import TargetList from "./targetList";

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

export class ModalTargetUnrecognised extends React.Component {
    constructor(props) {
        super(props);
        this.closeModal = this.closeModal.bind(this);
        this.state = {targetUnrecognised: undefined, targetListLength: undefined};
    }

    closeModal(){
        this.setState(prevState => ({targetUnrecognised: undefined}));
        this.props.setTargetUnrecognised(undefined);
    }

    componentWillMount() {
        ReactModal.setAppElement('body')
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.targetUnrecognised != undefined){
            this.setState(prevState => ({targetUnrecognised: nextProps.targetUnrecognised}))
            this.setState(prevState => ({targetListLength: this.props.targetIdList.length}))
        }
    }

    render() {
        if (this.state.targetUnrecognised == true) {
            if(this.state.targetListLength == 0) {
                return (
                    <ReactModal isOpen={this.state.targetUnrecognised} style={customStyles}>
                        <div>
                            <h3>No targets available.<br/>Please contact Fragalysis Support!</h3>
                            <Button bsSize="large" bsStyle="success" onClick={this.closeModal}>Close</Button>
                        </div>
                    </ReactModal>
                );
            } else {
                return (
                    <ReactModal isOpen={this.state.targetUnrecognised} style={customStyles}>
                        <div>
                            <h3>Target was not recognised. <br/> Please select a target:</h3>
                            <TargetList key="TARGLIST"/>
                            <Button bsSize="large" bsStyle="success" onClick={this.closeModal}>Close</Button>
                        </div>
                    </ReactModal>
                );
            }
        } else {
            return null;
        }
    }
}

function mapStateToProps(state) {
    return {
        targetUnrecognised: state.apiReducers.present.targetUnrecognised,
        targetIdList: state.apiReducers.present.target_id_list,
    }
}

const mapDispatchToProps = {
    setTargetUnrecognised: apiActions.setTargetUnrecognised,
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalTargetUnrecognised);