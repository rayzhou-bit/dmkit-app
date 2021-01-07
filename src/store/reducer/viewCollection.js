import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utilityFunctions';

// Firebase collections sturcture
// users: usersTestId
//   campaigns: campaignTestId
//     cards: cardsTestId
//     views: viewsTestId
//     viewOrder: []

const initialState = {
  // view1: {
  //   title: "view title",
  //   color: "color",
  //   edited: boolean,
  // },
  view1: {
    title: "untitled",
  },
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.LOAD_VIEW_COLL: return updateObject(state, action.viewColl);
    case actionTypes.UNLOAD_VIEW_COLL: return {};
    case actionTypes.RESET_VIEW_EDIT: return resetViewEdit(state, action.viewId);

    case actionTypes.ADD_VIEW: return addViewToStore(state, action.viewId, action.dataPackage);
    case actionTypes.DELETE_VIEW: return deleteViewFromStore(state, action.viewId);

    case actionTypes.UPD_VIEW_TITLE: return updViewTitle(state, action.viewId, action.title);
    case actionTypes.UPD_VIEW_COLOR: return updViewColor(state, action.viewId, action.color);

    default: return state;
  }
};

const resetViewEdit = (state, viewId) => {
  const updatedView = updateObject(state[viewId], {edited: false});
  return updateObject(state, {[viewId]: updatedView});
};

const addViewToStore = (state, viewId, dataPackage) => {
  let newView = { [viewId]: dataPackage };
  newView = updateObject(newView, {edited: true});
  return updateObject(state, newView);
};

const deleteViewFromStore = (state, viewId) => {
  let updatedViews = {...state};
  delete updatedViews[viewId];
  return updatedViews;
};

const updViewTitle = (state, viewId, title) => {
  let updatedView = {...state[viewId]};
  updatedView.title = title;
  updatedView.edited = true;
  return updateObject(state, {[viewId]: updatedView});
};

const updViewColor = (state, viewId, color) => {
  let updatedView = {...state[viewId]};
  updatedView.color = color;
  updatedView.edited = true;
  return updateObject(state, {[viewId]: updatedView});
};

export default reducer;