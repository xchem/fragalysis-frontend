import "babel-polyfill";
import React from "react";
import {render} from "react-dom";
import Root from "./containers/root";
// Setup log rocket logging
import LogRocket from 'logrocket';
LogRocket.init('afxrm2/fragalysis');

render(
      <Root />, document.getElementById('app')
) 