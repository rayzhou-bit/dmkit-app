import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utility';

// Firebase collections sturcture
// users: usersTestId
//   campaigns: campaignTestId
//     cards: cardsTestId
//     views: viewsTestId
//     viewOrder: []

const initialState = {
  views: {},
  // view1: {
  //   title: "view title",
  //   edited: boolean,
  // }

  viewOrder: [],
  // array that keeps track of the position of the views

  viewDelete: [],
  // array that keeps track of views to delete from firebase

  activeView: null,
};

const updViewTitle = (state, action) => {
  const updatedView = updateObject(state.views[action.view], {title: action.title});
  const updatedViews = updateObject(state.views, {[action.view]: updatedView});
  return updateObject(state, {views: updatedViews});
};

const updViewEdited = (state, action) => {
  const updatedView = updateObject(state.views[action.view], {edited: action.edited});
  const updatedViews = updateObject(state.views, {[action.view]: updatedView});
  return updateObject(state, {views: updatedViews});
};

const queueViewDelete = (state, action) => {
  const updatedViewDelete = [...state.viewDelete].push(action.view);
  return updateObject(state, {viewDelete: updatedViewDelete})
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.UPD_VIEW_TITLE: return updViewTitle(state, action);
    case actionTypes.UPD_VIEW_ORDER: return updateObject(state, {viewOrder: action.data});
    case actionTypes.UPD_VIEW_EDITED: return updViewEdited(state, action);
    case actionTypes.QUEUE_VIEW_DELETE: return queueViewDelete(state, action);
    case actionTypes.CLEAR_VIEW_DELETE: return updateObject(state, {viewDelete: []});
    case actionTypes.UPD_ACTIVE_VIEW: return updateObject(state, {activeView: action.data});
    default: return state;
  }
};

export default reducer;