import * as actionTypes from '../actionTypes';
import { GRID } from '../../shared/constants/grid';

// <-----cardCollection REDUCER CALLS----->
export const initCardColl = () => { return { type: actionTypes.INIT_CARD_COLL }; };
export const loadCardColl = (cardColl) => { return { type: actionTypes.LOAD_CARD_COLL, cardColl: cardColl }; };
export const unloadCardColl = () => { return { type: actionTypes.UNLOAD_CARD_COLL }; };
const addCard = (cardId, cardData) => dispatch => { 
  dispatch({ type: actionTypes.ADD_CARD, cardId: cardId, cardData: cardData }); 
  dispatch(enqueueCardEdit(cardId)); dispatch(setCampaignEdit()); };
const removeCard = (cardId) => dispatch => { 
  dispatch({ type: actionTypes.REMOVE_CARD, cardId: cardId }); 
  dispatch(enqueueCardDelete(cardId)); dispatch(setCampaignEdit()); };
export const linkCardToView = (cardId, viewId, pos, size, color) => dispatch => { 
  dispatch({ type: actionTypes.LINK_CARD_TO_VIEW, cardId: cardId, viewId: viewId, pos: pos, size: size, color: color });
  dispatch(enqueueCardEdit(cardId)); dispatch(setCampaignEdit()); };
export const unlinkCardFromView = (cardId, viewId) => dispatch => {
  dispatch({ type: actionTypes.UNLINK_CARD_FROM_VIEW, cardId: cardId, viewId: viewId });
  dispatch(enqueueCardEdit(cardId)); dispatch(setCampaignEdit()); };
export const updCardPos = (cardId, viewId, pos) => dispatch => {
  dispatch({ type: actionTypes.UPD_CARD_POS, cardId: cardId, viewId: viewId, pos: pos });
  dispatch(enqueueCardEdit(cardId)); dispatch(setCampaignEdit()); };
export const updCardSize = (cardId, viewId, size) => dispatch => {
  dispatch({ type: actionTypes.UPD_CARD_SIZE, cardId: cardId, viewId: viewId, size: size });
  dispatch(enqueueCardEdit(cardId)); dispatch(setCampaignEdit()); };
export const updCardColor = (cardId, viewId, color) => dispatch => {
  dispatch({ type: actionTypes.UPD_CARD_COLOR, cardId: cardId, viewId: viewId, color: color });
  dispatch(enqueueCardEdit(cardId)); dispatch(setCampaignEdit()); };
export const updCardType = (cardId, viewId, cardType) => dispatch => {
  dispatch({ type: actionTypes.UPD_CARD_TYPE, cardId: cardId, viewId: viewId, cardType: cardType });
  dispatch(enqueueCardEdit(cardId)); dispatch(setCampaignEdit()); };
export const updCardTitle = (cardId, title) => dispatch => {
  dispatch({ type: actionTypes.UPD_CARD_TITLE, cardId: cardId, title: title });
  dispatch(enqueueCardEdit(cardId)); dispatch(setCampaignEdit()); };
export const updCardText = (cardId, text) => dispatch => {
  dispatch({ type: actionTypes.UPD_CARD_TEXT, cardId: cardId, text: text });
  dispatch(enqueueCardEdit(cardId)); dispatch(setCampaignEdit()); };

// <-----campaignCollection REDUCER CALLS----->
const incrementCardCreateCnt = (campaignId) => { return { type: actionTypes.INCREMENT_CARD_CREATE_CNT, campaignId: campaignId }; };

// <-----dataManager REDUCER CALLS----->
const setCampaignEdit = () => { return { type: actionTypes.SET_CAMPAIGN_EDIT }; };
export const updActiveCardId = (cardId) => { return { type: actionTypes.UPD_ACTIVE_CARD_ID, cardId: cardId }; };
const enqueueCardDelete = (cardId) => { return { type: actionTypes.ENQUEUE_CARD_DELETE, cardId: cardId }; };
export const clearCardDelete = () => { return { type: actionTypes.CLEAR_CARD_DELETE }; };
const enqueueCardEdit = (cardId) => { return { type: actionTypes.ENQUEUE_CARD_EDIT, cardId: cardId }; };
export const clearCardEdit = () => { return { type: actionTypes.CLEAR_CARD_EDIT }; };

// <-----COMPLEX CALLS----->
export const createCard = (campaignId, viewId, cardCreateCnt) => {
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
    content: {title: cardId, text: ""},
  };
  return dispatch => {
    dispatch(addCard(cardId, cardData));
    dispatch(updActiveCardId(cardId));
    dispatch(incrementCardCreateCnt(campaignId));
  };
};

export const destroyCard = (cardId) => {
  return dispatch => {
    dispatch(removeCard(cardId));
  };
};

export const copyCard = (campaignId, cardData, viewId, cardCreateCnt) => {
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
    dispatch(incrementCardCreateCnt(campaignId));
  };
};