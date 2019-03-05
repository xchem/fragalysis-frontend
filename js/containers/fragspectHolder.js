import React, {Component} from "react";
import {connect} from "react-redux";
import {Row, Col} from "react-bootstrap";
import FragspectList from "../components/fragspectList";
import ModalFragspectEventView from "../components/modalFragspectEventView";
// import ModalStateSave from "../components/modalStateSave";

import * as apiActions from "../actions/apiActions";

class Fragspect extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        var screenHeight= window.innerHeight*0.7.toString()+"px"
        return (
            <Row>
                <FragspectList height={screenHeight} style={{overflow: scroll}}/>
                <ModalFragspectEventView/>
            </Row>
        )
    }
}

function mapStateToProps(state) {
    return {
    }
}
const mapDispatchToProps = {
    // setTargetUnrecognised: apiActions.setTargetUnrecognised,
}

export default connect(mapStateToProps, mapDispatchToProps)(Fragspect)