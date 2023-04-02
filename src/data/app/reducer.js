import { createSlice } from '@reduxjs/toolkit';
import uuid from 'react-uuid';

import { CARD, GRID, TAB } from '../config';

const initialState = {
  id: null,
  title: null,
  activeCard: null,
  activeTab: null,
  tabOrder: [],
  cards: {},
  tabs: {},
};

const roundPosToGrid = (pos) => ({
  x: Math.round(pos.x / GRID.size) * GRID.size,
  y: Math.round(pos.y / GRID.size) * GRID.size,
});

const roundSizeToGrid = (size) => ({
  width: (Math.round(size.width.split("px").shift() / GRID.size) * GRID.size) + "px",
  height: (Math.round(size.height.split("px").shift() / GRID.size) * GRID.size) + "px",
});

const app = createSlice({
  name: 'app',
  initialState,
  reducers: {
    initialize: ({ payload }) => payload,
    loadCards: (state, { payload }) => ({ ...state, cards: payload }),
    loadTabs: (state, { payload }) => ({ ...state, tabs: payload }),
    unloadCampaign: () => initialState,

    // createCampaign,
    // destroyCampaign,
    // copyCampaign,

    setCampaignId: (state, { payload }) => ({ ...state, id: payload }),
    setCampaignTitle: (state, { payload }) => ({ ...state, title: payload }),
    setActiveCard: (state, { payload }) => ({ ...state, activeCard: payload }),
    setActiveTab: (state, { payload }) => ({ ...state, activeTab: payload }),
    setTabOrder: (state, { payload }) => ({ ...state, tabOrder: payload }),

    createCard: (state) => {
      if (!state.activeTab) return state;
      const newId = uuid();
      return {
        ...state,
        activeCard: newId,
        cards: {
          ...state.cards,
          [newId]: {
            color: 'gray',
            tabList: [ state.activeTab ],
            text: '',
            title: 'Card!',
          },
        },
        tabs: {
          ...state.tabs,
          [state.activeTab]: {
            ...state.tabs[state.activeTab],
            cardList: {
              ...state.tabs[state.activeTab].cardList,
              [newId]: {
                pos: CARD.initPos,
                size: CARD.initSize,
              },
            },
          },
        },
      };
    },
    copyCard: (state, { id }) => {
      if (!state.activeTab) return state;
      const newId = uuid();
      return {
        ...state,
        activeCard: newId,
        cards: {
          ...state.cards,
          [newId]: {
            ...state.cards[id],
            tabList: [ state.activeTab ],
          },
        },
        tabs: {
          ...state.tabs,
          [state.activeTab]: {
            ...state.tabs[state.activeTab],
            cardList: {
              ...state.tabs[state.activeTab].cardList,
              [newId]: {
                pos: {
                  x: state.tabs[state.activeTab].cardList[id].pos.x + GRID.size,
                  y: state.tabs[state.activeTab].cardList[id].pos.y + GRID.size,
                },
              },
            },
          },
        },
      };
    },
    destroyCard: (state, { id }) => {
      let updatedCards = { ...state.cards };
      delete updatedCards[id];
      let updatedTabs = { ...state.tabs };
      state.cards[id].tabList.forEach(tab => {
        let updatedCardList = { ...state.tabs[tab].cardList };
        delete updatedCardList[id];
        updatedTabs = { 
          ...updatedTabs,
          [tab]: {
            ...state.tabs[tab],
            cardList: updatedCardList,
          },
        };
      });
      return {
        ...state,
        cards: updatedCards,
        tabs: updatedTabs,
      };
    },
    setCardTitle: (state, { id, title }) => {
      return {
        ...state,
        cards: {
          ...state.cards,
          [id]: {
            ...state.cards[id],
            title,
          },
        },
      };
    },
    setCardColor: (state, { id, color }) => {
      return {
        ...state,
        cards: {
          ...state.cards,
          [id]: {
            ...state.cards[id],
            color,
          },
        },
      };
    },
    setCardText: (state, { id, text }) => {
      return {
        ...state,
        cards: {
          ...state.cards,
          [id]: {
            ...state.cards[id],
            text,
          },
        },
      };
    },

    createTab: (state) => {
      const newId = uuid();
      let updatedTabOrder = [ ...state.tabOrder ];
      if (state.activeTab) {
        updatedTabOrder.splice(updatedTabOrder.indexOf(state.activeTab) + 1, 0, newId);
      } else {
        updatedTabOrder = [ ...updatedTabOrder, newId ];
      }
      return {
        ...state,
        activeTab: newId,
        tabOrder: updatedTabOrder,
        tabs: {
          ...state.tabs,
          [newId]: {
            cardList: {},
            lock: TAB.initLock,
            pos: TAB.initPos,
            scale: TAB.initScale,
            title: 'Tab!',
          },
        },
      };
    },
    copyTab: (state, { id }) => {
      const newId = uuid();
      let updatedTabOrder = [ ...state.tabOrder ];
      if (state.activeTab) {
        updatedTabOrder.splice(updatedTabOrder.indexOf(id) + 1, 0, newId);
      } else {
        updatedTabOrder = [ ...updatedTabOrder, newId ];
      }
      return {
        ...state,
        activeTab: newId,
        tabOrder: updatedTabOrder,
        tabs: {
          ...state.tabs,
          [newId]: { ...state.tabs[id] },
        },
      };
    },
    destroyTab: (state, { id }) => {
      let updatedTabOrder = [ ...state.tabOrder ];
      updatedTabOrder.splice(updatedTabOrder.indexOf(id), 1);
      let updatedTabs = { ...state.tabs };
      delete updatedTabs[id];
      let updatedCards = { ...state.cards };
      Object.keys(state.tabs[id].cardList).forEach(card => {
        let updatedTabList = [ ...state.cards[card].tablist ];
        updatedTabList.splice(updatedTabList.indexOf(id), 1);
        updatedCards = {
          ...updatedCards,
          [card]: {
            ...state.tabs[id],
            tabList: updatedTabList,
          },
        };
      })
      return {
        ...state,
        cards: updatedCards,
        tabOrder: updatedTabOrder,
        tabs: updatedTabs,
      };
    },
    setTabTitle: (state, { id, title }) => {
      return {
        ...state,
        tabs: {
          ...state.tabs,
          [id]: {
            ...state.tabs[id],
            title,
          },
        },
      };
    },
    linkCardToTab: (state, { id, pos }) => {
      if (!state.activeTab) return state;
      return {
        ...state,
        activeCard: id,
        cards: {
          ...state.cards,
          [id]: {
            ...state.cards[id],
            tabList: [ 
              ...state.cards[id].tabList,
              state.activeTab,
            ],
          },
        },
        tabs: {
          ...state.tabs,
          [state.activeTab]: {
            ...state.tabs[state.activeTab],
            cardList: {
              ...state.tabs[state.activeTab].cardList,
              pos: roundPosToGrid(pos),
              size: CARD.initSize,
            },
          },
        },
      };
    },
    unlinkCardFromTab: (state, { id }) => {
      if (!state.activeTab) return state;
      let updatedTabList = [ ...state.cards[id].tabList ];
      updatedTabList.splice(updatedTabList.indexOf(id), 1);
      let updatedCardList = { ...state.tabs[state.activeTab].cardList };
      delete updatedCardList[id];
      return {
        ...state,
        activeCard: null,
        cards: {
          ...state.cards,
          [id]: {
            ...state.cards[id],
            tabList: updatedTabList,
          },
        },
        tabs: {
          ...state.tabs,
          [state.activeTab]: {
            ...state.tabs[state.activeTab],
            cardList: updatedCardList,
          },
        },
      };
    },
    setCardPosition: (state, { id, pos }) => {
      if (!state.activeTab) return state;
      return {
        ...state,
        tabs: {
          ...state.tabs,
          [state.activeTab]: {
            ...state.tabs[state.activeTab],
            cardList: {
              ...state.tabs[state.activeTab].cardList,
              [id]: {
                ...state.tabs[state.activeTab].cardList[id],
                pos: roundPosToGrid(pos),
              },
            },
          },
        },
      };
    },
    setCardSize: (state, { id, size }) => {
      if (!state.activeTab) return state;
      return {
        ...state,
        tabs: {
          ...state.tabs,
          [state.activeTab]: {
            ...state.tabs[state.activeTab],
            cardList: {
              ...state.tabs[state.activeTab].cardList,
              [id]: {
                ...state.tabs[state.activeTab].cardList[id],
                size: roundSizeToGrid(size),
              },
            },
          },
        },
      };
    },
  },
});

const actions = app.actions;
const { reducer } = app;

export {
  actions,
  initialState,
  reducer,
};
