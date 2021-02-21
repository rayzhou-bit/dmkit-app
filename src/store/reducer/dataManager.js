import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utilityFunctions';

const initialState = {
  userId: null,
  displayName: null,
  email: null,
  emailVerified: null,

  activeCampaignId: "introCampaign",
  activeCardId: null,

  cardDelete: [],   // list of cards scheduled for deletion on server
  viewDelete: [],   // list of views scheduled for deletion on server
  cardEdit: [],     // list of edited cards for autosave to server
  viewEdit: [],     // list of edited views for autosave to server
  campaignEdit: false,  // flag for any unsaved changes

  errorEmailSignIn: "",
  errorEmailSignUp: "",
};

const reducer = (state = {}, action) => {
  switch(action.type) {
    case actionTypes.INIT_DATA_MANAGER: return initialState;

    // Load/Unload
    case actionTypes.LOAD_USER: return updateObject(state, {userId: action.userId, email: action.email});
    case actionTypes.UNLOAD_USER: return updateObject(state, {userId: null, displayName: null, email: null, emailVerified: null});

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

    // errors
    case actionTypes.SET_ERROR_EMAIL_SIGN_IN: return setErrorEmailSignIn(state, action.errorCode);
    case actionTypes.UNSET_ERROR_EMAIL_SIGN_IN: return updateObject(state, {errorEmailSignIn: ""});
    case actionTypes.SET_ERROR_EMAIL_SIGN_UP: return setErrorEmailSignUp(state, action.errorCode);
    case actionTypes.UNSET_ERROR_EMAIL_SIGN_UP: return updateObject(state, {errorEmailSignUp: ""});

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

const setErrorEmailSignIn = (state, errorCode) => {
  let error = null;
  switch (errorCode) {
    case ('auth/invalid-email'):
      error = "invalid email"; break;
    case ('auth/user-disabled'):
      error = "user disabled"; break;
    case ('auth/user-not-found'):
      error = "user not found"; break;
    case ('auth/wrong-password'):
      error = "invalid password"; break;
    default:
      error = "sign in unsuccessful"; break;
  }
  return updateObject(state, {errorEmailSignIn: error});
};

const setErrorEmailSignUp = (state, errorCode) => {
  let error = null;
  switch (errorCode) {
    case ('auth/email-already-in-use'):
      error = "email already in use"; break;
    case ('auth/invalid-email'):
      error = "invalid email"; break;
    case ('auth/operation-not-allowed'):
      error = "email sign up currently not in service"; break;
    case ('auth/weak-password'):
      error = "passwork is too weak"; break;
    default:
      error = "sign up unsuccessful"; break;
  }
  return updateObject(state, {errorEmailSignUp: error});
};

export default reducer;