vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  GoogleAuthProvider: vi.fn(function GoogleAuthProvider() {}),
  FacebookAuthProvider: vi.fn(function FacebookAuthProvider() {}),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  sendEmailVerification: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  applyActionCode: vi.fn(),
  checkActionCode: vi.fn(),
  confirmPasswordReset: vi.fn(),
  verifyPasswordResetCode: vi.fn(),
  getAdditionalUserInfo: vi.fn(),
}));

// auth.js imports this as `./firebase` (it lives alongside auth.js at
// src/data/api/); this test file is a sibling of auth.js too, so the same
// relative specifier resolves to the same module.
vi.mock('./firebase', () => ({
  app: {},
  isFirebaseConfigured: true,
  FIREBASE_NOT_CONFIGURED_CODE: 'app/firebase-not-configured',
  FIREBASE_NOT_CONFIGURED_MESSAGE: "Firebase isn't configured.",
}));

// auth.js imports this as `../api/database`, which - from auth.js's own
// location (src/data/api/) - resolves to src/data/api/database.js. From this
// test file (also in src/data/api/), the same file is `./database`.
vi.mock('./database', () => ({
  save: vi.fn((projectId, projectData, callback) => (dispatch) => { callback?.(); return { type: 'test/save', projectId, projectData }; }),
  fetchActiveProjectId: vi.fn(() => ({ type: 'test/fetchActiveProjectId' })),
  fetchProjects: vi.fn(() => ({ type: 'test/fetchProjects' })),
}));

import { onAuthStateChanged } from 'firebase/auth';
import { authListener } from './auth';
import * as api from './database';

const fakeUser = (uid) => ({
  uid,
  displayName: `User ${uid}`,
  email: `${uid}@example.com`,
  emailVerified: true,
  providerId: 'password',
  providerData: [],
});

describe('authListener - configured (online) path', () => {
  it('returns the real onAuthStateChanged unsubscribe function', () => {
    const unsubscribe = vi.fn();
    onAuthStateChanged.mockImplementation(() => unsubscribe);

    const result = authListener({ dispatch: vi.fn(), getPendingProject: () => ({}) });

    expect(result).toBe(unsubscribe);
  });

  it('startup restore (first callback reports pending work) takes the fetch path, not save', () => {
    let capturedCallback;
    onAuthStateChanged.mockImplementation((auth, cb) => {
      capturedCallback = cb;
      return vi.fn();
    });
    const dispatch = vi.fn();

    authListener({
      dispatch,
      // Pending work is already flagged on the very first callback - as it
      // would be for a returning signed-in user who has pan/zoomed - but
      // there was no prior signed-out observation this session, so this must
      // NOT be treated as a save-worthy transition.
      getPendingProject: () => ({ saveProject: true, projectId: 'intro_project_id', projectData: {} }),
    });

    capturedCallback(fakeUser('u1'));

    expect(api.fetchActiveProjectId).toHaveBeenCalled();
    expect(api.fetchProjects).toHaveBeenCalled();
    expect(api.save).not.toHaveBeenCalled();
  });

  it('signed-out -> signed-in transition saves the FRESH pending-project data, not a stale snapshot', () => {
    let capturedCallback;
    onAuthStateChanged.mockImplementation((auth, cb) => {
      capturedCallback = cb;
      return vi.fn();
    });
    const dispatch = vi.fn();

    let pending = { saveProject: false, projectId: 'stale_project', projectData: { stale: true } };
    authListener({ dispatch, getPendingProject: () => pending });

    // Signed out first.
    capturedCallback(null);

    // The user edits something and signs in - getPendingProject would now
    // report fresh values if read at callback-fire time (not mount time).
    pending = { saveProject: true, projectId: 'fresh_project', projectData: { fresh: true } };
    capturedCallback(fakeUser('u2'));

    expect(api.save).toHaveBeenCalledWith('fresh_project', { fresh: true }, expect.any(Function));
  });

  it('signed-out -> signed-in transition with saveProject: false takes the fetch path, not save', () => {
    let capturedCallback;
    onAuthStateChanged.mockImplementation((auth, cb) => {
      capturedCallback = cb;
      return vi.fn();
    });
    const dispatch = vi.fn();

    authListener({
      dispatch,
      getPendingProject: () => ({ saveProject: false, projectId: 'p1', projectData: {} }),
    });

    capturedCallback(null);
    capturedCallback(fakeUser('u3'));

    expect(api.fetchActiveProjectId).toHaveBeenCalled();
    expect(api.fetchProjects).toHaveBeenCalled();
    expect(api.save).not.toHaveBeenCalled();
  });
});
