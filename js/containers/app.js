import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Row, Col, Grid, Well } from 'react-bootstrap';
import Header from '../components/header'; 
import {MyMenu} from '../components/menuView'
import LoadingBar from 'react-redux-loading-bar'
import Tindspect from './tindspectHolder'
import Preview from './previewHolder'

class App extends Component {

    constructor(props) {
        super(props)
        this.app_dict = {
            "TINDSPECT": <Tindspect />,
            "PREVIEW": <Preview />
        }
        this.runMe = this.runMe.bind(this);
        this.state = {app_on:this.app_dict.PREVIEW}
    }

    runMe() {
        this.setState(prevState => ({app_on: this.app_dict[this.props.app_on]}));
    }
    componentDidMount() {
        this.runMe();
        setInterval(this.runMe,50);
    }

    render() {
      return  (
      <div id="outer-container">
          <MyMenu right pageWrapId={ "page-wrap" } outerContainerId={ "outer-container" } /> START HERE
          <LoadingBar />
          <Grid fluid id="page-wrap">
              <Header/>
              {this.state.app_on}
          </Grid>
      </div>
      )
    }

}

function mapStateToProps(state) {
  return {
      app_on: state.apiReducers.app_on
  }
}


export default connect(mapStateToProps)(App)