import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Row, Col, Grid, Well } from 'react-bootstrap';
import NGLView from './nglComponents';
import MolGroupList from './molGroupList';
import MoleculeList from './moleculeList';
import MolGroupSlider from './molGroupSlider'
import SummaryView from './summaryView';


class Tindspect extends Component {

    constructor(props) {
        super(props)
  }

  render() {
      return (
          <Row >
              <Col xs={0} md={0}>
                  <MolGroupList />
              </Col>
              <Col xs={3} md={3}>
                  <NGLView div_id="summary_view" height="200px"/>
                  <MolGroupSlider />
                  <MoleculeList style={{overflow:scroll}}/>
              </Col>
              <Col xs={5} md={5} >
                  <NGLView div_id="major_view" height="600px"/>
              </Col>
              <Col xs={4} md={4}>
                  <SummaryView />
              </Col>
          </Row>
      )
    }

}

function mapStateToProps(state) {
  return { }
}


export default connect(mapStateToProps)(Tindspect)