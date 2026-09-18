import React from 'react';

import { useToolMenuHooks } from './hooks';

import './index.scss';
import NewCardIcon from '../../assets/icons/new-card.svg';
import NewCardDisabledIcon from '../../assets/icons/new-card-disabled.svg';
import CopyCardIcon from '../../assets/icons/copy-card.svg';
import CopyCardDisabledIcon from '../../assets/icons/copy-card-disabled.svg';
import AddImageIcon from '../../assets/icons/add-image.svg';
import StatBlockIcon from '../../assets/icons/stat-block.svg';
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

      {/* new card */}
      <button
        className='tool-btn'
        disabled={disableNewCard}
        onClick={onClickNewCard}
      >
        <div className='btn-highlight'>
          <img
            alt='New'
            draggable='false'
            src={disableNewCard ? NewCardDisabledIcon : NewCardIcon}
          />
        </div>
        <span>new</span>
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
            alt='New monster'
            draggable='false'
            src={StatBlockIcon}
          />
        </div>
        <span>monster</span>
      </button>

      {/* copy card */}
      <button
        className='tool-btn'
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
