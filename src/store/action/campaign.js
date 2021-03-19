import * as actionTypes from '../actionTypes';

// actions for sessionManager reducer
export const resetSessionManager = () => { return { type: actionTypes.RESET_SESSION_MANAGER }; };
export const loadCampaignList = (campaignList) => { return { type: actionTypes.LOAD_CAMPAIGN_LIST, campaignList: campaignList }; };
export const addCampaignToList = (campaignId, campaignTitle) => { return { type: actionTypes.ADD_CAMPAIGN_TO_LIST, campaignId: campaignId, campaignTitle: campaignTitle }; };
export const removeCampaignFromList = (campaignId) => { return { type: actionTypes.REMOVE_CAMPAIGN_FROM_LIST, campaignId: campaignId }; };
export const updActiveCampaignId = (activeCampaignId) => { return { type: actionTypes.UPD_ACTIVE_CAMPAIGN_ID, activeCampaignId: activeCampaignId }; };

export const setStatus = (status) => { return { type: actionTypes.SET_STATUS, status: status }; };
export const setCampaignEdit = (edit) => { return { type: actionTypes.SET_CAMPAIGN_EDIT, edit: edit }; };
export const setIntroCampaignEdit = (edit) => { return { type: actionTypes.SET_INTRO_CAMPAIGN_EDIT, edit: edit }; };

// actions for campaignData reducer
export const loadCampaignData = (campaignData) => { return { type: actionTypes.LOAD_CAMPAIGN_DATA, campaignData: campaignData }; };
export const unloadCampaignData = () => { return { type: actionTypes.UNLOAD_CAMPAIGN_DATA }; };
export const loadIntroCampaign = () => { return { type: actionTypes.LOAD_INTRO_CAMPAIGN }; };
export const updCampaignTitle = (title) => { return { type: actionTypes.UPD_CAMPAIGN_TITLE, title: title }; };



// TODO re evaluate following
export const setErrorEmailSignIn = (errorCode) => { return { type: actionTypes.SET_ERROR_EMAIL_SIGN_IN, errorCode: errorCode }; };
export const unsetErrorEmailSignIn = () => { return { type: actionTypes.UNSET_ERROR_EMAIL_SIGN_IN }; };
export const setErrorEmailSignUp = (errorCode) => { return { type: actionTypes.SET_ERROR_EMAIL_SIGN_UP, errorCode: errorCode }; };
export const unsetErrorEmailSignUp = () => { return { type: actionTypes.UNSET_ERROR_EMAIL_SIGN_UP }; };
export const setErrorGoogleSignUp = (errorCode) => { return { type: actionTypes.SET_ERROR_GOOGLE_SIGN_IN, errorCode: errorCode }; };
export const unsetErrorGoogleSignUp = () => { return { type: actionTypes.UNSET_ERROR_GOOGLE_SIGN_IN }; };
export const setErrorFacebookSignUp = (errorCode) => { return { type: actionTypes.SET_ERROR_FACEBOOK_SIGN_IN, errorCode: errorCode }; };
export const unsetErrorFacebookSignUp = () => { return { type: actionTypes.UNSET_ERROR_FACEBOOK_SIGN_IN }; };

