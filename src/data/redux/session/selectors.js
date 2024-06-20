import { createSelector } from 'reselect';
import * as session from './selectors';

export const getSession = (state) => state.session;
const mkSimpleSelector = (cb) => createSelector([session.getSession], cb);
export const simpleSelectors = {
  popup: mkSimpleSelector(session => session.popup),
  status: mkSimpleSelector(session => session.status),
  campaignList: mkSimpleSelector(session => session.campaignList),
  activeCampaign: mkSimpleSelector(session => session.activeCampaignId),
  activeCard: mkSimpleSelector(session => session.activeCardId),
  isCampaignEdited: mkSimpleSelector(session => session.isProjectEdited),
};

export default {
  ...simpleSelectors,
};
