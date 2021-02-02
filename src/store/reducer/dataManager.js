import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utilityFunctions';

const initialState = {
  user: null,
  email: null,

  activeCampaignId: "introCampaign",
  activeCardId: null,

  cardDelete: [],   // list of cards scheduled for deletion on server
  viewDelete: [],   // list of views scheduled for deletion on server
  cardEdit: [],     // list of edited cards for autosave to server
  viewEdit: [],     // list of edited views for autosave to server
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

    // cardDelete, viewDelete, cardEdit, viewEdit queues
    case actionTypes.ENQUEUE_CARD_DELETE: return enqueueCardDelete(state, action.cardId);
    case actionTypes.CLEAR_CARD_DELETE: return updateObject(state, {cardDelete: []});
    case actionTypes.ENQUEUE_VIEW_DELETE: return enqueueViewDelete(state, action.viewId);
    case actionTypes.CLEAR_VIEW_DELETE: return updateObject(state, {viewDelete: []});
    case actionTypes.ENQUEUE_CARD_EDIT: return enqueueCardEdit(state, action.cardId);
    case actionTypes.CLEAR_CARD_EDIT: return updateObject(state, {cardEdit: []});
    case actionTypes.ENQUEUE_VIEW_EDIT: return enqueueViewEdit(state, action.viewId);
    case actionTypes.CLEAR_VIEW_EDIT: return updateObject(state, {viewEdit: []});
    
    // campaignEdit
    case actionTypes.SET_CAMPAIGN_EDIT: return updateObject(state, {campaignEdit: true});
    case actionTypes.UNSET_CAMPAIGN_EDIT: return updateObject(state, {campaignEdit: false});

    default: return state;
  }
};

const enqueueCardDelete = (state, cardId) => {
  let updatedCardDelete = state.cardDelete ? [...state.cardDelete] : [];
  if (!updatedCardDelete.includes(cardId)) { updatedCardDelete.push(cardId); }
  return updateObject(state, {cardDelete: updatedCardDelete});
};

const enqueueViewDelete = (state, viewId) => {
  let updatedViewDelete = state.viewDelete ? [...state.viewDelete] : [];
  if (!updatedViewDelete.includes(viewId)) { updatedViewDelete.push(viewId); }
  return updateObject(state, {viewDelete: updatedViewDelete});
};

const enqueueCardEdit = (state, cardId) => {
  let updatedCardEdit = state.cardEdit ? [...state.cardEdit] : [];
  if (!updatedCardEdit.includes(cardId)) { updatedCardEdit.push(cardId); }
  return updateObject(state, {cardEdit: updatedCardEdit});
};

const enqueueViewEdit = (state, viewId) => {
  let updatedViewEdit = state.viewEdit ? [...state.viewEdit] : [];
  if (!updatedViewEdit.includes(viewId)) { updatedViewEdit.push(viewId); }
  return updateObject(state, {viewEdit: updatedViewEdit});
};

export default reducer;