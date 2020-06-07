import * as actionTypes from '../actionTypes';
import fire from '../../shared/fire';
const db = fire.firestore();

export const updCard = (id, data) => {
  return {
    type: actionTypes.UPD_CARD,
    id: id,
    data: data,
  };
};

export const fetchCards = (userId, campaignId) => {
  const cardsRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("cards");

  return dispatch => {
    cardsRef.onSnapshot(snapshot => {
      snapshot.docChanges().forEach(card => {
        if (card.type === "added") {
          console.log("[fetchCards] added card:", card.doc.id, card.doc.data());
          dispatch(updCard(card.doc.id, card.doc.data()));
        }
        if (card.type === "modified") {
          console.log("[fetchCards] modified card: ", card.doc.data());
          dispatch(updCard(card.doc.id, card.doc.data()));
        }
        if (card.type === "removed") {
          console.log("[fetchCards] removed card: ", card.doc.data());
          dispatch(updCard(card.doc.id, null));
        }
      });
    })
  };
};

export const saveCardContent = () => {

};

export const saveCardPos = (e, data, userId, campaignId, cardKey) => {
  const cardRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("cards").doc(cardKey);
  let dataPackage = { x: data.x, y: data.y };

  return dispatch => {
    cardRef.set(dataPackage, { merge: true }).then(response => {
      console.log("[saveCardPos] Response: " + response);
    }).catch(error => console.log("[saveCardPos] Error: " + error));
  }
};

export const addCard = (userId, campaignId, activeView) => {
  const cardsRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("cards");
  let dataPackage = { x: 100, y: 25, views: [activeView] };
  return dispatch => cardsRef.add(dataPackage).then(response =>
    console.log("[addCard] added card:", response.id)
  ).catch(error => 
    console.log("[addCard] Error:" + error)
  );
};

export const removeCard = (userId, campaignId, cardId) => {
  const cardRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("cards").doc(cardId);
  return dispatch => cardRef.delete().then(
    console.log("removeCard] removed card:", cardId)
  ).catch(error => 
    console.log("[removeCard] Error:" + error)
  );
};