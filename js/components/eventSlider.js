/**
 * Created by abradley on 19/04/2018.
 */
import React from 'react';
import { connect } from 'react-redux'
import * as apiActions from '../actions/apiActions'
import {Slider} from './generalComponents'
import * as nglLoadActions from '../actions/nglLoadActions'
import * as nglObjectTypes from './nglObjectTypes'


class EventSlider extends Slider {

    constructor(props) {
        super(props);
        this.slider_name = "Pandda Event"
        this.old_object = -1;
        this.newOption = this.newOption.bind(this);
        this.generateEventMapObject = this.generateEventMapObject.bind(this);
    }
    
    generateEventMapObject(data){
        // Get the data
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

    newOption(new_value){
        for (var index in this.props.object_list){
            if(this.props.object_list[index].id==new_value){
                // Build the map
                this.props.loadObject(Object.assign({display_div: "pandda_major"}, this.generateEventMapObject(this.props.object_list[index])))
            }
            if(this.props.object_list[index].id==this.props.event_on){
                this.props.deleteObject(Object.assign({display_div: "pandda_major"}, this.generateEventMapObject(this.props.object_list[index])))
            }
        }
    }

}

function mapStateToProps(state) {
  return {
      object_list: state.apiReducers.pandda_event_list,
      object_on: state.apiReducers.pandda_event_on
  }
}
const mapDispatchToProps = {
    setObjectOn: apiActions.setPanddaEventOn,
    setObjectList: apiActions.setPanddaEventList,
    deleteObject: nglLoadActions.deleteObject,
    loadObject: nglLoadActions.loadObject
}
export default connect(mapStateToProps, mapDispatchToProps)(EventSlider);
