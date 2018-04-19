/**
 * Created by abradley on 18/04/2018.
 */
import React from 'react';
import { connect } from 'react-redux'
import * as apiActions from '../actions/apiActions'
import {Slider} from './generalComponents'


class PanddaSlider extends Slider{

    constructor(props) {
        super(props);
        this.slider_name = "Pandda Site"
    }


    newOption(new_value){
        if(this.props.event_on!=undefined) {
            for (var index in this.props.event_list) {
                if (this.props.event_list[index].id == this.props.event_on) {
                    this.props.deleteObject(Object.assign({display_div: "pandda_major"}, this.generateEventMapObject(this.props.event_list[index])))
                }
            }
            this.props.setEventOn(undefined);
        }
    }
}

function mapStateToProps(state) {
  return {
      event_on: state.apiReducers.pandda_event_on,
      event_list: state.apiReducers.pandda_event_list,
      object_list: state.apiReducers.pandda_site_list,
      object_on: state.apiReducers.pandda_site_on
  }
}
const mapDispatchToProps = {
    setObjectOn: apiActions.setPanddaSiteOn,
    setEventOn: apiActions,
    setObjectList: apiActions.setPanddaEventList
}
export default connect(mapStateToProps, mapDispatchToProps)(PanddaSlider);
