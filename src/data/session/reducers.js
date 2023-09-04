import { createSlice } from '@reduxjs/toolkit';

// TODO make the following name changes
//   activeCampaignId -> activeCampaign
//   activeCardId -> activeCard
//   campaignEdit -> isCampaignEdited
//   errorPasswordReset -> passwordResetError
//   errorEmailSignIn -> emailSignInError
//   errorEmailSignUp -> emailSignUpError
//   errorGoogleSignIn -> googleSignInError
//   errorFacebookSignIn -> facebookSignInError

const initialState = {
  campaignList: {
    // campaignId: campaignTitle,
  },
  activeCampaignId: null,
  activeCardId: null,

  popup: {
    id: '',
    type: '',
  },

  status: 'loading',  // idle, loading or saving
  campaignEdit: false,  // flag for any unsaved changes

  errorPasswordReset: '',
  errorEmailSignIn: '',
  errorEmailSignUp: '',
  errorGoogleSignIn: '',
  errorFacebookSignIn: '',
};

const session = createSlice({
  name: 'session',
  initialState,
  reducers: {
    resetSession: () => ({ ...initialState }),

    // CAMPAIGN LIST
    loadCampaignList: (state, { campaignList }) => ({ ...state, campaignList }),
    addCampaign: (state, { id, title }) => ({
      ...state,
      campaignList: {
        ...state.campaignList,
        [id]: title,
      },
      activeCampaignId: id,
    }),
    removeCampaign: (state, { id }) => {
      let newCampaignList = { ...state.campaignList };
      delete newCampaignList[id];
      return {
        ...state,
        newCampaignList,
        activeCampaignId: state.activeCampaignId === id ? null : state.activeCampaignId,
      };
    },
    updateCampaign: (state, { title }) => ({
      ...state,
      campaignList: {
        ...state.campaignList,
        [state.activeCampaignId]: title,
      },
    }),

    // ACTIVE/SELECTED
    updateActiveCampaignId: (state, { id }) => ({ ...state, activeCampaignId: id }),
    updateActiveCardId: (state, { id }) => ({ ...state, activeCardId: id }),
    
    // POPUP STATES
    resetPopup: (state) => ({
      ...state,
      popup: {
        id: '',
        type: '',
      },
    }),
    setPopup: (state, { popup }) => ({ ...state, popup }),

    // SAVE LOAD STATES
    setStatus: (state, { status }) => ({ ...state, status: status }),
    setCampaignEdit: (state, { isEdited }) => ({ ...state, campaignEdit: isEdited }),
    // setIsIntroCampaignEdited,

    // ERROR HANDLING
    setErrorPasswordReset: (state, { code }) => {
      let msg = '';
      switch (code) {
        case ('auth/invalid-email'): msg = 'email address is not valid';
        case ('auth/user-not-found'): msg = 'user does not exist';
        // other cases: auth/missing-android-pkg-name, auth/missing-continue-uri, auth/missing-ios-bundle-id, auth/invalid-continue-uri, auth/unauthorized-continue-uri
        default: msg = 'could not send password reset email';
      }
      return { ...state, errorPasswordReset: msg };
    },
    resetErrorPasswordReset: (state) => ({ ...state, errorPasswordReset: '' }),
    setErrorEmailSignIn: (state, { code }) => {
      let msg = '';
      switch (code) {
        case ('auth/invalid-email'): msg = 'invalid email';
        case ('auth/user-disabled'): msg = 'user disabled';
        case ('auth/user-not-found'): msg = 'user not found';
        case ('auth/wrong-password'): msg = 'invalid password';
        default: msg = 'sign in unsuccessful';
      }
      return { ...state, errorEmailSignIn: msg };
    },
    resetErrorEmailSignIn: (state => ({ ...state, errorEmailSignIn: '' })),
    setErrorEmailSignUp: (state, { code }) => {
      let msg = '';
      switch (code) {
        case ('auth/email-already-in-use'): msg = 'email already in use';
        case ('auth/invalid-email'): msg = 'invalid email';
        case ('auth/operation-not-allowed'): msg = 'email sign up currently not in service';
        case ('auth/weak-password'): msg = 'password must be at least 6 characters long';
        default: msg = 'email sign up unsuccessful';
      }
      return { ...state, errorEmailSignUp: '' };
    },
    resetErrorEmailSignUp: (state => ({ ...state, errorEmailSignUp: '' })),
    setErrorGoogleSignIn: (state, { code }) => {
      let msg = '';
      switch (code) {
        case ('auth/account-exists-with-different-credential'): msg = 'account for this email already exists';
        case ('auth/auth-domain-config-required'): msg = 'missing authorization configuration';
        case ('auth/cancelled-popup-request'): msg = 'too many sign in popups attempted';
        case ('auth/operation-not-allowed'): msg = 'operation not allowed';
        case ('auth/operation-not-supported-in-this-environment'): msg = 'operation not supported';
        case ('auth/popup-blocked'): msg = 'sign in popup blocked';
        // case ('auth/popup-closed-by-user'): msg = 'sign in popup closed';
        case ('auth/unauthorized-domain'): msg = 'unauthorized domain';
        default: msg = 'google sign in failed';
      }
      return { ...state, errorGoogleSignIn: '' };
    },
    resetErrorGoogleSignIn: (state => ({ ...state, errorGoogleSignIn: '' })),
    setErrorFacebookSignIn: (state, { code }) => {
      let msg = '';
      switch (code) {
        case ('auth/account-exists-with-different-credential'): msg = 'account for this email already exists';
        case ('auth/auth-domain-config-required'): msg = 'missing authorization configuration';
        case ('auth/cancelled-popup-request'): msg = 'too many sign in popups attempted';
        case ('auth/operation-not-allowed'): msg = 'operation not allowed';
        case ('auth/operation-not-supported-in-this-environment'): msg = 'operation not supported';
        case ('auth/popup-blocked'): msg = 'sign in popup blocked';
        case ('auth/popup-closed-by-user'): msg = 'sign in popup closed';
        case ('auth/unauthorized-domain'): msg = 'unauthorized domain';
        default: msg = 'facebook sign in failed';
      }
      return { ...state, errorFacebookSignIn: '' };
    },
    resetErrorFacebookSignIn: (state => ({ ...state, errorFacebookSignIn: '' })),
  },
});

const actions = session.actions;

const { reducer } = session;

export {
  actions,
  initialState,
  reducer,
};
