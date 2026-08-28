import React from 'react';

import { useImageContentHooks } from './hooks';
import { ACCEPTED_IMAGE_TYPES } from '../../constants/images';

import './Card.scss';
import AddImageIcon from '../../assets/icons/add-image.svg';

const ImageContent = ({
  cardId,
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
    dismissError,
  } = useImageContentHooks({ cardId });

  return (
    <div className='card-content' onDragOver={(e) => e.preventDefault()}>
      <input
        type='file'
        className='card-file-input'
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        ref={fileInputRef}
        onChange={onFileChange}
      />
      {hasImage ? (
        <img
          className='card-image'
          src={image}
          alt={alt}
          title={alt}
          draggable='false'
          onDragStart={(e) => e.preventDefault()}
          onDoubleClick={openFilePicker}
        />
      ) : (
        <button type='button' className='image-placeholder' onClick={openFilePicker}>
          <img src={AddImageIcon} alt='' draggable='false' />
          <span>Add image</span>
        </button>
      )}
      {isProcessing && <div className='image-status'>Processing…</div>}
      {errorMessage && (
        <div className='image-error' role='alert'>
          <span>{errorMessage}</span>
          <button type='button' onClick={dismissError}>×</button>
        </div>
      )}
    </div>
  );
};

export default ImageContent;
