import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  return {
    build: {
      outDir: 'build',
    },
    plugins: [react()],
    // E2E runs must be hermetic. Vite's .env.local outranks .env.[mode], so a
    // developer with real Firebase credentials would otherwise get an
    // auth-gated app instead of the offline intro project. Pointing envDir at
    // ./e2e (which contains no .env files) guarantees every VITE_APP_* is
    // undefined, so src/data/api/auth.js takes its offline branch.
    ...(mode === 'e2e' ? { envDir: 'e2e' } : {}),
  };
});
