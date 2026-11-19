import React, { useCallback, useEffect, useRef } from 'react';
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
  const stopDraggingRef = useRef(null);

  useEffect(() => () => stopDraggingRef.current?.(), []);

  const handleMouseDown = useCallback(
    e => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      stopDraggingRef.current?.();

      const handleMouseMove = moveEvent => {
        moveEvent.preventDefault();
        moveEvent.stopPropagation();
        onResize(moveEvent.clientX, moveEvent.clientY);
      };
      const stopDragging = () => {
        window.removeEventListener('mousemove', handleMouseMove, true);
        window.removeEventListener('mouseup', handleMouseUp, true);
        window.removeEventListener('blur', stopDragging);
        stopDraggingRef.current = null;
      };
      const handleMouseUp = upEvent => {
        upEvent.stopPropagation();
        stopDragging();
      };

      stopDraggingRef.current = stopDragging;
      // Moorhen stops bubbling mouse events at its canvas. Capture an active
      // divider drag before it reaches the viewer so expansion keeps tracking.
      window.addEventListener('mousemove', handleMouseMove, true);
      window.addEventListener('mouseup', handleMouseUp, true);
      window.addEventListener('blur', stopDragging);
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
