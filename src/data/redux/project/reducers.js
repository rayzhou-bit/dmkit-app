import { createSlice } from '@reduxjs/toolkit';
import {
  DEFAULT_CARD,
  DEFAULT_TAB,
  INTRO_PROJECT,
  BLANK_PROJECT,
} from './constants';
import { GRID_SIZE, DEFAULT_CARD_POSITION, DEFAULT_CARD_SIZE, MONSTER_CARD_SIZE, NOTE_CARD_SIZE } from '../../../constants/dimensions';
import { CARD_TYPES, getCardType, migrateLegacyTextImageCard } from '../../../constants/cards';
import {
  buildMonsterContent, MONSTER_FIELD_KEYS,
  MONSTER_ENTRY_FIELD_KEYS, MONSTER_MAX_ENTRIES_PER_SECTION, normalizeMonsterEntries,
  normalizeNotesBlocks,
} from '../../../constants/monster';
import { buildNoteContent, NOTE_FIELD_KEYS, NOTE_MAX_ENTRIES } from '../../../constants/note';
import { buildCustomContent, normalizeCustomBlocks, CUSTOM_MAX_BLOCKS, CUSTOM_BLOCK_TYPES } from '../../../constants/custom';

// TODO name refactor
//  view -> tab
//  pos -> position

const applyCardSize = (state, { id, size }) => {
  if (!state.activeViewId) return state;
  const newSize = {
    height: (Math.round(size.height.split('px').shift() / GRID_SIZE) * GRID_SIZE) + 'px',
    width: (Math.round(size.width.split('px').shift() / GRID_SIZE) * GRID_SIZE) + 'px',
  };
  return {
    ...state,
    cards: {
      ...state.cards,
      [id]: {
        ...state.cards[id],
        views: {
          ...state.cards[id].views,
          [state.activeViewId]: {
            ...state.cards[id].views[state.activeViewId],
            size: newSize,
          },
        },
      },
    },
  };
};

// Shared by the 4 entry reducers below - normalizes, hands the current
// entries to `updater`, and writes back only if it actually returned a
// different array (updater returns the SAME array reference to signal
// "no-op", e.g. an unknown field/entryId or hitting the per-section cap).
const applyMonsterEntries = (state, { id, field }, updater) => {
  const card = state.cards[id];
  if (!card || !MONSTER_ENTRY_FIELD_KEYS.includes(field)) return state;
  const entries = normalizeMonsterEntries(card.content?.[field]);
  const next = updater(entries);
  if (next === entries) return state;
  return {
    ...state,
    cards: {
      ...state.cards,
      [id]: {
        ...card,
        content: { ...card.content, [field]: next },
        editedOn: Date.now(),
      },
    },
  };
};

// Same shape as applyMonsterEntries, but note has exactly one entry
// list (content.entries) - no field/fieldKey to validate against.
const applyNoteEntries = (state, { id }, updater) => {
  const card = state.cards[id];
  if (!card) return state;
  const entries = normalizeMonsterEntries(card.content?.entries);
  const next = updater(entries);
  if (next === entries) return state;
  return {
    ...state,
    cards: {
      ...state.cards,
      [id]: {
        ...card,
        content: { ...card.content, entries: next },
        editedOn: Date.now(),
      },
    },
  };
};

// Same shape as applyNoteEntries, generalized with an optional `field`
// (default 'blocks') - this is now shared by two card types: the custom
// card's own content.blocks, and the monster card's content.notes (see
// MonsterNotes.jsx). That's a deliberate departure from this codebase's
// usual "duplicate near-identical logic per card type" convention (see
// NoteEntry vs MonsterEntry) - unlike monster's 5 entry fields (genuinely
// divergent fields of ONE card type, each independently worth allow-
// listing against typos), this is the exact same mechanism reused across
// TWO card types with zero behavioral difference. Still validated against
// a small allowlist below, same precedent as applyMonsterEntries, since
// the cost of a typo'd field is silent corruption of an unrelated content
// key either way.
//
// notes gets its own normalize (normalizeNotesBlocks, not the plain
// normalizeCustomBlocks) - content.notes predates this block shape (it
// used to be a plain string) and normalizeCustomBlocks's non-array -> []
// fallback would silently discard an old string value the first time any
// block action runs against it. content.blocks has no such legacy shape
// (custom cards never existed before this), so it stays on the plain
// normalizer.
const CUSTOM_BLOCK_FIELD_KEYS = ['blocks', 'notes'];
const applyCustomBlocks = (state, { id, field = 'blocks' }, updater) => {
  const card = state.cards[id];
  if (!card || !CUSTOM_BLOCK_FIELD_KEYS.includes(field)) return state;
  const blocks = field === 'notes' ? normalizeNotesBlocks(card.content?.notes) : normalizeCustomBlocks(card.content?.[field]);
  const next = updater(blocks);
  if (next === blocks) return state;
  return {
    ...state,
    cards: {
      ...state.cards,
      [id]: {
        ...card,
        content: { ...card.content, [field]: next },
        editedOn: Date.now(),
      },
    },
  };
};

// Runs every card in a just-loaded cards dict through
// migrateLegacyTextImageCard - a no-op for anything already monster/note/
// custom, so safe to apply unconditionally on every load (loadCards, plus
// loadIntroProject/loadBlankProject's fixture data, which predates the
// custom card type the same way real old Firestore docs do).
const migrateCards = (cards) => Object.fromEntries(
  Object.entries(cards).map(([id, card]) => [id, migrateLegacyTextImageCard(card)])
);

const initialState = {
  title: '',
  viewOrder: [],
  activeViewId: null,
  cards: {},
  views: {},
};

const project = createSlice({
  name: 'project',
  initialState,
  reducers: {
    // Actions below do not affect undo/redo.
    initialize: () => ({ ...initialState }),
    unloadProject: () => ({ ...initialState }),
    loadProject: (state, { payload }) => ({ ...state, ...payload.project }),
    loadIntroProject: () => ({ ...INTRO_PROJECT, cards: migrateCards(INTRO_PROJECT.cards) }),
    loadBlankProject: () => ({ ...BLANK_PROJECT, cards: migrateCards(BLANK_PROJECT.cards) }),
    loadCards: (state, { payload }) => ({ ...state, cards: migrateCards(payload.cards) }),
    loadTabs: (state, { payload }) => ({ ...state, views: payload.tabs }),
    setActiveTab: (state, { payload }) => ({ ...state, activeViewId: payload.id }),
    // Actions above do not affect undo/redo.

    updateProjectTitle: (state, { payload }) => ({ ...state, title: payload.title }),
    shiftTabBy: (state, { payload }) => {
      const { id, position } = payload;
      let newViewOrder = [ ...state.viewOrder ];
      const newPosition = newViewOrder.indexOf(id) + position;
      newViewOrder = newViewOrder.filter(tabId => tabId !== id);
      newViewOrder.splice(newPosition, 0, id);
      return { ...state, viewOrder: newViewOrder };
    },

    // Card reducers
    createCard: (state, { payload }) => {
      const { newId, position, size, color, title, text, type, image, alt, monster, note, custom } = payload;
      if (!state.activeViewId) return state;
      return {
        ...state,
        cards: {
          ...state.cards,
          [newId]: {
            ...DEFAULT_CARD,
            views: {
              [state.activeViewId]: {
                pos: position ?? DEFAULT_CARD_POSITION,
                size: size ?? DEFAULT_CARD_SIZE,
              },
            },
            color: color ?? DEFAULT_CARD.color,
            title: title ?? DEFAULT_CARD.title,
            type: type ?? DEFAULT_CARD.type,
            content: type === CARD_TYPES.monster ? buildMonsterContent(monster)
              : type === CARD_TYPES.note ? buildNoteContent(note)
              : type === CARD_TYPES.custom ? buildCustomContent(custom)
              : type === CARD_TYPES.image ? { image: image ?? '', alt: alt ?? '' }
              : { text: text ?? DEFAULT_CARD.content.text },
            createdOn: Date.now(),
            editedOn: Date.now(),
          },
        },
        // TODO add card list to views?
        // views: {
        //   ...state.views,
        //   [state.activeViewId]: {
        //     ...state.views[state.activeViewId],
        //     cards: [
        //       ...state.views[state.activeViewId].cards,
        //       newId,
        //     ],
        //   },
        // },
      };
    },
    destroyCard: (state, { payload }) => {
      const { id } = payload;
      let newCards = { ...state.cards };
      delete newCards[id];
      return {
        ...state,
        cards: newCards,
      };
    },
    destroyCards: (state, { payload }) => {
      const { ids } = payload;
      let newCards = { ...state.cards };
      for (const id of ids) {
        delete newCards[id];
      }
      return {
        ...state,
        cards: newCards,
      };
    },
    linkCardToView: (state, { payload }) => {
      const { id, position } = payload;
      if (!state.activeViewId) return state;
      return {
        ...state,
        cards: {
          ...state.cards,
          [id]: {
            ...state.cards[id],
            views: {
              ...state.cards[id].views,
              [state.activeViewId]: {
                pos: position,
                size: getCardType(state.cards[id]) === CARD_TYPES.monster ? MONSTER_CARD_SIZE
                  : getCardType(state.cards[id]) === CARD_TYPES.note ? NOTE_CARD_SIZE
                  : DEFAULT_CARD_SIZE,
              },
            },
          },
        },
        // views: {
        //   ...state.views,
        //   [state.activeViewId]: {
        //     ...state.views[state.activeViewId],
        //     cards: [
        //       ...state.views[state.activeViewId].cards,
        //       newCardId,
        //     ],
        //   },
        // },
      };
    },
    unlinkCardFromView: (state, { payload }) => {
      const { id } = payload;
      if (!state.activeViewId) return state;
      let newCardViews = { ...state.cards[id].views };
      delete newCardViews[state.activeViewId];
      return {
        ...state,
        cards: {
          ...state.cards,
          [id]: {
            ...state.cards[id],
            views: newCardViews,
          },
        },
      };
    },
    updateCardPosition: (state, { payload }) => {
      const { id, position } = payload;
      if (!state.activeViewId) return state;
      const newPos = {
        x: Math.round(position.x / GRID_SIZE) * GRID_SIZE,
        y: Math.round(position.y / GRID_SIZE) * GRID_SIZE,
      };
      return {
        ...state,
        cards: {
          ...state.cards,
          [id]: {
            ...state.cards[id],
            views: {
              ...state.cards[id].views,
              [state.activeViewId]: {
                ...state.cards[id].views[state.activeViewId],
                pos: newPos,
              },
            },
          },
        },
      }
    },
    moveCards: (state, { payload }) => {
      const { ids, delta } = payload;
      if (!state.activeViewId) return state;
      let newCards = { ...state.cards };
      for (const id of ids) {
        const view = newCards[id]?.views?.[state.activeViewId];
        if (!view) continue;
        const newPos = {
          x: Math.round((view.pos.x + delta.x) / GRID_SIZE) * GRID_SIZE,
          y: Math.round((view.pos.y + delta.y) / GRID_SIZE) * GRID_SIZE,
        };
        newCards[id] = {
          ...newCards[id],
          views: {
            ...newCards[id].views,
            [state.activeViewId]: { ...view, pos: newPos },
          },
        };
      }
      return { ...state, cards: newCards };
    },
    updateCardSize: (state, { payload }) => applyCardSize(state, payload),
    updateCardTitle: (state, { payload }) => {
      const { id, title } = payload;
      return {
        ...state,
        cards: {
          ...state.cards,
          [id]: {
            ...state.cards[id],
            title: title,
            editedOn: Date.now(),
          },
        },
      };
    },
    updateCardColor: (state, { payload }) => {
      const { id, color } = payload;
      return {
        ...state,
        cards: {
          ...state.cards,
          [id]: {
            ...state.cards[id],
            color: color,
            editedOn: Date.now(),
          },
        },
      };
    },
    updateCardText: (state, { payload }) => {
      const { id, text } = payload;
      return {
        ...state,
        cards: {
          ...state.cards,
          [id]: {
            ...state.cards[id],
            content: {
              ...state.cards[id].content,
              text: text,
            },
            editedOn: Date.now(),
          },
        },
      };
    },
    updateCardImage: (state, { payload }) => {
      const { id, image, alt } = payload;
      return {
        ...state,
        cards: {
          ...state.cards,
          [id]: {
            ...state.cards[id],
            content: {
              ...state.cards[id].content,
              image,
              alt,
            },
            type: CARD_TYPES.image,
            editedOn: Date.now(),
          },
        },
      };
    },
    updateCardMonsterFields: (state, { payload }) => {
      const { id, fields } = payload;
      const newContent = { ...state.cards[id].content };
      for (const key of MONSTER_FIELD_KEYS) {
        // notes is a block list now (see applyCustomBlocks/MonsterNotes.jsx),
        // not a plain string - excluded so a stray dispatch here can never
        // collapse it back into a legacy-shaped string, destroying every
        // other block.
        if (key === 'notes') continue;
        if (key in fields) newContent[key] = fields[key] ?? '';
      }
      return {
        ...state,
        cards: {
          ...state.cards,
          [id]: {
            ...state.cards[id],
            content: newContent,
            editedOn: Date.now(),
          },
        },
      };
    },
    updateCardPortrait: (state, { payload }) => {
      const { id, portrait, portraitAlt } = payload;
      return {
        ...state,
        cards: {
          ...state.cards,
          [id]: {
            ...state.cards[id],
            content: {
              ...state.cards[id].content,
              portrait,
              portraitAlt,
            },
            editedOn: Date.now(),
          },
        },
      };
    },
    // Only `description` goes through here today (entries has its own 4
    // reducers below, portrait its own action) - mirrors
    // updateCardMonsterFields' allowlist-by-NOTE_FIELD_KEYS shape so a
    // second scalar field later needs no new action, just a new key.
    updateCardNoteFields: (state, { payload }) => {
      const { id, fields } = payload;
      const newContent = { ...state.cards[id].content };
      for (const key of NOTE_FIELD_KEYS) {
        if (key in fields) newContent[key] = fields[key] ?? '';
      }
      return {
        ...state,
        cards: {
          ...state.cards,
          [id]: {
            ...state.cards[id],
            content: newContent,
            editedOn: Date.now(),
          },
        },
      };
    },
    // Monster entry-list reducers (traits/actions/bonusActions/reactions/
    // legendaryActions - each a list of {id, name, description} "boxes").
    // Ordinary undo-tracked project actions (not in index.js's
    // actionsToRemove) - add/duplicate/delete are content edits like any
    // other and should undo/redo like one. entryId/newEntryId are generated
    // by the caller (useMonsterEntryListHooks), never here, so the reducer
    // stays a pure function of its payload.
    addMonsterEntry: (state, { payload }) => applyMonsterEntries(state, payload, (entries) => {
      if (entries.length >= MONSTER_MAX_ENTRIES_PER_SECTION) return entries;
      return [...entries, { id: payload.entryId, name: '', description: '' }];
    }),
    duplicateMonsterEntry: (state, { payload }) => applyMonsterEntries(state, payload, (entries) => {
      const index = entries.findIndex(e => e.id === payload.entryId);
      if (index === -1 || entries.length >= MONSTER_MAX_ENTRIES_PER_SECTION) return entries;
      const copy = { ...entries[index], id: payload.newEntryId };
      return [...entries.slice(0, index + 1), copy, ...entries.slice(index + 1)];
    }),
    deleteMonsterEntry: (state, { payload }) => applyMonsterEntries(state, payload, (entries) => {
      const next = entries.filter(e => e.id !== payload.entryId);
      return next.length === entries.length ? entries : next;
    }),
    updateMonsterEntry: (state, { payload }) => applyMonsterEntries(state, payload, (entries) => {
      const index = entries.findIndex(e => e.id === payload.entryId);
      if (index === -1) return entries;
      const { changes } = payload;
      const next = [...entries];
      next[index] = {
        ...next[index],
        ...('name' in changes ? { name: String(changes.name ?? '') } : {}),
        ...('description' in changes ? { description: String(changes.description ?? '') } : {}),
      };
      return next;
    }),
    // Note's single entry list (content.entries) - same shape as the
    // monster entry reducers above, minus the field/fieldKey concept (only
    // ever one list, so nothing to select between).
    addNoteEntry: (state, { payload }) => applyNoteEntries(state, payload, (entries) => {
      if (entries.length >= NOTE_MAX_ENTRIES) return entries;
      return [...entries, { id: payload.entryId, name: '', description: '' }];
    }),
    duplicateNoteEntry: (state, { payload }) => applyNoteEntries(state, payload, (entries) => {
      const index = entries.findIndex(e => e.id === payload.entryId);
      if (index === -1 || entries.length >= NOTE_MAX_ENTRIES) return entries;
      const copy = { ...entries[index], id: payload.newEntryId };
      return [...entries.slice(0, index + 1), copy, ...entries.slice(index + 1)];
    }),
    deleteNoteEntry: (state, { payload }) => applyNoteEntries(state, payload, (entries) => {
      const next = entries.filter(e => e.id !== payload.entryId);
      return next.length === entries.length ? entries : next;
    }),
    updateNoteEntry: (state, { payload }) => applyNoteEntries(state, payload, (entries) => {
      const index = entries.findIndex(e => e.id === payload.entryId);
      if (index === -1) return entries;
      const { changes } = payload;
      const next = [...entries];
      next[index] = {
        ...next[index],
        ...('name' in changes ? { name: String(changes.name ?? '') } : {}),
        ...('description' in changes ? { description: String(changes.description ?? '') } : {}),
      };
      return next;
    }),
    // Custom card's single blocks list (content.blocks) - a freely mixed
    // sequence of text/image blocks, same shape as the note entry reducers
    // above. add/duplicate/delete are type-agnostic (a block carries its
    // own `type`); the two update reducers are each scoped to one type so
    // a stale/mistargeted dispatch against the wrong block type is a no-op
    // rather than corrupting a block's shape - and neither one ever
    // touches the card's own `type` (unlike updateCardImage, which the
    // plain image card's hook uses and which stamps `type: 'image'` on
    // every write - custom blocks are deliberately NOT routed through
    // that action; see useCustomImageBlockHooks).
    addCustomBlock: (state, { payload }) => applyCustomBlocks(state, payload, (blocks) => {
      if (blocks.length >= CUSTOM_MAX_BLOCKS) return blocks;
      const newBlock = payload.blockType === CUSTOM_BLOCK_TYPES.image
        ? { id: payload.blockId, type: CUSTOM_BLOCK_TYPES.image, text: '', image: '', alt: '' }
        : { id: payload.blockId, type: CUSTOM_BLOCK_TYPES.text, text: '', image: '', alt: '' };
      return [...blocks, newBlock];
    }),
    duplicateCustomBlock: (state, { payload }) => applyCustomBlocks(state, payload, (blocks) => {
      const index = blocks.findIndex(b => b.id === payload.blockId);
      if (index === -1 || blocks.length >= CUSTOM_MAX_BLOCKS) return blocks;
      const copy = { ...blocks[index], id: payload.newBlockId };
      return [...blocks.slice(0, index + 1), copy, ...blocks.slice(index + 1)];
    }),
    deleteCustomBlock: (state, { payload }) => applyCustomBlocks(state, payload, (blocks) => {
      const next = blocks.filter(b => b.id !== payload.blockId);
      return next.length === blocks.length ? blocks : next;
    }),
    // direction: 'up' or 'down'. No-ops (same reference) for an unknown
    // blockId or a block already at that end of the list, same as
    // duplicate/delete's out-of-range guards.
    moveCustomBlock: (state, { payload }) => applyCustomBlocks(state, payload, (blocks) => {
      const index = blocks.findIndex(b => b.id === payload.blockId);
      const target = index + (payload.direction === 'up' ? -1 : 1);
      if (index === -1 || target < 0 || target >= blocks.length) return blocks;
      const next = [...blocks];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    }),
    updateCustomTextBlock: (state, { payload }) => applyCustomBlocks(state, payload, (blocks) => {
      const index = blocks.findIndex(b => b.id === payload.blockId && b.type === CUSTOM_BLOCK_TYPES.text);
      if (index === -1) return blocks;
      const next = [...blocks];
      next[index] = { ...next[index], text: String(payload.text ?? '') };
      return next;
    }),
    updateCustomImageBlock: (state, { payload }) => applyCustomBlocks(state, payload, (blocks) => {
      const index = blocks.findIndex(b => b.id === payload.blockId && b.type === CUSTOM_BLOCK_TYPES.image);
      if (index === -1) return blocks;
      const next = [...blocks];
      next[index] = { ...next[index], image: payload.image, alt: payload.alt };
      return next;
    }),
    // Tab reducers
    createTab: (state, { payload }) => {
      const { newId } = payload;
      let newViewOrder = [ ...state.viewOrder ];
      const pos = state.activeViewId ? newViewOrder.indexOf(state.activeViewId) + 1 : 0;
      newViewOrder.splice(pos, 0, newId);
      return {
        ...state,
        viewOrder: newViewOrder,
        views: {
          ...state.views,
          [newId]: DEFAULT_TAB,
        },
      };
    },
    destroyTab: (state, { payload }) => {
      const { id } = payload;
      let newViews = { ...state.views };
      delete newViews[id];
      const newViewOrder = [ ...state.viewOrder ].filter(tabId => tabId !== id);
      let newActiveViewId = state.activeViewId;
      if (id === state.activeViewId) {
        newActiveViewId = (newViewOrder.length > 0) ? newViewOrder[0] : null;
      }
      // Cascade: strip this tab from every card's placement map too, or
      // cards accumulate dangling references to a tab that no longer exists.
      let newCards = {};
      for (let cardId in state.cards) {
        const card = state.cards[cardId];
        if (card.views && id in card.views) {
          const newCardViews = { ...card.views };
          delete newCardViews[id];
          newCards[cardId] = { ...card, views: newCardViews };
        } else {
          newCards[cardId] = card;
        }
      }
      return {
        ...state,
        activeViewId: newActiveViewId,
        viewOrder: newViewOrder,
        views: newViews,
        cards: newCards,
      };
    },
    updateTabTitle: (state, { payload }) => {
      const { id, title } = payload;
      return {
        ...state,
        views: {
          ...state.views,
          [id]: {
            ...state.views[id],
            title: title,
            editedOn: Date.now(),
          },
        },
      };
    },
    setActiveTabPosition: (state, { payload }) => {
      const { position } = payload;
      if (!state.activeViewId) return state;
      return {
        ...state,
        views: {
          ...state.views,
          [state.activeViewId]: {
            ...state.views[state.activeViewId],
            pos: position,
          },
        },
      };
    },
    setActiveTabScale: (state, { payload }) => {
      // does not affect undo/redo
      const { scale } = payload;
      if (!state.activeViewId) return state;
      return {
        ...state,
        views: {
          ...state.views,
          [state.activeViewId]: {
            ...state.views[state.activeViewId],
            scale: scale,
          },
        },
      };
    },
  },
});

const actions = project.actions;

const { reducer } = project;

export {
  actions,
  initialState,
  reducer,
};
