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


class MoleculeView extends GenericView {

    constructor(props) {
        super(props);
        this.generateObject = this.generateObject.bind(this);
        this.generateMolObject = this.generateMolObject.bind(this);
        this.getGraph = this.getGraph.bind(this);
        this.getViewUrl = this.getViewUrl.bind(this);
        var base_url = window.location.protocol + "//" + window.location.host
        this.url = new URL(base_url + '/viewer/img_from_mol_pk/' + this.props.data.id + "/")
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
            "prot_url": this.getViewUrl(data.prot_id,"prot_from_pk")
        }
        return nglObject;
    }


    handleVector(json){

        var objList = this.generateObjectList(json);
        objList.forEach(item => this.props.loadObject(item));
        this.props.setVectorList(objList)

    }

    handleClick(e){
        this.setState(prevState => ({isToggleOn: !prevState.isToggleOn}))
        if(this.state.isToggleOn){

            this.props.deleteObject(this.generateMolObject())

            if(e.shiftKey) {
                this.props.deleteObject(this.generateObject())


            }
        }
        else{
            this.props.loadObject(this.generateMolObject())
            if(e.shiftKey) {
                this.props.loadObject(this.generateObject())

                fetch(this.getViewUrl(this.props.data.id,"get_vects_from_pk"))
                    .then(
                        response => response.json(),
                        error => console.log('An error occurred.', error)
                    )
                    .then(json => this.handleVector(json))

                // Set this
                this.props.getFullGraph(this.props.data);
                // Do the query
                fetch(this.getViewUrl(this.props.data.id,"get_graph_from_pk"))
                .then(
                    response => response.text(),
                    error => console.log('An error occurred.', error)
                )
                .then(json => this.props.gotFullGraph(json))


            }
        }
    }

}
function mapStateToProps(state) {
  return {
      currentList: state.apiReducers.possibleMols,
      binList: state.apiReducers.binnedMols,
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