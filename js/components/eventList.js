/**
 * Created by abradley on 19/04/2018.
 */
import { ListGroupItem, ListGroup, Col, Row, Well} from 'react-bootstrap';
import { GenericList } from './generalComponents';
import React from 'react';
import { connect } from 'react-redux'
import * as apiActions from '../actions/apiActions'
import * as listType from './listTypes'
import * as nglLoadActions from '../actions/nglLoadActions'
import * as nglObjectTypes from './nglObjectTypes'

class EventList extends GenericList {

    constructor(props) {
        super(props);
        this.list_type = listType.PANDDA_EVENT;
        this.old_object = -1;
        this.loadMap = this.loadMap.bind(this);
    }

    handleOptionChange(changeEvent) {
        const new_value = changeEvent.target.value;
        this.props.setObjectOn(new_value);
        this.loadMap(new_value)
    }
    render() {
        return null;
    }

    generateEventMapObject(){
        // Get the data
        const data = this.props.data;
        var nglObject = {
            "name": "EVENTLOAD" + "_" + data.id.toString(),
            "OBJECT_TYPE":nglObjectTypes.EVENTMAP,
            "map_info": data.small_map_info,
            "xtal": data.xtal,
            "lig_id": data.lig_id,
            "pdb_info": data.pdb_info
        }
        return nglObject;
    }
    

    loadMap(new_value){
        for (var index in this.props.object_list){
            if(this.props.object_list.id==new_value){
                    // Build the map
                    this.props.loadObject(Object.assign({display_div: "pandda_major"}, this.generateEventObject()))
            }
        }
    }


}
function mapStateToProps(state) {
  return {
      group_type: state.apiReducers.group_type,
      target_on: state.apiReducers.target_on,
      event_on: state.apiReducers.pandda_event_on,
      pandda_site_on: state.apiReducers.pandda_site_on,
      object_list: state.apiReducers.pandda_event_list
  }
}
const mapDispatchToProps = {
    setObjectList: apiActions.setPanddaEventList,
    deleteObject: nglLoadActions.deleteObject,
    loadObject: nglLoadActions.loadObject

}
export default connect(mapStateToProps, mapDispatchToProps)(EventList);
