import * as actionTypes from '../actionTypes';
import { updateObject } from '../../shared/utilityFunctions';

const initialState = {
  activeCampaign: null,
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.UPD_ACTIVE_CAMPAIGN: return updateObject(state, action.activeCampaign);

    default: return state;
  }
};

export default reducer;