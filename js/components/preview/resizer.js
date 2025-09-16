import React, { useCallback } from 'react';
import { Divider, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  vertical: {
    margin: `0 ${theme.spacing()}px`,
    cursor: 'col-resize',
    width: 4
  },
  horizontal: {
    margin: `${theme.spacing()}px 0`,
    cursor: 'row-resize',
    height: 4
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
