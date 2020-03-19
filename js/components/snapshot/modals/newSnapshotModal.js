import React, { memo } from 'react';
import Modal from '../../common/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { setOpenSnapshotSavingDialog } from '../redux/actions';
import { Typography } from '@material-ui/core';
import { AddProjectDetail } from '../../projects/addProjectDetail';
import { useRouteMatch } from 'react-router-dom';

export const NewSnapshotModal = memo(({}) => {
  const dispatch = useDispatch();
  const openSavingDialog = useSelector(state => state.snapshotReducers.openSavingDialog);
  const dialogCurrentStep = useSelector(state => state.snapshotReducers.dialogCurrentStep);
  const currectProject = useSelector(state => state.projectReducers.currentProject);
  let match = useRouteMatch();

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
