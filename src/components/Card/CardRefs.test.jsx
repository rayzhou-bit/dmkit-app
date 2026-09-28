import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';

import CardRefs from './CardRefs';

// Hand-rolled fake store, matching the pattern in CustomContent.test.jsx.
const makeStore = (cards) => {
  const dispatched = [];
  return {
    dispatched,
    getState: () => ({ project: { present: { cards } } }),
    dispatch: (action) => { dispatched.push(action); return action; },
    subscribe: () => () => {},
  };
};

const renderRefs = (cards, cardId = 'c1') => {
  const store = makeStore(cards);
  const utils = render(<Provider store={store}><CardRefs cardId={cardId} /></Provider>);
  return { ...utils, store };
};

describe('CardRefs', () => {
  it('renders nothing when there are no refs', () => {
    const { container } = renderRefs({ c1: { title: 'Card One' } });
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing for a card with no refs key at all', () => {
    const { container } = renderRefs({ c1: { title: 'Card One' } });
    expect(container.querySelector('.card-refs')).toBeNull();
  });

  it('renders a chip per ref with the referenced card\'s current title', () => {
    const { getByText } = renderRefs({
      c1: { title: 'Card One', refs: ['c2', 'c3'] },
      c2: { title: 'Goblin' },
      c3: { title: 'Tavern' },
    });
    expect(getByText('Goblin')).not.toBeNull();
    expect(getByText('Tavern')).not.toBeNull();
  });

  it('clicking a live chip dispatches focusCard with the ref id', () => {
    const { getByText, store } = renderRefs({
      c1: { title: 'Card One', refs: ['c2'] },
      c2: { title: 'Goblin' },
    });
    fireEvent.click(getByText('Goblin'));
    expect(store.dispatched).toContainEqual({
      type: 'session/focusCard',
      payload: { cardId: 'c2' },
    });
  });

  it('clicking the x dispatches removeCardRef', () => {
    const { getByLabelText, store } = renderRefs({
      c1: { title: 'Card One', refs: ['c2'] },
      c2: { title: 'Goblin' },
    });
    fireEvent.click(getByLabelText('Remove reference to Goblin'));
    expect(store.dispatched).toContainEqual({
      type: 'project/removeCardRef',
      payload: { id: 'c1', refId: 'c2' },
    });
  });

  it('renders a dangling, non-navigating chip for a ref to a deleted card, still removable', () => {
    const { getByText, getByLabelText, store } = renderRefs({
      c1: { title: 'Card One', refs: ['gone'] },
    });
    const label = getByText('Deleted card');
    expect(label.disabled).toBe(true);

    fireEvent.click(label);
    expect(store.dispatched).toHaveLength(0);

    fireEvent.click(getByLabelText('Remove reference to deleted card'));
    expect(store.dispatched).toContainEqual({
      type: 'project/removeCardRef',
      payload: { id: 'c1', refId: 'gone' },
    });
  });
});
