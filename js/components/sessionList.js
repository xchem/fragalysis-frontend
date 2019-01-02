/**
 * Created by ricgillams on 29/10/2018.
 */

import {ListGroupItem, ListGroup, Row, Col, OverlayTrigger, ButtonToolbar, Tooltip} from "react-bootstrap";
import {GenericList} from "./generalComponents";
import React from "react";
import {connect} from "react-redux";
import * as apiActions from "../actions/apiActions";
import * as listType from "./listTypes";
import {withRouter, Link} from "react-router-dom";
import Clipboard from 'react-clipboard.js';
import { css } from 'react-emotion';
import { RingLoader } from 'react-spinners';

const override = css`
    display: block;
    margin: 0 auto;
    border-color: red;
`;

class SessionList extends GenericList {
    constructor(props) {
        super(props);
        this.list_type = listType.SESSIONS;
        this.getCookie = this.getCookie.bind(this);
        this.renameStateSession = this.renameStateSession.bind(this);
        this.handleSessionNaming = this.handleSessionNaming.bind(this);
        this.deleteStateSession = this.deleteStateSession.bind(this);
        this.deleteSession = this.deleteSession.bind(this);
        this.renderDeleteButton = this.renderDeleteButton.bind(this);
        this.render_method = this.render_method.bind(this);
    }

    getCookie(name) {
        if (!document.cookie) {
            return null;
        }
        const xsrfCookies = document.cookie.split(';')
            .map(c => c.trim())
            .filter(c => c.startsWith(name + '='));
        if (xsrfCookies.length === 0) {
            return null;
        }
        return decodeURIComponent(xsrfCookies[0].split('=')[1]);
    }

    renameStateSession(id, title) {
        let currentSessionList = this.props.object_list;
        for (var session in currentSessionList) {
            if (currentSessionList[session].id == id) {
                Object.assign(currentSessionList[session], {title: title});
            }
        }
        this.props.updateSessionIdList(currentSessionList)
    }

    handleSessionNaming(e) {
        if (e.keyCode === 13) {
            var id = e.target.id;
            var title = e.target.value;
            this.renameStateSession(id, title);
            console.log('submit new session name ' + title);
            const csrfToken = this.getCookie("csrftoken");
            var formattedState = {
                id: id,
                title: title,
            };
            fetch("/api/viewscene/" + id, {
                method: "PATCH",
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formattedState)
            }).catch((error) => {
                this.props.setErrorMessage(error);
            });
        }
    }

    deleteStateSession(id) {
        let currentSessionList = this.props.object_list;
        for (var session in currentSessionList) {
            if (currentSessionList[session].id === id) {
                currentSessionList.splice(session, 1);
            }
        }
        this.props.updateSessionIdList(currentSessionList)
        if (this.props.object_list.length == 23) {
            this.props.setSeshListSaving(true)
            window.location.reload();
        }
    }

    deleteSession(id) {
        this.deleteStateSession(id);
        const csrfToken = this.getCookie("csrftoken");
        var sceneUrl = "/api/viewscene/" + id;
        fetch(sceneUrl, {
            method: 'delete',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            }
        });
    }

    renderDeleteButton(data) {
        var _this = this;
        var deleteButton = <button onClick={function onClick() {_this.deleteSession(data.id)}} >Delete</button>
        return deleteButton;
    }

    renderCopyUrlButton(data) {
        const tooltip = (<Tooltip id="tooltip"><strong>Copied!</strong></Tooltip>);
        var urlToCopy = window.location.protocol + "//" + window.location.hostname + "/viewer/react/fragglebox/" + data.uuid;
        var copyButton = <OverlayTrigger trigger="click" placement="bottom" overlay={tooltip}>
            <Clipboard option-container="modal" data-clipboard-text={urlToCopy} button-title="Copy URL">Copy link</Clipboard>
        </OverlayTrigger>
        return copyButton;
    }

    render_method(data) {
        const {pathname} = this.props.location;
        var fragglebox = "/viewer/react/fragglebox/" + data.uuid;
        if (pathname == "/viewer/react/sessions") {
            return <ListGroupItem key={data.id}>
                <Row>
                    <Col xs={3} md={3}><Row></Row><p></p><Row><p>Title: <Link to={fragglebox}>{this.props.object_list[this.props.object_list.findIndex(x => x.id==data.id)].title}</Link></p></Row></Col>
                    <Col xs={3} md={3}><Row></Row><p></p><Row><p>Last modified on {data.modified.slice(0,10)} at {data.modified.slice(11,19)}</p></Row></Col>
                    <Col xs={1} md={1}><Row></Row><p></p><Row><p>Target: {data.target_on_name}</p></Row></Col>
                    <Col xs={3} md={3}><input id={data.id} key="sessRnm" style={{width: 250}} defaultValue={data.title} onKeyDown={this.handleSessionNaming}></input><sup><br></br>To rename, type new title & press enter.</sup></Col>
                    <Col xs={2} md={2}><ButtonToolbar>{this.renderCopyUrlButton(data)} {this.renderDeleteButton(data)}</ButtonToolbar></Col>
                </Row>
            </ListGroupItem>
        } else {
            return <ListGroupItem key={data.id}>
                <Row>
                    <Col xs={1} md={1} lg{1}></Col>
                    <Col xs={6} md={6} lg{7}><Row></Row><p></p><Row><p>Title: <Link to={fragglebox}>{data.title}</Link></p></Row></Col>
                    <Col smHidden md={5} lg{4}><Row></Row><p></p><Row><p>Target: {data.target_on_name}</p></Row></Col>
                </Row>
            </ListGroupItem>
        }
    }

    componentDidMount() {
        this.loadFromServer();
        setInterval(this.loadFromServer, 50);
    }

    render() {
        const {pathname} = this.props.location;
        var sessionListTitle;
        if (this.props.object_list.length != 0 && this.props.object_list.length <= 15){
            sessionListTitle = <h3>Session List:</h3>
        } else if (this.props.object_list.length > 15){
            sessionListTitle = <h3>You have {this.props.object_list.length} sessions. Please consider deleting old/unused <a href="/viewer/react/sessions">sessions</a> to improve performance.</h3>
        }
         if (this.props.seshListSaving == true) {
            return <RingLoader className={override} sizeUnit={"px"} size={30} color={'#7B36D7'} loading={(this.props.seshListSaving == true)}/>
        } else {
             if (this.props != undefined && this.props.object_list) {
                 if (DJANGO_CONTEXT["username"] == "NOT_LOGGED_IN") {
                     return <h3>Please log in to view session history.</h3>
                 } else if (this.props.object_list.length == 0) {
                     return <div><h3>You do not own any sessions!</h3><p>Proceed to a target to generate sessions.</p>
                     </div>
                 } else {
                     if (pathname != "/viewer/react/sessions") {
                         return <div>
                             {sessionListTitle}
                             <ListGroup>
                                 {
                                     this.props.object_list.slice(0, 10).map((data) => (this.render_method(data)))
                                 }
                             </ListGroup>
                             <p>Full list and session management here: <a href="/viewer/react/sessions">Sessions</a></p>
                         </div>;
                     } else {
                         return <div>
                             {sessionListTitle}
                             <ListGroup>
                                 {
                                     this.props.object_list.map((data) => (this.render_method(data)))
                                 }
                             </ListGroup>
                         </div>;
                     }
                 }
             } else {
                 return null;
             }
        }
    }
}

function mapStateToProps(state) {
    return {
        object_list: state.apiReducers.present.sessionIdList,
        seshListSaving: state.apiReducers.present.seshListSaving,
    }
}

const mapDispatchToProps = {
    setObjectList: apiActions.setSessionIdList,
    updateSessionIdList: apiActions.updateSessionIdList,
    setSeshListSaving: apiActions.setSeshListSaving,
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SessionList));