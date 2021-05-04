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
import { editTag } from '../redux/dispatchActions';
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
  const [state, setState] = useState();
  const [tagColor, setTagColor] = useState(tag.color);

  const categoryList = useSelector(state => state.selectionReducers.categoryList);

  let tagCategory = categoryList.find(c => c.id === tag.category);
  const [selectedCategory, setSelectedCategory] = useState(tagCategory);

  const handleCloseModal = () => {
    dispatch(setOpenDialog(false));
  };

  const handleColorChange = color => {
    setTagColor(color);
  };

  const handleCategoryChange = (e, data) => {
    if (e.key === 'Enter') {
      handleCategoryNewChange(e, data);
    } else {
      setSelectedCategory(data);
    }
  };

  const handleCategoryNewChange = (e, data) => {
    let newCategory = { id: null, text: data };
    setSelectedCategory(newCategory);
  };

  return (
    <Modal open={openDialog} onClose={handleCloseModal}>
      <Typography variant="h4">Edit tag</Typography>
      <Formik
        initialValues={{
          text: tag.text,
          color: tagColor,
          category: tagCategory,
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
          if (!selectedCategory) {
            errors.category = 'Required!';
          }
          return errors;
        }}
        onSubmit={values => {
          const data = {
            text: values.text,
            color: tagColor,
            category: selectedCategory,
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
              <Grid item xs={12} className={classes.input}>
                <InputFieldAvatar
                  icon={<Title />}
                  field={<Field component={TextField} className={classes.input} name="text" label="Name" required />}
                />
              </Grid>
              <Grid
                container
                direction="row"
                alignItems="flex-end"
                wrap="nowrap"
                item
                xs={12}
                className={classes.input}
                justify="flex-end"
              >
                <Grid item xs={10} className={classes.input}>
                  <InputFieldAvatar
                    icon={<ColorLens />}
                    field={
                      <Field
                        component={TextField}
                        className={classes.input}
                        name="color"
                        label="Color"
                        required
                        inputProps={{
                          readOnly: true,
                          value: tagColor,
                          className: classes.inputHeight
                        }}
                      />
                    }
                  />
                </Grid>
                <Grid item xs={2} className={classes.input}>
                  <ColorPicker selectedColor={tag.color} setSelectedColor={handleColorChange} />
                </Grid>
              </Grid>

              <Grid item xs={12} className={classes.input}>
                <InputFieldAvatar
                  icon={<Class />}
                  field={
                    <Autocomplete
                      defaultValue={tagCategory}
                      value={selectedCategory}
                      freeSolo
                      id="category-standard"
                      options={categoryList}
                      getOptionLabel={option => (option.text && option.text) || option}
                      onChange={(e, data) => {
                        handleCategoryChange(e, data);
                      }}
                      renderInput={params => (
                        <Field
                          required
                          component={TextField}
                          {...params}
                          className={classes.input}
                          label="Category"
                          name="category"
                          fullWidth
                          onKeyPress={e => {
                            if (e.key === 'Enter') {
                              handleCategoryNewChange(e, e.target.value);
                            }
                          }}
                        />
                      )}
                    />
                  }
                />
              </Grid>
              <Grid item xs={12} className={classes.input}>
                <InputFieldAvatar
                  icon={<Description />}
                  field={<Field component={TextField} className={classes.input} name="forumPost" label="Forum post" />}
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
