import * as actionTypes from '../actionTypes';

// <-----dataManager REDUCER CALLS----->
export const initDataManager = () => { return { type: actionTypes.INIT_DATA_MANAGER }; };
export const loadUser = (userId, email) => { return { type: actionTypes.LOAD_USER, userId: userId, email: email }; };
export const unloadUser = () => { return { type: actionTypes.UNLOAD_USER }; };