// Test-only helpers for hooks.test.jsx. NOT a spec file itself (hence the
// `testUtils.jsx` name rather than `*.test.jsx`) so Vitest's
// `include: ['src/**/*.{test,spec}.{js,jsx}']` glob does not collect it.
import React, { useRef } from 'react';
import { useCanvasHooks, useMultiSelectHooks } from './hooks';

// A hand-rolled fake Redux store (not a real configureStore) so tests avoid
// pulling in redux-undo/persistence machinery and can inspect every
// dispatched action directly.
export const makeState = (overrides = {}) => ({
  user: { userId: 'u1' },
  session: {
    status: 'idle',
    activeCampaignId: 'p1',
    popup: { id: null, type: null },
    selectedCards: [],
  },
  project: {
    present: {
      activeViewId: 'v1',
      viewOrder: ['v1'],
      views: { v1: { pos: { x: 0, y: 0 }, scale: 1, cards: [] } },
      cards: {},
    },
  },
  ...overrides,
});

export const makeStore = (initial = makeState()) => {
  let state = initial;
  const listeners = new Set();
  const dispatched = [];
  return {
    dispatched,
    getState: () => state,
    dispatch: (action) => { dispatched.push(action); return action; },
    subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    replaceReducer: () => {},
    // test-only helper for the tab-change test: swap state and notify subscribers
    setState: (next) => { state = next; listeners.forEach((fn) => fn()); },
  };
};

// Applied per-instance, after render — safe because neither place hooks.js
// calls getBoundingClientRect() (the wheel handler, zoomByStep) runs during
// mount; both are inside event handlers, called later.
export const stubRect = (el, { left, top, width, height }) => {
  el.getBoundingClientRect = () => ({
    x: left, y: top,
    left, top,
    right: left + width, bottom: top + height,
    width, height,
    toJSON() { return this; },
  });
};

// Harness for useCanvasHooks — exposes the hook's return value via a ref,
// and provides a <textarea readOnly> and a <button> inside the canvas for
// the text-entry/space-activated-target tests, without needing the real
// <Canvas>/<Card>/react-rnd tree. `textAreaReadOnly` defaults to true (the
// production <Card> text field is a readOnly textarea while not actively
// being edited); pass false to test the non-readOnly (text-entry) case.
// Both the textarea+button and a second, separate card (`other-card-text`)
// are wrapped in a real `.card` div, matching Card/Card.jsx's className, for
// the isEditingCardTarget pan-guard tests.
export const Harness = ({ hooksRef, textAreaReadOnly = true }) => {
  const containerRef = useRef();
  const canvasRef = useRef();
  hooksRef.current = useCanvasHooks({ containerRef, canvasRef });
  return (
    <div data-testid="container" ref={containerRef}>
      <div data-testid="canvas" className="canvas" ref={canvasRef}>
        <div data-testid="card" className="card">
          <textarea data-testid="card-text" readOnly={textAreaReadOnly} />
          <button data-testid="card-button" type="button">ok</button>
        </div>
        <div data-testid="other-card" className="card">
          <textarea data-testid="other-card-text" readOnly />
        </div>
      </div>
    </div>
  );
};

// Harness for useMultiSelectHooks — panModifierRef is constructed by the
// caller and passed straight through (not derived from useCanvasHooks).
export const MultiSelectHarness = ({ hooksRef, panModifierRef }) => {
  const containerRef = useRef();
  const canvasRef = useRef();
  const selectRef = useRef();
  hooksRef.current = useMultiSelectHooks({ containerRef, canvasRef, selectRef, panModifierRef });
  return (
    <div data-testid="container" ref={containerRef}>
      <div data-testid="canvas" className="canvas" ref={canvasRef}>
        <div data-testid="select" ref={selectRef} />
      </div>
    </div>
  );
};
