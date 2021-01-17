import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utilityFunctions';

// IMPLEMENT: MOVE CONTENTS TO OTHER COMPONENTS
const initialState = {
  activeCardId: "card0",
  cardCreateCnt: 1,

  cardCreate: ["card0"],         // array for new cards that do not have a firebase id
  cardDelete: [],               // array for cards to delete from firebase
};
 
const reducer = (state = {}, action) => {
  switch(action.type) {
    case actionTypes.INIT_CARD_MANAGE: return initialState;

    // activeCardId
    case actionTypes.UPD_ACTIVE_CARD: return updateObject(state, {activeCardId: action.activeCardId});

    // cardCreate
    case actionTypes.QUEUE_CARD_CREATE: return queueCardCreate(state, action.cardId);
    case actionTypes.DEQUEUE_CARD_CREATE: return dequeueCardCreate(state, action.cardId);
    case actionTypes.CLEAR_CARD_CREATE: return updateObject(state, {cardCreate: []});
    
    // cardDelete
    case actionTypes.QUEUE_CARD_DELETE: return queueCardDelete(state, action.cardId);
    case actionTypes.CLEAR_CARD_DELETE: return updateObject(state, {cardDelete: []});
    
    default: return state;
  }
};

// cardCreate
const queueCardCreate = (state, queuedCard) => {
  let updatedCardCreate = [...state.cardCreate];
  updatedCardCreate.push(queuedCard);
  return updateObject(state, {
    cardCreate: updatedCardCreate, 
    cardCreateCnt: state.cardCreateCnt+1,
    activeCardId: queuedCard,
  });
};
const dequeueCardCreate = (state, dequeuedCard) => {
  const updatedCardCreate = [...state.cardCreate].filter(cardId => cardId !== dequeuedCard);
  return updateObject(state, {cardCreate: updatedCardCreate})
};

// cardDelete
const queueCardDelete = (state, queuedCard) => {
  let updatedCardCreate = [...state.cardCreate];
  let updatedCardDelete = [...state.cardDelete];
  let updatedActiveCard = (queuedCard !== state.activeCardId) ? state.activeCardId : null;
  if (updatedCardCreate.includes(queuedCard)) {
    // if card to be deleted has yet to be saved to server, remove from cardCreate
    const i = updatedCardCreate.indexOf(queuedCard);
    updatedCardCreate.splice(i, 1);
  } else {
    updatedCardDelete.push(queuedCard);
  }
  return updateObject(state, {
    cardCreate: updatedCardCreate,
    cardDelete: updatedCardDelete, 
    activeCardId: updatedActiveCard,
  });
};

export default reducer;