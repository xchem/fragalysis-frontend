import React from 'react';
import { Drawer } from '../../common/Navigation/Drawer';

export const MouseControls = ({ open, onClose }) => {
  return <Drawer title="Mouse controls" open={open} onClose={onClose}></Drawer>;
};
