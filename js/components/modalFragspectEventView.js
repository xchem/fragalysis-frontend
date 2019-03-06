/**
 * Created by ricgillams on 18/02/2019.
 */

import React, {Component} from "react";
import {connect} from "react-redux";
import ReactModal from "react-modal";
import {Button, Row, Col, Image, Panel, ToggleButtonGroup, ToggleButton} from 'react-bootstrap';
import * as apiActions from "../actions/apiActions";
import * as nglObjectTypes from "../components/nglObjectTypes";
import * as nglLoadActions from "../actions/nglLoadActions";
// import NGLSpectView from "../components/nglSpectView";
import NGLView from "../components/nglComponents";
import fragspectLogo from "../img/fragspectLogo_v0.1.png";

const customStyles = {
    overlay : {
        zIndex: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.85)'
    },
    content : {
        top: '5%',
        left: '5%',
        right: '5%',
        bottom: '5%',
        marginRight: '-20%',
        transform: 'translate(0%, 0%)',
        border: '10px solid #7a7a7a',
        width: '90%',
        height:'90%'
    }
};

export class ModalFragspectEventView extends Component {
    constructor(props) {
        super(props);
        this.handleStatusChange = this.handleStatusChange.bind(this);
        this.colorToggle = this.colorToggle.bind(this);
        this.convertDeposition = this.convertDeposition.bind(this);
        this.getCookie = this.getCookie.bind(this);
        // this.openFraggleLink = this.openFraggleLink.bind(this);
        // this.getTitle = this.getTitle.bind(this);
        this.handleDensity = this.handleDensity.bind(this);
        // this.loadProtein = this.loadProtein.bind(this);
        this.loadDensity = this.loadDensity.bind(this);
        this.handleDensity = this.handleDensity.bind(this);
        this.closeModal = this.closeModal.bind(this);
        // this.generateTargetObject = this.generateTargetObject.bind(this);
        this.generateMolImage = this.generateMolImage.bind(this);
        this.state = {
            loadedObjects: [],
            fraggleBoxLoc: undefined,
            snapshotLoc: undefined,
            title: undefined,
            "confidenceInterpretor":{
                "null": 100,
                "0 - No Ligand placed": 100,
                "Low": 1 ,
                "Medium": 2,
                "High": 3
            },
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
        // this.setState(prevState => ({fragspectModalState: "closed"}));
        console.log("closing fragspect modal");
        for (var nglObj in this.props.objectsInView){
            this.props.deleteObject(nglObj);
        }
        this.props.setFragspectModalState("closed");

    }

    // generateTargetObject() {
    //     // if(JSON.stringify(this.props.targetOn)!=JSON.stringify(undefined)) {
    //         var out_object = {
    //             "name": "PROTEIN_" + this.props.fragspectModalContents.target_id.toString(),
    //             "prot_url": this.props.boundPdbUrl,
    //             "OBJECT_TYPE": nglObjectTypes.PROTEIN,
    //             "nglProtStyle": this.props.nglProtStyle
    //         }
    //         return out_object
    //     // }
    //     // return undefined;
    // }
    //
    // loadProtein() {
    //     var proteinQuery = "?code=" + this.props.fragspectModalContents.code;
    //     var targetId = this.props.fragspectModalContents.target_id.toString();
    //     fetch("/api/proteins/" + proteinQuery, {
    //         method: "get",
    //         headers: {
    //             'Accept': 'application/json',
    //             'Content-Type': 'application/json'
    //         }
    //     }).then(function (response) {
    //         return response.json();
    //     }).then(function (myJson) {
    //         var proteinObject = {
    //             "name": "PROTEIN_" + targetId,
    //             "prot_url": myJson.results[0].pdb_info.replace("http:",window.location.protocol),
    //             "OBJECT_TYPE": nglObjectTypes.PROTEIN,
    //             "nglProtStyle": "cartoon",
    //             "display_div": "fragspect"
    //         };
    //         return proteinObject;
    //     // }).then(proteinObject => this.handleProtein(proteinObject))
    //     }).then(proteinObject => this.props.loadObject(proteinObject))
    // }

    loadDensity() {
        //
        // var loaderQuery = this.props.fragspectModalContents.crystal + "_" + this.props.data.fragspectModalContents.site_number.toString() + "_" + this.props.fragspectModalContents.event_number.toString();
        // fetch(window.location.protocol + "//" + window.location.host + "/api/proteins/?code=" + loaderQuery)
        //     .then(response => response.json())
        //     .then(json => this.setLoader(json))
        //     // .then(this.initialiseButtons(json.results))
        //     .catch((error) => {
        //         // this.deployErrorModal(error);
        //     })
        var densityQuery = "?code=" + this.props.fragspectModalContents.crystal + "_" + this.props.fragspectModalContents.site_number.toString() + "_" + this.props.fragspectModalContents.event_number.toString();
        // var densityQuery = "?code=" + this.props.fragspectModalContents.code;
        var crystal = this.props.fragspectModalContents.crystal;
        var ligId = this.props.fragspectModalContents.lig_id;
        fetch("/api/proteins/" + densityQuery, {
            method: "get",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(function (response) {
            return response.json();
        }).then(function (myJson) {
            var densityObject = {
                "name": "EVENTLOAD_" + crystal,
                "OBJECT_TYPE": nglObjectTypes.EVENTMAP,
                "map_info": myJson.results[0].map_info.replace("http:",window.location.protocol),
                "xtal": crystal,
                "lig_id": ligId,
                "pdb_info": myJson.results[0].bound_info.replace("http:",window.location.protocol),
                "display_div": "fragspect"
            };
            return densityObject;
        }).then(densityObject => this.handleDensity(densityObject));
    }

    handleDensity(densityObject){
        if (this.state.loadedObjects.includes(densityObject)){
            this.props.deleteObject(densityObject);
        } else {
            var loadedObjects = this.state.loadedObjects;
            var newLoadedObjects = Object.assign(loadedObjects, densityObject);
            this.setState(prevState => ({loadedObjects: newLoadedObjects}));
            this.props.loadObject(densityObject);
        }
    }

    // loadDensity() {
    //     var densityQuery = "?code=" + this.props.fragspectModalContents.code;
    //     var targetId = this.props.fragspectModalContents.target_id.toString();
    //     fetch("/api/proteins/" + densityQuery, {
    //         method: "get",
    //         headers: {
    //             'Accept': 'application/json',
    //             'Content-Type': 'application/json'
    //         }
    //     }).then(function (response) {
    //         return response.json();
    //     }).then(function (myJson) {
    //         var densityObject = {
    //             "name": "HOTSPOT_" + targetId,
    //             // "hotUrl": "https://fragalysis.apps.xchem.diamond.ac.uk/media/maps/MURD-x0349_apolar_bERY5JJ.ccp4",
    //             "hotUrl": myJson.results[0].map_info.replace("http:",window.location.protocol),
    //             "display_div": "fragspect",
    //             "OBJECT_TYPE": nglObjectTypes.HOTSPOT,
    //             "map_type": "AP",
    //             "fragment": "4780",
    //             "isoLevel": 1,
    //             "opacity": 0.9,
    //             "disablePicking": true
    //         };
    //         return densityObject;
    //     }).then(densityObject => this.props.loadObject(densityObject))
    // }

    componentWillMount() {
        ReactModal.setAppElement('body');
    }

    componentDidMount() {
        if (this.props.fragspectModalContents != undefined){
            // this.loadDensity()
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState(prevState => ({buttonsDepressed: []}));
        if (nextProps.fragspectModalState == "open") {
            // if (this.state.initiated == 0) {
                // this.loadDensity()
                var newButtonsDepressed = [];
                var numericalInterestingness = nextProps.fragspectModalContents.interesting == true ? 1 : 0;
                newButtonsDepressed.push(nextProps.fragspectModalContents.event_status);
                newButtonsDepressed.push(this.state.confidenceInterpretor[nextProps.fragspectModalContents.confidence] + 7);
                newButtonsDepressed.push(numericalInterestingness + 11);
                this.setState(prevState => ({buttonsDepressed: newButtonsDepressed}));
                this.setState(prevState => ({initiated: 1}));
            // }
        }
    }

    componentWillUnmount(){
        console.log("unmounting modal")
    }

    render() {
        // var urlToCopy = "";
        // var sessionRename = "";
        // var linkSection = "";
        var rowHeight = window.innerHeight * 0.1.toString() + "px";
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
                            <Row style={{height: window.innerHeight * 0.01.toString() + "px"}}></Row>
                            <h1 className="text-center"><b>{this.props.fragspectModalContents.crystal}_{this.props.fragspectModalContents.site_number.toString()}_{this.props.fragspectModalContents.event_number.toString()}</b></h1>
                            <Row style={{height: window.innerHeight * 0.01.toString() + "px"}}></Row>
                            <Col xs={5} md={5}>
                                <Col xs={6} md={6}>
                                    <Row style={{height: window.innerHeight * 0.02.toString() + "px"}}></Row>
                                    <h2>Crystal: {this.props.fragspectModalContents.crystal}</h2>
                                    <Row style={{height: window.innerHeight * 0.01.toString() + "px"}}></Row>
                                    <h2>Site {this.props.fragspectModalContents.site_number}</h2>
                                    <Row style={{height: window.innerHeight * 0.01.toString() + "px"}}></Row>
                                    <p>Space group: {this.props.fragspectModalContents.spacegroup}.</p>
                                    <p>Unit cell: {this.props.fragspectModalContents.cell.split(' ')[0]}, {this.props.fragspectModalContents.cell.split(' ')[1]}, {this.props.fragspectModalContents.cell.split(' ')[2]} ({this.props.fragspectModalContents.cell.split(' ')[3]}, {this.props.fragspectModalContents.cell.split(' ')[4]}, {this.props.fragspectModalContents.cell.split(' ')[5]})</p>
                                    <p>Crystal status: {this.props.fragspectModalContents.crystal_status}. {this.state.depositionStatus[parseInt(this.props.fragspectModalContents.crystal_status)]}</p>
                                </Col>
                                <Col xs={6} md={6}>
                                    {this.generateMolImage(this.props.fragspectModalContents.smiles)}
                                </Col>
                                <Row style={{height: window.innerHeight * 0.02.toString() + "px"}}></Row>
                                <Row>
                                    <h3 className="text-center">Event status: {this.props.fragspectModalContents.event_status.toString()}. {this.state.depositionStatus[this.props.fragspectModalContents.event_status]}</h3>
                                    <Row style={{height: window.innerHeight * 0.01.toString() + "px"}}></Row>
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
                                </Row>
                                <Row style={{height: window.innerHeight * 0.02.toString() + "px"}}></Row>
                                <Row>
                                    <Col xs={6} md={6}>
                                        <h3 className="text-center">Confidence: {this.props.fragspectModalContents.confidence}</h3>
                                        <Row style={{height: window.innerHeight * 0.01.toString() + "px"}}></Row>
                                        <div className="text-center">
                                            <ToggleButtonGroup type="checkbox" value={this.state.buttonsDepressed} onChange={this.handleStatusChange}>
                                                {this.buttonRender("Confidence", 8, 1)}
                                                {this.buttonRender("Confidence", 9, 2)}
                                                {this.buttonRender("Confidence", 10, 3)}
                                            </ToggleButtonGroup>
                                        </div>
                                    </Col>
                                    <Col xs={6} md={6}>
                                        <h3 className="text-center">Interesting? {this.state.interestingStatus[this.props.fragspectModalContents.interesting == true ? 1 : 0]}</h3>
                                        <Row style={{height: window.innerHeight * 0.01.toString() + "px"}}></Row>
                                        <div className="text-center">
                                            <ToggleButtonGroup type="checkbox" value={this.state.buttonsDepressed} onChange={this.handleStatusChange}>
                                                {this.buttonRender("Interesting", 11, 0)}
                                                {this.buttonRender("Interesting", 12, 1)}
                                            </ToggleButtonGroup>
                                        </div>
                                    </Col>
                                </Row>
                                <Row style={{height: window.innerHeight * 0.05.toString() + "px"}}></Row>
                                <Row>
                                    <div className="text-center">
                                    <input id={this.props.fragspectModalContents.id} key="comment" defaultValue={this.props.fragspectModalContents.event_comment} onKeyDown={this.handleSessionNaming}></input>
                                    </div>
                                </Row>
                                <Row style={{height: window.innerHeight * 0.05.toString() + "px"}}></Row>
                                <Row>
                                    <Button onClick={this.closeModal}>Close</Button>
                                    {/*<Button onClick={this.loadProtein}>Load Protein</Button>*/}
                                    <Button bsStyle="primary" onClick={this.loadDensity}>Load Density</Button>
                                </Row>
                            </Col>
                            <Col xs={7} md={7}>
                                <Row>
                                {/*<NGLSpectView div_id="fragspectModal" height={window.innerHeight*0.7.toString()+"px"}/>*/}
                                <NGLView div_id="fragspect" height={window.innerHeight*0.7.toString()+"px"}/>
                                </Row>
                                <Row>
                                    <h3>Mouse Controls</h3>
                                </Row>
                                <Col xs={4} md={4}>
                                    <p>left button and drag: rotate</p>
                                    <p>press scroll wheel and drag: translate</p>
                                </Col>
                                <Col xs={4} md={4}>
                                    <p>right button: zoom</p>
                                    <p>Ctrl + right button: change depth of clipping</p>
                                </Col>
                                <Col xs={4} md={4}>
                                    <p>scroll wheel: change electron density contour</p>
                                    {/*<img src={fragspectLogo+"&dummy=png"} responsive rounded />*/}
                                </Col>
                            </Col>
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
        nglProtStyle: state.nglReducers.present.nglProtStyle,
        objectsInView: state.nglReducers.present.objectsInView
    }
}

const mapDispatchToProps = {
    setFragspectModalState: apiActions.setFragspectModalState,
    loadObject: nglLoadActions.loadObject,
    deleteObject: nglLoadActions.deleteObject
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalFragspectEventView);
