import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utilityFunctions';

// Firebase collections sturcture
// users: usersTestId
//   campaigns: campaignTestId
//     cards: cardsTestId
//     views: viewsTestId

const initialState = {
  user: "usersTestId",
  campaign: "campaignTestId",
  campaignList: [],
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.UPD_USER: return updateObject(state, action.user);
    case actionTypes.UPD_CAMPAIGN: return updateObject(state, action.campaign);
    default: return state;
  }
};

export default reducer;