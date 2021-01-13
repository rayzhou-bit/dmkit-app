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
  //   data: {
  //     title: "card title",
  //     text: "text field,
  //     statblock: {
  //       active: boolean,
  //       attributes: {str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10},
  //       profBonus: 2,
  //     },
  //   },
  //   edited: boolean,
  // },
  card1: {
    views: {
      view1: {
        pos: {x: 60, y: 60},
        size: {width: 600, height: 450},
        color: "green",
        cardType: "card",
      },
    },
    data: {
      title: "Greetings Traveler!",
      text: "Welcome to DM Kit, a tool to help plan your next adventure."
    },
  },
  edited: false,
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
    // CARD AND SERVER
    case actionTypes.INIT_CARD_COLL: return initialState;
    case actionTypes.LOAD_CARD_COLL: return updateObject(state, action.cardColl);
    case actionTypes.UNLOAD_CARD_COLL: return {};
    case actionTypes.RESET_CARD_EDIT: return resetCardEdit(state, action.cardId); 

    // ADD/REMOVE CARD
    case actionTypes.ADD_CARD: return addCardToStore(state, action.cardId, action.cardData);
    case actionTypes.DELETE_CARD: return deleteCardFromStore(state, action.cardId);
    case actionTypes.CONNECT_CARD_TO_VIEW: return connectCardToView(state, action.cardId, action.viewId, action.pos, action.size, action.color);
    case actionTypes.REMOVE_CARD_FROM_VIEW: return removeCardFromView(state, action.cardId, action.viewId);

    // CARD VISUAL
    case actionTypes.UPD_CARD_POS: return updCardPos(state, action.cardId, action.viewId, action.pos.x, action.pos.y);
    case actionTypes.UPD_CARD_SIZE: return updCardSize(state, action.cardId, action.viewId, action.size.width, action.size.height);
    case actionTypes.UPD_CARD_COLOR: return updCardColor(state, action.cardId, action.viewId, action.color);
    case actionTypes.UPD_CARD_COLOR_FOR_ALL_VIEWS: return updCardColorForAllViews(state, action.cardId, action.color);
    case actionTypes.UPD_CARD_TYPE: return updCardType(state, action.cardId, action.viewId, action.cardType);

    // CARD DATA
    case actionTypes.UPD_CARD_TITLE: return updCardTitle(state, action.cardId, action.title);
    case actionTypes.UPD_CARD_TEXT: return updCardText(state, action.cardId, action.text);

    default: return state;
  }
};

const resetCardEdit = (state, cardId) => {
  const updatedCard = updateObject(state[cardId], {edited: false});
  return updateObject(state, updatedCard);
};

const addCardToStore = (state, cardId, cardData) => {
  let newCard = { [cardId]: cardData };
  newCard.edited = true;
  return updateObject(state, newCard);
};

const deleteCardFromStore = (state, cardId) => {
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
  updatedCard.edited = true;
  return updateObject(state, {[cardId]: updatedCard});
};

const removeCardFromView = (state, cardId, viewId) => {
  let updatedCard = {...state[cardId]};
  delete updatedCard.views[viewId];
  updatedCard.edited = true;
  return updateObject(state, {[cardId]: updatedCard});
};

const updCardPos = (state, cardId, viewId, x, y) => {
  let updatedCard = {...state[cardId]};
  let roundedPos = {
    x: Math.round(x / GRID.size) * GRID.size,
    y: Math.round(y / GRID.size) * GRID.size
  };
  updatedCard.views[viewId].pos = roundedPos;
  updatedCard.edited = true;
  return updateObject(state, {[cardId]: updatedCard});
};

const updCardSize = (state, cardId, viewId, width, height) => {
  let updatedCard = {...state[cardId]};
  let roundedSize = {
    width: (Math.round(width.split("px").shift() / GRID.size) * GRID.size) + "px",
    height: (Math.round(height.split("px").shift() / GRID.size) * GRID.size) + "px"
  };
  updatedCard.views[viewId].size = roundedSize;
  updatedCard.edited = true;
  return updateObject(state, {[cardId]: updatedCard});
};

const updCardColor = (state, cardId, viewId, color) => {
  let updatedCard = {...state[cardId]};
  updatedCard.views[viewId].color = color;
  updatedCard.edited = true;
  return updateObject(state, {[cardId]: updatedCard});
};

const updCardColorForAllViews = (state, cardId, color) => {
  let updatedCard = {...state[cardId]};
  for (let view in updatedCard.views) {
    updatedCard.views[view].color = color;
  }
  updatedCard.edited = true;
  return updateObject(state, {[cardId]: updatedCard});
};

const updCardType = (state, cardId, viewId, cardType) => {
  let updatedCard = {...state[cardId]};
  updatedCard.views[viewId].cardType = cardType;
  updatedCard.edited = true;
  return updateObject(state, {[cardId]: updatedCard});
}

const updCardTitle = (state, cardId, title) => {
  let updatedCard = {...state[cardId]};
  updatedCard.data.title = title;
  updatedCard.edited = true;
  return updateObject(state, {[cardId]: updatedCard});
};

const updCardText = (state, cardId, text) => {
  let updatedCard = {...state[cardId]};
  updatedCard.data.text = text;
  updatedCard.edited = true;
  return updateObject(state, {[cardId]: updatedCard});
};

export default reducer;