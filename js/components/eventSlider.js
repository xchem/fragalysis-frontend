/**
 * Created by abradley on 19/04/2018.
 */
import React from 'react';
import { connect } from 'react-redux'
import * as apiActions from '../actions/apiActions'
import {Slider} from './generalComponents'


class EventSlider extends Slider {

    constructor(props) {
        super(props);
        this.slider_name = "Pandda Event"
        this.old_object = -1;
        this.newOption = this.newOption.bind(this);
        this.generateEventMapObject = this.generateEventMapObject.bind(this);
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

    newOption(new_value){
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
      object_list: state.apiReducers.pandda_event_list,
      object_on: state.apiReducers.pandda_event_on
  }
}
const mapDispatchToProps = {
    setObjectOn: apiActions.setPanddaEventOn,
    setObjectList: apiActions.setPanddaEventList
}
export default connect(mapStateToProps, mapDispatchToProps)(EventSlider);
