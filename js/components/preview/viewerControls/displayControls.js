import React from 'react';
import { Drawer } from '../../common/Navigation/Drawer';

export const DisplayControls = ({ open, onClose }) => {
  return <Drawer title="Display controls" open={open} onClose={onClose}></Drawer>;
};
