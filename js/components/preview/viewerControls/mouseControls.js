import React, { memo } from 'react';
import { Drawer } from '../../common/Navigation/Drawer';

export const MouseControls = memo(({ open, onClose }) => {
  return <Drawer title="Mouse controls" open={open} onClose={onClose}></Drawer>;
});
