import { createSlice } from '@reduxjs/toolkit';
import { introCampaign } from '../introCampaign';

const initialState = {
  id: null,
  displayName: '',
  email: '',
  emailVerified: null,
  emailVerificationRequired: null,

  campaignList: {},
  activeCampaign: null,
  campaignEdit: false,

  status: 'loading',
  errorPasswordReset: "",
  errorEmailSignIn: "",
  errorEmailSignUp: "",
  errorGoogleSignIn: "",
  errorFacebookSignIn: "",
};

const account = createSlice({
  name: 'account',
  initialState,
  reducers: {
    loadUser: (state, { user }) => ({
      ...state,
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      emailVerified: user.emailVerified,
      emailVerificationRequired: user.providerData.map(provider => provider.providerId).includes('password'),
      providerId: user.providerId,
      providerData: user.providerData,
    }),

    resetSessionManager: (state) => ({
      ...state,
      campaignList: {},
      activeCampaign: null,
      campaignEdit: false,
      status: 'loading',
      errorPasswordReset: "",
      errorEmailSignIn: "",
      errorEmailSignUp: "",
      errorGoogleSignIn: "",
      errorFacebookSignIn: "",
    }),

    loadCampaignList: (state, { payload }) => ({
      ...state,
      campaignList: payload,
    }),
    createCampaign: (state, { id, title }) => ({
      ...state,
      campaignList: {
        ...state.campaignList,
        [id]: title,
      },
      activeCampaign: id,
    }),
    destroyCampaign: (state, { id }) => {
      let updatedCampaignList = { ...state.campaignList };
      delete updatedCampaignList[id];
      return {
        ...state,
        campaignList: updatedCampaignList,
        activeCampaign: id === state.activeCampaign ? null : state.activeCampaign,
      };
    },
    updCampaignOnList: (state, { id, title }) => ({
      ...state,
      campaignList: {
        ...state.campaignList,
        [id]: title,
      },
    }),
    updActiveCampaign: (state, { id }) => ({
      ...state,
      activeCampaign: id,
    }),
    setCampaignEdit: (state, { edit }) => ({
      ...state,
      campaignEdit: edit,
    }),
    
    setStatus: (state, { status }) => ({
      ...state,
      status: status,
    }),

    setError: (state, { key, error }) => ({
      ...state,
      [key]: error,
    }),
    unsetError: (state, { key }) => ({
      ...state,
      [key]: "",
    }),
  },
});

const actions = account.actions;
const { reducer } = account;

export {
  actions,
  initialState,
  reducer,
};