import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utilityFunctions';

// <-----SIMPLE VIEW REDUCER CALLS----->
export const initViewColl = () => { return { type: actionTypes.INIT_VIEW_COLL }; };
export const loadViewColl = (viewColl) => { return { type: actionTypes.LOAD_VIEW_COLL, viewColl: viewColl }; };
export const unloadViewColl = () => { return { type: actionTypes.UNLOAD_VIEW_COLL }; };
export const resetViewEdit = (viewId) => { return { type: actionTypes.RESET_VIEW_EDIT, viewId: viewId }; };
export const addViewToStore = (viewId, dataPackage) => { return { type: actionTypes.ADD_VIEW, viewId: viewId, dataPackage: dataPackage }; };
export const deleteViewFromStore = (viewId) => { return { type: actionTypes.DELETE_VIEW, viewId: viewId }; };
export const updViewTitle = (viewId, title) => { return { type: actionTypes.UPD_VIEW_TITLE, viewId: viewId, title: title }; };
export const updViewColor = (viewId, color) => { return { type: actionTypes.UPD_VIEW_COLOR, viewId: viewId, color: color }; };

// <-----SIMPLE VIEWMANAGE REDUCER CALLS----->
export const initViewManage = () => { return { type: actionTypes.INIT_CARD_MANAGE }; };
export const loadViewOrder = (viewOrder) => { return { type: actionTypes.LOAD_VIEW_ORDER, viewOrder: viewOrder }; };
export const unloadViewOrder = () => { return { type: actionTypes.UNLOAD_VIEW_ORDER }; };
export const updViewOrder = (viewOrder) => { return { type: actionTypes.UPD_VIEW_ORDER, viewOrder: viewOrder }; };
const addToViewOrder = (viewId) => { return { type: actionTypes.ADD_TO_VIEW_ORDER, viewId: viewId }; };
const deleteFromViewOrder = (viewId) => { return { type: actionTypes.DELETE_FROM_VIEW_ORDER, viewId: viewId }; };
export const updActiveView = (viewId) => { return { type: actionTypes.UPD_ACTIVE_VIEW, viewId: viewId }; };
const queueViewCreate = (viewId) => { return { type: actionTypes.QUEUE_VIEW_CREATE, viewId: viewId}; };
export const dequeueViewCreate = (viewId) => { return { type: actionTypes.DEQUEUE_VIEW_CREATE, viewId: viewId}; };
const clearViewCreate = () => { return { type: actionTypes.CLEAR_VIEW_CREATE }; };
const queueViewDelete = (viewId) => { return { type: actionTypes.QUEUE_VIEW_DELETE, viewId: viewId }; };
export const clearViewDelete = () => { return { type: actionTypes.CLEAR_VIEW_DELETE }; };

// <-----COMPLEX CALLS----->
export const setViewCreate = (viewCreateCnt) => {
  const viewId = "view" + (viewCreateCnt++);
  const viewData = { 
    title: "untitled"
  };
  return dispatch => {
    dispatch(addViewToStore(viewId, viewData));
    dispatch(queueViewCreate(viewId));
    dispatch(addToViewOrder(viewId));
  };
};

export const setViewDelete = (viewId) => {
  return dispatch => {
    dispatch(deleteViewFromStore(viewId));
    dispatch(queueViewDelete(viewId));
    dispatch(deleteFromViewOrder(viewId));
  };
};