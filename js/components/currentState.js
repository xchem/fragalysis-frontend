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
                    <h3><b>Current State: </b></h3>
                </Row>
                <Row>
                    <h3>Target: {this.props.target_on}</h3>
                </Row>
                <Row>
                    <Button bsSize="large" bsStyle="success" onClick={this.props.display_state}>Display State</Button>
                </Row>
/*                <Row>
                     <Button type="button" className={classes.modalButton} onClick={() => this.handleLoadState()}>Load State</Button>
                </Row>
*/            </Well>
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
      target_on: state.apiReducers.target_on
  }
}


const mapDispatchToProps = {
    display_state: state.displayStateReducers.display_state
}

export default connect(mapStateToProps, mapDispatchToProps)(SummaryView);