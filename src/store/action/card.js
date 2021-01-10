import * as actionTypes from '../actionTypes';
import * as actions from '../actionIndex';
import { updateObject } from '../../shared/utilityFunctions';
import { GRID } from '../../shared/constants/grid';

// <-----SIMPLE CARD REDUCER CALLS----->
export const initCardColl = () => { return { type: actionTypes.INIT_CARD_COLL }; };
export const loadCardColl = (cardColl) => { return { type: actionTypes.LOAD_CARD_COLL, cardColl: cardColl }; };
export const unloadCardColl = () => { return { type: actionTypes.UNLOAD_CARD_COLL }; };
export const resetCardEdit = (cardId) => { return { type: actionTypes.RESET_CARD_EDIT, cardId: cardId }; };
export const addCardToStore = (cardId, cardData) => { return { type: actionTypes.ADD_CARD, cardId: cardId, cardData: cardData }; };
export const deleteCardFromStore = (cardId) => { return { type: actionTypes.DELETE_CARD, cardId: cardId }; };
export const connectCardToView = (cardId, viewId, pos, size, color) => { return { type: actionTypes.CONNECT_CARD_TO_VIEW, cardId: cardId, viewId: viewId, pos: pos, size: size, color: color }; };
export const removeCardFromView = (cardId, viewId) => { return { type: actionTypes.REMOVE_CARD_FROM_VIEW, cardId: cardId, viewId: viewId }; };
export const updCardPos = (cardId, viewId, pos) => { return { type: actionTypes.UPD_CARD_POS, cardId: cardId, viewId: viewId, pos: pos }; };
export const updCardSize = (cardId, viewId, size) => { return { type: actionTypes.UPD_CARD_SIZE, cardId: cardId, viewId: viewId, size: size }; };
export const updCardColor = (cardId, viewId, color) => { return { type: actionTypes.UPD_CARD_COLOR, cardId: cardId, viewId: viewId, color: color }; };
export const updCardColorForAllViews = (cardId, color) => { return { type: actionTypes.UPD_CARD_COLOR_FOR_ALL_VIEWS, cardId: cardId, color: color }; };
export const updCardType = (cardId, viewId, cardType) => { return { type: actionTypes.UPD_CARD_TYPE, cardId: cardId, viewId: viewId, cardType: cardType }; };
export const updCardTitle = (cardId, title) => { return { type: actionTypes.UPD_CARD_TITLE, cardId: cardId, title: title }; };
export const updCardText = (cardId, text) => { return { type: actionTypes.UPD_CARD_TEXT, cardId: cardId, text: text }; };

// <-----SIMPLE CARDMANAGE REDUCER CALLS----->
export const initCardManage = () => { return { type: actionTypes.INIT_CARD_MANAGE }; };
export const updActiveCard = (activeCard) => { return { type: actionTypes.UPD_ACTIVE_CARD, activeCard: activeCard }; };
const queueCardCreate = (cardId) => { return { type: actionTypes.QUEUE_CARD_CREATE, cardId: cardId }; };
export const dequeueCardCreate = (cardId) => { return { type: actionTypes.DEQUEUE_CARD_CREATE, cardId: cardId }; };
const clearCardCreate = () => { return { type: actionTypes.CLEAR_CARD_CREATE }; };
const queueCardDelete = (cardId) => { return { type: actionTypes.QUEUE_CARD_DELETE, cardId: cardId }; };
export const clearCardDelete = () => { return { type: actionTypes.CLEAR_CARD_DELETE }; };

// <-----COMPLEX CALLS----->
export const setCardCreate = (cardCreateCnt, viewId) => {
  const cardId = "card" + (cardCreateCnt++);
  const cardData = { 
    views: { 
      [viewId]: { 
        pos: {x: 100, y: 100},
        size: {width: 300, height: 400},
        color: "gray",
        cardType: "card",
      },
    },
    data: {
      title: "untitled",
      text: ""
    },
  };
  return dispatch => {
    dispatch(addCardToStore(cardId, cardData));
    dispatch(queueCardCreate(cardId));
  };
};

export const setCardDelete = (cardId) => {
  return dispatch => {
    dispatch(deleteCardFromStore(cardId));
    dispatch(queueCardDelete(cardId));
  };
};

export const setCardCopy = (cardState, view, cardCreateCnt) => {
  const cardId = "card" + (cardCreateCnt++);
  const dataPackage = {
    views: {
      [view]: {
        ...cardState.views[view],
        pos: {x: cardState.views[view].pos.x + GRID.size, y: cardState.views[view].pos.y + GRID.size},
      },
    },
    data: {...cardState.data},
  };
  return dispatch => {
    dispatch(addCardToStore(cardId, dataPackage));
    dispatch(queueCardCreate(cardId));
  };
};