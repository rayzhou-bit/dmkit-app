import { createSlice } from '@reduxjs/toolkit';
import {
  DEFAULT_CARD,
  DEFAULT_TAB,
  INTRO_PROJECT,
  BLANK_PROJECT,
} from './constants';
import { GRID_SIZE, NEW_CARD_SIZE } from '../../../constants/dimensions';

// TODO name refactor
//  view -> tab
//  pos -> position

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

    createCard: (state, { payload }) => {
      const { newId, position } = payload;
      if (!state.activeViewId) return state;
      return {
        ...state,
        cards: {
          ...state.cards,
          [newId]: {
            ...DEFAULT_CARD,
            views: {
              [state.activeViewId]: {
                pos: position,
                size: NEW_CARD_SIZE,
              }
            },
          },
        },
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
    copyCard: (state, { payload }) => {
      const { id, newId } = payload;
      if (!state.activeViewId) return state;
      return {
        ...state,
        cards: {
          ...state.cards,
          [newId]: {
            ...state.cards[id],
            title: state.cards[id].title + ' (copy)',
            views: {
              [state.activeViewId]: {
                ...state.cards[id].views[state.activeViewId],
                pos: {
                  x: state.cards[id].views[state.activeViewId].pos.x + 2*GRID_SIZE,
                  y: state.cards[id].views[state.activeViewId].pos.y + 3*GRID_SIZE,
                },
              },
            },
            createdOn: Date.now(),
            editedOn: Date.now(),
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
    destroyCard: (state, { payload }) => {
      const { id } = payload;
      let newCards = { ...state.cards };
      delete newCards[id];
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
                size: NEW_CARD_SIZE,
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
    updateCardSize: (state, { payload }) => {
      const { id, size } = payload;
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
      return {
        ...state,
        activeViewId: newActiveViewId,
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
