/**
 * Created by abradley on 14/03/2018.
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
import SVGInline from "react-svg-inline"
import {shuffle} from '../utils/util';

class MoleculeView extends GenericView {

    constructor(props) {
        super(props);
        this.generateObject = this.generateObject.bind(this);
        this.generateMolObject = this.generateMolObject.bind(this);
        this.handleVector = this.handleVector.bind(this);
        this.getViewUrl = this.getViewUrl.bind(this);
        this.onVector = this.onVector.bind(this);
        this.onComplex = this.onComplex.bind(this);
        var base_url = window.location.protocol + "//" + window.location.host
        this.url = new URL(base_url + '/viewer/img_from_mol_pk/' + this.props.data.id + "/")
        this.state.vectorOn= false
        this.state.complexOn= false
        this.state.backgroundColour = this.getRandomColor();
        this.colourToggle = this.getRandomColor();
    }

    getViewUrl(pk,get_view){
        var base_url = window.location.protocol + "//" + window.location.host
        base_url += "/viewer/"+get_view+"/"+pk.toString()+"/"
        return base_url
    }

    /**
     * Convert the JSON into a list of arrow objects
     */
    generateObjectList(out_data){
        var colour = [1,0,0]
        var deletions = out_data["deletions"]
        var outList = new Array();
        for(var key in deletions) {
            outList.push(this.generateArrowObject(deletions[key][0],
                deletions[key][1],key.split("_")[0],colour))
        }
        var additions = out_data["additions"]
        for(var key in additions) {
            outList.push(this.generateArrowObject(additions[key][0],
                additions[key][1],key.split("_")[0],colour))
        }
        var linker = out_data["linkers"]
        for(var key in linker) {
            outList.push(this.generateCylinderObject(linker[key][0],
                linker[key][1],key.split("_")[0],colour))
        }

        var rings = out_data["ring"]
        for (var key in rings){
            outList.push(this.generateCylinderObject(rings[key][0],
                rings[key][2],key.split("_")[0],colour))
        }
        return outList;
    }

    generateArrowObject(start,end,name,colour){
        return {
            "name": listTypes.VECTOR+"_"+name,
            "OBJECT_TYPE": nglObjectTypes.ARROW,
            "start": start,
            "end": end,
            "colour": colour
        }
    }

    generateCylinderObject(start,end,name,colour){
        return {
            "name": listTypes.VECTOR+"_"+name,
            "OBJECT_TYPE": nglObjectTypes.CYLINDER,
            "start": start,
            "end": end,
            "colour": colour
        }
    }

    generateMolObject(){
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

    generateObject(){
        // Get the data
        const data = this.props.data;
        var nglObject = {
            "name": "COMPLEXLOAD" + "_" + data.id.toString(),
            "OBJECT_TYPE":nglObjectTypes.COMPLEX,
            "sdf_info": data.sdf_info,
            "colour": this.colourToggle,
            "prot_url": this.getViewUrl(data.prot_id,"prot_from_pk")
        }
        return nglObject;
    }

    handleVector(json){
        var objList = this.generateObjectList(json);
        objList.forEach(item => this.props.loadObject(Object.assign({display_div: "major_view"}, item)));
        this.props.setVectorList(objList)
    }

    componentDidMount() {
        this.loadFromServer(this.props.width,this.props.height);
        var thisToggleOn = false;
        var complexOn = false;
        for(var key in this.props.inViewList){
            if(key.startsWith("MOLLOAD_") && parseInt(key.split("MOLLOAD_")[[1]])==this.props.data.id){
                this.setState(prevState => ({isToggleOn: true}));
            }
            if(key.startsWith("COMPLEXLOAD_") && parseInt(key.split("COMPLEXLOAD_")[[1]])==this.props.data.id){
                this.setState(prevState => ({complexOn: true}));
            }
        }
    }

    render() {
        const svg_image = <SVGInline svg={this.state.img_data}/>;
        const selected_style = {width: this.props.width.toString+'px',
            height: this.props.height.toString()+'px', backgroundColor: this.state.backgroundColour}
        this.current_style = this.state.isToggleOn ? selected_style : this.not_selected_style;
        return <div>
            <div onClick={this.handleClick} style={this.current_style}>{svg_image}</div>
            <Toggle onClick={this.onComplex}
                on={<p>Complex ON</p>}
                off={<p>Complex OFF</p>}
                size="xs"
                offstyle="danger"
                active={this.state.complexOn}/>
            <Toggle onClick={this.onVector}
                on={<p>Vector ON</p>}
                off={<p>Vector OFF</p>}
                size="xs"
                offstyle="danger"
                active={this.state.vectorOn}/>
            </div>
    }

    getThisColor() {
        var colourList = shuffle(['#CC6666', '#FDBCB4', '#FF6E4A', '#C5E384', '#80DAEB', '#1F75FE', '#F75394', '#EFCDB8', '#FAE7B5', "#78DBE2", '#95918C', '#ADADD6'])
        return colourList[this.props.data.id % colourList.length];
    }

    handleClick(e){
        this.setState(prevState => ({isToggleOn: !prevState.isToggleOn, backgroundColour: this.colourToggle}))
        if(this.state.isToggleOn){
            this.props.deleteObject(Object.assign({display_div: "major_view"}, this.generateMolObject()))
        }
        else{
            this.props.loadObject(Object.assign({display_div: "major_view"}, this.generateMolObject(this.colourToggle)))
        }
    }

    onComplex(){
        this.setState(prevState => ({complexOn: !prevState.complexOn}))
        if(this.state.complexOn){
            this.props.deleteObject(Object.assign({display_div: "major_view"}, this.generateObject()))
        }
        else{
            this.props.loadObject(Object.assign({display_div: "major_view"}, this.generateObject()))
            if(!this.state.toggleOn){
                this.handleClick()
            }
        }
    }

    onVector(){
        this.setState(prevState => ({vectorOn: !prevState.vectorOn}))
        if(this.state.vectorOn) {
            this.props.vector_list.forEach(item => this.props.deleteObject(Object.assign({display_div: "major_view"}, item)));

        }
        else {
            fetch(this.getViewUrl(this.props.data.id, "get_vects_from_pk"))
                .then(
                    response => response.json(),
                    error => console.log('An error occurred.', error)
                )
                .then(json => this.handleVector(json))
            // Set this
            this.props.getFullGraph(this.props.data);
            // Do the query
            fetch(this.getViewUrl(this.props.data.id, "get_graph_from_pk"))
                .then(
                    response => response.text(),
                    error => console.log('An error occurred.', error)
                )
                .then(json => this.props.gotFullGraph(json))
        }
    }

}
function mapStateToProps(state) {
  return {
      currentList: state.apiReducers.possibleMols,
      inViewList:state.nglReducers.objectsInView,
      binList: state.apiReducers.binnedMols,
      vector_list: state.selectionReducers.vector_list,
      newListTwo: state.apiReducers.chosenMols,
  }
}
const mapDispatchToProps = {
    getFullGraph: selectionActions.getFullGraph,
    setVectorList: selectionActions.setVectorList,
    gotFullGraph: selectionActions.gotFullGraph,
    transferList: apiActions.transferList,
    deleteObject: nglLoadActions.deleteObject,
    removeFromToBuyList: selectionActions.removeFromToBuyList,
    loadObject: nglLoadActions.loadObject
}

export default connect(mapStateToProps, mapDispatchToProps)(MoleculeView);