/**
 * Created by ricgillams on 21/06/2018.
 */
import {Col, Row} from "react-bootstrap";
import React from "react";
import {connect} from "react-redux";
import TargetList from "./targetList";
import SessionList from "./sessionList";
import {BrowserBomb} from "./browserBombModal";
import { Link } from 'react-router-dom';

export class Welcome extends React.Component {
    constructor(props) {
        super(props);
        this.handleFragspectLaunch = this.handleFragspectLaunch.bind(this);
        this.state = {
            "fragspectTarget": "undefined",
            "fragspectAddress": "undefined"
        }
    }

    handleFragspectLaunch(e) {
        if (e.keyCode === 13) {
            var target = e.target.value;
            var fragspectAddress = "/viewer/react/fragspect/" + e.target.value;
            console.log('launch fragspect ' + target);
            this.setState(prevState => ({fragspectTarget: target}));
            this.setState(prevState => ({fragspectAddress: fragspectAddress}));
        }
    }

    // ###### can I use a similar approach to get the link to clikc itself instead of generating a link and then it needing to be clicked. #####
    // download_file(file_data, file_name) {
    //     var encodedUri = encodeURI(file_data);
    //     var link = document.createElement("a");
    //     link.setAttribute("href", encodedUri);
    //     link.setAttribute("download", file_name);
    //     document.body.appendChild(link); // Required for FF
    //     link.click();
    // }

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
                <Col xs={1} md={1}></Col>
                <Col xs={2} md={2}>
                    <Row>
                        <h1>Welcome to Fragalysis{"\n"}</h1>
                        {text_div}
                    </Row>
                    <Row style={{height: window.innerHeight * 0.1.toString() + "px"}}></Row>
                    <Row>
                        <h1>Fragspect launcher{"\n"}</h1>
                        <h3>Insert target name and press enter to generate Fragspect link below*:</h3>
                        <input id="fragspect_launch" key="fragspectLauncher" style={{width: 250}} defaultValue="" onKeyDown={this.handleFragspectLaunch}></input>
                        <p><Link to={this.state.fragspectAddress}>{this.state.fragspectTarget}</Link></p>
                        <p>*this is only available to users who are registered for the visit in question. Please ensure you are logged in. </p>
                        <p>If you do not have access and you believe you should, please contact a beamline scientist, with the details of the target and visit.</p>
                    </Row>
                    <Row style={{height: window.innerHeight * 0.1.toString() + "px"}}></Row>
                    <Row>
                        <h1>Target overview</h1>
                        <p><a className="inline" href="http://cs04r-sc-vserv-137.diamond.ac.uk:8089/overview/targets/">Click here to launch</a> (only accessible within Diamond)</p>
                    </Row>
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