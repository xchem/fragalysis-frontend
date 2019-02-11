/**
 * Created by ricgillams on 04/02/2019.
 */

import {Col, Row, Image, Panel, Grid, ToggleButton} from "react-bootstrap";
import React from "react";
import {connect} from "react-redux";
import * as nglLoadActions from "../actions/nglLoadActions";

class FragspectView extends React.Component {

    constructor(props) {
        super(props);
        this.colorToggle = this.colorToggle.bind(this);
        this.convertDeposition = this.convertDeposition.bind(this);
        this.convertConfidence = this.convertConfidence.bind(this);
        this.buttonRender = this.buttonRender.bind(this);
        var base_url = window.location.protocol + "//" + window.location.host
        this.img_url = new URL(base_url + '/viewer/img_from_smiles/')
        var get_params = {
            "img_type": "png",
            "smiles": props.data.smiles
        }
        Object.keys(get_params).forEach(key => this.img_url.searchParams.append(key, get_params[key]))
        this.key = "mol_image"
        this.state = {
            "hsParams": {
                "Tepid": {"opacity": 0.2, "contour": 10},
                "Warm": {"opacity": 0.4, "contour": 14},
                "Hot": {"opacity": 0.6, "contour": 17},
                "donor": {"abbreviation": "DO", "buttonStyle": "primary"},
                "acceptor": {"abbreviation": "AC", "buttonStyle": "danger"},
                "apolar": {"abbreviation": "AP", "buttonStyle": "warning"}
            },
            "confidenceStatus": {
                1: "Low",
                2: "Medium",
                3: "High"
            },
            "depositionStatus": {
                1: "Analysis Pending",
                2: "PanDDA Model",
                3: "In Refinement",
                4: "CompChem Ready",
                5: "Deposition Ready",
                6: "Deposited",
                7: "Analysed and Rejected"
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

     buttonRender(strength, type) {
        var button = <ToggleButton bsSize="sm" bsStyle="info" onClick={this.onHotspot(strength, type)}>{strength} {type}</ToggleButton>;
        return button;
    }

    render() {
        return <Row>
            <Col xs={2} md={2}>
                <p className="text-center"><b>{this.props.data.crystal}</b></p>
            </Col>
            <Col xs={1} md={1}>
                <p className="text-center">{this.props.data.site_number.toString()}</p>
            </Col>
            <Col xs={1} md={1}>
                <p className="text-center">{this.props.data.lig_id}</p>
            </Col>
            <Col xs={1} md={1}>
                <Panel style={this.colorToggle()}>
                    <Image src={this.img_url+"&dummy=png"} responsive rounded />
                </Panel>
            </Col>
            <Col xs={1} md={1}>
                <p className="text-center"><b>{this.convertDeposition()}</b></p>
            </Col>
            <Col xs={1} md={1}>
                <p className="text-center">{this.convertConfidence()}</p>
            </Col>
            <Col xs={1} md={1}></Col>
            <Col xs={1} md={1}></Col>
            <Col xs={1} md={1}>
                    <p className="text-center">{this.props.data.resolution.toString()} Å</p>
            </Col>
            <Col xs={1} md={1}>
                <p className="text-center">{this.props.data.space_group}</p>
                <p className="text-center">{this.props.data.cell_dimensions}</p>
                <p className="text-center">{this.props.data.cell_angles}</p>
            </Col>
            <Col xs={1} md={1}></Col>
        </Row>
    }
}

function mapStateToProps(state) {
  return {
  }
}

const mapDispatchToProps = {
    deleteObject: nglLoadActions.deleteObject,
    loadObject: nglLoadActions.loadObject
}

export default connect(mapStateToProps, mapDispatchToProps)(FragspectView);
