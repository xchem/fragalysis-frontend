import { useRef, useLayoutEffect, useState, useCallback } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

// https://tobbelindstrom.com/blog/resize-observer-hook/

const useResizeObserver = observerCallback => {
  const [node, setNode] = useState(null);
  const observer = useRef(null);

  const disconnect = useCallback(() => {
    const { current } = observer;
    current && current.disconnect();
  }, []);

  const observe = useCallback(() => {
    observer.current = new ResizeObserver(([entry]) =>
      observerCallback !== undefined ? observerCallback(entry, node) : null
    );
    node && observer.current.observe(node);
  }, [node, observerCallback]);

  useLayoutEffect(() => {
    observe();
    return () => disconnect();
  }, [disconnect, observe]);

  return [setNode];
};

export default useResizeObserver;
