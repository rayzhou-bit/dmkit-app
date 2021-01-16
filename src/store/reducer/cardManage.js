import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utilityFunctions';

const initialState = {
  activeCard: "card1",

  cardCreate: ["card1"],         // array for new cards that do not have a firebase id
  createCount: 1,

  cardDelete: [],               // array for cards to delete from firebase
};
 
const reducer = (state = {}, action) => {
  switch(action.type) {
    case actionTypes.INIT_CARD_MANAGE: return initialState;

    // activeCard
    case actionTypes.UPD_ACTIVE_CARD: return updateObject(state, {activeCard: action.activeCard});

    // cardCreate
    case actionTypes.QUEUE_CARD_CREATE: return queueCardCreate(state, action.cardId);
    case actionTypes.DEQUEUE_CARD_CREATE: return dequeueCardCreate(state, action.cardId);
    case actionTypes.CLEAR_CARD_CREATE: return updateObject(state, {cardCreate: [], createCount: 0});
    
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
    createCount: state.createCount+1,
    activeCard: queuedCard,
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
  let updatedActiveCard = (queuedCard !== state.activeCard) ? state.activeCard : null;
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
    activeCard: updatedActiveCard,
  });
};

export default reducer;