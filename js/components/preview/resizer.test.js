import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { Resizer } from './resizer';

const renderResizer = (orientation = 'vertical') => {
  const onResize = jest.fn();
  const layoutMouseDown = jest.fn();
  const view = render(
    <div onMouseDown={layoutMouseDown}>
      <Resizer onResize={onResize} orientation={orientation} />
      <canvas />
    </div>
  );
  const handle = view.getByRole('separator');
  const canvas = view.container.querySelector('canvas');
  // Moorhen installs native canvas listeners which stop mousemove propagation.
  const viewerMove = jest.fn(event => event.stopPropagation());
  const viewerUp = jest.fn(event => event.stopPropagation());
  canvas.addEventListener('mousemove', viewerMove);
  canvas.addEventListener('mouseup', viewerUp);
  return { ...view, handle, canvas, onResize, viewerMove, viewerUp, layoutMouseDown };
};

describe('panel divider dragging', () => {
  it.each([
    [
      'LHS expansion',
      'vertical',
      [
        [550, 200],
        [555, 200],
        [650, 200],
        [800, 200]
      ]
    ],
    [
      'RHS expansion',
      'vertical',
      [
        [1000, 200],
        [995, 200],
        [900, 200],
        [750, 200]
      ]
    ],
    [
      'panel height',
      'horizontal',
      [
        [200, 100],
        [200, 105],
        [200, 200],
        [200, 350]
      ]
    ]
  ])('continues %s across the canvas in one drag', (_name, orientation, positions) => {
    expect.hasAssertions();
    const { handle, canvas, onResize, viewerMove, viewerUp, layoutMouseDown } = renderResizer(orientation);
    const [start, first, second, third] = positions;
    fireEvent.mouseMove(canvas, { clientX: start[0], clientY: start[1] });
    fireEvent.mouseDown(handle, { button: 0, clientX: start[0], clientY: start[1] });
    fireEvent.mouseMove(window, { clientX: first[0], clientY: first[1] });
    fireEvent.mouseMove(canvas, { clientX: second[0], clientY: second[1] });
    fireEvent.mouseMove(canvas, { clientX: third[0], clientY: third[1] });
    // Release over the viewer as well; its listener must not strand the drag.
    fireEvent.mouseUp(canvas);
    fireEvent.mouseMove(window, { clientX: 999, clientY: 999 });
    fireEvent.mouseMove(canvas, { clientX: 999, clientY: 999 });
    fireEvent.mouseUp(canvas);

    expect(onResize.mock.calls).toStrictEqual([first, second, third]);
    expect(viewerMove).toHaveBeenCalledTimes(2);
    expect(viewerUp).toHaveBeenCalledTimes(1);
    expect(layoutMouseDown).not.toHaveBeenCalled();
  });

  it('ends the drag when the window loses focus', () => {
    expect.hasAssertions();
    const { handle, canvas, onResize, viewerMove } = renderResizer();
    fireEvent.mouseDown(handle, { button: 0 });
    fireEvent.mouseMove(window, { clientX: 600, clientY: 200 });
    fireEvent.blur(window);
    fireEvent.mouseMove(window, { clientX: 700, clientY: 200 });
    fireEvent.mouseMove(canvas, { clientX: 700, clientY: 200 });
    fireEvent.mouseUp(window);

    expect(onResize.mock.calls).toStrictEqual([[600, 200]]);
    expect(viewerMove).toHaveBeenCalledTimes(1);
  });

  it('releases the active drag when the divider unmounts', () => {
    expect.hasAssertions();
    const { handle, onResize, unmount } = renderResizer();
    fireEvent.mouseDown(handle, { button: 0 });
    fireEvent.mouseMove(window, { clientX: 600, clientY: 200 });
    unmount();
    fireEvent.mouseMove(window, { clientX: 700, clientY: 200 });
    fireEvent.mouseUp(window);

    expect(onResize.mock.calls).toStrictEqual([[600, 200]]);
  });

  it('does not start resizing with a secondary mouse button', () => {
    expect.hasAssertions();
    const { handle, onResize } = renderResizer();
    fireEvent.mouseDown(handle, { button: 2 });
    fireEvent.mouseMove(window, { clientX: 600, clientY: 200 });
    fireEvent.mouseUp(window, { button: 2 });

    expect(onResize).not.toHaveBeenCalled();
  });
});
