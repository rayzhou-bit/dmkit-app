import { MONSTER_FIELD_KEYS, monsterFieldHasContent } from './monster';
import { locationHasContent } from './location';

import MonsterIconDark from '../assets/icons/monster-icon.svg';
import MonsterIconLight from '../assets/icons/monster-icon-white.svg';
import LocationIconDark from '../assets/icons/location-icon.svg';
import LocationIconLight from '../assets/icons/location-icon-white.svg';

export const CARD_TYPES = {
  text: 'text',
  image: 'image',
  monster: 'monster',
  location: 'location',
};

// Title-bar type badge (Title.jsx/LibraryTitle.jsx) - darkIcon for a light
// card color (isLightColor true), lightIcon for a dark one, same pairing
// the color/dropdown-arrow buttons already use. text/image have no badge.
export const CARD_TYPE_ICONS = {
  [CARD_TYPES.monster]: { darkIcon: MonsterIconDark, lightIcon: MonsterIconLight, label: 'Monster stat block' },
  [CARD_TYPES.location]: { darkIcon: LocationIconDark, lightIcon: LocationIconLight, label: 'Location' },
};

// Explicit `type` wins; legacy cards (no `type`) infer from content shape.
// location never needs legacy inference - it never existed without an
// explicit `type`, unlike monster/image which predate this field.
export const getCardType = (card) => {
  if (card?.type === CARD_TYPES.monster) return CARD_TYPES.monster;
  if (card?.type === CARD_TYPES.image) return CARD_TYPES.image;
  if (card?.type === CARD_TYPES.location) return CARD_TYPES.location;
  if (card?.type === CARD_TYPES.text) return CARD_TYPES.text;
  if (card?.content && 'armorClass' in card.content) return CARD_TYPES.monster;
  return card?.content?.image ? CARD_TYPES.image : CARD_TYPES.text;
};

// Shared by the delete-confirmation checks (card options dropdowns, ToolMenu).
export const hasCardContent = (content) => {
  if (content?.text?.length) return true;
  if (content?.image) return true;
  if (locationHasContent(content)) return true;
  return MONSTER_FIELD_KEYS.some(key => monsterFieldHasContent(content, key));
};
