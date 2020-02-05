import React, { memo, useState } from 'react';
import Modal from '../../common/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { setProjectModalIsLoading, setProjectModalOpen } from '../redux/actions';
import {
  makeStyles,
  Radio,
  Grid,
  Typography,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  FormControlLabel
} from '@material-ui/core';
import { Title, Description, Label, Link } from '@material-ui/icons';
import { Autocomplete } from '@material-ui/lab';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
import { InputFieldAvatar } from './inputFieldAvatar';
import { ProjectCreationType } from '../redux/constants';
import { Formik, Form } from 'formik';
import { TextField, Select, RadioGroup } from 'formik-material-ui';
import { Button } from '../../common/Inputs/Button';
import { api, METHOD } from '../../../utils/api';
import { base_url, URLS } from '../../routes/constants';

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

export const ProjectModal = memo(({ history }) => {
  const classes = useStyles();
  const [state, setState] = useState();

  const dispatch = useDispatch();
  const isProjectModalOpen = useSelector(state => state.projectReducers.isProjectModalOpen);
  const isProjectModalLoading = useSelector(state => state.projectReducers.isProjectModalLoading);
  const targetList = useSelector(state => state.apiReducers.target_id_list);

  const handleCloseModal = () => {
    if (isProjectModalLoading === false) {
      dispatch(setProjectModalOpen(false));
    }
  };

  const [tags, setTags] = React.useState([]);

  return (
    <Modal open={isProjectModalOpen} onClose={handleCloseModal}>
      <Typography variant="h3">Create project</Typography>
      <Formik
        initialValues={{
          type: '',
          title: '',
          description: '',
          targetId: '',
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
          if (values.targetId === '') {
            errors.targetId = 'Required!';
          }
          if (values.type === '') {
            errors.type = 'Type of Project is required!';
          }
          return errors;
        }}
        onSubmit={values => {
          const data = {
            ...values,
            author: {
              username: DJANGO_CONTEXT['username'],
              email: DJANGO_CONTEXT['email']
            },
            tags
          };
          dispatch(setProjectModalIsLoading(true));
          api({ url: `${base_url}/api/project`, method: METHOD.POST, data })
            .then(response => {
              const projectID = response.data.id;
              history.push(`${URLS.projects}${projectID}`);
            })
            .catch(error => {
              setState(() => {
                throw error;
              });
            })
            .finally(() => {
              dispatch(setProjectModalIsLoading(false));
              handleCloseModal();
            });
        }}
      >
        {({ submitForm, errors }) => (
          <Form>
            <Grid container direction="column" className={classes.body}>
              <Grid item>
                <FormControl
                  className={classes.input}
                  error={errors.type !== undefined}
                  required
                  disabled={isProjectModalLoading}
                >
                  <RadioGroup name="type" row>
                    <FormControlLabel
                      value={ProjectCreationType.NEW}
                      control={<Radio disabled={isProjectModalLoading} />}
                      label="New Project"
                      disabled={isProjectModalLoading}
                    />
                    <FormControlLabel
                      value={ProjectCreationType.FROM_SNAPSHOT}
                      control={<Radio disabled={isProjectModalLoading} />}
                      label="From Snapshot"
                      disabled={isProjectModalLoading}
                    />
                  </RadioGroup>
                  {errors.type && <FormHelperText disabled={isProjectModalLoading}>{errors.type}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item>
                <InputFieldAvatar
                  icon={<Title />}
                  field={
                    <TextField
                      className={classes.input}
                      name="title"
                      label="Title"
                      required
                      disabled={isProjectModalLoading}
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
                      disabled={isProjectModalLoading}
                    />
                  }
                />
              </Grid>
              <Grid item>
                <InputFieldAvatar
                  icon={<Link />}
                  field={
                    <FormControl
                      className={classes.input}
                      error={errors.target !== undefined}
                      disabled={isProjectModalLoading}
                    >
                      <InputLabel htmlFor="selected-target" required disabled={isProjectModalLoading}>
                        Target
                      </InputLabel>
                      <Select
                        disabled={isProjectModalLoading}
                        name="targetId"
                        inputProps={{
                          id: 'selected-target'
                        }}
                      >
                        {targetList.map(data => (
                          <MenuItem key={data.id} value={data.id}>
                            {data.title}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText disabled={isProjectModalLoading}>{errors.target}</FormHelperText>
                    </FormControl>
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
                        <TextField
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
    </Modal>
  );
});
