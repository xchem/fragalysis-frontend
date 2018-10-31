/**
 * Created by ricgillams on 29/10/2018.
 */

import {ListGroupItem, ListGroup} from "react-bootstrap";
import {GenericList} from "./generalComponents";
import React from "react";
import {connect} from "react-redux";
import * as apiActions from "../actions/apiActions";
import * as listType from "./listTypes";
import {withRouter, Link} from "react-router-dom";

class SessionList extends GenericList {
    constructor(props) {
        super(props);
        this.list_type = listType.SESSIONS;
        this.render_method = this.render_method.bind(this);
    }

    render_method(data) {
        var fragglebox = "/viewer/react/fragglebox/" + data.uuid;
        return <ListGroupItem key={data.id}>
            <p>Title: <Link to={fragglebox}>{data.title}</Link>, Target: {data.target_on_name}</p>
        </ListGroupItem>
    }

    componentDidMount() {
        this.loadFromServer();
        setInterval(this.loadFromServer, 50);
    }

    render() {
        const userPk = DJANGO_CONTEXT["pk"]
        const {pathname} = this.props.location;
        if (this.props != undefined && this.props.object_list) {
            if (pathname != "/viewer/react/sessions") {
                return <div>
                    <h3>Session List:</h3>
                    <ListGroup>
                        {
                            this.props.object_list.reverse().slice(0, 10).map((data) => (this.render_method(data)))
                        }
                    </ListGroup>
                    <p>More sessions and details here: <a href="/viewer/react/sessions">Sessions</a></p>
                </div>;
            } else {
                return <div>
                    <h3>Session List:</h3>
                    <ListGroup>
                        {
                            this.props.object_list.reverse().map((data) => (this.render_method(data)))
                        }
                    </ListGroup>
                    <p>More sessions and details here: <a href="/viewer/react/sessions">Sessions</a></p>
                </div>;
            }
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SessionList));