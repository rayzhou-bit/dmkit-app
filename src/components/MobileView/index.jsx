import React from 'react';

import LibraryCard from '../Card/LibraryCard';
import { useToolMenuHooks } from '../ToolMenu/hooks';
import { useMobileViewHooks, useCreateCardSheetHooks } from './hooks';

import './index.scss';
import PlusIcon from '../../assets/icons/plus-dark.svg'; // dark glyph for the yellow button
import MonsterIcon from '../../assets/icons/monster-icon.svg';
import NoteIcon from '../../assets/icons/note-icon.svg';
import CustomIcon from '../../assets/icons/custom-icon.svg';

// The phone-width replacement for ToolMenu/Library/TabBar/Canvas: no
// spatial canvas, just tabs-as-groups over a full-screen scrolling list of
// the same LibraryCard used in the desktop Library panel (same per-type
// content components, same editing), plus a way to switch tabs, search,
// and create cards.
const MobileView = () => {
  const {
    activeTab,
    tabOrder,
    tabsData,
    switchTab,
    searchString,
    setSearchString,
    showingAllCards,
    toggleShowAllCards,
    libraryCards,
  } = useMobileViewHooks();

  const {
    disableNewMonsterCard,
    onClickNewMonsterCard,
    disableNewNoteCard,
    onClickNewNoteCard,
    disableNewCustomCard,
    onClickNewCustomCard,
  } = useToolMenuHooks();

  const { isOpen: isSheetOpen, open: openSheet, close: closeSheet } = useCreateCardSheetHooks();

  const createCard = (onClick) => {
    onClick();
    closeSheet();
  };

  return (
    <div className='mobile-view'>
      <div className='mobile-tab-strip'>
        <button
          className={'mobile-tab mobile-all-tab' + (showingAllCards ? ' active' : '')}
          onClick={toggleShowAllCards}
        >
          All cards
        </button>
        {tabOrder.map(id => (
          <button
            key={id}
            className={'mobile-tab' + (!showingAllCards && id === activeTab ? ' active' : '')}
            onClick={() => switchTab(id)}
          >
            {tabsData[id]?.title || 'Untitled'}
          </button>
        ))}
      </div>

      <div className='mobile-search-row'>
        <input
          className='mobile-search-input'
          onChange={e => setSearchString(e.target.value)}
          placeholder='Search cards'
          type='search'
          value={searchString}
        />
      </div>

      <div className='mobile-card-list'>
        {libraryCards.length === 0 && (
          <div className='mobile-empty'>No cards here yet - tap + to add one.</div>
        )}
        {libraryCards.map(id => (
          <LibraryCard key={id} cardId={id} isExpanded={false} />
        ))}
      </div>

      <button className='mobile-add-btn' onClick={openSheet} disabled={!activeTab}>
        <img src={PlusIcon} alt='Add card' draggable='false' />
      </button>

      {isSheetOpen && (
        <>
          <div className='mobile-sheet-backdrop' onClick={closeSheet} />
          <div className='mobile-create-sheet'>
            <button
              disabled={disableNewMonsterCard}
              onClick={() => createCard(onClickNewMonsterCard)}
            >
              <img src={MonsterIcon} alt='' draggable='false' />
              <span>Stat</span>
            </button>
            <button
              disabled={disableNewNoteCard}
              onClick={() => createCard(onClickNewNoteCard)}
            >
              <img src={NoteIcon} alt='' draggable='false' />
              <span>Note</span>
            </button>
            <button
              disabled={disableNewCustomCard}
              onClick={() => createCard(onClickNewCustomCard)}
            >
              <img src={CustomIcon} alt='' draggable='false' />
              <span>Freeform</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MobileView;
