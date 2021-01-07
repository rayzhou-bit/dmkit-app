import * as actionTypes from '../actionTypes';
import * as actions from '../actionIndex';
import { updateObject } from '../../shared/utilityFunctions';

// <-----SIMPLE CAMPAIGN REDUCER CALLS----->
export const loadCampaignColl = (campaignColl) => { return { type: actionTypes.LOAD_CAMPAIGN_COLL, campaignColl: campaignColl }; };
export const unloadCampaignColl = () => { return { type: actionTypes.UNLOAD_CAMPAIGN_COLL }; };
export const setCampaignEdit = (campaignId) => { return { type: actionTypes.SET_CAMPAIGN_EDIT, campaignId: campaignId }; };
export const resetCampaignEdit = (campaignId) => { return { type: actionTypes.RESET_CAMPAIGN_EDIT, campaignId: campaignId }; };
export const addCampaign = (campaignId, campaignData) => { return { type: actionTypes.ADD_CAMPAIGN, campaignId: campaignId, campaignData: campaignData }; };
export const updCampaignTitle = (campaignId, title) => { return { type: actionTypes.UPD_CAMPAIGN_TITLE, campaignId: campaignId, title: title }; };

// <-----SIMPLE CAMPAIGNMANAGE REDUCER CALLS----->
export const updActiveCampaign = (campaign) => { return { type: actionTypes.UPD_ACTIVE_CAMPAIGN, campaign: campaign }; };

// <-----COMPLEX CALLS----->