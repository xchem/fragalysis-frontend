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
import SVGInline from "react-svg-inline";
import fetch from 'cross-fetch';

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
        this.base_url = base_url;
        this.url = new URL(base_url + '/api/molimg/' + this.props.data.id + "/")
        this.key = "mol_image"
        this.state.vectorOn = false
        this.state.complexOn = false
        this.colourToggle = this.getRandomColor();
    }

    getViewUrl(get_view) {
        return new URL(this.base_url + '/api/' + get_view + '/' + this.props.data.id + "/")
    }

    /**
     * Convert the JSON into a list of arrow objects
     */
    generateObjectList(out_data) {
        var colour = [1,0,0]
        var deletions = out_data.deletions
        var outList = [];
        for(var key in deletions) {
            outList.push(this.generateArrowObject(deletions[key][0],
                deletions[key][1],key.split("_")[0],colour))
        }
        var additions = out_data.additions
        for(var key in additions) {
            outList.push(this.generateArrowObject(additions[key][0],
                additions[key][1],key.split("_")[0],colour))
        }
        var linker = out_data.linkers
        for(var key in linker) {
            outList.push(this.generateCylinderObject(linker[key][0],
                linker[key][1],key.split("_")[0],colour))
        }

        var rings = out_data.ring
        for (var key in rings){
            outList.push(this.generateCylinderObject(rings[key][0],
                rings[key][2],key.split("_")[0],colour))
        }
        return outList;
    }

    generateArrowObject(start, end, name, colour) {
        return {
            "name": listTypes.VECTOR+"_"+name,
            "OBJECT_TYPE": nglObjectTypes.ARROW,
            "start": start,
            "end": end,
            "colour": colour
        }
    }

    generateCylinderObject(start, end, name, colour) {
        return {
            "name": listTypes.VECTOR+"_"+name,
            "OBJECT_TYPE": nglObjectTypes.CYLINDER,
            "start": start,
            "end": end,
            "colour": colour
        }
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

    handleVector(json) {
        var objList = this.generateObjectList(json);
        this.props.setVectorList(objList)
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

    render() {
        const svg_image = <SVGInline svg={this.state.img_data}/>;
        const selected_style = {width: this.props.width.toString+'px',
            height: this.props.height.toString()+'px', backgroundColor: this.colourToggle}
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
                active={this.props.to_query==this.props.data.smiles}/>
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

    onVector() {
        this.setState(prevState => ({vectorOn: !prevState.vectorOn}))
        if(this.state.vectorOn) {
            this.props.vector_list.forEach(item => this.props.deleteObject(Object.assign({display_div: "major_view"}, item)));
            this.props.setMol("");
        }
        else {
            this.props.vector_list.forEach(item => this.props.deleteObject(Object.assign({display_div: "major_view"}, item)));
            fetch(this.getViewUrl("vector"))
                .then(
                    response => response.json(),
                    error => console.log('An error occurred.', error)
                )
                .then(json => this.handleVector(json["vectors"]))
            // Set this
            this.props.getFullGraph(this.props.data);
            // Do the query
            fetch(this.getViewUrl( "graph"))
                .then(
                    response => response.json(),
                    error => console.log('An error occurred.', error)
                )
                .then(json => this.props.gotFullGraph(json["graph"]))
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

export default connect(mapStateToProps, mapDispatchToProps)(MoleculeView);