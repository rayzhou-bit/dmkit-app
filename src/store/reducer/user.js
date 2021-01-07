import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utilityFunctions';

const initialState = {
  user: "",
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.UPD_USER: return updateObject(state, action);
    
    default: return state;
  }
};

export default reducer;