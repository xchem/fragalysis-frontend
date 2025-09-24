import React, { memo } from 'react';
import ModalSaveSnapshot from '../../common/ModalSaveSnapshot';
import { useDispatch, useSelector } from 'react-redux';
import { setOpenSnapshotSavingDialog } from '../redux/actions';
import { NewSnapshotForm } from './newSnapshotForm';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';

export const NewSnapshotModal = memo(({}) => {
  const dispatch = useDispatch();
  const openSavingDialog = useSelector(state => state.snapshotReducers.openSavingDialog);
  const dialogCurrentStep = useSelector(state => state.snapshotReducers.dialogCurrentStep);
  const projectID = useSelector(state => state.projectReducers.currentProject.projectID);

  const handleCloseModal = () => {
    dispatch(setOpenSnapshotSavingDialog(false));
  };

  return (
    <ModalSaveSnapshot open={openSavingDialog}>
      {projectID && <NewSnapshotForm handleCloseModal={handleCloseModal} />}
    </ModalSaveSnapshot>
  );
});
