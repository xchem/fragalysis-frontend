import React, { memo, useState } from 'react';
import { Grid, makeStyles, Typography, FormControlLabel, Checkbox } from '@material-ui/core';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
import { Form, Formik, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import { InputFieldAvatar } from '../projectModal/inputFieldAvatar';
import { Description, Label, Title, QuestionAnswer } from '@material-ui/icons';
import { Autocomplete } from '@material-ui/lab';
import { Button } from '../../common/Inputs/Button';
import { useDispatch, useSelector } from 'react-redux';
import { createProjectFromSnapshotDialog, createProjectDiscoursePost } from '../redux/dispatchActions';
import { manageSendTrackingActions } from '../../../reducers/tracking/dispatchActions';
import { isDiscourseAvailable, getExistingPost } from '../../../utils/discourse';

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

export const AddProjectDetail = memo(({ handleCloseModal }) => {
  const classes = useStyles();
  const [state, setState] = useState();
  const [createDiscourse, setCreateDiscourse] = useState(true);

  const dispatch = useDispatch();
  const targetId = useSelector(state => state.apiReducers.target_on);
  const targetName = useSelector(state => state.apiReducers.target_on_name);
  const projectID = useSelector(state => state.projectReducers.currentProject.projectID);
  const isProjectModalLoading = useSelector(state => state.projectReducers.isProjectModalLoading);

  const [tags, setTags] = React.useState([]);

  const discourseAvailable = isDiscourseAvailable();

  const validateProjectName = async value => {
    let error;
    // console.log(`Project title validating and value is: ${value}`);

    if (!value) {
      error = 'Required!';
    } else if (createDiscourse) {
      const response = await getExistingPost(value);
      // console.log(response);
      if (response.data['Post url']) {
        error = 'Already exists!';
      }
    }

    return error;
  };

  return (
    <>
      <Typography variant="h3">Project Details</Typography>
      <Formik
        initialValues={{
          title: '',
          description: '',
          tags: ''
        }}
        validate={values => {
          const errors = {};
          if (!values.description) {
            errors.description = 'Required!';
          } else if (values.description.length < 20) {
            errors.description = 'Description must be at least 20 characters long!';
          }
          return errors;
        }}
        onSubmit={values => {
          const data = {
            title: values.title,
            description: values.description,
            target: targetId,
            author: DJANGO_CONTEXT['pk'] || null,
            tags: JSON.stringify(tags)
          };

          const oldProjectID = projectID;
          if (createDiscourse) {
            dispatch(createProjectDiscoursePost(values.title, targetName, values.description, tags))
              .then(() => dispatch(createProjectFromSnapshotDialog(data)))
              .then(() => dispatch(manageSendTrackingActions(oldProjectID, true)))
              .catch(error => {
                setState(() => {
                  throw error;
                });
              });
          } else {
            dispatch(createProjectFromSnapshotDialog(data))
              .then(() => {
                dispatch(manageSendTrackingActions(oldProjectID, true));
              })
              .catch(error => {
                setState(() => {
                  throw error;
                });
              });
          }
        }}
      >
        {({ submitForm, isSubmitting }) => (
          <Form>
            <Grid container direction="column" className={classes.body}>
              <Grid item>
                <InputFieldAvatar
                  icon={<Title />}
                  field={
                    <Field
                      component={TextField}
                      className={classes.input}
                      name="title"
                      label="Title"
                      required
                      disabled={isProjectModalLoading || isSubmitting}
                      validate={validateProjectName}
                    />
                  }
                />
              </Grid>
              <Grid item>
                <InputFieldAvatar
                  icon={<Description />}
                  field={
                    <Field
                      component={TextField}
                      className={classes.input}
                      name="description"
                      label="Description"
                      required
                      disabled={isProjectModalLoading || isSubmitting}
                    />
                  }
                />
              </Grid>
              <Grid item>
                <InputFieldAvatar
                  icon={<Label />}
                  field={
                    <Autocomplete
                      multiple
                      freeSolo
                      id="tags-standard"
                      options={tags}
                      getOptionLabel={option => option}
                      onChange={(e, data) => {
                        setTags(data);
                      }}
                      disabled={isProjectModalLoading}
                      renderInput={params => (
                        <Field
                          component={TextField}
                          {...params}
                          className={classes.input}
                          label="Tags"
                          name="tags"
                          fullWidth
                          onKeyPress={e => {
                            if (e.key === 'Enter') {
                              setTags([...tags, e.target.value]);
                            }
                          }}
                        />
                      )}
                    />
                  }
                />
              </Grid>
              <Grid item>
                <InputFieldAvatar
                  icon={<QuestionAnswer />}
                  field={
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={createDiscourse}
                          onChange={() => setCreateDiscourse(!createDiscourse)}
                          disabled={!discourseAvailable}
                          name="createDisTopic"
                        />
                      }
                      label="Create Discourse topic"
                    />
                  }
                />
              </Grid>
            </Grid>
            <Grid container justify="flex-end" direction="row">
              <Grid item>
                <Button color="secondary" disabled={isProjectModalLoading} onClick={handleCloseModal}>
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button color="primary" onClick={submitForm} loading={isProjectModalLoading}>
                  Create
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </>
  );
});
