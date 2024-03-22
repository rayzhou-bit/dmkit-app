import { createSlice } from '@reduxjs/toolkit';
import { GRID } from '../../shared/constants';

// The campaignData reducer mirrors the campaign data structure on firebase

const initialState = {
  activeViewId: '',
  cardCreateCnt: null,
  cards: {},
  title: '',
  viewCreateCnt: null,
  viewOrder: [],
  views: {},
};

// INTRO CAMPAIGN STATE
const introCampaign = {
  title: "DM Kit",
  activeCardId: null,
  activeViewId: "view0",
  viewOrder: ["view0", "view1"],
  cardCreateCnt: 4,
  viewCreateCnt: 2,
  cards: {
    card0: {
      views: {
        view0: {
          pos: {x: 5*GRID.size, y: 7*GRID.size},
          size: {width: 16*GRID.size, height: 10*GRID.size},
          cardForm: "card",
        },
      },
      title: "Greetings Traveler!",
      color: "jungle",
      content: {
        text: "Welcome to DM Kit, a tool to help plan your next adventure. Take a look at the READ ME tab for more information on functions. If you would like to save your work, please create an account!",
      },
    },
    card1: {
      views: {
        view1: {
          pos: {x: 0, y: 0},
          size: {width: 8*GRID.size, height: 9*GRID.size},
          cardForm: "card",
        },
      },
      title: "Tools",
      color: "cotton_blue",
      content: {
        text: "Use the buttons to build your project. You can add cards, copy cards, reset the board position. You can also save your progress, but you must first create an account.",
      },
    },
    card2: {
      views: {
        view1: {
          pos: {x: 4*GRID.size, y: 20*GRID.size},
          size: {width: 10*GRID.size, height: 5*GRID.size},
          cardForm: "card",
        },
      },
      title: "Tabs",
      color: "cobalt",
      content: {
        text: "Use the buttons below to add tabs and switch between them.",
      },
    },
    card3: {
      views: {
        view1: {
          pos: {x: 25*GRID.size, y: 3*GRID.size},
          size: {width: 10*GRID.size, height: 10*GRID.size},
          cardForm: "card",
        },
      },
      title: "Library",
      color: "lavender",
      content: {
        text: "All the cards you create are stored in the library, which you can access by clicking the book to the right. The same card can be placed in multiple views and edited from multiple places.",
      },
    },
  },
  views: {
    view0: {
      pos: { x: 0, y: 0 },
      scale: 1,
      lock: true,
      color: "green",
      title: "Welcome!",
    },
    view1: {
      pos: { x: 0, y: 0 },
      scale: 1,
      lock: true,
      color: "blue",
      title: "READ ME",
    },
  },
};

const campaign = createSlice({
  name: 'campaign',
  initialState,
  reducers: {
    loadCampaignData: ({ campaignData }) => ({ campaignData }),
    unloadCampaignData: () => ({}),
    loadIntroCampaign: () => ({ ...introCampaign }),
    updCampaignTitle: (state, { title }) => ({ ...state, title }),
    updActiveViewId: (state, { activeViewId }) => ({ ...state, activeViewId }),
    shiftViewInViewOrder: (state, { shiftedViewId, posShift }) => {
      let newViewOrder = [ ...state.viewOrder ];
      const newPos = newViewOrder.indexOf(shiftedViewId) + posShift;
      newViewOrder = newViewOrder.filter(id => id !== shiftedViewId);
      newViewOrder = newViewOrder.splice(newPos, 0, shiftedViewId);
      return { ...state, viewOrder: newViewOrder };
    },
    createCard: (state) => {
      if (!state.activeViewId) return state;
      const newCardId = 'card' + state.cardCreateCnt;
      return {
        ...state,
        activeCardId: newCardId,
        cardCreateCnt: state.cardCreateCnt + 1,
        cards: {
          ...state.cards,
          [newCardId]: {
            views: {
              [state.activeViewId]: {
                pos: { x: 3 * GRID.size, y: 3 * GRID.size },
                size: { width: 8 * GRID.size, height: 10 * GRID.size },
                cardType: 'card',
              },
            },
            title: newCardId,
            color: 'gray',
            content: { text: '' },
          },
        },
      };
    },
    copyCard: (state, { cardId }) => {
      if (!state.activeViewId) return state;
      const newCardId = 'card' + state.cardCreateCnt;
      return {
        ...state,
        activeCardId: newCardId,
        cardCreateCnt: state.cardCreateCnt + 1,
        cards: {
          ...state.cards,
          [newCardId]: {
            ...state.cards[cardId],
            views: {
              [state.activeViewId]: {
                ...state.cards[cardId].views[state.activeViewId],
                pos: {
                  x: state.cards[cardId].views[state.activeViewId].pos.x + GRID.size,
                  y: state.cards[cardId].views[state.activeViewId].pos.y + GRID.size,
                },
              },
            },
          },
        },
      };
    },
    destroyCard: (state, { cardId }) => {
      let newCards = { ...state.cards };
      delete newCards[cardId];
      return {
        ...state,
        activeCardId: (cardId === state.activeCardId) ? null : state.activeCardId,
        cards: newCards,
      };
    },
    linkCardToView: (state, { cardId, pos }) => {
      if (!state.activeViewId) return state;
      return {
        ...state,
        activeCardId: cardId,
        cards: {
          ...state.cards,
          [cardId]: {
            ...state.cards[cardId],
            views: {
              ...state.cards[cardId].views,
              [state.activeViewId]: {
                pos: pos,
                size: {width: 8*GRID.size, height: 10*GRID.size},
                cardType: 'card',
              },
            },
          },
        },
      };
    },
    unlinkCardFromView: (state, { cardId }) => {
      if (!state.activeViewId) return state;
      let newCardViews = { ...state.cards[cardId].views };
      delete newCardViews[state.activeViewId];
      return {
        ...state,
        activeCardId: null,
        cards: {
          ...state.cards,
          [cardId]: {
            ...state.cards[cardId],
            views: newCardViews,
          },
        },
      };
    },
    updCardPos: (state, { cardId, pos }) => {
      if (!state.activeViewId) return state;
      const newPos = {
        x: Math.round(pos.x / GRID.size) * GRID.size,
        y: Math.round(pos.y / GRID.size) * GRID.size,
      };
      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: {
            ...state.cards[cardId],
            views: {
              ...state.cards[cardId].views,
              [state.activeViewId]: {
                ...state.cards[cardId].views[state.activeViewId],
                pos: newPos,
              },
            },
          },
        },
      }
    },
    updCardSize: (state, { cardId, size }) => {
      if (!state.activeViewId) return state;
      const newSize = {
        height: (Math.round(size.height.split('px').shift() / GRID.size) * GRID.size) + 'px',
        width: (Math.round(size.width.split('px').shift() / GRID.size) * GRID.size) + 'px',
      };
      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: {
            ...state.cards[cardId],
            views: {
              ...state.cards[cardId].views,
              [state.activeViewId]: {
                ...state.cards[cardId].views[state.activeViewId],
                size: newSize,
              },
            },
          },
        },
      };
    },
    updCardTitle: (state, { cardId, title }) => ({
      ...state,
      cards: {
        ...state.cards,
        [cardId]: {
          ...state.cards[cardId],
          title: title,
        },
      },
    }),
    updCardColor: (state, { cardId, color }) => ({
      ...state,
      cards: {
        ...state.cards,
        [cardId]: {
          ...state.cards[cardId],
          color: color,
        },
      },
    }),
    updCardText: (state, { cardId, text }) => ({
      ...state,
      cards: {
        ...state.cards,
        [cardId]: {
          ...state.cards[cardId],
          content: {
            ...state.cards[cardId].content,
            text: text,
          },
        },
      },
    }),
    createView: (state) => {
      const newViewId = 'untitled' + state.viewCreateCnt;
      let newViewOrder = [ ...state.viewOrder ];
      const pos = state.activeViewId ? newViewOrder.indexOf(state.activeViewId) + 1 : 0;
      newViewOrder.splice(pos, 0, newViewId);
      return {
        ...state,
        activeViewId: newViewId,
        viewOrder: newViewOrder,
        viewCreateCnt: state.viewCreateCnt + 1,
        views: {
          ...state.views,
          [newViewId]: {
            pos: { x: 0, y: 0 },
            scale: 1,
            lock: true,
            color: 'gray',
            title: newViewId,
          },
        },
      };
    },
    destroyView: (state, { viewId }) => {
      let newViews = { ...state.views };
      delete newViews[viewId];
      const newViewOrder = [ ...state.viewOrder ].filter(id => id !== viewId);
      return {
        ...state,
        activeViewId: (viewId === state.activeViewId) ? null : state.activeViewId,
        viewOrder: newViewOrder,
        views: newViews,
      };
    },
    lockActiveView: (state) => {
      if (!state.activeViewId) return state;
      return {
        ...state,
        views: {
          ...state.views,
          [state.activeViewId]: {
            ...state.views[state.activeViewId],
            lock: true,
          },
        },
      };
    },
    unlockActiveView: (state) => {
      if (!state.activeViewId) return state;
      return {
        ...state,
        views: {
          ...state.views,
          [state.activeViewId]: {
            ...state.views[state.activeViewId],
            lock: false,
          },
        },
      };
    },
    updActiveViewPos: (state, { pos }) => {
      if (!state.activeViewId) return state;
      return {
        ...state,
        views: {
          ...state.views,
          [state.activeViewId]: {
            ...state.views[state.activeViewId],
            pos: pos,
          },
        },
      };
    },
    updActiveViewScale: (state, { scale }) => {
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
    resetActiveView: (state) => {
      if (!state.activeViewId) return state;
      return {
        ...state,
        views: {
          ...state.views,
          [state.activeViewId]: {
            ...state.views[state.activeViewId],
            pos: { x: 0, y: 0 },
            scale: 1,
          },
        },
      };
    },
    updViewTitle: (state, { viewId, title }) => ({
      ...state,
      views: {
        ...state.views,
        [viewId]: {
          ...state.views[viewId],
          title: title,
        },
      },
    }),
    updViewColor: (state, { viewId, color }) => ({
      ...state,
      views: {
        ...state.views,
        [viewId]: {
          ...state.views[viewId],
          color: color,
        },
      },
    }),
  },
});

const actions = campaign.actions;

const { reducer } = campaign;

export {
  actions,
  initialState,
  reducer,
};
