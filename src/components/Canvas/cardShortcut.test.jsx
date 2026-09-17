import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { Provider } from 'react-redux';

import { useCardShortcutHooks } from './hooks';

// Hand-rolled fake store supporting thunk dispatch (destroySelectedCards is
// a thunk) - same pattern as ToolMenu/index.test.jsx.
const makeState = (overrides = {}) => ({
  session: {
    activeCardId: 'c1',
    selectedCards: [],
    popup: { id: null, type: null },
  },
  project: {
    present: {
      activeViewId: 'tab1',
      viewOrder: ['tab1'],
      views: { tab1: { pos: { x: 0, y: 0 } } },
      cards: {
        c1: { content: { text: '' } }, // empty - deletes immediately, no popup
      },
    },
  },
  ...overrides,
});

const makeStore = (initial) => {
  const state = initial;
  const dispatched = [];
  const store = {
    dispatched,
    getState: () => state,
    dispatch: (action) => {
      if (typeof action === 'function') return action(store.dispatch, store.getState);
      dispatched.push(action);
      return action;
    },
    subscribe: () => () => {},
  };
  return store;
};

const makeGroupDrag = (isActive = false) => ({ isActive: () => isActive });

const Harness = ({ groupDrag }) => {
  useCardShortcutHooks({ groupDrag });
  return <textarea data-testid="text-entry" />;
};

const setup = (state, groupDrag = makeGroupDrag()) => {
  const store = makeStore(state);
  const utils = render(<Provider store={store}><Harness groupDrag={groupDrag} /></Provider>);
  return { store, ...utils };
};

describe('useCardShortcutHooks', () => {
  it('Delete deletes the active (empty) card immediately, no popup, and prevents default', () => {
    const { store } = setup(makeState());
    const event = new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true });
    fireEvent(window, event);

    expect(store.dispatched).toContainEqual({ type: 'project/destroyCards', payload: { ids: ['c1'] } });
    expect(event.defaultPrevented).toBe(true);
  });

  it('Backspace does the same as Delete', () => {
    const { store } = setup(makeState());
    fireEvent.keyDown(window, { key: 'Backspace' });
    expect(store.dispatched).toContainEqual({ type: 'project/destroyCards', payload: { ids: ['c1'] } });
  });

  it('is ignored while typing in a text field', () => {
    const { store, getByTestId } = setup(makeState());
    fireEvent.keyDown(getByTestId('text-entry'), { key: 'Delete' });
    expect(store.dispatched).toHaveLength(0);
  });

  it('is ignored while a popup is open', () => {
    const { store } = setup(makeState({ session: { activeCardId: 'c1', selectedCards: [], popup: { id: 'x', type: 'something' } } }));
    fireEvent.keyDown(window, { key: 'Delete' });
    expect(store.dispatched).toHaveLength(0);
  });

  it('is ignored mid group-drag', () => {
    const { store } = setup(makeState(), makeGroupDrag(true));
    fireEvent.keyDown(window, { key: 'Delete' });
    expect(store.dispatched).toHaveLength(0);
  });

  it('is a no-op when there is nothing to delete', () => {
    const { store } = setup(makeState({ session: { activeCardId: null, selectedCards: [], popup: { id: null, type: null } } }));
    fireEvent.keyDown(window, { key: 'Delete' });
    expect(store.dispatched).toHaveLength(0);
  });
});
