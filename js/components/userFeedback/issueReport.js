/**
 * This component creates a button for reporting new issues and handling them.
 */

import React, { memo, useState, useContext } from 'react';
import { ButtonBase, Grid, makeStyles, Typography } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { ReportProblem } from '@material-ui/icons'; // EmojiObjects for new idea
import { Button } from '../common/Inputs/Button';
import Modal from '../common/Modal';
import { HeaderContext } from '../header/headerContext';
import { Formik, Form } from 'formik';
import { TextField } from 'formik-material-ui';
import { createIssue } from './githubApi';
import { canCaptureScreen, captureScreen, isFirefox, isChrome } from './browserApi';
import {
  resetForm,
  setName,
  setEmail,
  setTitle,
  setDescription
} from './redux/actions';
import { useDispatch, useSelector } from 'react-redux';

import './css/styles.css';

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1),
    color: 'red'
  },
  input: {
    width: '100%'
  },
  body: {
    width: '100%',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  pt: {
    paddingTop: theme.spacing(2)
  },
  // https://material-ui.com/components/grid/
  image: {
    width: 256,
    height: 256
  },
  img: {
    margin: 'auto',
    display: 'block',
    maxWidth: '100%',
    maxHeight: '100%'
  }
}));

export const IssueReport = memo(() => {
  const classes = useStyles();
  const [state, setState] = useState();

  const dispatch = useDispatch();
  const formState = useSelector(state => state.issueReducers);
  const { setSnackBarTitle } = useContext(HeaderContext);

  const afterCreateIssueCallback = (url) => {
    setSnackBarTitle(<>
      {'Issue was created: '}<a href={url} target='_blank'>{url}</a>
    </>);
    handleCloseForm();
  };

  /* Modal handlers */
  const [openForm, setOpenForm] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const isResponse = () => {
    return openForm && formState.response.length > 0;
  };

  const handleOpenForm = async () => {
    await captureScreen(dispatch);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    dispatch(resetForm());
  };

  const handleOpenDialog = () => {
    if (canCaptureScreen()) {
      setOpenDialog(true);
    } else {
      handleOpenForm(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    handleOpenForm();
  };

  const getHintText = () => {
    let text = 'please choose your window or screen to share';
    if (isFirefox()) {
      console.log('firefox');
      text += ' and "Allow" it';
    } else if (isChrome()) {
      console.log('chrome');
      text += ', ideally "Chrome tab" and your current tab';
    }
    return text;
  };

  return (
    <div>
      <Button startIcon={<ReportProblem />} variant="text" size="small" className={classes.button} onClick={handleOpenDialog}>
        Report issue
      </Button>
      <Modal open={openDialog} onClose={handleCloseDialog}>
        <Grid container direction="column" className={classes.pt}>
          <Grid item>
            <Typography variant="body1">It is helpful to provide a screenshot of your current state, therefore you are going to be prompted by browser to do so.</Typography>
            <Typography variant="body1">After you proceed, {getHintText()}.</Typography>
          </Grid>
          <Grid container justify="flex-end" direction="row">
            <Grid item>
              <Button color="primary" onClick={handleCloseDialog}>
                Proceed
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Modal>
      <Modal open={openForm} onClose={handleCloseForm}>
        <Formik
          initialValues={{
            name: formState.name,
            email: formState.email,
            title: formState.title,
            description: formState.description
          }}
          validate={values => {
            const errors = {};
            if (!values.title) {
              errors.title = 'Required field.';
            }
            if (!values.description) {
              errors.description = 'Required field.';
            }
            if (values.email &&
              !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)
            ) {
              errors.email = 'Invalid email address.';
            }
            return errors;
          }}
          onSubmit={async (values, { setSubmitting }) => {
            await createIssue(formState, dispatch, afterCreateIssueCallback);
            setSubmitting(false);
          }}
        >

          {({ submitForm, isSubmitting }) => (
            <Form>
              <Grid container direction="column" className={classes.body}>
                <Typography variant="h3">Report issue</Typography>
                {isResponse() && <Alert severity="error">{formState.response}</Alert>}

                <Grid container direction="row" spacing={2} className={classes.input}>
                  <Grid item xs={12} sm container>
                    <Grid item xs container direction="column" className={classes.input}>
                      <Grid item xs>
                        <TextField
                          name="name"
                          label="Name"
                          value={formState.name}
                          onInput={e => dispatch(setName(e.target.value))}
                          disabled={isSubmitting}
                        />
                      </Grid>
                      <Grid item xs>
                        <TextField
                          name="email"
                          label="Email"
                          value={formState.email}
                          onInput={e => dispatch(setEmail(e.target.value))}
                          disabled={isSubmitting}
                        />
                      </Grid>
                      <Grid item xs>
                        <TextField
                          required
                          name="title"
                          label="Title"
                          value={formState.title}
                          onInput={e => dispatch(setTitle(e.target.value))}
                          disabled={isSubmitting}
                        />
                      </Grid>
                      <Grid item xs>
                        <TextField
                          required
                          name="description"
                          label="Description"
                          placeholder="Describe your problem in a detail."
                          multiline
                          rows="4"
                          value={formState.description}
                          onInput={e => dispatch(setDescription(e.target.value))}
                          disabled={isSubmitting}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item>
                    <ButtonBase className={classes.image}>
                      <img className={classes.img} alt="complex" src={formState.imageSource} />
                    </ButtonBase>
                  </Grid>
                </Grid>

                <Grid container justify="flex-end" direction="row">
                  <Grid item>
                    <Button disabled={isSubmitting} onClick={handleCloseForm}>Close</Button>
                  </Grid>
                  <Grid item>
                    <Button color="primary" disabled={isSubmitting} onClick={submitForm}>
                      Report issue
                    </Button>
                  </Grid>
                </Grid>

              </Grid>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
});
