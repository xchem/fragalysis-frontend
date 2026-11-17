import React from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { useVisibleControls } from './useVisibleControls';

const Probe = ({ show }) => {
  const { ref, ready } = useVisibleControls();
  return show ? <div ref={ref}>{ready ? 'ready' : 'waiting'}</div> : null;
};

describe('late tree-control initialization', () => {
  it('observes a node that becomes available after mount and initializes it on first visibility', () => {
    expect.hasAssertions();
    const original = global.IntersectionObserver;
    let notify;
    const observer = { observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn() };
    global.IntersectionObserver = class {
      constructor(callback) {
        notify = callback;
        return observer;
      }
    };
    try {
      const { rerender } = render(<Probe show={false} />);
      expect(observer.observe).not.toHaveBeenCalled();
      rerender(<Probe show />);
      const node = screen.getByText('waiting');
      expect(observer.observe).toHaveBeenCalledWith(node);
      act(() => notify([{ target: node, isIntersecting: true }]));
      expect(screen.getByText('ready')).toBeInTheDocument();
      expect(observer.unobserve).toHaveBeenCalledWith(node);
      expect(observer.disconnect).toHaveBeenCalledTimes(1);
    } finally {
      cleanup();
      global.IntersectionObserver = original;
    }
  });
});
