import React from 'react';

import { useCardType } from './hooks';
import { CARD_TYPES } from '../../constants/cards';

import TextContent from './TextContent';
import ImageContent from './ImageContent';
import MonsterContent from './MonsterContent';
import LocationContent from './LocationContent';

const Content = ({
  cardId,
  setEditingCard,
}) => {
  const cardType = useCardType(cardId);

  if (cardType === CARD_TYPES.monster) {
    return <MonsterContent cardId={cardId} />;
  }
  if (cardType === CARD_TYPES.location) {
    return <LocationContent cardId={cardId} />;
  }
  if (cardType === CARD_TYPES.image) {
    return <ImageContent cardId={cardId} />;
  }
  return <TextContent cardId={cardId} setEditingCard={setEditingCard} />;
};

export default Content;
