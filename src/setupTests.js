import '@testing-library/jest-dom/vitest';

// Fail loudly rather than mysteriously if the jsdom environment ever loses
// pretendToBeVisual — src/components/Canvas/hooks.js requires rAF to exist.
if (typeof globalThis.requestAnimationFrame !== 'function'
  || typeof globalThis.cancelAnimationFrame !== 'function') {
  throw new Error(
    'requestAnimationFrame/cancelAnimationFrame missing from the test environment. '
    + 'Set test.environmentOptions.jsdom.pretendToBeVisual = true in vitest.config.js.',
  );
}
