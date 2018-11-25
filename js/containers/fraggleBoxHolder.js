/**
 * Created by ricgillams in 25/06/2018.
 */

import React, {Component} from "react";
import {connect} from "react-redux";
import {Row, Col} from "react-bootstrap";
import MolGroupList from "../components/molGroupList";
import MoleculeList from "../components/moleculeList";
import MolGroupSlider from "../components/molGroupSlider";
import SummaryView from "../components/summaryView";
import CompoundList from '../components/compoundList';
import NGLView from "../components/nglComponents";
import NglViewerControls from "../components/nglViewerControls";
import {withRouter} from "react-router-dom";
import * as apiActions from "../actions/apiActions";
import ModalLoadingScreen from "../components/modalLoadingScreen";
import ModalStateSave from "../components/modalStateSave";
import ModalErrorMessage from "../components/modalErrorDisplay";
import HotspotList from "../components/hotspotList";
import {BrowserBomb} from "../components/browserBombModal";
// import {ModalTargetUnrecognised} from "../components/modalTargetUnrecognised";

class FraggleBox extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount(){
        if (this.props.match.params.uuid != undefined) {
            var uuid = this.props.match.params.uuid;
            this.props.setUuid(uuid);
            this.props.setLatestSession(uuid);
        } else if (this.props.match.params.snapshotUuid != undefined) {
            var snapshotUuid = this.props.match.params.snapshotUuid;
            this.props.setUuid(snapshotUuid);
        }
        // this.updateTarget();
    }

    render() {
        var screenHeight= window.innerHeight*0.75.toString()+"px"
        var molListHeight= window.innerHeight*0.5.toString()+"px"
        return (
            <Row >
                <Col xs={0} md={0}>
                    <MolGroupList />
                </Col>
                <Col xs={3} md={3}>
                    <NGLView div_id="summary_view" height="200px"/>
                    <MolGroupSlider />
                    <MoleculeList height={molListHeight} style={{overflow: scroll}}/>
                </Col>
                <Col xs={5} md={5} >
                    <NGLView div_id="major_view" height={screenHeight}/>
                    <NglViewerControls />
                </Col>
                <Col xs={4} md={4}>
                    <SummaryView />
                    <CompoundList />
                    <HotspotList />
                </Col>
                <ModalLoadingScreen/>
                <ModalStateSave/>
                <ModalErrorMessage/>
                {/*<ModalTargetUnrecognised/>*/}
                <BrowserBomb/>
          </Row>
        )
    }
}

function mapStateToProps(state) {
  return {
  }
}
const mapDispatchToProps = {
    setUuid: apiActions.setUuid,
    setLatestSession: apiActions.setLatestSession,
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(FraggleBox))