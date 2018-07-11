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
        this.generateHotspotObject = this.generateHotspotObject.bind(this);
        this.generateMolObject = this.generateMolObject.bind(this);
        this.loadHotspot = this.loadHotspot.bind(this);
        this.removeHotspot = this.removeHotspot.bind(this);
        var base_url = window.location.protocol + "//" + window.location.host
        this.base_url = base_url;
        this.url = new URL(base_url + '/api/molimg/' + this.props.data.id + "/")
        this.key = "mol_image"
        this.state.vectorOn = false
        this.state.complexOn = false
        this.colourToggle = this.getRandomColor();
    }

    getHotspotUrl(get_view) {
        return new URL(this.base_url + '/api/' + hotspots + '/' + this.props.data.id + "/")
    }

    generateMolObject() {
        // Get the data
        const data = this.props.data;
        var nglObject = {
            "name": "MOLLOAD" + "_" + data.id.toString(),
            "OBJECT_TYPE":nglObjectTypes.MOLECULE,
            "colour": this.colourToggle,
            "sdf_info": data.sdf_info
        }
        return nglObject;
    }

    generateHotspotObject(targetData) {
        var out_object = {
            "name": "HOTSPOT_" + targetData.id.toString(),
            // "hotUrl": targetData.map_info.replace('http:', 'https:'),
            "hotUrl": targetData.map_info,
            "display_div": "major_view",
            "OBJECT_TYPE": nglObjectTypes.HOTSPOT,
            "map_type": targetData.map_type.toString(),
            "fragment" : targetData.prot_id.toString()
            }
            return out_object
    }

    loadHotspot(data){
        var nglObject = this.generateHotspotObject(data);
        this.props.loadObject(nglObject);
    }

    removeHotspot(data){
        var nglObject = this.generateHotspotObject(data);
        this.props.deleteObject(nglObject);
    }

    componentDidMount() {
        this.loadFromServer(this.props.width,this.props.height);
        var thisToggleOn = false;
        var hotspotOn = false;
        for(var key in this.props.inViewList){
            if(key.startsWith("MOLLOAD_") && parseInt(key.split("MOLLOAD_")[[1]], 10)==this.props.data.id){
                this.setState(prevState => ({isToggleOn: true}));
            }
            if(key.startsWith("HOTSPOTLOAD_") && parseInt(key.split("HOTSPOTLOAD_")[[1]], 10)==this.props.data.id){
                this.setState(prevState => ({hotspotOn: true}));
            }
        }
    }

    render() {
        const svg_image = <SVGInline svg={this.state.img_data}/>;
        const selected_style = {width: this.props.width.toString+'px',
            height: this.props.height.toString()+'px', backgroundColor: this.colourToggle}
        this.current_style = this.state.isToggleOn ? selected_style : this.not_selected_style;
        return <div>
            <div onClick={this.handleClick} style={this.current_style}>{svg_image}</div>
            <Toggle onClick={this.loadHotspot()}
                on={<p>Hotspot ON</p>}
                off={<p>Hotspot OFF</p>}
                size="xs"
                offstyle="danger"
                active={this.state.hotspotOn}
            />
            </div>
    }

    getRandomColor() {
        var colourList = ['#EFCDB8', '#CC6666', '#FF6E4A', '#78DBE2', '#1F75FE', '#FAE7B5', '#FDBCB4', '#C5E384', '#95918C', '#F75394', '#80DAEB', '#ADADD6']
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

    onHotspot() {
        this.setState(prevState => ({hotspotOn: !prevState.hotspotOn}))
        if(this.state.hotspotOn){
            this.props.deleteObject(Object.assign({display_div: "major_view"}, this.generateObject()))
        }
        else{
            this.props.loadObject(Object.assign({display_div: "major_view"}, this.generateObject()))
            if(this.state.isToggleOn==false){
                this.handleClick()
            }
        }
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