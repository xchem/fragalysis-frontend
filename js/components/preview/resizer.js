import React, { useCallback } from 'react';
import { Divider } from '@mui/material';
import { makeStyles } from '../../ui/styles';

const useStyles = makeStyles(theme => ({
  vertical: {
    margin: `0 ${theme.spacing()}`,
    cursor: 'col-resize',
    width: 4,
    flexShrink: 0
  },
  horizontal: {
    margin: `${theme.spacing()} 0`,
    cursor: 'row-resize',
    height: 4,
    flexShrink: 0
  }
}));

export const Resizer = ({ onResize, orientation = 'vertical' }) => {
  const classes = useStyles();

  const handleMouseDown = useCallback(
    e => {
      e.preventDefault();
      const handleMouseMove = moveEvent => {
        onResize(moveEvent.clientX, moveEvent.clientY);
      };
      const handleMouseUp = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [onResize]
  );

  return (
    <Divider
      onMouseDown={handleMouseDown}
      orientation={orientation}
      className={orientation === 'vertical' ? classes.vertical : classes.horizontal}
    />
  );
};
