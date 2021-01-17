import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utilityFunctions';

// IMPLEMENT: MOVE CONTENTS TO OTHER COMPONENTS
const initialState = {
  viewOrder: ["view0"],            // array that tracks the position of the views
  activeViewId: "view0",
  viewCreateCnt: 1,

  viewCreate: ["view0"],      // array for new views that do not have firebase ids
  viewDelete: [],           // array for views to delete from firebase
};

const reducer = (state = {}, action) => {
  switch(action.type) {
    // viewOrder
    // activeViewId
    // viewCreate PICK UP HERE
    case actionTypes.QUEUE_VIEW_CREATE: return queueViewCreate(state, action.viewId);
    case actionTypes.DEQUEUE_VIEW_CREATE: return dequeueViewCreate(state, action.viewId);
    case actionTypes.CLEAR_VIEW_CREATE: return updateObject(state, {viewCreate: []});

    // viewDelete
    case actionTypes.QUEUE_VIEW_DELETE: return queueViewDelete(state, action.viewId);
    case actionTypes.CLEAR_VIEW_DELETE: return updateObject(state, {viewDelete: []});

    default: return state;
  }
};

// viewOrder
const addToViewOrder = (state, addedView) => {
  const updatedViewOrder = [...state.viewOrder];
  updatedViewOrder.push(addedView);
  return updateObject(state, {viewOrder: updatedViewOrder});
};
const deleteFromViewOrder = (state, deletedView) => {
  const updatedViewOrder = [...state.viewOrder].filter(view => view !== deletedView);
  return updateObject(state, {viewOrder: updatedViewOrder, activeViewId: updatedViewOrder[0]});
};

//viewCreate
const queueViewCreate = (state, queuedView) => {
  let updatedViewCreate = [...state.viewCreate];
  updatedViewCreate.push(queuedView);
  return updateObject(state, {
    viewCreate: updatedViewCreate, 
    viewCreateCnt: state.viewCreateCnt+1,
    activeViewId: queuedView,
  });
};
const dequeueViewCreate = (state, dequeuedView) => {
  const updatedViewCreate = [...state.viewCreate].filter(viewId => viewId !== dequeuedView);
  return updateObject(state, {viewCreate: updatedViewCreate})
};

//viewDelete
const queueViewDelete = (state, queuedView) => {
  let updatedViewCreate = [...state.viewCreate];
  let updatedViewDelete = [...state.viewDelete];
  let updatedActiveView = (queuedView !== state.activeViewId) ? state.activeViewId : null;
  if (updatedViewCreate.includes(queuedView)) {
    // if view to be deleted has yet to be saved to server, remove from viewCreate
    const i = updatedViewCreate.indexOf(queuedView);
    updatedViewCreate.splice(i, 1);
  } else {
    updatedViewDelete.push(queuedView);
  }
  return updateObject(state, {
    viewCreate: updatedViewCreate,
    viewDelete: updatedViewDelete,
    activeViewId: updatedActiveView,
  });
};

export default reducer;