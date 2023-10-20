import React, { memo, useState } from 'react';
import Modal from '../../../common/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles, Grid, Typography } from '@material-ui/core';
import { Title, Description, Class, ColorLens } from '@material-ui/icons';
import { Autocomplete } from '@material-ui/lab';
import { InputFieldAvatar } from '../../../projects/projectModal/inputFieldAvatar';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import { Button } from '../../../common/Inputs/Button';
import { updateTagProp } from '../redux/dispatchActions';
import { ColorPicker } from '../../../common/Components/ColorPicker';

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

export const TagEditModal = memo(({ openDialog, setOpenDialog, tag }) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const handleCloseModal = () => {
    dispatch(setOpenDialog(false));
  };

  return (
    <Modal open={openDialog} onClose={handleCloseModal}>
      <Typography variant="h4">Edit tag</Typography>
      <Formik
        initialValues={{
          text: tag.tag
        }}
        validate={values => {
          const errors = {};
          if (!values.text) {
            errors.text = 'Required!';
          }
          return errors;
        }}
        onSubmit={values => {
          const data = {
            text: values.text
          };
          dispatch(updateTagProp(tag, data.text, 'tag'));
          handleCloseModal();
        }}
      >
        {({ submitForm, isSubmitting, errors, values }) => (
          <Form>
            <Grid container direction="column" className={classes.body}>
              <Grid item xs={12} className={classes.input}>
                <InputFieldAvatar
                  icon={<Title />}
                  field={
                    <Field
                      component={TextField}
                      className={classes.input}
                      name="text"
                      label="Name"
                      required
                      disabled={isSubmitting}
                    />
                  }
                />
              </Grid>
            </Grid>
            <Grid container justifyContent="flex-end" direction="row">
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
