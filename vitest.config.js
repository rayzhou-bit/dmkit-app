import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    // Classic transform: every .jsx in src/ imports React, and no .js file
    // contains JSX, so esbuild's built-in handling is sufficient. Deliberately
    // NOT loading @vitejs/plugin-react here — it peers on vite ^4.2.0 while
    // Vitest runs its own nested Vite, and we don't need Fast Refresh in tests.
    jsx: 'transform',
  },
  test: {
    // Required: @testing-library/react@12 only registers its auto-cleanup
    // afterEach hook when a global `afterEach` exists.
    globals: true,
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        // jsdom only defines requestAnimationFrame/cancelAnimationFrame when
        // pretendToBeVisual is on. src/components/Canvas/hooks.js calls both
        // unconditionally (scheduleApply / flushApply).
        pretendToBeVisual: true,
      },
    },
    setupFiles: ['./src/setupTests.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    // Keep Playwright's e2e/*.spec.js out of Vitest's default glob.
    exclude: ['node_modules/**', 'e2e/**', 'build/**'],
    // .scss imports (ZoomControls.jsx, Card.jsx, ...) resolve to empty stubs;
    // no sass compilation runs during tests.
    css: false,
    clearMocks: true,
    restoreMocks: true,
  },
});
