/**
 * Created by abradley on 14/03/2018.
 */

import React from "react";
import {Navbar, Nav, NavItem, Row, Button, Col} from "react-bootstrap";
import {connect} from "react-redux";
import * as nglObjectTypes from "../components/nglObjectTypes";
import {withRouter} from "react-router-dom";
import TargetList from "./targetList";
import SessionManagement from "./sessionManagement";
import {ErrorReport} from "./errorReport";

class Header extends React.Component {
    constructor(props) {
        super(props)
        this.getTargetList = this.getTargetList.bind(this);
        this.selectTarget = this.selectTarget.bind(this);
        this.generateTargetObject = this.generateTargetObject.bind(this);
        this.openXchem = this.openXchem.bind(this);
        this.openDiamond = this.openDiamond.bind(this);
        this.openSgc = this.openSgc.bind(this);
        this.showFunders = this.showFunders.bind(this);
    }

    getViewUrl(pk, get_view) {
        var base_url = window.location.protocol + "//" + window.location.host
        base_url += "/viewer/"+get_view+"/"+pk.toString()+"/"
        return base_url
    }

    generateTargetObject(targetData) {
        // Now deal with this target
        var prot_to_load = targetData.protein_set[0]
        if (prot_to_load != undefined) {
            var out_object = {
                "name": "PROTEIN_" + prot_to_load.toString(),
                "prot_url": this.getViewUrl(prot_to_load, "prot_from_pk"),
                "OBJECT_TYPE": nglObjectTypes.PROTEIN
            }
            return out_object
        }
        return undefined;
    }

    getTargetList() {
        var newArray = []
        for (var key in this.props.target_id_list) {
            newArray.push(this.props.target_id_list[key].title)
        }
        return newArray;
    }

    selectTarget(option) {
        this.props.history.push("/viewer/react/preview/target/" + option)
    }

    openXchem() {
        window.location.href = 'https://www.diamond.ac.uk/Instruments/Mx/Fragment-Screening.html'
    }

    openDiamond() {
        window.location.href = 'https://www.diamond.ac.uk/Home.html'
    }

    openSgc() {
        window.location.href = 'https://www.sgc.ox.ac.uk/'
    }

    showFunders() {
        window.location.href = "/viewer/react/funders"
    }

    render() {
        var landing = "/viewer/react/landing";
        var prodLanding = "https://fragalysis.diamond.ac.uk/viewer/react/landing";
        var login = "/accounts/login"
        var logout = "/accounts/logout"
        var new_ele;
        var navbarBrand;
        var username = DJANGO_CONTEXT["username"];

        if (username == "NOT_LOGGED_IN") {
            new_ele = <NavItem eventKey={1} href={login}>
                <Button> Login </Button>
            </NavItem>
        }
        else {
            new_ele = <NavItem eventKey={1} href={logout}>
                <h5><b>Hello {username}</b> Logout.</h5>
            </NavItem>
        }

        if (document.location.host.startsWith("fragalysis.diamond") !== true) {
            navbarBrand = <Navbar.Brand>
                <Row>
                    <h4><a href={landing}>Fragalysis <b>DEVELOPMENT </b></a></h4>
                </Row>
                <Row>
                    <p>Please use: <a href={prodLanding} data-toggle='tooltip' title="https://fragalysis.diamond.ac.uk">production
                        site</a></p>
                </Row>
            </Navbar.Brand>
        } else {
            navbarBrand = <Navbar.Brand>
                <h4><a href={landing}>FragalysisHome</a></h4>
            </Navbar.Brand>
        }

        return <Navbar fluid>
            <Col xs={1} md={1}></Col>
            <Col xs={11} md={11}>
                <Navbar.Header>
                    {navbarBrand}
                </Navbar.Header>
                <Nav pullLeft>
                    {new_ele}
                    <NavItem>
                        <SessionManagement/>
                    </NavItem>
                </Nav>
                <Nav pullRight>
                    <NavItem>
                        <Row>
                            <img src={require('../img/xchemLogo.png')} width="67" height="31" onClick={this.openXchem}/>
                            <img src={require('../img/dlsLogo.png')} width="100" height="31"
                                 onClick={this.openDiamond}/> <img src={require('../img/sgcLogo.png')} width="65"
                                                                   height="31" onClick={this.openSgc}/> <ErrorReport/>
                        </Row>
                        <Row>
                            <p onClick={this.showFunders}>Supported by...</p>
                        </Row>
                    </NavItem>
                </Nav>
            </Col>
            <TargetList key="TARGLIST" render={false}/>
        </Navbar>
    }
}

function mapStateToProps(state) {
    return {
        target_id_list: state.apiReducers.present.target_id_list,
    }
}
const mapDispatchToProps = {
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header))