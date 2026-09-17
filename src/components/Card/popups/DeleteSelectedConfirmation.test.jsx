import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';

import { DeleteConfirmation } from './DeleteSelectedConfirmation';

// destroySelectedCards is a thunk - dispatch needs to invoke it.
const makeStore = () => {
  const dispatched = [];
  const store = {
    dispatched,
    getState: () => ({ session: { activeCardId: 'c1' } }),
    dispatch: (action) => {
      if (typeof action === 'function') return action(store.dispatch, store.getState);
      dispatched.push(action);
      return action;
    },
    subscribe: () => () => {},
  };
  return store;
};

describe('DeleteSelectedConfirmation', () => {
  it('pluralizes for more than one card', () => {
    const store = makeStore();
    const { getByText } = render(
      <Provider store={store}><DeleteConfirmation ids={['c1', 'c2', 'c3']} /></Provider>,
    );
    expect(getByText('Delete 3 Cards')).toBeTruthy();
    expect(getByText('Are you sure you want to delete these 3 cards?')).toBeTruthy();
  });

  it('uses singular text for exactly one card', () => {
    const store = makeStore();
    const { getByText } = render(
      <Provider store={store}><DeleteConfirmation ids={['c1']} /></Provider>,
    );
    expect(getByText('Delete Card')).toBeTruthy();
    expect(getByText('Are you sure you want to delete this card?')).toBeTruthy();
  });

  it('confirm dispatches destroyCards for every id and resets the popup', () => {
    const store = makeStore();
    const { getByText } = render(
      <Provider store={store}><DeleteConfirmation ids={['c1', 'c2']} /></Provider>,
    );
    fireEvent.click(getByText('OK'));

    expect(store.dispatched).toContainEqual({ type: 'project/destroyCards', payload: { ids: ['c1', 'c2'] } });
    expect(store.dispatched).toContainEqual({ type: 'session/resetPopup' });
  });

  it('cancel only resets the popup', () => {
    const store = makeStore();
    const { getByText } = render(
      <Provider store={store}><DeleteConfirmation ids={['c1', 'c2']} /></Provider>,
    );
    fireEvent.click(getByText('Cancel'));

    expect(store.dispatched).toEqual([{ type: 'session/resetPopup' }]);
  });
});
