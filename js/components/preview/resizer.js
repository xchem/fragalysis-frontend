import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Divider, makeStyles } from '@material-ui/core';
import { throttle } from 'lodash';

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
export const Resizer = ({ onResize, orientation = 'vertical' }) => {
  const isVertical = orientation === 'vertical';

  const classes = useStyles({ isVertical });

  const [isDragging, setIsDragging] = useState(false);
  const [ref, setRef] = useState(null);

  const onResizeStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onMouseMove = useMemo(
    () =>
      throttle(event => {
        onResize(event.pageX, event.pageY);
      }, 10),
    [onResize]
  );

  const onResizeEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (ref) {
      ref.addEventListener('mousedown', onResizeStart);
    }

    return () => {
      if (ref) {
        ref.removeEventListener('mousedown', onResizeStart);
      }
    };
  }, [onResizeStart, ref]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onResizeEnd);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onResizeEnd);
    }
  }, [isDragging, onMouseMove, onResizeEnd]);

  return (
    <>
      <Divider
        innerRef={el => setRef(el)}
        orientation={orientation}
        className={isVertical ? classes.vertical : classes.horizontal}
      />
      {isDragging && <div className={classes.overlay} />}
    </>
  );
};
