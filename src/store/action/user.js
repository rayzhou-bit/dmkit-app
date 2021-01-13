import * as actionTypes from '../actionTypes';

export const loadUser = (user, email) => { return { type: actionTypes.LOAD_USER, user: user, email: email }; };
export const unloadUser = () => { return { type: actionTypes.UNLOAD_USER }; };