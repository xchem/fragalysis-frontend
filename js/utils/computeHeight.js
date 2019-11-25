import { useCallback, useEffect } from 'react';

export const ComputeHeight = ({ componentRef, setHeight, height, children }) => {
  const resize = useCallback(
    e => {
      const newHeight = componentRef && componentRef.offsetHeight ? componentRef.offsetHeight : null;
      if (newHeight !== null && newHeight !== height) {
        setHeight(newHeight);
      }
    },
    [componentRef, height, setHeight]
  );

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

  return children;
};
