/**
 * Created by ricgillams on 29/10/2018.
 */

import {ListGroupItem, ListGroup, Col, Checkbox} from "react-bootstrap";
import {GenericList} from "./generalComponents";
import React from "react";
import {connect} from "react-redux";
import * as apiActions from "../actions/apiActions";
import * as listType from "./listTypes";
import {withRouter, Link} from "react-router-dom";

class ProposalList extends GenericList {
    constructor(props) {
        super(props);
        this.list_type = listType.SESSIONS;
        this.render_method = this.render_method.bind(this);
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
            ]
        }

    }

    render_method(data, type) {
        if (type == "proposalList") {
            return <ListGroupItem key={data.id}>
                <p>Title: {data.id} &emsp; &emsp; &emsp; &emsp; <Checkbox inline>Load proposal</Checkbox></p>
            </ListGroupItem>
        } else if (type == "targetList") {
            return <ListGroupItem key={data.id}>
                    <p>Title: {data.id}, Proposal: {data.proposalId} &emsp; &emsp; &emsp; &emsp;
                        <Checkbox inline>Tindspect summary</Checkbox> &emsp;
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
        const userPk = DJANGO_CONTEXT["pk"]
        const username = DJANGO_CONTEXT["username"]
        const {pathname} = this.props.location;
        if (this.state.proposalList) {
            return <div>
            <Col xs={1} md={1}>
            </Col>
            <Col xs={4} md={4}>
                <h3>Proposal List</h3>
                <p>Here is a list of the proposals for which you have been registered.</p>
                <p>By checking the box, you agree for the list of target names associated with the proposal to be
                    uploaded onto the Fragalysis cloud infrastructure.</p>
                <p>You will then be able to manage the associated data for those targets, including their visibility
                    within the fragalysis app.</p>
                <ListGroup>
                    {
                        this.state.proposalList.reverse().map((data) => (this.render_method(data, "proposalList")))
                    }
                </ListGroup>
            </Col>
            <Col xs={6} md={6}>
                <h3>Target List</h3>
                <p> For each proposal approved in the left column, the related targets will appear in this list:</p>
                <ListGroup>
                    {
                        this.state.targetList.reverse().map((data) => (this.render_method(data, "targetList")))
                    }
                </ListGroup>
            </Col>
            <Col xs={1} md={1}>
            </Col>
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
    setObjectList: apiActions.setSessionIdList
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProposalList));