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
        this.state = {list_len: 0, cost: 0, num_vectors: 0, num_series: 0, smiles: ""}
    }

    render(){
        return <div>
            <Well>
                <Row>
                <Col xs={6} md={6}>
                    <h3><b>Current State:</b></h3>
                    <h3>Target on? <b>{this.state}</b></h3>
                    <Button bsSize="large" bsStyle="success">Export to CSV</Button>
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
      target_id: state.apiReducers.target_id
  }
}



const mapDispatchToProps = {
    appendToBuyList: selectionActions.appendToBuyList,
    selectVector: selectionActions.selectVector,
    loadObject: nglLoadActions.loadObject
}

export default connect(mapStateToProps, mapDispatchToProps)(SummaryView);