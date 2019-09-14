/**
 * Created by abradley on 14/03/2018.
 */

import React from "react";
import {connect} from "react-redux";
import {Grid, withStyles, Button} from "@material-ui/core";
import * as nglLoadActions from "../actions/nglLoadActions";
import {GenericView} from "./generalComponents";
import * as nglObjectTypes from "./nglObjectTypes";
import * as selectionActions from "../actions/selectionActions";
import * as listTypes from "./listTypes";
import SVGInline from "react-svg-inline";
import fetch from "cross-fetch";
import RefinementOutcome from "./refinementOutcome";
import classNames from 'classnames';

const styles = () => ({
    container: {
        width: '100%',
        padding: '4px 0',
        color: 'black'
    },
    siteCol: {
        width: '24px',
        fontSize: '24px',
    },
    contCol: {
        width: '24px',
    },
    contColGridItem: {
        height: '16px',
        display: 'flex'
    },
    contColButton: {
        padding: 0,
        minWidth: 'unset',
        borderRadius: 0,
        borderColor: 'white',
        backgroundColor: '#D8E7F4',
        '&:hover': {
            backgroundColor: '#2B69AA'
        }
    },
    contColButtonSelected: {
        backgroundColor: '#2B69AA',
    },
    detailsCol: {
        // - 24px (siteCol) - 24px (contCol)
        width: 'calc(100% - 24px - 24px)',
        border: 'solid 1px #DEDEDE'
    },
    statusCol: {
        width: '30%',
    },
    textBold: {
        fontWeight: 'bold',
    },
    imageCol: {
        width: '30%',
        display: 'flex',
        justifyContent: 'center'
    },
    propsCol: {
        width: '40%',
        fontSize: '10px'
    },
    propsColItem: {
        width: '20%'
    },
    centered: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }
});

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

    getCalculatedProps() {
        const { data } = this.props;
        return [
            { name: 'MW', value: data.mw },
            { name: 'logP', value: data.logp },
            { name: 'TPSA', value: data.tpsa },
            { name: 'HA', value: data.ha },
            { name: 'Hacc', value: data.hacc },
            { name: 'Hdon', value: data.hdon },
            { name: 'Rots', value: data.rots },
            { name: 'Rings', value: data.rings },
            { name: 'Velec', value: data.velec },
            { name: '#cpa', value: '???' },
        ]
    }

    handleVector(json) {
        var objList = this.generateObjectList(json["3d"]);
        this.props.setVectorList(objList);
        var vectorBondColorMap = this.generateBondColorMap(json["indices"])
        this.props.setBondColorMap(vectorBondColorMap);
    }

    handleChange(value) {
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
    }

    componentDidMount() {
        this.loadFromServer(this.props.width,this.props.height);
        var thisToggleOn = this.props.fragmentDisplayList.has(this.props.data.id);
        var complexOn = this.props.complexList.has(this.props.data.id);
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
        this.setState(prevState => ({value: value_list, complexOn: complexOn, isToggleOn: thisToggleOn}))
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
        const { classes, height, data } = this.props;
        const { img_data, isToggleOn, complexOn, value } = this.state;
        const svg_image = <SVGInline svg={img_data}/>;
        // Here add the logic that updates this based on the information
        // const refinement = <Label bsStyle="success">{"Refined"}</Label>;
        const selected_style = {height: height.toString()+'px', backgroundColor: this.colourToggle}
        const not_selected_style = {height: height.toString()+'px'}
        this.current_style = isToggleOn || complexOn ? selected_style : not_selected_style;

        return (
            <Grid container className={classes.container}>
                <Grid item className={classNames(classes.siteCol, classes.centered)}>
                    ?
                </Grid>
                <Grid item container direction="column" alignItems="stretch" className={classes.contCol}>
                    <Grid item className={classes.contColGridItem}>
                        <Button variant="outlined" fullWidth className={classes.contColButton}>L</Button>
                    </Grid>
                    <Grid item className={classes.contColGridItem}>
                        <Button variant="outlined" fullWidth className={classes.contColButton}>C</Button>
                    </Grid>
                    <Grid item className={classes.contColGridItem}>
                        <Button variant="outlined" fullWidth className={classes.contColButton}>V</Button>
                    </Grid>
                </Grid>
                <Grid item container className={classes.detailsCol}>
                    <Grid item container direction="column" alignItems="center" justify="center" className={classes.statusCol}>
                        <Grid item className={classes.textBold}>{data.protein_code}</Grid>
                        <Grid item>
                            <RefinementOutcome data={this.props.data}></RefinementOutcome>
                        </Grid>
                    </Grid>
                    <Grid item className={classes.imageCol}>
                        <div style={this.current_style}>{svg_image}</div>
                    </Grid>
                    <Grid item container className={classes.propsCol}>
                        {
                            this.getCalculatedProps().map(p => (
                                <Grid item container justify="space-around" alignItems="center" direction="column" key={`calc-prop-${p.name}`} className={classes.propsColItem}>
                                    <Grid item className={classes.textBold}>{p.name}</Grid>
                                    <Grid item>{p.value}</Grid>
                                </Grid>
                            ))
                        }
                    </Grid>
                </Grid>
            </Grid>
        )
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
    setBondColorMap: selectionActions.setBondColorMap,
    selectVector: selectionActions.selectVector,
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MoleculeView));