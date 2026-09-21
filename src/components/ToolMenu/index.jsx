import React from 'react';

import { useToolMenuHooks } from './hooks';

import './index.scss';
import NewCardIcon from '../../assets/icons/new-card.svg';
import NewCardDisabledIcon from '../../assets/icons/new-card-disabled.svg';
import CopyCardIcon from '../../assets/icons/copy-card.svg';
import CopyCardDisabledIcon from '../../assets/icons/copy-card-disabled.svg';
import AddImageIcon from '../../assets/icons/add-image.svg';
import MonsterIcon from '../../assets/icons/monster-icon.svg';
import LocationIcon from '../../assets/icons/location-icon.svg';
import DeleteCardIcon from '../../assets/icons/trash-red.svg';

const ToolMenu = ({
  isOpen,
  toolMenuRef,
}) => {
  const {
    disableNewCard,
    onClickNewCard,
    disableNewImageCard,
    onClickNewImageCard,
    disableNewMonsterCard,
    onClickNewMonsterCard,
    disableNewLocationCard,
    onClickNewLocationCard,
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

      {/* new text card */}
      <button
        className='tool-btn'
        disabled={disableNewCard}
        onClick={onClickNewCard}
      >
        <div className='btn-highlight'>
          <img
            alt='New text'
            draggable='false'
            src={disableNewCard ? NewCardDisabledIcon : NewCardIcon}
          />
        </div>
        <span>text</span>
      </button>

      {/* new image card */}
      <button
        className='tool-btn tool-btn-image'
        disabled={disableNewImageCard}
        onClick={onClickNewImageCard}
      >
        <div className='btn-highlight'>
          <img
            alt='New image'
            draggable='false'
            src={AddImageIcon}
          />
        </div>
        <span>image</span>
      </button>

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

      {/* new location card */}
      <button
        className='tool-btn tool-btn-location'
        disabled={disableNewLocationCard}
        onClick={onClickNewLocationCard}
      >
        <div className='btn-highlight'>
          <img
            alt='New location'
            className='tool-btn-location-icon'
            draggable='false'
            src={LocationIcon}
          />
        </div>
        <span>place</span>
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
