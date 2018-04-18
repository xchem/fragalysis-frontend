/**
 * Created by abradley on 01/03/2018.
 */
import { Stage, Shape, concatStructures, Selection } from 'ngl';
import { ListGroupItem, ListGroup, Col} from 'react-bootstrap';
import React from 'react';
import { connect } from 'react-redux'
import * as apiActions from '../actions/apiActions'
import * as nglLoadActions from '../actions/nglLoadActions'
import * as nglObjectTypes from '../components/nglObjectTypes'
import * as listTypes from './listTypes'
import { showLoading, hideLoading } from 'react-redux-loading-bar'
import * as selectionActions from '../actions/selectionActions'

export class NGLView extends React.Component {


    constructor(props) {
        super(props);
        // Create NGL Stage object
        if (this.props.div_id){
            this.div_id = this.props.div_id;
        }
        else{
            this.div_id = "viewport";
        }
        if(props.height){
            this.height = props.height;
        }
        else{
            this.height = "600px";
        }
        this.interval = 300;
        this.focus_var = 95;
        this.stage = undefined;
        this.renderDisplay = this.renderDisplay.bind(this);
        this.renderComplex = this.renderComplex.bind(this);
        this.generateObject = this.generateObject.bind(this);
        this.showPick = this.showPick.bind(this);
        this.generateSphere = this.generateSphere.bind(this);
    }

    showPick (stage, pickingProxy) {
        if (pickingProxy) {
            if (pickingProxy.object.name){
                var name = pickingProxy.object.name
                // Ok so now perform logic
                var type = name.split("_")[0].split("(")[1]
                if (type==listTypes.MOLGROUPS){
                    var pk = parseInt(name.split("_")[1].split(")")[0])
                    this.props.setMolGroupOn(pk)
                }
                else if (type==listTypes.PANDDA_SITE){
                        var pk = parseInt(name.split(listTypes.PANDDA_SITE)[1].split(")")[0])
                        this.props.setPanddaSiteOn(pk)
                    }
                else if (type==listTypes.MOLECULE){

                }
                else if (type==listTypes.VECTOR){
                    const vectorSmi = name.split("_")[1].slice(0,-1);
                    this.props.selectVector(vectorSmi);
                }
            }
        }
    }

    componentDidMount(){
        this.stage = new Stage(this.div_id);
        // Handle window resizing
        var local_stage = this.stage;
        window.addEventListener("resize", function (event) {
           local_stage.handleResize();
        }, false);
        this.renderDisplay();
        setInterval(this.renderDisplay,this.interval)
        this.stage.mouseControls.add("clickPick-left",this.showPick);
        this.old_mol_group_on = -1;
    }

    generateObject(object_name, input_dict){
        if(input_dict["OBJECT_TYPE"]==nglObjectTypes.SPHERE)
        {
            var colour = input_dict["colour"];
            var radius = input_dict["radius"];
            var coords = input_dict["coords"];
            var shape = new Shape( object_name );
            shape.addSphere(coords, colour, radius);
            var shapeComp = this.stage.addComponentFromObject(shape);
            shapeComp.addRepresentation("buffer");
        }
        else if (input_dict["OBJECT_TYPE"]==nglObjectTypes.MOLECULE){
            var stringBlob = new Blob( [ input_dict["sdf_info"] ], { type: 'text/plain'} );
            this.stage.loadFile( stringBlob, { name: object_name,ext: "sdf" } ).then( function( comp ){
                comp.addRepresentation( "ball+stick", { colorScheme: "element", colorValue:input_dict["colour"], multipleBond: true }
                );
                comp.autoView("ligand");
            });
        }
        else if(input_dict["OBJECT_TYPE"]==nglObjectTypes.COMPLEX){
            var stringBlob = new Blob( [ input_dict["sdf_info"] ], { type: 'text/plain'} );
            Promise.all([
                this.stage.loadFile(input_dict["prot_url"], {ext: "pdb"}),
                this.stage.loadFile(stringBlob, {ext: "sdf"}),
                this.stage, this.focus_var, object_name,input_dict["colour"]]
            ).then(ol => this.renderComplex(ol));
        }
        else if(input_dict["OBJECT_TYPE"]==nglObjectTypes.CYLINDER){
            var colour = input_dict["colour"]==undefined ? [1,0,0] : input_dict["colour"];
            var radius = input_dict["radius"]==undefined ? 0.4 : input_dict["radius"];
            var coords = input_dict["coords"];
            var shape = new Shape( object_name );
            shape.addCylinder(input_dict["start"],input_dict["end"], colour, radius);
            var shapeComp = this.stage.addComponentFromObject(shape);
            shapeComp.addRepresentation("buffer");
        }
        else if(input_dict["OBJECT_TYPE"]==nglObjectTypes.ARROW){
            var colour = input_dict["colour"]==undefined ? [1,0,0] : input_dict["colour"];
            var radius = input_dict["radius"]==undefined ? 0.3 : input_dict["radius"];
            var shape = new Shape( object_name );
            shape.addArrow(input_dict["start"],input_dict["end"], colour, radius);
            var shapeComp = this.stage.addComponentFromObject(shape);
            shapeComp.addRepresentation("buffer");
        }
        else if(input_dict["OBJECT_TYPE"]==nglObjectTypes.PROTEIN){
            this.stage.loadFile( input_dict["prot_url"], { name: object_name, ext: "pdb" } ).then( function( comp ){
                comp.addRepresentation( "cartoon", {  } );
                comp.autoView();
            });
        }
    }

    renderComplex(ol){
            var cs = concatStructures(
                ol[4],
                ol[0].structure.getView(new Selection("not ligand")),
                ol[1].structure.getView(new Selection(""))
            )
            var stage = ol[2];
            var focus_var = ol[3];
        var colour = ol[5];
            // Set the object name
            var comp = stage.addComponentFromObject(cs)
            comp.addRepresentation("cartoon")
            comp.addRepresentation("contact", {
                masterModelIndex: 0,
                weakHydrogenBond: true,
                maxHbondDonPlaneAngle: 35,
                sele: "/0 or /1"
            })
            comp.addRepresentation("line", {
                colorScheme: "element",
                colorValue:colour,
                sele: "/0"
            })
            comp.autoView("ligand");
            stage.setFocus(focus_var);
    }


    generateSphere(data,selected=false){
        var sele = ""
        var color = [0,0,1]
        if(selected){
            sele = "SELECT"
            color = [0,1,0]
        }
        var radius;
        if(data.mol_id.length>10){
            radius = 5.0
        }
        else if(data.mol_id.length>5){
            radius = 3.0
        }
        else{
            radius = 2.0
        }
        return Object.assign({},
            data,
            {
                name: listTypes.MOLGROUPS + sele + "_" + + data.id.toString(),
                display_div: "summary_view",
                OBJECT_TYPE: nglObjectTypes.SPHERE,
                coords: [data.x_com,data.y_com,data.z_com],
                radius: radius,
                colour: color
            }
        )
    }


    /**
     * Function to deal with the logic of showing molecules
     */
    renderDisplay() {
        // var orientation = this.stage.viewerControls.getOrientation();
        // var otherArray;
        // if (this.props.orientation){
        //     otherArray = this.props.orientation.elements
        // }
        // if(orientation != undefined && arraysEqual(orientation.elements,otherArray)!=true){
        //     this.props.setOrientation(orientation);
        // }
        for(var nglKey in this.props.objectsToLoad){
            var nglObject = this.props.objectsToLoad[nglKey];
            if (this.div_id==nglObject.display_div) {
                this.generateObject(nglKey, nglObject);
                this.props.objectLoading(nglObject);
                this.props.showLoading();
            }
        }
        for(var nglKey in this.props.objectsToDelete){
            var nglObject = this.props.objectsToDelete[nglKey]
            if (this.div_id==nglObject.display_div) {
                var comps = this.stage.getComponentsByName(nglKey)
                for (var component in comps.list) {
                    this.stage.removeComponent(comps.list[component]);
                }
                this.props.deleteObjectSuccess(this.props.objectsToDelete[nglKey])
            }
        }
        for(var nglKey in this.props.objectsLoading){
            var nglObject = this.props.objectsLoading[nglKey]
            if (this.div_id==nglObject.display_div) {
                if (this.stage.getComponentsByName(nglKey).list.length > 0) {
                    var nglObject = this.props.objectsLoading[nglKey];
                    this.props.loadObjectSuccess(nglObject);
                    this.props.hideLoading()
                }
            }
        }
        if (this.props.mol_group_on && this.props.mol_group_on != this.old_mol_group_on){
            var old_data;
            var new_data;
            for (var index in this.props.mol_group_list){
                if(this.props.mol_group_list[index].id==this.props.mol_group_on){
                    new_data = this.props.mol_group_list[index];
                }
                if(this.props.mol_group_list[index].id==this.old_mol_group_on) {
                    old_data = this.props.mol_group_list[index];
                }
            }
            if (old_data) {
                this.props.deleteObject(this.generateSphere(old_data, true));
                this.props.loadObject(this.generateSphere(old_data));
            }
            // Delete the two old spheres
            this.props.deleteObject(this.generateSphere(new_data));
            this.props.loadObject(this.generateSphere(new_data, true));
            this.old_mol_group_on = this.props.mol_group_on;
        }
    }
    
    render(){
        return <div style={{height: this.height}} id={this.div_id}>
           </div>
    }
}

function mapStateToProps(state) {
  return {
      mol_group_list: state.apiReducers.mol_group_list,
      mol_group_on: state.apiReducers.mol_group_on,
      objectsToLoad: state.nglReducers.objectsToLoad,
      objectsToDelete: state.nglReducers.objectsToDelete,
      objectsLoading: state.nglReducers.objectsLoading,
      objectsInView: state.nglReducers.objectsInView,
      orientation: state.nglReducers.orientation,
      objectsPicked: state.nglReducers.objectsPicked
  }
}
const mapDispatchToProps = {
    setMolGroupOn: apiActions.setMolGroupOn,
    selectVector: selectionActions.selectVector,
    hideLoading: hideLoading,
    setPanddaSiteOn: apiActions.setPanddaSiteOn,
    showLoading: showLoading,
    setOrientation: nglLoadActions.setOrientation,
    objectLoading: nglLoadActions.objectLoading,
    loadObjectSuccess: nglLoadActions.loadObjectSuccess,
    loadObjectFailure: nglLoadActions.loadObjectFailure,
    deleteObject: nglLoadActions.deleteObject,
    loadObject: nglLoadActions.loadObject,
    deleteObjectSuccess: nglLoadActions.deleteObjectSuccess
}
export default connect(mapStateToProps, mapDispatchToProps)(NGLView);