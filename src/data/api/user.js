import { getUser } from './auth';

export const updateDisplayName = (name) => dispatch => {
  const user = getUser();
  user.updateProfile({ displayName: name })
    .then(response => {
      console.log('[updateDisplayName] success', response);
      dispatch(actions.user.updUserDisplayname({ displayName: name }));
    })
    .catch(error => console.log('[updateDisplayName] error', error));
};
