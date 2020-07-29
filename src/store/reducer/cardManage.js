import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utilityFunctions';

const initialState = {
  cardDelete: [],
  // array that keeps track of cards to delete from firebase

  activeCard: null,
};


const queueCardDelete = (state, action) => {
  const updatedCardDelete = [...state.cardDelete];
  updatedCardDelete.push(action.card);
  return updateObject(state, {cardDelete: updatedCardDelete})
};
 
const reducer = (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.QUEUE_CARD_DELETE: return queueCardDelete(state, action);
    case actionTypes.CLEAR_CARD_DELETE: return updateObject(state, {cardDelete: []});

    case actionTypes.UPD_ACTIVE_CARD: return updateObject(state, {activeCard: action.card});
    
    default: return state;
  }
};

export default reducer;