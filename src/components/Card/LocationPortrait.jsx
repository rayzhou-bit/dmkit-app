import React from 'react';

import { usePortraitHooks } from './hooks';
import { ACCEPTED_IMAGE_TYPES } from '../../constants/images';

import './Card.scss';
import AddImageIcon from '../../assets/icons/add-image.svg';

// Near-identical to MonsterPortrait.jsx (own CSS class names, since the
// canvas layouts around each differ) but sharing usePortraitHooks - see its
// comment in hooks.js for why that's shared rather than duplicated here.
// No setEditingCard/drag-safe gating needed even inside the Library: every
// interactive bit here is a plain click/dblclick, which HTML5 drag-and-drop
// never treats as the start of a drag (see LibraryCard.test.jsx).
const LocationPortrait = ({
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
    clearPortrait,
    dismissError,
  } = usePortraitHooks({ cardId });

  return (
    <div className='location-portrait' onDragOver={(e) => e.preventDefault()}>
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
            className='location-portrait-image'
            src={portrait}
            alt={portraitAlt}
            title={portraitAlt}
            draggable='false'
            onDragStart={(e) => e.preventDefault()}
            onDoubleClick={openFilePicker}
          />
          <button type='button' className='location-portrait-clear' onClick={clearPortrait}>×</button>
        </>
      ) : (
        <button type='button' className='location-portrait-placeholder' onClick={openFilePicker}>
          <img src={AddImageIcon} alt='' draggable='false' />
        </button>
      )}
      {isProcessing && <div className='location-portrait-status'>Processing…</div>}
      {errorMessage && (
        <div className='location-portrait-error' role='alert'>
          <span>{errorMessage}</span>
          <button type='button' onClick={dismissError}>×</button>
        </div>
      )}
    </div>
  );
};

export default LocationPortrait;
