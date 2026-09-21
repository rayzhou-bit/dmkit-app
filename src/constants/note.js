// Field metadata for the note card type - deliberately much smaller
// than monster.js's: one freeform description + one open-ended entry list,
// no fixed sections. See constants/cards.js for how a card's type/content
// funnel through getCardType/hasCardContent.

import { normalizeMonsterEntries, entryHasContent } from './monster';

export const NOTE_ENTRY_NAME_MAX_LENGTH = 120;
export const NOTE_ENTRY_TEXT_MAX_LENGTH = 1000;
// Mirrors MONSTER_MAX_ENTRIES_PER_SECTION's Firestore-budget reasoning -
// one list here instead of five, so the same per-list cap leaves even more
// headroom under the 1MB doc limit.
export const NOTE_MAX_ENTRIES = 50;

// singular/namePlaceholder/textPlaceholder drive NoteEntry's per-entry
// labels/placeholders, same shape as monster's entry fields (see
// MONSTER_FIELDS). description has no maxLength - freeform like the plain
// text card, not budget-capped like the fixed-shape monster fields.
export const NOTE_FIELDS = {
  description: { label: 'Description', placeholder: "What's this about? Jot down anything worth remembering.", multiline: true },
  entries: { label: 'Details', singular: 'Detail', namePlaceholder: 'Detail name', textPlaceholder: 'What should you remember about it?' },
};

export const NOTE_FIELD_KEYS = ['portrait', 'portraitAlt', 'description', 'entries'];

// The one funnel every write path (createCard, copySelectedCard(s)) goes
// through, so a field can never land as undefined/null in the store, and
// entries always land as a fresh, normalized array (never shared, never
// the raw/possibly-legacy source value). Always returns a fresh object.
export const buildNoteContent = (source) => ({
  portrait: String(source?.portrait ?? ''),
  portraitAlt: String(source?.portraitAlt ?? ''),
  description: String(source?.description ?? ''),
  entries: normalizeMonsterEntries(source?.entries),
});

// content?.portrait is checked directly (not via a generic field loop) -
// there's only 4 keys here, not worth the indirection monster's
// monsterFieldHasContent needs for its 20+ fields.
export const noteHasContent = (content) => {
  if (content?.portrait) return true;
  if (content?.description?.trim()) return true;
  return normalizeMonsterEntries(content?.entries).some(entryHasContent);
};
