/*------------------*/
// userData reducer //
export const LOAD_USER = 'LOAD_USER';
export const UNLOAD_USER = 'UNLOAD_USER';
export const UPD_USER_DISPLAYNAME = 'UPD_USER_DISPLAYNAME';

/*------------------------*/
// sessionManager reducer //
export const RESET_SESSION_MANAGER = 'RESET_SESSION_MANAGER';
// campaign related actions
export const LOAD_CAMPAIGN_LIST = 'LOAD_CAMPAIGN_LIST';
export const ADD_CAMPAIGN_TO_LIST = 'ADD_CAMPAIGN_TO_LIST';
export const REMOVE_CAMPAIGN_FROM_LIST = 'REMOVE_CAMPAIGN_FROM_LIST';
export const UPD_ACTIVE_CAMPAIGN_ID = 'UPD_ACTIVE_CAMPAIGN_ID';
export const SET_CAMPAIGN_EDIT = 'SET_CAMPAIGN_EDIT';
export const SET_STATUS = 'SET_STATUS';
// errors
export const SET_ERROR_EMAIL_SIGN_IN = 'SET_ERROR_EMAIL_SIGN_IN';
export const UNSET_ERROR_EMAIL_SIGN_IN = 'UNSET_ERROR_EMAIL_SIGN_IN';
export const SET_ERROR_EMAIL_SIGN_UP = 'SET_ERROR_EMAIL_SIGN_UP';
export const UNSET_ERROR_EMAIL_SIGN_UP = 'UNSET_ERROR_EMAIL_SIGN_UP';
export const SET_ERROR_GOOGLE_SIGN_IN = 'SET_ERROR_GOOGLE_SIGN_IN';
export const UNSET_ERROR_GOOGLE_SIGN_IN = 'UNSET_ERROR_GOOGLE_SIGN_IN';
export const SET_ERROR_FACEBOOK_SIGN_IN = 'SET_ERROR_FACEBOOK_SIGN_IN';
export const UNSET_ERROR_FACEBOOK_SIGN_IN = 'UNSET_ERROR_FACEBOOK_SIGN_IN';

/*----------------------*/
// campaignData reducer //
export const LOAD_INTRO_CAMPAIGN = 'LOAD_INTRO_CAMPAIGN';
export const LOAD_CAMPAIGN_DATA = 'LOAD_CAMPAIGN_DATA';
export const UNLOAD_CAMPAIGN_DATA = 'UNLOAD_CAMPAIGN_DATA';
// activeCampaign actions
export const UPD_CAMPAIGN_TITLE = 'UPD_CAMPAIGN_TITLE';
export const UPD_ACTIVE_CARD_ID = 'UPD_ACTIVE_CARD_ID';
export const UPD_ACTIVE_VIEW_ID = 'UPD_ACTIVE_VIEW_ID';
export const SHIFT_VIEW_IN_VIEW_ORDER = 'SHIFT_VIEW_IN_VIEW_ORDER';
// card actions
export const CREATE_CARD = 'CREATE_CARD';
export const COPY_CARD = 'COPY_CARD';
export const DESTROY_CARD = 'DESTROY_CARD';
export const LINK_CARD_TO_VIEW = 'LINK_CARD_TO_VIEW';
export const UNLINK_CARD_FROM_VIEW = 'UNLINK_CARD_FROM_VIEW';
export const UPD_CARD_POS = 'UPD_CARD_POS';
export const UPD_CARD_SIZE = 'UPD_CARD_SIZE';
export const UPD_CARD_COLOR = 'UPD_CARD_COLOR';
export const UPD_CARD_COLOR_FOR_VIEW = 'UPD_CARD_COLOR_FOR_VIEW';
export const UPD_CARD_FORM = 'UPD_CARD_FORM';
export const UPD_CARD_TITLE = 'UPD_CARD_TITLE';
export const UPD_CARD_TEXT = 'UPD_CARD_TEXT';
// view actions
export const CREATE_VIEW = 'CREATE_VIEW';
export const DESTROY_VIEW = 'DESTROY_VIEW';
export const UPD_VIEW_TITLE = 'UPD_VIEW_TITLE';
export const UPD_VIEW_COLOR = 'UPD_VIEW_COLOR';