import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Row, Col, Grid, Well } from 'react-bootstrap';
import NGLView from './nglComponents';
import MolGroupList from './molGroupList';
import MoleculeList from './moleculeList';
import MolGroupSlider from './molGroupSlider'
import SummaryView from './summaryView';
import Header from './header'; 
import {MyMenu} from './menuView'
import LoadingBar from 'react-redux-loading-bar'


class Tindspect extends Component {

    constructor(props) {
        super(props)
  }

  render() {
      return  (
      <div id="outer-container">
          <MyMenu right pageWrapId={ "page-wrap" } outerContainerId={ "outer-container" } /> START HERE
          <LoadingBar />
          <Grid fluid style={{paddingTop: "50px"}} id="page-wrap">
              <Header/>
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
          </Grid>
      </div>
      )
    }

}

function mapStateToProps(state) {
  return {  target_on: state.apiReducers.target_on
  }
}


export default connect(mapStateToProps)(Tindspect)