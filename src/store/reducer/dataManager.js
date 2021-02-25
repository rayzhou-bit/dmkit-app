import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utilityFunctions';

const initialState = {
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
  // error codes for firebase method Auth.signInWithEmailAndPassword
  switch (errorCode) {
    case ('auth/invalid-email'): return updateObject(state, {errorEmailSignIn: "invalid email"});
    case ('auth/user-disabled'): return updateObject(state, {errorEmailSignIn: "user disabled"});
    case ('auth/user-not-found'): return updateObject(state, {errorEmailSignIn: "user not found"});
    case ('auth/wrong-password'): return updateObject(state, {errorEmailSignIn: "invalid password"});
    default: return updateObject(state, {errorEmailSignIn: "sign in unsuccessful"});
  }
};

const setErrorEmailSignUp = (state, errorCode) => {
  // error codes for firebase method Auth.createUserWithEmailAndPassword
  switch (errorCode) {
    case ('auth/email-already-in-use'): return updateObject(state, {errorEmailSignUp: "email already in use"});
    case ('auth/invalid-email'): return updateObject(state, {errorEmailSignUp: "invalid email"});
    case ('auth/operation-not-allowed'): return updateObject(state, {errorEmailSignUp: "email sign up currently not in service"});
    case ('auth/weak-password'): return updateObject(state, {errorEmailSignUp: "passwork is too weak"});
    default: return updateObject(state, {errorEmailSignUp: "sign up unsuccessful"});
  }
};

export default reducer;