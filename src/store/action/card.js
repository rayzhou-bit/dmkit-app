import * as actionTypes from '../actionTypes';
import fire from '../../shared/fire';
import { updateObject } from '../../shared/utility';
const db = fire.firestore();

// <-----SIMPLE CARD REDUCER CALLS----->
const loadCardColl = (cardColl) => { return { type: actionTypes.LOAD_CARD_COLL, cardColl: cardColl }; };
const saveEditedCard = (card) => { return { type: actionTypes.SAVE_EDITED_CARD, card: card }; };
const addCard = (card, view, pos) => { return { type: actionTypes.ADD_CARD, card: card, view: view, pos: pos }; };
const deleteCard = (card) => { return { type: actionTypes.DELETE_CARD, card: card }; };
export const removeCardFromView = (card, view) => { return { type: actionTypes.REMOVE_CARD_FROM_VIEW, card: card, view: view }; };
export const updCardPos = (card, view, pos) => { return { type: actionTypes.UPD_CARD_POS, card: card, view: view, pos: pos }; };
export const updCardText = (card, text) => { return { type: actionTypes.UPD_CARD_TEXT, card: card, text: text }; };

// <-----SIMPLE CARDMANAGE REDUCER CALLS----->
const queueCardDelete = (card) => { return { type: actionTypes.QUEUE_CARD_DELETE, card: card }; };
const clearCardDelete = () => { return { type: actionTypes.CLEAR_CARD_DELETE }; };
const updActiveCard = (card) => { return { type: actionTypes.UPD_ACTIVE_CARD, card: card }; };

// <-----COMPLEX CALLS----->
export const fetchCardColl = (user, campaign) => {
  const cardCollRef = db.collection("users").doc(user).collection("campaigns").doc(campaign).collection("cards");
  return dispatch => {
    cardCollRef.get()
      .then(snapshot => {
        let cardColl = {};
        snapshot.forEach(card => {
          cardColl = updateObject(cardColl, {
            [card.id]: card.data()
          });
        });
        dispatch(loadCardColl(cardColl));
        // snapshot.forEach(card => {
        //   let views = card.data().views ? card.data().views : null;
        //   let data = card.data().data ? card.data().data : null;
        //   for (let view in views) {
        //     dispatch(updCardPos(card.id, view, views[view]));
        //   }
        //   dispatch(updCardData(card.id, data));
        //   console.log("[fetchCardColl] firebase fetched card:", card.id, card.data());
        // });
      })
      .catch(error => console.log("[fetchCardColl] firebase error:", error));
  };
};

export const saveCards = (user, campaign, cardColl, cardDelete) => {
  const cardCollRef = db.collection("users").doc(user).collection("campaigns").doc(campaign).collection("cards");
  return dispatch => {
    let batch = db.batch();
    for (let card in cardColl) {
      if (cardColl[card].edited) {
        let cardRef = cardCollRef.doc(card);
        let dataPackage = cardColl[card];
        delete dataPackage.edited;
        batch.set(cardRef, dataPackage);
        console.log("[saveCards] batch set:", card);
      }
    }
    for (let card in cardDelete) {
      let cardRef = cardCollRef.doc(card);
      batch.delete(cardRef);
      console.log("[saveCards] batch delete:", card)
    }
    batch.commit()
      .then(response => {
        console.log("[saveCards] firebase batch success:", response);
        for (let card in cardColl) {
          if (cardColl[card].edited) {
            dispatch(saveEditedCard(card));
          }
        }
        dispatch(clearCardDelete);
      })
      .catch(error => console.log("[saveCards] firebase batch error:", error));
  };
};

export const setCardCreate = (user, campaign, view) => {
  const cardCollRef = db.collection("users").doc(user).collection("campaigns").doc(campaign).collection("cards");
  let dataPackage = { views: { [view]: {x: 100, y: 100} } };
  return dispatch => {
    cardCollRef.add(dataPackage)
      .then(response => {
        console.log("[setCardCreate] firebase add card success:", response.id);
        dispatch(addCard(response.id, view));
      })
      .catch(error => console.log("[setCardCreate] firebase add card error:", error));
  };
};

export const setCardDelete = (card) => {
  return dispatch => {
    dispatch(deleteCard(card));
    dispatch(queueCardDelete(card));
  };
};

export const onClickCard = (card) => {
  return dispatch => dispatch(updActiveCard(card));
};