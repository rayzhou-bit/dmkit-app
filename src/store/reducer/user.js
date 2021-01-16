import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utilityFunctions';

const initialState = {
  user: null,
  email: null,
};

const reducer = (state = {}, action) => {
  switch(action.type) {
    case actionTypes.LOAD_USER: return updateObject(state, {user: action.user, email: action.email});
    case actionTypes.UNLOAD_USER: return {};
    
    default: return state;
  }
};

export default reducer;