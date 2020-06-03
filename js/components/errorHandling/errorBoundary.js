/**
 * Created by abradley on 24/09/2018.
 */
import * as Sentry from '@sentry/browser';
import React, { Fragment, Component } from 'react';
import { Button } from '../common/Inputs/Button';
import Modal from '../common/Modal';

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

    let msg = null;
    if (process.env.NODE_ENV !== 'production' && error !== null) {
      msg = error.toString();
    }

    //render fallback UI
    return (
      <Fragment>
        {children}
        <Modal open={error !== null}>
          <div>
            <h3>Something went wrong - unexpected error. Please contact Fragalysis support!</h3>
            <div>{msg}</div>
            <Button color="primary" onClick={() => this.setState({ error: null })}>
              Close
            </Button>
          </div>
        </Modal>
      </Fragment>
    );
  }
}
