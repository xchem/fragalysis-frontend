import React, { memo, useEffect, useState } from 'react';
import ModalNewProject from '../../common/ModalNewProject';
import { useDispatch, useSelector } from 'react-redux';
import { groupBy } from 'lodash';
import { setProjectModalOpen } from '../redux/actions';
import {
  makeStyles,
  Radio,
  Grid,
  Typography,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  FormControlLabel,
  ListItemText,
  Checkbox,
  NativeSelect
} from '@material-ui/core';
import { Title, Description, Label, Link, QuestionAnswer } from '@material-ui/icons';
import { Autocomplete } from '@material-ui/lab';
import { useHistory } from 'react-router-dom';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
import { InputFieldAvatar } from './inputFieldAvatar';
import { ProjectCreationType, SnapshotProjectType } from '../redux/constants';
import { Formik, Form, Field } from 'formik';
import { TextField, Select, RadioGroup } from 'formik-material-ui';
import { Button } from '../../common/Inputs/Button';
import { getListOfSnapshots } from '../../snapshot/redux/dispatchActions';
import moment from 'moment';
import {
  createProjectFromScratch,
  createProjectFromSnapshot,
  createProjectDiscoursePost
} from '../redux/dispatchActions';
import { isDiscourseAvailable, getExistingPost, isDiscourseUserAvailable } from '../../../utils/discourse';
import { RegisterNotice } from '../../discourse/RegisterNotice';

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
let currantTargetId = 1;

export const ProjectModal = memo(({}) => {
  const classes = useStyles();
  const [state, setState] = useState();
  const [selectedTarget, setSelectedTarget] = useState(false);

  let [createDiscourse, setCreateDiscourse] = useState(true);
  let history = useHistory();

  const dicourseUserAvailable = isDiscourseUserAvailable();
  createDiscourse &= dicourseUserAvailable;

  const dispatch = useDispatch();
  const isProjectModalOpen = useSelector(state => state.projectReducers.isProjectModalOpen);
  const isProjectModalLoading = useSelector(state => state.projectReducers.isProjectModalLoading);
  const listOfProjects = useSelector(state => state.projectReducers.listOfProjects);
  const isLoadingListOfSnapshots = useSelector(state => state.snapshotReducers.isLoadingListOfSnapshots);
  const grouppedListOfSnapshots = groupBy(
    useSelector(state => state.snapshotReducers.listOfSnapshots),
    'session_project.id'
  );
  const targetList = useSelector(state => state.apiReducers.target_id_list);
  const currantProject = useSelector(state => state.targetReducers.currantProject);
  const targetId = useSelector(state => state.apiReducers.target_on);

  const currentTarget = targetList.find(target => target.id === targetId);

  const actualDate = moment().format('-YYYY-MM-DD');

  const findTargetNameForId = id => {
    return targetList.find(target => target.id === id);
  };

  const discourseAvailable = isDiscourseAvailable();

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
    if (isProjectModalLoading === false) {
      dispatch(setProjectModalOpen(false));
    }
  };

  const [tags, setTags] = React.useState([]);

  useEffect(() => {
    dispatch(getListOfSnapshots());
  }, [dispatch]);

  const getProjectTitle = projectID => {
    if (projectID === 'undefined') {
      return SnapshotProjectType.NOT_ASSIGNED;
    }
    const project = listOfProjects.find(item => `${item.id}` === projectID);
    return project && `${project.title} - ${project.description}`;
  };

  let selectedValue = '';
  if (currentTarget?.display_name !== undefined) {
    selectedValue = currentTarget?.display_name;
  }
  targetList.map(target => {
    if (selectedValue === target.title && selectedTarget === false) {
      currantTargetId = target.id;
    }
  });

  const handleChangeTarget = event => {
    setSelectedTarget(true);
    selectedValue = event.target.value;
    targetList.map(target => {
      if (selectedValue === target.title) {
        currantTargetId = target.id;
      }
    });
  };

  return (
    <ModalNewProject open={isProjectModalOpen} onClose={handleCloseModal}>
      <Formik
        initialValues={{
          type: ProjectCreationType.NEW,
          title: currentTarget?.display_name + actualDate,
          description: 'Project created from ' + currentTarget?.display_name,
          targetId: currantTargetId,
          parentSnapshotId: '',
          tags: ''
        }}
        validate={values => {
          const errors = {};
          if (!values.title) {
            errors.title = 'Required!';
          }
          if (!values.description) {
            errors.description = 'Required!';
          } else if (values.description.length < 20) {
            errors.description = 'Description must be at least 20 characters long!';
          }
          if (values.type === ProjectCreationType.FROM_SNAPSHOT && values.parentSnapshotId === '') {
            errors.parentSnapshotId = 'Required!';
          }
          if (values.type === '') {
            errors.type = 'Type of Project is required!';
          }
          return errors;
        }}
        onSubmit={values => {
          const data = {
            title: values.title,
            description: values.description,
            target: currantTargetId,
            author: DJANGO_CONTEXT['pk'],
            tags: JSON.stringify(tags),
            project: currantProject?.id
          };

          // Create from snapshot
          if (values.type === ProjectCreationType.FROM_SNAPSHOT) {
            dispatch(
              createProjectFromSnapshot({
                ...data,
                history,
                parentSnapshotId: values.parentSnapshotId
              })
            )
              .then(() => {
                if (createDiscourse) {
                  const target = findTargetNameForId(values.targetId);
                  if (target) {
                    dispatch(createProjectDiscoursePost(values.title, target.title, values.description, tags));
                  }
                }
              })
              .catch(error => {
                setState(() => {
                  throw error;
                });
              })
              .finally(() => {
                handleCloseModal();
              });
          }

          // Create from scratch
          if (values.type === ProjectCreationType.NEW) {
            dispatch(
              createProjectFromScratch({
                ...data,
                history
              })
            )
              .then(() => {
                if (createDiscourse) {
                  const target = findTargetNameForId(values.targetId);
                  if (target) {
                    dispatch(createProjectDiscoursePost(values.title, target.title, values.description, tags));
                  }
                }
              })
              .catch(error => {
                setState(() => {
                  throw error;
                });
              })
              .finally(() => {
                handleCloseModal();
              });
          }
        }}
      >
        {({ submitForm, isSubmitting, errors, values }) => (
          <Form>
            <Grid container direction="column" className={classes.body}>
              <Grid item>
                <FormControl
                  className={classes.input}
                  error={errors.type !== undefined}
                  required
                  disabled={isProjectModalLoading}
                >
                  <Form component={RadioGroup} name="type" row>
                    <FormControlLabel
                      value={ProjectCreationType.NEW}
                      control={<Radio disabled={isProjectModalLoading} checked={true} />}
                      label="New Project"
                      disabled={isProjectModalLoading}
                    />
                    {/* <FormControlLabel
                      value={ProjectCreationType.FROM_SNAPSHOT}
                      control={<Radio disabled={isProjectModalLoading} />}
                      label="From Snapshot"
                      disabled={isProjectModalLoading}
                    /> */}
                  </Form>
                  {errors.type && <FormHelperText disabled={isProjectModalLoading}>{errors.type}</FormHelperText>}
                </FormControl>
              </Grid>
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
                      disabled={isProjectModalLoading}
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
                      disabled={isProjectModalLoading}
                    />
                  }
                />
              </Grid>
              {values && values.type === ProjectCreationType.NEW && (
                <Grid item>
                  <InputFieldAvatar
                    icon={<Link />}
                    field={
                      <FormControl
                        className={classes.input}
                        error={errors.targetId !== undefined}
                        disabled={isProjectModalLoading}
                      >
                        <InputLabel htmlFor="selected-target" required disabled={isProjectModalLoading}>
                          Target
                        </InputLabel>
                        <NativeSelect
                          defaultValue={currentTarget?.display_name}
                          onChange={() => handleChangeTarget(event)}
                        >
                          {targetList.map(data => (
                            <option key={data.id} defaultValue={currentTarget?.display_name}>
                              {data.display_name}
                            </option>
                          ))}
                        </NativeSelect>
                        <FormHelperText disabled={isProjectModalLoading}>{errors.targetId}</FormHelperText>
                      </FormControl>
                    }
                  />
                </Grid>
              )}
              {values && values.type === ProjectCreationType.FROM_SNAPSHOT && (
                <Grid item>
                  <InputFieldAvatar
                    icon={<Link />}
                    field={
                      <FormControl
                        className={classes.input}
                        error={errors.parentSnapshotId !== undefined}
                        disabled={isLoadingListOfSnapshots}
                      >
                        <InputLabel htmlFor="selected-parent-snapshot-id" required disabled={isLoadingListOfSnapshots}>
                          From Snapshot
                        </InputLabel>
                        <Form
                          component={Select}
                          disabled={isLoadingListOfSnapshots}
                          name="parentSnapshotId"
                          inputProps={{
                            id: 'selected-parent-snapshot-id'
                          }}
                        >
                          {Object.keys(grouppedListOfSnapshots).map((projectID, index) =>
                            grouppedListOfSnapshots[projectID].map(snapshot => (
                              <MenuItem key={snapshot.id} value={snapshot.id}>
                                <ListItemText
                                  primary={`${snapshot.id} - ${snapshot.title}, ${moment(snapshot.created).format(
                                    'LLL'
                                  )}`}
                                  secondary={getProjectTitle(projectID)}
                                />
                              </MenuItem>
                            ))
                          )}
                        </Form>
                        <FormHelperText disabled={isLoadingListOfSnapshots}>{errors.parentSnapshotId}</FormHelperText>
                      </FormControl>
                    }
                  />
                </Grid>
              )}
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
                          onChange={() => {
                            setCreateDiscourse(!createDiscourse);
                          }}
                          name="createDisTopic"
                          disabled={
                            !discourseAvailable || !dicourseUserAvailable || isProjectModalLoading || isSubmitting
                          }
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
            <Grid container justifyContent="flex-end" direction="row">
              <Grid item>
                <Button color="secondary" disabled={isProjectModalLoading || isSubmitting} onClick={handleCloseModal}>
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button color="primary" onClick={submitForm} disabled={isSubmitting} loading={isProjectModalLoading}>
                  Create
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </ModalNewProject>
  );
});
