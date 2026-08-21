import {
  clampScale,
  roundScale,
  getViewportPoint,
  normalizeWheelDelta,
  zoomAtPoint,
  getWheelScale,
  applyTransform,
  formatZoomPercent,
  clampPosition,
} from './canvasTransform';
import {
  MIN_CANVAS_SCALE,
  MAX_CANVAS_SCALE,
  WHEEL_LINE_HEIGHT,
  WHEEL_PAGE_HEIGHT,
  MAX_WHEEL_DELTA,
  CANVAS_TRANSITION_MS,
} from '../constants/dimensions';

describe('clampScale', () => {
  it('clamps a value below MIN_CANVAS_SCALE up to the minimum', () => {
    expect(clampScale(MIN_CANVAS_SCALE - 0.3)).toBe(MIN_CANVAS_SCALE);
  });

  it('clamps a value above MAX_CANVAS_SCALE down to the maximum', () => {
    expect(clampScale(MAX_CANVAS_SCALE + 0.3)).toBe(MAX_CANVAS_SCALE);
  });

  it('passes an in-range value through unchanged', () => {
    const midpoint = (MIN_CANVAS_SCALE + MAX_CANVAS_SCALE) / 2;
    expect(clampScale(midpoint)).toBe(midpoint);
  });

  it('passes MIN_CANVAS_SCALE itself through unchanged', () => {
    expect(clampScale(MIN_CANVAS_SCALE)).toBe(MIN_CANVAS_SCALE);
  });

  it('passes MAX_CANVAS_SCALE itself through unchanged', () => {
    expect(clampScale(MAX_CANVAS_SCALE)).toBe(MAX_CANVAS_SCALE);
  });
});

describe('roundScale', () => {
  it('rounds 1.2349 down to 1.23', () => {
    expect(roundScale(1.2349)).toBe(1.23);
  });

  it('rounds 1.235 up to 1.24', () => {
    expect(roundScale(1.235)).toBe(1.24);
  });

  it('passes an already 2-decimal value through unchanged', () => {
    expect(roundScale(1.5)).toBe(1.5);
  });
});

describe('getViewportPoint', () => {
  it('returns {x: 0, y: 0} for a null element without throwing', () => {
    expect(() => getViewportPoint({ clientX: 10, clientY: 10 }, null)).not.toThrow();
    expect(getViewportPoint({ clientX: 10, clientY: 10 }, null)).toEqual({ x: 0, y: 0 });
  });

  it('subtracts the bounding rect offset from the event coordinates', () => {
    const element = { getBoundingClientRect: () => ({ left: 100, top: 50 }) };
    const event = { clientX: 150, clientY: 80 };
    expect(getViewportPoint(event, element)).toEqual({ x: 50, y: 30 });
  });
});

describe('normalizeWheelDelta', () => {
  it('passes pixel deltas (deltaMode 0) through 1:1 for a small delta', () => {
    const result = normalizeWheelDelta({ deltaX: 5, deltaY: 8, deltaMode: 0 });
    expect(result).toEqual({ dx: 5, dy: 8 });
  });

  it('clamps a large pixel deltaY to MAX_WHEEL_DELTA', () => {
    const result = normalizeWheelDelta({ deltaX: 0, deltaY: 120, deltaMode: 0 });
    expect(result.dy).toBe(MAX_WHEEL_DELTA);
  });

  it('clamps a large negative pixel deltaY to -MAX_WHEEL_DELTA', () => {
    const result = normalizeWheelDelta({ deltaX: 0, deltaY: -120, deltaMode: 0 });
    expect(result.dy).toBe(-MAX_WHEEL_DELTA);
  });

  it('multiplies line deltas (deltaMode 1) by WHEEL_LINE_HEIGHT when under the clamp', () => {
    const deltaY = 2;
    const result = normalizeWheelDelta({ deltaX: 0, deltaY, deltaMode: 1 });
    expect(result.dy).toBe(deltaY * WHEEL_LINE_HEIGHT);
  });

  it('clamps line deltas (deltaMode 1) that multiply past MAX_WHEEL_DELTA', () => {
    const deltaY = 10; // 10 * WHEEL_LINE_HEIGHT (16) = 160, over the clamp
    const result = normalizeWheelDelta({ deltaX: 0, deltaY, deltaMode: 1 });
    expect(result.dy).toBe(MAX_WHEEL_DELTA);
  });

  it('uses the WHEEL_PAGE_HEIGHT fallback for page deltas (deltaMode 2) when viewportHeight is 0', () => {
    const result = normalizeWheelDelta({ deltaX: 0, deltaY: 0.1, deltaMode: 2 }, 0);
    expect(result.dy).toBe(0.1 * WHEEL_PAGE_HEIGHT);
  });

  it('uses the real viewportHeight for page deltas (deltaMode 2) when provided, clamping if needed', () => {
    const result = normalizeWheelDelta({ deltaX: 0, deltaY: 0.1, deltaMode: 2 }, 800);
    // 0.1 * 800 = 80, which is over MAX_WHEEL_DELTA
    expect(result.dy).toBe(MAX_WHEEL_DELTA);
  });

  it('produces different results for viewportHeight 0 vs 800 (fallback vs real value)', () => {
    const withFallback = normalizeWheelDelta({ deltaX: 0, deltaY: 0.1, deltaMode: 2 }, 0);
    const withReal = normalizeWheelDelta({ deltaX: 0, deltaY: 0.1, deltaMode: 2 }, 800);
    expect(withFallback.dy).not.toBe(withReal.dy);
  });

  it('treats an undefined viewportHeight the same as 0 (both hit the fallback)', () => {
    const withUndefined = normalizeWheelDelta({ deltaX: 0, deltaY: 0.1, deltaMode: 2 }, undefined);
    const withZero = normalizeWheelDelta({ deltaX: 0, deltaY: 0.1, deltaMode: 2 }, 0);
    expect(withUndefined.dy).toBe(withZero.dy);
    expect(withUndefined.dy).toBe(0.1 * WHEEL_PAGE_HEIGHT);
  });

  it('clamps dx and dy independently of each other', () => {
    const result = normalizeWheelDelta({ deltaX: 1000, deltaY: 5, deltaMode: 0 });
    expect(result.dx).toBe(MAX_WHEEL_DELTA);
    expect(result.dy).toBe(5);
  });
});

describe('zoomAtPoint', () => {
  const worldUnderAnchor = ({ position, scale }, anchor) => ({
    x: (anchor.x - position.x) / scale,
    y: (anchor.y - position.y) / scale,
  });

  const cases = [
    {
      name: 'anchor at the origin',
      position: { x: 80, y: 50 },
      scale: 1,
      nextScale: 1.2,
      anchor: { x: 0, y: 0 },
    },
    {
      name: 'anchor at a nonzero point',
      position: { x: 0, y: 0 },
      scale: 1,
      nextScale: 1.3,
      anchor: { x: 400, y: 300 },
    },
    {
      name: 'non-default starting position, zooming in',
      position: { x: 120, y: -40 },
      scale: 0.8,
      nextScale: 1.1,
      anchor: { x: 200, y: 150 },
    },
    {
      name: 'zooming out',
      position: { x: 50, y: 50 },
      scale: 1.2,
      nextScale: 0.9,
      anchor: { x: 250, y: 250 },
    },
    {
      name: 'nextScale above MAX_CANVAS_SCALE (clamped)',
      position: { x: 0, y: 0 },
      scale: 1,
      nextScale: 5,
      anchor: { x: 100, y: 100 },
    },
    {
      name: 'nextScale below MIN_CANVAS_SCALE (clamped)',
      position: { x: 0, y: 0 },
      scale: 1,
      nextScale: 0.01,
      anchor: { x: 100, y: 100 },
    },
  ];

  it.each(cases)('preserves the world point under the anchor: $name', ({ position, scale, nextScale, anchor }) => {
    const before = { position, scale };
    const result = zoomAtPoint({ position, scale, nextScale, anchor });
    const after = { position: result.position, scale: result.scale };

    const worldBefore = worldUnderAnchor(before, anchor);
    const worldAfter = worldUnderAnchor(after, anchor);

    expect(worldAfter.x).toBeCloseTo(worldBefore.x, 6);
    expect(worldAfter.y).toBeCloseTo(worldBefore.y, 6);
  });

  it('returns the same position object and unchanged scale when nextScale resolves to the current scale (no-op)', () => {
    const position = { x: 80, y: 50 };
    const scale = 1.25;
    const result = zoomAtPoint({ position, scale, nextScale: 1.25, anchor: { x: 100, y: 100 } });

    expect(result.position).toBe(position);
    expect(result.scale).toBe(scale);
  });
});

describe('getWheelScale', () => {
  it('matches the exp-based formula for getWheelScale(1, -100)', () => {
    expect(getWheelScale(1, -100)).toBe(roundScale(Math.exp(0.25)));
  });

  it('shrinks the scale for a positive dy', () => {
    const scale = 1;
    expect(getWheelScale(scale, 100)).toBeLessThan(scale);
  });

  it('clamps to MAX_CANVAS_SCALE for a huge negative dy', () => {
    expect(getWheelScale(1, -100000)).toBe(MAX_CANVAS_SCALE);
  });

  it('clamps to MIN_CANVAS_SCALE for a huge positive dy', () => {
    expect(getWheelScale(1, 100000)).toBe(MIN_CANVAS_SCALE);
  });

  it('is monotonic: a more negative dy never produces a smaller resulting scale', () => {
    const moreNegative = getWheelScale(1, -50);
    const lessNegative = getWheelScale(1, -10);
    expect(moreNegative).toBeGreaterThanOrEqual(lessNegative);
  });
});

describe('applyTransform', () => {
  it('is a no-op that does not throw when node is null', () => {
    expect(() => applyTransform(null, { position: { x: 0, y: 0 }, scale: 1, animate: false })).not.toThrow();
  });

  it('sets style.transition to "none" when animate is false', () => {
    const node = { style: {} };
    applyTransform(node, { position: { x: 0, y: 0 }, scale: 1, animate: false });
    expect(node.style.transition).toBe('none');
  });

  it('sets style.transition to a duration + ease string when animate is true', () => {
    const node = { style: {} };
    applyTransform(node, { position: { x: 0, y: 0 }, scale: 1, animate: true });
    expect(node.style.transition).toBe(`transform ${CANVAS_TRANSITION_MS}ms ease`);
  });

  it('sets style.transform to the exact translate/scale string', () => {
    const node = { style: {} };
    applyTransform(node, { position: { x: 80, y: 50 }, scale: 1.25, animate: false });
    expect(node.style.transform).toBe('translate(80px, 50px) scale(1.25)');
  });
});

describe('formatZoomPercent', () => {
  it('formats 1 as 100%', () => {
    expect(formatZoomPercent(1)).toBe('100%');
  });

  it('formats 0.755 as 76% (rounds)', () => {
    expect(formatZoomPercent(0.755)).toBe('76%');
  });

  it('formats 1.5 as 150%', () => {
    expect(formatZoomPercent(1.5)).toBe('150%');
  });

  it('formats 0.5 as 50%', () => {
    expect(formatZoomPercent(0.5)).toBe('50%');
  });
});

describe('clampPosition', () => {
  const base = { scale: 1, contentWidth: 3000, contentHeight: 2400, viewportWidth: 800, viewportHeight: 600 };

  it('leaves an in-bounds position unchanged', () => {
    expect(clampPosition({ ...base, position: { x: 80, y: 50 } })).toEqual({ x: 80, y: 50 });
  });

  it('clamps a position panned far off the right/bottom edge', () => {
    expect(clampPosition({ ...base, position: { x: 9999, y: 9999 } })).toEqual({ x: 600, y: 400 }); // viewport - margin(200)
  });

  it('clamps a position panned far off the left/top edge', () => {
    // minX = margin(200) - contentWidth*scale(3000) = -2800
    expect(clampPosition({ ...base, position: { x: -99999, y: -99999 } })).toEqual({ x: -2800, y: -2200 });
  });

  it('does not clamp against a not-yet-measured (0x0) viewport', () => {
    expect(clampPosition({ ...base, viewportWidth: 0, viewportHeight: 0, position: { x: 9999, y: 9999 } }))
      .toEqual({ x: 9999, y: 9999 });
  });
});
