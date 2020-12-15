import * as actionTypes from '../actionTypes';
import fire from '../../shared/firebase';
import { updateObject } from '../../shared/utilityFunctions';
import { GRID } from '../../shared/constants/grid';
const db = fire.firestore();

// <-----SIMPLE CARD REDUCER CALLS----->
const loadCardColl = (cardColl) => { return { type: actionTypes.LOAD_CARD_COLL, cardColl: cardColl }; };
const saveEditedCard = (card) => { return { type: actionTypes.SAVE_EDITED_CARD, card: card }; };
const addCard = (card, dataPackage) => { return { type: actionTypes.ADD_CARD, card: card, dataPackage: dataPackage }; };
const deleteCard = (card) => { return { type: actionTypes.DELETE_CARD, card: card }; };
export const connectCardToView = (card, view, pos, size, color) => { return { type: actionTypes.CONNECT_CARD_TO_VIEW, card: card, view: view, pos: pos, size: size, color: color }; };
export const removeCardFromView = (card, view) => { return { type: actionTypes.REMOVE_CARD_FROM_VIEW, card: card, view: view }; };
export const updCardPos = (card, view, pos) => { return { type: actionTypes.UPD_CARD_POS, card: card, view: view, pos: pos }; };
export const updCardSize = (card, view, size) => { return { type: actionTypes.UPD_CARD_SIZE, card: card, view: view, size: size }; };
export const updCardColor = (card, view, color) => { return { type: actionTypes.UPD_CARD_COLOR, card: card, view: view, color: color }; };
export const updCardColorForAllViews = (card, color) => { return { type: actionTypes.UPD_CARD_COLOR_FOR_ALL_VIEWS, card: card, color: color }; };
export const updCardType = (card, view, cardType) => { return { type: actionTypes.UPD_CARD_TYPE, card: card, view: view, cardType: cardType }; };
export const updCardTitle = (card, title) => { return { type: actionTypes.UPD_CARD_TITLE, card: card, title: title }; };
export const updCardText = (card, text) => { return { type: actionTypes.UPD_CARD_TEXT, card: card, text: text }; };

// <-----SIMPLE CARDMANAGE REDUCER CALLS----->
const queueCardDelete = (card) => { return { type: actionTypes.QUEUE_CARD_DELETE, card: card }; };
const clearCardDelete = () => { return { type: actionTypes.CLEAR_CARD_DELETE }; };
export const updActiveCard = (card) => { return { type: actionTypes.UPD_ACTIVE_CARD, card: card }; };

// <-----COMPLEX CALLS----->
export const fetchCardColl = (user, campaign) => {
  const cardCollRef = db.collection("users").doc(user).collection("campaigns").doc(campaign).collection("cards");
  return dispatch => {
    cardCollRef.get()
      .then(snapshot => {
        console.log("[fetchCardColl] firebase success: added", snapshot.size, "cards")
        let cardColl = {};
        snapshot.forEach(card => {
          cardColl = updateObject(cardColl, {
            [card.id]: card.data()
          });
        });
        dispatch(loadCardColl(cardColl));
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
        console.log("[saveCards] batch set:", cardColl[card]);
      }
    }
    for (let card in cardDelete) {
      let cardRef = cardCollRef.doc(cardDelete[card]);
      batch.delete(cardRef);
      console.log("[saveCards] batch delete:", cardDelete[card])
    }
    batch.commit()
      .then(response => {
        console.log("[saveCards] firebase batch success:", response);
        for (let card in cardColl) {
          if (cardColl[card].edited) {
            dispatch(saveEditedCard(card));
          }
        }
        dispatch(clearCardDelete());
      })
      .catch(error => console.log("[saveCards] firebase batch error:", error));
  };
};

export const setCardCreate = (user, campaign, view) => {
  const cardCollRef = db.collection("users").doc(user).collection("campaigns").doc(campaign).collection("cards");
  let dataPackage = { 
    views: { 
      [view]: { 
        pos: {x: 100, y: 100},
        size: {width: 300, height: 400},
        color: "gray",
        cardType: "card",
      },
    },
    data: {
      title: "untitled",
      text: "Fill me in!"
    },
  };
  return dispatch => {
    cardCollRef.add(dataPackage)
      .then(response => {
        console.log("[setCardCreate] firebase success: added card", response.id);
        dispatch(addCard(response.id, dataPackage));
      })
      .catch(error => console.log("[setCardCreate] firebase error:", error));
  };
};

export const setCardDelete = (card) => {
  return dispatch => {
    dispatch(deleteCard(card));
    dispatch(queueCardDelete(card));
  };
};

export const copyCard = (user, campaign, cardState, view) => {
  const cardCollRef = db.collection("users").doc(user).collection("campaigns").doc(campaign).collection("cards");
  let dataPackage = {
    views: {
      [view]: {
        ...cardState.views[view],
        pos: {x: cardState.views[view].pos.x + GRID.size, y: cardState.views[view].pos.y + GRID.size},
        // size: {width: cardState.views[view].size.width, height: cardState.views[view].size.height},
        // color: cardState.views[view].color,
        // cardType: cardState.views[view].cardType,
      },
    },
    data: {...cardState.data},
  };
  return dispatch => {
    cardCollRef.add(dataPackage)
      .then(response => {
        console.log("[copyCard] firebase success: copied card", response.id);
        dispatch(addCard(response.id, dataPackage));
      })
      .catch(error => console.log("[copyCard] firebase error:", error));
  };
};