/**
 * Created by ricgillams on 18/02/2019.
 */

import React, {Component} from "react";
import {connect} from "react-redux";
import ReactModal from "react-modal";
import {Tooltip, OverlayTrigger, ButtonToolbar, Row, Col} from 'react-bootstrap';
import * as apiActions from "../actions/apiActions";
import Clipboard from 'react-clipboard.js';

const customStyles = {
    overlay : {
        zIndex: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.85)'
    },
    content : {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-20%',
        transform: 'translate(-50%, -50%)',
        border: '10px solid #7a7a7a',
        width: '60%'
    }
};

export class ModalFragspectEventView extends Component {
    constructor(props) {
        super(props);
        this.getCookie = this.getCookie.bind(this);
        // this.openFraggleLink = this.openFraggleLink.bind(this);
        // this.getTitle = this.getTitle.bind(this);
        // this.handleSessionNaming = this.handleSessionNaming.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.state = {
            fraggleBoxLoc: undefined,
            snapshotLoc: undefined,
            title: undefined,
        };
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

    // openFraggleLink() {
    //     var url = "";
    //     if (this.props.savingState == "savingSnapshot") {
    //         url = window.location.protocol + "//" + window.location.hostname + "/viewer/react/snapshot/" + this.props.latestSnapshot;
    //         window.open(url);
    //     } else if (this.props.savingState == "savingSession" || this.props.savingState == "overwritingSession") {
    //         url = window.location.protocol + "//" + window.location.hostname + "/viewer/react/fragglebox/" + this.props.latestSession;
    //         window.open(url);
    //     }
    // }
    //
    // getTitle() {
    //     var _this = this;
    //     fetch("/api/viewscene/?uuid=" + this.props.latestSession, {
    //         method: "get",
    //         headers: {
    //             'Accept': 'application/json',
    //             'Content-Type': 'application/json'
    //         },
    //     }).catch((error) => {
    //         this.props.setErrorMessage(error);
    //     }).then(function (response) {
    //         return response.json();
    //     }).then(function (myJson) {
    //         var getTitle = myJson.results[JSON.stringify(0)].title;
    //         _this.props.setSessionTitle(getTitle);
    //         return getTitle;
    //     }).then(getTitle => this.setState(prevState => ({title: getTitle})))
    // }
    //
    // handleSessionNaming(e){
    //     if (e.keyCode === 13) {
    //         var title = e.target.value;
    //         console.log('submit new session name ' + title);
    //         this.props.setSessionTitle(title);
    //         const csrfToken = this.getCookie("csrftoken");
    //         var uuid = this.props.latestSession;
    //         var formattedState = {
    //             uuid: uuid,
    //             title: title,
    //         };
    //         fetch("/api/viewscene/" + JSON.parse(this.props.sessionId), {
    //                 method: "PATCH",
    //                 headers: {
    //                     'X-CSRFToken': csrfToken,
    //                     'Accept': 'application/json',
    //                     'Content-Type': 'application/json'
    //                 },
    //                 body: JSON.stringify(formattedState)
    //             }).catch((error) => {
    //                 this.props.setErrorMessage(error);
    //             });
    //     }
    // }

    closeModal() {
        // this.setState(prevState => ({fraggleBoxLoc: undefined}));
        // this.setState(prevState => ({snapshotLoc: undefined}));
        // this.setState(prevState => ({title: undefined}));
        this.props.setFragspectModalState("closed");
    }

    componentWillMount() {
        ReactModal.setAppElement('body');
    }

    componentWillReceiveProps(nextProps) {
        // if (nextProps.latestSession != undefined || nextProps.latestSnapshot != undefined) {
        //     this.setState(prevState => ({fraggleBoxLoc: nextProps.latestSession}));
        //     this.setState(prevState => ({snapshotLoc: nextProps.latestSnapshot}));
        // }
    }

    render() {
        // var urlToCopy = "";
        // var sessionRename = "";
        // var linkSection = "";
        // if (this.state.fraggleBoxLoc != undefined || this.state.snapshotLoc != undefined) {
        //     if (this.props.savingState == "savingSnapshot") {
        //         var sessionRename =<Row></Row>
        //         var urlToCopy = window.location.protocol + "//" + window.location.hostname + "/viewer/react/snapshot/" + this.props.latestSnapshot;
        //         var linkSection = <Row><strong>A permanent, fixed snapshot of the current state has been saved:<br></br><a href={urlToCopy}>{urlToCopy}</a></strong></Row>
        //     } else if (this.props.savingState == "savingSession") {
        //         if (this.state.title == undefined) {
        //             this.getTitle();
        //         }
        //         var sessionRename = <Row> <input id="sessionRename" key="sessionRename" style={{ width:300 }} defaultValue={this.state.title} onKeyDown={this.handleSessionNaming}></input><sup><br></br>To overwrite session name, enter new title above and press enter.</sup></Row>
        //         var urlToCopy = window.location.protocol + "//" + window.location.hostname + "/viewer/react/fragglebox/" + this.props.latestSession;
        //         var linkSection = <Row><strong>A new session has been generated:<br></br><a href={urlToCopy}>{urlToCopy}</a></strong></Row>
        //     } else if (this.props.savingState == "overwritingSession") {
        //         if (this.state.title == undefined) {
        //             this.getTitle();
        //         }
        //         var sessionRename = <Row> <input id="sessionRename" key="sessionRename" style={{ width:300 }} defaultValue={this.state.title} onKeyDown={this.handleSessionNaming}></input><sup><br></br>To overwrite session name, enter new title above and press enter.</sup></Row>
        //         var urlToCopy = window.location.protocol + "//" + window.location.hostname + "/viewer/react/fragglebox/" + this.props.latestSession;
        //         var linkSection = <Row><strong>Your session has been overwritten and remains available at:<br></br><a href={urlToCopy}>{urlToCopy}</a></strong></Row>
        //     }
            return (
                <ReactModal isOpen={this.props.fragspectModalState == "open"} style={customStyles}>
                    <Col xs={1} md={1}></Col>
                    <Col xs={10} md={10}>
                        <Row><p></p></Row>
                        {/*{sessionRename}*/}
                        <Row><p></p></Row>
                        {/*{linkSection}*/}
                        <Row><p></p></Row>
                        <Row><p></p></Row>
                        <Row>
                            <ButtonToolbar>
                                {/*<OverlayTrigger trigger="click" placement="bottom" overlay={tooltip}>*/}
                                    {/*<Clipboard option-container="modal" data-clipboard-text={urlToCopy}*/}
                                           {/*button-title="Copy me!">Copy link</Clipboard>*/}
                                {/*</OverlayTrigger>*/}
                                {/*<h3 style={{display: "inline"}}> </h3>*/}
                                {/*<button onClick={this.openFraggleLink}>Open in new tab</button>*/}
                                <h3>Testing modal</h3>
                                <button onClick={() => this.closeModal()}>Close</button>
                            </ButtonToolbar>
                        </Row>
                    </Col>
                    <Col xs={1} md={1}></Col>
                </ReactModal>
            );
        // } else {
        //     return null;
        // }
    }
}

function mapStateToProps(state) {
    return {
        fragspectModalState: state.apiReducers.present.fragspectModalState,
        // savingState: state.apiReducers.present.savingState,
        // latestSession: state.apiReducers.present.latestSession,
        // latestSnapshot: state.apiReducers.present.latestSnapshot,
        // sessionTitle: state.apiReducers.present.sessionTitle,
        // sessionId: state.apiReducers.present.sessionId,
    }
}

const mapDispatchToProps = {
    setFragspectModalState: apiActions.setFragspectModalState,
    // setSessionTitle: apiActions.setSessionTitle,
    // setErrorMessage: apiActions.setErrorMessage,
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalFragspectEventView);
