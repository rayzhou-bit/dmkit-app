import { act, renderHook } from '@testing-library/react';
import { clampGroupDelta, useGroupDragStore, useGroupDragPosition } from './groupDrag';
import { GRID_SIZE, CANVAS_SIZE } from '../../constants/dimensions';

describe('clampGroupDelta', () => {
  const origins = {
    a: { pos: { x: 0, y: 0 }, size: { width: 100, height: 100 } },
    b: { pos: { x: 200, y: 0 }, size: { width: 100, height: 100 } },
  };

  it('passes a small in-bounds delta through, grid-snapped', () => {
    const result = clampGroupDelta({ delta: { x: 10, y: 5 }, origins, canvasSize: CANVAS_SIZE });
    expect(result).toEqual({
      x: Math.round(10 / GRID_SIZE) * GRID_SIZE,
      y: Math.round(5 / GRID_SIZE) * GRID_SIZE,
    });
  });

  it('clamps the bounding box against the left/top edge', () => {
    const result = clampGroupDelta({ delta: { x: -9999, y: -9999 }, origins, canvasSize: CANVAS_SIZE });
    // bbox min is (0, 0) already - any leftward/upward delta is clamped to 0.
    expect(result).toEqual({ x: 0, y: 0 });
  });

  it('clamps the bounding box against the right/bottom edge', () => {
    const result = clampGroupDelta({ delta: { x: 999999, y: 999999 }, origins, canvasSize: CANVAS_SIZE });
    // bbox is x:[0,300] y:[0,100] - max allowed delta keeps bbox inside CANVAS_SIZE.
    const expectedX = Math.round((CANVAS_SIZE.width - 300) / GRID_SIZE) * GRID_SIZE;
    const expectedY = Math.round((CANVAS_SIZE.height - 100) / GRID_SIZE) * GRID_SIZE;
    expect(result).toEqual({ x: expectedX, y: expectedY });
  });

  it('preserves relative positions when clamping (adjusts the whole group by one delta)', () => {
    const result = clampGroupDelta({ delta: { x: -9999, y: 0 }, origins, canvasSize: CANVAS_SIZE });
    // Both cards get the same delta - a's and b's 200px separation is untouched.
    expect(result.x).toBe(0);
  });

  it('parses px-string sizes (as written by updateCardSize) the same as plain numbers', () => {
    const stringOrigins = {
      a: { pos: { x: 0, y: 0 }, size: { width: '100px', height: '100px' } },
    };
    const result = clampGroupDelta({ delta: { x: 999999, y: 0 }, origins: stringOrigins, canvasSize: CANVAS_SIZE });
    const expectedX = Math.round((CANVAS_SIZE.width - 100) / GRID_SIZE) * GRID_SIZE;
    expect(result.x).toBe(expectedX);
  });

  it('returns a zero delta when there are no origins', () => {
    expect(clampGroupDelta({ delta: { x: 10, y: 10 }, origins: {}, canvasSize: CANVAS_SIZE })).toEqual({ x: 0, y: 0 });
  });
});

describe('useGroupDragStore / useGroupDragPosition', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] });
  });
  afterEach(() => { vi.useRealTimers(); });

  const flushFrame = () => act(() => { vi.advanceTimersByTime(20); });

  const cardsDimensions = {
    leader: { pos: { x: 0, y: 0 }, size: { width: 100, height: 100 } },
    follower: { pos: { x: 100, y: 0 }, size: { width: 100, height: 100 } },
    other: { pos: { x: 500, y: 500 }, size: { width: 100, height: 100 } },
  };

  it('is inactive and reports null positions before any drag starts', () => {
    const { result } = renderHook(() => {
      const store = useGroupDragStore();
      const followerPos = useGroupDragPosition(store, 'follower');
      return { store, followerPos };
    });
    expect(result.current.store.isActive()).toBe(false);
    expect(result.current.followerPos).toBeNull();
  });

  it('moves followers by the leader delta, leaves the leader and non-members null', () => {
    const { result } = renderHook(() => {
      const store = useGroupDragStore();
      const leaderPos = useGroupDragPosition(store, 'leader');
      const followerPos = useGroupDragPosition(store, 'follower');
      const otherPos = useGroupDragPosition(store, 'other');
      return { store, leaderPos, followerPos, otherPos };
    });

    act(() => {
      result.current.store.selectionRef.current = { selectedCards: ['leader', 'follower'], cardsDimensions };
      result.current.store.start({ leaderId: 'leader' });
      result.current.store.move({ x: 20, y: 30 });
    });
    flushFrame();

    expect(result.current.store.isActive()).toBe(true);
    expect(result.current.leaderPos).toBeNull();
    expect(result.current.followerPos).toEqual({ x: 120, y: 30 });
    expect(result.current.otherPos).toBeNull();
  });

  it('getCommitDelta reflects the latest move immediately, without waiting for a rAF flush', () => {
    const { result } = renderHook(() => useGroupDragStore());
    act(() => {
      result.current.selectionRef.current = { selectedCards: ['leader', 'follower'], cardsDimensions };
      result.current.start({ leaderId: 'leader' });
      result.current.move({ x: 12, y: 0 });
    });
    // No flushFrame() - getCommitDelta must not depend on the rAF-coalesced emit.
    expect(result.current.getCommitDelta()).toEqual({ x: 12, y: 0 });
  });

  it('end() clears the drag and notifies subscribers back to null', () => {
    const { result } = renderHook(() => {
      const store = useGroupDragStore();
      const followerPos = useGroupDragPosition(store, 'follower');
      return { store, followerPos };
    });

    act(() => {
      result.current.store.selectionRef.current = { selectedCards: ['leader', 'follower'], cardsDimensions };
      result.current.store.start({ leaderId: 'leader' });
      result.current.store.move({ x: 20, y: 0 });
    });
    flushFrame();
    expect(result.current.followerPos).toEqual({ x: 120, y: 0 });

    act(() => { result.current.store.end(); });
    expect(result.current.store.isActive()).toBe(false);
    expect(result.current.followerPos).toBeNull();
  });
});
