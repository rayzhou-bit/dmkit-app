import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utility';

// Firebase collections sturcture
// users: usersTestId
//   campaigns: campaignTestId
//     cards: cardsTestId
//     views: viewsTestId
//     viewOrder: []

const initialState = {
  cards: {},
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

  cardDelete: [],
  // array that keeps track of cards to delete from firebase

  activeCard: null,
};

const addCard = (state, action) => {
  const card = {
    [action.card]: {
      views: {
        [action.view]: {x: action.x, y: action.y}
      },
      data: {
        title: "untitled",
        text: "Fill me in!"
      },
      edited: true
    }
  };
  const updatedCards = updateObject(state.cards, card);
  return updateObject(state, {cards: updatedCards});
};

const updCardPos = (state, action) => {
  let newPos = action.pos ? {[action.view]: action.pos} : null;

  let newViews = null;
  if (state.cards[action.card]) {
    const oldViews = (state.cards[action.card].views ? state.cards[action.card].views : null);
    if (newPos) {
      newViews = updateObject(oldViews, newPos);
    } else {
      newViews = oldViews;
      delete newViews[action.view];
    }
  } else {
    newViews = newPos;
  }

  const updatedCard = updateObject(state.cards[action.card], {views: newViews})
  const updatedCards = updateObject(state.cards, {[action.card]: updatedCard});
  return updateObject(state, {cards: updatedCards});
};

const updCardData = (state, action) => {
  let newData = action.data;
  if (state.cards[action.card]) {
    const oldData = (state.cards[action.card].data ? state.cards[action.card].data : null);
    newData = updateObject(oldData, action.data);
  }

  const updatedCard = updateObject(state.cards[action.card], {data: newData});
  const updatedCards = updateObject(state.cards, {[action.card]: updatedCard});
  return updateObject(state, {cards: updatedCards});
};

const updCardEdited = (state, action) => {
  const updatedCard = updateObject(state.cards[action.card], {edited: action.edited});
  const updatedCards = updateObject(state.cards, {[action.card]: updatedCard});
  return updateObject(state, {cards: updatedCards});
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.ADD_CARD: return addCard(state, action);
    case actionTypes.UPD_CARD_POS: return updCardPos(state, action);
    case actionTypes.UPD_CARD_DATA: return updCardData(state, action);
    case actionTypes.UPD_CARD_EDITED: return updCardEdited(state, action);
    case actionTypes.UPD_ACTIVE_CARD: return updateObject(state, {activeCard: action.card});
    default: return state;
  }
};

export default reducer;