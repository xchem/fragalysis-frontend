import "babel-polyfill";
import React from "react";
import {render} from "react-dom";
import Root from "./containers/root";

render(
      <Root />, document.getElementById('app')
) 