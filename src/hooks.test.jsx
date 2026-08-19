// hooks.js's auth listener effect runs `authListener` for real logic that's
// covered by data/api/auth.test.js; here we only care that useListenerHooks
// wires it up correctly (subscribes once, passes a getPendingProject that
// always reads current state). So authListener is mocked to just capture
// whatever it's called with, rather than running real Firebase-adjacent code.
let capturedArgs = null;
vi.mock('./data/api/auth', () => ({
  authListener: vi.fn((args) => { capturedArgs = args; return vi.fn(); }),
}));

// hooks.js also calls `* as api` from database.js (fetchProjectData in the
// "load project when activeProject changes" effect, save in the auto-save
// effect) - mocked so Firebase never enters the module graph here.
vi.mock('./data/api/database', () => ({
  fetchProjectData: vi.fn(() => ({ type: 'test/fetchProjectData' })),
  save: vi.fn(() => ({ type: 'test/save' })),
}));

import React from 'react';
import { render, act } from '@testing-library/react';
import { Provider } from 'react-redux';

import { authListener } from './data/api/auth';
import { useListenerHooks } from './hooks';

// A hand-rolled fake Redux store (not a real configureStore), matching the
// pattern in components/Canvas/testUtils.jsx, but with the state shape
// useListenerHooks actually reads: user.userId, session.status,
// session.activeCampaignId, session.isProjectEdited, project.present,
// project._latestUnfiltered, and project.past (the redux-undo array whose
// length is the "did the user really edit anything" signal).
const makeState = (overrides = {}) => ({
  user: { userId: null },
  session: {
    status: 'idle',
    activeCampaignId: '',
    isProjectEdited: false,
  },
  project: {
    present: {},
    past: [],
    _latestUnfiltered: {},
  },
  ...overrides,
});

const makeStore = (initial = makeState()) => {
  let state = initial;
  const listeners = new Set();
  const dispatched = [];
  return {
    dispatched,
    getState: () => state,
    dispatch: (action) => { dispatched.push(action); return action; },
    subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    replaceReducer: () => {},
    setState: (next) => { state = next; listeners.forEach((fn) => fn()); },
  };
};

const Harness = () => {
  useListenerHooks();
  return null;
};

beforeEach(() => {
  capturedArgs = null;
  // Silences/contains the 60s auto-save interval effect so it doesn't fire
  // (or leak) during these tests; we're not testing auto-save here.
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useListenerHooks - auth listener wiring', () => {
  it('subscribes authListener exactly once, with a getPendingProject function', () => {
    const store = makeStore();
    render(<Provider store={store}><Harness /></Provider>);

    expect(authListener).toHaveBeenCalledTimes(1);
    expect(capturedArgs).toEqual(expect.objectContaining({
      getPendingProject: expect.any(Function),
    }));
  });

  it('getPendingProject always reflects CURRENT state (not mount-time state), and gates saveProject on isProjectEdited && hasLocalEdits', () => {
    const initial = makeState({
      session: { status: 'idle', activeCampaignId: 'p1', isProjectEdited: false },
      project: { present: { id: 'p1-data' }, past: [], _latestUnfiltered: {} },
    });
    const store = makeStore(initial);
    render(<Provider store={store}><Harness /></Provider>);

    // Initial render: no edits, not flagged dirty.
    expect(capturedArgs.getPendingProject()).toEqual({
      saveProject: false,
      projectId: 'p1',
      projectData: { id: 'p1-data' },
    });

    // Simulate a fresh load of a different project: isProjectEdited flips to
    // true (the dirty-flag effect fires on every _latestUnfiltered change,
    // including loads) but `past` is empty (clearHistory() ran) - this must
    // NOT be treated as a real edit.
    act(() => {
      store.setState(makeState({
        session: { status: 'idle', activeCampaignId: 'p2', isProjectEdited: true },
        project: { present: { id: 'p2-data' }, past: [], _latestUnfiltered: {} },
      }));
    });
    expect(capturedArgs.getPendingProject()).toEqual({
      saveProject: false,
      projectId: 'p2',
      projectData: { id: 'p2-data' },
    });

    // Now simulate a genuine edit: `past` gains an entry.
    act(() => {
      store.setState(makeState({
        session: { status: 'idle', activeCampaignId: 'p2', isProjectEdited: true },
        project: { present: { id: 'p2-data-edited' }, past: [{ id: 'p2-data' }], _latestUnfiltered: {} },
      }));
    });
    expect(capturedArgs.getPendingProject()).toEqual({
      saveProject: true,
      projectId: 'p2',
      projectData: { id: 'p2-data-edited' },
    });

    // The effect stayed at `[]` deps throughout - it never re-subscribed.
    expect(authListener).toHaveBeenCalledTimes(1);
  });

  it('does not report saveProject: true merely because isProjectEdited is true with no local edits (hasLocalEdits gate)', () => {
    const store = makeStore(makeState({
      session: { status: 'idle', activeCampaignId: 'intro_project_id', isProjectEdited: true },
      project: { present: { id: 'intro' }, past: [], _latestUnfiltered: {} },
    }));
    render(<Provider store={store}><Harness /></Provider>);

    expect(capturedArgs.getPendingProject().saveProject).toBe(false);
  });
});
