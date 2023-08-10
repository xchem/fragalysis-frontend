import React, { memo } from 'react';
import ModalSaveSnapshot from '../../common/ModalSaveSnapshot';
import { useDispatch, useSelector } from 'react-redux';
import { setOpenSnapshotSavingDialog } from '../redux/actions';
import { NewSnapshotForm } from './newSnapshotForm';
import { AddProjectDetail } from '../../projects/addProjectDetail';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';

export const NewSnapshotModal = memo(({}) => {
  const dispatch = useDispatch();
  const openSavingDialog = useSelector(state => state.snapshotReducers.openSavingDialog);
  const dialogCurrentStep = useSelector(state => state.snapshotReducers.dialogCurrentStep);
  const projectID = useSelector(state => state.projectReducers.currentProject.projectID);
  const forceCreateProject = useSelector(state => state.projectReducers.forceCreateProject);

  const handleCloseModal = () => {
    dispatch(setOpenSnapshotSavingDialog(false));
  };

  return (
    <ModalSaveSnapshot open={openSavingDialog}>
      {(!projectID || forceCreateProject === true) && dialogCurrentStep === 0 && DJANGO_CONTEXT['pk'] && (
        <AddProjectDetail handleCloseModal={handleCloseModal} />
      )}
      {projectID && forceCreateProject === false && <NewSnapshotForm handleCloseModal={handleCloseModal} />}
    </ModalSaveSnapshot>
  );
});
