import React, { memo } from 'react';
import Modal from '../../common/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { setProjectModalOpen } from '../redux/actions';

export const ProjectModal = memo(({}) => {
  const dispatch = useDispatch();
  const isProjectModalOpen = useSelector(state => state.projectReducers.isProjectModalOpen);

  const handleCloseModal = () => dispatch(setProjectModalOpen(false));

  return (
    <Modal open={isProjectModalOpen} onClose={handleCloseModal}>
      My modal
    </Modal>
  );
});
