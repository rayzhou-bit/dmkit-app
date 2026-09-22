import React from 'react';

import { CUSTOM_BLOCK_TYPES } from '../../constants/custom';
import CustomTextBlock from './CustomTextBlock';
import CustomImageBlock from './CustomImageBlock';

import './Card.scss';
import DuplicateIcon from '../../assets/icons/entry-duplicate.svg';
import TrashIcon from '../../assets/icons/trash-red.svg';

// One block's wrapper: a small in-flow controls header (not an absolutely-
// positioned overlay like .monster-entry-controls - that one reserves
// space via .monster-entry-name's padding-right, which a block with no
// name field has no equivalent of) above either a text or an image block.
// normalizeCustomBlocks already drops any block with an unrecognized
// `type`, but the dispatch below still falls back to nothing rendered for
// one anyway, rather than assuming only 'text'/'image' can ever reach here.
const CustomBlock = ({ cardId, field = 'blocks', block, index, onDuplicate, onDelete, setEditingCard }) => {
  const ordinal = `Block ${index + 1}`;

  return (
    <div className='custom-block' role='group' aria-label={ordinal}>
      <div className='custom-block-controls'>
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

      {block.type === CUSTOM_BLOCK_TYPES.image ? (
        <CustomImageBlock cardId={cardId} field={field} blockId={block.id} />
      ) : block.type === CUSTOM_BLOCK_TYPES.text ? (
        <CustomTextBlock cardId={cardId} field={field} blockId={block.id} setEditingCard={setEditingCard} />
      ) : null}
    </div>
  );
};

export default CustomBlock;
