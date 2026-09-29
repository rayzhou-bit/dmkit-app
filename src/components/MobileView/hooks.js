import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { actions } from '../../data/redux';
import { FILTER_OPTIONS, useLibraryHooks } from '../Library/hooks';

// Drives the tab strip + card list. Reuses useLibraryHooks for the actual
// search/filter/sort logic instead of reimplementing it, but overrides its
// default filter (allTab) to the active tab - "All cards" is an explicit
// opt-in here, not the default, since tabs are how cards are grouped now
// that there's no canvas to place them on.
export const useMobileViewHooks = () => {
  const dispatch = useDispatch();
  const activeTab = useSelector(state => state.project.present.activeViewId);
  const tabOrder = useSelector(state => state.project.present.viewOrder || []);
  const tabsData = useSelector(state => state.project.present.views || {});

  const {
    searchString,
    setSearchString,
    filterTabOption,
    setFilterTabOption,
    libraryCards,
  } = useLibraryHooks();

  useEffect(() => {
    setFilterTabOption(FILTER_OPTIONS.thisTab);
  }, []);

  const showingAllCards = filterTabOption === FILTER_OPTIONS.allTab;

  return {
    activeTab,
    tabOrder,
    tabsData,
    switchTab: (id) => {
      dispatch(actions.project.setActiveTab({ id }));
      // Switching tabs while "All cards" was on would otherwise keep
      // showing every card instead of narrowing to the tab just tapped.
      setFilterTabOption(FILTER_OPTIONS.thisTab);
    },
    searchString,
    setSearchString,
    showingAllCards,
    toggleShowAllCards: () => setFilterTabOption(showingAllCards ? FILTER_OPTIONS.thisTab : FILTER_OPTIONS.allTab),
    libraryCards,
  };
};

// The floating "+" button's stat/note/freeform sheet.
export const useCreateCardSheetHooks = () => {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
};
