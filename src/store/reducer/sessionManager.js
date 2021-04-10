import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utilityFunctions';

const initialState = {
  campaignList: {
    // campaignId: campaignTitle,
  },
  activeCampaignId: null,
  activeCardId: null,

  status: 'loading',  // idle, loading or saving
  campaignEdit: false,  // flag for any unsaved changes

  errorPasswordReset: "",
  errorEmailSignIn: "",
  errorEmailSignUp: "",
  errorGoogleSignIn: "",
  errorFacebookSignIn: "",
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.RESET_SESSION_MANAGER: return {...initialState};

    // CAMPAIGN RELATED
    case actionTypes.LOAD_CAMPAIGN_LIST: return updateObject(state, {campaignList: action.campaignList});
    case actionTypes.ADD_CAMPAIGN_TO_LIST: return addCampaignToList(state, action.campaignId, action.campaignTitle);
    case actionTypes.REMOVE_CAMPAIGN_FROM_LIST: return removeCampaignFromList(state, action.campaignId);
    case actionTypes.UPD_CAMPAIGN_ON_LIST: return updCampaignOnList(state, action.title);
    case actionTypes.UPD_ACTIVE_CAMPAIGN_ID: return updateObject(state, {activeCampaignId: action.activeCampaignId});
    case actionTypes.UPD_ACTIVE_CARD_ID: return updateObject(state, {activeCardId: action.activeCardId});

    case actionTypes.SET_STATUS: return updateObject(state, {status: action.status});
    case actionTypes.SET_CAMPAIGN_EDIT: return updateObject(state, {campaignEdit: action.edit});
    case actionTypes.SET_INTRO_CAMPAIGN_EDIT: return updateObject(state, {introCampaignEdit: action.edit});

    // ERRORS
    case actionTypes.SET_ERROR_PASSWORD_RESET: return setErrorPasswordReset(state, action.errorCode);
    case actionTypes.UNSET_ERROR_PASSWORD_RESET: return updateObject(state, {errorPasswordReset: ""});
    case actionTypes.SET_ERROR_EMAIL_SIGN_IN: return setErrorEmailSignIn(state, action.errorCode);
    case actionTypes.UNSET_ERROR_EMAIL_SIGN_IN: return updateObject(state, {errorEmailSignIn: ""});
    case actionTypes.SET_ERROR_EMAIL_SIGN_UP: return setErrorEmailSignUp(state, action.errorCode);
    case actionTypes.UNSET_ERROR_EMAIL_SIGN_UP: return updateObject(state, {errorEmailSignUp: ""});
    case actionTypes.SET_ERROR_GOOGLE_SIGN_IN: return setErrorGoogleSignIn(state, action.errorCode);
    case actionTypes.UNSET_ERROR_GOOGLE_SIGN_IN: return updateObject(state, {errorGoogleSignIn: ""});
    case actionTypes.SET_ERROR_FACEBOOK_SIGN_IN: return setErrorFaceboookSignIn(state, action.errorCode);
    case actionTypes.UNSET_ERROR_FACEBOOK_SIGN_IN: return updateObject(state, {errorFacebookSignIn: ""});

    default: return state;
  }
};

const addCampaignToList = (state, campaignId, campaignTitle) => {
  let updatedCampaignList = {...state.campaignList};
  updatedCampaignList = updateObject(updatedCampaignList, {[campaignId]: campaignTitle});
  const updatedState = {
    campaignList: updatedCampaignList,
    activeCampaignId: campaignId,
  };
  return updateObject(state, updatedState);
};

const removeCampaignFromList = (state, campaignId) => {
  let updatedCampaignList = {...state.campaignList};
  delete updatedCampaignList[campaignId];
  const updatedState = {
    campaignList: updatedCampaignList,
    activeCampaignId: campaignId === state.activeCampaignId ? null : state.activeCampaignId,
  };
  return updateObject(state, updatedState);
};

const updCampaignOnList = (state, title) => {
  let updatedCampaignList = {...state.campaignList};
  updatedCampaignList[state.activeCampaignId] = title;
  const updatedState = {
    campaignList: updatedCampaignList,
  };
  return updateObject(state, updatedState);
};

//ERRORS
const setErrorPasswordReset = (state, errorCode) => {
  // error codes for firebase method Auth.sendPasswordResetEmail
  switch (errorCode) {
    case ('auth/invalid-email'): return updateObject(state, {errorPasswordReset: "email address is not valid"});
    case ('auth/user-not-found'): return updateObject(state, {errorPasswordReset: "user does not exist"});
    // other cases: auth/missing-android-pkg-name, auth/missing-continue-uri, auth/missing-ios-bundle-id, auth/invalid-continue-uri, auth/unauthorized-continue-uri
    default: return updateObject(state, {errorPasswordReset: "could not send password reset email"});
  }
};

const setErrorEmailSignIn = (state, errorCode) => {
  // error codes for firebase method Auth.signInWithEmailAndPassword
  switch (errorCode) {
    case ('auth/invalid-email'): return updateObject(state, {errorEmailSignIn: "invalid email"});
    case ('auth/user-disabled'): return updateObject(state, {errorEmailSignIn: "user disabled"});
    case ('auth/user-not-found'): return updateObject(state, {errorEmailSignIn: "user not found"});
    case ('auth/wrong-password'): return updateObject(state, {errorEmailSignIn: "invalid password"});
    default: return updateObject(state, {errorEmailSignIn: "sign in unsuccessful"});
  }
};

const setErrorEmailSignUp = (state, errorCode) => {
  // error codes for firebase method Auth.createUserWithEmailAndPassword
  switch (errorCode) {
    case ('auth/email-already-in-use'): return updateObject(state, {errorEmailSignUp: "email already in use"});
    case ('auth/invalid-email'): return updateObject(state, {errorEmailSignUp: "invalid email"});
    case ('auth/operation-not-allowed'): return updateObject(state, {errorEmailSignUp: "email sign up currently not in service"});
    case ('auth/weak-password'): return updateObject(state, {errorEmailSignUp: "password must be at least 6 characters long"});
    default: return updateObject(state, {errorEmailSignUp: "email sign up unsuccessful"});
  }
};

const setErrorGoogleSignIn = (state, errorCode) => {
  // error codes for firebase method Auth.signInWithPopUp
  switch (errorCode) {
    case ('auth/account-exists-with-different-credential'): return updateObject(state, {errorGoogleSignIn: "account for this email already exists"});
    case ('auth/auth-domain-config-required'): return updateObject(state, {errorGoogleSignIn: "missing authorization configuration"});
    case ('auth/cancelled-popup-request'): return updateObject(state, {errorGoogleSignIn: "too many sign in popups attempted"});
    case ('auth/operation-not-allowed'): return updateObject(state, {errorGoogleSignIn: "operation not allowed"});
    case ('auth/operation-not-supported-in-this-environment'): return updateObject(state, {errorGoogleSignIn: "operation not supported"});
    case ('auth/popup-blocked'): return updateObject(state, {errorGoogleSignIn: "sign in popup blocked"});
    // case ('auth/popup-closed-by-user'): return updateObject(state, {errorGoogleSignIn: "sign in popup closed"});
    case ('auth/unauthorized-domain'): return updateObject(state, {errorGoogleSignIn: "unauthorized domain"});
    default: return state;
  }
};

const setErrorFaceboookSignIn = (state, errorCode) => {
  // error codes for firebase method Auth.signInWithPopUp
  switch (errorCode) {
    case ('auth/account-exists-with-different-credential'): return updateObject(state, {errorFacebookSignIn: "account for this email already exists"});
    case ('auth/auth-domain-config-required'): return updateObject(state, {errorFacebookSignIn: "missing authorization configuration"});
    case ('auth/cancelled-popup-request'): return updateObject(state, {errorFacebookSignIn: "too many sign in popups attempted"});
    case ('auth/operation-not-allowed'): return updateObject(state, {errorFacebookSignIn: "operation not allowed"});
    case ('auth/operation-not-supported-in-this-environment'): return updateObject(state, {errorFacebookSignIn: "operation not supported"});
    case ('auth/popup-blocked'): return updateObject(state, {errorFacebookSignIn: "sign in popup blocked"});
    case ('auth/popup-closed-by-user'): return updateObject(state, {errorFacebookSignIn: "sign in popup closed"});
    case ('auth/unauthorized-domain'): return updateObject(state, {errorFacebookSignIn: "unauthorized domain"});
    default: return state;
  }
};

export default reducer;