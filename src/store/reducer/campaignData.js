import * as actionTypes from '../actionTypes';
import { GRID } from '../../shared/_dimensions';
import { updateObject } from '../../shared/utils';

// The campaignData reducer mirrors the campaign data structure on firebase

// const exampleReducerStructure =
// {
//   title: "campaign title",
//   activeViewId: "view0",
//   viewOrder: ["view0"],
//   cardCreateCnt: 1,
//   viewCreateCnt: 1,
//   cards: {
//     card0: {
//       views: {
//         view0: {
//           pos: {x: "card x-position", y: "card y-position"},
//           size: {width: "card width", height: "card height"},
//           cardForm: "card or blurb",
//         },
//       },
//       title: "card title",
//       color: "card color",
//       content: {
//         text: "card text",
//       },
//     },
//   },
//   views: {
//     view0: {
//       pos: {x: "view display x-position", y: "view display x-position"},
//       title: "view title",
//       color: "view color",
//     },
//   },
// }

const reducer = (state = {}, action) => {
  switch (action.type) {
    case actionTypes.LOAD_CAMPAIGN_DATA: return action.campaignData;
    case actionTypes.UNLOAD_CAMPAIGN_DATA: return {};
    case actionTypes.LOAD_INTRO_CAMPAIGN: return {...introCampaign};

    // CAMPAIGN
    case actionTypes.UPD_CAMPAIGN_TITLE: return updateObject(state, {title: action.title});
    case actionTypes.UPD_ACTIVE_VIEW_ID: return updateObject(state, {activeViewId: action.activeViewId});
    case actionTypes.SHIFT_VIEW_IN_VIEW_ORDER: return shiftViewInViewOrder(state, action.shiftedViewId, action.posShift);

    // CARD
    case actionTypes.CREATE_CARD: return createCard(state);
    case actionTypes.COPY_CARD: return copyCard(state, action.cardId);
    case actionTypes.DESTROY_CARD: return destroyCard(state, action.cardId);
    case actionTypes.LINK_CARD_TO_VIEW: return linkCardToView(state, action.cardId, action.pos);
    case actionTypes.UNLINK_CARD_FROM_VIEW: return unlinkCardFromView(state, action.cardId);
    case actionTypes.UPD_CARD_POS: return updCardPos(state, action.cardId, action.pos);
    case actionTypes.UPD_CARD_SIZE: return updCardSize(state, action.cardId, action.size);
    case actionTypes.UPD_CARD_FORM: return updCardForm(state, action.cardId, action.cardForm);
    case actionTypes.UPD_CARD_TITLE: return updCardTitle(state, action.cardId, action.title);
    case actionTypes.UPD_CARD_COLOR: return updCardColor(state, action.cardId, action.color);
    case actionTypes.UPD_CARD_COLOR_FOR_VIEW: return updCardColorForView(state, action.cardId, action.color);
    case actionTypes.UPD_CARD_TEXT: return updCardText(state, action.cardId, action.text);

    // VIEW
    case actionTypes.CREATE_VIEW: return createView(state);
    case actionTypes.DESTROY_VIEW: return destroyView(state, action.viewId);
    case actionTypes.LOCK_ACTIVE_VIEW: return lockActiveView(state);
    case actionTypes.UNLOCK_ACTIVE_VIEW: return unlockActiveView(state);
    case actionTypes.UPD_ACTIVE_VIEW_POS: return updActiveViewPos(state, action.pos);
    case actionTypes.UPD_ACTIVE_VIEW_SCALE: return updActiveViewScale(state, action.scale);
    case actionTypes.RESET_ACTIVE_VIEW: return resetActiveView(state);
    case actionTypes.UPD_VIEW_TITLE: return updViewTitle(state, action.viewId, action.title);
    case actionTypes.UPD_VIEW_COLOR: return updViewColor(state, action.viewId, action.color);

    default: return state;
  }
};

// CAMPAIGN
const shiftViewInViewOrder = (state, shiftedViewId, posShift) => {
  let updatedViewOrder = [...state.viewOrder];
  const newPos = updatedViewOrder.indexOf(shiftedViewId) + posShift;
  updatedViewOrder = updatedViewOrder.filter(id => id !== shiftedViewId);
  updatedViewOrder.splice(newPos, 0, shiftedViewId);
  return updateObject(state, {
    viewOrder: updatedViewOrder,
  });
};

// CARD
const createCard = (state) => {
  if (!state.activeViewId) return state;
  const newCardId = "card"+state.cardCreateCnt;
  return updateObject(state, {
    activeCardId: newCardId,
    cardCreateCnt: state.cardCreateCnt + 1,
    cards: {
      ...state.cards,
      [newCardId]: {
        views: {
          [state.activeViewId]: {
            pos: {x: 3*GRID.size, y: 3*GRID.size},
            size: {width: 8*GRID.size, height: 10*GRID.size},
            cardType: "card",
          },
        },
        title: newCardId,
        color: "gray",
        content: {text: ""},
      },
    },
  });
};

const copyCard = (state, cardId) => {
  // this copies everything from the other card except it only appears in the activeView
  if (!state.activeViewId) return state;
  const newCardId = "card"+state.cardCreateCnt;
  return updateObject(state, {
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
  });
};

const destroyCard = (state, cardId) => {
  let updatedCards = {...state.cards};
  delete updatedCards[cardId];
  return updateObject(state, {
    activeCardId: cardId === state.activeCardId ? null : state.activeCardId,
    cards: updatedCards,
  });
};

const linkCardToView = (state, cardId, pos) => {
  if (!state.activeViewId) return state;
  return updateObject(state, {
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
            cardType: "card",
          },
        },
      },
    },
  });
};

const unlinkCardFromView = (state, cardId) => {
  if (!state.activeViewId) return state;
  let updatedCardViews = {...state.cards[cardId].views};
  delete updatedCardViews[state.activeViewId];
  return updateObject(state, {
    activeCardId: null,
    cards: {
      ...state.cards,
      [cardId]: {
        ...state.cards[cardId],
        views: updatedCardViews,
      },
    },
  });
};

const updCardPos = (state, cardId, newPos) => {
  if (!state.activeViewId) return state;
  const roundedPos = {
    x: Math.round(newPos.x / GRID.size) * GRID.size,
    y: Math.round(newPos.y / GRID.size) * GRID.size
  };
  return updateObject(state, {
    cards: {
      ...state.cards,
      [cardId]: {
        ...state.cards[cardId],
        views: {
          ...state.cards[cardId].views,
          [state.activeViewId]: {
            ...state.cards[cardId].views[state.activeViewId],
            pos: roundedPos,
          },
        },
      },
    },
  });
};

const updCardSize = (state, cardId, newSize) => {
  if (!state.activeViewId) return state;
  const roundedSize = {
    width: (Math.round(newSize.width.split("px").shift() / GRID.size) * GRID.size) + "px",
    height: (Math.round(newSize.height.split("px").shift() / GRID.size) * GRID.size) + "px"
  };
  return updateObject(state, {
    cards: {
      ...state.cards,
      [cardId]: {
        ...state.cards[cardId],
        views: {
          ...state.cards[cardId].views,
          [state.activeViewId]: {
            ...state.cards[cardId].views[state.activeViewId],
            size: roundedSize,
          },
        },
      },
    },
  });
};

const updCardColor = (state, cardId, color) => {
  return updateObject(state, {
    cards: {
      ...state.cards,
      [cardId]: {
        ...state.cards[cardId],
        color: color,
      },
    },
  });
};

const updCardColorForView = (state, cardId, color) => {
  if (!state.activeViewId) return state;
  return updateObject(state, {
    cards: {
      ...state.cards,
      [cardId]: {
        ...state.cards[cardId],
        views: {
          ...state.cards[cardId].views,
          [state.activeViewId]: {
            ...state.cards[cardId].views[state.activeViewId],
            color: color,
          },
        },
      },
    },
  });
};

const updCardForm = (state, cardId, cardForm) => {
  if (!state.activeViewId) return state;
  return updateObject(state, {
    cards: {
      ...state.cards,
      [cardId]: {
        ...state.cards[cardId],
        views: {
          ...state.cards[cardId].views,
          [state.activeViewId]: {
            ...state.cards[cardId].views[state.activeViewId],
            cardForm: cardForm,
          },
        },
      },
    },
  });
};

const updCardTitle = (state, cardId, title) => {
  return updateObject(state, {
    cards: {
      ...state.cards,
      [cardId]: {
        ...state.cards[cardId],
        title: title,
      },
    },
  });
};

const updCardText = (state, cardId, text) => {
  return updateObject(state, {
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
  });
};

// VIEW
const createView = (state) => {
  const newViewId = "untitled"+state.viewCreateCnt;
  let updatedViewOrder = [...state.viewOrder];
  const pos = state.activeViewId ? updatedViewOrder.indexOf(state.activeViewId) + 1 : 0;
  updatedViewOrder.splice(pos, 0, newViewId);
  return updateObject(state, {
    activeViewId: newViewId,
    viewOrder: updatedViewOrder,
    viewCreateCnt: state.viewCreateCnt + 1,
    views: {
      ...state.views,
      [newViewId]: {
        pos: { x: 0, y: 0 },
        scale: 1,
        lock: false,
        color: "gray",
        title: newViewId,
      },
    },
  });
};

const destroyView = (state, viewId) => {
  let updatedViews = {...state.views};
  delete updatedViews[viewId];
  const updatedViewOrder = [...state.viewOrder].filter(id => id !== viewId);
  return updateObject(state, {
    activeViewId: viewId === state.activeViewId ? null : state.activeViewId,
    viewOrder: updatedViewOrder,
    views: updatedViews,
  });
};

const lockActiveView = (state) => {
  if (!state.activeViewId) return state;
  return updateObject(state, {
    views: {
      ...state.views,
      [state.activeViewId]: {
        ...state.views[state.activeViewId],
        lock: true,
      },
    },
  });
};

const unlockActiveView = (state) => {
  if (!state.activeViewId) return state;
  return updateObject(state, {
    views: {
      ...state.views,
      [state.activeViewId]: {
        ...state.views[state.activeViewId],
        lock: false,
      },
    },
  });
};

const updActiveViewPos = (state, pos) => {
  if (!state.activeViewId) return state;
  return updateObject(state, {
    views: {
      ...state.views,
      [state.activeViewId]: {
        ...state.views[state.activeViewId],
        pos: pos,
      },
    },
  });
};

const updActiveViewScale = (state, scale) => {
  if (!state.activeViewId) return state;
  return updateObject(state, {
    views: {
      ...state.views,
      [state.activeViewId]: {
        ...state.views[state.activeViewId],
        scale: scale,
      },
    },
  });
};

const resetActiveView = (state) => {
  if (!state.activeViewId) return state;
  return updateObject(state, {
    views: {
      ...state.views,
      [state.activeViewId]: {
        ...state.views[state.activeViewId],
        pos: { x: 0, y: 0 },
        scale: 1,
      },
    },
  });
};

const updViewColor = (state, viewId, color) => {
  return updateObject(state, {
    views: {
      ...state.views,
      [viewId]: {
        ...state.views[viewId],
        color: color,
      },
    },
  });
};

const updViewTitle = (state, viewId, title) => {
  return updateObject(state, {
    views: {
      ...state.views,
      [viewId]: {
        ...state.views[viewId],
        title: title,
      },
    },
  });
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
      color: "green",
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
      color: "blue",
      content: {
        text: "Use the buttons to build your campaign. You can add cards, copy cards, reset the board position. You can also save your progress, but you must first create an account.",
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
      color: "blue",
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
      color: "blue",
      content: {
        text: "All the cards you create are stored in the library, which you can access by clicking the book to the right. The same card can be placed in multiple views and edited from multiple places.",
      },
    },
  },
  views: {
    view0: {
      pos: { x: 0, y: 0 },
      scale: 1,
      lock: false,
      color: "green",
      title: "Welcome!",
    },
    view1: {
      pos: { x: 0, y: 0 },
      scale: 1,
      lock: false,
      color: "blue",
      title: "READ ME",
    },
  },
};

export default reducer;