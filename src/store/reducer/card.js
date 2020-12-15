import * as actionTypes from '../actionTypes';
import { GRID } from '../../shared/constants/grid';
import { updateObject } from '../../shared/utilityFunctions';

const initialState = {
  // card1: {
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
  //       cardType: bubble || card,
  //     },
  //   },
  //   data: {
  //     title: "card title",
  //     text: "text field,
  //   }
  //   edited: boolean,
  // }
};

const saveEditedCard = (state, action) => {
  const updatedCard = updateObject(state[action.card], {edited: false});
  return updateObject(state, updatedCard);
};

const addCard = (state, action) => {
  let newCard = { [action.card]: action.dataPackage };
  newCard.edited = true;
  return updateObject(state, newCard);
};

const deleteCard = (state, action) => {
  let updatedCardColl = {...state};
  delete updatedCardColl[action.card];
  return updatedCardColl;
};

const connectCardToView = (state, action) => {
  let updatedCard = {...state[action.card]};
  updatedCard.views = updateObject(updatedCard.views, {
    [action.view]: {
      pos: action.pos,
      size: action.size,
      color: action.color,
    }
  });
  updatedCard.edited = true;
  return updateObject(state, {[action.card]: updatedCard});
};

const removeCardFromView = (state, action) => {
  let updatedCard = {...state[action.card]};
  delete updatedCard.views[action.view];
  updatedCard.edited = true;
  return updateObject(state, {[action.card]: updatedCard});
};

const updCardPos = (state, action) => {
  let updatedCard = {...state[action.card]};
  let roundedPos = {
    x: Math.round(action.pos.x / GRID.size) * GRID.size,
    y: Math.round(action.pos.y / GRID.size) * GRID.size
  };
  updatedCard.views[action.view].pos = roundedPos;
  updatedCard.edited = true;
  return updateObject(state, {[action.card]: updatedCard});
};

const updCardSize = (state, action) => {
  let updatedCard = {...state[action.card]};
  let roundedSize = {
    width: (Math.round(action.size.width.split("px").shift() / GRID.size) * GRID.size) + "px",
    height: (Math.round(action.size.height.split("px").shift() / GRID.size) * GRID.size) + "px"
  };
  updatedCard.views[action.view].size = roundedSize;
  updatedCard.edited = true;
  return updateObject(state, {[action.card]: updatedCard});
};

const updCardColor = (state, action) => {
  let updatedCard = {...state[action.card]};
  updatedCard.views[action.view].color = action.color;
  updatedCard.edited = true;
  return updateObject(state, {[action.card]: updatedCard});
};

const updCardColorForAllViews = (state, action) => {
  let updatedCard = {...state[action.card]};
  for (let view in updatedCard.views) {
    updatedCard.views[view].color = action.color;
  }
  updatedCard.edited = true;
  return updateObject(state, {[action.card]: updatedCard});
};

const updCardType = (state, action) => {
  let updatedCard = {...state[action.card]};
  updatedCard.views[action.view].cardType = action.cardType;
  updatedCard.edited = true;
  return updateObject(state, {[action.card]: updatedCard});
}

const updCardTitle = (state, action) => {
  let updatedCard = {...state[action.card]};
  updatedCard.data.title = action.title;
  updatedCard.edited = true;
  return updateObject(state, {[action.card]: updatedCard});
};

const updCardText = (state, action) => {
  let updatedCard = {...state[action.card]};
  updatedCard.data.text = action.text;
  updatedCard.edited = true;
  return updateObject(state, {[action.card]: updatedCard});
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.LOAD_CARD_COLL: return updateObject(state, action.cardColl);
    case actionTypes.SAVE_EDITED_CARD: return saveEditedCard(state, action); 

    case actionTypes.ADD_CARD: return addCard(state, action);
    case actionTypes.DELETE_CARD: return deleteCard(state, action);
    case actionTypes.CONNECT_CARD_TO_VIEW: return connectCardToView(state, action);
    case actionTypes.REMOVE_CARD_FROM_VIEW: return removeCardFromView(state, action);

    case actionTypes.UPD_CARD_POS: return updCardPos(state, action);
    case actionTypes.UPD_CARD_SIZE: return updCardSize(state, action);
    case actionTypes.UPD_CARD_COLOR: return updCardColor(state, action);
    case actionTypes.UPD_CARD_COLOR_FOR_ALL_VIEWS: return updCardColorForAllViews(state, action);
    case actionTypes.UPD_CARD_TYPE: return updCardType(state, action);

    case actionTypes.UPD_CARD_TITLE: return updCardTitle(state, action);
    case actionTypes.UPD_CARD_TEXT: return updCardText(state, action);

    default: return state;
  }
};

export default reducer;