import * as actionTypes from '../actionTypes';

// <-----campaignCollection REDUCER CALLS----->
export const initCampaignColl = () => { return { type: actionTypes.INIT_CAMPAIGN_COLL }; };
export const loadCampaignColl = (campaignColl) => { return { type: actionTypes.LOAD_CAMPAIGN_COLL, campaignColl: campaignColl }; };
export const unloadCampaignColl = () => { return { type: actionTypes.UNLOAD_CAMPAIGN_COLL }; };
export const addCampaign = (campaignId, campaignData) => { return { type: actionTypes.ADD_CAMPAIGN, campaignId: campaignId, campaignData: campaignData }; };
export const removeCampaign = (campaignId) => { return { type: actionTypes.REMOVE_CAMPAIGN, campaignId: campaignId }; };
export const updCampaignTitle = (campaignId, title) => { return { type: actionTypes.UPD_CAMPAIGN_TITLE, campaignId: campaignId, title: title }; };

// <-----dataManager REDUCER CALLS----->
export const updActiveCampaignId = (activeCampaignId) => { return { type: actionTypes.UPD_ACTIVE_CAMPAIGN_ID, activeCampaignId: activeCampaignId }; };

// <-----COMPLEX CALLS----->