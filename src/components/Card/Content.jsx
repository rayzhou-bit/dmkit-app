import React from 'react';

import { useCardType } from './hooks';
import { CARD_TYPES } from '../../constants/cards';

import TextContent from './TextContent';
import ImageContent from './ImageContent';

const Content = ({
  cardId,
  setEditingCard,
}) => {
  const cardType = useCardType(cardId);

  if (cardType === CARD_TYPES.image) {
    return <ImageContent cardId={cardId} />;
  }
  return <TextContent cardId={cardId} setEditingCard={setEditingCard} />;
};

export default Content;
