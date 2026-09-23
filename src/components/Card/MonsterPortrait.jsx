import React from 'react';

import { useMonsterPortraitHooks } from './hooks';
import { ACCEPTED_IMAGE_TYPES } from '../../constants/images';

import './Card.scss';
import AddImageIcon from '../../assets/icons/add-image.svg';

const MonsterPortrait = ({
  cardId,
}) => {
  const {
    portrait,
    portraitAlt,
    hasPortrait,
    fileInputRef,
    isProcessing,
    errorMessage,
    openFilePicker,
    onFileChange,
    onDrop,
    clearPortrait,
    dismissError,
  } = useMonsterPortraitHooks({ cardId });

  return (
    <div className='monster-portrait' onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
      <input
        type='file'
        className='card-file-input'
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        ref={fileInputRef}
        onChange={onFileChange}
      />
      {hasPortrait ? (
        <>
          <img
            className='monster-portrait-image'
            src={portrait}
            alt={portraitAlt}
            title={portraitAlt}
            draggable='false'
            onDragStart={(e) => e.preventDefault()}
            onDoubleClick={openFilePicker}
          />
          <button type='button' className='monster-portrait-clear' onClick={clearPortrait}>×</button>
        </>
      ) : (
        <button type='button' className='monster-portrait-placeholder' onClick={openFilePicker}>
          <img src={AddImageIcon} alt='' draggable='false' />
        </button>
      )}
      {isProcessing && <div className='monster-portrait-status'>Processing…</div>}
      {errorMessage && (
        <div className='monster-portrait-error' role='alert'>
          <span>{errorMessage}</span>
          <button type='button' onClick={dismissError}>×</button>
        </div>
      )}
    </div>
  );
};

export default MonsterPortrait;
