import * as actionTypes from '../actionTypes';

// <-----dataManager REDUCER CALLS----->
export const initDataManager = () => { return { type: actionTypes.INIT_DATA_MANAGER }; };
export const loadUser = (user, email) => { return { type: actionTypes.LOAD_USER, user: user, email: email }; };
export const unloadUser = () => { return { type: actionTypes.UNLOAD_USER }; };