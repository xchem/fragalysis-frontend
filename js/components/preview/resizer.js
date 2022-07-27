import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Divider } from '@material-ui/core';
import { throttle } from 'lodash';

// Inspired by Solid Playground
export const Resizer = ({ onResize }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [ref, setRef] = useState(null);

  const onResizeStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onMouseMove = useMemo(
    () =>
      throttle(event => {
        onResize(event.pageX);
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
        orientation="vertical"
        style={{ margin: `0 8px`, cursor: 'col-resize', width: 4 }}
      />
      {isDragging && (
        <div style={{ position: 'absolute', zIndex: 999999, cursor: 'col-resize', width: '100%', height: '100%' }} />
      )}
    </>
  );
};
