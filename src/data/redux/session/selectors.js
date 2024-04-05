import { createSelector } from 'reselect';
import * as module from './selectors';

export const sessionState = (state) => state.session;
const mkSimpleSelector = (cb) => createSelector([module.sessionState], cb);
export const simpleSelectors = {
  popup: mkSimpleSelector(sessionData => sessionData.popup),
  status: mkSimpleSelector(sessionData => sessionData.status),
  completeState: mkSimpleSelector(problemData => problemData),
  campaignList: mkSimpleSelector(sessionData => sessionData.campaignList),
  activeCampaignId: mkSimpleSelector(sessionData => sessionData.activeCampaignId),
  activeCardId: mkSimpleSelector(sessionData => sessionData.activeCardId),
  isCampaignEdited: mkSimpleSelector(sessionData => sessionData.campaignEdit),
};

export default {
  ...simpleSelectors,
};
