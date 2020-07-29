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
  // }
};

const saveEditedView = (state, action) => {
  const updatedView = updateObject(state[action.view], {edited: false});
  return updateObject(state, {[action.view]: updatedView});
};

const addView = (state, action) => {
  let newView = { [action.view]: action.dataPackage };
  newView = updateObject(newView, {edited: true});
  return updateObject(state, newView);
};

const deleteView = (state, action) => {
  let updatedViews = {...state};
  delete updatedViews[action.view];
  return updatedViews;
};

const updViewTitle = (state, action) => {
  let updatedView = {...state[action.view]};
  updatedView.title = action.title;
  updatedView.edited = true;
  return updateObject(state, {[action.view]: updatedView});
};

const updViewColor = (state, action) => {
  let updatedView = {...state[action.view]};
  updatedView.color = action.color;
  updatedView.edited = true;
  return updateObject(state, {[action.view]: updatedView});
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.LOAD_VIEW_COLL: return updateObject(state, action.viewColl);
    case actionTypes.SAVE_EDITED_VIEW: return saveEditedView(state, action);

    case actionTypes.ADD_VIEW: return addView(state, action);
    case actionTypes.DELETE_VIEW: return deleteView(state, action);

    case actionTypes.UPD_VIEW_TITLE: return updViewTitle(state, action);
    case actionTypes.UPD_VIEW_COLOR: return updViewColor(state, action);

    default: return state;
  }
};

export default reducer;