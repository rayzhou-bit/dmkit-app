import React from 'react';

import { useToolMenuHooks } from './hooks';

import './index.scss';
import CopyCardIcon from '../../assets/icons/copy-card.svg';
import CopyCardDisabledIcon from '../../assets/icons/copy-card-disabled.svg';
import MonsterIcon from '../../assets/icons/monster-icon.svg';
import NoteIcon from '../../assets/icons/note-icon.svg';
import CustomIcon from '../../assets/icons/custom-icon.svg';
import DeleteCardIcon from '../../assets/icons/trash-red.svg';

const ToolMenu = ({
  isOpen,
  toolMenuRef,
}) => {
  const {
    disableNewMonsterCard,
    onClickNewMonsterCard,
    disableNewNoteCard,
    onClickNewNoteCard,
    disableNewCustomCard,
    onClickNewCustomCard,
    disableCopyCards,
    onClickCopyCards,
    disableDeleteCards,
    onClickDeleteCards,
  } = useToolMenuHooks();

  return (
    <div
      className='tool-menu'
      ref={toolMenuRef}
      style={{left: isOpen ? 0 : '-80px'}}
    >

      {/* new monster card */}
      <button
        className='tool-btn tool-btn-monster'
        disabled={disableNewMonsterCard}
        onClick={onClickNewMonsterCard}
      >
        <div className='btn-highlight'>
          <img
            alt='New stat'
            className='tool-btn-monster-icon'
            draggable='false'
            src={MonsterIcon}
          />
        </div>
        <span>stat</span>
      </button>

      {/* new note card */}
      <button
        className='tool-btn tool-btn-note'
        disabled={disableNewNoteCard}
        onClick={onClickNewNoteCard}
      >
        <div className='btn-highlight'>
          <img
            alt='New note'
            className='tool-btn-note-icon'
            draggable='false'
            src={NoteIcon}
          />
        </div>
        <span>note</span>
      </button>

      {/* new custom card - the direct successor to the old text/image
          buttons removed above: a blank card that lets you add as many
          text/image blocks as you want (see CustomContent.jsx). */}
      <button
        className='tool-btn tool-btn-custom'
        disabled={disableNewCustomCard}
        onClick={onClickNewCustomCard}
      >
        <div className='btn-highlight'>
          <img
            alt='New custom'
            className='tool-btn-custom-icon'
            draggable='false'
            src={CustomIcon}
          />
        </div>
        <span>custom</span>
      </button>

      {/* copy card - pushed to the bottom of the toolbar, see .tool-btn-copy */}
      <button
        className='tool-btn tool-btn-copy'
        disabled={disableCopyCards}
        onClick={onClickCopyCards}
      >
        <div className='btn-highlight'>
          <img
            alt='Copy'
            draggable='false'
            src={disableCopyCards ? CopyCardDisabledIcon : CopyCardIcon}
          />
        </div>
        <span>copy</span>
      </button>

      {/* delete card(s) */}
      <button
        className='tool-btn tool-btn-delete'
        disabled={disableDeleteCards}
        onClick={onClickDeleteCards}
      >
        <div className='btn-highlight'>
          <img
            alt='Delete'
            draggable='false'
            src={DeleteCardIcon}
          />
        </div>
        <span>delete</span>
      </button>

    </div>
  );
};

export default ToolMenu;
