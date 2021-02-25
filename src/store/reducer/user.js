import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utilityFunctions';

const initialState = {
  userId: null,
  displayName: null,
  email: null,
  emailVerified: null,
  emailVerificationRequired: null,
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.LOAD_USER: return loadUser(state, action.user);
    case actionTypes.UNLOAD_USER: return initialState;

    case actionTypes.UPD_USER_DISPLAYNAME: return updateObject(state, {displayName: action.displayName});

    default: return state;
  }
};

const loadUser = (state, user) => {
  return updateObject(state, {
    userId: user.uid,
    displayName: user.displayName,
    email: user.email,
    emailVerified: user.emailVerified,
    emailVerificationRequired: user.providerData.map(provider => provider.providerId).includes('password'),
  });
};

export default reducer;