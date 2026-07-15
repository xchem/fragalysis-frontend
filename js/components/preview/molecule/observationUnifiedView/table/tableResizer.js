import React, { useCallback, useEffect, useRef, useState } from 'react';
import { makeStyles } from '../../../../../ui/styles';

const useStyles = makeStyles(theme => ({
  vertical: {
    margin: `0 ${theme.spacing()}`,
    cursor: 'col-resize',
    width: 4
  },
  horizontal: {
    margin: `${theme.spacing()} 0`,
    cursor: 'row-resize',
    height: 4
  },
  overlay: {
    position: 'absolute',
    zIndex: 999999,
    cursor: ({ isVertical }) => (isVertical ? 'col-resize' : 'row-resize'),
    width: '100%',
    height: '100%'
  }
}));

// Inspired by Solid Playground
export const TableResizer = ({ onResize, orientation = 'vertical', className = null }) => {
  const isVertical = orientation === 'vertical';

  const classes = useStyles({ isVertical });

  const [isDragging, setIsDragging] = useState(false);
  const [positionStart, setPositionStart] = useState(0);

  const onResizeStart = useCallback((e) => {
    setIsDragging(true);
    setPositionStart(isVertical ? e.pageX : e.pageY);
  }, [isVertical]);

  const onResizeRef = useRef(onResize);
  useEffect(() => {
    onResizeRef.current = onResize;
  }, [onResize]);

  const onMouseMove = useCallback((event) => {
    const newWidth = isVertical ? event.pageX - positionStart : event.pageY - positionStart;
    onResizeRef.current(newWidth);
  }, [positionStart, isVertical, onResizeRef]);

  const onResizeEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onResizeEnd);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onResizeEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onResizeEnd);
    };
  }, [isDragging, onResizeEnd, onMouseMove]);

  return (
    <>
      <span
        onMouseDown={onResizeStart}
        className={className ? className : isVertical ? classes.vertical : classes.horizontal}
      />
      {isDragging && <div className={classes.overlay} />}
    </>
  );
};
