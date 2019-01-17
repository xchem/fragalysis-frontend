/**
 * Created by abradley on 01/03/2018.
 */

import {Stage, Shape, concatStructures, Selection} from "ngl";
import React from "react";
import {connect} from "react-redux";
import * as apiActions from "../actions/apiActions";
import * as nglLoadActions from "../actions/nglLoadActions";
import * as nglRenderActions from "../actions/nglRenderActions";
import * as nglObjectTypes from "../components/nglObjectTypes";
import * as listTypes from "./listTypes";
import * as selectionActions from "../actions/selectionActions";

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
        this.orientationToSet={};
        this.renderDisplay = this.renderDisplay.bind(this);
        this.showPick = this.showPick.bind(this);
        this.checkIfLoading = this.checkIfLoading.bind(this);
        this.generateSphere = this.generateSphere.bind(this);
        this.renderComplex = this.renderComplex.bind(this);
        this.showComplex = this.showComplex.bind(this);
        this.showEvent = this.showEvent.bind(this);
        this.updateOrientation = this.updateOrientation.bind(this);
        this.data_dict = {}
        this.data_dict[listTypes.MOLGROUPS]={oldGroupOn:-1,list:"mol_group_list",onGroup:"mol_group_on"}
        this.data_dict[listTypes.PANDDA_SITE]={oldGroupOn:-1,list:"pandda_site_list",onGroup:"pandda_site_on"}
        // Refactor this out into a utils directory
        this.function_dict = {}
        this.function_dict[nglObjectTypes.SPHERE] = this.showSphere
        this.function_dict[nglObjectTypes.MOLECULE] = this.showMol
        this.function_dict[nglObjectTypes.COMPLEX] = this.showComplex
        this.function_dict[nglObjectTypes.CYLINDER] = this.showCylinder
        this.function_dict[nglObjectTypes.ARROW] = this.showArrow
        this.function_dict[nglObjectTypes.PROTEIN] = this.showProtein
        this.function_dict[nglObjectTypes.EVENTMAP] = this.showEvent
        this.function_dict[nglObjectTypes.E_DENSITY] = this.showEDensity
        this.function_dict[nglObjectTypes.HOTSPOT] = this.showHotspot
    }

    showLine(stage, input_dict, object_name){
        var shape = new Shape( object_name );
        shape.addLine()
        var shapeComp = stage.addComponentFromObject(shape);
        shapeComp.addRepresentation("buffer");

    }

    processInt(pickingProxy){
        var atom_id = ""
        if(pickingProxy.object.atom2.resname=="HET") {
            atom_id = "atom1"
        }
        else{
            atom_id = "atom2"
        }
        var atom_name = pickingProxy.object[atom_id].atomname
        var res_name = pickingProxy.object[atom_id].resname
        var chain_name = pickingProxy.object[atom_id].chainname
        var res_num = pickingProxy.object[atom_id].resno
        var tot_name = chain_name+"_"+res_name+"_"+res_num.toString()+"_"+atom_name;
        var mol_int = parseInt(pickingProxy.object.atom1.structure.name.split("COMPLEXLOAD_")[1])
        return {"interaction": tot_name, "complex_id": mol_int}
    }


    showPick(stage, pickingProxy) {
        if (pickingProxy) {
            // For assigning the ligand interaction
            if (pickingProxy.object.type=="hydrogen bond"){
                var input_dict = this.processInt(pickingProxy);
                if (this.props.duck_yank_data["interaction"] != undefined) {
                    this.props.deleteObject({
                        "display_div": "major_view", "name": this.props.duck_yank_data["interaction"] + "_INTERACTION"
                    });
                }
                this.props.setDuckYankData(input_dict)
                this.props.loadObject({
                    "start": pickingProxy.object.center1, "end": pickingProxy.object.center2, radius: 0.2, "display_div": "major_view",
                    "color": [1,0,0], "name": input_dict["interaction"]+"_INTERACTION", "OBJECT_TYPE": nglObjectTypes.ARROW});
            }
            else if (pickingProxy.object.name){
                var name = pickingProxy.object.name
                // Ok so now perform logic
                var type = name.split("_")[0].split("(")[1]
                if (type==listTypes.MOLGROUPS){
                    var pk = parseInt(name.split("_")[1].split(")")[0], 10)
                    this.props.setMolGroupOn(pk)
                }
                else if (type==listTypes.PANDDA_SITE){
                    var pk = parseInt(name.split("_")[1].split(")")[0], 10)
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

    componentDidMount() {
        this.stage = new Stage(this.div_id);
        // Handle window resizing
        var local_stage = this.stage;
        window.addEventListener("resize", function (event) {
           local_stage.handleResize();
        }, false);
        this.stage.mouseControls.add("clickPick-left",this.showPick);
        this.props.setOrientation(
                this.div_id,
                "STARTED"
            )
        this.props.setNGLOrientation(
                this.div_id,
                "SET"
            )
        setInterval(this.updateOrientation,20)
    }

    checkIfLoading(){
        for(var key in this.props.objectsToLoad){
            if(this.props.objectsToLoad[key]["display_div"]==this.div_id){
                this.props.setLoadingState(true)
                return false
            }
        }
        for(var key in this.props.objectsLoading){
            if(this.props.objectsLoading[key]["display_div"]==this.div_id){
                this.props.setLoadingState(true)
                return false
            }
        }
        this.props.setLoadingState(false)
        return true
    }

    componentDidUpdate() {
        this.renderDisplay();
        if (this.props.targetOnName != undefined) {
            document.title = this.props.targetOnName + ": Fragalysis"
        }
    }

    showSphere(stage, input_dict, object_name) {
        var colour = input_dict.colour;
        var radius = input_dict.radius;
        var coords = input_dict.coords;
        var shape = new Shape( object_name );
        shape.addSphere(coords, colour, radius);
        var shapeComp = stage.addComponentFromObject(shape);
        shapeComp.addRepresentation("buffer");
    }

    showMol(stage, input_dict, object_name) {
        var stringBlob = new Blob( [ input_dict.sdf_info ], { type: 'text/plain'} );
        stage.loadFile( stringBlob, { name: object_name,ext: "sdf" } ).then( function( comp ){
            comp.addRepresentation( "ball+stick", { colorScheme: "element", colorValue:input_dict.colour, multipleBond: true }
            );
            comp.autoView("ligand");
        });
    }

    renderComplex(ol) {
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
            // var nglProtStyle = this.props.nglProtStyle
            comp.addRepresentation('cartoon')
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
    };


    showComplex(stage, input_dict, object_name) {
        var stringBlob = new Blob( [ input_dict.sdf_info ], { type: 'text/plain'} );
        Promise.all([
            stage.loadFile(input_dict.prot_url, {ext: "pdb"}),
            stage.loadFile(stringBlob, {ext: "sdf"}),
            stage, this.focus_var, object_name,input_dict.colour]
        ).then( ol => this.renderComplex(ol));
    }

    showEvent(stage, input_dict, object_name) {
        stage.loadFile(input_dict.pdb_info, {name: object_name, ext: "pdb"}).then(function (comp) {
            comp.addRepresentation('cartoon', {});
            var selection = new Selection("LIG");
            var radius = 5;
            var atomSet = comp.structure.getAtomSetWithinSelection(selection, radius);
            var atomSet2 = comp.structure.getAtomSetWithinGroup(atomSet);
            var sele2 = atomSet2.toSeleString();
            var sele1 = atomSet.toSeleString();
            comp.addRepresentation('contact', {
                masterModelIndex: 0,
                weakHydrogenBond: true,
                maxHbondDonPlaneAngle: 35,
                linewidth: 1,
                sele: sele2 + " or LIG"
            });
            comp.addRepresentation("line", {
                sele: sele1
            })
            comp.addRepresentation("ball+stick", {
                sele: "LIG"
            })
            comp.autoView("LIG");
        });

        stage.loadFile(input_dict.map_info, {name: object_name, ext: "ccp4"}).then(function (comp) {
            var surfFofc = comp.addRepresentation('surface', {
                color: 'mediumseagreen',
                isolevel: 3,
                boxSize: 10,
                useWorker: false,
                contour: true,
                opaqueBack: false,
                isolevelScroll: false
            })
            var surfFofcNeg = comp.addRepresentation('surface', {
                color: 'tomato',
                isolevel: 3,
                negateIsolevel: true,
                boxSize: 10,
                useWorker: false,
                contour: true,
                opaqueBack: false,
                isolevelScroll: false
            })
        });
    }

    showEDensity(stage, input_dict, object_name) {
        stage.loadFile(input_dict.map_info, {name: object_name, ext: "ccp4"}).then(function (comp) {
            var surf2Fofc = comp.addRepresentation('surface', {
                color: 'mediumseagreen',
                isolevel: 3,
                boxSize: 10,
                useWorker: false,
                contour: true,
                opaqueBack: false,
                isolevelScroll: false
            })
        });
    }

    showCylinder(stage, input_dict, object_name) {
        var colour = input_dict.colour==undefined ? [1,0,0] : input_dict.colour;
        var radius = input_dict.radius==undefined ? 0.4 : input_dict.radius;
        // Handle undefined start and finish
        if (input_dict.start == undefined || input_dict.end == undefined){
            console.log("START OR END UNDEFINED FOR CYLINDER" + input_dict.toString())
            return;
        }
        var shape = new Shape( object_name, { disableImpostor: true } );
        shape.addCylinder(input_dict.start,input_dict.end, colour, radius);
        var shapeComp = stage.addComponentFromObject(shape);
        shapeComp.addRepresentation("buffer");
    }

    showArrow(stage, input_dict, object_name) {
        var colour = input_dict.colour==undefined ? [1,0,0] : input_dict.colour;
        var radius = input_dict.radius==undefined ? 0.3 : input_dict.radius;
        // Handle undefined start and finish
        if (input_dict.start == undefined || input_dict.end == undefined){
            console.log("START OR END UNDEFINED FOR ARROW " + input_dict.toString())
            return;
        }
        var shape = new Shape( object_name, { disableImpostor: true } );
        shape.addArrow(input_dict.start,input_dict.end, colour, radius);
        var shapeComp = stage.addComponentFromObject(shape);
        shapeComp.addRepresentation("buffer");
    }

    showProtein(stage, input_dict, object_name) {
        stage.loadFile(input_dict.prot_url, {name: object_name, ext: "pdb"}).then(function (comp) {
            comp.addRepresentation(input_dict.nglProtStyle, {});
            comp.autoView();
        });
    }

    showHotspot(stage, input_dict, object_name) {
        if (input_dict.map_type === "AP") {
            stage.loadFile(input_dict.hotUrl, {name: object_name, ext: "dx"}).then(function (comp) {
                comp.addRepresentation("surface", {
                    color: '#FFFF00',
                    isolevelType: "value",
                    isolevel: input_dict.isoLevel,
                    opacity: input_dict.opacity,
                    opaqueBack: false,
                    name: 'surf',
                    disablePicking: input_dict.disablePicking
                });
            });
        }
        else if (input_dict.map_type === "DO") {
            stage.loadFile(input_dict.hotUrl, {name: object_name, ext: "dx"}).then(function (comp) {
                comp.addRepresentation("surface", {
                    isolevelType: "value",
                    isolevel: input_dict.isoLevel,
                    opacity: input_dict.opacity,
                    opaqueBack: false,
                    color: '#0000FF',
                    name: 'surf',
                    disablePicking: input_dict.disablePicking
                });
            });
        }
        else if (input_dict.map_type === "AC") {
            stage.loadFile(input_dict.hotUrl, {name: object_name, ext: "dx"}).then(function (comp) {
                comp.addRepresentation("surface", {
                    color: '#FF0000',
                    isolevelType: "value",
                    isolevel: input_dict.isoLevel,
                    opacity: input_dict.opacity,
                    opaqueBack: false,
                    name: 'surf',
                    disablePicking: input_dict.disablePicking
                });
            });
        }
    }

    getRadius(data) {
        if (data.mol_id == undefined){
            return 5.0
        }
        else if(data.mol_id.length>10){
            return 5.0
        }
        else if(data.mol_id.length>5){
            return 3.0
        }
        else{
            return 2.0
        }
    }

    generateSphere(data, selected=false, listType=listTypes.MOLGROUPS, view="summary_view") {
        var sele = ""
        var color = [0,0,1]
        var getCoords = {}
        getCoords[listTypes.MOLGROUPS] = [data.x_com, data.y_com, data.z_com]
        getCoords[listTypes.PANDDA_SITE] = [data.site_native_com_x, data.site_native_com_y, data.site_native_com_z]
        if(selected){
            sele = "SELECT"
            color = [0,1,0]
        }
        const radius = this.getRadius(data);
        return Object.assign({},
            data,
            {
                "name": listType + sele + "_" + + data.id.toString(),
                "display_div": view,
                "OBJECT_TYPE": nglObjectTypes.SPHERE,
                "coords": getCoords[listType],
                "radius": radius,
                "colour": color
            }
        )
    }

    showSelect(listType, view) {
        var oldGroup = this.data_dict[listType].oldGroupOn;
        var listOn = this.props[this.data_dict[listType].list];
        var onGroup = this.props[this.data_dict[listType].onGroup];

        if ( onGroup && onGroup != oldGroup){
            var old_data;
            var new_data;
            for (var index in listOn){
                if(listOn[index].id==onGroup){
                    new_data = listOn[index];
                }
                if(listOn[index].id==oldGroup) {
                    old_data = listOn[index];
                }
            }
            if (old_data) {
                this.props.deleteObject(this.generateSphere(old_data, true, listType, view));
                this.props.loadObject(this.generateSphere(old_data, false, listType,view));
            }
            // Delete the two old spheres
            this.props.deleteObject(this.generateSphere(new_data, false, listType,view));
            this.props.loadObject(this.generateSphere(new_data, true, listType,view));
            this.data_dict[listType].oldGroupOn = onGroup;
        }
    }


    /**
     * Function to deal with the logic of showing molecules
     */
    renderDisplay() {
        this.stage.viewer.setBackground(this.props.stageColor);
        for(var nglKey in this.props.objectsToLoad){
            var nglObject = this.props.objectsToLoad[nglKey];
            if (this.div_id==nglObject.display_div) {
                this.function_dict[nglObject.OBJECT_TYPE](this.stage,nglObject,nglKey)
                this.props.objectLoading(nglObject);
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
        this.showSelect(listTypes.MOLGROUPS,"summary_view");
        this.showSelect(listTypes.PANDDA_SITE,"pandda_summary");

    }

    updateOrientation() {
        if (this.props.orientationToSet != undefined) {
            if (this.props.orientationToSet[this.div_id] != "SET") {
                if (this.checkIfLoading()==true) {
                    var ori = this.props.orientationToSet[this.div_id]
                    var curr_orient = this.stage.viewerControls.getOrientation();
                    for (var i = 0; i < curr_orient.elements.length; i += 1) {
                        curr_orient.elements[i] = ori.elements[i];
                    }
                    this.stage.viewerControls.orient(curr_orient);
                    this.props.setNGLOrientation(this.div_id, "SET");
                }
            }
        }
        if (this.props.nglOrientations != undefined) {
            if (this.props.nglOrientations[this.div_id] == "REFRESH") {
                if (this.checkIfLoading() == true) {
                    var objectsInThisDiv = {}
                    for (var key in this.props.objectsInView) {
                        if (this.props.objectsInView[key]["display_div"] == this.div_id) {
                            objectsInThisDiv[key] = this.props.objectsInView[key]
                        }
                    }
                    this.props.setOrientation(
                        this.div_id,
                        {
                            "orientation": this.stage.viewerControls.getOrientation(),
                            "components": objectsInThisDiv,
                        }
                    )
                }
            }
        }
        for(var nglKey in this.props.objectsLoading){
            var nglObject = this.props.objectsLoading[nglKey]
            if (this.div_id==nglObject.display_div) {
                if (this.stage.getComponentsByName(nglKey).list.length > 0) {
                    var nglObject = this.props.objectsLoading[nglKey];
                    this.props.loadObjectSuccess(nglObject);
                }
            }
        }
    }

    render(){
        return <div style={{height: this.height}} id={this.div_id}>
           </div>
    }
}

function mapStateToProps(state) {
  return {
      nglOrientations: state.nglReducers.present.nglOrientations,
      orientationToSet: state.nglReducers.present.orientationToSet,
      mol_group_list: state.apiReducers.present.mol_group_list,
      mol_group_on: state.apiReducers.present.mol_group_on,
      pandda_site_on: state.apiReducers.present.pandda_site_on,
      pandda_site_list: state.apiReducers.present.pandda_site_list,
      duck_yank_data: state.apiReducers.present.duck_yank_data,
      objectsToLoad: state.nglReducers.present.objectsToLoad,
      objectsToDelete: state.nglReducers.present.objectsToDelete,
      objectsLoading: state.nglReducers.present.objectsLoading,
      objectsInView: state.nglReducers.present.objectsInView,
      objectsPicked: state.nglReducers.present.objectsPicked,
      loadingState: state.nglReducers.present.loadingState,
      stageColor: state.nglReducers.present.stageColor,
      this_vector_list: state.selectionReducers.present.this_vector_list,
      targetOnName: state.apiReducers.present.target_on_name,
  }
}
const mapDispatchToProps = {
    setMolGroupOn: apiActions.setMolGroupOn,
    selectVector: selectionActions.selectVector,
    setDuckYankData: apiActions.setDuckYankData,
    setNGLOrientation: nglLoadActions.setNGLOrientation,
    setPanddaSiteOn: apiActions.setPanddaSiteOn,
    setOrientation: nglLoadActions.setOrientation,
    objectLoading: nglLoadActions.objectLoading,
    loadObjectSuccess: nglLoadActions.loadObjectSuccess,
    loadObjectFailure: nglLoadActions.loadObjectFailure,
    deleteObject: nglLoadActions.deleteObject,
    loadObject: nglLoadActions.loadObject,
    deleteObjectSuccess: nglLoadActions.deleteObjectSuccess,
    setLoadingState: nglLoadActions.setLoadingState,
    setStageColor: nglRenderActions.setStageColor,
    setHighlighted: selectionActions.setHighlighted,
}
export default connect(mapStateToProps, mapDispatchToProps)(NGLView);