import React from 'react';
import { useSelector } from 'react-redux';

import './Card.scss';

// Read-only preview - no upload/replace from the library.
const LibraryImageContent = ({
  cardId,
  isExpanded,
  isSelected,
}) => {
  const image = useSelector(state => state.project.present.cards[cardId].content?.image ?? '');
  const alt = useSelector(state => state.project.present.cards[cardId].content?.alt ?? '');
  const expanded = isSelected || isExpanded;

  const condensedStyle = { height: '80px' };
  const expandedStyle = { height: '220px' };

  return (
    <div
      className='library-card-content-container'
      style={expanded ? expandedStyle : condensedStyle}
    >
      {image ? (
        <img
          className={'library-card-image' + (expanded ? ' selected' : '')}
          src={image}
          alt={alt}
          draggable='false'
        />
      ) : (
        <span className='library-image-empty'>No image</span>
      )}
    </div>
  );
};

export default LibraryImageContent;
