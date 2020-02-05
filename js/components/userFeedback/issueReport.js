/**
 * This component creates a button for reporting new issues and handling them.
 */

import React, { memo, useState } from 'react';
import { Collapse, Grid, makeStyles, TextField, Typography } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { ReportProblem } from '@material-ui/icons'; // EmojiObjects for new idea
import { Button } from '../common/Inputs/Button';
import Modal from '../common/Modal';
import axios from 'axios';

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1)
  },
  input: {
    display: 'none'
  },
  body: {
    width: '100%',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  }
}));

export const IssueReport = memo(() => {
  const classes = useStyles();

  const apiLink = 'https://api.github.com';
  const repository = 'm2ms/fragalysis-frontend';

  const [name, setName] = React.useState(DJANGO_CONTEXT['name'] || '');
  const [email, setEmail] = React.useState(DJANGO_CONTEXT['email'] || '');
  const [title, setTitle] = React.useState('');
  const [description, setDescrition] = React.useState('');

  const createIssue = () => {
    console.log('creating new issue');
    console.log(name, email, title, description);

    setResponse(response.length > 0 ? '' : 'ano');
  };

  const getIssuesLink = () => {
    return apiLink + '/repos/' + repository + '/issues';
  };

  const _setAuthHeader = (xhr) => {
    const token = 'tokenofapp';
    xhr.setRequestHeader('Authorization', 'token ' + token);
  };

  const createGithubIssue = () => {

  		/*if (event.exception && event.exception.values.length > 0) {
  			var title = event.exception.values[0].type + ": " + event.exception.values[0].value
  			var body = "id: " + event.event_id + "\n" + "level: " + event.level + "\n" + "release: " + event.release;

  			event.tags.github_issue = title;

  			// check if same title exists
  			var issues = null;
  			$.ajax({
  			  type: "GET",
  			  url: getIssuesLink(),
  			  beforeSend: _setAuthHeader.bind(this),
  			  success: function(result) {
  				  console.log(result);
  				  var create = true;
  				 if (result.length > 0) {
  					 result.some(item => {
  						 console.log(item.title);
  						 if (item.title == title) {
  							 create = false;
  							 console.log('found!');
  							 return true;
  						 }
  					 });
  				 }
  				if (create) {
  					// create a new issue
  					const payload = {
  					  "title": title,
  					  "body": body,
  					};

  					$.ajax({
  					  type: "POST",
  					  url: getIssuesLink(),
  					  beforeSend: _setAuthHeader.bind(this),
  					  dataType: 'json',
  					  data: JSON.stringify(payload),
  					  success: function(result) {
  						  console.log('created');
  						 console.log(result);
  						 event.extra.github_issue_url = result.html_url;
  					  }
  					});

  				 }
  			  }
  			});
  		}*/

  };

  const [open, setOpen] = React.useState(false);
  const [response, setResponse] = React.useState('');

  const isResponse = () => {
    return open && (response.length > 0);
  };

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
        <Grid container direction="column" className={classes.body}>
          <Typography variant="h3">Report issue</Typography>
          { isResponse() && <Alert severity="info">{response}</Alert> }
          <Grid item>
            <TextField id="issue-name" label="Name" value={name} onInput={e => setName(e.target.value)} />
          </Grid>
          <Grid item>
            <TextField id="issue-email" label="Email" value={email} onInput={e => setEmail(e.target.value)} />
          </Grid>
          <Grid item>
            <TextField id="issue-title" label="Title" value={title} onInput={e => setTitle(e.target.value)} />
          </Grid>
          <Grid item>
            <TextField
              id="issue-description"
              label="Description"
              placeholder="Describe your problem in a detail."
              multiline
              rows="4"
              value={description} onInput={e => setDescrition(e.target.value)}
            />
          </Grid>
        </Grid>
        <Grid container justify="flex-end" direction="row">
          <Grid item>
            <Button
              color="primary"
              onClick={createIssue}
            >
              Report issue
            </Button>
          </Grid>
          <Grid item>
            <Button onClick={handleClose}>
              Close
            </Button>
          </Grid>
        </Grid>
      </Modal>
    </div>
  );
});
