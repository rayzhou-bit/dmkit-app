import * as actionTypes from '../actionTypes';

// <-----viewCollection REDUCER CALLS----->
export const initViewColl = () => { return { type: actionTypes.INIT_VIEW_COLL }; };
export const loadViewColl = (viewColl) => { return { type: actionTypes.LOAD_VIEW_COLL, viewColl: viewColl }; };
export const unloadViewColl = () => { return { type: actionTypes.UNLOAD_VIEW_COLL }; };
const addView = (viewId, viewData) => dispatch => { dispatch({ type: actionTypes.ADD_VIEW, viewId: viewId, viewData: viewData }); dispatch(updEditSaveFlag(viewId)); };
const removeView = (viewId) => dispatch => { dispatch({ type: actionTypes.REMOVE_VIEW, viewId: viewId }); dispatch(updDeleteSaveflag(viewId)); };
export const updViewTitle = (viewId, title) => dispatch => { dispatch({ type: actionTypes.UPD_VIEW_TITLE, viewId: viewId, title: title }); dispatch(updEditSaveFlag(viewId)); };
export const updViewColor = (viewId, color) => dispatch => { dispatch({ type: actionTypes.UPD_VIEW_COLOR, viewId: viewId, color: color }); dispatch(updEditSaveFlag(viewId)); };

// <-----campaignCollection REDUCER CALLS----->
const insertViewToViewOrder = (campaignId, insertedViewId, currViewId) => { return { type: actionTypes.INSERT_VIEW_TO_VIEW_ORDER, campaignId: campaignId, insertedViewId: insertedViewId, currViewId: currViewId }; };
const extractViewFromViewOrder = (campaignId, extractedViewId) => { return { type: actionTypes.EXTRACT_VIEW_FROM_VIEW_ORDER, campaignId: campaignId, extractedViewId: extractedViewId }; };
export const shiftViewInViewOrder = (campaignId, shiftedViewId, posShift) => dispatch => { dispatch({ type: actionTypes.SHIFT_VIEW_IN_VIEW_ORDER, campaignId: campaignId, shiftedViewId: shiftedViewId, posShift: posShift }); dispatch(setCampaignEdit()); };
export const updActiveViewId = (campaignId, viewId) => dispatch => { dispatch({ type: actionTypes.UPD_ACTIVE_VIEW_ID, campaignId: campaignId, viewId: viewId }); dispatch(setCampaignEdit()); };
const incrementViewCreateCnt = (campaignId) => { return { type: actionTypes.INCREMENT_VIEW_CREATE_CNT, campaignId: campaignId }; };

// <-----dataManager REDUCER CALLS----->
const updEditSaveFlag = (viewId) => dispatch => { dispatch(enqueueViewEdit(viewId)); dispatch(setCampaignEdit()); };
const updDeleteSaveflag = (viewId) => dispatch => { dispatch(enqueueViewDelete(viewId)); dispatch(setCampaignEdit()); };
const setCampaignEdit = () => { return { type: actionTypes.SET_CAMPAIGN_EDIT }; };
const enqueueViewDelete = (viewId) => { return { type: actionTypes.ENQUEUE_VIEW_DELETE, viewId: viewId }; };
export const clearViewDelete = () => { return { type: actionTypes.CLEAR_VIEW_DELETE }; };
const enqueueViewEdit = (viewId) => { return { type: actionTypes.ENQUEUE_VIEW_EDIT, viewId: viewId }; };
export const clearViewEdit = () => { return { type: actionTypes.CLEAR_VIEW_EDIT }; };

// <-----COMPLEX CALLS----->
export const createView = (campaignId, activeViewId, viewCreateCnt) => {
  const viewId = "view" + viewCreateCnt;
  const viewData = { title: viewId, color: "gray" };
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
  };
};

export const copyView = (cardColl, viewId, viewCreateCnt) => {
  // TODO: search through cardColl to create new base
};