import React from "react";
import {Grid} from "react-bootstrap";
import UserInputCapture from "../components/userInputCapture";

const routes = (
      <div id="outer-container">
          <Grid fluid id="page-wrap">
              {/* switches contains routes to containers!!!! */}
              <UserInputCapture></UserInputCapture>
          </Grid>
      </div>
)

export default routes