import * as actionTypes from '../actionTypes';

// actions for userData reducer
export const loadUser = (user) => { return { type: actionTypes.LOAD_USER, user: user }; };
export const unloadUser = () => { return { type: actionTypes.UNLOAD_USER }; };
export const updUserDisplayname = (displayName) => { return { type: actionTypes.UPD_USER_DISPLAYNAME, displayName: displayName }; };

// actions for auth errors fround in sessionManager reducer
export const setErrorPasswordReset = (errorCode) => { return { type: actionTypes.SET_ERROR_PASSWORD_RESET, errorCode: errorCode }; };
export const unsetErrorPasswordReset = () => { return { type: actionTypes.UNSET_ERROR_PASSWORD_RESET }; };
export const setErrorEmailSignIn = (errorCode) => { return { type: actionTypes.SET_ERROR_EMAIL_SIGN_IN, errorCode: errorCode }; };
export const unsetErrorEmailSignIn = () => { return { type: actionTypes.UNSET_ERROR_EMAIL_SIGN_IN }; };
export const setErrorEmailSignUp = (errorCode) => { return { type: actionTypes.SET_ERROR_EMAIL_SIGN_UP, errorCode: errorCode }; };
export const unsetErrorEmailSignUp = () => { return { type: actionTypes.UNSET_ERROR_EMAIL_SIGN_UP }; };
export const setErrorGoogleSignUp = (errorCode) => { return { type: actionTypes.SET_ERROR_GOOGLE_SIGN_IN, errorCode: errorCode }; };
export const unsetErrorGoogleSignUp = () => { return { type: actionTypes.UNSET_ERROR_GOOGLE_SIGN_IN }; };
export const setErrorFacebookSignUp = (errorCode) => { return { type: actionTypes.SET_ERROR_FACEBOOK_SIGN_IN, errorCode: errorCode }; };
export const unsetErrorFacebookSignUp = () => { return { type: actionTypes.UNSET_ERROR_FACEBOOK_SIGN_IN }; };