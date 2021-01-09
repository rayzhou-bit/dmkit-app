import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utilityFunctions';

const initialState = {
  // exampleCampaign1: {
  //   title: "campaign title",
  //   edited: boolean, ???
  // },
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.LOAD_CAMPAIGN_COLL: return updateObject(state, action.campaignColl);
    case actionTypes.UNLOAD_CAMPAIGN_COLL: return {};
    case actionTypes.SET_CAMPAIGN_EDIT: return setCampaignEdit(state, action.campaignId);
    case actionTypes.RESET_CAMPAIGN_EDIT: return resetCampaignEdit(state, action.campaignId);

    case actionTypes.ADD_CAMPAIGN: return updateObject(state, {[action.campaignId]: action.campaignData});
    case actionTypes.UPD_CAMPAIGN_TITLE: return updCampaignTitle(state, action.campaignId, action.title);

    default: return state;
  }
};

const setCampaignEdit = (state, campaignId) => {
  const updatedCampaign = updateObject(state[campaignId], {edited: true});
  return updateObject(state, updatedCampaign);
};

const resetCampaignEdit = (state, campaignId) => {
  const updatedCampaign = updateObject(state[campaignId], {edited: false});
  return updateObject(state, updatedCampaign);
};

const updCampaignTitle = (state, campaignId, title) => {
  let updatedCampaign = {...state[campaignId]};
  updatedCampaign.title = title;
  updatedCampaign.edited = true;
  return updateObject(state, {[campaignId]: updatedCampaign});
};

export default reducer;