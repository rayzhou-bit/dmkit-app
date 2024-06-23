import { createSelector } from 'reselect';
import * as project from './selectors';
import * as session from '../session/selectors';

export const getProject = (state) => state.project;
const mkSimpleSelector = (cb) => createSelector([project.getProject], cb);
export const simpleSelectors = {
  presentState: mkSimpleSelector(project => project.present),
  activeTab: mkSimpleSelector(project => project.present.activeViewId),
  tabOrder: mkSimpleSelector(project => project.present.viewOrder),
  cards: mkSimpleSelector(project => project.present.cards),
  tabs: mkSimpleSelector(project => project.present.views),
};

export const activeCardData = createSelector(
  [
    project.simpleSelectors.cards,
    session.simpleSelectors.activeCard,
  ],
  (cards, activeCardId) => {
    if (!activeCardId) { return null; }
    return cards[activeCardId];
  }
)

export const activeCardPosition = createSelector(
  [
    project.simpleSelectors.cards,
    session.simpleSelectors.activeCard,
    project.simpleSelectors.activeTab,
  ],
  (cards, activeCardId, activeTab) => {
    if (!activeCardId) { return null; }
    if (!activeTab) { return null; }
    return cards[activeCardId].views[activeTab]?.pos;
  },
);

export const activeTabPosition = createSelector(
  [
    project.simpleSelectors.tabs,
    project.simpleSelectors.activeTab,
  ],
  (tabs, activeTab) => {
    if (!activeTab) { return null; }
    return tabs[activeTab]?.pos;
  }
);

export default {
  ...simpleSelectors,
  activeCardData,
  activeCardPosition,
  activeTabPosition,
};
