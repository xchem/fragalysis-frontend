import React, {Component} from "react";
import {connect} from "react-redux";
import {Row, Col} from "react-bootstrap";
import FragspectList from "../components/fragspectList";
import ModalFragspectEventView from "../components/modalFragspectEventView";
// import ModalStateSave from "../components/modalStateSave";
// import {withRouter} from "react-router-dom";
import * as apiActions from "../actions/apiActions";

class Fragspect extends Component {

    constructor(props) {
        super(props)
        this.updateTarget = this.updateTarget.bind(this)
        this.setTarget = this.setTarget.bind(this)
    }

    // componentWillMount() {
        // this.updateTarget()
    // }

    // componentDidMount() {
    //     this.updateTarget()
    // }
    //
    // componentDidUpdate(){
    //     this.updateTarget()
    // }

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
        fragspectTarget: state.apiReducers.present.fragspectTarget
    }
}
const mapDispatchToProps = {
    setFragspectTarget: apiActions.setFragspectTarget,
    // setTargetUnrecognised: apiActions.setTargetUnrecognised,
}

export default connect(mapStateToProps, mapDispatchToProps)(Fragspect)