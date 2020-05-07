import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utility';

// Firebase collections sturcture
// users: usersTestId
//   campaigns: campaignTestId
//     cards: cardsTestId
//     views: viewsTestId

const initialState = {
  user: "usersTestId",
  campaign: "campaignTestId",
  cards: null,
  // {
  //   key1: {x: x-position, y: y-position},
  //   key2: {x: x-position, y: y-potition},
  //   etc...
  // }
};

const updCardPos = (state, action) => {
  const updatedCards = updateObject(state.cards, {[action.key]: action.data});
  const updatedState = {
    cards: updatedCards,
  }
  return updateObject(state, updatedState);
}

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.UPD_CARD_POS: return updCardPos(state, action);
    default:
      return state;
  }
};

export default reducer;