/**
 * Created by ricgillams on 29/10/2018.
 */

import {ListGroupItem, ListGroup, Col, Checkbox, Row} from "react-bootstrap";
import {GenericList} from "./generalComponents";
import React from "react";
import {connect} from "react-redux";
import * as listType from "./listTypes";
import {withRouter} from "react-router-dom";
// import {withRouter, Link} from "react-router-dom";

class ProposalList extends GenericList {
    constructor(props) {
        super(props);
        this.list_type = listType.SESSIONS;
        this.render_method = this.render_method.bind(this);
        this.handleCheckedProposal = this.handleCheckedProposal.bind(this);
        this.state = {
            proposalList: [
                {id: "LB-test1", owner: "qwu18777"},
                {id: "LB-test2", owner: "qwu18777"},
                {id: "LB-test3", owner: "qwu18777"}
                ],
            targetList: [
                {id: "target-test1", proposalId: "LB-test1", owner: "qwu18777"},
                {id: "target-test2", proposalId: "LB-test1", owner: "qwu18777"},
                {id: "target-test3", proposalId: "LB-test2", owner: "qwu18777"}
            ],
            checkedProposals: [],
        }
    }

    // checked={this.state.checkboxChecked} onchange={this.handleCheckedProposal}
    // handleChange(evt) {
    //     this.setState({checkboxChecked: evt.target.checked});
    // }
    //
    // handleToggle() {
    //     this.setState({ checkboxChecked: !this.state.checkboxChecked });
    // }

    handleCheckedProposal(e){

    }

    render_method(data, type) {
        if (type == "proposalList") {
            return <ListGroupItem key={data.id}>
                <p>Title: {data.id} &emsp; &emsp; &emsp; &emsp; <Checkbox id={data.id} inline>Load proposal</Checkbox></p>
            </ListGroupItem>
        } else if (type == "targetList") {
            return <ListGroupItem key={data.id}>
                    <p>Title: {data.id}, Proposal: {data.proposalId} &emsp; &emsp; &emsp; &emsp;
                        <Checkbox inline>Fragalysis (private)</Checkbox> &emsp;
                        <Checkbox inline>Fragalysis (public)</Checkbox>
                    </p>
            </ListGroupItem>
        }
    }

    componentDidMount() {
        this.loadFromServer();
        setInterval(this.loadFromServer, 50);
    }

    render() {
        // const userPk = DJANGO_CONTEXT["pk"]
        // const username = DJANGO_CONTEXT["username"]
        // const {pathname} = this.props.location;
        if (this.state.proposalList) {
            return <div>
                <Row>
                    <Col xs={1} md={1}></Col>
                    <Col xs={4} md={4}>
                        <h3>Proposal List</h3>
                        <p></p>
                        <p>Here is a list of the proposals for which you have been registered.</p>
                        <p>Upon checking the box, the targets associated with the proposal will be uploaded into the Fragalysis cloud infrastructure.</p>
                        <p>You will then be able to manage the associated data for each target independently.</p>
                    </Col>
                    <Col xs={6} md={6}>
                        <h3>Target List</h3>
                        <p></p>
                        <p> For each proposal approved in the left column, the related targets will appear in the list below.</p>
                        <p> Upon checking the private box, the target will becoming visible to users from the relevant proposal.</p>
                        <p> If you would like to make your data publicly accessible, check the public box. Public targets do not require a FedID login for access.</p>
                    </Col>
                    <Col xs={1} md={1}></Col>
                </Row>
                <Row><p></p></Row>
                <Row>
                    <Col xs={1} md={1}></Col>
                    <Col xs={4} md={4}>
                        <ListGroup>
                            {
                                this.state.proposalList.reverse().map((data) => (this.render_method(data, "proposalList")))
                            }
                        </ListGroup>
                    </Col>
                    <Col xs={6} md={6}>
                        <ListGroup>
                            {
                                this.state.targetList.reverse().map((data) => (this.render_method(data, "targetList")))
                            }
                        </ListGroup>
                    </Col>
                    <Col xs={1} md={1}></Col>
                </Row>
                <Row><p></p></Row>
                <Row>
                    <Col xs={1} md={1}></Col>
                    <Col xs={10} md={10}>
                        <h3>In accordance with the Diamond data policy, we use reasonable endeavours to preserve the confidentiality of your experimental data!!!</h3>
                        <p>The Diamond data policy is located here: <a className="inline" href="https://www.diamond.ac.uk/Users/Policy-Documents/Policies/Experimental-Data-Management-Pol.html">https://www.diamond.ac.uk/Users/Policy-Documents/Policies/Experimental-Data-Management-Pol.html</a></p>
                    </Col>
                    <Col xs={1} md={1}></Col>
                </Row>
            </div>
        } else {
            return null;
        }
    }
}

function mapStateToProps(state) {
    return {
        object_list: state.apiReducers.present.sessionIdList,
    }
}

const mapDispatchToProps = {
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProposalList));