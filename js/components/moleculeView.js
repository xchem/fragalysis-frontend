/**
 * Created by abradley on 14/03/2018.
 */

import React from "react";
import {connect} from "react-redux";
import {ButtonToolbar, ToggleButtonGroup, ToggleButton} from "react-bootstrap";
import * as nglLoadActions from "../actions/nglLoadActions";
import {GenericView} from "./generalComponents";
import * as nglObjectTypes from "./nglObjectTypes";
import * as selectionActions from "../actions/selectionActions";
import * as listTypes from "./listTypes";
import "../../css/toggle.css";
import SVGInline from "react-svg-inline";
import fetch from "cross-fetch";

class MoleculeView extends GenericView {

    constructor(props) {
        super(props);
        this.generateObject = this.generateObject.bind(this);
        this.generateMolObject = this.generateMolObject.bind(this);
        this.generateMolId = this.generateMolId.bind(this);
        this.handleVector = this.handleVector.bind(this);
        this.getViewUrl = this.getViewUrl.bind(this);
        this.onVector = this.onVector.bind(this);
        this.onComplex = this.onComplex.bind(this);
        this.handleChange = this.handleChange.bind(this);
        var base_url = window.location.protocol + "//" + window.location.host
        this.base_url = base_url;
        this.url = new URL(base_url + '/api/molimg/' + this.props.data.id + "/")
        this.key = "mol_image"
        this.state.vectorOn = false
        this.state.complexOn = false
        this.state.value = []
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

    generateMolId() {
        var molId = {
            "id": this.props.data.id,
        }
        return molId;
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

    handleChange(value){
        if (value==1){
            this.onComplex();
            this.setState({ value: value });
        }
        else if (value==2){
            this.handleClick();
            this.setState({ value: value });
        }
        else if (value==3){
            this.onVector();
            this.setState({ value: value });
        }
    }

    componentDidMount() {
        this.loadFromServer(this.props.width,this.props.height);
        var thisToggleOn = this.props.fragmentDisplayList.has(this.props.data.id);
        var complexOn = this.props.complexList.has(this.props.data.id);
        this.setState(prevState => ({complexOn: complexOn, isToggleOn: thisToggleOn}))
    }

    render() {
        const svg_image = <SVGInline svg={this.state.img_data}/>;
        const selected_style = {width: this.props.width.toString+'px',
            height: this.props.height.toString()+'px', backgroundColor: this.colourToggle}
        this.current_style = this.state.isToggleOn ? selected_style : this.not_selected_style;
        return <div style={{border: "1px solid black"}}>
            <div onClick={this.handleClick} style={this.current_style}>{svg_image}</div>
            <div>{this.props.data.protein_code}</div>
              <ButtonToolbar>
                  <ToggleButtonGroup type="checkbox"
                                     value={this.state.value}
                                     onChange={this.handleChange}>
                      <ToggleButton value={1}>Complex</ToggleButton>
                      <ToggleButton value={2}>Ligand</ToggleButton>
                      <ToggleButton value={3}>Vectors</ToggleButton>
                  </ToggleButtonGroup>
              </ButtonToolbar>
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
            this.props.removeFromFragmentDisplayList(this.generateMolId())
        }
        else{
            this.props.loadObject(Object.assign({display_div: "major_view"}, this.generateMolObject(this.colourToggle)))
            this.props.appendFragmentDisplayList(this.generateMolId())
        }
    }

    onComplex() {
        this.setState(prevState => ({complexOn: !prevState.complexOn}))
        if(this.state.complexOn){
            this.props.deleteObject(Object.assign({display_div: "major_view"}, this.generateObject()))
            this.props.removeFromComplexList(this.generateMolId())
        }
        else{
            this.props.loadObject(Object.assign({display_div: "major_view"}, this.generateObject()))
            this.props.appendComplexList(this.generateMolId())
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
            this.props.removeFromVectorOnList(this.generateMolId())
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
            this.props.appendVectorOnList(this.generateMolId())
        }
    }

}
function mapStateToProps(state) {
  return {
      to_query: state.selectionReducers.present.to_query,
      vector_list: state.selectionReducers.present.vector_list,
      complexList: state.selectionReducers.present.complexList,
      fragmentDisplayList: state.selectionReducers.present.fragmentDisplayList,
  }
}
const mapDispatchToProps = {
    getFullGraph: selectionActions.getFullGraph,
    setVectorList: selectionActions.setVectorList,
    gotFullGraph: selectionActions.gotFullGraph,
    setMol: selectionActions.setMol,
    deleteObject: nglLoadActions.deleteObject,
    loadObject: nglLoadActions.loadObject,
    appendComplexList: selectionActions.appendComplexList,
    removeFromComplexList: selectionActions.removeFromComplexList,
    appendVectorOnList: selectionActions.appendVectorOnList,
    removeFromVectorOnList: selectionActions.removeFromVectorOnList,
    appendFragmentDisplayList: selectionActions.appendFragmentDisplayList,
    removeFromFragmentDisplayList: selectionActions.removeFromFragmentDisplayList,
}

export default connect(mapStateToProps, mapDispatchToProps)(MoleculeView);