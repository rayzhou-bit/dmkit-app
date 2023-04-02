import { createSelector } from 'reselect';
import * as module from './selectors';

export const appState = (state) => state.app;
const mkSimpleSelector = (cb) => createSelector([module.appState], cb);
export const simpleSelectors = {
  id: mkSimpleSelector(app => app.id),
  title: mkSimpleSelector(app => app.title),
  activeCard: mkSimpleSelector(app => app.activeCard),
  activeTab: mkSimpleSelector(app => app.activeTab),
  tabOrder: mkSimpleSelector(app => app.tabOrder),
  cards: mkSimpleSelector(app => app.cards),
  tabs: mkSimpleSelector(app => app.tabs),
};

export const tabData = createSelector(
  [
    module.simpleSelectors.tabOrder,
    module.simpleSelectors.tabs,
  ],
  (tabOrder, tabs) => ({ tabOrder, tabs }),
);

export default {
  ...simpleSelectors,
  tabData,
};