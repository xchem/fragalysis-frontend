import React, { memo } from 'react';
import Modal from '../../common/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { setOpenSnapshotSavingDialog } from '../redux/actions';
import { Typography } from '@material-ui/core';
import { AddProjectDetail } from '../../projects/addProjectDetail';

export const NewSnapshotModal = memo(({ match }) => {
  const dispatch = useDispatch();
  const openSavingDialog = useSelector(state => state.snapshotReducers.openSavingDialog);
  const dialogCurrentStep = useSelector(state => state.snapshotReducers.dialogCurrentStep);
  const currectProject = useSelector(state => state.projectReducers.currentProject);

  const projectId = (match && match.params && match.params.projectId) || (currectProject && currectProject.projectID);

  const handleCloseModal = () => {
    dispatch(setOpenSnapshotSavingDialog(false));
  };

  return (
    <>
      <Modal open={openSavingDialog} onClose={handleCloseModal}>
        {projectId && <Typography variant="h3">Save Session</Typography>}
        {!projectId && dialogCurrentStep === 0 && <AddProjectDetail />}
        {!projectId && dialogCurrentStep === 1 && <AddProjectDetail />}
      </Modal>
    </>
  );
});
