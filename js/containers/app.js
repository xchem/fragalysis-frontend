import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Row, Col, Grid, Well } from 'react-bootstrap';
import Header from '../components/header'; 
import {MyMenu} from '../components/menuView'
import LoadingBar from 'react-redux-loading-bar'
import Tindspect from './tindspectHolder'
import Preview from './previewHolder'
import FraggleDocs from './fraggleDocsHolder';
import { Route, Switch} from 'react-router-dom'

const routes = (
      <div id="outer-container">
          <MyMenu right pageWrapId={ "page-wrap" } outerContainerId={ "outer-container" } /> BEGIN HERE
          <LoadingBar />
          <Grid fluid id="page-wrap">
              <Header></Header>
                  <Switch>
                      <Route exact path="/viewer/react/preview" component={Preview} />
                      <Route exact path="/viewer/react/preview/target/:target" component={Preview} />
                      <Route exact path="/viewer/react/tindspect" component={Tindspect} />
                      <Route path="/viewer/react/fraggledocs/:uuid" component={FraggleDocs} />
                  </Switch>
          </Grid>
      </div>
)

export default routes