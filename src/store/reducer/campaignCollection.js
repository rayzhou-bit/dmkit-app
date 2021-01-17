import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utilityFunctions';

const initialState = {
  // exampleCampaign1: {
  //   title: "campaign title",
  //   viewOrder: ["view0", "view1"],
  //   activeViewId: "view0",
  //   cardCreateCnt: 0,
  //   viewCreateCnt: 0,
  //   edited: false,
  // },
  introCampaign: {
    title: "DM Kit",
    viewOrder: ["view0"],
    activeViewId: "view0",
    cardCreateCnt: 1,
    viewCreateCnt: 1,
    edited: false,
  },
};

const reducer = (state = {}, action) => {
  switch(action.type) {
    // Collection load/unload
    case actionTypes.INIT_CAMPAIGN_COLL: return initialState;
    case actionTypes.LOAD_CAMPAIGN_COLL: return updateObject(state, action.campaignColl);
    case actionTypes.UNLOAD_CAMPAIGN_COLL: return {};
    //IMPLEMENT: CAMPAIGN EDIT!

    // Add/Remove campaign
    case actionTypes.ADD_CAMPAIGN: return updateObject(state, {[action.campaignId]: action.campaignData});

    // Update campaign data
    case actionTypes.UPD_CAMPAIGN_TITLE: return updCampaignTitle(state, action.campaignId, action.title);

    // viewOrder
    case actionTypes.INSERT_VIEW_TO_VIEW_ORDER: return insertViewToViewOrder(state, action.campaignId, action.insertedViewId, action.currViewId);
    case actionTypes.EXTRACT_VIEW_FROM_VIEW_ORDER: return extractViewFromViewOrder(state, action.campaignId, action.extractedViewId);
    case actionTypes.SHIFT_VIEW_IN_VIEW_ORDER: return shiftViewInViewOrder(state, action.campaignId, action.shiftViewInViewOrder, action.posShift);

    // activeViewId
    case actionTypes.UPD_ACTIVE_VIEW_ID: return updActiveViewId(state, action.campaignId, action.viewId);

    // Creation counter

    default: return state;
  }
};

const updCampaignTitle = (state, campaignId, title) => {
  let updatedCampaign = {...state[campaignId]};
  updatedCampaign.title = title;
  updatedCampaign.edited = true;
  return updateObject(state, {[campaignId]: updatedCampaign});
};

const insertViewToViewOrder = (state, campaignId, insertedViewId, activeViewId) => {
  let updatedCampaign = {...state[campaignId]};
  let updatedViewOrder = {...state[campaignId].viewOrder};
  const pos = currViewId ? updatedViewOrder.indexOf(activeViewId) + 1 : 0;
  updatedViewOrder.splice(pos, 0, insertedViewId);
  updatedCampaign.viewOrder = updatedViewOrder;
  updatedCampaign.edited = true;
  return updateObject(state, {[campaignId]: updatedCampaign});
};

const extractViewFromViewOrder = (state, campaignId, extractedViewId) => {
  let updatedCampaign = {...state[campaignId]};
  let updatedViewOrder = {...state[campaignId].viewOrder};
  updatedViewOrder = updatedViewOrder.filter(viewId => viewId !== extractedViewId);
  updatedCampaign.viewOrder = updatedViewOrder;
  updatedCampaign.edited = true;
  return updateObject(state, {[campaignId]: updatedCampaign});
};

const shiftViewInViewOrder = (state, campaignId, shiftedViewId, posShift) => {
  let updatedCampaign = {...state[campaignId]};
  let updatedViewOrder = {...state[campaignId].viewOrder};
  if (pos !== 0) {
    const newPos = updatedViewOrder.indexOf(shiftedViewId) + posShift;
    updatedViewOrder = updatedViewOrder.filter(viewId => viewId !== shiftedViewId);
    updatedViewOrder.splice(newPos, 0, shiftedViewId);
    updatedCampaign.viewOrder = updatedViewOrder;
    updatedCampaign.edited = true;
  }
  return updateObject(state, {[campaignId]: updatedCampaign});
};

const updActiveViewId = (state, campaignId, viewId) => {
  let updatedCampaign = {...state[campaignId]};
  updatedCampaign.activeViewId = viewId;
  updatedCampaign.edited = true;
  return updateObject(state, {[campaignId]: updatedCampaign});
};

export default reducer;