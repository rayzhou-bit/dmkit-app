import * as actionTypes from '../actionTypes';

// <-----dataManager REDUCER CALLS----->
export const initDataManager = () => { return { type: actionTypes.INIT_DATA_MANAGER }; };
export const loadUser = (userId, email) => { return { type: actionTypes.LOAD_USER, userId: userId, email: email }; };
export const unloadUser = () => { return { type: actionTypes.UNLOAD_USER }; };

export const setErrorEmailSignIn = (errorCode) => { return { type: actionTypes.SET_ERROR_EMAIL_SIGN_IN, errorCode: errorCode }; };
export const unsetErrorEmailSignIn = () => { return { type: actionTypes.UNSET_ERROR_EMAIL_SIGN_IN }; };
export const setErrorEmailSignUp = (errorCode) => { return { type: actionTypes.SET_ERROR_EMAIL_SIGN_UP, errorCode: errorCode }; };
export const unsetErrorEmailSignUp = () => { return { type: actionTypes.UNSET_ERROR_EMAIL_SIGN_UP }; };