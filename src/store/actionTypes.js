// dataManager reducer
export const INIT_DATA_MANAGER = 'INIT_DATA_MANAGER';
export const LOAD_USER = 'LOAD_USER';
export const UNLOAD_USER = 'UNLOAD_USER';
export const UPD_ACTIVE_CAMPAIGN_ID = 'UPD_ACTIVE_CAMPAIGN_ID';
export const UPD_ACTIVE_CARD_ID = 'UPD_ACTIVE_CARD_ID';
export const ENQUEUE_CARD_DELETE = 'ENQUEUE_CARD_DELETE';
export const CLEAR_CARD_DELETE = 'CLEAR_CARD_DELETE';
export const ENQUEUE_VIEW_DELETE = 'ENQUEUE_VIEW_DELETE';
export const CLEAR_VIEW_DELETE = 'CLEAR_VIEW_DELETE';
export const ENQUEUE_CARD_EDIT = 'ENQUEUE_CARD_EDIT';
export const CLEAR_CARD_EDIT = 'CLEAR_CARD_EDIT';
export const ENQUEUE_VIEW_EDIT = 'ENQUEUE_VIEW_EDIT';
export const CLEAR_VIEW_EDIT = 'CLEAR_VIEW_EDIT';
export const SET_CAMPAIGN_EDIT = 'SET_CAMPAIGN_EDIT';
export const UNSET_CAMPAIGN_EDIT = 'UNSET_CAMPAIGN_EDIT';
export const SET_ERROR_EMAIL_SIGN_IN = 'SET_ERROR_EMAIL_SIGN_IN';
export const UNSET_ERROR_EMAIL_SIGN_IN = 'UNSET_ERROR_EMAIL_SIGN_IN';
export const SET_ERROR_EMAIL_SIGN_UP = 'SET_ERROR_EMAIL_SIGN_UP';
export const UNSET_ERROR_EMAIL_SIGN_UP = 'UNSET_ERROR_EMAIL_SIGN_UP';

// campaign reducer
export const INIT_CAMPAIGN_COLL = 'INIT_CAMPAIGN_COLL';
export const LOAD_CAMPAIGN_COLL = 'LOAD_CAMPAIGN_COLL';
export const UNLOAD_CAMPAIGN_COLL = 'UNLOAD_CAMPAIGN_COLL';
export const ADD_CAMPAIGN = 'ADD_CAMPAIGN';
export const REMOVE_CAMPAIGN = 'REMOVE_CAMPAIGN';
export const UPD_CAMPAIGN_TITLE = 'UPD_CAMPAIGN_TITLE';
export const INSERT_VIEW_TO_VIEW_ORDER = 'INSERT_VIEW_TO_VIEW_ORDER';
export const EXTRACT_VIEW_FROM_VIEW_ORDER = 'EXTRACT_VIEW_FROM_VIEW_ORDER';
export const SHIFT_VIEW_IN_VIEW_ORDER = 'SHIFT_VIEW_IN_VIEW_ORDER';
export const UPD_ACTIVE_VIEW_ID = 'UPD_ACTIVE_VIEW_ID';
export const INCREMENT_CARD_CREATE_CNT = 'INCREMENT_CARD_CREATE_CNT';
export const INCREMENT_VIEW_CREATE_CNT = 'INCREMENT_VIEW_CREATE_CNT';

// card reducer
export const INIT_CARD_COLL = 'INIT_CARD_COLL';
export const LOAD_CARD_COLL = 'LOAD_CARD_COLL';
export const UNLOAD_CARD_COLL = 'UNLOAD_CARD_COLL';
export const ADD_CARD = 'ADD_CARD';
export const REMOVE_CARD = 'REMOVE_CARD';
export const LINK_CARD_TO_VIEW = 'LINK_CARD_TO_VIEW';
export const UNLINK_CARD_FROM_VIEW = 'UNLINK_CARD_FROM_VIEW';
export const UPD_CARD_POS = 'UPD_CARD_POS';
export const UPD_CARD_SIZE = 'UPD_CARD_SIZE';
export const UPD_CARD_COLOR = 'UPD_CARD_COLOR';
export const UPD_CARD_TYPE = 'UPD_CARD_TYPE';
export const UPD_CARD_TITLE = 'UPD_CARD_TITLE';
export const UPD_CARD_TEXT = 'UPD_CARD_TEXT';

// view reducer
export const INIT_VIEW_COLL = 'INIT_VIEW_COLL';
export const LOAD_VIEW_COLL = 'LOAD_VIEW_COLL';
export const UNLOAD_VIEW_COLL = 'UNLOAD_VIEW_COLL';
export const ADD_VIEW = 'ADD_VIEW';
export const REMOVE_VIEW = 'REMOVE_VIEW';
export const UPD_VIEW_TITLE = 'UPD_VIEW_TITLE';
export const UPD_VIEW_COLOR = 'UPD_VIEW_COLOR';