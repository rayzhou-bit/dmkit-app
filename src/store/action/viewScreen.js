import * as actionTypes from '../actionTypes';
import fire from '../../shared/fire';

export const updCardPos = (key, data) => {
  return {
    type: actionTypes.UPD_CARD_POS,
    key: key,
    data: data,
  }
};

export const saveCardPos = (e, data, userId, campaignId, cardKey) => {
  const db = fire.firestore();
  const cardRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("cards").doc(cardKey);
  let dataPackage = {x: data.x, y: data.y};

  return dispatch => {
    cardRef.set(dataPackage, {merge: true}).then(response => {
      console.log("saveCardPos Response: " + response);
      dispatch(updCardPos(cardKey, dataPackage));
    }).catch(error => {
      console.log("saveCardPos Error: " + error);
    });
  }
}

export const fetchCards = (userId, campaignId) => {
  const db = fire.firestore();
  const cardsRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("cards");

  return dispatch => {cardsRef.onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === "added") {
        console.log("added ", change.doc.id, change.doc.data());
        dispatch(updCardPos(change.doc.id, change.doc.data()));
      }
      if (change.type === "modified") {
        console.log("modified: ", change.doc.data());
        dispatch(updCardPos(change.doc.id, change.doc.data()));
      }
      if (change.type === "removed") {
        console.log("removed: ", change.doc.data());
        dispatch(updCardPos(change.doc.id, null));
      }
    });
  })};
};

export const addCard = (userId, campaignId) => {
  const db = fire.firestore();
  const cardsRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("cards");
  let dataPackage = {x: 100, y: 25};

  return dispatch => {cardsRef.add(
    dataPackage
  ).then().catch(error =>
    console.log("addCard Error: " + error)
  )};
};

export const removeCard = (userId, campaignId, cardId) => {
  const db = fire.firestore();
  const cardRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("cards").doc(cardId);

  return dispatch => {cardRef.delete().then().catch(error =>
    console.log("removeCard Error: " + error)
  )}
};