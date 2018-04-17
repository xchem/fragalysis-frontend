/**
 * Created by abradley on 17/04/2018.
 */

import { ListGroupItem, ListGroup, Col} from 'react-bootstrap';
import { GenericList } from './generalComponents';
import React from 'react';
import { connect } from 'react-redux'
import * as apiActions from '../actions/apiActions'
import * as listType from './listTypes'
import * as nglLoadActions from '../actions/nglLoadActions'
import * as nglObjectTypes from '../components/nglObjectTypes'


class PanddaSiteList extends GenericList {

    constructor(props) {
        super(props);
        this.list_type = listType.PANDDA_SITE;
        this.generateObject = this.generateObject.bind(this);
    }
    render() {
        return "HELLO MOTO";
    }

    loadFromServer() {
        const url = this.getUrl();
        if(url.toString() != this.old_url) {
            this.beforePush();
            fetch(url)
                .then(
                    response => response.json(),
                    error => console.log('An error occurred.', error)
                )
                .then(json => this.props.setObjectList(this.processResults(json)))
        }
        this.old_url = url.toString();
    }

    generateObject(data,selected=false){
        this.list_type = listType.PANDDA_SITE;
        var sele = "";
        var colour = [0,0,1];
        var radius;
        if(data.mol_id.length>10){
            radius = 6.0
        }
        else if(data.mol_id.length>5){
            radius = 4.0
        }
        else{
            radius = 2.0
        }
        if(selected){
            sele = "SELECT"
            colour = [0,1,0]
        }
        // Move this out of this
        var nglObject = {
            "OBJECT_TYPE": nglObjectTypes.SPHERE,
            "name": this.list_type + sele + "_" + + data.id.toString(),
            "radius": radius,
            "colour": colour,
            "coords": [data.x_com, data.y_com, data.z_com],
            }
        return nglObject
    }


    beforePush() {
        // Delete of them in the PANDDA VIEW
        if(this.props.object_list) {
            this.props.object_list.map(data => this.props.deleteObject(Object.assign({display_div: "summary_view"}, this.generateObject(data))));
        }
     }

    afterPush(object_list){
        if(object_list) {
            object_list.map(data => this.props.loadObject(Object.assign({display_div: "summary_view"}, this.generateObject(data))));
        }
    }

    handleOptionChange(changeEvent) {
        const new_value = changeEvent.target.value;
        this.props.setObjectOn(new_value);
    }
}
function mapStateToProps(state) {
  return {
      group_type: state.apiReducers.group_type,
      target_on: state.apiReducers.target_on,
      object_list: state.apiReducers.pandda_event_list,
      object_on: state.apiReducers.pandda_site_on
  }
}
const mapDispatchToProps = {
    setObjectOn: apiActions.setPanddaSiteOn,
    setObjectList: apiActions.setPanddaSiteList,
    deleteObject: nglLoadActions.deleteObject,
    loadObject: nglLoadActions.loadObject
}
export default connect(mapStateToProps, mapDispatchToProps)(PanddaSiteList);
