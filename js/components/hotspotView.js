/**
 * Created by ricgillams on 05/07/2018.
 */
import { ListGroupItem, ListGroup, Col, Row, Button, Image, Panel} from 'react-bootstrap';
import React from 'react';
import { connect } from 'react-redux'
import * as nglLoadActions from '../actions/nglLoadActions'
import * as nglObjectTypes from './nglObjectTypes'
import '../../css/toggle.css';
import Toggle from 'react-bootstrap-toggle';
import fetch from 'cross-fetch';
import $ from 'jquery';

class HotspotView extends React.Component {

    constructor(props) {
        super(props);
        this.onHotspot = this.onHotspot.bind(this)
        this.colorToggle = this.colorToggle.bind(this);
        this.handleHotspot = this.handleHotspot.bind(this);
        this.fetchHotspotUrl = this.fetchHotspotUrl.bind(this);
        var base_url = window.location.protocol + "//" + window.location.host
        this.img_url = new URL(base_url + '/viewer/img_from_smiles/')
        var get_params = {
            "img_type": "png",
            "smiles": props.data.smiles
        }
        Object.keys(get_params).forEach(key => this.img_url.searchParams.append(key, get_params[key]))
        this.key = "mol_image"
        this.state = {
            "hs_dict": {
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
                "apolar": {"abbreviation": "AP", "buttonStyle": "danger"},
                "acceptor": {"abbreviation": "AC", "buttonStyle": "warning"}
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
        var colorList = ['#EFCDB8',
            '#CC6666', '#FF6E4A',
            '#78DBE2', '#1F75FE',
            '#FAE7B5', '#FDBCB4',
            '#C5E384', '#95918C',
            '#F75394', '#80DAEB',
            '#ADADD6']
        return {backgroundColor: colorList[this.props.data.id % colorList.length]};
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
        const newState = !this.state.hs_dict[type][strength];
        const replacementObject = { [type]: {[strength]: newState}}
        const currentDict = this.state.hs_dict;
        const newDict = $.extend(true, {}, currentDict, replacementObject)
        this.setState({hs_dict:newDict});
        const load_var = this.state.hs_dict[type][strength] ? "unload" : "load";
        this.fetchHotspotUrl(this.state.hsParams[type].abbreviation, this.props.data.prot_id, load_var, this.state.hsParams[strength].contour, this.state.hsParams[strength].opacity)
    }

    render() {
        const strokeSize = 2;
        return <div>
            <Col xs={3} md={3}>
                <Panel style={this.colorToggle()}>
                    <Image src={this.img_url+"&dummy=png"} responsive rounded />
                </Panel>
            </Col>
            <Col xs={3} md={3}>
                <Row>
                    <Toggle onClick={() => this.onHotspot("Tepid", "donor")} on={<p> Tepid Donor on</p>} off={<p>Tepid Donor Off</p>} size="lg"
                            onstyle={this.state.hsParams.donor.buttonStyle} offstyle={this.state.hsParams.donor.buttonStyle} active={this.state.hs_dict.donor.Tepid}/>
                </Row>
                <Row>
                    <Toggle onClick={() => this.onHotspot("Tepid", "acceptor")} on={<p>Tepid Acceptor on</p>} off={<p>Tepid Acceptor Off</p>} size="lg"
                        onstyle={this.state.hsParams.acceptor.buttonStyle} offstyle={this.state.hsParams.acceptor.buttonStyle} active={this.state.hs_dict.acceptor.Tepid}/>
                </Row>
                <Row>
                    <Toggle onClick={() => this.onHotspot("Tepid", "apolar")} on={<p>Tepid Apolar on</p>} off={<p>Tepid Apolar Off</p>} size="lg"
                        onstyle={this.state.hsParams.apolar.buttonStyle} offstyle={this.state.hsParams.apolar.buttonStyle} active={this.state.hs_dict.apolar.Tepid}/>
                </Row>
            </Col>
            <Col xs={3} md={3}>
                <Row>
                    <Toggle onClick={() => this.onHotspot("Warm", "donor")} on={<p> Warm Donor on</p>} off={<p> Warm Donor Off</p>} size="lg"
                        onstyle={this.state.hsParams.donor.buttonStyle} offstyle={this.state.hsParams.donor.buttonStyle} active={this.state.hs_dict.donor.Warm}/>
                </Row>
                <Row>
                    <Toggle onClick={() => this.onHotspot ("Warm", "acceptor")} on={<p>Warm Acceptor on</p>} off={<p>Warm Acceptor Off</p>} size="lg"
                        onstyle={this.state.hsParams.acceptor.buttonStyle} offstyle={this.state.hsParams.acceptor.buttonStyle} active={this.state.hs_dict.acceptor.Warm}/>
                </Row>
                <Row>
                    <Toggle onClick={() => this.onHotspot ("Warm", "apolar")} on={<p> Warm Apolar on</p>} off={<p>Warm Apolar Off</p>} size="lg"
                        onstyle={this.state.hsParams.apolar.buttonStyle} offstyle={this.state.hsParams.apolar.buttonStyle} active={this.state.hs_dict.apolar.Warm}/>
                </Row>
            </Col>
            <Col xs={3} md={3}>
                <Row>
                <Toggle onClick={() => this.onHotspot ("Hot", "donor")} on={<p> Hot Donor on</p>} off={<p>Hot Donor Off</p>} size="lg"
                        onstyle={this.state.hsParams.donor.buttonStyle} offstyle={this.state.hsParams.donor.buttonStyle} active={this.state.hs_dict.donor.Hot}/>
                </Row>
                <Row>
                    <Toggle onClick={() => this.onHotspot ("Hot", "acceptor")} on={<p>Hot Acceptor on</p>} off={<p>Hot Acceptor Off</p>} size="lg"
                        onstyle={this.state.hsParams.acceptor.buttonStyle} offstyle={this.state.hsParams.acceptor.buttonStyle} active={this.state.hs_dict.acceptor.Hot}/>
                </Row>
                <Row>
                    <Toggle onClick={() => this.onHotspot ("Hot", "apolar")} on={<p> Hot Apolar on</p>} off={<p>Hot Apolar Off</p>} size="lg"
                             onstyle={this.state.hsParams.apolar.buttonStyle} offstyle={this.state.hsParams.apolar.buttonStyle} active={this.state.hs_dict.apolar.Hot}/>
                </Row>
            </Col>
        </div>
    }

}

function mapStateToProps(state) {
  return {
      inViewList:state.nglReducers.objectsInView,
  }
}

const mapDispatchToProps = {
    deleteObject: nglLoadActions.deleteObject,
    loadObject: nglLoadActions.loadObject
}

export default connect(mapStateToProps, mapDispatchToProps)(HotspotView);