import { createSelector } from 'reselect';
import * as project from './selectors';
import * as session from '../session/selectors';
import { DEFAULT_CANVAS_POSITION, DEFAULT_CANVAS_SCALE } from '../../../constants/dimensions';

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
    return tabs[activeTab]?.pos ?? DEFAULT_CANVAS_POSITION;
  }
);

export const activeTabScale = createSelector(
  [
    project.simpleSelectors.tabs,
    project.simpleSelectors.activeTab,
  ],
  (tabs, activeTab) => {
    if (!activeTab) { return null; }
    return tabs[activeTab]?.scale ?? DEFAULT_CANVAS_SCALE;
  }
);

export const activeTabCardsDimensions = createSelector(
  [
    project.simpleSelectors.cards,
    project.simpleSelectors.activeTab,
  ],
  (cards, activeTab) => {
    let cardsInTab = [];
    for (let cardId in cards) {
      const card = cards[cardId];
      if (card.views[activeTab]) {
        cardsInTab = {
          ...cardsInTab,
          [cardId]: card.views[activeTab],
        };
      }
    }
    return cardsInTab;
  }
);

export default {
  ...simpleSelectors,
  activeCardData,
  activeCardPosition,
  activeTabPosition,
  activeTabScale,
  activeTabCardsDimensions,
};
