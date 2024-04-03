import { createSlice } from '@reduxjs/toolkit';

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
    initialize: () => ({ ...initialState }),
    loadUser: (state, { payload }) => {
      const {
        uid,
        displayName,
        email,
        emailVerified,
        providerId,
        providerData,
      } = payload.user;
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
    updUserDisplayname: (state, { payload }) => ({
      ...state,
      displayName: payload.displayName,
    }),
  },
});

const actions = user.actions;

const { reducer } = user;

export {
  actions,
  initialState,
  reducer,
};
