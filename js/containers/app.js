import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Row, Col, Grid, Well } from 'react-bootstrap';
import Header from './header'; 
import {MyMenu} from './menuView'
import LoadingBar from 'react-redux-loading-bar'
import Tindspect from '../components/tindspectHolder'

class App extends Component {

    constructor(props) {
        super(props)
  }

  render() {
      return  (
      <div id="outer-container">
          <MyMenu right pageWrapId={ "page-wrap" } outerContainerId={ "outer-container" } /> START HERE
          <LoadingBar />
          <Grid fluid id="page-wrap">
              <Header/>
              <Tindspect></Tindspect>
          </Grid>
      </div>
      )
    }

}

function mapStateToProps(state) {
  return {
      app_on: state.app_reducers.app_on
  }
}


export default connect(mapStateToProps)(App)