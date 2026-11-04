import React from 'react';

import { ACCEPTED_IMAGE_TYPES } from '../../constants/images';

import './Card.scss';

// Props come from the card's usePortraitHooks call (hoisted to Card/LibraryCard
// so the title bar's add-image button and whole-card drop share it). With no
// image nothing renders in the content flow, only the hidden file input.
const NotePortrait = ({
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
}) => (
  <>
    <input
      type='file'
      className='card-file-input'
      accept={ACCEPTED_IMAGE_TYPES.join(',')}
      ref={fileInputRef}
      onChange={onFileChange}
    />
    {hasPortrait && (
      <div className='note-portrait'>
        <img
          className='note-portrait-image'
          src={portrait}
          alt={portraitAlt}
          title={portraitAlt}
          draggable='false'
          onDragStart={(e) => e.preventDefault()}
          onDoubleClick={openFilePicker}
        />
        <button type='button' className='note-portrait-clear' onClick={clearPortrait}>×</button>
      </div>
    )}
    {isProcessing && <div className='note-portrait-status'>Processing…</div>}
    {errorMessage && (
      <div className='note-portrait-error' role='alert'>
        <span>{errorMessage}</span>
        <button type='button' onClick={dismissError}>×</button>
      </div>
    )}
  </>
);

export default NotePortrait;
