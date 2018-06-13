import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Row, Col, Grid, Well } from 'react-bootstrap';
import Header from '../components/header'; 
import {MyMenu} from '../components/menuView'
import LoadingBar from 'react-redux-loading-bar'
import Tindspect from './tindspectHolder'
import Preview from './previewHolder'
import { Route, Switch} from 'react-router-dom'

const routes = (
      <div id="outer-container">
          <MyMenu right pageWrapId={ "page-wrap" } outerContainerId={ "outer-container" } /> START HERE
          <LoadingBar />
          <Grid fluid id="page-wrap">
              <Header/>
                  <Switch>
                      <Route exact path="/" component={Preview} />
                      <Route path="/tindspect" component={Tindspect} />
                  </Switch>
          </Grid>
      </div>
)

export default routes