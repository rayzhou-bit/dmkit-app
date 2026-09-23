import React, { useRef } from 'react';
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
  const contentRef = useRef(null);

  if (!hasCardContent(content)) {
    return (
      <div className='library-card-content-container' style={{ height: '80px' }}>
        <span className='library-custom-empty'>No blocks yet</span>
      </div>
    );
  }

  if (!expanded) {
    // hasCardContent being true guarantees at least one block has content -
    // show whichever comes first (text -> a truncated line, image -> a thumbnail).
    const firstContentBlock = normalizeCustomBlocks(content?.blocks).find(customBlockHasContent);

    return (
      <div className='library-card-content-container library-custom-condensed' style={{ height: '80px' }}>
        {firstContentBlock?.type === CUSTOM_BLOCK_TYPES.image ? (
          <img className='library-custom-thumb' src={firstContentBlock.image} alt={firstContentBlock.alt} draggable='false' />
        ) : (
          <div className='library-custom-summary'>
            <div className='library-custom-line'>{firstContentBlock?.text}</div>
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
      ref={contentRef}
      tabIndex={-1}
    >
      <CustomBlockList cardId={cardId} setEditingCard={setEditingCard} focusFallbackRef={contentRef} />
    </div>
  );
};

export default LibraryCustomContent;
