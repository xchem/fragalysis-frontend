/**
 * Created by ricgillams on 04/02/2019.
 */

import {Col, Row, Image, Panel, Grid, ToggleButton} from "react-bootstrap";
import React from "react";
import {connect} from "react-redux";
import * as nglLoadActions from "../actions/nglLoadActions";
import * as nglObjectTypes from "./nglObjectTypes";
import Toggle from "react-bootstrap-toggle";
import fetch from "cross-fetch";
import $ from "jquery";

class FragspectView extends React.Component {

    constructor(props) {
        super(props);
        this.onHotspot = this.onHotspot.bind(this);
        this.colorToggle = this.colorToggle.bind(this);
        this.convertDeposition = this.convertDeposition.bind(this);
        this.convertConfidence = this.convertConfidence.bind(this);
        this.handleHotspot = this.handleHotspot.bind(this);
        this.fetchHotspotUrl = this.fetchHotspotUrl.bind(this);
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
            "hsDict": {
                "donor": {
                    "Tepid": false,
                    "Warm": false,
                    "Hot": false
                },
                "acceptor":{
                    "Tepid": false,
                    "Warm": false,
                    "Hot": false
                },
                "apolar":{
                    "Tepid": false,
                    "Warm": false,
                    "Hot": false
                }
            },
            "hsParams": {
                "Tepid": {"opacity": 0.2, "contour": 10},
                "Warm": {"opacity": 0.4, "contour": 14},
                "Hot": {"opacity": 0.6, "contour": 17},
                "donor": {"abbreviation": "DO", "buttonStyle": "primary"},
                "acceptor": {"abbreviation": "AC", "buttonStyle": "danger"},
                "apolar": {"abbreviation": "AP", "buttonStyle": "warning"}
            },
            "confidenceStatus": {
                1: "low",
                2: "medium",
                3: "high"
            },
            "depositionStatus": {
                0: "PanDDA",
                1: "In Refinement",
                2: "Refined",
                3: "CompChem Ready",
                4: "Deposition Ready",
                5: "Deposited"
            }
        }
    }

    handleHotspot(hotspotObject, loadState){
        if (loadState === 'load'){
            this.props.loadObject(hotspotObject);
        } else if (loadState === 'unload'){
            this.props.deleteObject(hotspotObject);
        }
    }

    colorToggle() {
        var colorDict = [
            '#95918C',
            '#EFCDB8',
            '#CC6666',
            '#ADADD6',
            '#78DBE2',
            '#1F75FE',
            '#C5E384'
        ];
        return {backgroundColor: colorDict[this.props.data.id]};
    }

    convertDeposition() {
        return this.state.depositionStatus[this.props.data.deposition_status];
    }

    convertConfidence() {
        return this.state.confidenceStatus[this.props.data.confidence];
    }

    fetchHotspotUrl(mapType, protId, loadState, isoLevel, opacity) {
        var hotspotQuery = "?map_type=" + mapType + "&prot_id=" + protId.toString()
        fetch("/api/hotspots/" + hotspotQuery, {
            method: "get",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(function (response) {
            return response.json();
        }).then(function (myJson) {
            var hotspotObject = {
                "name": "HOTSPOT_" + myJson.results[0].prot_id.toString() + mapType + isoLevel,
                "hotUrl": myJson.results[0].map_info.replace("http:",window.location.protocol),
                "display_div": "major_view",
                "OBJECT_TYPE": nglObjectTypes.HOTSPOT,
                "map_type": myJson.results[0].map_type.toString(),
                "fragment": myJson.results[0].prot_id.toString(),
                "isoLevel": isoLevel,
                "opacity": opacity,
                "disablePicking": true
            }
            return hotspotObject;
        }).then(hotspotObject => this.handleHotspot(hotspotObject, loadState))
    }

    onHotspot(strength, type) {
        const newState = !this.state.hsDict[type][strength];
        const replacementObject = { [type]: {[strength]: newState}}
        const newDict = $.extend(true, {}, this.state.hsDict, replacementObject)
        this.setState({hsDict:newDict});
        const load_var = this.state.hsDict[type][strength] ? "unload" : "load";
        this.fetchHotspotUrl(this.state.hsParams[type].abbreviation, this.props.data.prot_id, load_var, this.state.hsParams[strength].contour, this.state.hsParams[strength].opacity)
    }

    buttonRender(strength, type) {
        var _this = this;
        var button = React.createElement(Toggle, {
            onClick: function onClick() {_this.onHotspot(strength, type)},
            on: React.createElement('p', null, strength + ' ' + type + ' on'),
            off: React.createElement('p', null, strength + ' ' + type + ' Off'),
            size: 'lg',
            onstyle: this.state.hsParams[type].buttonStyle,
            offstyle: this.state.hsParams[type].buttonStyle,
            active: this.state.hsDict[type][strength]
        });
        return button;
    }

     buttonRender(strength, type) {
        var button = <ToggleButton bsSize="sm" bsStyle="info" onClick={this.onHotspot(strength, type)}>{strength} {type}</ToggleButton>;
        return button;
    }

    render() {
        return <div>
            <Grid>
                <Col xs={2} md={2}>
                    <p>{this.props.data.code}</p>
                </Col>
                <Col xs={2} md={2}>
                    <Panel style={this.colorToggle()}>
                        <Image src={this.img_url+"&dummy=png"} responsive rounded />
                    </Panel>
                </Col>
                <Col xs={2} md={2}>
                    <p>{this.convertDeposition()}</p>
                </Col>
                <Col xs={2} md={2}>
                    <p>{this.convertConfidence()}</p>
                </Col>
                <Col xs={1} md={1}>
                    <p>{this.props.data.resolution} Å</p>
                </Col>
                <Col xs={1} md={1}>
                    <p>{this.props.data.space_group} /n {this.props.data.cell_dimensions} /n {this.props.data.cell_angles}</p>
                </Col>
                <Col xs={2} md={2}>
                </Col>
            </Grid>
        </div>
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
