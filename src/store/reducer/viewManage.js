import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utility';

const initialState = {
  viewOrder: [],
  // array that keeps track of the position of the views

  viewDelete: [],
  // array that keeps track of views to delete from firebase

  activeView: null,
};

const queueViewDelete = (state, action) => {
  const updatedViewDelete = [...state.viewDelete].push(action.view);
  return updateObject(state, {viewDelete: updatedViewDelete})
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.LOAD_VIEW_ORDER: return updateObject(state, {viewOrder: action.viewOrder});
    case actionTypes.ADD_TO_VIEW_ORDER: return updateObject(state, {viewOrder: [...state.viewOrder].push(action.view)});
    case actionTypes.DELETE_FROM_VIEW_ORDER: return updateObject(state, {viewOrder: [...state.viewOrder].filter(view => view !== action.view)});

    case actionTypes.QUEUE_VIEW_DELETE: return queueViewDelete(state, action);
    case actionTypes.CLEAR_VIEW_DELETE: return updateObject(state, {viewDelete: []});

    case actionTypes.UPD_ACTIVE_VIEW: return updateObject(state, {activeView: action.view});

    default: return state;
  }
};

export default reducer;