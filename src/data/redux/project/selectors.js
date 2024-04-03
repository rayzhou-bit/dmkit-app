import { createSelector } from 'reselect';
import * as module from './selectors';

export const campaignState = (state) => state.campaign;
const mkSimpleSelector = (cb) => createSelector([module.campaignState], cb);
export const simpleSelectors = {
  completeState: mkSimpleSelector(campaignData => campaignData),
  campaignTitle: mkSimpleSelector(campaignData => campaignData.title),
  activeCardId: mkSimpleSelector(campaignData => campaignData.activeCardId),
  activeViewId: mkSimpleSelector(campaignData => campaignData.activeViewId),
  viewOrder: mkSimpleSelector(campaignData => campaignData.viewOrder),
  cards: mkSimpleSelector(campaignData => campaignData.cards),
  views: mkSimpleSelector(campaignData => campaignData.views),
};

export default {
  ...simpleSelectors,
};
