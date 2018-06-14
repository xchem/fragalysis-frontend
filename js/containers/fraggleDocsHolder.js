/**
 * Created by abradley on 14/04/2018.
 */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Row, Col, Grid, Well } from 'react-bootstrap';
import NGLView from '../components/nglComponents';
import UpdateOrientation from '../components/updateOrientation';
import { Route } from 'react-router-dom'
import * as nglLoadActions from '../actions/nglLoadActions'


class FraggleDocs extends Component {

    constructor(props) {
        super(props)
  }

    componentDidMount(){
        var uuid = this.props.match.params.uuid;
        this.props.setUuid(uuid);
    }

  render() {
      return (
          <Row >
              <Col xs={2} md={2} >
                  <NGLView div_id="summary_view" height="400px"/>
              </Col>
              <Col xs={10} md={10} >
                  <NGLView div_id="major_view" height="800px"/>
              </Col>
              <UpdateOrientation />
              <modalLoadingScreen/>
          </Row>
      )
    }
}

function mapStateToProps(state) {
  return {
  }
}
const mapDispatchToProps = {
    setUuid: nglLoadActions.setUuid,
}


export default connect(mapStateToProps, mapDispatchToProps)(FraggleDocs)