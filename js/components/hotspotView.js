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
import update from 'immutability-helper';

class HotspotView extends React.Component {

    constructor(props) {
        super(props);
        this.onHotspot = this.onHotspot.bind(this)
        this.onDonorTepidHotspot = this.onDonorTepidHotspot.bind(this);
        this.onAcceptorTepidHotspot = this.onAcceptorTepidHotspot.bind(this);
        this.onApolarTepidHotspot = this.onApolarTepidHotspot.bind(this);
        this.onDonorWarmHotspot = this.onDonorWarmHotspot.bind(this);
        this.onAcceptorWarmHotspot = this.onAcceptorWarmHotspot.bind(this);
        this.onApolarWarmHotspot = this.onApolarWarmHotspot.bind(this);
        this.onDonorHotHotspot = this.onDonorHotHotspot.bind(this);
        this.onAcceptorHotHotspot = this.onAcceptorHotHotspot.bind(this);
        this.onApolarHotHotspot = this.onApolarHotHotspot.bind(this);
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
            }
        }
        this.hsDict = {
            "Tepid": {"opacity": 0.2, "contour": 10},
            "Warm": {"opacity": 0.4, "contour": 14},
            "Hot": {"opacity": 0.6, "contour": 17},
            "donor": "DO",
            "apolar": "AP",
            "acceptor": "AC"
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

    getDictString(strength, type){
        return this.hsDict[type]+"."+strength
    }

    onDonorTepidHotspot(strength, type) {
        const newState = !this.state.hs_dict.donor.Tepid
        const currentDict = this.state.hs_dict;
        const currentSubDict = this.state.hs_dict.donor;
        const donor = update(currentSubDict, {$merge: {"Tepid": newState}});
        const newDict = update(currentDict, {$merge: {donor}});
        this.setState({hs_dict:newDict});
        const load_var = this.state.hs_dict.donor.Tepid ? "unload" : "load";
        this.fetchHotspotUrl(this.hsDict[type], this.props.data.prot_id, load_var, this.hsDict[strength].contour, this.hsDict[strength].opacity)
    }

    onHotspot(strength, type) {
        const newState = !this.state.hs_dict[type][strength];
        const replacementObject = {
            "acceptor": {"Tepid": newState}
        }
        const currentDict = this.state.hs_dict;
        // const currentSubDict = this.state.hs_dict[type];
        // const acceptor = update(currentSubDict, {$merge: {[strength]: newState}});
        // const newDict = update(currentDict, {$merge: {acceptor}});
        const newDict = $.extend({}, currentDict, replacementObject)
        this.setState({hs_dict:newDict});
        const load_var = this.state.hs_dict[type][strength] ? "unload" : "load";
        this.fetchHotspotUrl(this.hsDict[type], this.props.data.prot_id, load_var, this.hsDict[strength].contour, this.hsDict[strength].opacity)
    }

    onDonorWarmHotspot() {
        this.setState(prevState => ({donorWarmHsOn: !prevState.donorWarmHsOn}))
        if(this.state.donorWarmHsOn){
            this.fetchHotspotUrl("DO", this.props.data.prot_id, 'unload', 14, 0.4)
        }
        else{
            this.fetchHotspotUrl("DO", this.props.data.prot_id, 'load', 14, 0.4)
        }
    }

    onDonorHotHotspot() {
        this.setState(prevState => ({donorHotHsOn: !prevState.donorHotHsOn}))
        if(this.state.donorHotHsOn){
            this.fetchHotspotUrl("DO", this.props.data.prot_id, 'unload', 17, 0.6)
        }
        else{
            this.fetchHotspotUrl("DO", this.props.data.prot_id, 'load', 17, 0.6)
        }
    }

    onAcceptorTepidHotspot() {
        this.setState(prevState => ({acceptorTepidHsOn: !prevState.acceptorTepidHsOn}))
        if(this.state.acceptorTepidHsOn){
            this.fetchHotspotUrl("AC", this.props.data.prot_id, 'unload', 10, 0.2)
        }
        else{
            this.fetchHotspotUrl("AC", this.props.data.prot_id, 'load', 10, 0.2)
        }
    }

    onAcceptorWarmHotspot() {
        this.setState(prevState => ({acceptorWarmHsOn: !prevState.acceptorWarmHsOn}))
        if(this.state.acceptorWarmHsOn){
            this.fetchHotspotUrl("AC", this.props.data.prot_id, 'unload', 14, 0.4)
        }
        else{
            this.fetchHotspotUrl("AC", this.props.data.prot_id, 'load', 14, 0.4)
        }
    }

    onAcceptorHotHotspot() {
        this.setState(prevState => ({acceptorHotHsOn: !prevState.acceptorHotHsOn}))
        if(this.state.acceptorHotHsOn){
            this.fetchHotspotUrl("AC", this.props.data.prot_id, 'unload', 17, 0.6)
        }
        else{
            this.fetchHotspotUrl("AC", this.props.data.prot_id, 'load', 17, 0.6)
        }
    }

    onApolarTepidHotspot() {
        this.setState(prevState => ({apolarTepidHsOn: !prevState.apolarTepidHsOn}))
        if(this.state.apolarTepidHsOn){
            this.fetchHotspotUrl("AP", this.props.data.prot_id, 'unload', 10, 0.2)
        }
        else{
            this.fetchHotspotUrl("AP", this.props.data.prot_id, 'load', 10, 0.2)
        }
    }

    onApolarWarmHotspot() {
        this.setState(prevState => ({apolarWarmHsOn: !prevState.apolarWarmHsOn}))
        if(this.state.apolarWarmHsOn){
            this.fetchHotspotUrl("AP", this.props.data.prot_id, 'unload', 14, 0.4)
        }
        else{
            this.fetchHotspotUrl("AP", this.props.data.prot_id, 'load', 14, 0.4)
        }
    }

    onApolarHotHotspot() {
        this.setState(prevState => ({apolarHotHsOn: !prevState.apolarHotHsOn}))
        if(this.state.apolarHotHsOn){
            this.fetchHotspotUrl("AP", this.props.data.prot_id, 'unload', 17, 0.6)
        }
        else{
            this.fetchHotspotUrl("AP", this.props.data.prot_id, 'load', 17, 0.6)
        }
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
                    <Toggle onClick={() => this.onDonorTepidHotspot("Tepid", "donor")} on={<p> Tepid Donor on</p>} off={<p>Tepid Donor Off</p>} size="lg"
                            onstyle="primary" offstyle={"primary"} active={this.state.hs_dict.donor.Tepid}/>
                </Row>
                <Row>
                    <Toggle onClick={() => this.onHotspot("Tepid", "acceptor")} on={<p>Tepid Acceptor on</p>} off={<p>Tepid Acceptor Off</p>} size="lg"
                        onstyle="danger" offstyle="danger" active={this.state.hs_dict.acceptor.Tepid}/>
                </Row>
                <Row>
                    <Toggle onClick={this.onApolarTepidHotspot} on={<p> Tepid Apolar on</p>} off={<p>Tepid Apolar Off</p>} size="lg"
                        onstyle="warning" offstyle="warning" active={this.state.apolarTepidHsOn}/>
                </Row>
            </Col>
            <Col xs={3} md={3}>
                <Row>
                    <Toggle onClick={this.onDonorWarmHotspot} on={<p> Warm Donor on</p>} off={<p>Warm Donor Off</p>} size="lg"
                        onstyle="primary" offstyle="primary" active={this.state.donorWarmHsOn}/>
                </Row>
                <Row>
                    <Toggle onClick={this.onAcceptorWarmHotspot} on={<p>Warm Acceptor on</p>} off={<p>Warm Acceptor Off</p>} size="lg"
                        onstyle="danger" offstyle="danger" active={this.state.acceptorWarmHsOn}/>
                </Row>
                <Row>
                    <Toggle onClick={this.onApolarWarmHotspot} on={<p> Warm Apolar on</p>} off={<p>Warm Apolar Off</p>} size="lg"
                        onstyle="warning" offstyle="warning" active={this.state.apolarWarmHsOn}/>
                </Row>
            </Col>
            <Col xs={3} md={3}>
                <Row>
                <Toggle onClick={this.onDonorHotHotspot} on={<p> Hot Donor on</p>} off={<p>Hot Donor Off</p>} size="lg"
                        onstyle="primary" offstyle="primary" active={this.state.donorHotHsOn}/>
                </Row>
                <Row>
                    <Toggle onClick={this.onAcceptorHotHotspot} on={<p>Hot Acceptor on</p>} off={<p>Hot Acceptor Off</p>} size="lg"
                        onstyle="danger" offstyle="danger" active={this.state.acceptorHotHsOn}/>
                </Row>
                <Row>
                    <Toggle onClick={this.onApolarHotHotspot} on={<p> Hot Apolar on</p>} off={<p>Hot Apolar Off</p>} size="lg"
                             onstyle="warning" offstyle="warning" active={this.state.apolarHotHsOn}/>
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