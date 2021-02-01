import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utilityFunctions';

const initialState = {
  user: null,
  email: null,

  activeCampaignId: "introCampaign",
  activeCardId: null,

  cardDelete: [],   // array of cards scheduled for deletion on server
  viewDelete: [],   // array of views scheduled for deletion on server
  cardEdit: [],     // array of edited cards for autosave
  viewEdit: [],     // array of edited views for autosave
  campaignEdit: false,  // flag for any unsaved changes
};

const reducer = (state = {}, action) => {
  switch(action.type) {
    case actionTypes.INIT_DATA_MANAGER: return initialState;

    // Load/Unload
    case actionTypes.LOAD_USER: return updateObject(state, {user: action.user, email: action.email});
    case actionTypes.UNLOAD_USER: return updateObject(state, {user: null, email: null});

    // activeCampaignId
    case actionTypes.UPD_ACTIVE_CAMPAIGN_ID: return updateObject(state, {activeCampaignId: action.activeCampaignId});
    // activeCardId
    case actionTypes.UPD_ACTIVE_CARD_ID: return updateObject(state, {activeCardId: action.cardId});

    // delete queues and booleans
    case actionTypes.ENQUEUE_CARD_DELETE: return enqueueCardDelete(state, action.cardId);
    case actionTypes.CLEAR_CARD_DELETE: return updateObject(state, {cardDelete: []});
    case actionTypes.ENQUEUE_VIEW_DELETE: return enqueueViewDelete(state, action.viewId);
    case actionTypes.CLEAR_VIEW_DELETE: return updateObject(state, {viewDelete: []});

    // edit queues and booleans
    case actionTypes.SET_CAMPAIGN_EDIT: return updateObject(state, {campaignEdit: true});
    case actionTypes.UNSET_CAMPAIGN_EDIT: return updateObject(state, {campaignEdit: false});
    case actionTypes.ENQUEUE_CARD_EDIT: return enqueueCardEdit(state, action.cardId);
    case actionTypes.CLEAR_CARD_EDIT: return updateObject(state, {cardEdit: []});
    case actionTypes.ENQUEUE_VIEW_EDIT: return enqueueViewEdit(state, action.viewId);
    case actionTypes.CLEAR_VIEW_EDIT: return updateObject(state, {viewEdit: []});

    default: return state;
  }
};

const enqueueCardDelete = (state, cardId) => {
  const updatedCardDelete = state.cardDelete
    ? [...state.cardDelete, cardId]
    : [cardId];
  return updateObject(state, {cardDelete: updatedCardDelete});
};

const enqueueViewDelete = (state, viewId) => {
  const updatedViewDelete = state.viewDelete
    ? [...state.viewDelete, viewId]
    : [viewId];
  return updateObject(state, {viewDelete: updatedViewDelete});
};

const enqueueCardEdit = (state, cardId) => {
  const updatedCardEdit = state.cardEdit
    ? [...state.cardEdit, cardId]
    : [cardId];
  return updateObject(state, {cardEdit: updatedCardEdit});
};

const enqueueViewEdit = (state, viewId) => {
  const updatedViewEdit = state.viewEdit
    ? [...state.viewEdit, viewId]
    : [viewId];
  return updateObject(state, {viewEdit: updatedViewEdit});
};

export default reducer;