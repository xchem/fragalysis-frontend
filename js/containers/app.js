import React from "react";
import {Grid} from "react-bootstrap";
import Header from "../components/header";
import Tindspect from "./tindspectHolder";
import Preview from "./previewHolder";
import FraggleBox from "./fraggleBoxHolder";
import Landing from "./landingHolder";
import {Route, Switch} from "react-router-dom";

const routes = (
      <div id="outer-container">
          <Grid fluid id="page-wrap">
              <Header></Header>
                  <Switch>
                      <Route exact path="/viewer/react/landing" component={Landing} />
                      <Route exact path="/viewer/react/preview" component={Preview} />
                      <Route exact path="/viewer/react/preview/target/:target" component={Preview} />
                      <Route exact path="/viewer/react/tindspect" component={Tindspect} />
                      <Route path="/viewer/react/fragglebox/:uuid" component={FraggleBox} />
                  </Switch>
          </Grid>
      </div>
)

export default routes