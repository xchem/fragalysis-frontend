import React, { StrictMode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { legacy_createStore } from 'redux';
import { ThemeProvider } from '../../ui/styles';
import { getTheme } from '../../theme';
import { ToastContext } from '../toast';
import { Landing } from './Landing';

jest.mock('../../utils/djangoContext', () => ({
  DJANGO_CONTEXT: { authenticated: true, username: 'tester' }
}));
jest.mock('../target/targetList', () => ({
  TargetList: ({ title, list }) => <section aria-label={title}>{list.map(target => target.title).join(', ')}</section>
}));
jest.mock('../target/targetSettingsModal', () => ({ TargetSettingsModal: () => null }));
jest.mock('../target/withLoadingProjects', () => ({ withLoadingProjects: component => component }));

const renderLanding = () => {
  const state = {
    apiReducers: {
      target_id_list: [
        { title: 'Public', project: { open_to_public: true } },
        { title: 'Private', project: { open_to_public: false } }
      ],
      legacy_target_id_list: [{ title: 'Legacy' }]
    },
    selectionReducers: { toastMessages: [] },
    targetReducers: { isEditTargetDialogOpen: false }
  };
  const store = legacy_createStore((current = state) => current);
  const noop = jest.fn();
  return render(
    <StrictMode>
      <Provider store={store}>
        <ThemeProvider theme={getTheme()}>
          <ToastContext.Provider value={{ toast: noop }}>
            <Landing
              resetSelectionState={noop}
              resetTargetState={noop}
              resetCurrentCompoundsSettings={noop}
              resetProjectsReducer={noop}
            />
          </ToastContext.Provider>
        </ThemeProvider>
      </Provider>
    </StrictMode>
  );
};

describe('stacked landing panels', () => {
  it('groups targets and resizes only adjacent panels without losing proportions on window resize', () => {
    expect.hasAssertions();
    renderLanding();
    const panels = ['Public targets', 'Private targets', 'Legacy targets'].map(title =>
      screen.getByRole('region', { name: title })
    );
    expect(panels.map(panel => panel.textContent)).toStrictEqual(['Public', 'Private', 'Legacy']);
    const wrappers = panels.map(panel => panel.parentElement);
    expect(wrappers.map(panel => Number(panel.style.flexGrow))).toStrictEqual([0.6, 0.2, 0.2]);
    wrappers.forEach((panel, index) => {
      jest.spyOn(panel, 'getBoundingClientRect').mockReturnValue({ height: index === 0 ? 600 : 200 });
    });
    fireEvent.mouseDown(screen.getByRole('separator', { name: 'Resize public and private targets' }), { clientY: 600 });
    fireEvent.mouseMove(window, { clientY: 500 });
    fireEvent.mouseUp(window);
    expect(Number(wrappers[0].style.flexGrow)).toBeCloseTo(0.5);
    expect(Number(wrappers[1].style.flexGrow)).toBeCloseTo(0.3);
    expect(Number(wrappers[2].style.flexGrow)).toBeCloseTo(0.2);
    fireEvent(window, new Event('resize'));
    expect(Number(wrappers[0].style.flexGrow)).toBeCloseTo(0.5);
    fireEvent.mouseDown(screen.getByRole('separator', { name: 'Resize private and legacy targets' }), { clientY: 700 });
    fireEvent.mouseMove(window, { clientY: 750 });
    fireEvent.mouseUp(window);
    expect(Number(wrappers[0].style.flexGrow)).toBeCloseTo(0.5);
    expect(Number(wrappers[1].style.flexGrow)).toBeGreaterThan(0.3);
    expect(Number(wrappers[2].style.flexGrow)).toBeLessThan(0.2);
    expect(wrappers.reduce((sum, panel) => sum + Number(panel.style.flexGrow), 0)).toBeCloseTo(1);
  });

  it('clamps dragging at a usable height and removes drag listeners on unmount', () => {
    expect.hasAssertions();
    const view = renderLanding();
    const divider = screen.getByRole('separator', { name: 'Resize public and private targets' });
    const first = divider.previousElementSibling;
    const second = divider.nextElementSibling;
    jest.spyOn(first, 'getBoundingClientRect').mockReturnValue({ height: 600 });
    jest.spyOn(second, 'getBoundingClientRect').mockReturnValue({ height: 200 });
    const remove = jest.spyOn(window, 'removeEventListener');
    fireEvent.mouseDown(divider, { clientY: 600 });
    fireEvent.mouseMove(window, { clientY: 10000 });
    expect(Number(second.style.flexGrow)).toBeCloseTo(0.07);
    view.unmount();
    expect(remove).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(remove).toHaveBeenCalledWith('mouseup', expect.any(Function));
    remove.mockRestore();
  });
});
