import * as actionTypes from '../actionTypes';
import { GRID } from '../../shared/constants/grid';
import { updateObject } from '../../shared/utilityFunctions';

const initialState = {
  // exampleCard1: {
  //   views: {
  //     view1: {
  //       pos: {
  //         x: x integer,
  //         y: y interger
  //       },
  //       size: {
  //         width: "width px",
  //         height: "height px",
  //       },
  //       color: "color",
  //       cardType: "bubble" || "card",
  //     },
  //   },
  //   content: {
  //     title: "card title",
  //     text: "text field,
  //     statblock: {
  //       active: boolean,
  //       attributes: {str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10},
  //       profBonus: 2,
  //     },
  //   },
  // },
  card0: {
    views: {
      view0: {
        pos: {x: 60, y: 60},
        size: {width: 600, height: 450},
        color: "green",
        cardType: "card",
      },
    },
    content: {
      title: "Greetings Traveler!",
      text: "Welcome to DM Kit, a tool to help plan your next adventure."
    },
  },
};

const reducer = (state = {}, action) => {
  switch(action.type) {
    // Collection load/unload
    case actionTypes.INIT_CARD_COLL: return initialState;
    case actionTypes.LOAD_CARD_COLL: return updateObject(state, action.cardColl);
    case actionTypes.UNLOAD_CARD_COLL: return {};

    // Add/Remove
    case actionTypes.ADD_CARD: return updateObject(state, {[action.cardId]: action.cardData});
    case actionTypes.REMOVE_CARD: return removeCard(state, action.cardId);
    case actionTypes.CONNECT_CARD_TO_VIEW: return connectCardToView(state, action.cardId, action.viewId, action.pos, action.size, action.color);
    case actionTypes.DISCONNECT_CARD_FROM_VIEW: return disconnectCardFromView(state, action.cardId, action.viewId);

    // Update visuals
    case actionTypes.UPD_CARD_POS: return updCardPos(state, action.cardId, action.viewId, action.pos.x, action.pos.y);
    case actionTypes.UPD_CARD_SIZE: return updCardSize(state, action.cardId, action.viewId, action.size.width, action.size.height);
    case actionTypes.UPD_CARD_COLOR: return updCardColor(state, action.cardId, action.viewId, action.color);
    case actionTypes.UPD_CARD_COLOR_FOR_ALL_VIEWS: return updCardColorForAllViews(state, action.cardId, action.color);
    case actionTypes.UPD_CARD_TYPE: return updCardType(state, action.cardId, action.viewId, action.cardType);

    // Update content
    case actionTypes.UPD_CARD_TITLE: return updCardTitle(state, action.cardId, action.title);
    case actionTypes.UPD_CARD_TEXT: return updCardText(state, action.cardId, action.text);

    default: return state;
  }
};

const removeCard = (state, cardId) => {
  let updatedCardColl = {...state};
  delete updatedCardColl[cardId];
  return updatedCardColl;
};

const connectCardToView = (state, cardId, viewId, pos, size, color) => {
  let updatedCard = {...state[cardId]};
  updatedCard.views = updateObject(updatedCard.views, {
    [viewId]: {
      pos: pos,
      size: size,
      color: color,
    }
  });
  return updateObject(state, {[cardId]: updatedCard});
};

const disconnectCardFromView = (state, cardId, viewId) => {
  let updatedCard = {...state[cardId]};
  delete updatedCard.views[viewId];
  return updateObject(state, {[cardId]: updatedCard});
};

const updCardPos = (state, cardId, viewId, x, y) => {
  let updatedCard = {...state[cardId]};
  let roundedPos = {
    x: Math.round(x / GRID.size) * GRID.size,
    y: Math.round(y / GRID.size) * GRID.size
  };
  updatedCard.views[viewId].pos = roundedPos;
  return updateObject(state, {[cardId]: updatedCard});
};

const updCardSize = (state, cardId, viewId, width, height) => {
  let updatedCard = {...state[cardId]};
  let roundedSize = {
    width: (Math.round(width.split("px").shift() / GRID.size) * GRID.size) + "px",
    height: (Math.round(height.split("px").shift() / GRID.size) * GRID.size) + "px"
  };
  updatedCard.views[viewId].size = roundedSize;
  return updateObject(state, {[cardId]: updatedCard});
};

const updCardColor = (state, cardId, viewId, color) => {
  let updatedCard = {...state[cardId]};
  updatedCard.views[viewId].color = color;
  return updateObject(state, {[cardId]: updatedCard});
};

const updCardColorForAllViews = (state, cardId, color) => {
  let updatedCard = {...state[cardId]};
  for (let view in updatedCard.views) {
    updatedCard.views[view].color = color;
  }
  return updateObject(state, {[cardId]: updatedCard});
};

const updCardType = (state, cardId, viewId, cardType) => {
  let updatedCard = {...state[cardId]};
  updatedCard.views[viewId].cardType = cardType;
  return updateObject(state, {[cardId]: updatedCard});
}

const updCardTitle = (state, cardId, title) => {
  let updatedCard = {...state[cardId]};
  updatedCard.content.title = title;
  return updateObject(state, {[cardId]: updatedCard});
};

const updCardText = (state, cardId, text) => {
  let updatedCard = {...state[cardId]};
  updatedCard.content.text = text;
  return updateObject(state, {[cardId]: updatedCard});
};

export default reducer;