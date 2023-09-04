import { createSlice } from '@reduxjs/toolkit';

// TODO make the following name changes
//   userId -> uid

const initialState = {
  userId: null,
  displayName: null,
  email: null,
  emailVerified: null,
  emailVerificationRequired: null,
  providerId: null,
  providerData: null,
};

const user = createSlice({
  name: 'user',
  initialState,
  reducers: {
    resetUser: () => ({ ...initialState }),
    loadUser: (state, { user }) => {
      const {
        uid,
        displayName,
        email,
        emailVerified,
        providerId,
        providerData,
      } = user;
      const emailVerificationRequired = providerData
        .map((provider) => provider.providerId)
        .includes('password');
      return {
        ...state,
        userId: uid,
        displayName,
        email,
        emailVerified,
        emailVerificationRequired,
        providerId,
        providerData,
      };
    },
  },
});

const actions = user.actions;

const { reducer } = user;

export {
  actions,
  initialState,
  reducer,
};
