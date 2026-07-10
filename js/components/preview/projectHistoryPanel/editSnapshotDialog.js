import { Button, GridLegacy as Grid, Modal } from '@mui/material';
import { makeStyles } from '../../../ui/styles';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Field, Form, Formik } from 'formik';
import { FormikTextField as TextField } from '../../common/Inputs/FormikTextField';
import { setSnapshotEditDialogOpen, setSnapshotToBeEdited } from '../../snapshot/redux/actions';
import { base_url } from '../../routes/constants';
import { api, METHOD } from '../../../utils/api';
import { addToastMessage } from '../../../reducers/selection/actions';
import { TOAST_LEVELS } from '../../toast/constants';
import { InputFieldAvatar } from '../../projects/projectModal/inputFieldAvatar';
import { Description, Title } from '@mui/icons-material';
import RichTooltip from '../../tooltip/RichTooltip';

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
  editSnashotPopup: {
    width: '600px',
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

export const EditSnapshotDialog = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const isSnapshotEditDialogOpen = useSelector(state => state.snapshotReducers.isSnapshotEditDialogOpen);
  const snapshotToBeEdited = useSelector(state => state.snapshotReducers.snapshotToBeEdited);

  const onClose = () => {
    dispatch(setSnapshotEditDialogOpen(false));
    dispatch(setSnapshotToBeEdited(null));
  };

  const validate = values => {
    const errors = {};

    if (values.name === '') {
      errors.name = 'Required';
    }
    // if (values.description === '') {
    //   errors.description = 'Required';
    // }

    return errors;
  };

  const onSubmitForm = async ({ name /*, description*/ }) => {
    snapshotToBeEdited &&
      api({
        url: `${base_url}/api/snapshots/${snapshotToBeEdited.id}/`,
        method: METHOD.PATCH,
        data: { title: name /*, description: description*/ }
      })
        .then(resp => {
          snapshotToBeEdited.title = name;
          // snapshotToBeEdited.description = description;
          dispatch(setSnapshotEditDialogOpen(false));
          dispatch(setSnapshotToBeEdited(snapshotToBeEdited));
          dispatch(addToastMessage({ text: `Snapshot saved successfully.`, level: TOAST_LEVELS.SUCCESS }));
          // onClose();
        })
        .catch(err => {
          dispatch(addToastMessage({ text: 'Saving snapshot failed.', level: TOAST_LEVELS.ERROR }));
          console.error(`Error while saving the snapshot: ${err}`);
        });
  };

  return (
    snapshotToBeEdited && (
      <Modal open={isSnapshotEditDialogOpen} onClose={onClose}>
        <div className={classes.editSnashotPopup}>
          <div className={classes.topPopup}>
            <span>Edit target</span>
            <button className={classes.popUpButton} onClick={onClose}>
              X
            </button>
          </div>
          <div className={classes.bodyPopup}>
            <Formik
              initialValues={{
                name: snapshotToBeEdited?.title
                  ? snapshotToBeEdited?.title
                  : '' /*,
                description: snapshotToBeEdited?.description ? snapshotToBeEdited?.description : ''*/
              }}
              onSubmit={onSubmitForm}
              validate={validate}
            >
              {({ submitForm, isSubmitting }) => (
                <Form>
                  <Grid container direction="column" className={classes.body}>
                    <Grid item>
                      <InputFieldAvatar
                        icon={<Title />}
                        field={
                          <Field component={TextField} className={classes.input} name="name" label="Name" required />
                        }
                      />
                    </Grid>
                    {/* <Grid item>
                      <InputFieldAvatar
                        icon={<Description />}
                        field={
                          <Field
                            component={TextField}
                            className={classes.input}
                            name="description"
                            label="Description"
                            required
                          />
                        }
                      />
                    </Grid> */}
                  </Grid>
                  <Grid container justifyContent="flex-end" direction="row">
                    <Grid>
                      <RichTooltip path="editSnapshot.close">
                        <Button color="secondary" size="large" onClick={onClose}>
                          Close
                        </Button>
                      </RichTooltip>
                    </Grid>
                    <Grid>
                      <RichTooltip path="editSnapshot.submit">
                        <Button type="submit" color="primary" size="large">
                          Submit
                        </Button>
                      </RichTooltip>
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
