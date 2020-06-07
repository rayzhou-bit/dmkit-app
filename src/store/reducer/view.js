import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utility';

// Firebase collections sturcture
// users: usersTestId
//   campaigns: campaignTestId
//     cards: cardsTestId
//     views: viewsTestId

const initialState = {
  views: null,
  // structure for views
  // autoId: {
  //   title: view-title,
  // }
  viewOrder: [],  // array that keeps track of the position of the views

  activeView: null,
};

const updView = (state, action) => {
  const updatedViews = updateObject(state.views, {[action.id]: action.data});
  const updatedState = {views: updatedViews};
  return updateObject(state, updatedState);
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.UPD_VIEW: return updView(state, action);
    case actionTypes.UPD_VIEW_ORDER: return updateObject(state, {viewOrder: action.data});
    case actionTypes.UPD_ACTIVE_VIEW: return updateObject(state, {activeView: action.data});
    default: return state;
  }
};

export default reducer;