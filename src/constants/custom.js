// Field metadata for the custom card type - an open-ended, ordered list of
// blocks, each independently a freeform text block or an image block. No
// fixed shape at all (unlike monster/note) - this is the direct successor
// to the plain text/image cards, generalized into "add as many of either as
// you want." See constants/cards.js for how a card's type/content funnel
// through getCardType/hasCardContent.

export const CUSTOM_BLOCK_TYPES = { text: 'text', image: 'image' };

// Internal sanity cap, not a surfaced UX limit - mirrors
// NOTE_MAX_ENTRIES/MONSTER_MAX_ENTRIES_PER_SECTION's Firestore-budget
// reasoning. One combined cap across both block types (not per-type),
// same as note's single entry list.
export const CUSTOM_MAX_BLOCKS = 50;

// Always a FRESH array (never the same reference twice), like
// normalizeMonsterEntries - buildCustomContent relies on this so cards
// never share one mutable array. Drops anything with an unrecognized
// `type` (not just malformed objects) - CustomBlock.jsx's type-dispatch
// has nowhere safe to route a block type it doesn't know, so that's
// filtered here rather than handled ad hoc at render time. Coerces every
// field regardless of type (not conditional inclusion) so a block never
// round-trips through JSON with a missing key - same lossless invariant
// buildNoteContent/buildMonsterContent's tests check.
export const normalizeCustomBlocks = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .filter(block => block && typeof block === 'object' && Object.values(CUSTOM_BLOCK_TYPES).includes(block.type))
    .map(block => ({
      id: String(block.id ?? ''),
      type: block.type,
      text: String(block.text ?? ''),
      image: String(block.image ?? ''),
      alt: String(block.alt ?? ''),
    }));
};

export const customBlockHasContent = (block) => block.type === CUSTOM_BLOCK_TYPES.image
  ? Boolean(block.image)
  : Boolean(block.text.trim());

// The one funnel every write path (createCard, copySelectedCard(s)) goes
// through, so a card never lands with a raw/possibly-malformed blocks
// value in the store. Always returns a fresh object.
export const buildCustomContent = (source) => ({
  blocks: normalizeCustomBlocks(source?.blocks),
});

export const customHasContent = (content) => normalizeCustomBlocks(content?.blocks).some(customBlockHasContent);
