import React, { memo } from 'react';
import Modal from '../../common/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { setOpenSnapshotSavingDialog } from '../redux/actions';
import { NewSnapshotForm } from './newSnapshotForm';
import { AddProjectDetail } from '../../projects/addProjectDetail';

export const NewSnapshotModal = memo(({}) => {
  const dispatch = useDispatch();
  const openSavingDialog = useSelector(state => state.snapshotReducers.openSavingDialog);
  const dialogCurrentStep = useSelector(state => state.snapshotReducers.dialogCurrentStep);
  const projectID = useSelector(state => state.projectReducers.currentProject.projectID);

  const handleCloseModal = () => {
    dispatch(setOpenSnapshotSavingDialog(false));
  };

  return (
    <>
      <Modal open={openSavingDialog}>
        {!projectID && dialogCurrentStep === 0 && <AddProjectDetail handleCloseModal={handleCloseModal} />}
        {projectID && <NewSnapshotForm handleCloseModal={handleCloseModal} />}
      </Modal>
    </>
  );
});
