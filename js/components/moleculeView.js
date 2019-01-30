/**
 * Created by abradley on 14/03/2018.
 */

import React from "react";
import {connect} from "react-redux";
import {ButtonToolbar,Label, ToggleButtonGroup, ToggleButton} from "react-bootstrap";
import * as nglLoadActions from "../actions/nglLoadActions";
import {GenericView} from "./generalComponents";
import * as nglObjectTypes from "./nglObjectTypes";
import * as selectionActions from "../actions/selectionActions";
import * as apiActions from "../actions/apiActions";
import * as listTypes from "./listTypes";
import SVGInline from "react-svg-inline";
import fetch from "cross-fetch";
import RefinementOutcome from "./refinementOutcome";

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
        this.onEDensity = this.onEDensity.bind(this);
        this.getEDensityUrl = this.getEDensityUrl.bind(this);
        this.generateEDensityObject = this.generateEDensityObject.bind(this);
        this.handleChange = this.handleChange.bind(this);
        var base_url = window.location.protocol + "//" + window.location.host
        this.base_url = base_url;
        this.url = new URL(base_url + '/api/molimg/' + this.props.data.id + "/")
        this.key = "mol_image"
        this.colourToggle = this.getRandomColor();
        this.eDensityUrl = undefined
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
            "name": this.props.data.protein_code + "_COMP",
            "OBJECT_TYPE":nglObjectTypes.COMPLEX,
            "sdf_info": data.sdf_info,
            "colour": this.colourToggle,
            "prot_url": this.base_url + data.molecule_protein
        }
        return nglObject;
    }

    generateBondColorMap(inputDict){
        var out_d = {}
        for(var key in inputDict){
            for(var vector in inputDict[key]){
                var vect = vector.split("_")[0]
                out_d[vect]=inputDict[key][vector];
            }
        }
        return out_d;
    }

    handleVector(json) {
        var objList = this.generateObjectList(json["3d"]);
        this.props.setVectorList(objList);
        var vectorBondColorMap = this.generateBondColorMap(json["indices"])
        this.props.setBondColorMap(vectorBondColorMap);
    }

    handleChange(value){
        var old = this.state.value;
        var new_list = value.slice();
        var removed = old.filter(function(i) {return value.indexOf(i)<0;})[0]
        var added = value.filter(function(i) {return old.indexOf(i)<0;})[0]
        var changed = [removed,added];
        if (changed.indexOf(1)>-1){
            this.onComplex(new_list);
        }
        if (changed.indexOf(2)>-1){
            this.handleClick(new_list);
        }
        if (changed.indexOf(3)>-1){
            this.onVector(new_list);
        }
        if (changed.indexOf(4)>-1){
            this.onEDensity(new_list);
        }
    }

    componentWillMount() {
        this.getEDensityUrl()
    }

    componentDidMount() {
        this.loadFromServer(this.props.width,this.props.height);
        var thisToggleOn = this.props.fragmentDisplayList.has(this.props.data.id);
        var complexOn = this.props.complexList.has(this.props.data.id);
        var eDensityOn = this.props.eDensityList.has(this.props.data.id);
        var value_list = []
        if(complexOn){
            value_list.push(1)
        }
        if(thisToggleOn){
            value_list.push(2)
        }
        if(this.props.to_query==this.props.data.smiles){
            value_list.push(3)
        }
        if(eDensityOn){
            value_list.push(4)
        }
        this.setState(prevState => ({value: value_list, complexOn: complexOn, isToggleOn: thisToggleOn, eDensityOn: eDensityOn}))
    }

    componentWillReceiveProps(nextProps){
        var value_list = this.state.value.slice();
        if(nextProps.to_query!=this.props.data.smiles){
            var index = value_list.indexOf(3);
            if (index > -1) {
                value_list.splice(index, 1);
                this.setState(prevState => ({value: value_list}))
            }
        }
    }

    render() {
        const svg_image = <SVGInline svg={this.state.img_data}/>;
        // Here add the logic that updates this based on the information
        // const refinement = <Label bsStyle="success">{"Refined"}</Label>;
        const selected_style = {height: this.props.height.toString()+'px', backgroundColor: this.colourToggle}
        const not_selected_style = {height: this.props.height.toString()+'px'}
        this.current_style = this.state.isToggleOn || this.state.complexOn ? selected_style : not_selected_style;
        return <div style={{border: "solid", display: "inline-block"}}>
                <div style={this.current_style}>{svg_image}</div>
            <Label bsStyle="default">{this.props.data.protein_code}</Label>
            <RefinementOutcome data={this.props.data}></RefinementOutcome>
                <ButtonToolbar>
                    <ToggleButtonGroup vertical block type="checkbox" value={this.state.value} onChange={this.handleChange}>
                        <ToggleButton bsSize="sm" bsStyle="info" value={2}>Ligand</ToggleButton>
                        <ToggleButton bsSize="sm" bsStyle="info" value={1}>Complex</ToggleButton>
                        <ToggleButton bsSize="sm" bsStyle="info" value={3}>Vectors</ToggleButton>
                        <ToggleButton bsSize="sm" bsStyle="info" value={4}>Event</ToggleButton>
                    </ToggleButtonGroup>
                </ButtonToolbar>
            </div>
    }

    getRandomColor() {
        var colourList = ['#EFCDB8', '#CC6666', '#FF6E4A', '#78DBE2', '#1F75FE', '#FAE7B5', '#FDBCB4', '#C5E384', '#95918C', '#F75394', '#80DAEB', '#ADADD6']
        return colourList[this.props.data.id % colourList.length];
    }

    handleClick(new_list=undefined) {
        if(new_list!=undefined){
            this.setState(prevState => ({isToggleOn: !prevState.isToggleOn, value: new_list}));
        }
        else{
            this.setState(prevState => ({isToggleOn: !prevState.isToggleOn}))
        }
        if(this.state.isToggleOn){
            this.props.deleteObject(Object.assign({display_div: "major_view"}, this.generateMolObject()))
            this.props.removeFromFragmentDisplayList(this.generateMolId())
        }
        else{
            this.props.loadObject(Object.assign({display_div: "major_view"}, this.generateMolObject(this.colourToggle)))
            this.props.appendFragmentDisplayList(this.generateMolId())
        }
    }

    onComplex(new_list=undefined) {
        if(new_list!=undefined) {
            this.setState(prevState => ({complexOn: !prevState.complexOn, value: new_list}))
        }
        else{
            this.setState(prevState => ({complexOn: !prevState.complexOn}))
        }
        if(this.state.complexOn){
            this.props.deleteObject(Object.assign({display_div: "major_view"}, this.generateObject()))
            this.props.removeFromComplexList(this.generateMolId())
        }
        else{
            this.props.loadObject(Object.assign({display_div: "major_view"}, this.generateObject()))
            this.props.appendComplexList(this.generateMolId())
        }
    }

    onVector(new_list=undefined) {
        if(new_list!=undefined) {
            this.setState(prevState => ({vectorOn: !prevState.vectorOn, value: new_list}))
        }
        else{
            this.setState(prevState => ({vectorOn: !prevState.vectorOn}))
        }
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
            this.props.selectVector(undefined);
        }
    }

    onEDensity(new_list=undefined) {
        if (this.eDensityUrl == undefined) {
            this.getEDensityUrl()
        }
        if(new_list!=undefined) {
            this.setState(prevState => ({eDensityOn: !prevState.eDensityOn, value: new_list}))
        }
        else{
            this.setState(prevState => ({eDensityOn: !prevState.eDensityOn}))
        }
        if(this.state.eDensityOn){
            this.props.eDensityList.forEach(item => this.props.deleteObject(Object.assign({display_div: "major_view"}, item)));
            // this.props.deleteObject(Object.assign({display_div: "major_view"}, this.generateEDensityObject(this.eDensityUrl)));
            this.props.removeFromEDensityList(this.generateMolId());
            // this.props.removeFromEDensityList(this.props.data.id);
        }
        else{
            this.props.loadObject(Object.assign({display_div: "major_view"}, this.generateEDensityObject(this.eDensityUrl)));
            this.props.appendEDensityList(this.generateMolId());
        }
    }

    afterPush(data){
    }

    processEDensityUrl(json){
        var results = json.results[0].map_info.replace("http:",window.location.protocol);
        this.afterPush(results);
        this.eDensityUrl = results;
    }

    getEDensityUrl() {
        fetch(this.base_url + '/api/proteins/?code=' + this.props.data.protein_code, {
            method: "get",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        }).then(function (response) {
            return response.json();
        }).then(
            json => this.processEDensityUrl(json)
        )
    }
        // "http://fragalysis-rg.apps.xchem.diamond.ac.uk/media/pdbs/TBXTA-x0773_1_apo_sSKGYWD.pdb")
        // "http://fragalysis-rg.apps.xchem.diamond.ac.uk/media/maps/TBXTA-x0776_1_pandda.map_yTxO9Pb.gz")
        // json => this.generateEDensityObject(json.results[0].map_info)
        // return "http://fragalysis-rg.apps.xchem.diamond.ac.uk/media/maps/TBXTA-x0776_1_pandda.map_yTxO9Pb.gz"

    generateEDensityObject(eDensityUrl) {
        fetch(eDensityUrl, {
            method: "get",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(function (response) {
            var eDensityObject = {
                "name": "EVENTLOAD" + "_" + this.props.data.protein_code.toString(),
                "mapUrl": response,
                "display_div": "major_view",
                "OBJECT_TYPE": nglObjectTypes.E_DENSITY,
                "map_type": "electonDensity",
                "map_info": response
            }
            return eDensityObject;
        }).then(eDensityObject => this.handleEDensity(eDensityObject, "load"))
    }

    handleEDensity(eDensityObject, loadState){
        if (loadState === 'load'){
            this.props.loadObject(eDensityObject);
        } else if (loadState === 'unload'){
            this.props.deleteObject(eDensityObject);
        }
    }
}

function mapStateToProps(state) {
    return {
        to_query: state.selectionReducers.present.to_query,
        vector_list: state.selectionReducers.present.vector_list,
        complexList: state.selectionReducers.present.complexList,
        eDensityList: state.selectionReducers.present.eDensityList,
        fragmentDisplayList: state.selectionReducers.present.fragmentDisplayList,
    }
}
const mapDispatchToProps = {
    getFullGraph: selectionActions.getFullGraph,
    setVectorList: selectionActions.setVectorList,
    setBondColorMap: selectionActions.setBondColorMap,
    selectVector: selectionActions.selectVector,
    gotFullGraph: selectionActions.gotFullGraph,
    setMol: selectionActions.setMol,
    deleteObject: nglLoadActions.deleteObject,
    loadObject: nglLoadActions.loadObject,
    appendComplexList: selectionActions.appendComplexList,
    removeFromComplexList: selectionActions.removeFromComplexList,
    appendEDensityList: selectionActions.appendEDensityList,
    removeFromEDensityList: selectionActions.removeFromEDensityList,
    appendVectorOnList: selectionActions.appendVectorOnList,
    removeFromVectorOnList: selectionActions.removeFromVectorOnList,
    appendFragmentDisplayList: selectionActions.appendFragmentDisplayList,
    removeFromFragmentDisplayList: selectionActions.removeFromFragmentDisplayList,
    setErrorMessage: apiActions.setErrorMessage,
}

export default connect(mapStateToProps, mapDispatchToProps)(MoleculeView);