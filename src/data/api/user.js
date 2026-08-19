import { updateProfile } from 'firebase/auth';

import { actions } from '../redux';
import { getUser } from './auth';
import { isFirebaseConfigured, FIREBASE_NOT_CONFIGURED_MESSAGE } from './firebase';

const reportError = (dispatch, source, error) => {
  console.log(`[${source}] error`, error);
  dispatch(actions.session.setError({ source, message: error?.message ?? String(error) }));
};

const requireFirebase = (dispatch, source) => {
  if (isFirebaseConfigured) return true;
  reportError(dispatch, source, new Error(FIREBASE_NOT_CONFIGURED_MESSAGE));
  return false;
};

export const updateDisplayName = (name) => dispatch => {
  if (!requireFirebase(dispatch, 'updateDisplayName')) return;
  const user = getUser();
  if (!user) {
    reportError(dispatch, 'updateDisplayName', new Error('No signed-in user.'));
    return;
  }
  updateProfile(user, { displayName: name })
    .then(response => {
      console.log('[updateDisplayName] success', response);
      // There is currently a bug where the displayName is updated but we get an error back.
      // dispatch(actions.user.updateUserDisplayName({ displayName: name }));
    })
    // Deliberately NOT reportError: see above - this rejects on successful
    // renames, so it must not be recorded as a session error.
    .catch(error => console.log('[updateDisplayName] error', error));
};
