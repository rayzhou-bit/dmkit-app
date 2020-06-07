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
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
    default: return state;
  }
};

export default reducer;