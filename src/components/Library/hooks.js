import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { CARD_COLOR_KEYS } from '../../styles/colors';

export const FILTER_OPTIONS = {
  all: 'all',
  color: 'color',
  thisTab: 'thisTab',
  unsorted: 'unsorted',
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

const hasFilter = (card, filter, color, tab, allTabs) => {
  switch(filter) {
    case FILTER_OPTIONS.thisTab:
      return !!card?.views?.[tab];
    case FILTER_OPTIONS.all:
      return true;
    case FILTER_OPTIONS.color:
      return CARD_COLOR_KEYS[color] === card?.color;
    case FILTER_OPTIONS.unsorted:
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

  const [ isOpen, setIsOpen ] = useState(false);
  const [ searchString, setSearchString ] = useState('');
  const [ filterOption, setFilterOption ] = useState(FILTER_OPTIONS.all);
  const [ filterColor, setFilterColor ] = useState('');
  const [ sortOption, setSortOption ] = useState(SORT_OPTIONS.abc);
  const [ viewOption, setViewOption ] = useState(VIEW_OPTIONS.condensed);

  let libraryCards = [];
  for (let id in cardCollection) {
    const card = cardCollection[id];
    if (hasSearch(card, searchString) && hasFilter(card, filterOption, filterColor, activeTab, tabOrder)) {
      libraryCards = [ ...libraryCards, id ];
    }
  }
  libraryCards = sortCards(libraryCards, sortOption, cardCollection);

  return {
    isOpen,
    toggleLibrary: () => setIsOpen(!isOpen),
    setSearchString,
    filterOption,
    setFilterOption,
    filterColor,
    setFilterColor,
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
    openColorDropdown: () => setIsColorDropdownOpen(!isColorDropdownOpen),
    closeColorDropdown: () => setIsColorDropdownOpen(false),
  };
};
