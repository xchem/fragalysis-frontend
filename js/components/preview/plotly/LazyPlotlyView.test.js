import React from 'react';
import { render, screen } from '@testing-library/react';
import LazyPlotlyView from './LazyPlotlyView';

const mockLoad = jest.fn();
const mockRender = jest.fn();
jest.mock('./plotlyView', () => {
  mockLoad();
  return {
    PlotlyView: props => {
      mockRender(props);
      return <div>Charts ready</div>;
    }
  };
});

describe('deferred plot initialization', () => {
  it('loads the charts module only when mounted and forwards panel callbacks', async () => {
    expect.hasAssertions();
    expect(mockLoad).not.toHaveBeenCalled();
    const expandHandler = jest.fn();
    const onResize = jest.fn();
    const { rerender } = render(<LazyPlotlyView expandHandler={expandHandler} onResize={onResize} />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading plots');
    expect(await screen.findByText('Charts ready')).toBeVisible();
    expect(mockLoad).toHaveBeenCalledTimes(1);
    expect(mockRender).toHaveBeenLastCalledWith({ expandHandler, onResize });
    rerender(<LazyPlotlyView expandHandler={expandHandler} onResize={onResize} />);
    expect(mockLoad).toHaveBeenCalledTimes(1);
  });
});
