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
