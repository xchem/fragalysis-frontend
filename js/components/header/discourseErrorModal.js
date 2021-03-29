import React, { memo } from 'react';
import Modal from '../common/Modal';
import { Grid, Typography, Button } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { setOpenDiscourseErrorModal } from '../../reducers/api/actions';

export const DiscourseErrorModal = memo(({ openModal }) => {
  const dispatch = useDispatch();

  const closeModal = () => {
    dispatch(setOpenDiscourseErrorModal(false));
  };

  return (
    <Modal
      open={openModal}
      onClose={() => {
        closeModal();
      }}
    >
      <Grid container direction="column">
        <Grid item>
          <Typography variant="h3">DISCOURSE ERROR!</Typography>
        </Grid>
        <Grid item>
          <Typography variant="body1">
            Most likely there already is topic with same name as is this project name.
          </Typography>
        </Grid>
      </Grid>
      <Grid container justify="flex-end">
        {' '}
        <Button
          color="primary"
          onClick={() => {
            closeModal();
          }}
        >
          Close
        </Button>
      </Grid>
    </Modal>
  );
});
