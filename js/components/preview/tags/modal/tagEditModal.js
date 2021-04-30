import React, { memo, useState } from 'react';
import Modal from '../../../common/Modal';
import { useDispatch } from 'react-redux';
import { makeStyles, Grid, Typography } from '@material-ui/core';
import { Title, Description, ColorLens } from '@material-ui/icons';
import { InputFieldAvatar } from '../../../projects/projectModal/inputFieldAvatar';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import { Button } from '../../../common/Inputs/Button';
import { editTag } from '../redux/dispatchActions';
import { ColorPicker } from '../../../common/Components/ColorPicker';

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

export const TagEditModal = memo(({ openDialog, setOpenDialog, tag }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [state, setState] = useState();
  const [tagColor, setTagColor] = useState(tag.color);

  const handleCloseModal = () => {
    dispatch(setOpenDialog(false));
  };

  const handleColorChange = color => {
    setTagColor(color);
  };

  return (
    <Modal open={openDialog} onClose={handleCloseModal}>
      <Typography variant="h4">
        Edit tag: {tag.text} {tagColor}
      </Typography>
      <Formik
        initialValues={{
          text: tag.text,
          color: tagColor,
          forumPost: ''
        }}
        validate={values => {
          const errors = {};
          if (!values.text) {
            errors.text = 'Required!';
          }
          if (!values.color) {
            errors.color = 'Required!';
          }
          return errors;
        }}
        onSubmit={values => {
          const data = {
            text: values.text,
            color: values.color,
            forumPost: values.forumPost
          };
          dispatch(
            editTag({
              tag,
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
                  icon={<Title />}
                  field={<Field component={TextField} className={classes.input} name="text" label="Name" required />}
                />
              </Grid>
              <Grid item>
                <InputFieldAvatar
                  icon={<ColorLens />}
                  field={
                    <Field
                      component={TextField}
                      value={tagColor}
                      className={classes.input}
                      name="color"
                      label="Color"
                      required
                      inputProps={{
                        readOnly: true,
                        value: tagColor
                      }}
                    />
                  }
                />
              </Grid>
              <ColorPicker selectedColor={tag.color} setSelectedColor={handleColorChange} />
              <Grid item>
                <InputFieldAvatar
                  icon={<Description />}
                  field={
                    <Field
                      component={TextField}
                      className={classes.input}
                      name="forumPost"
                      label="Forum post"
                      required
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
