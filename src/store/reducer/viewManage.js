import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utilityFunctions';

const initialState = {
  viewOrder: [],
  // array that keeps track of the position of the views

  viewDelete: [],
  // array that keeps track of views to delete from firebase

  activeView: null,
};

const addToViewOrder = (state, action) => {
  const updatedViewOrder = [...state.viewOrder];
  updatedViewOrder.push(action.view);
  return updateObject(state, {viewOrder: updatedViewOrder});
};

const deleteFromViewOrder = (state, action) => {
  const updatedViewOrder = [...state.viewOrder].filter(view => view !== action.view);
  return updateObject(state, {viewOrder: updatedViewOrder, activeView: updatedViewOrder[0]});
};

const queueViewDelete = (state, action) => {
  const updatedViewDelete = [...state.viewDelete];
  updatedViewDelete.push(action.view);
  return updateObject(state, {viewDelete: updatedViewDelete});
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.LOAD_VIEW_ORDER: return updateObject(state, {viewOrder: action.viewOrder});
    case actionTypes.ADD_TO_VIEW_ORDER: return addToViewOrder(state, action);
    case actionTypes.DELETE_FROM_VIEW_ORDER: return deleteFromViewOrder(state, action);

    case actionTypes.QUEUE_VIEW_DELETE: return queueViewDelete(state, action);
    case actionTypes.CLEAR_VIEW_DELETE: return updateObject(state, {viewDelete: []});

    case actionTypes.UPD_ACTIVE_VIEW: return updateObject(state, {activeView: action.view});

    default: return state;
  }
};

export default reducer;