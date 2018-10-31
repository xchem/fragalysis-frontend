/**
 * Created by ricgillams on 21/06/2018.
 */
import {Col, Row} from "react-bootstrap";
import React from "react";
import {connect} from "react-redux";
import TargetList from "./targetList";
import SessionList from "./sessionList";
import {BrowserBomb} from "./browserBombModal";

export class Welcome extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        var text_div;
        if (DJANGO_CONTEXT["authenticated"] == true) {
            var entry_text = "You're logged in as " + DJANGO_CONTEXT["username"]
            text_div = <h3>{entry_text}</h3>
        }
        else {
            text_div = <h3>{"\n"}To view own targets login here: <a className="inline" href="/accounts/login">FedID Login</a></h3>
        }
        return (
            <Row>
                <Col xs={3} md={3}>
                    <div>
                        <h1>Welcome to Fragalysis{"\n"}</h1>
                        {text_div}
                    </div>
                </Col>
                <Col xs={4} md={4}>
                    <div>
                        <TargetList key="TARGLIST"/>
                    </div>
                </Col>
                <Col xs={4} md={4}>
                    <div>
                        <SessionList key="SESSIONLIST"/>
                    </div>
                </Col>
                <Col xs={1} md={1}>
                    <BrowserBomb/>
                </Col>
            </Row>
        )
    }
}

function mapStateToProps(state) {
  return {
  }
}
const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(Welcome)