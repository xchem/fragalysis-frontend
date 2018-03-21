/**
 * Created by abradley on 13/03/2018.
 */
import { ListGroupItem, ListGroup, Col} from 'react-bootstrap';
import { GenericList } from './generalComponents';
import React from 'react';
import { connect } from 'react-redux'
import * as apiActions from '../actions/apiActions'
import * as listType from './listTypes'
import * as nglLoadActions from '../actions/nglLoadActions'
import * as nglObjectTypes from '../components/nglObjectTypes'


class MolGroupList extends GenericList {

    constructor(props) {
        super(props);
        this.list_type = listType.MOLGROUPS;
        this.generateObject = this.generateObject.bind(this)

    }
    render() {
        return null
    }

    generateObject(data){
        this.list_type = listType.MOLGROUPS
        // Move this out of this
        var nglObject = {
                "OBJECT_TYPE": nglObjectTypes.SPHERE,
                "name": this.list_type + "_" + data.id.toString(),
                "radius": data.mol_id.length,
                "coords": [data.x_com, data.y_com, data.z_com],
            }
        return nglObject
    }


    beforePush() {
        if(this.props.object_list) {
            this.props.object_list.map(data => this.props.deleteObject(this.generateObject(data)));
        }
     }

    afterPush(object_list){
        if(object_list) {
            object_list.map(data => this.props.loadObject(this.generateObject(data)));
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
      object_list: state.apiReducers.mol_group_list,
      object_on: state.apiReducers.mol_group_on
  }
}
const mapDispatchToProps = {
    setObjectOn: apiActions.setMolGroupOn,
    setObjectList: apiActions.setMolGroupList,
    deleteObject: nglLoadActions.deleteObject,
    loadObject: nglLoadActions.loadObject
}
export default connect(mapStateToProps, mapDispatchToProps)(MolGroupList);
