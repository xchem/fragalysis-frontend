import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { legacy_createStore } from 'redux';
import { ThemeProvider } from '../../../../ui/styles';
import { getTheme } from '../../../../theme';
import { NglContext } from '../../../nglView/nglProvider';
import { VIEWS } from '../../../../constants/constants';
import DisplayControls from './index';
import { EditRepresentationMenu } from './editRepresentationMenu';

const mockTreeRender = jest.fn();
jest.mock('../../../common/Navigation/Drawer', () => ({ Drawer: ({ children }) => <section>{children}</section> }));
jest.mock('@mui/x-tree-view/RichTreeView', () => ({
  RichTreeView: ({ items, slotProps }) => {
    const TreeItem = require('@mui/x-tree-view/TreeItem').TreeItem;
    const renderItem = item => (
      <TreeItem key={item.id} itemId={item.id} label={slotProps.item({ itemId: item.id }).label}>
        {item.children?.map(renderItem)}
      </TreeItem>
    );
    mockTreeRender();
    return <div data-testid="object-tree">{items.map(renderItem)}</div>;
  }
}));
jest.mock('@mui/x-tree-view/TreeItem', () => ({
  TreeItem: ({ itemId, label, children }) => (
    <div data-testid={itemId}>
      {label}
      {children}
    </div>
  )
}));
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Box: ({ onClick }) => <button aria-label="Choose color" onClick={onClick} />,
  Popover: ({ open }) => <div data-testid="color-picker" data-open={String(open)} />,
  Menu: ({ children, open, onClose }) => (
    <div data-testid="editor-menu" data-open={String(open)}>
      <button onClick={onClose}>Close editor</button>
      {children}
    </div>
  )
}));

const object = name => ({
  name,
  display_div: VIEWS.MAJOR_VIEW,
  representations: [
    { uuid: name, lastKnownID: name, type: 'ball+stick', params: { visible: true }, templateParams: {} }
  ]
});
const createStore = () =>
  legacy_createStore((state = { nglReducers: { objectsInView: { initial: object('initial') } } }, action) =>
    action.objects ? { nglReducers: { objectsInView: action.objects } } : state
  );
const adapter = { getObject: jest.fn() };
const context = { getViewerAdapter: () => adapter };
const view = (store, open) => (
  <Provider store={store}>
    <ThemeProvider theme={getTheme()}>
      <NglContext.Provider value={context}>
        <DisplayControls open={open} onClose={() => {}} />
      </NglContext.Provider>
    </ThemeProvider>
  </Provider>
);

describe('display controls during bulk loading', () => {
  it('does no hidden tree/editor work for 930 updates and shows current objects on reopening', () => {
    expect.hasAssertions();
    const store = createStore();
    const initial = store.getState().nglReducers.objectsInView.initial;
    const { rerender } = render(view(store, false));
    mockTreeRender.mockClear();
    adapter.getObject.mockClear();
    for (let id = 1; id <= 930; id++) {
      act(() => store.dispatch({ type: 'LOAD', objects: { initial, latest: object(`ligand-${id}`) } }));
    }
    expect(mockTreeRender).not.toHaveBeenCalled();
    expect(adapter.getObject).not.toHaveBeenCalled();
    rerender(view(store, true));
    expect(screen.getByTestId('object-tree')).toHaveTextContent('ligand-930');
    act(() => store.dispatch({ type: 'REMOVE', objects: { latest: object('remaining') } }));
    expect(screen.queryByTestId('initial')).not.toBeInTheDocument();
    expect(screen.getByTestId('remaining')).toBeInTheDocument();
  });

  it('keeps an open editor mounted and current when the drawer closes', () => {
    expect.hasAssertions();
    const store = createStore();
    const { rerender } = render(view(store, true));
    fireEvent.click(within(screen.getByTestId('initial___0')).getAllByRole('button')[0]);
    const editor = screen.getByTestId('editor-menu');
    expect(editor).toHaveAttribute('data-open', 'true');
    rerender(view(store, false));
    act(() =>
      store.dispatch({ type: 'LOAD', objects: { ...store.getState().nglReducers.objectsInView, next: object('next') } })
    );
    expect(screen.getByTestId('next')).toBeInTheDocument();
    expect(screen.getAllByTestId('editor-menu')[0]).toBe(editor);
    expect(editor).toHaveAttribute('data-open', 'true');
    fireEvent.click(within(editor).getByRole('button', { name: 'Close editor' }));
    mockTreeRender.mockClear();
    adapter.getObject.mockClear();
    act(() => store.dispatch({ type: 'LOAD', objects: { initial: object('initial'), last: object('last') } }));
    expect(mockTreeRender).not.toHaveBeenCalled();
    expect(adapter.getObject).not.toHaveBeenCalled();
    rerender(view(store, true));
    expect(screen.getByTestId('last')).toBeInTheDocument();
    expect(screen.queryByTestId('next')).not.toBeInTheDocument();
  });

  it('keeps a visible color picker subscribed after its menu closes and tolerates removal of its object', () => {
    expect.hasAssertions();
    const store = createStore();
    const representation = {
      ...object('initial').representations[0],
      params: { colorValue: 0xff0000 },
      templateParams: { colorValue: { type: 'color' } }
    };
    const renderEditor = anchor => (
      <Provider store={store}>
        <ThemeProvider theme={getTheme()}>
          <NglContext.Provider value={context}>
            <EditRepresentationMenu parentKey="initial" representation={representation} editMenuAnchor={anchor} />
          </NglContext.Provider>
        </ThemeProvider>
      </Provider>
    );
    const { rerender } = render(renderEditor(document.createElement('button')));
    fireEvent.click(screen.getByRole('button', { name: 'Choose color' }));
    rerender(renderEditor(null));
    expect(screen.getByTestId('color-picker')).toHaveAttribute('data-open', 'true');
    adapter.getObject.mockClear();
    act(() =>
      store.dispatch({ type: 'LOAD', objects: { ...store.getState().nglReducers.objectsInView, next: object('next') } })
    );
    expect(adapter.getObject).toHaveBeenCalledWith('initial');
    act(() => store.dispatch({ type: 'REMOVE', objects: { next: object('next') } }));
    expect(screen.queryByTestId('color-picker')).not.toBeInTheDocument();
  });
});
