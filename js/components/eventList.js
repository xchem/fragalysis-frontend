/**
 * Created by abradley on 19/04/2018.
 */
import { GenericList } from './generalComponents';
import React from 'react';
import { connect } from 'react-redux'
import * as apiActions from '../actions/apiActions'
import * as listType from './listTypes'

class EventList extends GenericList {

    constructor(props) {
        super(props);
        this.list_type = listType.PANDDA_EVENT;
        this.old_object = -1;
    }

    handleOptionChange(changeEvent) {
        const new_value = changeEvent.target.value;
        this.props.setObjectOn(new_value);
    }
    render() {
        return null;
    }

}
function mapStateToProps(state) {
  return {
      group_type: state.apiReducers.present.group_type,
      target_on: state.apiReducers.present.target_on,
      event_on: state.apiReducers.present.pandda_event_on,
      pandda_site_on: state.apiReducers.present.pandda_site_on,
      object_list: state.apiReducers.present.pandda_event_list
  }
}
const mapDispatchToProps = {
    setObjectList: apiActions.setPanddaEventList

}
export default connect(mapStateToProps, mapDispatchToProps)(EventList);
