import React, { useRef } from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';

import ToolMenu from './index';
import { MONSTER_CARD_SIZE } from '../../constants/dimensions';

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

describe('ToolMenu stat button', () => {
  it('is disabled when there is no active tab', () => {
    const store = makeStore(makeState());
    const { getByText } = render(<Harness store={store} />);
    expect(getByText('stat').closest('button')).toBeDisabled();
  });

  it('is enabled when there is an active tab', () => {
    const store = makeStore(makeState({
      project: { present: { activeViewId: 'tab1', viewOrder: ['tab1'], views: { tab1: { pos: { x: 0, y: 0 } } }, cards: {} } },
    }));
    const { getByText } = render(<Harness store={store} />);
    expect(getByText('stat').closest('button')).not.toBeDisabled();
  });

  it('dispatches a project/createCard action with type: monster and the monster card size', () => {
    const store = makeStore(makeState({
      project: { present: { activeViewId: 'tab1', viewOrder: ['tab1'], views: { tab1: { pos: { x: 0, y: 0 } } }, cards: {} } },
    }));
    const { getByText } = render(<Harness store={store} />);
    fireEvent.click(getByText('stat').closest('button'));

    const createCardAction = store.dispatched.find(a => a.type === 'project/createCard');
    expect(createCardAction).toBeDefined();
    expect(createCardAction.payload.type).toBe('monster');
    expect(createCardAction.payload.size).toEqual(MONSTER_CARD_SIZE);
  });

  it('the label is user-facing copy only - the dispatched type stays "monster"', () => {
    const store = makeStore(makeState({
      project: { present: { activeViewId: 'tab1', viewOrder: ['tab1'], views: { tab1: { pos: { x: 0, y: 0 } } }, cards: {} } },
    }));
    const { getByText, queryByText } = render(<Harness store={store} />);
    expect(getByText('stat')).not.toBeNull();
    expect(queryByText('monster')).toBeNull();

    fireEvent.click(getByText('stat').closest('button'));
    const createCardAction = store.dispatched.find(a => a.type === 'project/createCard');
    expect(createCardAction.payload.type).toBe('monster');
  });
});

describe('ToolMenu note button', () => {
  it('is disabled when there is no active tab', () => {
    const store = makeStore(makeState());
    const { getByText } = render(<Harness store={store} />);
    expect(getByText('note').closest('button')).toBeDisabled();
  });

  it('is enabled when there is an active tab', () => {
    const store = makeStore(makeState({
      project: { present: { activeViewId: 'tab1', viewOrder: ['tab1'], views: { tab1: { pos: { x: 0, y: 0 } } }, cards: {} } },
    }));
    const { getByText } = render(<Harness store={store} />);
    expect(getByText('note').closest('button')).not.toBeDisabled();
  });

  it('dispatches a project/createCard action with type: note on click', () => {
    const store = makeStore(makeState({
      project: { present: { activeViewId: 'tab1', viewOrder: ['tab1'], views: { tab1: { pos: { x: 0, y: 0 } } }, cards: {} } },
    }));
    const { getByText } = render(<Harness store={store} />);
    fireEvent.click(getByText('note').closest('button'));

    const createCardAction = store.dispatched.find(a => a.type === 'project/createCard');
    expect(createCardAction).toBeDefined();
    expect(createCardAction.payload.type).toBe('note');
  });
});

describe('ToolMenu custom button (labeled "freeform")', () => {
  it('is disabled when there is no active tab', () => {
    const store = makeStore(makeState());
    const { getByText } = render(<Harness store={store} />);
    expect(getByText('freeform').closest('button')).toBeDisabled();
  });

  it('is enabled when there is an active tab', () => {
    const store = makeStore(makeState({
      project: { present: { activeViewId: 'tab1', viewOrder: ['tab1'], views: { tab1: { pos: { x: 0, y: 0 } } }, cards: {} } },
    }));
    const { getByText } = render(<Harness store={store} />);
    expect(getByText('freeform').closest('button')).not.toBeDisabled();
  });

  it('dispatches a project/createCard action with type: custom on click', () => {
    const store = makeStore(makeState({
      project: { present: { activeViewId: 'tab1', viewOrder: ['tab1'], views: { tab1: { pos: { x: 0, y: 0 } } }, cards: {} } },
    }));
    const { getByText } = render(<Harness store={store} />);
    fireEvent.click(getByText('freeform').closest('button'));

    const createCardAction = store.dispatched.find(a => a.type === 'project/createCard');
    expect(createCardAction).toBeDefined();
    expect(createCardAction.payload.type).toBe('custom');
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

describe('ToolMenu select all button', () => {
  const withCards = () => makeState({
    project: {
      present: {
        activeViewId: 'tab1',
        viewOrder: ['tab1'],
        views: { tab1: { pos: { x: 0, y: 0 } } },
        cards: {
          c1: { views: { tab1: { pos: { x: 0, y: 0 }, size: { width: 240, height: 240 } } } },
          c2: { views: { tab1: { pos: { x: 300, y: 0 }, size: { width: 240, height: 240 } } } },
        },
      },
    },
  });

  it('is disabled when there is no active tab', () => {
    const store = makeStore(makeState());
    const { getByText } = render(<Harness store={store} />);
    expect(getByText('select all').closest('button')).toBeDisabled();
  });

  it('is disabled when the active tab has no cards', () => {
    const store = makeStore(makeState({
      project: { present: { activeViewId: 'tab1', viewOrder: ['tab1'], views: { tab1: { pos: { x: 0, y: 0 } } }, cards: {} } },
    }));
    const { getByText } = render(<Harness store={store} />);
    expect(getByText('select all').closest('button')).toBeDisabled();
  });

  it('is enabled with cards in the tab, even with nothing currently selected', () => {
    const store = makeStore(withCards());
    const { getByText } = render(<Harness store={store} />);
    expect(getByText('select all').closest('button')).not.toBeDisabled();
  });

  it('stays enabled when a selection already exists - it never gates on current selection', () => {
    const state = withCards();
    state.session.selectedCards = ['c1'];
    const store = makeStore(state);
    const { getByText } = render(<Harness store={store} />);
    expect(getByText('select all').closest('button')).not.toBeDisabled();
  });

  it('dispatches setSelectedCards with every card id in the active tab', () => {
    const store = makeStore(withCards());
    const { getByText } = render(<Harness store={store} />);
    fireEvent.click(getByText('select all').closest('button'));

    expect(store.dispatched).toContainEqual({
      type: 'session/setSelectedCards',
      payload: { cards: ['c1', 'c2'] },
    });
  });
});

describe('ToolMenu group button', () => {
  // Grid-aligned fixture values (multiples of GRID_SIZE=12 and
  // DEFAULT_CARD_OFFSET=36) so the expected output needs no rounding.
  const withCards = () => makeState({
    project: {
      present: {
        activeViewId: 'tab1',
        viewOrder: ['tab1'],
        views: { tab1: { pos: { x: 0, y: 0 } } },
        cards: {
          c1: { views: { tab1: { pos: { x: 120, y: 240 }, size: { width: 240, height: 120 } } } },
          c2: { views: { tab1: { pos: { x: 600, y: 0 }, size: { width: 240, height: 120 } } } },
        },
      },
    },
  });

  it('is disabled when there is no active tab', () => {
    const store = makeStore(makeState());
    const { getByText } = render(<Harness store={store} />);
    expect(getByText('group').closest('button')).toBeDisabled();
  });

  it('is disabled with nothing selected', () => {
    const store = makeStore(withCards());
    const { getByText } = render(<Harness store={store} />);
    expect(getByText('group').closest('button')).toBeDisabled();
  });

  it('is disabled with only 1 card selected - unlike copy/delete, it never falls back to the active card', () => {
    const state = withCards();
    state.session.selectedCards = ['c1'];
    const store = makeStore(state);
    const { getByText } = render(<Harness store={store} />);
    expect(getByText('group').closest('button')).toBeDisabled();
  });

  it('is enabled with 2+ selected cards', () => {
    const state = withCards();
    state.session.selectedCards = ['c1', 'c2'];
    const store = makeStore(state);
    const { getByText } = render(<Harness store={store} />);
    expect(getByText('group').closest('button')).not.toBeDisabled();
  });

  it('dispatches setCardPositions covering both selected cards, anchored at the original selection\'s top-left', () => {
    const state = withCards();
    state.session.selectedCards = ['c1', 'c2'];
    const store = makeStore(state);
    const { getByText } = render(<Harness store={store} />);
    fireEvent.click(getByText('group').closest('button'));

    const action = store.dispatched.find(a => a.type === 'project/setCardPositions');
    expect(action).toBeDefined();
    expect(action.payload.positions).toHaveLength(2);
    expect(action.payload.positions.map(p => p.id).sort()).toEqual(['c1', 'c2']);
    // Original bounding box: min(120,600)=120, min(240,0)=0 - the exact
    // per-card grid math is covered by gridUtils.test.js.
    const xs = action.payload.positions.map(p => p.pos.x);
    const ys = action.payload.positions.map(p => p.pos.y);
    expect(Math.min(...xs)).toBe(120);
    expect(Math.min(...ys)).toBe(0);
  });

  it('drops a selected card with no view on the active tab, and no-ops entirely if that leaves fewer than 2', () => {
    const state = withCards();
    state.project.present.cards.c3 = { views: {} }; // no tab1 view
    state.session.selectedCards = ['c1', 'c3'];
    const store = makeStore(state);
    const { getByText } = render(<Harness store={store} />);
    fireEvent.click(getByText('group').closest('button'));

    expect(store.dispatched.some(a => a.type === 'project/setCardPositions')).toBe(false);
  });
});
