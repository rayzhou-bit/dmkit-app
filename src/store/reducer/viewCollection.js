import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utilityFunctions';

const initialState = {
  // exampleView1: {
  //   title: "view title",
  //   color: "color",
  // },
  view0: {
    title: "Welcome!",
    color: "gray",
  },
};

const reducer = (state = {}, action) => {
  switch(action.type) {
    // Collection load/unload
    case actionTypes.INIT_VIEW_COLL: return initialState;
    case actionTypes.LOAD_VIEW_COLL: return updateObject(state, action.viewColl);
    case actionTypes.UNLOAD_VIEW_COLL: return {};

    // Add/Remove
    case actionTypes.ADD_VIEW: return updateObject(state, {[action.viewId]: action.viewData});
    case actionTypes.REMOVE_VIEW: return removeView(state, action.viewId);

    // Update visuals
    case actionTypes.UPD_VIEW_COLOR: return updViewColor(state, action.viewId, action.color);

    // Update data
    case actionTypes.UPD_VIEW_TITLE: return updViewTitle(state, action.viewId, action.title);

    default: return state;
  }
};

const removeView = (state, viewId) => {
  let updatedViews = {...state};
  delete updatedViews[viewId];
  return updatedViews;
};

const updViewTitle = (state, viewId, title) => {
  let updatedView = {...state[viewId]};
  updatedView.title = title;
  return updateObject(state, {[viewId]: updatedView});
};

const updViewColor = (state, viewId, color) => {
  let updatedView = {...state[viewId]};
  updatedView.color = color;
  return updateObject(state, {[viewId]: updatedView});
};

export default reducer;