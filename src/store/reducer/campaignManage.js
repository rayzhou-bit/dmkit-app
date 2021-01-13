import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utilityFunctions';

const initialState = {
  activeCampaign: null,
  edited: false,
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.UPD_ACTIVE_CAMPAIGN: return updateObject(state, {activeCampaign: action.activeCampaign});

    case actionTypes.SET_CAMPAIGN_EDIT: return updateObject(state, {edited: true});
    case actionTypes.RESET_CAMPAIGN_EDIT: return updateObject(state, {edited: false});

    default: return state;
  }
};

export default reducer;