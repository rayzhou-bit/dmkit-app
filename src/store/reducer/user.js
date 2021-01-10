import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utilityFunctions';

const initialState = {
  user: null,
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.LOAD_USER: return updateObject(state, action);
    case actionTypes.UNLOAD_USER: return {};
    
    default: return state;
  }
};

export default reducer;