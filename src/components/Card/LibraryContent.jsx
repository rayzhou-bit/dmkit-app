import React from 'react';

import { useCardType } from './hooks';
import { CARD_TYPES } from '../../constants/cards';

import LibraryTextContent from './LibraryTextContent';
import LibraryImageContent from './LibraryImageContent';
import LibraryMonsterContent from './LibraryMonsterContent';
import LibraryNoteContent from './LibraryNoteContent';
import LibraryCustomContent from './LibraryCustomContent';

const LibraryContent = ({
  cardId,
  isExpanded,
  isSelected,
  setEditingCard,
}) => {
  const cardType = useCardType(cardId);

  if (cardType === CARD_TYPES.monster) {
    return <LibraryMonsterContent cardId={cardId} isExpanded={isExpanded} isSelected={isSelected} setEditingCard={setEditingCard} />;
  }
  if (cardType === CARD_TYPES.note) {
    return <LibraryNoteContent cardId={cardId} isExpanded={isExpanded} isSelected={isSelected} setEditingCard={setEditingCard} />;
  }
  if (cardType === CARD_TYPES.custom) {
    return <LibraryCustomContent cardId={cardId} isExpanded={isExpanded} isSelected={isSelected} setEditingCard={setEditingCard} />;
  }
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
