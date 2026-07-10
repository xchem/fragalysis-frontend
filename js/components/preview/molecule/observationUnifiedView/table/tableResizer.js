import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Divider } from '@mui/material';
import { makeStyles } from '../../../../../ui/styles';
import { throttle } from 'lodash';

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
  const [ref, setRef] = useState(null);

  const onResizeStart = useCallback((e) => {
    setIsDragging(true);
    // console.log('onResizeStart', e.pageX);
    setPositionStart(isVertical ? e.pageX : e.pageY);
  }, [isVertical]);

  const onResizeRef = useRef(onResize);
  useEffect(() => {
    onResizeRef.current = onResize;
  }, [onResize]);

  // const onMouseMove = useRef();
  // if (!onMouseMove.current) {
  //   onMouseMove.current = throttle(event => {
  //     console.log('positionStart', positionStart);
  //     console.log('event.pageX', event.pageX);
  //     const newWidth = isVertical ? event.pageX - positionStart : event.pageY - positionStart;
  //     console.log('onMouseMove', newWidth);
  //     onResizeRef.current(newWidth);
  //   }, 10);
  // }

  // const onMouseMove = useMemo(() =>
  //   throttle(event => {
  //     console.log('positionStart', positionStart);
  //     console.log('event.pageX', event.pageX);
  //     const newWidth = isVertical ? event.pageX - positionStart : event.pageY - positionStart;
  //     console.log('onMouseMove', newWidth);
  //     onResizeRef.current(newWidth);
  //   }, 10), [positionStart, isVertical, onResizeRef]);

  const onMouseMove = useCallback((event) => {
    // console.log('positionStart', positionStart);
    // console.log('event.pageX', event.pageX);
    const newWidth = isVertical ? event.pageX - positionStart : event.pageY - positionStart;
    // console.log('onMouseMove', newWidth);
    onResizeRef.current(newWidth);
  }, [positionStart, isVertical, onResizeRef]);

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
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onResizeEnd);
    };
  }, [isDragging, onResizeEnd, onMouseMove]);

  return (
    <>
      <span
        ref={el => setRef(el)}
        className={className ? className : isVertical ? classes.vertical : classes.horizontal}
      />
      {isDragging && <div className={classes.overlay} />}
    </>
  );
};
