import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { TableResizer } from './tableResizer';

describe('TableResizer', () => {
  it('mounts and resizes without a callback-ref update loop', () => {
    const onResize = jest.fn();
    const { container, rerender } = render(
      <TableResizer className="test-resizer" onResize={onResize} />
    );
    const handle = container.querySelector('.test-resizer');

    fireEvent.mouseDown(handle, { clientX: 100 });
    fireEvent.mouseMove(window, { clientX: 125 });

    expect(onResize).toHaveBeenLastCalledWith(25);
    expect(container.querySelector('div')).toBeInTheDocument();

    rerender(<TableResizer className="test-resizer" onResize={onResize} />);
    fireEvent.mouseUp(window);

    expect(container.querySelector('div')).not.toBeInTheDocument();
  });
});
