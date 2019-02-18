/**
 * Created by ricgillams on 18/02/2019.
 */

import React, {Component} from "react";
import {connect} from "react-redux";
import ReactModal from "react-modal";
import {Button, Row, Col} from 'react-bootstrap';
import * as apiActions from "../actions/apiActions";

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
        this.colorToggle = this.colorToggle.bind(this);
        this.convertDeposition = this.convertDeposition.bind(this);
        this.convertConfidence = this.convertConfidence.bind(this);
        this.getCookie = this.getCookie.bind(this);
        // this.openFraggleLink = this.openFraggleLink.bind(this);
        // this.getTitle = this.getTitle.bind(this);
        // this.handleSessionNaming = this.handleSessionNaming.bind(this);
        this.closeModal = this.closeModal.bind(this);
        var base_url = window.location.protocol + "//" + window.location.host;
        this.img_url = new URL(base_url + '/viewer/img_from_smiles/');
        this.state = {
            fraggleBoxLoc: undefined,
            snapshotLoc: undefined,
            title: undefined,
            "confidenceStatus": {
                1: "Low",
                2: "Medium",
                3: "High",
                4: "Not viewed",
                5: "Interesting",
                6: "Discard"
            },
            "depositionStatus": {
                1: "Analysis Pending",
                2: "PanDDA Model",
                3: "In Refinement",
                4: "CompChem Ready",
                5: "Deposition Ready",
                6: "Deposited",
                7: "Analysed and Rejected"
            },
            "interestingStatus": {
                0: "No",
                1: "Yes"
            }
        };
    }

    colorToggle() {
        var colorDict = [
            '#95918C',
            '#d53e4f',
            '#fc8d59',
            '#fee08b',
            '#e6f598',
            '#99d594',
            '#3288bd',
            '#95918C'
        ];
        return {backgroundColor: colorDict[this.props.data.event_status]};
    }

    convertDeposition() {
        return this.props.data.event_status.toString() + '. ' + this.state.depositionStatus[this.props.data.event_status];
    }

    convertConfidence() {
        return this.state.confidenceStatus[this.props.data.confidence];
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
        // this.setState(prevState => ({fragspectModalState: "closed"}));
        console.log("closing fragspect modal");
        this.props.setFragspectModalState("closed");
    }

    componentWillMount() {
        ReactModal.setAppElement('body');
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.fragspectModalState == "open") {
            this.setState(prevState => ({fragspectModalState: nextProps.fragspectModalState}));
        }
    }

    render() {
        // var urlToCopy = "";
        // var sessionRename = "";
        // var linkSection = "";
        if (this.state.fragspectModalState == "open" && this.state.fragspectModalState != undefined) {
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
                <ReactModal isOpen={this.props.fragspectModalState.startsWith("open")} style={customStyles}>
                    <Col xs={1} md={1}></Col>
                    <Col xs={10} md={10}>
                        <Row>
                            <p className="text-center"><b>{this.props.fragspectModalContents.crystal}</b></p>
                        </Row>
                        <Row>
                            <p className="text-center">{this.props.fragspectModalContents.site_number.toString()}</p>
                        </Row>
                        <Row>
                            <p className="text-center">{this.props.fragspectModalContents.lig_id}</p>
                        </Row>
                        <Row>
                            <Panel style={this.colorToggle()}>
                                <Image src={this.img_url+"&dummy=png"} responsive rounded />
                            </Panel>
                        </Row>
                        <Row>
                            <p className="text-center"><b>{this.convertDeposition()}</b></p>
                        </Row>
                        <Row>
                            <p className="text-center">{this.convertConfidence()}</p>
                        </Row>
                        <Row>
                            <p className="text-center">{this.props.fragspectModalContents.event_resolution.toString()} Å</p>
                        </Row>
                        <Row>
                            <p className="text-center">{this.props.fragspectModalContents.space_group}</p>
                            <p className="text-center">{this.props.fragspectModalContents.cell_dimensions}</p>
                            <p className="text-center">{this.props.fragspectModalContents.cell_angles}</p>
                        </Row>
                        <Row>
                            <input id={this.props.fragspectModalContents.fragId} key="comment" defaultValue={this.props.fragspectModalContents.event_comment} onKeyDown={this.handleSessionNaming}></input>
                        </Row>
                        <Row>
                            <p className="text-center"><b>{this.state.interestingStatus[this.props.fragspectModalContents.interesting]}</b></p>
                        </Row>
                        <Row>
                                <Button onClick={this.closeModal}>Close</Button>
                        </Row>
                    </Col>
                    <Col xs={1} md={1}></Col>
                </ReactModal>
            );
        } else {
            return null;
        }
    }
}

function mapStateToProps(state) {
    return {
        fragspectModalState: state.apiReducers.present.fragspectModalState,
        fragspectModalContents: state.apiReducers.present.fragspectModalContents,
    }
}

const mapDispatchToProps = {
    setFragspectModalState: apiActions.setFragspectModalState,
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalFragspectEventView);
