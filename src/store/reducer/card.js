import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utility';

const initialState = {
  // card1: {
  //   views: {
  //     view1: {
  //       x: x-position,
  //       y: y-position,
  //     },
  //   },
  //   data: {
  //     title: "card title",
  //     text: "text field,
  //   }
  //   edited: boolean,
  // }
};

const saveEditedCard = (state, action) => {
  const updatedCard = updateObject(state[action.card], {edited: false});
  return updateObject(state, updatedCard);
};

const addCard = (state, action) => {
  const card = {
    [action.card]: {
      views: {
        [action.view]: { x: 100, y: 100 }
      },
      data: {
        title: "untitled",
        text: "Fill me in!"
      },
      edited: true
    }
  };
  return updateObject(state, card);
};

const removeCardFromView = (state, action) => {
  let updatedCard = {...state[action.card]};
  delete updatedCard.views[action.view];
  updatedCard.edited = true;
  return updateObject(state, {[action.card]: updatedCard});
};

const deleteCard = (state, action) => {
  let updatedCardColl = {...state};
  delete updatedCardColl[action.card];
  return updatedCardColl;
};

const updCardPos = (state, action) => {
  let updatedCard = {...state[action.card]};
  updatedCard.views = updateObject(updatedCard.views, {[action.view]: action.pos});
  updatedCard.edited = true;
  return updateObject(state, {[action.card]: updatedCard});

  // let newPos = action.pos ? {[action.view]: action.pos} : null;
  // let newViews = null;
  // if (state.cards[action.card]) {
  //   const oldViews = (state.cards[action.card].views ? state.cards[action.card].views : null);
  //   if (newPos) {
  //     newViews = updateObject(oldViews, newPos);
  //   } else {
  //     newViews = oldViews;
  //     delete newViews[action.view];
  //   }
  // } else {
  //   newViews = newPos;
  // }
  // const updatedCard = updateObject(state.cards[action.card], {views: newViews})
  // const updatedCards = updateObject(state.cards, {[action.card]: updatedCard});
  // return updateObject(state, {cards: updatedCards});
};

const updCardText = (state, action) => {
  let updatedCard = {...state[action.card]};
  updatedCard.data.text = action.text;
  updatedCard.edited = true;
  return updateObject(state, {[action.card]: updatedCard});

  // let newData = action.data;
  // if (state.cards[action.card]) {
  //   const oldData = (state.cards[action.card].data ? state.cards[action.card].data : null);
  //   newData = updateObject(oldData, action.data);
  // }
  // const updatedCard = updateObject(state.cards[action.card], {data: newData});
  // const updatedCards = updateObject(state.cards, {[action.card]: updatedCard});
  // return updateObject(state, {cards: updatedCards});
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.LOAD_CARD_COLL: return updateObject(state, action.cardColl);
    case actionTypes.SAVE_EDITED_CARD: return saveEditedCard(state, action); 

    case actionTypes.ADD_CARD: return addCard(state, action);
    case actionTypes.REMOVE_CARD_FROM_VIEW: return removeCardFromView(state, action);
    case actionTypes.DELETE_CARD: return deleteCard(state, action);

    case actionTypes.UPD_CARD_POS: return updCardPos(state, action);
    case actionTypes.UPD_CARD_TEXT: return updCardText(state, action);

    default: return state;
  }
};

export default reducer;