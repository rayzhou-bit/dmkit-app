vi.mock('firebase/auth', () => ({
  updateProfile: vi.fn(),
}));

// user.js imports this as `./firebase` (it lives alongside user.js at
// src/data/api/); this test file is a sibling of user.js too, so the same
// relative specifier resolves to the same module.
vi.mock('./firebase', () => ({
  isFirebaseConfigured: false,
  FIREBASE_NOT_CONFIGURED_MESSAGE: "Firebase isn't configured.",
}));

// user.js imports this as `./auth`, which - from user.js's own location
// (src/data/api/) - resolves to src/data/api/auth.js. This test file is a
// sibling of user.js too, so the same relative specifier resolves to the
// same module.
vi.mock('./auth', () => ({
  getUser: vi.fn(() => ({ uid: 'u1' })),
}));

import { updateProfile } from 'firebase/auth';
import { updateDisplayName } from './user';

describe('updateDisplayName - offline (firebase not configured) path', () => {
  it('does not call updateProfile and dispatches a session error', () => {
    const dispatch = vi.fn();

    updateDisplayName('New Name')(dispatch);

    expect(updateProfile).not.toHaveBeenCalled();

    const types = dispatch.mock.calls.map(([action]) => action.type);
    expect(types).toContain('session/setError');
  });
});
