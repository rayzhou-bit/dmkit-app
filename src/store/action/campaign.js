import * as actionTypes from '../actionTypes';

// <-----SIMPLE CAMPAIGN REDUCER CALLS----->
export const loadCampaignColl = (campaignColl) => { return { type: actionTypes.LOAD_CAMPAIGN_COLL, campaignColl: campaignColl }; };
export const unloadCampaignColl = () => { return { type: actionTypes.UNLOAD_CAMPAIGN_COLL }; };
export const addCampaign = (campaignId, campaignData) => { return { type: actionTypes.ADD_CAMPAIGN, campaignId: campaignId, campaignData: campaignData }; };
export const updCampaignTitle = (campaignId, title) => { return { type: actionTypes.UPD_CAMPAIGN_TITLE, campaignId: campaignId, title: title }; };

// <-----SIMPLE CAMPAIGNMANAGE REDUCER CALLS----->
export const updActiveCampaign = (activeCampaign) => { return { type: actionTypes.UPD_ACTIVE_CAMPAIGN, activeCampaign: activeCampaign }; };
export const setCampaignEdit = () => { return { type: actionTypes.SET_CAMPAIGN_EDIT }; };
export const resetCampaignEdit = () => { return { type: actionTypes.RESET_CAMPAIGN_EDIT }; };

// <-----COMPLEX CALLS----->