/**
 * Created by abradley on 18/04/2018.
 */
import React from 'react';
import { connect } from 'react-redux';
import * as apiActions from '../actions/apiActions';
import { Slider } from './generalComponents';
import * as nglObjectTypes from './nglObjectTypes';
import * as nglActions from '../actions/nglLoadActions';

class PanddaSlider extends Slider {
  constructor(props) {
    super(props);
    this.slider_name = 'Pandda Site';
  }

  newOption(new_value) {
    if (this.props.event_on != undefined) {
      this.props.deleteObject(
        Object.assign(
          { display_div: 'pandda_major' },
          {
            name: 'EVENTLOAD' + '_' + this.props.event_on.toString(),
            OBJECT_TYPE: nglObjectTypes.EVENTMAP
          }
        )
      );
      this.props.setEventOn(undefined);
    }
  }
}

function mapStateToProps(state) {
  return {
    event_on: state.apiReducers.present.pandda_event_on,
    event_list: state.apiReducers.present.pandda_event_list,
    object_list: state.apiReducers.present.pandda_site_list,
    object_on: state.apiReducers.present.pandda_site_on
  };
}
const mapDispatchToProps = {
  deleteObject: nglActions.deleteObject,
  setObjectOn: apiActions.setPanddaSiteOn,
  setEventOn: apiActions.setPanddaEventOn,
  setObjectList: apiActions.setPanddaEventList
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PanddaSlider);
