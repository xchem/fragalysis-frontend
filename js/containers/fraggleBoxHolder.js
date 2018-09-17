/**
 * Created by ricgillams in 25/06/2018.
 */

import React, {Component} from "react";
import {connect} from "react-redux";
import {Row, Col, Image} from "react-bootstrap";
import MolGroupList from "../components/molGroupList";
import MoleculeList from "../components/moleculeList";
import MolGroupSlider from "../components/molGroupSlider";
import SummaryView from "../components/summaryView";
import CompoundList from '../components/compoundList';
import NGLView from "../components/nglComponents";
import NglViewerControls from "../components/nglViewerControls";
import {withRouter} from "react-router-dom";
import * as nglLoadActions from "../actions/nglLoadActions";
import ModalLoadingScreen from "../components/modalLoadingScreen";
import HotspotList from "../components/hotspotList";
import * as apiActions from "../actions/apiActions";

class FraggleBox extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount(){
        var uuid = this.props.match.params.uuid;
        this.props.setUuid(uuid);
        // this.props.setStageColor
        // this.updateTarget();
    }

    render() {
        return (
            <Row >
                <Col xs={0} md={0}>
                    <MolGroupList />
                </Col>
                <Col xs={3} md={3}>
                    <NGLView div_id="summary_view" height="200px"/>
                    <MolGroupSlider />
                    <MoleculeList style={{overflow:scroll}}/>
                </Col>
                <Col xs={5} md={5} >
                    <NGLView div_id="major_view" height="600px"/>
                    <NglViewerControls />
                </Col>
                <Col xs={4} md={4}>
                    <SummaryView />
                    <CompoundList />
                    <HotspotList />
                </Col>
                <ModalLoadingScreen/>
          </Row>
        )
    }
}

function mapStateToProps(state) {
  return {
      setStageColor: nglLoadActions.setStageColor,
  }
}
const mapDispatchToProps = {
    setUuid: nglLoadActions.setUuid,
    setTargetOn: apiActions.setTargetOn,
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(FraggleBox))