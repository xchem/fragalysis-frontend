import React, { memo, useState } from 'react';
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  makeStyles,
  MenuItem,
  Radio,
  Typography
} from '@material-ui/core';
import Modal from '../../common/Modal';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
import { setCurrentProjectProperty, setProjectModalIsLoading, setProjectModalOpen } from '../redux/actions';
import { api, METHOD } from '../../../utils/api';
import { base_url, URLS } from '../../routes/constants';
import { Form, Formik } from 'formik';
import { RadioGroup, Select, TextField } from 'formik-material-ui';
import { ProjectCreationType } from '../redux/constants';
import { InputFieldAvatar } from '../projectModal/inputFieldAvatar';
import { Description, Label, Link, Title } from '@material-ui/icons';
import { Autocomplete } from '@material-ui/lab';
import { Button } from '../../common/Inputs/Button';
import { useDispatch, useSelector } from 'react-redux';
import { setDialogCurrentStep } from '../../snapshot/redux/actions';

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

export const AddProjectDetail = memo(() => {
  const classes = useStyles();
  const [state, setState] = useState();

  const dispatch = useDispatch();
  const targetId = useSelector(state => state.apiReducers.target_on);

  const [tags, setTags] = React.useState([]);

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
          if (!values.title) {
            errors.title = 'Required!';
          }
          if (!values.description) {
            errors.description = 'Required!';
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
          dispatch(setProjectModalIsLoading(true));
          api({ url: `${base_url}/api/session-projects/`, method: METHOD.POST, data })
            .then(response => {
              const projectID = response.data.id;
              dispatch(setCurrentProjectProperty('projectID', projectID));
            })
            .catch(error => {
              setState(() => {
                throw error;
              });
            })
            .finally(() => {
              dispatch(setDialogCurrentStep(1));
            });
        }}
      >
        {({ submitForm, errors }) => (
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
                      //    disabled={isProjectModalLoading}
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
                      //    disabled={isProjectModalLoading}
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
                      // disabled={isProjectModalLoading}
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
                <Button
                  color="secondary" //disabled={isProjectModalLoading} onClick={handleCloseModal}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button
                  color="primary"
                  onClick={submitForm} //loading={isProjectModalLoading}
                >
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
