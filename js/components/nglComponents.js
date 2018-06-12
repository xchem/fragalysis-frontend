/**
 * Created by abradley on 01/03/2018.
 */
import { Stage, Shape, concatStructures, Selection } from 'ngl';
import { ListGroupItem, ListGroup, Col} from 'react-bootstrap';
import React from 'react';
import { connect } from 'react-redux'
import * as apiActions from '../actions/apiActions'
import * as nglLoadActions from '../actions/nglLoadActions'
import * as nglRenderActions from '../actions/nglRenderActions'
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
        this.orientationToSet={};
        this.renderDisplay = this.renderDisplay.bind(this);
        this.showPick = this.showPick.bind(this);
        this.generateSphere = this.generateSphere.bind(this);
        this.renderComplex = this.renderComplex.bind(this);
        this.showComplex = this.showComplex.bind(this);
        this.getNglOrientation = this.getNglOrientation.bind(this);
        this.setNglOrientation = this.setNglOrientation.bind(this);
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
    }

    showPick(stage, pickingProxy) {
        if (pickingProxy) {
            if (pickingProxy.object.name){
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
    }

    componentDidUpdate(){
        this.renderDisplay();
        this.getNglOrientation();
        this.setNglOrientation();
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
            comp.addRepresentation("cartoon", {});
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


    showCylinder(stage, input_dict, object_name) {
        var colour = input_dict.colour==undefined ? [1,0,0] : input_dict.colour;
        var radius = input_dict.radius==undefined ? 0.4 : input_dict.radius;
        var coords = input_dict.coords;
        var shape = new Shape( object_name );
        shape.addCylinder(input_dict.start,input_dict.end, colour, radius);
        var shapeComp = stage.addComponentFromObject(shape);
        shapeComp.addRepresentation("buffer");
    }

    showArrow(stage, input_dict, object_name) {
        var colour = input_dict.colour==undefined ? [1,0,0] : input_dict.colour;
        var radius = input_dict.radius==undefined ? 0.3 : input_dict.radius;
        var shape = new Shape( object_name );
        shape.addArrow(input_dict.start,input_dict.end, colour, radius);
        var shapeComp = stage.addComponentFromObject(shape);
        shapeComp.addRepresentation("buffer");
    }

    showProtein(stage, input_dict, object_name) {
        stage.loadFile(input_dict.prot_url, {name: object_name, ext: "pdb"}).then(function (comp) {
            comp.addRepresentation("cartoon", {});
            comp.autoView();
        });
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
                this.props.deleteObject(this.generateSphere(old_data, true, listType,view));
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
        for(var nglKey in this.props.objectsToLoad){
            var nglObject = this.props.objectsToLoad[nglKey];
            if (this.div_id==nglObject.display_div) {
                this.function_dict[nglObject.OBJECT_TYPE](this.stage,nglObject,nglKey)
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
        this.showSelect(listTypes.MOLGROUPS,"summary_view");
        this.showSelect(listTypes.PANDDA_SITE,"pandda_summary");
    }

    getNglOrientation() {
        if (this.props.orientationFlag === true) {
            var currentOrientation = this.stage.viewerControls.getOrientation();
            this.props.getNglOrientation(currentOrientation)
            this.props.requestOrientation(false)
            this.props.confirmOrientationCollection()
        }
    }

    setNglOrientation() {
        if (this.props.orientationToSetFlag == true) {
            var curr_orient = this.stage.viewerControls.getOrientation();
            for (var i = 0; i < curr_orient.elements.length; i += 1) {
                curr_orient.elements[i] = this.props.orientationToSet[i];
            }
            this.stage.viewerControls.orient(curr_orient);
            // No reset the variable in element
            this.props.confirmOrientationCollection();
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
      pandda_site_on: state.apiReducers.pandda_site_on,
      pandda_site_list: state.apiReducers.pandda_site_list,
      objectsToLoad: state.nglReducers.objectsToLoad,
      objectsToDelete: state.nglReducers.objectsToDelete,
      objectsLoading: state.nglReducers.objectsLoading,
      objectsInView: state.nglReducers.objectsInView,
      objectsPicked: state.nglReducers.objectsPicked,
      orientationFlag: state.nglReducers.orientationFlag,
      nglOrientation: state.nglReducers.nglOrientation,
      orientationToSetFlag: state.nglReducers.orientationToSetFlag,
      orientationToSet: state.nglReducers.orientationToSet,
      orientationCollectedFlag: state.nglReducers.orientationCollectedFlag
  }
}
const mapDispatchToProps = {
    setMolGroupOn: apiActions.setMolGroupOn,
    selectVector: selectionActions.selectVector,
    hideLoading: hideLoading,
    setPanddaSiteOn: apiActions.setPanddaSiteOn,
    showLoading: showLoading,
    objectLoading: nglLoadActions.objectLoading,
    loadObjectSuccess: nglLoadActions.loadObjectSuccess,
    loadObjectFailure: nglLoadActions.loadObjectFailure,
    deleteObject: nglLoadActions.deleteObject,
    loadObject: nglLoadActions.loadObject,
    deleteObjectSuccess: nglLoadActions.deleteObjectSuccess,
    requestOrientation: nglRenderActions.requestOrientation,
    getNglOrientation: nglRenderActions.getNglOrientation,
    requestToSetOrientation: nglRenderActions.requestToSetOrientation,
    confirmOrientationCollection: nglRenderActions.confirmOrientationCollection
}
export default connect(mapStateToProps, mapDispatchToProps)(NGLView);
