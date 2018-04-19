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
import EventView from './eventView';

const eventStyle = {
    overflow:"scroll"}
class EventList extends GenericList {

    constructor(props) {
        super(props);
        this.list_type = listType.PANDDA_EVENT;
    }

    handleOptionChange(changeEvent) {
        const new_value = changeEvent.target.value;
        this.props.setObjectOn(new_value);
    }
    render() {
        if (this.props != undefined && this.props.object_list) {
            console.log(this.props.message)
            return <Well><Row style={eventStyle}>
                {
                    this.props.object_list.map((data) => <EventView key={data.id} data={data}/>)
                }
            </Row></Well>;
        }
        else {
            return null;
        }
    }

}
function mapStateToProps(state) {
  return {
      group_type: state.apiReducers.group_type,
      target_on: state.apiReducers.target_on,
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
