import { renderHook, act } from '@testing-library/react';

import { useIsMobile, MOBILE_QUERY } from './useIsMobile';

// Builds a matchMedia stub whose `matches` can be flipped afterwards, so a
// test can simulate a rotation/resize across the breakpoint.
const stubMatchMedia = (initialMatches) => {
  const listeners = new Set();
  const mql = {
    matches: initialMatches,
    addEventListener: (_event, handler) => listeners.add(handler),
    removeEventListener: (_event, handler) => listeners.delete(handler),
  };
  const queries = [];
  window.matchMedia = (query) => { queries.push(query); return mql; };
  return {
    queries,
    listenerCount: () => listeners.size,
    change: (matches) => {
      mql.matches = matches;
      listeners.forEach(handler => handler({ matches }));
    },
  };
};

describe('useIsMobile', () => {
  afterEach(() => { delete window.matchMedia; });

  // The whole suite predates mobile and was written against the desktop
  // component tree, so the no-matchMedia fallback has to stay false.
  it('reports not-mobile when matchMedia is unavailable (jsdom default)', () => {
    expect(window.matchMedia).toBeUndefined();
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('reads the initial value from the breakpoint query', () => {
    const media = stubMatchMedia(true);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
    expect(media.queries).toContain(MOBILE_QUERY);
  });

  it('reports not-mobile above the breakpoint', () => {
    stubMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('updates when the viewport crosses the breakpoint', () => {
    const media = stubMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());

    act(() => media.change(true));
    expect(result.current).toBe(true);

    act(() => media.change(false));
    expect(result.current).toBe(false);
  });

  it('unsubscribes on unmount', () => {
    const media = stubMatchMedia(false);
    const { unmount } = renderHook(() => useIsMobile());
    expect(media.listenerCount()).toBe(1);

    unmount();
    expect(media.listenerCount()).toBe(0);
  });
});
