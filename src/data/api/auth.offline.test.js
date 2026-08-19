// Separate file (rather than vi.doMock + vi.resetModules mid-file) so the
// offline `isFirebaseConfigured: false` mock is simply the module's mock from
// the start - no juggling two mock configurations for `./firebase` in one file.
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

vi.mock('./firebase', () => ({
  app: {},
  isFirebaseConfigured: false,
  FIREBASE_NOT_CONFIGURED_CODE: 'app/firebase-not-configured',
  FIREBASE_NOT_CONFIGURED_MESSAGE: "Firebase isn't configured.",
}));

vi.mock('./database', () => ({
  save: vi.fn((projectId, projectData, callback) => (dispatch) => { callback?.(); return { type: 'test/save', projectId, projectData }; }),
  fetchActiveProjectId: vi.fn(() => ({ type: 'test/fetchActiveProjectId' })),
  fetchProjects: vi.fn(() => ({ type: 'test/fetchProjects' })),
}));

import { onAuthStateChanged } from 'firebase/auth';
import { authListener } from './auth';

describe('authListener - offline (firebase not configured) path', () => {
  it('returns a callable no-op and dispatches the offline load actions, without touching onAuthStateChanged', () => {
    const dispatch = vi.fn();

    const unsubscribe = authListener({ dispatch, getPendingProject: () => ({}) });

    expect(() => unsubscribe()).not.toThrow();
    expect(onAuthStateChanged).not.toHaveBeenCalled();

    const types = dispatch.mock.calls.map(([action]) => action.type);
    expect(types).toEqual(expect.arrayContaining([
      'project/loadIntroProject',
      'session/loadIntro',
      'user/initialize',
      '@@redux-undo/CLEAR_HISTORY',
    ]));
  });
});
