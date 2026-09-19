import { MONSTER_FIELD_KEYS, monsterFieldHasContent } from './monster';

export const CARD_TYPES = {
  text: 'text',
  image: 'image',
  monster: 'monster',
};

// Explicit `type` wins; legacy cards (no `type`) infer from content shape.
export const getCardType = (card) => {
  if (card?.type === CARD_TYPES.monster) return CARD_TYPES.monster;
  if (card?.type === CARD_TYPES.image) return CARD_TYPES.image;
  if (card?.type === CARD_TYPES.text) return CARD_TYPES.text;
  if (card?.content && 'armorClass' in card.content) return CARD_TYPES.monster;
  return card?.content?.image ? CARD_TYPES.image : CARD_TYPES.text;
};

// Shared by the delete-confirmation checks (card options dropdowns, ToolMenu).
export const hasCardContent = (content) => {
  if (content?.text?.length) return true;
  if (content?.image) return true;
  return MONSTER_FIELD_KEYS.some(key => monsterFieldHasContent(content, key));
};
