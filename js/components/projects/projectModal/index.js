import React, { memo } from 'react';
import Modal from '../../common/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { resetProjectState, setProjectModalOpen } from '../redux/actions';
import {
  makeStyles,
  RadioGroup,
  Radio,
  Grid,
  Typography,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText
} from '@material-ui/core';
import { Title, Description, Label, Link } from '@material-ui/icons';
import { Autocomplete } from '@material-ui/lab';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
import { InputFieldAvatar } from './inputFieldAvatar';
import { ProjectCreationType } from '../redux/constants';
import { Formik, Form } from 'formik';
import { TextField, Select } from 'formik-material-ui';
import { Button } from '../../common/Inputs/Button';

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

export const ProjectModal = memo(({}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const isProjectModalOpen = useSelector(state => state.projectReducers.isProjectModalOpen);
  const targetList = useSelector(state => state.apiReducers.target_id_list);

  const [value, setValue] = React.useState(ProjectCreationType.NEW);

  const handleChange = event => {
    setValue(event.target.value);
  };

  const handleCloseModal = () => {
    dispatch(resetProjectState());
    dispatch(setProjectModalOpen(false));
  };

  const [selectedTags, setSelectedTags] = React.useState([]);

  return (
    <Modal open={isProjectModalOpen} onClose={handleCloseModal}>
      <Typography variant="h3">Create project</Typography>
      <Formik
        initialValues={{
          title: '',
          description: '',
          selectedTarget: '',
          tags: []
        }}
        validate={values => {
          const errors = {};
          if (!values.title) {
            errors.title = 'Required';
          }
          if (!values.description) {
            errors.description = 'Required';
          }
          if (values.selectedTarget === '') {
            errors.selectedTarget = 'Required';
          }
          console.log(errors);
          return errors;
        }}
        onSubmit={(values, { setSubmitting }) => {
          const data = {};
          data.username = DJANGO_CONTEXT['username'];
          setSubmitting(false);
        }}
      >
        {({ submitForm, isSubmitting, errors }) => (
          <Form>
            <Grid container direction="column" className={classes.body}>
              <Grid item>
                <RadioGroup aria-label="gender" name="gender1" value={value} onChange={handleChange}>
                  <Grid container justify="space-between" className={classes.input}>
                    <Grid item>
                      New Project
                      <Radio value={ProjectCreationType.NEW} />
                    </Grid>
                    <Grid item>
                      From Snapshot
                      <Radio value={ProjectCreationType.FROM_SNAPSHOT} />
                    </Grid>
                  </Grid>
                </RadioGroup>
              </Grid>
              <Grid item>
                <InputFieldAvatar
                  icon={<Title />}
                  field={<TextField className={classes.input} name="title" label="Title" required />}
                />
              </Grid>
              <Grid item>
                <InputFieldAvatar
                  icon={<Description />}
                  field={<TextField className={classes.input} name="description" label="Description" required />}
                />
              </Grid>
              <Grid item>
                <InputFieldAvatar
                  icon={<Link />}
                  field={
                    <FormControl className={classes.input} error={errors.selectedTarget !== undefined}>
                      <InputLabel htmlFor="selected-target" required>
                        Target
                      </InputLabel>
                      <Select
                        name="selectedTarget"
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
                      <FormHelperText>{errors.selectedTarget}</FormHelperText>
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
                      options={selectedTags}
                      getOptionLabel={option => option}
                      onChange={(e, data) => {
                        setSelectedTags(data);
                      }}
                      renderInput={params => (
                        <TextField
                          {...params}
                          className={classes.input}
                          name="tags"
                          label="Tags"
                          fullWidth
                          onKeyPress={e => {
                            if (e.key === 'Enter') {
                              setSelectedTags([...selectedTags, e.target.value]);
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
                <Button color="secondary" disabled={isSubmitting} onClick={handleCloseModal}>
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button color="primary" disabled={isSubmitting} onClick={submitForm}>
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
