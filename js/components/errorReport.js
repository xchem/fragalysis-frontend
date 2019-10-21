/**
 * Created by abradley on 08/10/2018.
 */

import React, { memo } from 'react';
import { Button } from 'react-bootstrap';
// import { showReportDialog } from '@sentry/browser';

export const ErrorReport = memo(() => {
  const reportError = () => {
    // Set a custom user error to invoke sentry
    const uuidv4 = require('uuid/v4');
    throw new Error('Custom user error.' + uuidv4());
  };

  return (
    <Button bsSize="sm" bsStyle="danger" onClick={reportError}>
      Report Error
    </Button>
  );
});
