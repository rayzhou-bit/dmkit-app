import * as actionTypes from '../actionTypes';
import fire from '../../shared/fire';
const db = fire.firestore();

// <-----REDUCER CALLS----->
const updCardPos = (card, view, pos) => { return { type: actionTypes.UPD_CARD_POS, card: card, view: view, pos: pos } };
const updCardData = (card, data) => { return { type: actionTypes.UPD_CARD_DATA, card: card, data: data } };
const updCardEdited = (card, edited) => { return { type: actionTypes.UPD_CARD_EDITED, card: card, edited: edited } };
const updActiveCard = (card) => { return { type: actionTypes.UPD_ACTIVE_CARD, card: card } };
// <-----REDUCER CALLS----->

export const fetchCards = (userId, campaignId) => {
  const cardsRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("cards");
  return dispatch => {
    cardsRef.get()
      .then(snapshot => {
        snapshot.forEach(card => {
          let views = card.data().views ? card.data().views : null;
          let data = card.data().data ? card.data().data : null;
          for (let view in views) {
            dispatch(updCardPos(card.id, view, views[view]));
          }
          dispatch(updCardData(card.id, data));
          console.log("[fetchCards] firebase fetched card:", card.id, card.data());
        });
      })
      .catch(error => console.log("[fetchCards] firebase error:", error));
  };
};

export const saveEditedCardData = (userId, campaignId, cards) => {
  const cardsRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("cards");
  return dispatch => {
    let batch = db.batch();
    for (let card in cards) {
      if (cards[card].edited) {
        let cardRef = cardsRef.doc(card);
        let dataPackage = { views: cards[card].views, data: cards[card].data };
        batch.set(cardRef, dataPackage);
        dispatch(updCardEdited(card, false));
        console.log("[saveEditedCardData] batched:", card);
      }
    }
    batch.commit()
      .then(response => console.log("[saveEditedCardData] firebase response:", response))
      .catch(error => console.log("[saveEditedCardData] firebase error:", error));
  };
};

export const createCard = (userId, campaignId, activeView) => {
  const cardsRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("cards");
  let dataPackage = { views: { [activeView]: {x: 100, y: 100} }, data: null };
  return dispatch => {
    cardsRef.add(dataPackage)
      .then(response => {
        console.log("[createCard] firebase added card:", response.id);
        dispatch(updCardPos(response.id, activeView, {x: 100, y: 100}));
        dispatch(updCardData(response.id, null));
        dispatch(updCardEdited(response.id, true));
        console.log("[createCard] added card:", response.id);
      })
      .catch(error => console.log("[createCard] firebase error:", error));
  };
};

export const removeCard = (activeView, cardId) => {
  return dispatch => {
    dispatch(updCardPos(cardId, activeView, null));
    dispatch(updCardEdited(cardId, true));
    console.log("[removeCard] removed card:", cardId);
  };
};

export const deleteCard = () => {};

export const saveCardPos = (activeView, cardId, e, pos) => {
  return dispatch => {
    dispatch(updCardPos(cardId, activeView, {x: pos.x, y: pos.y}));
    dispatch(updCardEdited(cardId, true));
    console.log("[saveCardPos] updated card:", cardId, pos);
  };
};

export const saveCardData = (cardId, data) => {
  return dispatch => {
    dispatch(updCardData(cardId, {
      title: data.title,
      text: data.text,
    }));
    dispatch(updCardEdited(cardId, true));
    console.log("[saveCardData] updated card:", cardId);
  };
};

export const onClickCard = (activeCard, cardId) => {
  return dispatch => {
    dispatch(updActiveCard(cardId));
    console.log("[onClickCard] updated activeCard:", cardId)
  };
};