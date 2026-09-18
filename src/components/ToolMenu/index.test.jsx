import React, { useRef } from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';

import ToolMenu from './index';

// Hand-rolled fake store, matching the pattern in Canvas/testUtils.jsx.
const makeState = (overrides = {}) => ({
  session: {
    activeCardId: null,
    selectedCards: [],
  },
  project: {
    present: {
      activeViewId: null,
      viewOrder: [],
      views: {},
      cards: {},
    },
  },
  ...overrides,
});

// createNewCard/copySelectedCard(s) are thunks - dispatch needs to invoke
// them (thunk middleware) rather than just recording the function.
const makeStore = (initial = makeState()) => {
  let state = initial;
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

const Harness = ({ store }) => {
  const toolMenuRef = useRef();
  return (
    <Provider store={store}>
      <ToolMenu isOpen toolMenuRef={toolMenuRef} />
    </Provider>
  );
};

describe('ToolMenu image button', () => {
  it('is disabled when there is no active tab', () => {
    const store = makeStore(makeState());
    const { getByText } = render(<Harness store={store} />);
    expect(getByText('image').closest('button')).toBeDisabled();
  });

  it('is enabled when there is an active tab', () => {
    const store = makeStore(makeState({
      project: { present: { activeViewId: 'tab1', viewOrder: ['tab1'], views: { tab1: { pos: { x: 0, y: 0 } } }, cards: {} } },
    }));
    const { getByText } = render(<Harness store={store} />);
    expect(getByText('image').closest('button')).not.toBeDisabled();
  });

  it('dispatches a project/createCard action with type: image on click', () => {
    const store = makeStore(makeState({
      project: { present: { activeViewId: 'tab1', viewOrder: ['tab1'], views: { tab1: { pos: { x: 0, y: 0 } } }, cards: {} } },
    }));
    const { getByText } = render(<Harness store={store} />);
    fireEvent.click(getByText('image').closest('button'));

    const createCardAction = store.dispatched.find(a => a.type === 'project/createCard');
    expect(createCardAction).toBeDefined();
    expect(createCardAction.payload.type).toBe('image');
  });
});

describe('ToolMenu delete button', () => {
  const withTab = (extra = {}) => makeState({
    project: {
      present: {
        activeViewId: 'tab1',
        viewOrder: ['tab1'],
        views: { tab1: { pos: { x: 0, y: 0 } } },
        cards: {
          c1: { content: { text: 'hi' } },
          c2: { content: { text: '' } },
        },
        ...extra,
      },
    },
  });

  it('is disabled when there is no active tab', () => {
    const store = makeStore(makeState());
    const { getByText } = render(<Harness store={store} />);
    expect(getByText('delete').closest('button')).toBeDisabled();
  });

  it('is disabled with an active tab but nothing selected/active', () => {
    const store = makeStore(withTab());
    const { getByText } = render(<Harness store={store} />);
    expect(getByText('delete').closest('button')).toBeDisabled();
  });

  it('deletes immediately (no popup) when the active card is empty', () => {
    const state = withTab();
    state.session.activeCardId = 'c2';
    const store = makeStore(state);
    const { getByText } = render(<Harness store={store} />);
    fireEvent.click(getByText('delete').closest('button'));

    expect(store.dispatched).toContainEqual({ type: 'project/destroyCards', payload: { ids: ['c2'] } });
    expect(store.dispatched.some(a => a.type === 'session/setPopup')).toBe(false);
  });

  it('opens the confirmation popup when the active card has content', () => {
    const state = withTab();
    state.session.activeCardId = 'c1';
    const store = makeStore(state);
    const { getByText } = render(<Harness store={store} />);
    fireEvent.click(getByText('delete').closest('button'));

    const popupAction = store.dispatched.find(a => a.type === 'session/setPopup');
    expect(popupAction).toEqual({ type: 'session/setPopup', payload: { type: 'confirmCardsDelete', ids: ['c1'] } });
    expect(store.dispatched.some(a => a.type === 'project/destroyCards')).toBe(false);
  });

  it('uses the multi-selection over the active card, and confirms if ANY selected card has content', () => {
    const state = withTab();
    state.session.selectedCards = ['c2', 'c1']; // c2 empty, c1 has content
    const store = makeStore(state);
    const { getByText } = render(<Harness store={store} />);
    fireEvent.click(getByText('delete').closest('button'));

    const popupAction = store.dispatched.find(a => a.type === 'session/setPopup');
    expect(popupAction.payload).toEqual({ type: 'confirmCardsDelete', ids: ['c2', 'c1'] });
  });

  it('deletes an all-empty multi-selection immediately, no popup', () => {
    const state = withTab();
    state.session.selectedCards = ['c2'];
    const store = makeStore(state);
    const { getByText } = render(<Harness store={store} />);
    fireEvent.click(getByText('delete').closest('button'));

    expect(store.dispatched).toContainEqual({ type: 'project/destroyCards', payload: { ids: ['c2'] } });
    expect(store.dispatched.some(a => a.type === 'session/setPopup')).toBe(false);
  });
});
