import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';

import { useCardHooks, useMonsterPortraitHooks, usePortraitHooks } from './hooks';

// Hand-rolled fake store, matching the pattern in Canvas/testUtils.jsx.
const makeState = (overrides = {}) => ({
  session: {
    activeCardId: null,
    selectedCards: [],
  },
  project: {
    present: {
      activeViewId: 'tab1',
      views: { tab1: { scale: 1 } },
      cards: {
        card1: { views: { tab1: { pos: { x: 0, y: 0 }, size: { width: 240, height: 240 } } } },
      },
    },
  },
  ...overrides,
});

const makeStore = (initial) => {
  let state = initial;
  const dispatched = [];
  return {
    dispatched,
    getState: () => state,
    dispatch: (action) => { dispatched.push(action); return action; },
    subscribe: () => () => {},
  };
};

// Minimal fake matching groupDrag.js's real API surface.
const makeFakeGroupDrag = ({ commitDelta = { x: 0, y: 0 } } = {}) => ({
  calls: { start: [], move: [], end: 0 },
  subscribe: () => () => {},
  getCardPosition: () => null,
  start(args) { this.calls.start.push(args); },
  move(args) { this.calls.move.push(args); },
  end() { this.calls.end += 1; },
  isActive: () => false,
  getCommitDelta: () => commitDelta,
});

const setup = (state, groupDrag, hookProps = {}) => {
  const store = makeStore(state);
  const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
  const { result, unmount } = renderHook(
    () => useCardHooks({ cardId: 'card1', toolMenuRef: { current: null }, cardAnimation: {}, setCardAnimation: () => {}, groupDrag, ...hookProps }),
    { wrapper },
  );
  return { store, result, unmount };
};

describe('useCardHooks - single-card drag (no multi-selection)', () => {
  it('dispatches updateCardPosition on drag stop when the position changed', () => {
    const groupDrag = makeFakeGroupDrag();
    const { store, result } = setup(makeState(), groupDrag);

    act(() => { result.current.onDragStart(); });
    act(() => { result.current.onDragStop({}, { x: 24, y: 12 }); });

    expect(groupDrag.calls.start).toHaveLength(0);
    const moveAction = store.dispatched.find(a => a.type === 'project/updateCardPosition');
    expect(moveAction).toEqual({ type: 'project/updateCardPosition', payload: { id: 'card1', position: { x: 24, y: 12 } } });
  });
});

describe('useCardHooks - group drag', () => {
  const groupState = makeState({
    session: { activeCardId: null, selectedCards: ['card1', 'card2'] },
  });

  it('starts a group drag when the card is part of a 2+ selection', () => {
    const groupDrag = makeFakeGroupDrag();
    const { result } = setup(groupState, groupDrag);

    act(() => { result.current.onDragStart(); });
    expect(groupDrag.calls.start).toEqual([{ leaderId: 'card1' }]);

    act(() => { result.current.onDrag({}, { x: 10, y: 5 }); });
    expect(groupDrag.calls.move).toEqual([{ x: 10, y: 5 }]);
  });

  it('dispatches one moveCards with the clamped commit delta on stop, then ends the drag', () => {
    const groupDrag = makeFakeGroupDrag({ commitDelta: { x: 12, y: 0 } });
    const { store, result } = setup(groupState, groupDrag);

    act(() => { result.current.onDragStart(); });
    act(() => { result.current.onDrag({}, { x: 12, y: 0 }); });
    act(() => { result.current.onDragStop({}, { x: 12, y: 0 }); });

    expect(store.dispatched).toContainEqual({
      type: 'project/moveCards',
      payload: { ids: ['card1', 'card2'], delta: { x: 12, y: 0 } },
    });
    expect(store.dispatched.some(a => a.type === 'project/updateCardPosition')).toBe(false);
    expect(groupDrag.calls.end).toBe(1);
  });

  it('does not dispatch moveCards when the commit delta is zero (a plain click that skipped movement)', () => {
    const groupDrag = makeFakeGroupDrag({ commitDelta: { x: 0, y: 0 } });
    const { store, result } = setup(groupState, groupDrag);

    act(() => { result.current.onDragStart(); });
    act(() => { result.current.onDragStop({}, { x: 0, y: 0 }); });

    expect(store.dispatched.some(a => a.type === 'project/moveCards')).toBe(false);
    expect(groupDrag.calls.end).toBe(1);
  });

  it('dragging a card NOT in the current selection clears the selection instead of starting a group drag', () => {
    const groupDrag = makeFakeGroupDrag();
    const state = makeState({ session: { activeCardId: null, selectedCards: ['card2', 'card3'] } });
    const { store, result } = setup(state, groupDrag);

    act(() => { result.current.onDragStart(); });

    expect(groupDrag.calls.start).toHaveLength(0);
    expect(store.dispatched).toContainEqual({ type: 'session/setSelectedCards', payload: { cards: [] } });
  });
});

describe('useCardHooks - onClick collapse behaviour', () => {
  const stopPropagation = () => {};

  it('a plain click (no movement) collapses a non-empty selection, even when this card is a member', () => {
    const groupDrag = makeFakeGroupDrag();
    const state = makeState({ session: { activeCardId: null, selectedCards: ['card1', 'card2'] } });
    const { store, result } = setup(state, groupDrag);

    act(() => { result.current.onClick({ stopPropagation }); });

    expect(store.dispatched).toContainEqual({ type: 'session/setSelectedCards', payload: { cards: [] } });
  });

  it('does not collapse the selection after a real drag (movement occurred)', () => {
    const groupDrag = makeFakeGroupDrag({ commitDelta: { x: 12, y: 0 } });
    const state = makeState({ session: { activeCardId: null, selectedCards: ['card1', 'card2'] } });
    const { store, result } = setup(state, groupDrag);

    act(() => { result.current.onDragStart(); });
    act(() => { result.current.onDrag({}, { x: 12, y: 0 }); });
    act(() => { result.current.onDragStop({}, { x: 12, y: 0 }); });
    store.dispatched.length = 0; // clear drag-stop dispatches, isolate the click
    act(() => { result.current.onClick({ stopPropagation }); });

    expect(store.dispatched.some(a => a.type === 'session/setSelectedCards')).toBe(false);
  });

  it('is a no-op when there is no selection to collapse', () => {
    const groupDrag = makeFakeGroupDrag();
    const { store, result } = setup(makeState(), groupDrag);

    act(() => { result.current.onClick({ stopPropagation }); });

    expect(store.dispatched.some(a => a.type === 'session/setSelectedCards')).toBe(false);
  });
});

describe('useCardHooks - cleanup', () => {
  it('ends an in-flight group drag if the card unmounts mid-drag', () => {
    const groupDrag = makeFakeGroupDrag();
    const state = makeState({ session: { activeCardId: null, selectedCards: ['card1', 'card2'] } });
    const { result, unmount } = setup(state, groupDrag);

    act(() => { result.current.onDragStart(); });
    unmount();

    expect(groupDrag.calls.end).toBe(1);
  });

  it('does not call end() on unmount when no drag was in flight', () => {
    const groupDrag = makeFakeGroupDrag();
    const { unmount } = setup(makeState(), groupDrag);

    unmount();

    expect(groupDrag.calls.end).toBe(0);
  });
});

// Regression guard for the note-card portrait sharing decision (see
// hooks.js's comment on usePortraitHooks) - useMonsterPortraitHooks must
// stay a re-export, not drift into its own duplicate implementation.
describe('useMonsterPortraitHooks / usePortraitHooks', () => {
  it('useMonsterPortraitHooks is the same function as usePortraitHooks', () => {
    expect(useMonsterPortraitHooks).toBe(usePortraitHooks);
  });
});
