import * as actionTypes from '../actionTypes';
import { GRID } from '../../shared/constants/grid';

// <-----cardCollection REDUCER CALLS----->
export const initCardColl = () => { return { type: actionTypes.INIT_CARD_COLL }; };
export const loadCardColl = (cardColl) => { return { type: actionTypes.LOAD_CARD_COLL, cardColl: cardColl }; };
export const unloadCardColl = () => { return { type: actionTypes.UNLOAD_CARD_COLL }; };
export const addCard = (cardId, cardData) => { return { type: actionTypes.ADD_CARD, cardId: cardId, cardData: cardData }; };
export const removeCard = (cardId) => { return { type: actionTypes.REMOVE_CARD, cardId: cardId }; };
export const connectCardToView = (cardId, viewId, pos, size, color) => { return { type: actionTypes.CONNECT_CARD_TO_VIEW, cardId: cardId, viewId: viewId, pos: pos, size: size, color: color }; };
export const disconnectCardFromView = (cardId, viewId) => { return { type: actionTypes.DISCONNECT_CARD_FROM_VIEW, cardId: cardId, viewId: viewId }; };
export const updCardPos = (cardId, viewId, pos) => { return { type: actionTypes.UPD_CARD_POS, cardId: cardId, viewId: viewId, pos: pos }; };
export const updCardSize = (cardId, viewId, size) => { return { type: actionTypes.UPD_CARD_SIZE, cardId: cardId, viewId: viewId, size: size }; };
export const updCardColor = (cardId, viewId, color) => { return { type: actionTypes.UPD_CARD_COLOR, cardId: cardId, viewId: viewId, color: color }; };
export const updCardColorForAllViews = (cardId, color) => { return { type: actionTypes.UPD_CARD_COLOR_FOR_ALL_VIEWS, cardId: cardId, color: color }; };
export const updCardType = (cardId, viewId, cardType) => { return { type: actionTypes.UPD_CARD_TYPE, cardId: cardId, viewId: viewId, cardType: cardType }; };
export const updCardTitle = (cardId, title) => { return { type: actionTypes.UPD_CARD_TITLE, cardId: cardId, title: title }; };
export const updCardText = (cardId, text) => { return { type: actionTypes.UPD_CARD_TEXT, cardId: cardId, text: text }; };

// <-----campaignCollection REDUCER CALLS----->
const incrementCardCreateCnt = (campaignId) => { return { type: actionTypes.INCREMENT_CARD_CREATE_CNT }; };

// <-----dataManager REDUCER CALLS----->
export const updActiveCardId = (cardId) => { return { type: actionTypes.UPD_ACTIVE_CARD_ID, cardId: cardId }; };
const enqueueCardDelete = (cardId) => { return { type: actionTypes.ENQUEUE_CARD_DELETE, cardId: cardId }; };
export const clearCardDelete = () => { return { type: actionTypes.CLEAR_CARD_DELETE }; };

// <-----COMPLEX CALLS----->
export const createCard = (cardCreateCnt, viewId) => {
  const cardId = "card" + cardCreateCnt;
  const cardData = {
    views: {
      [viewId]: {
        pos: {x: 3*GRID.size, y: 3*GRID.size},
        size: {width: 8*GRID.size, height: 10*GRID.size},
        color: "gray",
        cardType: "card",
      },
    },
    content: {title: "untitled", text: ""},
  };
  return dispatch => {
    dispatch(addCard(cardId, cardData));
    dispatch(updActiveCardId(cardId));
    dispatch(incrementCardCreateCnt());
  };
};

export const destroyCard = (cardId) => {
  return dispatch => {
    dispatch(removeCard(cardId));
    dispatch(enqueueCardDelete(cardId));
  };
};

export const copyCard = (cardData, viewId, cardCreateCnt) => {
  const cardId = "card" + cardCreateCnt;
  const newCardData = {
    views: {
      [viewId]: {
        ...cardData.views[viewId],
        pos: {x: cardData.views[viewId].pos.x + GRID.size, y: cardData.views[viewId].pos.y + GRID.size},
      },
    },
    content: {...cardData.data},
  };
  return dispatch => {
    dispatch(addCard(cardId, newCardData));
    dispatch(updActiveCardId(cardId));
    dispatch(incrementCardCreateCnt());
  };
};