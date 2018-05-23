/**
 * Created by abradley on 15/03/2018.
 */
import React from 'react';
import { connect } from 'react-redux'
import { Button, Well, Col, Row } from 'react-bootstrap'
import * as selectionActions from '../actions/selectionActions'
import * as nglLoadActions from '../actions/nglLoadActions'
import * as apiActions from '../actions/apiActions'
import CompoundList from './compoundList';
import SummaryCmpd from './SummaryCmpd';
import * as stateActions from '../actions/stateActions'

class SummaryView extends React.Component{
    constructor(props) {
        super(props);
    }

    render(){
        return <div>
            <Well>
                <Row>
                <Col xs={6} md={6}>
                    <h3><b>Current State:</b></h3>
                    <h3>Target on? <b>{this.props.target_on}</b></h3>
                    <h3>Objects in view? <b>{this.props.objects_in_view.length}</b></h3>
                    <h3>Objects to load? <b>{this.props.objects_to_load.length}</b></h3>
                    <Button bsSize="large" bsStyle="success" onClick={alert(this.props.objects_in_view)}>Display State</Button>
                    <Button bsSize="large" bsStyle="success" onClick={this.props.stateSpecify}>Specify State</Button>
                </Col>
                </Row>
            </Well>
        </div>
    }
}
function mapStateToProps(state) {
  return {
      to_buy_list: state.selectionReducers.to_buy_list,
      to_select: state.selectionReducers.to_select,
      this_vector_list: state.selectionReducers.this_vector_list,
      vector_list: state.selectionReducers.vector_list,
      querying: state.selectionReducers.querying,
      to_query: state.selectionReducers.to_query,
      target_on: state.apiReducers.target_on,
      group_type: state.apiReducers.group_type,
      objects_in_view: state.nglReducers.objectsInView,
      objects_to_load: state.nglReducers.objectsToLoad
  }
}

const mapDispatchToProps = {
    stateAlert: stateActions.stateAlert,
    stateSpecify: stateActions.stateSpecify
}

export default connect(mapStateToProps, mapDispatchToProps)(SummaryView);