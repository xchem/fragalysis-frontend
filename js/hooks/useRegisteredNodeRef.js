import { useCallback, useRef } from 'react';

export const useRegisteredNodeRef = (nodeId, registerNode) => {
  const nodeRef = useRef(null);
  // Keep ref identity stable so React does not detach and re-register the row on every render.
  const setNodeRef = useCallback(
    node => {
      nodeRef.current = node;
      if (registerNode) {
        registerNode(nodeId, node);
      }
    },
    [nodeId, registerNode]
  );

  return { nodeRef, setNodeRef };
};
