import React from 'react';

import { useToolMenuHooks } from './hooks';

import './index.scss';
import NewCardIcon from '../../assets/icons/new-card.svg';
import NewCardDisabledIcon from '../../assets/icons/new-card-disabled.svg';
import CopyCardIcon from '../../assets/icons/copy-card.svg';
import CopyCardDisabledIcon from '../../assets/icons/copy-card-disabled.svg';
import StatBlockIcon from '../../assets/icons/stat-block.svg';
import AddImageIcon from '../../assets/icons/add-image.svg';

const ToolMenu = ({
  isOpen,
  toolMenuRef,
}) => {
  const {
    disableNewCard,
    onClickNewCard,
    disableCopyCard,
    onClickCopyCard,
    disableCopyCards,
    onClickCopyCards,
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
      
    </div>
  );
};

export default ToolMenu;
