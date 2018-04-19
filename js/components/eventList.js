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
