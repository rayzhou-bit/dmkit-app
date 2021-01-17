// dataManager reducer
export const LOAD_USER = 'LOAD_USER';
export const UNLOAD_USER = 'UNLOAD_USER';
export const UPD_ACTIVE_CAMPAIGN_ID = 'UPD_ACTIVE_CAMPAIGN_ID';
export const SET_CAMPAIGN_EDIT = 'SET_CAMPAIGN_EDIT';
export const UNSET_CAMPAIGN_EDIT = 'UNSET_CAMPAIGN_EDIT';

// campaign reducer
export const INIT_CAMPAIGN_COLL = 'INIT_CAMPAIGN_COLL';
export const LOAD_CAMPAIGN_COLL = 'LOAD_CAMPAIGN_COLL';
export const UNLOAD_CAMPAIGN_COLL = 'UNLOAD_CAMPAIGN_COLL';
export const ADD_CAMPAIGN = 'ADD_CAMPAIGN';
export const UPD_CAMPAIGN_TITLE = 'UPD_CAMPAIGN_TITLE';
export const INSERT_VIEW_TO_VIEW_ORDER = 'INSERT_VIEW_TO_VIEW_ORDER';
export const EXTRACT_VIEW_FROM_VIEW_ORDER = 'EXTRACT_VIEW_FROM_VIEW_ORDER';
export const SHIFT_VIEW_IN_VIEW_ORDER = 'SHIFT_VIEW_IN_VIEW_ORDER';
export const UPD_ACTIVE_VIEW_ID = 'UPD_ACTIVE_VIEW_ID';

// card reducer
export const INIT_CARD_COLL = 'INIT_CARD_COLL';
export const LOAD_CARD_COLL = 'LOAD_CARD_COLL';
export const UNLOAD_CARD_COLL = 'UNLOAD_CARD_COLL';
export const UNSET_CARD_EDIT = 'UNSET_CARD_EDIT';
export const ADD_CARD = 'ADD_CARD';
export const REMOVE_CARD = 'REMOVE_CARD';
export const CONNECT_CARD_TO_VIEW = 'CONNECT_CARD_TO_VIEW';
export const DISCONNECT_CARD_FROM_VIEW = 'DISCONNECT_CARD_FROM_VIEW';
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
export const UNSET_VIEW_EDIT = 'UNSET_VIEW_EDIT';
export const ADD_VIEW = 'ADD_VIEW';
export const REMOVE_VIEW = 'REMOVE_VIEW';
export const UPD_VIEW_TITLE = 'UPD_VIEW_TITLE';
export const UPD_VIEW_COLOR = 'UPD_VIEW_COLOR';

// cardManager reducer
export const INIT_CARD_MANAGE = 'INIT_CARD_MANAGE';
// cardManager reducer: activeCardId
export const UPD_ACTIVE_CARD = 'UPD_ACTIVE_CARD';
// cardManager reducer: cardCreate
export const QUEUE_CARD_CREATE = 'QUEUE_CARD_CREATE';
export const DEQUEUE_CARD_CREATE = 'DEQUEUE_CARD_CREATE';
export const CLEAR_CARD_CREATE = 'CLEAR_CARD_CREATE';
// cardmanage reducer: cardDelete
export const QUEUE_CARD_DELETE = 'QUEUE_CARD_DELETE';
export const CLEAR_CARD_DELETE = 'CLEAR_CARD_DELETE';

// viewManager reducer
// viewManager reducer: viewOrder
// viewManager reducer: activeViewId
// viewManager reducer: viewCreate
export const QUEUE_VIEW_CREATE = 'QUEUE_VIEW_CREATE';
export const DEQUEUE_VIEW_CREATE = 'DEQUEUE_VIEW_CREATE';
export const CLEAR_VIEW_CREATE = 'CLEAR_VIEW_CREATE';
// viewManager reducer: viewDelete
export const QUEUE_VIEW_DELETE = 'QUEUE_VIEW_DELETE';
export const CLEAR_VIEW_DELETE = 'CLEAR_VIEW_DELETE';