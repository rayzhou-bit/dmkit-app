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
        userId,
        displayName,
        email,
        emailVerified,
        providerId,
        providerData,
      } = payload;
      const emailVerificationRequired = providerData
        .map((provider) => provider.providerId)
        .includes('password');
      return {
        ...state,
        userId,
        displayName,
        email,
        emailVerified,
        emailVerificationRequired,
        providerId,
        providerData,
      };
    },
    updateUserDisplayName: (state, { payload }) => ({
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
