import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { legacy_createStore } from 'redux';
import useDisableNglControlButtons from './useDisableNglControlButtons';

const createStore = buttons =>
  legacy_createStore((state = { previewReducers: { molecule: { disableNglControlButtons: buttons } } }, action) =>
    action.buttons
      ? {
          previewReducers: { molecule: { disableNglControlButtons: action.buttons } }
        }
      : state
  );
const wrap = store => ({ children }) => <Provider store={store}>{children}</Provider>;

describe('group viewer control readiness', () => {
  it('reads each of 930 selected IDs once and reuses membership and flags on rerenders', () => {
    expect.hasAssertions();
    let reads = 0;
    const selected = Array.from({ length: 930 }, (_, index) => ({
      get id() {
        reads++;
        return index + 1;
      }
    }));
    const buttons = Object.fromEntries(Array.from({ length: 930 }, (_, index) => [index + 1, { ligand: false }]));
    const store = createStore(buttons);
    const { result, rerender } = renderHook(() => useDisableNglControlButtons(selected), { wrapper: wrap(store) });
    expect(reads).toBe(930);
    const original = result.current;
    expect(original).toStrictEqual({ ligand: false, protein: false, complex: false });
    reads = 0;
    rerender();
    expect(reads).toBe(0);
    expect(result.current).toBe(original);
    act(() => store.dispatch({ type: 'UPDATE', buttons: { ...buttons, unrelated: { protein: true } } }));
    expect(reads).toBe(0);
    expect(result.current).toBe(original);
  });

  it('preserves numeric/string ID matching, selected-only flags and stable identity when values do not change', () => {
    expect.hasAssertions();
    const buttons = { 1: { ligand: true }, 2: { protein: true }, 'rhs-tag-7': { complex: true } };
    const store = createStore(buttons);
    const selected = [{ id: 1 }, { id: 'rhs-tag-7' }];
    const { result, rerender } = renderHook(({ items }) => useDisableNglControlButtons(items), {
      initialProps: { items: selected },
      wrapper: wrap(store)
    });
    expect(result.current).toStrictEqual({ ligand: true, protein: false, complex: true });
    const original = result.current;
    act(() => store.dispatch({ type: 'UPDATE', buttons: { ...buttons, 99: { ligand: true } } }));
    expect(result.current).toBe(original);
    rerender({ items: [{ id: '2' }] });
    expect(result.current).toStrictEqual({ ligand: false, protein: true, complex: false });
    rerender({ items: [] });
    expect(result.current).toStrictEqual({ ligand: false, protein: false, complex: false });
  });
});
