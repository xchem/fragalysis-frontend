/**
 * Created by abradley on 14/04/2018.
 */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Row, Col, Grid, Well } from 'react-bootstrap';
import NGLView from '../components/nglComponents';
import UpdateOrientation from '../components/updateOrientation';
import { Route } from 'react-router-dom'


class FraggleDocs extends Component {

    constructor(props) {
        super(props)
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
              <UpdateOrientation uuid={this.props.match.params.uuid} />

          </Row>
      )
    }
}

function mapStateToProps(state) {
  return { }
}


export default connect(mapStateToProps)(FraggleDocs)