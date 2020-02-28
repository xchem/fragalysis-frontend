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
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    // You can also log error messages to an error reporting service here
    if (process.env.NODE_ENV === 'production') {
      Sentry.configureScope(scope => {
        Object.keys(errorInfo).forEach(key => {
          scope.setExtra(key, errorInfo[key]);
        });
      });
      Sentry.captureException(error);
    }
  }

  render() {
    const { children } = this.props;
    const { error } = this.state;

    //render fallback UI
    return (
      <>
        {children}
        {error !== null && (
          <HeaderContext.Consumer>
            {({ setSnackBarTitle, setSnackBarColor }) => {
              setSnackBarTitle('Something went wrong!');
              setSnackBarColor(snackbarColors.default);
              return null;
            }}
          </HeaderContext.Consumer>
        )}
      </>
    );
  }
}
