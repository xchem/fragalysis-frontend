/**
 * This component creates a button for reporting new issues and handling them.
 */

import React, { memo, useState, useContext } from 'react';
import { ButtonBase, Grid, makeStyles, Typography } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { ReportProblem, EmojiObjects } from '@material-ui/icons';
import { Button } from '../common/Inputs/Button';
import Modal from '../common/Modal';
import { HeaderContext } from '../header/headerContext';
import { Formik, Form } from 'formik';
import { TextField } from 'formik-material-ui';
import { createIssue } from './githubApi';
import { canCaptureScreen, captureScreen, isFirefox, isChrome } from './browserApi';
import { resetForm, setName, setEmail, setTitle, setDescription } from './redux/actions';
import { useDispatch, useSelector } from 'react-redux';

const useStyles = makeStyles(theme => ({
  buttonGreen: {
    margin: theme.spacing(1),
    color: 'green'
  },
  buttonRed: {
    margin: theme.spacing(1),
    color: 'red'
  },
  input: {
    width: '100%',
    minWidth: '256px'
  },
  body: {
    width: '100%',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  pt: {
    paddingTop: theme.spacing(2)
  },
  link: {
    color: theme.palette.primary.contrastText,
    '&:visited': {
      color: theme.palette.primary.contrastText
    },
    '&:active': {
      color: theme.palette.primary.contrastText
    },
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText
    }
  },
  // https://material-ui.com/components/grid/
  image: {
    width: 312,
    height: 312
  },
  img: {
    margin: 'auto',
    display: 'block',
    maxWidth: '100%',
    maxHeight: '100%'
  }
}));

export const FORM_TYPE = { ISSUE: 'ISSUE', IDEA: 'IDEA' };

export const ReportForm = memo(({ formType }) => {
  const classes = useStyles();
  const [state, setState] = useState();

  const dispatch = useDispatch();
  const formState = useSelector(state => state.issueReducers);
  const { setSnackBarTitle } = useContext(HeaderContext);

  /* Specific form type functions */
  const isValidType = () => {
    let valid = false;
    for (let [key, value] of Object.entries(FORM_TYPE)) {
      if (value === formType) {
        valid = true;
        break;
      }
    }
    return valid;
  };
  const getTitle = () => {
    switch (formType) {
      case FORM_TYPE.ISSUE:
        return 'Report issue';
      case FORM_TYPE.IDEA:
        return 'Submit idea';

      default:
        return 'Unknown report';
    }
  };
  const getCreatedText = () => {
    switch (formType) {
      case FORM_TYPE.IDEA:
        return 'New idea was created: ';
      case FORM_TYPE.ISSUE:

      default:
        return 'New issue was created: ';
    }
  };
  const getLabels = () => {
    switch (formType) {
      case FORM_TYPE.ISSUE:
        return ['issue'];
      case FORM_TYPE.IDEA:
        return ['idea'];

      default:
        return [];
    }
  };
  const getButtonIcon = () => {
    switch (formType) {
      case FORM_TYPE.ISSUE:
        return <ReportProblem />;
      case FORM_TYPE.IDEA:
        return <EmojiObjects />;

      default:
        return <ReportProblem />;
    }
  };
  const getButtonStyle = () => {
    switch (formType) {
      case FORM_TYPE.IDEA:
        return classes.buttonGreen;
      case FORM_TYPE.ISSUE:

      default:
        return classes.buttonRed;
    }
  };

  const afterCreateIssueCallback = url => {
    setSnackBarTitle(
      <>
        {getCreatedText()}
        <a href={url} target="_blank" className={classes.link}>
          {url}
        </a>
      </>
    );
    handleCloseForm();
  };

  /* Modal handlers */
  const [openForm, setOpenForm] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const isResponse = () => {
    return openForm && formState.response.length > 0;
  };

  const handleOpenForm = async () => {
    await dispatch(captureScreen());
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
  };
  const handleSubmitDialog = () => {
    handleCloseDialog();
    handleOpenForm();
  };

  const getHintText = () => {
    let text = 'please choose your window or screen to share';
    if (isFirefox()) {
      text += ' and "Allow" it';
    } else if (isChrome()) {
      text += ', ideally "Chrome tab" and your current tab';
    }
    return text;
  };

  return (
    <div>
      <Button
        startIcon={getButtonIcon()}
        variant="text"
        size="small"
        className={getButtonStyle()}
        onClick={handleOpenDialog}
      >
        {getTitle()}
      </Button>
      <Modal open={openDialog}>
        <Grid container direction="column" className={classes.pt}>
          <Grid item>
            <Typography variant="body1">
              It is helpful to provide a screenshot of your current state, therefore you are going to be prompted by
              browser to do so.
            </Typography>
            <Typography variant="body1">After you proceed, {getHintText()}.</Typography>
          </Grid>
          <Grid container justify="flex-end" direction="row">
            <Grid item>
              <Button onClick={handleCloseDialog}>Cancel</Button>
            </Grid>
            <Grid item>
              <Button color="primary" onClick={handleSubmitDialog}>
                Proceed
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Modal>
      <Modal open={openForm}>
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
            if (values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
              errors.email = 'Invalid email address.';
            }
            return errors;
          }}
          onSubmit={async (values, { setSubmitting }) => {
            await dispatch(createIssue(formState, formType.toLowerCase(), getLabels(), afterCreateIssueCallback));
            setSubmitting(false);
          }}
        >
          {({ submitForm, isSubmitting }) => (
            <Form>
              <Grid container direction="column" className={classes.body}>
                {isResponse() && <Alert severity="error">{formState.response}</Alert>}

                <Grid container direction="row" spacing={2}>
                  <Grid item xs={12} sm container direction="column">
                    <Grid item xs>
                      <Typography variant="h3">{getTitle()}</Typography>
                      <TextField
                        name="name"
                        label="Name"
                        value={formState.name}
                        onInput={e => dispatch(setName(e.target.value))}
                        disabled={isSubmitting}
                        className={classes.input}
                      />
                    </Grid>
                    <Grid item xs>
                      <TextField
                        name="email"
                        label="Email"
                        value={formState.email}
                        onInput={e => dispatch(setEmail(e.target.value))}
                        disabled={isSubmitting}
                        className={classes.input}
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
                        className={classes.input}
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
                        className={classes.input}
                      />
                    </Grid>
                  </Grid>

                  <Grid item>
                    <ButtonBase className={classes.image}>
                      <img className={classes.img} alt="{no image}" src={formState.imageSource} />
                    </ButtonBase>
                  </Grid>
                </Grid>

                <Grid item container justify="flex-end" direction="row">
                  <Grid item>
                    <Button disabled={isSubmitting} onClick={handleCloseForm}>
                      Close
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button color="primary" loading={isSubmitting} onClick={submitForm}>
                      {getTitle()}
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
