/**
 * Created by ricgillams on 04/02/2019.
 */

import {Col, Row, Image, Panel, Grid, ToggleButton, ButtonToolbar} from "react-bootstrap";
import React from "react";
import {connect} from "react-redux";
import * as apiActions from "../actions/apiActions";

const customStyles = {
    blackFont: {
        color: '#000000'
    }
}

class FragspectView extends React.Component {

    constructor(props) {
        super(props);
        this.colorToggle = this.colorToggle.bind(this);
        this.convertDeposition = this.convertDeposition.bind(this);
        this.convertConfidence = this.convertConfidence.bind(this);
        this.openModal = this.openModal.bind(this);
        this.updateModalData = this.updateModalData.bind(this);
        var base_url = window.location.protocol + "//" + window.location.host
        this.img_url = new URL(base_url + '/viewer/img_from_smiles/')
        var get_params = {
            "img_type": "png",
            "smiles": props.data.smiles
        }
        Object.keys(get_params).forEach(key => this.img_url.searchParams.append(key, get_params[key]))
        this.key = "mol_image"
        this.state = {
            "boundPdbUrl": undefined,
            "eDensityMapUrl": undefined,
            "confidenceStatus": {
                "null": 1,
                "0 - No Ligand placed": 1,
                "Low": 1 ,
                "Medium": 2,
                "High": 3
                // 4: "Not viewed",
                // 5: "Interesting",
                // 6: "Discard"
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
        return {backgroundColor: colorDict[this.props.data.event_status]};
    }

    convertDeposition() {
        return this.props.data.event_status.toString() + '. ' + this.state.depositionStatus[this.props.data.event_status];
    }

    convertConfidence() {
        return this.state.confidenceStatus[this.props.data.confidence];
    }

    openModal(){
        this.updateModalData();
        this.props.setFragspectModalState("open");
        // fetch(window.location.protocol + "//" + window.location.host+"/api/proteins/?code="+this.props.data.code)
        //     .then(response => response.json())
        //     .then(json => this.props.setTargetOn(json["results"][0].pdb_info))
        //     .catch((error) => {
        //             this.deployErrorModal(error);
        //         })
    }

    updateModalData() {
        var fragspectObject = {
            "id": this.props.data.id,
            "crystal": this.props.data.crystal,
            "site_number": this.props.data.site_number,
            "event_number": this.props.data.event_number,
            "code": this.props.data.code,
            "lig_id": this.props.data.lig_id,
            "target_name": this.props.data.target_name,
            "target_id": this.props.data.target_id,
            "prot_id": this.props.data.prot_id,
            "prot_url": this.props.data.prot_url,
            "event_map_info": this.props.data.event_map_info,
            "sigmaa_map_info": this.props.data.sigmaa_map_info,
            "spider_plot_info": this.props.data.spider_plot_info,
            "two_d_density_map": this.props.data.two_d_density_map,
            "pandda_model_found": this.props.data.pandda_model_found,
            "crystal_status": this.props.data.crystal_status,
            "event_status": this.props.data.event_status,
            "confidence": this.props.data.confidence,
            "event_resolution": this.props.data.event_resolution,
            "crystal_resolution": this.props.data.crystal_resolution,
            "smiles": this.props.data.smiles,
            "spacegroup": this.props.data.spacegroup,
            "cell": this.props.data.cell,
            "event_comment": this.props.data.event_comment,
            "interesting": this.props.data.interesting
        }
        this.props.setFragspectModalContents(fragspectObject);
    }

    render() {
        return <Row className="show-grid" float="center" onClick={this.openModal}>
            <Col xs={1} md={1}>
                <p className="text-center"><b>{this.props.data.crystal}</b></p>
            </Col>
            <Col xs={1} md={1}>
                <p className="text-center">{this.props.data.site_number.toString()}</p>
            </Col>
            <Col xs={1} md={1}>
                <p className="text-center">{this.props.data.lig_id}</p>
            </Col>
            <Col xs={1} md={1}>
                    <Image src={this.img_url+"&dummy=png"} responsive rounded onClick={this.openModal}/>
            </Col>
            <Col xs={1} md={1}>
                <Panel style={this.colorToggle()}>
                    <p className="text-center" style={{color: 'black'}}><b>{this.convertDeposition()}</b></p>
                </Panel>
            </Col>
            <Col xs={1} md={1}>
                <p className="text-center">{this.props.data.confidence}</p>
            </Col>
            <Col xs={1} md={1}>
                <ButtonToolbar>
                    <button onClick={this.openModal}>Open</button>
                </ButtonToolbar>
            </Col>
            <Col xs={1} md={1}></Col>
            <Col xs={1} md={1}>
                <p> </p>
                <p className="text-center">{this.props.data.crystal_resolution} Å</p>
            </Col>
            <Col xs={1} md={1}>
                <p className="text-center">{this.props.data.spacegroup}</p>
                <p className="text-center">{this.props.data.cell.split(' ')[0]}, {this.props.data.cell.split(' ')[1]}, {this.props.data.cell.split(' ')[2]}</p>
                <p className="text-center">{this.props.data.cell.split(' ')[3]}, {this.props.data.cell.split(' ')[4]}, {this.props.data.cell.split(' ')[5]}</p>
            </Col>
            <Col xs={1} md={1}>
                <input id={this.props.data.id} key="comment" defaultValue={this.props.data.event_comment} onKeyDown={this.handleSessionNaming}></input>
            </Col>
            <Col xs={1} md={1}>
                <p className="text-center"><b>{this.state.interestingStatus[this.props.data.interesting == true ? 1 : 0]}</b></p>
            </Col>
        </Row>
    }
}

function mapStateToProps(state) {
    return {
        fragspectModalState: state.apiReducers.present.fragspectModalState,
  }
}

const mapDispatchToProps = {
    setFragspectModalState: apiActions.setFragspectModalState,
    setFragspectModalContents: apiActions.setFragspectModalContents,
    // setTargetOn: apiActions.setTargetOn,
}

export default connect(mapStateToProps, mapDispatchToProps)(FragspectView);
