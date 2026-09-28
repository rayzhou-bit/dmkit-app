import { MONSTER_FIELD_KEYS, monsterFieldHasContent } from './monster';
import { noteHasContent } from './note';
import { customHasContent, buildCustomContent, CUSTOM_BLOCK_TYPES } from './custom';

import MonsterIconDark from '../assets/icons/monster-icon.svg';
import MonsterIconLight from '../assets/icons/monster-icon-white.svg';
import NoteIconDark from '../assets/icons/note-icon.svg';
import NoteIconLight from '../assets/icons/note-icon-white.svg';
import CustomIconDark from '../assets/icons/custom-icon.svg';
import CustomIconLight from '../assets/icons/custom-icon-white.svg';

export const CARD_TYPES = {
  text: 'text',
  image: 'image',
  monster: 'monster',
  note: 'note',
  custom: 'custom',
};

// Title-bar type badge (Title.jsx/LibraryTitle.jsx) - darkIcon for a light
// card color (isLightColor true), lightIcon for a dark one, same pairing
// the color/dropdown-arrow buttons already use. text/image have no badge.
export const CARD_TYPE_ICONS = {
  [CARD_TYPES.monster]: { darkIcon: MonsterIconDark, lightIcon: MonsterIconLight, label: 'Monster stat block' },
  [CARD_TYPES.note]: { darkIcon: NoteIconDark, lightIcon: NoteIconLight, label: 'Note' },
  [CARD_TYPES.custom]: { darkIcon: CustomIconDark, lightIcon: CustomIconLight, label: 'Freeform' },
};

// Explicit `type` wins; legacy cards (no `type`) infer from content shape.
// note/custom never need legacy inference - neither ever existed without
// an explicit `type`, unlike monster/image which predate this field.
export const getCardType = (card) => {
  if (card?.type === CARD_TYPES.monster) return CARD_TYPES.monster;
  if (card?.type === CARD_TYPES.image) return CARD_TYPES.image;
  if (card?.type === CARD_TYPES.note) return CARD_TYPES.note;
  if (card?.type === CARD_TYPES.custom) return CARD_TYPES.custom;
  if (card?.type === CARD_TYPES.text) return CARD_TYPES.text;
  if (card?.content && 'armorClass' in card.content) return CARD_TYPES.monster;
  return card?.content?.image ? CARD_TYPES.image : CARD_TYPES.text;
};

// Shared by the delete-confirmation checks (card options dropdowns, ToolMenu).
export const hasCardContent = (content) => {
  if (content?.text?.length) return true;
  if (content?.image) return true;
  if (noteHasContent(content)) return true;
  if (customHasContent(content)) return true;
  return MONSTER_FIELD_KEYS.some(key => monsterFieldHasContent(content, key));
};

// The custom card type is the successor to text/image (see ToolMenu -
// neither has a creation button anymore); this converts a card still in
// one of those two shapes into a real custom card, one block holding its
// old content. Idempotent and a pure pass-through (same reference, no new
// object) for every other type, including a card that's already been
// migrated - safe to run unconditionally on every load, not just once.
// Applied at every load path that can hand back old data: loadCards'
// reducer (real Firestore docs) and loadIntroProject/loadBlankProject's
// (the tutorial fixture, which predates the custom card type too).
export const migrateLegacyTextImageCard = (card) => {
  const type = getCardType(card);
  if (type !== CARD_TYPES.text && type !== CARD_TYPES.image) return card;

  const blocks = type === CARD_TYPES.image
    ? (card?.content?.image ? [{ id: 'legacy', type: CUSTOM_BLOCK_TYPES.image, image: card.content.image, alt: card.content?.alt ?? '' }] : [])
    : (card?.content?.text ? [{ id: 'legacy', type: CUSTOM_BLOCK_TYPES.text, text: card.content.text }] : []);

  return {
    ...card,
    type: CARD_TYPES.custom,
    content: buildCustomContent({ blocks }),
  };
};
