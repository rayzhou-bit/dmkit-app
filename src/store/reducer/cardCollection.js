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
        pos: {x: 5*GRID.size, y: 7*GRID.size},
        size: {width: 16*GRID.size, height: 10*GRID.size},
        color: "green",
        cardType: "card",
      },
    },
    content: {
      title: "Greetings Traveler!",
      text: "Welcome to DM Kit, a tool to help plan your next adventure. Please create an account to save your work!",
    },
  },
  card1: {
    views: {
      view1: {
        pos: {x: 0, y: 0},
        size: {width: 8*GRID.size, height: 7*GRID.size},
        color: "blue",
        cardType: "card",
      },
    },
    content: {
      title: "Tools",
      text: "Use the buttons to the left to add cards, copy cards and save your progress. You must have an account to save.",
    },
  },
  card2: {
    views: {
      view1: {
        pos: {x: 1*GRID.size, y: 20*GRID.size},
        size: {width: 10*GRID.size, height: 5*GRID.size},
        color: "blue",
        cardType: "card",
      },
    },
    content: {
      title: "Views",
      text: "Use the buttons below to add views and switch between them.",
    },
  },
  card3: {
    views: {
      view1: {
        pos: {x: 30*GRID.size, y: 3*GRID.size},
        size: {width: 10*GRID.size, height: 6*GRID.size},
        color: "blue",
        cardType: "card",
      },
    },
    content: {
      title: "Library",
      text: "All the cards you create are stored in the library, which you can access by clicking the book to the right.",
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
    case actionTypes.LINK_CARD_TO_VIEW: return linkCardToView(state, action.cardId, action.viewId, action.pos, action.size, action.color);
    case actionTypes.UNLINK_CARD_FROM_VIEW: return unlinkCardFromView(state, action.cardId, action.viewId);

    // Update visuals
    case actionTypes.UPD_CARD_POS: return updCardPos(state, action.cardId, action.viewId, action.pos.x, action.pos.y);
    case actionTypes.UPD_CARD_SIZE: return updCardSize(state, action.cardId, action.viewId, action.size.width, action.size.height);
    case actionTypes.UPD_CARD_COLOR: return updCardColor(state, action.cardId, action.viewId, action.color);
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

const linkCardToView = (state, cardId, viewId, pos, size, color) => {
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

const unlinkCardFromView = (state, cardId, viewId) => {
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