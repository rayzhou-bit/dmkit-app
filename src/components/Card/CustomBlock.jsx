import React from 'react';

import { useCustomImageBlockHooks } from './hooks';
import { CUSTOM_BLOCK_TYPES } from '../../constants/custom';
import CustomTextBlock from './CustomTextBlock';
import CustomImageBlock from './CustomImageBlock';

import './Card.scss';
import DuplicateIcon from '../../assets/icons/entry-duplicate.svg';
import TrashIcon from '../../assets/icons/trash-red.svg';

// One block's wrapper: controls sit as an absolutely-positioned overlay
// (like .monster-entry-controls) above either a text or an image block, so
// they don't reserve space when hidden.
// normalizeCustomBlocks already drops any block with an unrecognized
// `type`, but the dispatch below still falls back to nothing rendered for
// one anyway, rather than assuming only 'text'/'image' can ever reach here.
const CustomBlock = ({ cardId, field = 'blocks', block, index, onDuplicate, onDelete, setEditingCard }) => {
  const ordinal = `Block ${index + 1}`;
  const isImageBlock = block.type === CUSTOM_BLOCK_TYPES.image;

  // Always called (blocks never change type after creation, but hooks must
  // run unconditionally regardless) - only hasImage/clearImage are used
  // here, so the remove-image button lives in the same controls row as
  // duplicate/delete instead of overlapping them as an overlay on the
  // image itself (CustomImageBlock still owns the rest of this hook's
  // state for its own upload/placeholder rendering).
  const { hasImage, clearImage } = useCustomImageBlockHooks({ cardId, blockId: block.id, field });

  return (
    <div className='custom-block' role='group' aria-label={ordinal}>
      <div className='custom-block-controls'>
        {isImageBlock && hasImage && (
          <button
            type='button'
            className='custom-block-remove-image'
            onClick={clearImage}
            aria-label={`Remove image, ${ordinal}`}
          >
            ×
          </button>
        )}
        <button
          type='button'
          className='custom-block-duplicate'
          onClick={() => onDuplicate(block.id)}
          aria-label={`Duplicate ${ordinal}`}
        >
          <img src={DuplicateIcon} alt='' draggable='false' />
        </button>
        <button
          type='button'
          className='custom-block-delete'
          onClick={() => onDelete(block.id)}
          aria-label={`Delete ${ordinal}`}
        >
          <img src={TrashIcon} alt='' draggable='false' />
        </button>
      </div>

      {isImageBlock ? (
        <CustomImageBlock cardId={cardId} field={field} blockId={block.id} />
      ) : block.type === CUSTOM_BLOCK_TYPES.text ? (
        <CustomTextBlock cardId={cardId} field={field} blockId={block.id} setEditingCard={setEditingCard} />
      ) : null}
    </div>
  );
};

export default CustomBlock;
