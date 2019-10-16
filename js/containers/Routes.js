import React, { memo } from 'react';
import { Grid } from 'react-bootstrap';
import Header from '../components/header';
import { ErrorView } from '../components/errorComponent';
import { Route, Switch } from 'react-router-dom';
import TargetManagement from './targetManagementHolder';
import Tindspect from './Tindspect';
import Landing from './Landing';
import Preview from './Preview';
import Sessions from './sessionHolder';
import FraggleBox from './fraggleBoxHolder';
import Funders from './fundersHolder';

const Routes = memo(() => (
  <div id="outer-container">
    <Grid fluid id="page-wrap">
      <Header />
      <ErrorView />
      <Switch>
        <Route exact path="/viewer/react/targetmanagement" component={TargetManagement} />
        <Route exact path="/viewer/react/fraginpect" component={Tindspect} />
        <Route exact path="/viewer/react/landing" component={Landing} />
        <Route exact path="/viewer/react/preview" component={Preview} />
        <Route exact path="/viewer/react/preview/target/:target" component={Preview} />
        <Route exact path="/viewer/react/sessions" component={Sessions} />
        <Route path="/viewer/react/fragglebox/:uuid" component={FraggleBox} />
        <Route path="/viewer/react/snapshot/:snapshotUuid" component={FraggleBox} />
        <Route exact path="/viewer/react/funders" component={Funders} />
      </Switch>
    </Grid>
  </div>
));

export default Routes;
