import React, { memo, useState } from 'react';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
import { setCurrentProjectProperty, setProjectModalIsLoading } from '../../projects/redux/actions';
import { api, METHOD } from '../../../utils/api';
import { base_url, URLS } from '../../routes/constants';
import { setDialogCurrentStep } from '../redux/actions';
import { Form, Formik } from 'formik';
import { InputFieldAvatar } from '../../projects/projectModal/inputFieldAvatar';
import { Description, Label, Title } from '@material-ui/icons';
import { TextField } from 'formik-material-ui';
import { Autocomplete } from '@material-ui/lab';
import { Button } from '../../common/Inputs/Button';
import { SnapshotType } from '../../projects/redux/constants';
import { createNewSnapshot } from '../redux/dispatchActions';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  body: {
    width: '100%',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  input: {
    width: 400
  },
  margin: {
    margin: theme.spacing(1)
  },
  formControl: {
    margin: theme.spacing(1),
    width: 400
  }
}));

export const NewSnapshotForm = memo(({ handleCloseModal }) => {
  const classes = useStyles();
  const [state, setState] = useState();
  const dispatch = useDispatch();
  let history = useHistory();

  const currentSnapshot = useSelector(state => state.projectReducers.currentSnapshot);
  const currentProject = useSelector(state => state.projectReducers.currentProject);
  const isLoadingSnapshotDialog = useSelector(state => state.snapshotReducers.isLoadingSnapshotDialog);

  return (
    <>
      <Typography variant="h3">Snapshot details</Typography>
      <Formik
        initialValues={{
          title: '',
          description: '',
          tags: ''
        }}
        validate={values => {
          const errors = {};
          if (!values.title) {
            errors.title = 'Required!';
          }
          if (!values.description) {
            errors.description = 'Required!';
          }
          return errors;
        }}
        onSubmit={values => {
          const title = values.title;
          const description = values.description;
          const type = SnapshotType.MANUAL;
          const author = DJANGO_CONTEXT['pk'] || null;
          const parent = currentSnapshot.id;
          const session_project = currentProject.projectID;

          dispatch(createNewSnapshot({ title, description, type, author, parent, session_project, history }))
            .then(() => {
              // redirect to project with newest created snapshot /:projectID/:snapshotID
              history.push(`${URLS.projects}${session_project}/${currentSnapshot.id}`);
            })
            .catch(error => {
              setState(() => {
                throw error;
              });
            });
        }}
      >
        {({ submitForm }) => (
          <Form>
            <Grid container direction="column" className={classes.body}>
              <Grid item>
                <InputFieldAvatar
                  icon={<Title />}
                  field={
                    <TextField
                      className={classes.input}
                      name="title"
                      label="Title"
                      required
                      disabled={isLoadingSnapshotDialog}
                    />
                  }
                />
              </Grid>
              <Grid item>
                <InputFieldAvatar
                  icon={<Description />}
                  field={
                    <TextField
                      className={classes.input}
                      name="description"
                      label="Description"
                      required
                      disabled={isLoadingSnapshotDialog}
                    />
                  }
                />
              </Grid>
            </Grid>
            <Grid container justify="flex-end" direction="row">
              <Grid item>
                <Button color="secondary" disabled={isLoadingSnapshotDialog} onClick={handleCloseModal}>
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button color="primary" onClick={submitForm} loading={isLoadingSnapshotDialog}>
                  Save snapshot
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </>
  );
});
