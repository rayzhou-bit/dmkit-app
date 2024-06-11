import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { CARD_COLOR_KEYS } from '../../constants/colors';

export const FILTER_OPTIONS = {
  allTab: 'allTab',
  noTab: 'noTab',
  thisTab: 'thisTab',
};

export const SORT_OPTIONS = {
  abc: 'abc',
  zxy: 'zxy',
  newest: 'newest',
  oldest: 'oldest',
};

export const VIEW_OPTIONS = {
  condensed: 'condensed',
  expanded: 'expanded',
};

const hasSearch = (card, search) => {
  const title = card?.title ?? '';
  if (title.toLowerCase().includes(search.toLowerCase())) {
    return true;
  }
  const text = card?.content?.text ?? '';
  if (text.toLowerCase().includes(search.toLowerCase())) {
    return true;
  }
  return false;
};

const hasColor = (card, isFiltered, color) => {
  if (isFiltered) {
    return CARD_COLOR_KEYS[color] === card?.color;
  }
  return true;
};

const hasTab = (card, filter, tab, allTabs) => {
  switch(filter) {
    case FILTER_OPTIONS.thisTab:
      return !!card?.views?.[tab];
    case FILTER_OPTIONS.allTab:
      return true;
    case FILTER_OPTIONS.noTab:
      const cardTabs = Object.keys(card?.views);
      const intersection = allTabs.filter(tab => cardTabs.includes(tab));
      return intersection.length === 0;
  }
  return false;
};

const sortCards = (cards, sort, cardData) => {
  switch(sort) {
    case SORT_OPTIONS.abc:
      return cards.sort((a, b) => {
        const aTitle = cardData[a]?.title ?? '';
        const bTitle = cardData[b]?.title ?? '';
        return aTitle.localeCompare(bTitle);
      });
    case SORT_OPTIONS.zxy:
      return cards.sort((a, b) => {
        const aTitle = cardData[a]?.title ?? '';
        const bTitle = cardData[b]?.title ?? '';
        return bTitle.localeCompare(aTitle);
        
      });
    case SORT_OPTIONS.newest:
      return cards.sort((a, b) => {
        const aTime = cardData[a]?.editedOn ?? 0;
        const bTime = cardData[b]?.editedOn ?? 0;
        return bTime - aTime;
      });
    case SORT_OPTIONS.oldest:
      return cards.sort((a, b) => {
        const aTime = cardData[a]?.editedOn ?? 0;
        const bTime = cardData[b]?.editedOn ?? 0;
        return aTime - bTime;
      });
  }
};

export const useLibraryHooks = () => {
  const activeTab = useSelector(state => state.project.present.activeViewId);
  const tabOrder = useSelector(state => state.project.present.viewOrder);
  const cardCollection = useSelector(state => state.project.present.cards);
  const activeProject = useSelector(state => state.session.activeCampaignId || '');

  const [ showButton, setShowButton ] = useState(!!activeProject);
  const [ isOpen, setIsOpen ] = useState(false);
  const [ searchString, setSearchString ] = useState('');
  const [ isColorFiltered, setIsColorFiltered ] = useState(false);
  const [ filterColorOption, setFilterColorOption ] = useState(CARD_COLOR_KEYS.gray);
  const [ filterTabOption, setFilterTabOption ] = useState(FILTER_OPTIONS.allTab);
  const [ sortOption, setSortOption ] = useState(SORT_OPTIONS.abc);
  const [ viewOption, setViewOption ] = useState(VIEW_OPTIONS.condensed);

  // Reset when project changes
  useEffect(() => {
    setShowButton(!!activeProject);
    setIsOpen(false);
  }, [activeProject]);

  let libraryCards = [];
  for (let id in cardCollection) {
    const card = cardCollection[id];
    if (hasSearch(card, searchString)
      && hasColor(card, isColorFiltered, filterColorOption)
      && hasTab(card, filterTabOption, activeTab, tabOrder)
    ) {
      libraryCards = [ ...libraryCards, id ];
    }
  }
  libraryCards = sortCards(libraryCards, sortOption, cardCollection);

  return {
    showButton,
    isOpen,
    toggleLibrary: () => setIsOpen(!isOpen),
    countDisplay: (libraryCards?.length ?? 0) + '/' + (cardCollection ? Object.keys(cardCollection).length : 0),
    searchString,
    setSearchString,
    isColorFiltered,
    setIsColorFiltered,
    filterColorOption,
    setFilterColorOption,
    filterTabOption,
    setFilterTabOption,
    sortOption,
    setSortOption,
    viewOption,
    setViewOption,
    libraryCards,
  };
};

export const useColorDropdownHooks = () => {
  const [ isColorDropdownOpen, setIsColorDropdownOpen ] = useState(false);
  const colorDropdownBtnRef = useRef();

  return {
    colorDropdownBtnRef,
    isColorDropdownOpen,
    openColorDropdown: (event) => {
      event.stopPropagation();
      setIsColorDropdownOpen(!isColorDropdownOpen);
    },
    closeColorDropdown: () => setIsColorDropdownOpen(false),
  };
};
