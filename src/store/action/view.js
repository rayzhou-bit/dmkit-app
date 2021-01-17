import * as actionTypes from '../actionTypes';

// <-----viewCollection REDUCER CALLS----->
export const initViewColl = () => { return { type: actionTypes.INIT_VIEW_COLL }; };
export const loadViewColl = (viewColl) => { return { type: actionTypes.LOAD_VIEW_COLL, viewColl: viewColl }; };
export const unloadViewColl = () => { return { type: actionTypes.UNLOAD_VIEW_COLL }; };
export const unsetViewEdit = (viewId) => { return { type: actionTypes.UNSET_VIEW_EDIT, viewId: viewId }; };
export const addView = (viewId, dataPackage) => { return { type: actionTypes.ADD_VIEW, viewId: viewId, dataPackage: dataPackage }; };
export const removeView = (viewId) => { return { type: actionTypes.REMOVE_VIEW, viewId: viewId }; };
export const updViewTitle = (viewId, title) => { return { type: actionTypes.UPD_VIEW_TITLE, viewId: viewId, title: title }; };
export const updViewColor = (viewId, color) => { return { type: actionTypes.UPD_VIEW_COLOR, viewId: viewId, color: color }; };

// <-----campaignCollection REDUCER CALLS----->
const insertViewToViewOrder = (campaignId, insertedViewId, currViewId) => { return { type: actionTypes.INSERT_VIEW_TO_VIEW_ORDER, campaignId: campaignId, insertedViewId: insertedViewId, currViewId: currViewId }; };
const extractViewFromViewOrder = (campaignId, extractedViewId) => { return { type: actionTypes.EXTRACT_VIEW_FROM_VIEW_ORDER, campaignId: campaignId, extractedViewId: extractedViewId }; };
export const shiftViewInViewOrder = (campaignId, shiftedViewId, posShift) => { return { type: actionTypes.SHIFT_VIEW_IN_VIEW_ORDER, campaignId: campaignId, shiftedViewId: shiftedViewId, posShift: posShift }; };
export const updActiveViewId = (campaignId, viewId) => { return { type: actionTypes.UPD_ACTIVE_VIEW_ID, campaignId: campaignId, viewId: viewId }; };

// <-----dataManage REDUCER CALLS----->
const queueViewCreate = (viewId) => { return { type: actionTypes.QUEUE_VIEW_CREATE, viewId: viewId}; };
export const dequeueViewCreate = (viewId) => { return { type: actionTypes.DEQUEUE_VIEW_CREATE, viewId: viewId}; };
export const clearViewCreate = () => { return { type: actionTypes.CLEAR_VIEW_CREATE }; };
const queueViewDelete = (viewId) => { return { type: actionTypes.QUEUE_VIEW_DELETE, viewId: viewId }; };
export const clearViewDelete = () => { return { type: actionTypes.CLEAR_VIEW_DELETE }; };

// <-----COMPLEX CALLS----->
export const createView = (campaignId, activeViewId, viewCreateCnt) => {
  const viewId = "view" + viewCreateCnt;
  const viewData = { title: "untitled", color: "gray" };
  return dispatch => {
    dispatch(addView(viewId, viewData));
    dispatch(insertViewToViewOrder(campaignId, viewId, activeViewId));
    dispatch(incrementViewCreateCnt(campaignId));
  };
};

export const destroyView = (campaignId, viewId) => {
  return dispatch => {
    dispatch(removeView(viewId));
    dispatch(extractViewFromViewOrder(campaignId, viewId));
    dispatch(queueViewDelete(viewId));
  };
};