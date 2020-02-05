/**
 * This component creates a button for reporting new issues and handling them.
 */

import React, { memo, useState } from 'react';
import { makeStyles, TextField } from '@material-ui/core';
import { ReportProblem } from '@material-ui/icons';
import { Button } from '../common/Inputs/Button';
import Modal from '../common/Modal';

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1)
  },
  input: {
    display: 'none'
  }
}));

export const IssueReport = memo(() => {
  const classes = useStyles();

  const createIssue = () => {
    console.log('creating new issue');
    // ReactDOM.render(<UserFeedbackForm/>, document.getElementById('root'));
  };

  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button
        startIcon={<ReportProblem />}
        variant="text"
        size="small"
        className={classes.button}
        onClick={handleOpen}
        >
        Report issue
      </Button>
      <Modal open={open} onClose={handleClose} >
        <div>
          <h3>Report issue</h3>
          <TextField id="issue-name" label="Name" />
          <br /><TextField id="issue-email" label="Email" />
          <br /><TextField id="issue-title" label="Title" />
          <br /><TextField
            id="issue-description"
            label="Description"
            placeholder="Describe your problem in a detail."
            multiline
            rows="4"
          />
          <br /><Button
            color="primary"
            onClick={createIssue}
          >
            Report issue
          </Button>
          <Button onClick={handleClose}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
});
