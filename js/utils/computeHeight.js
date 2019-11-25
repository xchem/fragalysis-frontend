import { memo, useCallback, useEffect, useRef, useState } from 'react';

export const ComputeHeight = memo(({ componentRef, height, setHeight }) => {
  const registerResize = useRef(false);
  const resize = useCallback(() => {
    const newHeight =
      componentRef !== undefined && componentRef !== null && componentRef.offsetHeight
        ? componentRef.offsetHeight
        : null;
    if (newHeight !== null && newHeight !== height) {
      setHeight(newHeight);
    }
  }, [componentRef, height, setHeight]);

  useEffect(() => {
    const registeringResize = registerResize.current;
    if (componentRef !== undefined && componentRef !== null && registeringResize === false) {
      console.log('Register');
      window.addEventListener('resize', resize, false);
      registerResize.current = true;
      resize();
    }
    return () => {
      if (componentRef !== undefined && componentRef !== null && registeringResize === true) {
        console.log('UnRegister');
        window.removeEventListener('resize', resize, false);
      }
    };
  }, [resize, componentRef]);

  return null;
});
