import { createSlice } from '@reduxjs/toolkit';
import {
  DEFAULT_CARD_POSITION,
  DEFAULT_CARD_SIZE,
  DEFAULT_CARD,
  DEFAULT_TAB,
  INTRO_PROJECT,
} from './constants';
import { GRID } from '../../../styles/constants';
import { v4 as uuidv4 } from 'uuid';

// TODO future name refactor
//  view -> tab
//  pos -> position

const initialState = {
  title: '',
  viewOrder: [],
  activeCardId: null,
  activeViewId: null,
  cards: {},
  tabs: {},
};

const generateUID = (prefix) => (prefix + uuidv4().slice(0, 8));

const project = createSlice({
  name: 'project',
  initialState,
  reducers: {
    initialize: () => ({ ...initialState }),
    loadProject: (state, { payload }) => ({ ...payload }),
    loadIntroProject: () => ({ ...INTRO_PROJECT }),
    updateProjectTitle: (state, { payload }) => ({ ...state, title: payload.title }),
    updateActiveCard: (state, { payload }) => ({ ...state, activeCardId: payload.id }),
    updateActiveTab: (state, { payload }) => ({ ...state, activeViewId: payload.id }),
    shiftTabBy: (state, { payload }) => {
      const { id, position } = payload;
      let newViewOrder = [ ...state.viewOrder ];
      const newPosition = newViewOrder.indexOf(id) + position;
      newViewOrder = newViewOrder.filter(tabId => tabId !== id);
      newViewOrder.splice(newPosition, 0, id);
      return { ...state, viewOrder: newViewOrder };
    },

    createCard: (state) => {
      if (!state.activeViewId) return state;
      const newCardId = generateUID('card');
      return {
        ...state,
        activeCardId: newCardId,
        cards: {
          ...state.cards,
          [newCardId]: {
            ...DEFAULT_CARD,
            views: {
              [state.activeViewId]: {
                pos: DEFAULT_CARD_POSITION,
                size: DEFAULT_CARD_SIZE,
              }
            }
          },
        },
      };
    },
    copyCard: (state, { payload }) => {
      if (!state.activeViewId) return state;
      const newCardId = generateUID('card');
      return {
        ...state,
        activeCardId: newCardId,
        cards: {
          ...state.cards,
          [newCardId]: {
            ...state.cards[payload.id],
            views: {
              [state.activeViewId]: {
                ...state.cards[payload.id].views[state.activeViewId],
                pos: {
                  x: state.cards[payload.id].views[state.activeViewId].pos.x + GRID.size,
                  y: state.cards[payload.id].views[state.activeViewId].pos.y + GRID.size,
                },
              },
            },
          },
        },
      };
    },
    destroyCard: (state, { payload }) => {
      let newCards = { ...state.cards };
      delete newCards[payload.id];
      return {
        ...state,
        activeCardId: (payload.id === state.activeCardId) ? null : state.activeCardId,
        cards: newCards,
      };
    },
    linkCardToView: (state, { payload }) => {
      if (!state.activeViewId) return state;
      const { id, position } = payload;
      return {
        ...state,
        activeCardId: id,
        cards: {
          ...state.cards,
          [id]: {
            ...state.cards[id],
            views: {
              ...state.cards[id].views,
              [state.activeViewId]: {
                pos: position,
                size: DEFAULT_CARD_SIZE,
              },
            },
          },
        },
      };
    },
    unlinkCardFromView: (state, { payload }) => {
      if (!state.activeViewId) return state;
      let newCardViews = { ...state.cards[payload.id].views };
      delete newCardViews[state.activeViewId];
      return {
        ...state,
        activeCardId: null,
        cards: {
          ...state.cards,
          [payload.id]: {
            ...state.cards[payload.id],
            views: newCardViews,
          },
        },
      };
    },
    updateCardPosition: (state, { payload }) => {
      if (!state.activeViewId) return state;
      const { id, position } = payload;
      const newPos = {
        x: Math.round(position.x / GRID.size) * GRID.size,
        y: Math.round(position.y / GRID.size) * GRID.size,
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
    updateCardSize: (state, { payload }) => {
      if (!state.activeViewId) return state;
      const { id, size } = payload;
      const newSize = {
        height: (Math.round(size.height.split('px').shift() / GRID.size) * GRID.size) + 'px',
        width: (Math.round(size.width.split('px').shift() / GRID.size) * GRID.size) + 'px',
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
    },
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

    createTab: (state) => {
      const newViewId = generateUID('tab');
      let newViewOrder = [ ...state.viewOrder ];
      const pos = state.activeViewId ? newViewOrder.indexOf(state.activeViewId) + 1 : 0;
      newViewOrder.splice(pos, 0, newViewId);
      return {
        ...state,
        activeViewId: newViewId,
        viewOrder: newViewOrder,
        views: {
          ...state.views,
          [newViewId]: DEFAULT_TAB,
        },
      };
    },
    destroyTab: (state, { payload }) => {
      let newViews = { ...state.views };
      delete newViews[payload.id];
      const newViewOrder = [ ...state.viewOrder ].filter(tabId => tabId !== payload.id);
      return {
        ...state,
        activeViewId: (payload.id === state.activeViewId) ? null : state.activeViewId,
        viewOrder: newViewOrder,
        views: newViews,
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
    updateActiveTabPosition: (state, { payload }) => {
      if (!state.activeViewId) return state;
      return {
        ...state,
        views: {
          ...state.views,
          [state.activeViewId]: {
            ...state.views[state.activeViewId],
            pos: payload.position,
          },
        },
      };
    },
    updateActiveTabScale: (state, { payload }) => {
      if (!state.activeViewId) return state;
      return {
        ...state,
        views: {
          ...state.views,
          [state.activeViewId]: {
            ...state.views[state.activeViewId],
            scale: payload.scale,
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
