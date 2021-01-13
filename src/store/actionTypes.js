// user reducer
export const LOAD_USER = 'LOAD_USER';
export const UNLOAD_USER = 'UNLOAD_USER';

// campaign reducer
export const LOAD_CAMPAIGN_COLL = 'LOAD_CAMPAIGN_COLL';
export const UNLOAD_CAMPAIGN_COLL = 'UNLOAD_CAMPAIGN_COLL';
export const ADD_CAMPAIGN = 'ADD_CAMPAIGN';
export const UPD_CAMPAIGN_TITLE = 'UPD_CAMPAIGN_TITLE';

// card reducer
export const INIT_CARD_COLL = 'INIT_CARD_COLL';
export const LOAD_CARD_COLL = 'LOAD_CARD_COLL';
export const UNLOAD_CARD_COLL = 'UNLOAD_CARD_COLL';
export const RESET_CARD_EDIT = 'RESET_CARD_EDIT';
export const ADD_CARD = 'ADD_CARD';
export const DELETE_CARD = 'DELETE_CARD';
export const CONNECT_CARD_TO_VIEW = 'CONNECT_CARD_TO_VIEW';
export const REMOVE_CARD_FROM_VIEW = 'REMOVE_CARD_FROM_VIEW';
export const UPD_CARD_POS = 'UPD_CARD_POS';
export const UPD_CARD_SIZE = 'UPD_CARD_SIZE';
export const UPD_CARD_COLOR = 'UPD_CARD_COLOR';
export const UPD_CARD_COLOR_FOR_ALL_VIEWS = 'UPD_CARD_COLOR_FOR_ALL_VIEWS';
export const UPD_CARD_TYPE = 'UPD_CARD_TYPE';
export const UPD_CARD_TITLE = 'UPD_CARD_TITLE';
export const UPD_CARD_TEXT = 'UPD_CARD_TEXT';

// view reducer
export const INIT_VIEW_COLL = 'INIT_VIEW_COLL';
export const LOAD_VIEW_COLL = 'LOAD_VIEW_COLL';
export const UNLOAD_VIEW_COLL = 'UNLOAD_VIEW_COLL';
export const RESET_VIEW_EDIT = 'RESET_VIEW_EDIT';
export const ADD_VIEW = 'ADD_VIEW';
export const DELETE_VIEW = 'DELETE_VIEW';
export const UPD_VIEW_TITLE = 'UPD_VIEW_TITLE';
export const UPD_VIEW_COLOR = 'UPD_VIEW_COLOR';

// campaignManage reducer: activeCampaign
export const UPD_ACTIVE_CAMPAIGN = 'UPD_ACTIVE_CAMPAIGN';
export const SET_CAMPAIGN_EDIT = 'SET_CAMPAIGN_EDIT';
export const RESET_CAMPAIGN_EDIT = 'RESET_CAMPAIGN_EDIT';

// cardManage reducer
export const INIT_CARD_MANAGE = 'INIT_CARD_MANAGE';
// cardManage reducer: activeCard
export const UPD_ACTIVE_CARD = 'UPD_ACTIVE_CARD';
// cardManage reducer: cardCreate
export const QUEUE_CARD_CREATE = 'QUEUE_CARD_CREATE';
export const DEQUEUE_CARD_CREATE = 'DEQUEUE_CARD_CREATE';
export const CLEAR_CARD_CREATE = 'CLEAR_CARD_CREATE';
// cardmanage reducer: cardDelete
export const QUEUE_CARD_DELETE = 'QUEUE_CARD_DELETE';
export const CLEAR_CARD_DELETE = 'CLEAR_CARD_DELETE';

// viewManage reducer
export const INIT_VIEW_MANAGE = 'INIT_VIEW_MANAGE';
// viewManage reducer: viewOrder
export const LOAD_VIEW_ORDER = 'LOAD_VIEW_ORDER';
export const UNLOAD_VIEW_ORDER = 'UNLOAD_VIEW_ORDER';
export const UPD_VIEW_ORDER = 'UPD_VIEW_ORDER';
export const ADD_TO_VIEW_ORDER = 'ADD_TO_VIEW_ORDER';
export const DELETE_FROM_VIEW_ORDER = 'DELETE_FROM_VIEW_ORDER';
// viewManage reducer: activeView
export const UPD_ACTIVE_VIEW = 'UPD_ACTIVE_VIEW';
// viewManage reducer: viewCreate
export const QUEUE_VIEW_CREATE = 'QUEUE_VIEW_CREATE';
export const DEQUEUE_VIEW_CREATE = 'DEQUEUE_VIEW_CREATE';
export const CLEAR_VIEW_CREATE = 'CLEAR_VIEW_CREATE';
// viewManage reducer: viewDelete
export const QUEUE_VIEW_DELETE = 'QUEUE_VIEW_DELETE';
export const CLEAR_VIEW_DELETE = 'CLEAR_VIEW_DELETE';