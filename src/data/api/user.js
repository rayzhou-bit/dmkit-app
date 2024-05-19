import { getAuth, updateProfile } from 'firebase/auth';

export const updateDisplayName = (name) => dispatch => {
  const auth = getAuth();
  updateProfile(auth.currentUser, { displayName: name })
    .then(response => {
      console.log('[updateDisplayName] success', response);
      // There is currently a bug where the displayName is updated but we get an error back.
      // dispatch(actions.user.updateUserDisplayName({ displayName: name }));
    })
    .catch(error => console.log('[updateDisplayName] error', error));
};
