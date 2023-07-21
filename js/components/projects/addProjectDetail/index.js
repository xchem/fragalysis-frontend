import React, { memo, useState, useEffect } from 'react';
import { Grid, makeStyles, FormControlLabel, Checkbox } from '@material-ui/core';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
import { Form, Formik, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import { InputFieldAvatar } from '../projectModal/inputFieldAvatar';
import { Description, Label, Title, QuestionAnswer } from '@material-ui/icons';
import { Autocomplete } from '@material-ui/lab';
import { Button } from '../../common/Inputs/Button';
import { useDispatch, useSelector } from 'react-redux';
import {createProjectFromSnapshotDialog, createProjectDiscoursePost, createProjectFromSnapshot, createProjectFromScratch } from '../redux/dispatchActions';
import { isDiscourseAvailable, getExistingPost, isDiscourseUserAvailable } from '../../../utils/discourse';
import { RegisterNotice } from '../../discourse/RegisterNotice';
import ModalNewProject from '../../common/ModalNewProject';
import moment from 'moment';
import { getListOfSnapshots } from '../../snapshot/redux/dispatchActions';
import { setProjectModalIsLoading } from '../../projects/redux/actions';
import { manageSendTrackingActions } from '../../../reducers/tracking/dispatchActions';
import { setOpenSnapshotSavingDialog } from '../../snapshot/redux/actions';


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

export const AddProjectDetail = memo(({}) => {
  const classes = useStyles();
  const [state, setState] = useState();
  let [createDiscourse, setCreateDiscourse] = useState(true);

  const dispatch = useDispatch();
  const targetId = useSelector(state => state.apiReducers.target_on);
  const targetName = useSelector(state => state.apiReducers.target_on_name);
  const sessionProjectID = useSelector(state => state.projectReducers.currentProject.projectID);
  const isProjectModalLoading = useSelector(state => state.projectReducers.isProjectModalLoading);
  const currentProject = useSelector(state => state.targetReducers.currentProject);

  const [tags, setTags] = React.useState([]);

  const discourseAvailable = isDiscourseAvailable();
  const dicourseUserAvailable = isDiscourseUserAvailable();

  const actualDate = moment().format('-YYYY-MM-DD');

  createDiscourse &= dicourseUserAvailable;

  const validateProjectName = async value => {
    let error;

    if (!value) {
      error = 'Required!';
    } else if (createDiscourse) {
      const response = await getExistingPost(value);
      if (response.data['Post url']) {
        error = 'Already exists!';
      }
    }

    return error;
  };

  const handleCloseModal = () => {
    if (isProjectModalLoading === true) {
      dispatch(setProjectModalIsLoading(false));
    }
  };

  useEffect(() => {
    dispatch(getListOfSnapshots());
  }, [dispatch]);



  return (
    <ModalNewProject open={isProjectModalLoading}>
      <Formik
        initialValues={{
          title: targetName + actualDate,
          description: 'Project created from ' + targetName,
          tags: '',
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
            tags: JSON.stringify(tags),
            project: currentProject?.id
          };

          const oldProjectID = sessionProjectID;
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
                handleCloseModal();
                dispatch(setOpenSnapshotSavingDialog(true));
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
                      disabled={ isSubmitting}
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
                      disabled={isSubmitting}
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
                          onChange={() => setCreateDiscourse(!createDiscourse)}
                          disabled={
                            !discourseAvailable || !dicourseUserAvailable || isProjectModalLoading || isSubmitting
                          }
                          name="createDisTopic"
                        />
                      }
                      label="Create Discourse topic"
                    />
                  }
                />
              </Grid>
              {!dicourseUserAvailable && (
                <Grid item>
                  <RegisterNotice></RegisterNotice>
                </Grid>
              )}
            </Grid>
            <Grid container justify="flex-end" direction="row">
              <Grid item>
                <Button color="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button color="primary" onClick={submitForm} disabled={isSubmitting}>
                  Create
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </ModalNewProject >
  );
});
