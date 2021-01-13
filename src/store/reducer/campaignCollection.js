import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utilityFunctions';

const initialState = {
  // exampleCampaign1: {
  //   title: "campaign title",
  // },
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.LOAD_CAMPAIGN_COLL: return updateObject(state, action.campaignColl);
    case actionTypes.UNLOAD_CAMPAIGN_COLL: return {};

    case actionTypes.ADD_CAMPAIGN: return updateObject(state, {[action.campaignId]: action.campaignData});
    case actionTypes.UPD_CAMPAIGN_TITLE: return updCampaignTitle(state, action.campaignId, action.title);

    default: return state;
  }
};

const updCampaignTitle = (state, campaignId, title) => {
  let updatedCampaign = {...state[campaignId]};
  updatedCampaign.title = title;
  updatedCampaign.edited = true;
  return updateObject(state, {[campaignId]: updatedCampaign});
};

export default reducer;