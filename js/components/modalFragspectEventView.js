/**
 * Created by ricgillams on 18/02/2019.
 */

import React, {Component} from "react";
import {connect} from "react-redux";
import ReactModal from "react-modal";
import {Button, Row, Col, Image, Panel, ToggleButtonGroup, ToggleButton} from 'react-bootstrap';
import * as apiActions from "../actions/apiActions";

const customStyles = {
    overlay : {
        zIndex: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.85)'
    },
    content : {
        top: '5%',
        left: '5%',
        right: '95%',
        bottom: '5%',
        marginRight: '-20%',
        transform: 'translate(50%, -0%)',
        border: '10px solid #7a7a7a',
        width: '60%'
    }
};

export class ModalFragspectEventView extends Component {
    constructor(props) {
        super(props);
        this.handleStatusChange = this.handleStatusChange.bind(this);
        this.colorToggle = this.colorToggle.bind(this);
        this.convertDeposition = this.convertDeposition.bind(this);
        this.convertConfidence = this.convertConfidence.bind(this);
        this.getCookie = this.getCookie.bind(this);
        // this.openFraggleLink = this.openFraggleLink.bind(this);
        // this.getTitle = this.getTitle.bind(this);
        // this.handleSessionNaming = this.handleSessionNaming.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.generateMolImage = this.generateMolImage.bind(this);
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
            },
            "buttonsDepressed": [],
            "initiated": 0
        };
    }

    handleStatusChange(value) {
        var newButtonsDepressed = this.state.buttonsDepressed.slice();
        var added = value.filter(function(i) {return newButtonsDepressed.indexOf(i)<0;})[0]
        if (added == undefined) {
            console.log("handleStatusChange has not detected a change!")
        } else {
            if (added <= 7) {
                var oldStatus = newButtonsDepressed.find(function (element) {
                    return element <=7;
                });
            } else if (added <= 10) {
                var oldStatus = newButtonsDepressed.find(function (element) {
                    return element > 7 && element <= 10;
                });
            } else {
                var oldStatus = newButtonsDepressed.find(function (element) {
                    return element > 10;
                });
            }
            newButtonsDepressed.splice(newButtonsDepressed.indexOf(oldStatus), 1);
            newButtonsDepressed.push(added);
            this.setState(prevState => ({buttonsDepressed: newButtonsDepressed}));
        }
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
        return {backgroundColor: colorDict[this.props.fragspectModalContents.event_status]};
    }

    convertDeposition() {
        return this.props.fragspectModalContents.event_status.toString() + '. ' + this.state.depositionStatus[this.props.fragspectModalContents.event_status];
    }

    convertConfidence() {
        return this.state.confidenceStatus[this.props.fragspectModalContents.confidence];
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

    generateMolImage(smiles) {
        var base_url = window.location.protocol + "//" + window.location.host;
        var img_url = new URL(base_url + '/viewer/img_from_smiles/');
        var get_params = {
            "img_type": "png",
            "smiles": smiles
        }
        Object.keys(get_params).forEach(key => img_url.searchParams.append(key, get_params[key]))
        var key = "mol_image"
        return <Image src={img_url+"&dummy=png"} responsive rounded />
    }

    buttonRender(type, value, status) {
        if (type == "Deposition") {
            var button = <ToggleButton bsSize="sm" bsStyle="warning" value={value}>{value}: {this.state.depositionStatus[value]}</ToggleButton>;
        } else if (type == "Confidence") {
            var button = <ToggleButton bsSize="sm" bsStyle="info" value={value}>{this.state.confidenceStatus[status]}</ToggleButton>;
        } else if (type == "Interesting") {
            var button = <ToggleButton bsSize="sm" bsStyle="success" value={value} key={"interesting"+ value.toString()}>{this.state.interestingStatus[status]}</ToggleButton>;
        }
        return button;
    }

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
            if (this.state.initiated == 0) {
                var newButtonsDepressed = [];
                newButtonsDepressed.push(nextProps.fragspectModalContents.event_status);
                newButtonsDepressed.push(nextProps.fragspectModalContents.confidence + 7);
                newButtonsDepressed.push(nextProps.fragspectModalContents.interesting + 11);
                this.setState(prevState => ({buttonsDepressed: newButtonsDepressed}));
                this.setState(prevState => ({initiated: 1}));
            }
        }
    }

    render() {
        // var urlToCopy = "";
        // var sessionRename = "";
        // var linkSection = "";
        if (this.props.fragspectModalContents != undefined) {
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
                <ReactModal isOpen={this.props.fragspectModalState.startsWith("open")} style={customStyles} onRequestClose={this.closeModal} shouldCloseOnOverlayClick={true}>
                    <Col xs={1} md={1}></Col>
                    <Col xs={10} md={10}>
                        <Row>
                            <Col xs={7} md={7}>
                                <h1 className="text-center"><b>{this.props.fragspectModalContents.code}</b></h1>
                                <p> </p>
                                <Col xs={6} md={6}><h3 className="text-center">Target: {this.props.fragspectModalContents.target_name}</h3></Col>
                                <Col xs={6} md={6}><h3 className="text-center">Site: {this.props.fragspectModalContents.site_number}</h3></Col>
                                <p> </p>
                                <p className="text-center">Space group: {this.props.fragspectModalContents.space_group} {this.props.fragspectModalContents.cell_dimensions} ({this.props.fragspectModalContents.cell_angles})</p>
                            </Col>
                            <Col xs={2} md={2}>
                                {this.generateMolImage(this.props.fragspectModalContents.smiles)}
                            </Col>
                            <Col xs={1} md={1}></Col>
                        </Row>
                        <Row>
                            <Col xs={5} md={5}>
                                <p> </p>
                                <p>Crystal status: {this.props.fragspectModalContents.crystal_status}. {this.state.depositionStatus[this.props.fragspectModalContents.crystal_status]}</p>
                                <p> </p>
                                <p>Event status: {this.props.fragspectModalContents.event_status}. {this.state.depositionStatus[this.props.fragspectModalContents.event_status]}</p>
                                <Col xs={6} md={6}>
                                    <ToggleButtonGroup vertical block type="checkbox" value={this.state.buttonsDepressed} onChange={this.handleStatusChange}>
                                        {this.buttonRender("Deposition", 1, "Analysis Pending")}
                                        {this.buttonRender("Deposition", 2, "PanDDA Model")}
                                        {this.buttonRender("Deposition", 3, "In Refinement")}
                                    </ToggleButtonGroup>
                                </Col>
                                <Col xs={6} md={6}>
                                    <ToggleButtonGroup vertical block type="checkbox" value={this.state.buttonsDepressed} onChange={this.handleStatusChange}>
                                        {this.buttonRender("Deposition", 4, "CompChem Ready")}
                                        {this.buttonRender("Deposition", 5, "Deposition Ready")}
                                        {this.buttonRender("Deposition", 6, "Deposited")}
                                        {this.buttonRender("Deposition", 7, "Analysed and Rejected")}
                                    </ToggleButtonGroup>
                                </Col>
                                <p> </p>
                                <p>Confidence: {this.state.confidenceStatus[this.props.fragspectModalContents.confidence]}</p>
                                <Col xs={2} md={2}></Col>
                                <Col xs={8} md={8}>
                                    <div className="text-center">
                                        <ToggleButtonGroup type="checkbox" value={this.state.buttonsDepressed} onChange={this.handleStatusChange}>
                                            {this.buttonRender("Confidence", 8, 1)}
                                            {this.buttonRender("Confidence", 9, 2)}
                                            {this.buttonRender("Confidence", 10, 3)}
                                        </ToggleButtonGroup>
                                    </div>
                                </Col>
                                <Col xs={2} md={2}></Col>
                                <p> </p>
                                <p> </p>
                                <p>Interesting? {this.state.interestingStatus[this.props.fragspectModalContents.interesting]}</p>
                                <Col xs={2} md={2}></Col>
                                <Col xs={8} md={8}>
                                    <div className="text-center">
                                        <ToggleButtonGroup type="checkbox" value={this.state.buttonsDepressed} onChange={this.handleStatusChange}>
                                            {this.buttonRender("Interesting", 11, 0)}
                                            {this.buttonRender("Interesting", 12, 1)}
                                        </ToggleButtonGroup>
                                    </div>
                                </Col>
                                <Col xs={2} md={2}></Col>
                            </Col>
                            <Col xs={5} md={5}>
                                {this.generateMolImage("NCl")}
                            </Col>
                        </Row>
                        <Row>
                            <p className="inline"> </p><input id={this.props.fragspectModalContents.fragId} key="comment" defaultValue={this.props.fragspectModalContents.event_comment} onKeyDown={this.handleSessionNaming}></input>
                        </Row>
                        <Row>
                            <p> </p>
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
