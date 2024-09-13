import { Button, Grid, makeStyles, Modal } from '@material-ui/core';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setEditTargetDialogOpen } from './redux/actions';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import { api, METHOD } from '../../utils/api';
import { base_url } from '../routes/constants';
import { replaceTarget } from '../../reducers/api/actions';
import { addToastMessage, setTargetToEdit } from '../../reducers/selection/actions';
import { TOAST_LEVELS } from '../toast/constants';

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
  },
  renameTargetPopup: {
    width: '300px',
    borderRadius: '5px',
    border: '1px solid #000',
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  },

  topPopup: {
    width: '100%',
    borderRadius: '5px 5px 0 0',
    backgroundColor: '#3f51b5',
    color: '#fff',
    paddingLeft: '10px',
    lineHeight: '30px'
  },

  popUpButton: {
    borderRadius: '0 5px 0 0',
    backgroundColor: '#d33f3f',
    color: '#fff',
    padding: '5px 10px 5px 10px',
    border: 'none',
    float: 'right',
    height: '30px',
    '&:hover': {
      borderRadius: '0 5px 0 0',
      backgroundColor: '#aa3939',
      color: '#fff',
      cursor: 'pointer'
    }
  },

  bodyPopup: {
    padding: '10px',
    backgroundColor: '#ffffff',
    borderRadius: '0 0 5px 5px'
  }
}));

export const EditTargetDialog = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const isEditTargetDialogOpen = useSelector(state => state.targetReducers.isEditTargetDialogOpen);
  const targetToEdit = useSelector(state => state.selectionReducers.targetToEdit);

  const onClose = () => {
    dispatch(setEditTargetDialogOpen(false));
    dispatch(setTargetToEdit(null));
  };

  const validate = values => {
    const errors = {};

    if (values.name === '') {
      errors.name = 'Required';
    }

    return errors;
  };

  const onSubmitForm = async ({ name }) => {
    targetToEdit &&
      api({
        url: `${base_url}/api/targets/${targetToEdit.id}/`,
        method: METHOD.PATCH,
        data: { display_name: name }
      })
        .then(resp => {
          targetToEdit.display_name = name;
          dispatch(replaceTarget(targetToEdit));
          dispatch(addToastMessage({ text: `Target renamed successfully to ${name}`, level: TOAST_LEVELS.SUCCESS }));
        })
        .catch(err => {
          dispatch(addToastMessage({ text: 'Error renaming target', level: TOAST_LEVELS.ERROR }));
        });
  };

  return (
    targetToEdit && (
      <Modal open={isEditTargetDialogOpen} onClose={onClose}>
        <div className={classes.renameTargetPopup}>
          <div className={classes.topPopup}>
            <span>Edit target</span>
            <button className={classes.popUpButton} onClick={onClose}>
              X
            </button>
          </div>
          <div className={classes.bodyPopup}>
            <Formik
              initialValues={{ name: targetToEdit?.display_name ? targetToEdit?.display_name : '' }}
              onSubmit={onSubmitForm}
              validate={validate}
            >
              {({ submitForm, isSubmitting }) => (
                <Form /*className={classes.flexRow}*/>
                  <Grid container direction="column" className={classes.body}>
                    <Grid item style={{ display: 'flex', alignItems: 'center' }}>
                      <label htmlFor="name" style={{ marginRight: '1rem' }}>
                        Name:
                      </label>
                      <Field
                        component={TextField}
                        type="text"
                        name="name"
                        variant="standard"
                        margin="none"
                        disabled={isSubmitting}
                        autoComplete="off"
                      />
                    </Grid>
                  </Grid>
                  <Grid container justifyContent="flex-end" direction="row">
                    <Grid>
                      <Button color="secondary" size="large" onClick={onClose}>
                        Close
                      </Button>
                    </Grid>
                    <Grid>
                      <Button type="submit" color="primary" size="large">
                        Submit
                      </Button>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </Modal>
    )
  );
};
