import { reducer, initialState } from './reducers';

describe('initialState', () => {
  it('monsterCollapse starts empty', () => {
    expect(initialState.monsterCollapse).toEqual({});
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
