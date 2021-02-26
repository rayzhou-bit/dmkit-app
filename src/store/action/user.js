import * as actionTypes from '../actionTypes';

// <-----user REDUCER CALLS----->
export const loadUser = (user) => { return { type: actionTypes.LOAD_USER, user: user }; };
export const unloadUser = () => { return { type: actionTypes.UNLOAD_USER }; };
export const updUserDisplayname = (displayName) => { return { type: actionTypes.UPD_USER_DISPLAYNAME, displayName: displayName }; };

// <-----dataManager REDUCER CALLS----->
export const initDataManager = () => { return { type: actionTypes.INIT_DATA_MANAGER }; };
export const setErrorEmailSignIn = (errorCode) => { return { type: actionTypes.SET_ERROR_EMAIL_SIGN_IN, errorCode: errorCode }; };
export const unsetErrorEmailSignIn = () => { return { type: actionTypes.UNSET_ERROR_EMAIL_SIGN_IN }; };
export const setErrorEmailSignUp = (errorCode) => { return { type: actionTypes.SET_ERROR_EMAIL_SIGN_UP, errorCode: errorCode }; };
export const unsetErrorEmailSignUp = () => { return { type: actionTypes.UNSET_ERROR_EMAIL_SIGN_UP }; };
export const setErrorGoogleSignUp = (errorCode) => { return { type: actionTypes.SET_ERROR_GOOGLE_SIGN_IN, errorCode: errorCode }; };
export const unsetErrorGoogleSignUp = () => { return { type: actionTypes.UNSET_ERROR_GOOGLE_SIGN_IN }; };
export const setErrorFacebookSignUp = (errorCode) => { return { type: actionTypes.SET_ERROR_FACEBOOK_SIGN_IN, errorCode: errorCode }; };
export const unsetErrorFacebookSignUp = () => { return { type: actionTypes.UNSET_ERROR_FACEBOOK_SIGN_IN }; };
