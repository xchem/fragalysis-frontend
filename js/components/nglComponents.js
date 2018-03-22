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
import * as listTypes from '../components/listTypes'
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
        this.typeCheck = this.typeCheck.bind(this);
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
            var colour = [1,0,0];
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
                comp.addRepresentation( "ball+stick", { multipleBond: true } );
            });
        }
        else if(input_dict["OBJECT_TYPE"]==nglObjectTypes.COMPLEX){
            var stringBlob = new Blob( [ input_dict["sdf_info"] ], { type: 'text/plain'} );
            Promise.all([
                this.stage.loadFile(input_dict["prot_url"], {ext: "pdb"}),
                this.stage.loadFile(stringBlob, {ext: "sdf"}),
                this.stage, this.focus_var, object_name]
            ).then(ol => this.renderComplex(ol));
        }
        else if(input_dict["OBJECT_TYPE"]==nglObjectTypes.CYLINDER){
            var colour = [1,0,0];
            var radius = 0.7;
            var coords = input_dict["coords"];
            var shape = new Shape( object_name );
            shape.addCylinder(input_dict["start"],input_dict["end"], colour, radius);
            var shapeComp = this.stage.addComponentFromObject(shape);
            shapeComp.addRepresentation("buffer");
        }
        else if(input_dict["OBJECT_TYPE"]==nglObjectTypes.ARROW){
            var colour = [1,0,0];
            var radius = 0.5;
            var shape = new Shape( object_name );
            shape.addArrow(input_dict["start"],input_dict["end"], colour, radius);
            var shapeComp = this.stage.addComponentFromObject(shape);
            shapeComp.addRepresentation("buffer");
        }
        else if(input_dict["OBJECT_TYPE"]==nglObjectTypes.PROTEIN){
            this.stage.loadFile( input_dict["prot_url"], { name: object_name, ext: "pdb" } ).then( function( comp ){
                comp.addRepresentation( "ribbon", {  } );
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
            // Set the object name
            var comp = stage.addComponentFromObject(cs)
            comp.addRepresentation("cartoon")
            comp.addRepresentation("contact", {
                masterModelIndex: 0,
                weakHydrogenBond: true,
                maxHbondDonPlaneAngle: 35,
                sele: "/0 or /1"
            })
            comp.addRepresentation("licorice", {
                sele: "ligand and /1",
                multipleBond: "offset"
            })
            comp.addRepresentation("line", {
                sele: "/0"
            })
            comp.autoView("ligand");
            stage.setFocus(focus_var);
    }

    renderProtein(ol){
        var cs = ol[0]
        var stage = ol[1];
        var focus_var = ol[2];
        var object_name = ol[3]
        // Set the object name
        var comp = stage.addComponentFromObject(cs)
        comp.addRepresentation("cartoon")
    }


    typeCheck(nglObject){
        var expectedDiv
        var majorList = [nglObjectTypes.ARROW,nglObjectTypes.COMPLEX, nglObjectTypes.CYLINDER,nglObjectTypes.MOLECULE]
        var summaryList = [nglObjectTypes.SPHERE, nglObjectTypes.PROTEIN]
        for (var index in majorList) {
            if (nglObject["OBJECT_TYPE"] == majorList[index]) {
                expectedDiv = "major_view"
            }
        }
        for (var index in summaryList) {
            if (nglObject["OBJECT_TYPE"] == summaryList[index]) {
                expectedDiv = "summary_view"
            }
        }
        return this.div_id==expectedDiv
    }


    /**
     * Function to deal with the logic of showing molecules
     */
    renderDisplay() {

        for(var nglKey in this.props.objectsToLoad){
            var nglObject = this.props.objectsToLoad[nglKey];
            if (this.typeCheck(nglObject)) {
                this.generateObject(nglKey, nglObject);
                this.props.objectLoading(nglObject);
                this.props.showLoading()
            }
        }
        for(var nglKey in this.props.objectsToDelete){
            var nglObject = this.props.objectsToDelete[nglKey]
            if (this.typeCheck(nglObject)) {
                var comps = this.stage.getComponentsByName(nglKey)
                for (var component in comps.list) {
                    this.stage.removeComponent(comps.list[component]);
                }
                this.props.deleteObjectSuccess(this.props.objectsToDelete[nglKey])
            }
        }
        for(var nglKey in this.props.objectsLoading){
            var nglObject = this.props.objectsLoading[nglKey]
            if (this.typeCheck(nglObject)) {
                if (this.stage.getComponentsByName(nglKey).list.length > 0) {
                    var nglObject = this.props.objectsLoading[nglKey];
                    this.props.loadObjectSuccess(nglObject);
                    this.props.hideLoading()
                }
            }
        }
        if(this.props.mol_group_on != this.old_mol_group_on){
            var comps = this.stage.getComponentsByName("MOLGROUPS_"+this.props.mol_group_on.toString());
            this.old_mol_group_on = this.props.mol_group_on
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
      objectsPicked: state.nglReducers.objectsPicked
  }
}
const mapDispatchToProps = {
    setMolGroupOn: apiActions.setMolGroupOn,
    selectVector: selectionActions.selectVector,
    hideLoading: hideLoading,
    showLoading: showLoading,
    objectLoading: nglLoadActions.objectLoading,
    loadObject: nglLoadActions.loadObject
    loadObjectSuccess: nglLoadActions.loadObjectSuccess,
    loadObjectFailure: nglLoadActions.loadObjectFailure,
    deleteObjectSuccess: nglLoadActions.deleteObjectSuccess
}
export default connect(mapStateToProps, mapDispatchToProps)(NGLView);