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
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    Sentry.configureScope(scope => {
      Object.keys(errorInfo).forEach(key => {
        scope.setExtra(key, errorInfo[key]);
      });
    });
    Sentry.captureException(error);
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
            <Button
              color="primary"
              onClick={() => {
                this.setState({ error: null });
                Sentry.showReportDialog();
              }}
            >
              Report feedback
            </Button>
          </div>
        </Modal>
      </Fragment>
    );
  }
}
