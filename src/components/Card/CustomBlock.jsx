import React from 'react';

import { CUSTOM_BLOCK_TYPES } from '../../constants/custom';
import CustomTextBlock from './CustomTextBlock';
import CustomImageBlock from './CustomImageBlock';

import './Card.scss';
import ArrowUpIcon from '../../assets/icons/arrow-up.svg';
import ArrowDownIcon from '../../assets/icons/arrow-down.svg';
import DuplicateIcon from '../../assets/icons/entry-duplicate.svg';
import TrashIcon from '../../assets/icons/trash-red.svg';

// One block's wrapper: controls sit as an absolutely-positioned overlay
// (like .monster-entry-controls) above either a text or an image block, so
// they don't reserve space when hidden. Move up/down are omitted (not
// disabled) at either end of the list, same as duplicate/delete never
// rendering an inapplicable action.
// normalizeCustomBlocks already drops any block with an unrecognized
// `type`, but the dispatch below still falls back to nothing rendered for
// one anyway, rather than assuming only 'text'/'image' can ever reach here.
const CustomBlock = ({
  cardId, field = 'blocks', block, index, canMoveUp, canMoveDown,
  onMoveUp, onMoveDown, onDuplicate, onDelete, setEditingCard,
}) => {
  const ordinal = `Block ${index + 1}`;
  const isImageBlock = block.type === CUSTOM_BLOCK_TYPES.image;

  return (
    <div className='custom-block' role='group' aria-label={ordinal}>
      <div className='custom-block-controls'>
        {canMoveUp && (
          <button
            type='button'
            className='custom-block-move-up'
            onClick={() => onMoveUp(block.id)}
            aria-label={`Move ${ordinal} up`}
          >
            <img src={ArrowUpIcon} alt='' draggable='false' />
          </button>
        )}
        {canMoveDown && (
          <button
            type='button'
            className='custom-block-move-down'
            onClick={() => onMoveDown(block.id)}
            aria-label={`Move ${ordinal} down`}
          >
            <img src={ArrowDownIcon} alt='' draggable='false' />
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
