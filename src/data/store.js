import { combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import undoable, { includeAction } from 'redux-undo';

import * as campaign from './campaign/reducers';
import * as session from './session/reducers';
import * as user from './user/reducers';

const rootReducer = combineReducers({
  campaignData: undoable(
    campaign.reducer,
    {
      filter: includeAction([
        'updCampaignTitle',
        'shiftViewInViewOrder',
        'createCard',
        'copyCard',
        'destroyCard',
        'linkCardToView',
        'unlinkCardToView',
        'updCardPos',
        'updCardSize',
        'updCardColor',
        'updCardTitle',
        'updCardText',
        'createView',
        'destroyView',
        'updViewTitle',
      ]),
      limit: 10,
    }
  ),
  session: session.reducer,
  user: user.reducer,
});

const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
