import * as actionTypes from '../actionTypes';
import { GRID } from '../../shared/constants/grid';
import { updateObject } from '../../shared/utilityFunctions';

// The campaignData reducer mirrors the campaign data structure on firebase

// const exampleReducerStructure =
// {
//   title: "campaign title",
//   activeCardId: "card0",
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
//           cardForm: "card or bubble",
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
    case actionTypes.LOAD_INTRO_CAMPAIGN: return introCampaign;

    // CAMPAIGN
    case actionTypes.UPD_CAMPAIGN_TITLE: return updateObject(state, {title: action.title});
    case actionTypes.UPD_ACTIVE_CARD_ID: return updateObject(state, {activeCardId: action.activeCardId});
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
  return updateObject(state, {viewOrder: updatedViewOrder});
};

// CARD
const createCard = (state) => {
  if (!state.activeViewId) return state;
  const newCardId = "card"+state.cardCreateCnt;
  const newCard = {
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
  };
  const updatedCards = updateObject(state.cards, {[newCardId]: newCard});
  const updatedState = {
    activeCardId: newCardId,
    cardCreateCnt: state.cardCreateCnt + 1,
    cards: updatedCards,
  };
  return updateObject(state, updatedState);
};

const copyCard = (state, cardId) => {
  // this copies everything from the other card except it only appears in the activeView
  if (!state.activeViewId) return state;
  const newCardId = "card"+state.cardCreateCnt;
  let newCard = {...state.cards[cardId]};
  // position updates
  newCard.views = { [state.activeViewId]: {...state.cards[cardId].views[state.activeViewId]} };
  newCard.views[state.activeViewId].pos = {
    x: newCard.views[state.activeViewId].pos.x + GRID.size,
    y: newCard.views[state.activeViewId].pos.y + GRID.size,
  };
  // content updates
  newCard.content = {...state.cards[cardId].content};
  const updatedCards = updateObject(state.cards, {[newCardId]: newCard});
  const updatedState = {
    activeCardId: newCardId,
    cardCreateCnt: state.cardCreateCnt + 1,
    cards: updatedCards,
  };
  return updateObject(state, updatedState);
}

const destroyCard = (state, cardId) => {
  let updatedCards = {...state.cards};
  delete updatedCards[cardId];
  const updatedState = {
    activeCardId: cardId === state.activeCardId ? null : state.activeCardId,
    cards: updatedCards,
  }
  return updateObject(state, updatedState);
};

const linkCardToView = (state, cardId, pos) => {
  if (!state.activeViewId) return state;
  let updatedCard = {...state.cards[cardId]};
  const viewSettings = {
    pos: pos,
    size: {width: 8*GRID.size, height: 10*GRID.size},
    cardType: "card",
  };
  updatedCard.views = updateObject(updatedCard.views, {[state.activeViewId]: viewSettings});
  const updatedCards = updateObject(state.cards, {[cardId]: updatedCard});
  const updatedState = {
    activeCardId: cardId,
    cards: updatedCards,
  }
  return updateObject(state, updatedState);
};

const unlinkCardFromView = (state, cardId) => {
  if (!state.activeViewId) return state;
  let updatedCard = {...state.cards[cardId]};
  delete updatedCard.views[state.activeViewId];
  const updatedCards = updateObject(state.cards, {[cardId]: updatedCard});
  const updatedState = {
    activeCardId: null,
    cards: updatedCards,
  };
  return updateObject(state, updatedState);
};

const updCardPos = (state, cardId, newPos) => {
  if (!state.activeViewId) return state;
  let updatedCard = {...state.cards[cardId]};
  let roundedPos = {
    x: Math.round(newPos.x / GRID.size) * GRID.size,
    y: Math.round(newPos.y / GRID.size) * GRID.size
  };
  updatedCard.views[state.activeViewId].pos = roundedPos;
  const updatedCards = updateObject(state.cards, {[cardId]: updatedCard});
  return updateObject(state, {cards: updatedCards});
};

const updCardSize = (state, cardId, newSize) => {
  if (!state.activeViewId) return state;
  let updatedCard = {...state.cards[cardId]};
  let roundedSize = {
    width: (Math.round(newSize.width.split("px").shift() / GRID.size) * GRID.size) + "px",
    height: (Math.round(newSize.height.split("px").shift() / GRID.size) * GRID.size) + "px"
  };
  updatedCard.views[state.activeViewId].size = roundedSize;
  const updatedCards = updateObject(state.cards, {[cardId]: updatedCard});
  return updateObject(state, {cards: updatedCards});
};

const updCardColor = (state, cardId, color) => {
  let updatedCard = {...state.cards[cardId]};
  updatedCard.color = color;
  const updatedCards = updateObject(state.cards, {[cardId]: updatedCard});
  return updateObject(state, {cards: updatedCards});
};

const updCardColorForView = (state, cardId, color) => {
  if (!state.activeViewId) return state;
  let updatedCard = {...state.cards[cardId]};
  updatedCard.views[state.activeViewId].color = color;
  const updatedCards = updateObject(state.cards, {[cardId]: updatedCard});
  return updateObject(state, {cards: updatedCards});
};

const updCardForm = (state, cardId, cardForm) => {
  if (!state.activeViewId) return state;
  let updatedCard = {...state.cards[cardId]};
  updatedCard.views[state.activeViewId].cardForm = cardForm;
  const updatedCards = updateObject(state.cards, {[cardId]: updatedCard});
  return updateObject(state, {cards: updatedCards});
};

const updCardTitle = (state, cardId, title) => {
  let updatedCard = {...state.cards[cardId]};
  updatedCard.title = title;
  const updatedCards = updateObject(state.cards, {[cardId]: updatedCard});
  return updateObject(state, {cards: updatedCards});
};

const updCardText = (state, cardId, text) => {
  let updatedCard = {...state.cards[cardId]};
  updatedCard.content.text = text;
  const updatedCards = updateObject(state.cards, {[cardId]: updatedCard});
  return updateObject(state, {cards: updatedCards});
};

// VIEW
const createView = (state) => {
  const newViewId = "view"+state.viewCreateCnt;
  const newView = {
    pos: { x: 0, y: 0 },
    title: newViewId,
    color: "gray",
  };
  const updatedViews = updateObject(state.views, {[newViewId]: newView});
  let updatedViewOrder = [...state.viewOrder];
  const pos = state.activeViewId ? updatedViewOrder.indexOf(state.activeViewId) + 1 : 0;
  updatedViewOrder.splice(pos, 0, newViewId);
  const updatedState = {
    activeViewId: newViewId,
    viewOrder: updatedViewOrder,
    viewCreateCnt: state.viewCreateCnt + 1,
    views: updatedViews,
  };
  return updateObject(state, updatedState);
};

const destroyView = (state, viewId) => {
  let updatedViews = {...state.views};
  delete updatedViews[viewId];
  let updatedViewOrder = [...state.viewOrder];
  updatedViewOrder = updatedViewOrder.filter(id => id !== viewId);
  const updatedState = {
    activeViewId: viewId === state.activeViewId ? null : state.activeViewId,
    viewOrder: updatedViewOrder,
    views: updatedViews,
  };
  return updateObject(state, updatedState);
};

const lockActiveView = (state) => {
  if (!state.activeViewId) return state;
  let updatedView = {...state.views[state.activeViewId]};
  updatedView.lock = true;
  const updatedViews = updateObject(state.views, {[state.activeViewId]: updatedView});
  return updateObject(state, {views: updatedViews});
};

const unlockActiveView = (state) => {
  if (!state.activeViewId) return state;
  let updatedView = {...state.views[state.activeViewId]};
  updatedView.lock = false;
  const updatedViews = updateObject(state.views, {[state.activeViewId]: updatedView});
  return updateObject(state, {views: updatedViews});
};

const updActiveViewPos = (state, pos) => {
  if (!state.activeViewId) return state;
  let updatedView = {...state.views[state.activeViewId]};
  updatedView.pos = pos;
  const updatedViews = updateObject(state.views, {[state.activeViewId]: updatedView});
  return updateObject(state, {views: updatedViews});
};

const updActiveViewScale = (state, scale) => {
  if (!state.activeViewId) return state;
  let updatedView = {...state.views[state.activeViewId]};
  updatedView.scale = scale;
  const updatedViews = updateObject(state.views, {[state.activeViewId]: updatedView});
  return updateObject(state, {views: updatedViews});
};

const resetActiveView = (state) => {
  if (!state.activeViewId) return state;
  let updatedView = {...state.views[state.activeViewId]};
  updatedView.pos = { x: 0, y: 0 };
  updatedView.scale = 1;
  const updatedViews = updateObject(state.views, {[state.activeViewId]: updatedView});
  return updateObject(state, {views: updatedViews});
};

const updViewColor = (state, viewId, color) => {
  let updatedView = {...state.views[viewId]};
  updatedView.color = color;
  const updatedViews = updateObject(state.views, {[viewId]: updatedView});
  return updateObject(state, {views: updatedViews});
};

const updViewTitle = (state, viewId, title) => {
  let updatedView = {...state.views[viewId]};
  updatedView.title = title;
  const updatedViews = updateObject(state.views, {[viewId]: updatedView});
  return updateObject(state, {views: updatedViews});
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
      title: "Welcome!",
      color: "green",
    },
    view1: {
      title: "READ ME",
      color: "red",
    },
  },
};

export default reducer;