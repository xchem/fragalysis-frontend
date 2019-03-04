import React, {Component} from "react";
import {connect} from "react-redux";
import {Row, Col} from "react-bootstrap";
import FragspectList from "../components/fragspectList";
import ModalFragspectEventView from "../components/modalFragspectEventView";
// import ModalStateSave from "../components/modalStateSave";
import {withRouter} from "react-router-dom";
import * as apiActions from "../actions/apiActions";

class Fragspect extends Component {

    constructor(props) {
        super(props)
    }

    updateTarget(){
        var target = this.props.match.params.target;
        // Get from the REST API
        // if (this.props.targetIdList.length != 0) {
        //     var targetUnrecognised = true;
        //     for (var i in this.props.targetIdList) {
        //         if (target == this.props.targetIdList[i].title) {
        //             targetUnrecognised = false;
        //         }
        //     }
        // }
        // this.props.setTargetUnrecognised(targetUnrecognised);
        fetch(window.location.protocol + "//" + window.location.host+"/xcdb/fragspect/?crystal__target__target_name__iexact="+target)
            .then(response => response.json())
            .then(json => this.props.setTargetOn(json["results"][0].target_name))
            .catch((error) => {
                    // this.deployErrorModal(error);
                })
    }

    componentDidMount() {
        this.updateTarget()
    }

    componentDidUpdate(){
        this.updateTarget()
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
    return {}
}
const mapDispatchToProps = {
    setTargetOn: apiActions.setTargetOn,
    setTargetUnrecognised: apiActions.setTargetUnrecognised,
    setErrorMessage: apiActions.setErrorMessage,
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Fragspect))