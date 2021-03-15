import * as actionTypes from '../actionTypes';

// actions for userData reducer
export const loadUser = (user) => { return { type: actionTypes.LOAD_USER, user: user }; };
export const unloadUser = () => { return { type: actionTypes.UNLOAD_USER }; };
export const updUserDisplayname = (displayName) => { return { type: actionTypes.UPD_USER_DISPLAYNAME, displayName: displayName }; };