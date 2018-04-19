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
        this.slider_name = "Pandda Site"
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
