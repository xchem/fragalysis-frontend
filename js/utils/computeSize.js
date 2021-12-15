import { useCallback, useEffect } from 'react';
import { throttle } from 'lodash';

export const ComputeSize = ({
  componentRef,
  setHeight,
  height,
  setWidth,
  width,
  children,
  forceCompute,
  clientWidth,
  setClientWidth
}) => {
  const resize = useCallback(
    throttle(e => {
      const newHeight = componentRef && componentRef.offsetHeight ? componentRef.offsetHeight : null;
      const newWidth = componentRef && componentRef.offsetWidth ? componentRef.offsetWidth : null;
      const newClientWidth = componentRef && componentRef.clientWidth ? componentRef.clientWidth : null;
      if (newHeight !== null && newHeight !== height && setHeight) {
        setHeight(newHeight);
      }
      if (newWidth !== null && newWidth !== width && setWidth) {
        setWidth(newWidth);
      }
      if (newClientWidth !== null && newClientWidth !== clientWidth && setClientWidth) {
        setClientWidth(newClientWidth);
      }
    }, 250),
    [componentRef, height, setHeight, setWidth, width]
  );

  useEffect(() => {
    if (componentRef && forceCompute) {
      resize();
    }
  }, [componentRef, forceCompute, resize]);

  useEffect(() => {
    if (componentRef) {
      resize();
      window.addEventListener('resize', resize);
    }

    return () => {
      if (componentRef) {
        window.removeEventListener('resize', resize);
      }
    };
  }, [componentRef, resize]);

  useEffect(() => {
    if (componentRef) {
      const resizeObserver = new ResizeObserver(() => {
        resize();
      });

      resizeObserver.observe(componentRef);

      return () => {
        resizeObserver.unobserve(componentRef);
      };
    }
  }, [componentRef, resize]);

  return children;
};
