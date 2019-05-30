/**
 * Created by abradley on 14/04/2018.
 */

import React, {Component} from "react";
import {connect} from "react-redux";
import {Row, Col} from "react-bootstrap";
import NGLView from "../components/nglComponents";
import MolGroupList from "../components/molGroupList";
import MoleculeList from "../components/moleculeList";
import MolGroupSlider from "../components/molGroupSlider";
import SummaryView from "../components/summaryView";
import CompoundList from '../components/compoundList';
import NglViewerControls from "../components/nglViewerControls";
import HotspotList from "../components/hotspotList";
import ModalStateSave from "../components/modalStateSave";
import ModalErrorMessage from "../components/modalErrorDisplay";
import ModalTargetUnrecognised from "../components/modalTargetUnrecognised";
import * as apiActions from "../actions/apiActions";
import fetch from "cross-fetch";
import {withRouter} from "react-router-dom";
import {BrowserBomb} from "../components/browserBombModal";

class Preview extends Component {

    constructor(props) {
        super(props)
        this.updateTarget = this.updateTarget.bind(this);
        this.deployErrorModal = this.deployErrorModal.bind(this);
    }

    deployErrorModal(error) {
        this.props.setErrorMessage(error);
    }

    updateTarget(){
        var target = this.props.match.params.target;
        // Get from the REST API
        if (this.props.targetIdList.length != 0) {
            var targetUnrecognised = true;
            for (var i in this.props.targetIdList) {
                if (target == this.props.targetIdList[i].title) {
                    targetUnrecognised = false;
                }
            }
        }
        this.props.setTargetUnrecognised(targetUnrecognised);
        fetch(window.location.protocol + "//" + window.location.host+"/api/targets/?title="+target)
            .then(response => response.json())
            .then(json => this.props.setTargetOn(json["results"][0].id))
            .catch((error) => {
                    this.deployErrorModal(error);
                })
    }

    componentDidMount() {
        this.updateTarget()
    }

    componentDidUpdate(){
        this.updateTarget()
    }

    render() {
        var screenHeight= window.innerHeight*0.65.toString()+"px"
        var molListHeight= window.innerHeight*0.40.toString()+"px"
        return (
            <Row>
                <Col xs={0} md={0} padding={0}>
                    <MolGroupList/>
                </Col>
                <Col xs={4} md={4} padding={0}>
                    <NGLView div_id="summary_view" height="150px"/>
                    <MolGroupSlider/>
                    <MoleculeList height={molListHeight} style={{overflow: scroll}}/>
                </Col>
                <Col xs={5} md={5} padding={0}>
                    <NGLView div_id="major_view" height={screenHeight}/>
                    <NglViewerControls/>
                </Col>
                <Col xs={3} md={3} padding={0}>
                    <SummaryView/>
                    <CompoundList/>
                    <HotspotList/>
                </Col>
                <ModalStateSave/>
                <ModalErrorMessage/>
                <ModalTargetUnrecognised/>
                <BrowserBomb/>
            </Row>
        )
    }
}

function mapStateToProps(state) {
  return {
      targetIdList: state.apiReducers.present.target_id_list,
  }
}
const mapDispatchToProps = {
    setTargetOn: apiActions.setTargetOn,
    setTargetUnrecognised: apiActions.setTargetUnrecognised,
    setErrorMessage: apiActions.setErrorMessage,
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Preview))
