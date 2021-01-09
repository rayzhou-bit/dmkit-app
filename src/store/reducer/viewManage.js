import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utilityFunctions';

const initialState = {
  viewOrder: ["view1"],            // array that tracks the position of the views
  editedViewOrder: false,

  activeView: "view1",

  viewCreate: ["view1"],      // array for new views that do not have firebase ids
  createCount: 1,

  viewDelete: [],           // array for views to delete from firebase
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
    // viewOrder
    case actionTypes.LOAD_VIEW_ORDER: return updateObject(state, {viewOrder: action.viewOrder});
    case actionTypes.UNLOAD_VIEW_ORDER: return updateObject(state, {viewOrder: []});
    case actionTypes.UPD_VIEW_ORDER: return updateObject(state, {viewOrder: action.viewOrder});
    case actionTypes.ADD_TO_VIEW_ORDER: return addToViewOrder(state, action.viewId);
    case actionTypes.DELETE_FROM_VIEW_ORDER: return deleteFromViewOrder(state, action.viewId);

    // activeView
    case actionTypes.UPD_ACTIVE_VIEW: return updateObject(state, {activeView: action.viewId});

    // viewCreate
    case actionTypes.QUEUE_VIEW_CREATE: return queueViewCreate(state, action.viewId);
    case actionTypes.DEQUEUE_VIEW_CREATE: return dequeueViewCreate(state, action.viewId);
    case actionTypes.CLEAR_VIEW_CREATE: return updateObject(state, {viewCreate: [], createCount: 0});

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
  return updateObject(state, {viewOrder: updatedViewOrder, editedViewOrder: true});
};
const deleteFromViewOrder = (state, deletedView) => {
  const updatedViewOrder = [...state.viewOrder].filter(view => view !== deletedView);
  return updateObject(state, {viewOrder: updatedViewOrder, activeView: updatedViewOrder[0], editedViewOrder: true});
};

//viewCreate
const queueViewCreate = (state, queuedView) => {
  let updatedViewCreate = [...state.viewCreate];
  updatedViewCreate.push(queuedView);
  return updateObject(state, {
    viewCreate: updatedViewCreate, 
    createCount: state.createCount++,
    activeView: queuedView,
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
  let updatedActiveView = (queuedView !== state.activeView) ? state.activeView : null;
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
    activeView: updatedActiveView,
  });
};

export default reducer;