import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utilityFunctions';

const initialState = {
  user: null,
  email: null,

  activeCampaignId: null,
  activeCardId: null,

  cardDelete: [],   // array of cards scheduled for deletion on server
  viewDelete: [],   // array of views scheduled for deletion on server
};

const reducer = (state = {}, action) => {
  switch(action.type) {
    // Load/Unload
    case actionTypes.LOAD_USER: return updateObject(state, {user: action.user, email: action.email});
    case actionTypes.UNLOAD_USER: return {};

    // Update user data

    // activeCampaignId
    case actionTypes.UPD_ACTIVE_CAMPAIGN_ID: return updateObject(state, {activeCampaignId: action.activeCampaignId});

    // activeCardId

    // cardDelete

    // viewDelete

    case actionTypes.SET_CAMPAIGN_EDIT: return updateObject(state, {edited: true});
    case actionTypes.UNSET_CAMPAIGN_EDIT: return updateObject(state, {edited: false});
    
    default: return state;
  }
};

export default reducer;