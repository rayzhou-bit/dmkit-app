import React from 'react';

import { useCustomImageBlockHooks } from './hooks';
import { ACCEPTED_IMAGE_TYPES } from '../../constants/images';

import './Card.scss';
import AddImageIcon from '../../assets/icons/add-image.svg';

// Near-identical to NotePortrait.jsx (own CSS class names - a custom image
// block sits inside a .custom-block, not a full-width banner strip) but
// keyed by blockId instead of a single fixed content.portrait pair, via
// useCustomImageBlockHooks. No setEditingCard/drag-safe gating needed, same
// reasoning as NotePortrait: every interactive bit here is a plain
// click/dblclick, which HTML5 drag-and-drop never treats as the start of a
// drag. "Remove image" is centered over the image itself (not grouped with
// duplicate/delete in CustomBlock's controls row) - it clears the image but
// keeps the block, a different kind of action than those two, and center
// placement makes that distinction visible instead of implying a third
// "manage this block" button.
const CustomImageBlock = ({
  cardId,
  field = 'blocks',
  blockId,
}) => {
  const {
    image,
    alt,
    hasImage,
    fileInputRef,
    isProcessing,
    errorMessage,
    openFilePicker,
    onFileChange,
    onDrop,
    clearImage,
    dismissError,
  } = useCustomImageBlockHooks({ cardId, blockId, field });

  return (
    <div className='custom-image-block' onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
      <input
        type='file'
        className='card-file-input'
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        ref={fileInputRef}
        onChange={onFileChange}
      />
      {hasImage ? (
        <>
          <img
            className='custom-image-block-image'
            src={image}
            alt={alt}
            title={alt}
            draggable='false'
            onDragStart={(e) => e.preventDefault()}
            onDoubleClick={openFilePicker}
          />
          <button type='button' className='custom-image-block-clear' onClick={clearImage} aria-label='Remove image'>×</button>
        </>
      ) : (
        <button type='button' className='custom-image-block-placeholder' onClick={openFilePicker}>
          <img src={AddImageIcon} alt='' draggable='false' />
        </button>
      )}
      {isProcessing && <div className='custom-image-block-status'>Processing…</div>}
      {errorMessage && (
        <div className='custom-image-block-error' role='alert'>
          <span>{errorMessage}</span>
          <button type='button' onClick={dismissError}>×</button>
        </div>
      )}
    </div>
  );
};

export default CustomImageBlock;
