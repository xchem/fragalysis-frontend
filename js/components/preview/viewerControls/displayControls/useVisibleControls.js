import { useCallback, useEffect, useState } from 'react';
import { useRegisteredNodeRef } from '../../../../hooks/useRegisteredNodeRef';

const waiting = new Map();
let observer;

// One observer for the entire tree. Once visited, a label keeps its controls and
// editor state mounted, including while scrolled offscreen or the drawer closes.
export const useVisibleControls = () => {
  const [node, setNode] = useState(null);
  const registerNode = useCallback(
    (id, element) => setNode(previous => (previous === element ? previous : element)),
    []
  );
  const { setNodeRef } = useRegisteredNodeRef(null, registerNode);
  const [ready, setReady] = useState(() => typeof IntersectionObserver !== 'function');
  useEffect(() => {
    if (ready || !node) return undefined;
    if (!observer)
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.isConnected) waiting.get(entry.target)?.();
          });
        },
        { rootMargin: '200px' }
      );
    waiting.set(node, () => setReady(true));
    observer.observe(node);
    return () => {
      observer.unobserve(node);
      waiting.delete(node);
      if (waiting.size === 0) {
        observer.disconnect();
        observer = undefined;
      }
    };
  }, [ready, node]);
  return { ref: setNodeRef, ready };
};
