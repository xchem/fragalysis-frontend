import React, {Component} from "react";
import {connect} from "react-redux";
import {Row, Col} from "react-bootstrap";
import NGLView from "../components/nglComponents";
import FragspectList from "../components/fragspectList";

class Fragspect extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <Row>
                <FragspectList/>
            </Row>
        )
    }
}

function mapStateToProps(state) {
  return {
  }
}

export default connect(mapStateToProps)(Fragspect)