import React, { Profiler } from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { legacy_createStore } from 'redux';
import { ThemeProvider } from '../../../../ui/styles';
import { getTheme } from '../../../../theme';
import { NglContext } from '../../../nglView/nglProvider';
import { VIEWS } from '../../../../constants/constants';
import DisplayControls from './index';
import { TreeItem } from '@mui/x-tree-view/TreeItem';

jest.mock('../../../common/Navigation/Drawer', () => ({ Drawer: ({ children }) => <section>{children}</section> }));
jest.mock('./editRepresentationMenu', () => ({
  EditRepresentationMenu: ({ editMenuAnchor }) => (
    <div data-testid="editor" data-open={String(Boolean(editMenuAnchor))} />
  )
}));

const object = name => ({
  name,
  display_div: VIEWS.MAJOR_VIEW,
  representations: [
    { uuid: name, lastKnownID: name, type: 'ball+stick', params: { visible: true }, templateParams: {} }
  ]
});
const adapter = {
  getObject: jest.fn(),
  getRepresentation: jest.fn(),
  getRepresentationParameter: jest.fn(),
  setVisibility: jest.fn()
};
const context = { getViewerAdapter: () => adapter };
const createStore = objects =>
  legacy_createStore((state = { nglReducers: { objectsInView: objects } }, action) =>
    action.objects ? { nglReducers: { objectsInView: action.objects } } : state
  );
const view = (store, open, onRender = () => {}) => (
  <Provider store={store}>
    <ThemeProvider theme={getTheme()}>
      <NglContext.Provider value={context}>
        <Profiler id="tree" onRender={onRender}>
          <DisplayControls open={open} />
        </Profiler>
      </NglContext.Provider>
    </ThemeProvider>
  </Provider>
);

describe('real Display controls tree', () => {
  it('does not rerender an existing styled TreeItem when another object is added', () => {
    expect.hasAssertions();
    const renderItem = jest.spyOn(TreeItem, 'render');
    try {
      const initial = object('initial');
      const store = createStore({ initial });
      render(view(store, true));
      renderItem.mockClear();
      act(() => store.dispatch({ type: 'LOAD', objects: { initial, z: object('z') } }));
      expect(renderItem.mock.calls.filter(([props]) => props.itemId === 'initial')).toHaveLength(0);
      expect(screen.getByRole('treeitem', { name: 'z' })).toBeInTheDocument();
    } finally {
      renderItem.mockRestore();
    }
  });

  it('bases the group visibility toggle on the first displayed representation without reordering Redux data', () => {
    expect.hasAssertions();
    const initial = object('initial');
    initial.representations = Object.freeze([
      { ...initial.representations[0], uuid: 'z', lastKnownID: 'z', params: { visible: true } },
      { ...initial.representations[0], uuid: 'a', lastKnownID: 'a', params: { visible: false } }
    ]);
    const component = { buffers: new Uint8Array(64) };
    component.parent = component;
    const handles = { a: { parentObject: component }, z: { parentObject: component } };
    adapter.getObject.mockReturnValue(component);
    adapter.getRepresentation.mockImplementation((owner, representation) => handles[representation.uuid]);
    adapter.getRepresentationParameter.mockReturnValue(undefined);
    adapter.setVisibility.mockClear();
    render(view(createStore({ initial }), true));
    fireEvent.click(within(screen.getByRole('treeitem', { name: 'initial' })).getAllByRole('button')[1]);
    expect(adapter.setVisibility).toHaveBeenCalledWith(handles.a, true);
    expect(adapter.setVisibility).toHaveBeenCalledWith(handles.z, true);
    expect(initial.representations.map(representation => representation.lastKnownID)).toStrictEqual(['z', 'a']);
  });

  it('registers 930 objects together and keeps collapsed editors unmounted', () => {
    expect.hasAssertions();
    const objects = Object.fromEntries(
      Array.from({ length: 930 }, (_, id) => [`ligand-${id}`, object(`ligand-${id}`)])
    );
    const commits = jest.fn();
    render(view(createStore(objects), true, commits));
    expect(screen.getAllByRole('treeitem')).toHaveLength(930);
    expect(screen.queryByTestId('editor')).not.toBeInTheDocument();
    expect(commits.mock.calls.length).toBeLessThan(20);
  }, 30000);

  it('preserves expansion, editing state and keyboard navigation when objects are added or the drawer closes', () => {
    expect.hasAssertions();
    const initial = object('initial');
    const store = createStore({ initial });
    const { rerender } = render(view(store, true));
    const item = screen.getByRole('treeitem', { name: 'initial' });
    fireEvent.click(item.querySelector('.MuiTreeItem-iconContainer'));
    expect(item).toHaveAttribute('aria-expanded', 'true');
    const representationItem = screen.getByRole('combobox').closest('[role="treeitem"]');
    fireEvent.click(within(representationItem).getAllByRole('button')[0]);
    const editor = screen.getByTestId('editor');
    expect(editor).toHaveAttribute('data-open', 'true');
    act(() => store.dispatch({ type: 'LOAD', objects: { initial, next: object('next') } }));
    expect(screen.getByTestId('editor')).toBe(editor);
    expect(item).toHaveAttribute('aria-expanded', 'true');
    rerender(view(store, false));
    expect(screen.getByTestId('editor')).toBe(editor);
    expect(editor).toHaveAttribute('data-open', 'true');
    act(() =>
      store.dispatch({
        type: 'UPDATE',
        objects: {
          initial: {
            ...initial,
            representations: initial.representations.map(representation => ({ ...representation, type: 'line' }))
          },
          next: object('next')
        }
      })
    );
    expect(screen.getByRole('combobox')).toHaveValue('line');
    expect(screen.getByTestId('editor')).toBe(editor);
    fireEvent.focus(item);
    fireEvent.keyDown(item, { key: 'ArrowDown' });
    expect(representationItem).toHaveFocus();
    act(() => store.dispatch({ type: 'REMOVE', objects: { next: object('next') } }));
    expect(screen.queryByText('initial')).not.toBeInTheDocument();
  });

  it('creates controls on first visibility, keeps visited controls mounted and releases its shared observer', () => {
    expect.hasAssertions();
    const originalObserver = global.IntersectionObserver;
    let notify;
    let constructors = 0;
    const observer = { observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn() };
    global.IntersectionObserver = class {
      constructor(callback) {
        constructors++;
        notify = callback;
        return observer;
      }
    };
    try {
      const objects = Object.fromEntries(
        Array.from({ length: 930 }, (_, id) => [`ligand-${id}`, object(`ligand-${id}`)])
      );
      render(view(createStore(objects), true));
      expect(constructors).toBe(1);
      expect(observer.observe).toHaveBeenCalledTimes(930);
      expect(screen.queryAllByRole('button')).toHaveLength(0);
      const node = observer.observe.mock.calls[0][0];
      act(() => notify([{ target: node, isIntersecting: true }]));
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
      act(() => notify([{ target: node, isIntersecting: false }]));
      expect(screen.getAllByRole('button')[0]).toBe(buttons[0]);
      cleanup();
      expect(observer.disconnect).toHaveBeenCalledTimes(1);
    } finally {
      cleanup();
      global.IntersectionObserver = originalObserver;
    }
  }, 30000);
});
