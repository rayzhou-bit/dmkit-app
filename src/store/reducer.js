import * as actionTypes from './actionTypes';
import { updateObject } from '../shared/utility';

const initialState = {
  position: null,
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.SAVE_POS:
      return (
        updateObject(state, {
          position: action.position,
        })
      );
    case actionTypes.LOAD_POS:
      return (
        updateObject(state, {
          position: action.position,
        })
      );
    default:
      return state;
  }
};

export default reducer;