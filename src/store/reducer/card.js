import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utility';

// Firebase collections sturcture
// users: usersTestId
//   campaigns: campaignTestId
//     cards: cardsTestId
//     views: viewsTestId

const initialState = {
  cards: null,
  // structure for cards
  // autoId: {
  //   x: x-position,
  //   y: y-position,
  //   views: [view1, view2, etc...],
  // }
};

const updCard = (state, action) => {
  const updatedCards = updateObject(state.cards, {[action.id]: action.data});
  const updatedState = {cards: updatedCards};
  return updateObject(state, updatedState);
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.UPD_CARD: return updCard(state, action);
    default: return state;
  }
};

export default reducer;