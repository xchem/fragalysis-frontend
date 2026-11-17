import React from 'react';
import { render } from '@testing-library/react';

jest.mock('../nglView/nglView', () => ({
  __esModule: true,
  default: props => <div data-testid="ngl-view" id={props.div_id} />
}));
jest.mock('./MoorhenView', () => ({ __esModule: true, default: () => <div data-testid="moorhen-view" /> }));

describe('application viewer selection', () => {
  it.each(['ngl', 'moorhen'])('mounts the configured %s host without mounting the other engine', async engine => {
    expect.hasAssertions();
    let ViewerView;
    jest.isolateModules(() => {
      jest.doMock('../../config/viewer', () => ({ VIEWER_ENGINE: engine }));
      ViewerView = require('./ViewerView').default;
    });
    const view = render(<ViewerView div_id="major_view" />);
    expect(await view.findByTestId(`${engine}-view`)).toBeInTheDocument();
    expect(view.queryByTestId(`${engine === 'ngl' ? 'moorhen' : 'ngl'}-view`)).not.toBeInTheDocument();
  });
});
