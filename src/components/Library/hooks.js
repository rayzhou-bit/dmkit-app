import { useState } from 'react';
import { useSelector } from 'react-redux';

export const FILTER_OPTIONS = {
  all: 'all',
  thisTab: 'thisTab',
  unsorted: 'unsorted',
};

export const SORT_OPTIONS = {
  abc: 'abc',
  zxy: 'zxy',
  color: 'color',
  newest: 'newest',
  oldest: 'oldest',
};

export const VIEW_OPTIONS = {
  condensed: 'condensed',
  expanded: 'expanded',
};

export const useLibraryHooks = () => {
  const activeTab = useSelector(state => state.campaignData.present.activeViewId);
  const tabOrder = useSelector(state => state.campaignData.present.viewOrder);
  const cardCollection = useSelector(state => state.campaignData.present.cards);

  const [isOpen, setIsOpen] = useState(false);
  const [searchString, setSearchString] = useState('');
  const [filterOption, setFilterOption] = useState(FILTER_OPTIONS.all);
  const [sortOption, setSortOption] = useState(SORT_OPTIONS.abc);
  const [viewOption, setViewOption] = useState(VIEW_OPTIONS.condensed);

  let libraryCards = {
    active:[], 
    all: (cardCollection? Object.keys(cardCollection).length : "")
  };
  const search = searchString.toLowerCase();
  for (let id in cardCollection) {
    
    const title = cardCollection[id].title ?? '';
    const text = cardCollection[id].content?.text ?? '';
    if (title.toLowerCase().includes(search) || text.toLowerCase().includes(search)) {
      switch (filterOption) {
        case FILTER_OPTIONS.all:
          libraryCards.active = [ ...libraryCards.active, id ];
          break;
        case FILTER_OPTIONS.thisTab:
          if (cardCollection[id].views?.[activeTab]) {
            libraryCards.active = [ ...libraryCards.active, id ];
          }
          break;
        case FILTER_OPTIONS.unsorted:
          const tabsOfCard = Object.keys(cardCollection[id].views);
          const intersection = tabOrder.filter(tab => tabsOfCard.includes(tab))
          if (intersection.length === 0) {
            libraryCards.active = [ ...libraryCards.active, id ];
          }
          break;
      }
    }
  }

  return {
    isOpen,
    toggleLibrary: () => setIsOpen(!isOpen),
    searchString,
    setSearchString,
    setFilterOption,
    setSortOption,
    setViewOption,
    libraryCards,
  };
};
