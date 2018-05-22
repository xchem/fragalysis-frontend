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

class SummaryView extends React.Component{
    constructor(props) {
        super(props);
    }

    render(){
        return <div>
            <Well>
                <Row>
                    <h3><b>Current State: \n</b></h3>
                    <h3>Objects In View: {this.props.object_in_view}</h3>
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
      object_in_view: state.nglReducers.object_in_view
  }
}


const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(SummaryView);