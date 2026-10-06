import { reducer, initialState } from './reducers';

describe('initialState', () => {
  it('monsterCollapse starts empty', () => {
    expect(initialState.monsterCollapse).toEqual({});
  });

  it('libraryMonsterCollapse starts empty', () => {
    expect(initialState.libraryMonsterCollapse).toEqual({});
  });
});

describe('setMonsterCollapsed', () => {
  it('creates an entry lazily, materializing only the toggled key', () => {
    const next = reducer(initialState, {
      type: 'session/setMonsterCollapsed',
      payload: { id: 'c1', key: 'identity', collapsed: true },
    });
    expect(next.monsterCollapse.c1).toEqual({ identity: true });
    expect(Object.keys(next.monsterCollapse.c1)).toEqual(['identity']);
  });

  it('a second toggle on the same card merges rather than replaces', () => {
    const state = {
      ...initialState,
      monsterCollapse: { c1: { identity: true } },
    };
    const next = reducer(state, {
      type: 'session/setMonsterCollapsed',
      payload: { id: 'c1', key: 'traits', collapsed: true },
    });
    expect(next.monsterCollapse.c1).toEqual({ identity: true, traits: true });
  });

  it('toggling one card leaves another card untouched and reference-equal', () => {
    const c1Entry = { identity: true };
    const state = {
      ...initialState,
      monsterCollapse: { c1: c1Entry },
    };
    const next = reducer(state, {
      type: 'session/setMonsterCollapsed',
      payload: { id: 'c2', key: 'traits', collapsed: true },
    });
    expect(next.monsterCollapse.c1).toBe(c1Entry);
  });

  it('accepts a column key with identical semantics to a section key', () => {
    const next = reducer(initialState, {
      type: 'session/setMonsterCollapsed',
      payload: { id: 'c1', key: 'combat', collapsed: true },
    });
    expect(next.monsterCollapse.c1).toEqual({ combat: true });
  });

  it('no-ops on an unknown key', () => {
    const next = reducer(initialState, {
      type: 'session/setMonsterCollapsed',
      payload: { id: 'c1', key: 'notASection', collapsed: true },
    });
    expect(next).toBe(initialState);
  });

  it('no-ops on the Media column key (always-visible, never collapsible)', () => {
    const next = reducer(initialState, {
      type: 'session/setMonsterCollapsed',
      payload: { id: 'c1', key: 'media', collapsed: true },
    });
    expect(next).toBe(initialState);
  });
});

describe("setMonsterCollapsed - scope: 'library'", () => {
  it('writes libraryMonsterCollapse, leaving monsterCollapse (the canvas card) untouched', () => {
    const next = reducer(initialState, {
      type: 'session/setMonsterCollapsed',
      payload: { id: 'c1', key: 'combat', collapsed: true, scope: 'library' },
    });
    expect(next.libraryMonsterCollapse.c1).toEqual({ combat: true });
    expect(next.monsterCollapse).toEqual({});
  });

  it('accepts the notes key, unique to the Library scope', () => {
    const next = reducer(initialState, {
      type: 'session/setMonsterCollapsed',
      payload: { id: 'c1', key: 'notes', collapsed: true, scope: 'library' },
    });
    expect(next.libraryMonsterCollapse.c1).toEqual({ notes: true });
  });

  it('the default (canvas) scope rejects the notes key - it only exists in the Library', () => {
    const next = reducer(initialState, {
      type: 'session/setMonsterCollapsed',
      payload: { id: 'c1', key: 'notes', collapsed: true },
    });
    expect(next).toBe(initialState);
  });

  it('no-ops on an unknown scope', () => {
    const next = reducer(initialState, {
      type: 'session/setMonsterCollapsed',
      payload: { id: 'c1', key: 'combat', collapsed: true, scope: 'bogus' },
    });
    expect(next).toBe(initialState);
  });

  it('the two scopes are independent for the same card/key', () => {
    let state = reducer(initialState, {
      type: 'session/setMonsterCollapsed',
      payload: { id: 'c1', key: 'combat', collapsed: true }, // canvas (default scope)
    });
    state = reducer(state, {
      type: 'session/setMonsterCollapsed',
      payload: { id: 'c1', key: 'combat', collapsed: false, scope: 'library' },
    });
    expect(state.monsterCollapse.c1).toEqual({ combat: true });
    expect(state.libraryMonsterCollapse.c1).toEqual({ combat: false });
  });
});

describe('initialize', () => {
  it('resets monsterCollapse back to {}', () => {
    const state = {
      ...initialState,
      monsterCollapse: { c1: { identity: true } },
    };
    const next = reducer(state, { type: 'session/initialize' });
    expect(next.monsterCollapse).toEqual({});
  });
});

describe('setLibraryOpen', () => {
  it('opens the library', () => {
    const next = reducer(initialState, { type: 'session/setLibraryOpen', payload: { isOpen: true } });
    expect(next.isLibraryOpen).toBe(true);
  });

  it('closes the library', () => {
    const state = { ...initialState, isLibraryOpen: true };
    const next = reducer(state, { type: 'session/setLibraryOpen', payload: { isOpen: false } });
    expect(next.isLibraryOpen).toBe(false);
  });
});

describe('setGraphOpen', () => {
  it('opens the graph', () => {
    const next = reducer(initialState, { type: 'session/setGraphOpen', payload: { isOpen: true } });
    expect(next.isGraphOpen).toBe(true);
  });

  it('closes the graph', () => {
    const state = { ...initialState, isGraphOpen: true };
    const next = reducer(state, { type: 'session/setGraphOpen', payload: { isOpen: false } });
    expect(next.isGraphOpen).toBe(false);
  });
});

describe('focusCard', () => {
  it('starts null', () => {
    expect(initialState.cardFocus).toBe(null);
  });

  it('sets cardId and starts the nonce at 1', () => {
    const next = reducer(initialState, { type: 'session/focusCard', payload: { cardId: 'c1' } });
    expect(next.cardFocus).toEqual({ cardId: 'c1', nonce: 1 });
  });

  it('increments the nonce on a repeated focus of the same card', () => {
    let state = reducer(initialState, { type: 'session/focusCard', payload: { cardId: 'c1' } });
    state = reducer(state, { type: 'session/focusCard', payload: { cardId: 'c1' } });
    expect(state.cardFocus).toEqual({ cardId: 'c1', nonce: 2 });
  });

  it('keeps incrementing the nonce when the target switches to a different card', () => {
    let state = reducer(initialState, { type: 'session/focusCard', payload: { cardId: 'c1' } });
    state = reducer(state, { type: 'session/focusCard', payload: { cardId: 'c2' } });
    expect(state.cardFocus).toEqual({ cardId: 'c2', nonce: 2 });
  });
});

describe('clearCardFocus', () => {
  it('resets cardFocus back to null', () => {
    const state = { ...initialState, cardFocus: { cardId: 'c1', nonce: 1 } };
    const next = reducer(state, { type: 'session/clearCardFocus' });
    expect(next.cardFocus).toBe(null);
  });
});
