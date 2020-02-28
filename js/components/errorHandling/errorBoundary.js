/**
 * Created by abradley on 24/09/2018.
 */
import * as Sentry from '@sentry/browser';
import React, { Component } from 'react';

import { HeaderContext } from '../header/headerContext';
import { snackbarColors } from '../header/constants';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { caughtError: null, errorInfo: null };
  }

  handleErrorData(error, errorInfo) {
    // You can also log error messages to an error reporting service here
    if (process.env.NODE_ENV === 'production') {
      if (errorInfo) {
        Sentry.configureScope(scope => {
          Object.keys(errorInfo).forEach(key => {
            scope.setExtra(key, errorInfo[key]);
          });
        });
      }
      Sentry.captureException(error);
    }
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      caughtError: error,
      errorInfo: errorInfo
    });
    this.handleErrorData(error, errorInfo);
  }

  render() {
    const { children } = this.props;
    const { caughtError } = this.state;

    //render fallback UI
    return (
      <>
        {children}
        <HeaderContext.Consumer>
          {({ error, setSnackBarTitle, setSnackBarColor }) => {
            if (error || caughtError !== null) {
              if (error) {
                //    this.handleErrorData(error);
              }
              setSnackBarTitle('Something went wrong!');
              setSnackBarColor(snackbarColors.error);
            }
            return null;
          }}
        </HeaderContext.Consumer>
      </>
    );
  }
}
