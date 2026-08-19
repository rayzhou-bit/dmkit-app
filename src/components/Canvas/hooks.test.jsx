// hooks.js imports `* as api from '../../data/api/database'` (used only by
// createNewProject), and database.js transitively imports Firebase. Mock it
// before any other import so Firebase never enters the module graph here.
vi.mock('../../data/api/database', () => ({
  createAndSwitchToEmptyProject: () => ({ type: 'test/createAndSwitchToEmptyProject' }),
}));

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';

import { makeState, makeStore, stubRect, Harness, MultiSelectHarness } from './testUtils';
import {
  DEFAULT_CANVAS_POSITION,
  DEFAULT_CANVAS_SCALE,
  WHEEL_GESTURE_END_MS,
  ZOOM_STEP,
} from '../../constants/dimensions';
import { normalizeWheelDelta, zoomAtPoint, getWheelScale } from '../../utils/canvasTransform';

const RECT = { left: 100, top: 50, width: 800, height: 600 };

beforeEach(() => {
  vi.useFakeTimers({
    toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
             'requestAnimationFrame', 'cancelAnimationFrame'],
  });
});
afterEach(() => { vi.useRealTimers(); });

// sinon's fake rAF advances 1 frame per 16ms; 20ms guarantees one tick.
const flushFrame = () => act(() => { vi.advanceTimersByTime(20); });
const settleWheel = () => act(() => { vi.advanceTimersByTime(WHEEL_GESTURE_END_MS + 20); });

// Standard per-test arrangement: fresh fake store + Harness, container rect stubbed.
const setup = (state = makeState()) => {
  const store = makeStore(state);
  const hooksRef = { current: null };
  const utils = render(<Provider store={store}><Harness hooksRef={hooksRef} /></Provider>);
  const container = utils.getByTestId('container');
  const canvas = utils.getByTestId('canvas');
  stubRect(container, RECT);
  // NB: spread `utils` first — RTL's render() return value has its own
  // `.container` (the outer test wrapper div), which must not shadow our
  // `data-testid="container"` element below.
  return { ...utils, store, hooksRef, container, canvas };
};

describe('useCanvasHooks — wheel', () => {
  it('wheel inside a textarea is ignored (does not pan the canvas)', () => {
    const { canvas, container, getByTestId } = setup();
    const initialTransform = canvas.style.transform;

    const insideEv = new WheelEvent('wheel', {
      bubbles: true, cancelable: true, deltaX: 0, deltaY: 100, clientX: 400, clientY: 300,
    });
    act(() => { getByTestId('card-text').dispatchEvent(insideEv); });
    expect(insideEv.defaultPrevented).toBe(false);
    flushFrame();
    expect(canvas.style.transform).toBe(initialTransform);

    // Contrast: the identical event dispatched directly on the container IS handled.
    const outsideEv = new WheelEvent('wheel', {
      bubbles: true, cancelable: true, deltaX: 0, deltaY: 100, clientX: 400, clientY: 300,
    });
    act(() => { container.dispatchEvent(outsideEv); });
    expect(outsideEv.defaultPrevented).toBe(true);
  });

  it('pans by default and commits once, on settle, to setActiveTabPosition only', () => {
    const { store, canvas, container } = setup();
    const ev = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaX: 0, deltaY: 40 });
    act(() => { container.dispatchEvent(ev); });
    flushFrame();
    expect(canvas.style.transform).toBe('translate(0px, -40px) scale(1)');

    // Not committed yet — still mid-gesture.
    expect(store.dispatched.some((a) => a.type === 'project/setActiveTabPosition')).toBe(false);

    settleWheel();
    const posActions = store.dispatched.filter((a) => a.type === 'project/setActiveTabPosition');
    expect(posActions.length).toBe(1);
    expect(posActions[0].payload).toEqual({ position: { x: 0, y: -40 } });
    // Scale never changed, so commitTransform's change-detection must skip it.
    expect(store.dispatched.some((a) => a.type === 'project/setActiveTabScale')).toBe(false);
  });

  it('ctrl+wheel zooms around the pointer', () => {
    const { store, canvas, container } = setup();
    const ev = new WheelEvent('wheel', {
      bubbles: true, cancelable: true, deltaX: 0, deltaY: -100, clientX: 500, clientY: 350, ctrlKey: true,
    });
    // Derive the expected transform from the already-tested pure functions,
    // using the exact same inputs the hook will see.
    const { dy } = normalizeWheelDelta(ev, RECT.height);
    const anchor = { x: 500 - RECT.left, y: 350 - RECT.top };
    const wheelScale = getWheelScale(1, dy);
    const expectedNext = zoomAtPoint({ position: { x: 0, y: 0 }, scale: 1, nextScale: wheelScale, anchor });

    act(() => { container.dispatchEvent(ev); });
    flushFrame();
    expect(canvas.style.transform).toBe(
      `translate(${expectedNext.position.x}px, ${expectedNext.position.y}px) scale(${expectedNext.scale})`,
    );

    settleWheel();
    const scaleAction = store.dispatched.find((a) => a.type === 'project/setActiveTabScale');
    expect(scaleAction).toBeTruthy();
    expect(scaleAction.payload.scale).toBe(expectedNext.scale);
  });

  it('meta+wheel is treated as an equivalent zoom trigger to ctrl+wheel', () => {
    const { canvas, container } = setup();
    const ev = new WheelEvent('wheel', {
      bubbles: true, cancelable: true, deltaX: 0, deltaY: -100, clientX: 500, clientY: 350, metaKey: true,
    });
    const { dy } = normalizeWheelDelta(ev, RECT.height);
    const anchor = { x: 500 - RECT.left, y: 350 - RECT.top };
    const wheelScale = getWheelScale(1, dy);
    const expectedNext = zoomAtPoint({ position: { x: 0, y: 0 }, scale: 1, nextScale: wheelScale, anchor });

    act(() => { container.dispatchEvent(ev); });
    flushFrame();
    expect(canvas.style.transform).toBe(
      `translate(${expectedNext.position.x}px, ${expectedNext.position.y}px) scale(${expectedNext.scale})`,
    );
  });

  it('shift+wheel maps vertical delta to horizontal pan when deltaX is 0', () => {
    const { canvas, container } = setup();
    const ev = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaX: 0, deltaY: 30, shiftKey: true });
    act(() => { container.dispatchEvent(ev); });
    flushFrame();
    expect(canvas.style.transform).toBe('translate(-30px, 0px) scale(1)');
  });

  it('shift+wheel does NOT swap when deltaX is already non-zero', () => {
    const { canvas, container } = setup();
    const ev = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaX: 15, deltaY: 30, shiftKey: true });
    act(() => { container.dispatchEvent(ev); });
    flushFrame();
    // Real deltaX/deltaY used as-is: x -= 15, y -= 30. Not swapped.
    expect(canvas.style.transform).toBe('translate(-15px, -30px) scale(1)');
  });
});

describe('useCanvasHooks — space-to-pan modifier', () => {
  it('space engages pan mode', () => {
    const { hooksRef } = setup();
    fireEvent.keyDown(document.body, { code: 'Space', key: ' ' });
    expect(hooksRef.current.isPanModifierHeld).toBe(true);
  });

  it('space over a readOnly textarea still engages pan mode (readOnly textareas are not text-entry targets)', () => {
    const { hooksRef, getByTestId } = setup();
    fireEvent.keyDown(getByTestId('card-text'), { code: 'Space', key: ' ' });
    expect(hooksRef.current.isPanModifierHeld).toBe(true);
  });

  it('space over a non-readOnly textarea is ignored (real text-entry target)', () => {
    const store = makeStore();
    const hooksRef = { current: null };
    const { getByTestId } = render(
      <Provider store={store}><Harness hooksRef={hooksRef} textAreaReadOnly={false} /></Provider>,
    );
    fireEvent.keyDown(getByTestId('card-text'), { code: 'Space', key: ' ' });
    expect(hooksRef.current.isPanModifierHeld).toBe(false);
  });

  it('space over a button is ignored, and key-repeat is a no-op', () => {
    const { hooksRef, getByTestId } = setup();
    fireEvent.keyDown(getByTestId('card-button'), { code: 'Space', key: ' ' });
    expect(hooksRef.current.isPanModifierHeld).toBe(false);

    fireEvent.keyDown(document.body, { code: 'Space', key: ' ' });
    expect(hooksRef.current.isPanModifierHeld).toBe(true);

    // Browser key-repeat: should not error and should not change anything.
    fireEvent.keyDown(document.body, { code: 'Space', key: ' ', repeat: true });
    expect(hooksRef.current.isPanModifierHeld).toBe(true);
  });

  it('keyup releases the modifier unconditionally, even from a different target', () => {
    const { hooksRef, getByTestId } = setup();
    fireEvent.keyDown(document.body, { code: 'Space', key: ' ' });
    expect(hooksRef.current.isPanModifierHeld).toBe(true);
    fireEvent.keyUp(getByTestId('card-text'), { code: 'Space', key: ' ' });
    expect(hooksRef.current.isPanModifierHeld).toBe(false);
  });

  it('window blur releases the modifier', () => {
    const { hooksRef } = setup();
    fireEvent.keyDown(document.body, { code: 'Space', key: ' ' });
    expect(hooksRef.current.isPanModifierHeld).toBe(true);
    act(() => { window.dispatchEvent(new Event('blur')); });
    expect(hooksRef.current.isPanModifierHeld).toBe(false);
  });
});

describe('useCanvasHooks — Cmd/Ctrl 0/+/- shortcuts', () => {
  it('cmd+0 resets view and commits both position and scale immediately (no settle wait)', () => {
    const state = makeState({
      project: {
        present: {
          activeViewId: 'v1',
          viewOrder: ['v1'],
          views: { v1: { pos: { x: 5, y: 5 }, scale: 1.2, cards: [] } },
          cards: {},
        },
      },
    });
    const { store, canvas } = setup(state);
    fireEvent.keyDown(document.body, { key: '0', code: 'Digit0', metaKey: true });
    expect(canvas.style.transform).toBe(
      `translate(${DEFAULT_CANVAS_POSITION.x}px, ${DEFAULT_CANVAS_POSITION.y}px) scale(${DEFAULT_CANVAS_SCALE})`,
    );
    const posAction = store.dispatched.find((a) => a.type === 'project/setActiveTabPosition');
    const scaleAction = store.dispatched.find((a) => a.type === 'project/setActiveTabScale');
    expect(posAction).toBeTruthy();
    expect(posAction.payload.position).toEqual(DEFAULT_CANVAS_POSITION);
    expect(scaleAction).toBeTruthy();
    expect(scaleAction.payload.scale).toBe(DEFAULT_CANVAS_SCALE);
  });

  it('cmd+= zooms in by ZOOM_STEP', () => {
    const { canvas } = setup();
    fireEvent.keyDown(document.body, { key: '=', code: 'Equal', metaKey: true });
    expect(canvas.style.transform.endsWith(`scale(${1 + ZOOM_STEP})`)).toBe(true);
  });

  it('cmd+alt+0 does nothing (altKey guard)', () => {
    const { store, canvas } = setup();
    const before = canvas.style.transform;
    fireEvent.keyDown(document.body, { key: '0', code: 'Digit0', metaKey: true, altKey: true });
    expect(canvas.style.transform).toBe(before);
    expect(store.dispatched.length).toBe(0);
  });
});

describe('useCanvasHooks — mouse drag panning', () => {
  it('middle-click drag pans', () => {
    const { store, hooksRef, container, canvas } = setup();
    const downEv = new MouseEvent('mousedown', { button: 1, clientX: 10, clientY: 10, bubbles: true, cancelable: true });
    act(() => { container.dispatchEvent(downEv); });
    expect(downEv.defaultPrevented).toBe(true);
    expect(hooksRef.current.isPanning).toBe(true);

    act(() => { window.dispatchEvent(new MouseEvent('mousemove', { clientX: 60, clientY: 30 })); });
    flushFrame();
    expect(canvas.style.transform).toBe('translate(50px, 20px) scale(1)');

    act(() => { window.dispatchEvent(new MouseEvent('mouseup')); });
    expect(hooksRef.current.isPanning).toBe(false);
    const posActions = store.dispatched.filter((a) => a.type === 'project/setActiveTabPosition');
    expect(posActions.length).toBe(1);
    expect(posActions[0].payload.position).toEqual({ x: 50, y: 20 });
  });

  it('plain left-click (no space held) does not pan', () => {
    const { hooksRef, container } = setup();
    const downEv = new MouseEvent('mousedown', { button: 0, clientX: 10, clientY: 10, bubbles: true, cancelable: true });
    act(() => { container.dispatchEvent(downEv); });
    expect(downEv.defaultPrevented).toBe(false);
    expect(hooksRef.current.isPanning).toBe(false);
  });

  it('space + left-click pans and stops the event from reaching descendant/ancestor listeners', () => {
    const { hooksRef, canvas, getByTestId } = setup();
    const canvasSpy = vi.fn();
    const documentSpy = vi.fn();
    canvas.addEventListener('mousedown', canvasSpy);
    document.addEventListener('mousedown', documentSpy);

    fireEvent.keyDown(document.body, { code: 'Space', key: ' ' });
    expect(hooksRef.current.isPanModifierHeld).toBe(true);

    const downEv = new MouseEvent('mousedown', { button: 0, clientX: 5, clientY: 5, bubbles: true, cancelable: true });
    act(() => { getByTestId('card-text').dispatchEvent(downEv); });

    expect(hooksRef.current.isPanning).toBe(true);
    expect(canvasSpy).not.toHaveBeenCalled();
    expect(documentSpy).not.toHaveBeenCalled();

    document.removeEventListener('mousedown', documentSpy);
  });
});

describe('useCanvasHooks — non-interactive guards', () => {
  it('no listener attaches (wheel is a no-op) when a popup is open', () => {
    const base = makeState();
    const state = makeState({ session: { ...base.session, popup: { id: 'x', type: 'something' } } });
    const store = makeStore(state);
    const hooksRef = { current: null };
    const { getByTestId } = render(<Provider store={store}><Harness hooksRef={hooksRef} /></Provider>);
    const container = getByTestId('container');
    stubRect(container, RECT);

    const ev = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 40 });
    act(() => { container.dispatchEvent(ev); });
    expect(ev.defaultPrevented).toBe(false);
  });

  it('no listener attaches (wheel is a no-op) when activeViewId is empty', () => {
    const state = makeState({
      project: { present: { activeViewId: '', viewOrder: [], views: {}, cards: {} } },
    });
    const store = makeStore(state);
    const hooksRef = { current: null };
    const { getByTestId } = render(<Provider store={store}><Harness hooksRef={hooksRef} /></Provider>);
    const container = getByTestId('container');
    stubRect(container, RECT);

    const ev = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 40 });
    act(() => { container.dispatchEvent(ev); });
    expect(ev.defaultPrevented).toBe(false);
  });
});

describe('useCanvasHooks — tab change', () => {
  it('abandons an uncommitted wheel gesture rather than committing it to the new tab', () => {
    const { store, canvas, container } = setup();
    const ev = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 40 });
    act(() => { container.dispatchEvent(ev); });
    flushFrame();
    expect(canvas.style.transform).toBe('translate(0px, -40px) scale(1)');
    // Mid-gesture: nothing committed yet.
    expect(store.dispatched.length).toBe(0);

    const nextState = makeState({
      project: {
        present: {
          activeViewId: 'v2',
          viewOrder: ['v1', 'v2'],
          views: {
            v1: { pos: { x: 0, y: 0 }, scale: 1, cards: [] },
            v2: { pos: { x: 999, y: 999 }, scale: 1, cards: [] },
          },
          cards: {},
        },
      },
    });
    act(() => { store.setState(nextState); });
    flushFrame();

    // The tab switch itself dispatches nothing — the old tab's uncommitted
    // delta is dropped, not written into the new tab.
    expect(store.dispatched.length).toBe(0);
    expect(canvas.style.transform).toBe('translate(999px, 999px) scale(1)');
  });
});

describe('useMultiSelectHooks', () => {
  it('pan modifier suppresses selection start', () => {
    const store = makeStore();
    const hooksRef = { current: null };
    const panModifierRef = { current: true };
    const { getByTestId } = render(
      <Provider store={store}>
        <MultiSelectHarness hooksRef={hooksRef} panModifierRef={panModifierRef} />
      </Provider>,
    );
    const canvas = getByTestId('canvas');
    fireEvent.mouseDown(canvas, { button: 0 });
    expect(hooksRef.current.selectStyle).toEqual({ border: null });
  });
});
