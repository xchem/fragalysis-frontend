/**
 * Created by ricgillams on 05/07/2018.
 */
import { ListGroupItem, ListGroup, Col, Row} from 'react-bootstrap';
import React from 'react';
import { connect } from 'react-redux'
import * as nglLoadActions from '../actions/nglLoadActions'
import { GenericView } from './generalComponents'
import * as nglObjectTypes from './nglObjectTypes'
import '../../css/toggle.css';
import Toggle from 'react-bootstrap-toggle';
import SVGInline from "react-svg-inline";
import fetch from 'cross-fetch';

class HotspotView extends GenericView {

    constructor(props) {
        super(props);
        this.onDonorTepidHotspot = this.onDonorTepidHotspot.bind(this);
        this.onAcceptorTepidHotspot = this.onAcceptorTepidHotspot.bind(this);
        this.onApolarTepidHotspot = this.onApolarTepidHotspot.bind(this);
        this.onDonorWarmHotspot = this.onDonorWarmHotspot.bind(this);
        this.onAcceptorWarmHotspot = this.onAcceptorWarmHotspot.bind(this);
        this.onApolarWarmHotspot = this.onApolarWarmHotspot.bind(this);
        this.onDonorHotHotspot = this.onDonorHotHotspot.bind(this);
        this.onAcceptorHotHotspot = this.onAcceptorHotHotspot.bind(this);
        this.onApolarHotHotspot = this.onApolarHotHotspot.bind(this);
        this.colorToggle = this.colorToggle();
        this.handleHotspot = this.handleHotspot.bind(this);
        this.fetchHotspotUrl = this.fetchHotspotUrl.bind(this);
        var base_url = window.location.protocol + "//" + window.location.host
        this.base_url = base_url;
        this.url = new URL(base_url + '/api/molimg/' + this.props.data.id + "/")
        this.key = "mol_image"
        this.state.donorTepidHsOn = false
        this.state.donorWarmHsOn = false
        this.state.donorHotHsOn = false
        this.state.acceptorTepidHsOn = false
        this.state.acceptorWarmHsOn = false
        this.state.acceptorHotHsOn = false
        this.state.apolarTepidHsOn = false
        this.state.apolarWarmHsOn = false
        this.state.apolarHotHsOn = false
        this.state.complexOn = false
    }

    handleHotspot(hotspotObject, loadState){
        if (loadState === 'load'){
            this.props.loadObject(hotspotObject);
        } else if (loadState === 'unload'){
            this.props.deleteObject(hotspotObject);
        }
    }

    componentDidMount() {
        this.loadFromServer(this.props.width,this.props.height);
        var thisToggleOn = false;
        var complexOn = false;
        for(var key in this.props.inViewList){
            if(key.startsWith("MOLLOAD_") && parseInt(key.split("MOLLOAD_")[[1]], 10)==this.props.data.id){
                this.setState(prevState => ({isToggleOn: true}));
            }
            if(key.startsWith("COMPLEXLOAD_") && parseInt(key.split("COMPLEXLOAD_")[[1]], 10)==this.props.data.id){
                this.setState(prevState => ({complexOn: true}));
            }
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
        return colorList[this.props.data.id % colorList.length];
    }

    handleClick(e) {
        this.setState(prevState => ({isToggleOn: !prevState.isToggleOn}))
        if(this.state.isToggleOn){
            this.props.deleteObject(Object.assign({display_div: "major_view"}, this.generateMolObject()))
        }
        else{
            this.props.loadObject(Object.assign({display_div: "major_view"}, this.generateMolObject(this.colorToggle)))
        }
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
                //"hotUrl": myJson.results[0].map_info.replace('http:', 'https:'),
                "hotUrl": myJson.results[0].map_info,
                "display_div": "major_view",
                "OBJECT_TYPE": nglObjectTypes.HOTSPOT,
                "map_type": myJson.results[0].map_type.toString(),
                "fragment": myJson.results[0].prot_id.toString(),
                "isoLevel": isoLevel,
                "opacity": opacity
            }
            return hotspotObject;
        }).then(hotspotObject => this.handleHotspot(hotspotObject, loadState))
    }

    onDonorTepidHotspot() {
        this.setState(prevState => ({donorTepidHsOn: !prevState.donorTepidHsOn}))
        if(this.state.donorTepidHsOn){
            this.fetchHotspotUrl("DO", this.props.data.prot_id, 'unload', 10, 0.2)
        }
        else{
            this.fetchHotspotUrl("DO", this.props.data.prot_id, 'load', 10, 0.2)
        }
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
        const svg_image = <SVGInline svg={this.state.img_data}/>;
        const selected_style = {width: '125px', height: '125px', backgroundColor: this.colorToggle}
        return <div>
            <Col xs={4} md={4}>
                <div style={selected_style}>{svg_image}</div>
            </Col>
            <Col> xs={2} md={2}>
            </Col>
            <Col xs={2} md={2}>
                <Row>
                <Toggle onClick={this.onDonorTepidHotspot} on={<p>Tepid Donor</p>} off={<p>Tepid Don OFF</p>} size="sm"
                        onstyle="primary" offstyle="primary" active={this.state.donorTepidHsOn}/>
                </Row>
                <Row>
                <Toggle onClick={this.onAcceptorTepidHotspot} on={<p>Tepid Acceptor</p>} off={<p>Tepid Acc OFF</p>} size="sm"
                        onstyle="danger" offstyle="danger" active={this.state.acceptorTepidHsOn}/>
                </Row>
                <Row>
                <Toggle onClick={this.onApolarTepidHotspot} on={<p>Tepid Apolar</p>} off={<p>Tepid Apo OFF</p>} size="sm"
                        onstyle="warning" offstyle="warning" active={this.state.apolarTepidHsOn}/>
                </Row>
            </Col>
            <Col xs={2} md={2}>
                <Row>
                <Toggle onClick={this.onDonorWarmHotspot} on={<p>Warm Donor</p>} off={<p>Warm Don OFF</p>} size="sm"
                        onstyle="primary" offstyle="primary" active={this.state.donorWarmHsOn}/>
                </Row>
                <Row>
                <Toggle onClick={this.onAcceptorWarmHotspot} on={<p>Warm Acceptor</p>} off={<p>Warm Acc OFF</p>} size="sm"
                        onstyle="danger" offstyle="danger" active={this.state.acceptorWarmHsOn}/>
                </Row>
                <Row>
                <Toggle onClick={this.onApolarWarmHotspot} on={<p>Warm Apolar</p>} off={<p>Warm Apo OFF</p>} size="sm"
                        onstyle="warning" offstyle="warning" active={this.state.apolarWarmHsOn}/>
                </Row>
            </Col>
            <Col xs={2} md={2}>
                <Row>
                <Toggle onClick={this.onDonorHotHotspot} on={<p>Hot Donor</p>} off={<p>Hot Don OFF</p>} size="sm"
                        onstyle="primary" offstyle="primary" active={this.state.donorHotHsOn}/>
                </Row>
                <Row>
                <Toggle onClick={this.onAcceptorHotHotspot} on={<p>Hot Acceptor</p>} off={<p>Hot Acc OFF</p>} size="sm"
                        onstyle="danger" offstyle="danger" active={this.state.acceptorHotHsOn}/>
                </Row>
                <Row>
                <Toggle onClick={this.onApolarHotHotspot} on={<p>Hot Apolar</p>} off={<p>Hot Apo OFF</p>} size="sm"
                        onstyle="warning" offstyle="warning" active={this.state.apolarHotHsOn}/>
                </Row>
            </Col>
            {/*<Col xs={2} md={2}>*/}
                {/*<Row>*/}
                    {/*<H3>Donor</H3>*/}
                {/*</Row>*/}
                {/*<Row>*/}
                    {/*<H3>Acceptor</H3>*/}
                {/*</Row>*/}
                {/*<Row>*/}
                    {/*<H3>Apolar</H3>*/}
                {/*</Row>*/}
            {/*</Col>*/}
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