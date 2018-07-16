/**
 * Created by ricgillams on 05/07/2018.
 */
import { ListGroupItem, ListGroup, Col, Row} from 'react-bootstrap';
import React from 'react';
import { connect } from 'react-redux'
import * as nglLoadActions from '../actions/nglLoadActions'
import * as apiActions from '../actions/apiActions'
import { GenericView } from './generalComponents'
import * as nglObjectTypes from './nglObjectTypes'
import * as selectionActions from '../actions/selectionActions'
import * as listTypes from './listTypes'
import '../../css/toggle.css';
import Toggle from 'react-bootstrap-toggle';
import SVGInline from "react-svg-inline";
import fetch from 'cross-fetch';

class HotspotView extends GenericView {

    constructor(props) {
        super(props);
        this.generateObject = this.generateObject.bind(this);
        this.generateMolObject = this.generateMolObject.bind(this);
        this.onComplex = this.onComplex.bind(this);
        this.onDonorHotspot = this.onDonorHotspot.bind(this);
        this.onAcceptorHotspot = this.onAcceptorHotspot.bind(this);
        this.onApolarHotspot = this.onApolarHotspot.bind(this);
        this.colourToggle = this.getRandomColor();
        this.handleHotspot = this.handleHotspot.bind(this);
        this.fetchHotspotUrl = this.fetchHotspotUrl.bind(this);
        var base_url = window.location.protocol + "//" + window.location.host
        this.base_url = base_url;
        this.url = new URL(base_url + '/api/molimg/' + this.props.data.id + "/")
        this.key = "mol_image"
        this.state.donorHsOn = false
        this.state.acceptorHsOn = false
        this.state.apolarHsOn = false
        this.state.vectorOn = false
        this.state.complexOn = false
    }

    handleHotspot(hotspotObject, loadState){
        if (loadState === 'load'){
            this.props.loadObject(hotspotObject);
        } else if (loadState === 'unload'){
            this.props.deleteObject(hotspotObject);
        }
    }

    generateMolObject() {
        // Get the data
        const data = this.props.data;
        console.log(data.toString())
        var nglObject = {
            "name": "MOLLOAD" + "_" + data.id.toString(),
            "OBJECT_TYPE":nglObjectTypes.MOLECULE,
            "colour": this.colourToggle,
            "sdf_info": data.sdf_info
        }
        return nglObject;
    }

    generateObject() {
        // Get the data
        const data = this.props.data;
        var nglObject = {
            "name": "COMPLEXLOAD" + "_" + data.id.toString(),
            "OBJECT_TYPE":nglObjectTypes.COMPLEX,
            "sdf_info": data.sdf_info,
            "colour": this.colourToggle,
            "prot_url": this.base_url + data.molecule_protein
        }
        return nglObject;
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

    getRandomColor() {
        var colourList = ['#EFCDB8',
            '#CC6666', '#FF6E4A',
            '#78DBE2', '#1F75FE',
            '#FAE7B5', '#FDBCB4',
            '#C5E384', '#95918C',
            '#F75394', '#80DAEB',
            '#ADADD6']
        return colourList[this.props.data.id % colourList.length];
    }

    handleClick(e) {
        this.setState(prevState => ({isToggleOn: !prevState.isToggleOn}))
        if(this.state.isToggleOn){
            this.props.deleteObject(Object.assign({display_div: "major_view"}, this.generateMolObject()))
        }
        else{
            this.props.loadObject(Object.assign({display_div: "major_view"}, this.generateMolObject(this.colourToggle)))
        }
    }


    onComplex() {
        this.setState(prevState => ({complexOn: !prevState.complexOn}))
        if(this.state.complexOn){
            this.props.deleteObject(Object.assign({display_div: "major_view"}, this.generateObject()))
        }
        else{
            this.props.loadObject(Object.assign({display_div: "major_view"}, this.generateObject()))
            if(this.state.isToggleOn==false){
                this.handleClick()
            }
        }
    }

    fetchHotspotUrl(mapType, protId, loadState, opacity) {
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
                "name": "HOTSPOT_" + myJson.results[0].id.toString(),
                //"hotUrl": myJson.results[0].map_info.replace('http:', 'https:'),
                "hotUrl": myJson.results[0].map_info,
                "display_div": "major_view",
                "OBJECT_TYPE": nglObjectTypes.HOTSPOT,
                "map_type": myJson.results[0].map_type.toString(),
                "fragment": myJson.results[0].prot_id.toString(),
                "opacity": opacity
            }
            return hotspotObject;
        }).then(hotspotObject => this.handleHotspot(hotspotObject, loadState))
    }

    onDonorHotspot(opacity) {
        this.setState(prevState => ({donorHsOn: !prevState.donorHsOn}))
        if(this.state.donorHsOn){
            this.fetchHotspotUrl("DO", this.props.data.prot_id, 'unload', opacity)
        }
        else{
            this.fetchHotspotUrl("DO", this.props.data.prot_id, 'load', opacity)
        }
    }

    onAcceptorHotspot(opacity) {
        this.setState(prevState => ({acceptorHsOn: !prevState.acceptorHsOn}))
        if(this.state.acceptorHsOn){
            this.fetchHotspotUrl("AC", this.props.data.prot_id, 'unload', opacity)
        }
        else{
            this.fetchHotspotUrl("AC", this.props.data.prot_id, 'load', opacity)
        }
    }

    onApolarHotspot() {
        this.setState(prevState => ({apolarHsOn: !prevState.apolarHsOn}))
        if(this.state.apolarHsOn){
            this.fetchHotspotUrl("AP", this.props.data.prot_id, 'unload', opacity)
        }
        else{
            this.fetchHotspotUrl("AP", this.props.data.prot_id, 'load', opacity)
        }
    }

    render() {
        const svg_image = <SVGInline svg={this.state.img_data}/>;
        const selected_style = {width: this.props.width.toString+'px',
            height: this.props.height.toString()+'px', backgroundColor: this.colourToggle}
        this.current_style = this.state.isToggleOn ? selected_style : selected_style;
        return <div>
            <Col xs={5} md={5}>
                <div style={this.current_style}>{svg_image}</div>
            </Col>
            <Col xs={7} md={7}>
                {/*<Row>*/}
                <Toggle onClick={this.onDonorHotspot(1)}
                        on={<p>Donor ON</p>}
                        off={<p>Donor OFF</p>}
                        size="xs"
                        onstyle="primary"
                        offstyle="primary"
                        active={this.state.donorHsOn}/>
                {/*</Row>*/}
                {/*<Row>*/}
                <Toggle onClick={this.onAcceptorHotspot(1)}
                        on={<p>Acceptor ON</p>}
                        off={<p>Acceptor OFF</p>}
                        size="xs"
                        onstyle="warning"
                        offstyle="warning"
                        active={this.state.acceptorHsOn}/>
                {/*</Row>*/}
                <Row>
                    <Toggle onClick={this.onApolarHotspot(1)}
                            on={<p>Apolar Tepid</p>}
                            off={<p>Apolar Tepid</p>}
                            size="xs"
                            onstyle="danger"
                            offstyle="danger"
                            active={this.state.apolarHsOn}/>

                    <Toggle onClick={this.onApolarHotspot(1)}
                            on={<p>Apolar Warm</p>}
                            off={<p>Apolar Warm</p>}
                            size="xs"
                            onstyle="danger"
                            offstyle="danger"
                            active={this.state.apolarHsOn}/>

                    <Toggle onClick={this.onApolarHotspot(1)}
                            on={<p>Apolar Hot</p>}
                            off={<p>Apolar Hot</p>}
                            size="xs"
                            onstyle="danger"
                            offstyle="danger"
                            active={this.state.apolarHsOn}/>
                </Row>
            </Col>
        </div>
    }

}
function mapStateToProps(state) {
  return {
      currentList: state.apiReducers.possibleMols,
      to_query: state.selectionReducers.to_query,
      inViewList:state.nglReducers.objectsInView,
      vector_list: state.selectionReducers.vector_list,
      newListTwo: state.apiReducers.chosenMols,
  }
}
const mapDispatchToProps = {
    getFullGraph: selectionActions.getFullGraph,
    setVectorList: selectionActions.setVectorList,
    gotFullGraph: selectionActions.gotFullGraph,
    setMol: selectionActions.setMol,
    transferList: apiActions.transferList,
    deleteObject: nglLoadActions.deleteObject,
    removeFromToBuyList: selectionActions.removeFromToBuyList,
    loadObject: nglLoadActions.loadObject
}

export default connect(mapStateToProps, mapDispatchToProps)(HotspotView);