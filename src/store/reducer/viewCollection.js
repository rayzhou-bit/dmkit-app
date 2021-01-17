import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utilityFunctions';

const initialState = {
  // exampleView1: {
  //   title: "view title",
  //   color: "color",
  //   edited: boolean,
  // },
  view0: {
    title: "Welcome!",
    edited: false,
  },
};

const reducer = (state = {}, action) => {
  switch(action.type) {
    // Collection load/unload
    case actionTypes.INIT_VIEW_COLL: return initialState;
    case actionTypes.LOAD_VIEW_COLL: return updateObject(state, action.viewColl);
    case actionTypes.UNLOAD_VIEW_COLL: return {};
    case actionTypes.UNSET_VIEW_EDIT: return unsetViewEdit(state, action.viewId);

    // Add/Remove
    case actionTypes.ADD_VIEW: return addView(state, action.viewId, action.dataPackage);
    case actionTypes.REMOVE_VIEW: return removeView(state, action.viewId);

    // Update visuals
    case actionTypes.UPD_VIEW_COLOR: return updViewColor(state, action.viewId, action.color);

    // Update data
    case actionTypes.UPD_VIEW_TITLE: return updViewTitle(state, action.viewId, action.title);

    default: return state;
  }
};

const unsetViewEdit = (state, viewId) => {
  const updatedView = updateObject(state[viewId], {edited: false});
  return updateObject(state, {[viewId]: updatedView});
};

const addView = (state, viewId, dataPackage) => {
  const newView = updateObject(dataPackage, {edited: true});
  return updateObject(state, {[viewId]: newView});
};

const removeView = (state, viewId) => {
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