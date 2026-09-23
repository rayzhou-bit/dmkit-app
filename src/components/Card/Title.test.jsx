import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';

import Title from './Title';
import LibraryTitle from './LibraryTitle';

// Minimal fake store covering both Title's and LibraryTitle's selector needs
// (color, title, type, content, views, activeViewId).
const makeStore = ({ type = 'text', content = {} } = {}) => {
  const dispatched = [];
  // A stable state object - react-redux's Provider runs its own
  // useSyncExternalStore off getState identity, so a fresh object on every
  // call (even with unchanged nested content) trips React's "getSnapshot
  // should be cached" loop guard.
  const state = {
    project: {
      present: {
        activeViewId: 'tab1',
        cards: {
          c1: {
            title: 'A Long Dragon Name',
            color: 'gray',
            type,
            content,
            views: { tab1: { pos: { x: 0, y: 0 }, size: { width: 1, height: 1 } } },
          },
        },
      },
    },
    session: {},
  };
  return {
    dispatched,
    getState: () => state,
    dispatch: (action) => { dispatched.push(action); return action; },
    subscribe: () => () => {},
  };
};

const renderTitle = (Component, storeOverrides) => {
  const store = makeStore(storeOverrides);
  const utils = render(
    <Provider store={store}>
      <Component cardId='c1' setEditingCard={() => {}} />
    </Provider>
  );
  return { ...utils, store };
};

describe.each([
  ['Title (canvas)', Title],
  ['LibraryTitle (library)', LibraryTitle],
])('%s - double-clicking the title', (name, Component) => {
  it('selects the entire value, ready to be fully overwritten', () => {
    const { container } = renderTitle(Component);
    const input = container.querySelector('.card-title input');
    fireEvent.doubleClick(input);
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe('A Long Dragon Name'.length);
  });
});

describe.each([
  ['Title (canvas)', Title],
  ['LibraryTitle (library)', LibraryTitle],
])('%s - monster type icon', (name, Component) => {
  it('shows the monster icon for a monster card', () => {
    const { container } = renderTitle(Component, { type: 'monster' });
    expect(container.querySelector('.card-title.has-type-icon .type-icon')).not.toBeNull();
  });

  it('does not show the icon for a text card', () => {
    const { container } = renderTitle(Component, { type: 'text' });
    expect(container.querySelector('.type-icon')).toBeNull();
  });

  it('shows the note icon for a note card', () => {
    const { container } = renderTitle(Component, { type: 'note' });
    expect(container.querySelector('.card-title.has-type-icon .type-icon')).not.toBeNull();
  });
});

describe.each([
  ['Title (canvas)', Title],
  ['LibraryTitle (library)', LibraryTitle],
])('%s - add-block dropdown', (name, Component) => {
  it('does not show the "+" button for a non-custom card', () => {
    const { container } = renderTitle(Component, { type: 'text' });
    expect(container.querySelector('.add-block-btn')).toBeNull();
  });

  it('shows the "+" button for a custom card, opening a dropdown with Add text/Add image', () => {
    const { container, getByText } = renderTitle(Component, { type: 'custom' });
    const addBlockBtn = container.querySelector('.add-block-btn');
    expect(addBlockBtn).not.toBeNull();

    fireEvent.click(addBlockBtn);

    expect(getByText('Add text')).not.toBeNull();
    expect(getByText('Add image')).not.toBeNull();
  });

  it('clicking "Add text" dispatches exactly one addCustomBlock with blockType: text', () => {
    const { container, getByText, store } = renderTitle(Component, { type: 'custom' });
    fireEvent.click(container.querySelector('.add-block-btn'));

    fireEvent.click(getByText('Add text'));

    expect(store.dispatched).toHaveLength(1);
    const action = store.dispatched[0];
    expect(action.type).toBe('project/addCustomBlock');
    expect(action.payload.id).toBe('c1');
    expect(action.payload.blockType).toBe('text');
    expect(typeof action.payload.blockId).toBe('string');
    expect(action.payload.blockId.length).toBeGreaterThan(0);
  });

  it('clicking "Add image" dispatches exactly one addCustomBlock with blockType: image', () => {
    const { container, getByText, store } = renderTitle(Component, { type: 'custom' });
    fireEvent.click(container.querySelector('.add-block-btn'));

    fireEvent.click(getByText('Add image'));

    expect(store.dispatched).toHaveLength(1);
    expect(store.dispatched[0].payload.blockType).toBe('image');
  });
});
