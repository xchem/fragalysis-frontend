import React, { memo, useState } from 'react';
import Modal from '../../../common/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles, Grid, Typography } from '@material-ui/core';
import { Label } from '@material-ui/icons';
import { Autocomplete } from '@material-ui/lab';
import { InputFieldAvatar } from '../../../projects/projectModal/inputFieldAvatar';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import { Button } from '../../../common/Inputs/Button';
import { addTag } from '../redux/dispatchActions';

const useStyles = makeStyles(theme => ({
  body: {
    width: '450px',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  input: {
    width: '100%'
  },
  inputHeight: {
    height: '1.2876em'
  },
  margin: {
    margin: theme.spacing(1)
  },
  marginTop: {
    marginTop: theme.spacing(1)
  }
}));

export const TagAddModal = memo(({ openDialog, setOpenDialog, molecule }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [state, setState] = useState();
  const [tags, setTags] = useState([]);

  const tagList = useSelector(state => state.selectionReducers.tagList);

  const handleCloseModal = () => {
    dispatch(setOpenDialog(false));
  };

  const handleTagChange = (e, data) => {
    if (e.key === 'Enter') {
      handleTagNewChange(e, data);
    } else {
      setTags(data);
    }
  };

  const handleTagNewChange = (e, data) => {
    let newTag = { id: null, text: data };
    setTags([...tags, newTag]);
  };

  return (
    <Modal open={openDialog} onClose={handleCloseModal}>
      <Typography variant="h4">Add tags to molecule</Typography>
      <Typography variant="subtitle1" gutterBottom className={classes.marginTop}>
        {molecule.protein_code}
      </Typography>
      <Formik
        initialValues={{ tags: '' }}
        validate={values => {
          const errors = {};
          return errors;
        }}
        onSubmit={values => {
          const data = {
            tags: JSON.stringify(tags)
          };
          dispatch(
            addTag({
              molecule,
              data
            })
          )
            .then(() => {})
            .catch(error => {
              setState(() => {
                throw error;
              });
            })
            .finally(() => {
              handleCloseModal();
            });
        }}
      >
        {({ submitForm, isSubmitting, errors, values }) => (
          <Form>
            <Grid container direction="column" className={classes.body}>
              <Grid item>
                <InputFieldAvatar
                  icon={<Label />}
                  field={
                    <Autocomplete
                      multiple
                      freeSolo
                      id="tags-standard"
                      options={tagList}
                      getOptionLabel={option => (option.text && option.text) || option}
                      onChange={(e, data) => {
                        handleTagChange(e, data);
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
                              handleTagChange(e, e.target.value);
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
                <Button color="primary" onClick={submitForm} disabled={isSubmitting}>
                  Save
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Modal>
  );
});
