export const CARD_TYPES = {
  text: 'text',
  image: 'image',
};

// Explicit `type` wins; legacy cards (no `type`) infer from content shape.
export const getCardType = (card) => {
  if (card?.type === CARD_TYPES.image) return CARD_TYPES.image;
  if (card?.type === CARD_TYPES.text) return CARD_TYPES.text;
  return card?.content?.image ? CARD_TYPES.image : CARD_TYPES.text;
};
