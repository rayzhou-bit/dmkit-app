import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utilityFunctions';

const initialState = {
  user: null,
  email: null,

  activeCampaignId: "introCampaign",
  activeCardId: null,

  cardDelete: [],   // array of cards scheduled for deletion on server
  viewDelete: [],   // array of views scheduled for deletion on server

  campaignDataEdited: false,
  cardsEdited: [],  // IMPLEMENT: autosave
  viewsEdited: [],
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

    // cardDelete
    case actionTypes.ENQUEUE_CARD_DELETE: return updateObject(state, {cardDelete: [...state.cardDelete, action.cardId]});
    case actionTypes.CLEAR_CARD_DELETE: return updateObject(state, {cardDelete: []});

    // viewDelete
    case actionTypes.ENQUEUE_VIEW_DELETE: return updateObject(state, {viewDelete: [...state.viewDelete, action.viewId]});
    case actionTypes.CLEAR_VIEW_DELETE: return updateObject(state, {viewDelete: []});

    default: return state;
  }
};

export default reducer;