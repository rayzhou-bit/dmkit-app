import React from 'react';

import { useCardType } from './hooks';
import { CARD_TYPES } from '../../constants/cards';

import LibraryTextContent from './LibraryTextContent';
import LibraryImageContent from './LibraryImageContent';

const LibraryContent = ({
  cardId,
  isExpanded,
  isSelected,
  setEditingCard,
}) => {
  const cardType = useCardType(cardId);

  if (cardType === CARD_TYPES.image) {
    return <LibraryImageContent cardId={cardId} isExpanded={isExpanded} isSelected={isSelected} />;
  }
  return (
    <LibraryTextContent
      cardId={cardId}
      isExpanded={isExpanded}
      isSelected={isSelected}
      setEditingCard={setEditingCard}
    />
  );
};

export default LibraryContent;
