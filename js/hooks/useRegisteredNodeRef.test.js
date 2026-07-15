import { act, renderHook } from '@testing-library/react';
import { useRegisteredNodeRef } from './useRegisteredNodeRef';

describe('useRegisteredNodeRef', () => {
  it('keeps the callback ref stable while registering and clearing a node', () => {
    const registerNode = jest.fn();
    const { result, rerender } = renderHook(
      ({ nodeId, onRegister }) => useRegisteredNodeRef(nodeId, onRegister),
      { initialProps: { nodeId: 42, onRegister: registerNode } }
    );
    const initialCallback = result.current.setNodeRef;
    const node = document.createElement('tr');

    act(() => initialCallback(node));
    rerender({ nodeId: 42, onRegister: registerNode });

    expect(result.current.setNodeRef).toBe(initialCallback);
    expect(result.current.nodeRef.current).toBe(node);
    expect(registerNode).toHaveBeenLastCalledWith(42, node);

    act(() => result.current.setNodeRef(null));

    expect(result.current.nodeRef.current).toBeNull();
    expect(registerNode).toHaveBeenLastCalledWith(42, null);
  });
});
