import "babel-polyfill";
import React from "react";
import {render} from "react-dom";
import Root from "./containers/root";
// Sentry logging
import { init, showReportDialog } from '@sentry/browser';
// Setup log rocket logging
import LogRocket from 'logrocket';
LogRocket.init('afxrm2/fragalysis');
// This is the log rocket setup
LogRocket.identify(DJANGO_CONTEXT["username"], {
    pk: DJANGO_CONTEXT["pk"],
    name: DJANGO_CONTEXT["name"],
    email: DJANGO_CONTEXT["email"]
});
init({
  dsn: 'https://65029677c9dd4a8a94b778cd221efb3d@sentry.io/1286780',
    beforeSend: (event) => {
        // Check if it is a particular type of exception -> Show report dialog
        // E.g. we might not want it show for all exceptions - just custom user ones
      if(event.exception && event.exception.values[0].value.startsWith("Custom user error.")){
          showReportDialog()
      }
      return event;
    }
});

render(
      <Root />, document.getElementById('app')
)