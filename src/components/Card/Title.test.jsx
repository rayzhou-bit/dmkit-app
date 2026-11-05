import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import Title from './Title';
import LibraryTitle from './LibraryTitle';
import { CARD_COLOR_KEYS } from '../../constants/colors';

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
])('%s - options menu (add image, colour)', (name, Component) => {
  const renderWith = (onAddImage, type = 'note') => {
    const store = makeStore({ type });
    return {
      store,
      ...render(
        <Provider store={store}>
          <Component cardId='c1' setEditingCard={() => {}} onAddImage={onAddImage} />
        </Provider>
      ),
    };
  };
  const openMenu = (container) => fireEvent.click(container.querySelector('.dropdown-btn'));

  it('title bar holds only the input and the options button (plus type icon)', () => {
    const { container } = renderWith(() => {});
    expect(container.querySelector('.add-image-btn')).toBeNull();
    expect(container.querySelector('.color-btn')).toBeNull();
    expect(container.querySelectorAll('.card-title button')).toHaveLength(1);
  });

  it('without onAddImage the menu has no Add image item', () => {
    const { container } = renderWith(undefined);
    openMenu(container);
    expect(screen.queryByText('Add image')).toBeNull();
  });

  it('with onAddImage the menu has an Add image item that calls it and closes the menu', () => {
    const onAddImage = vi.fn();
    const { container } = renderWith(onAddImage);
    openMenu(container);
    fireEvent.click(screen.getByText('Add image'));
    expect(onAddImage).toHaveBeenCalledTimes(1);
    expect(container.querySelector('.action-dropdown')).toBeNull();
  });

  it('the menu has a swatch per colour, and clicking one dispatches the colour update', () => {
    const { container, store } = renderWith(undefined);
    openMenu(container);
    expect(container.querySelectorAll('.color-swatch')).toHaveLength(Object.keys(CARD_COLOR_KEYS).length);
    fireEvent.click(container.querySelector('.color-swatch.red'));
    expect(store.dispatched).toContainEqual(expect.objectContaining({
      payload: { id: 'c1', color: 'red' },
    }));
    expect(container.querySelector('.color-swatch.gray').classList.contains('selected')).toBe(true);
  });
});
