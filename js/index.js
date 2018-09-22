import "babel-polyfill";
import React from "react";
import {render} from "react-dom";
import Root from "./containers/root";
// Setup log rocket logging
import LogRocket from 'logrocket';
LogRocket.init('afxrm2/fragalysis');
// This is an example script - don't forget to change it!
LogRocket.identify(DJANGO_CONTEXT["username"], {
    pk: DJANGO_CONTEXT["pk"],
    name: DJANGO_CONTEXT["name"],
    email: DJANGO_CONTEXT["email"]
});


render(
      <Root />, document.getElementById('app')
) 