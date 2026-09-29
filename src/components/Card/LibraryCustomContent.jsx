import React from 'react';
import { useSelector } from 'react-redux';

import { normalizeCustomBlocks, customBlockHasContent, CUSTOM_BLOCK_TYPES } from '../../constants/custom';
import { hasCardContent } from '../../constants/cards';
import CustomBlockList from './CustomBlockList';

import './Card.scss';

// Deliberately no CollapsibleSection/dots here, same as LibraryNoteContent -
// custom has no fixed sections to collapse, just an open-ended block list.
const LibraryCustomContent = ({
  cardId,
  isExpanded,
  isSelected,
  setEditingCard,
}) => {
  const content = useSelector(state => state.project.present.cards[cardId].content);
  const expanded = isSelected || isExpanded;

  // The placeholder is only for condensed browsing - once expanded/selected,
  // a freshly-created (still empty) card must fall through to the real,
  // editable block list below (same as the canvas's CustomContent), or a
  // brand new card would have no way to ever get its first block.
  if (!hasCardContent(content) && !expanded) {
    return (
      <div className='library-card-content-container' style={{ height: '80px' }}>
        <span className='library-custom-empty'>No blocks yet</span>
      </div>
    );
  }

  if (!expanded) {
    // hasCardContent being true guarantees at least one block has content.
    // A thumbnail and text aren't either/or: show the first image alongside
    // every text block's content, in block order, and let CSS clamp what
    // doesn't fit rather than stopping at the first block.
    const contentBlocks = normalizeCustomBlocks(content?.blocks).filter(customBlockHasContent);
    const firstImage = contentBlocks.find(block => block.type === CUSTOM_BLOCK_TYPES.image);
    const summaryText = contentBlocks
      .filter(block => block.type === CUSTOM_BLOCK_TYPES.text)
      .map(block => block.text.trim())
      .filter(Boolean)
      .join('\n');

    return (
      <div className='library-card-content-container library-custom-condensed' style={{ height: '80px' }}>
        {firstImage && <img className='library-custom-thumb' src={firstImage.image} alt={firstImage.alt} draggable='false' />}
        {summaryText && (
          <div className='library-custom-summary'>
            <div className='library-custom-line'>{summaryText}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className='library-card-content-container library-custom-expanded'
      style={{ minHeight: '80px', maxHeight: '60vh', height: 'auto' }}
      onDragOver={(e) => e.preventDefault()}
    >
      <CustomBlockList cardId={cardId} setEditingCard={setEditingCard} />
    </div>
  );
};

export default LibraryCustomContent;
