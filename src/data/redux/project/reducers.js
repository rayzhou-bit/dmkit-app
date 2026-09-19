import { createSlice } from '@reduxjs/toolkit';
import {
  DEFAULT_CARD,
  DEFAULT_TAB,
  INTRO_PROJECT,
  BLANK_PROJECT,
} from './constants';
import { GRID_SIZE, DEFAULT_CARD_POSITION, DEFAULT_CARD_SIZE, MONSTER_CARD_SIZE } from '../../../constants/dimensions';
import { CARD_TYPES, getCardType } from '../../../constants/cards';
import { buildMonsterContent, MONSTER_FIELD_KEYS } from '../../../constants/monster';

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
    loadIntroProject: () => ({ ...INTRO_PROJECT }),
    loadBlankProject: () => ({ ...BLANK_PROJECT }),
    loadCards: (state, { payload }) => ({ ...state, cards: payload.cards }),
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
      const { newId, position, size, color, title, text, type, image, alt, monster } = payload;
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
                size: getCardType(state.cards[id]) === CARD_TYPES.monster ? MONSTER_CARD_SIZE : DEFAULT_CARD_SIZE,
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
