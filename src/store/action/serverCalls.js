import * as actionTypes from '../actionTypes';
import * as actions from '../actionIndex';
import fire from '../../shared/firebase';
import { updateObject } from '../../shared/utilityFunctions';
const db = fire.firestore();

export const authCheck = (prevUser) => {
  const userCollRef = db.collection("users");
  // this observes user changes
  return dispatch => {
    fire.auth().onAuthStateChanged(userId => {
      console.log("[authCheck] firebase response:", userId);
      if (userId) {
        // Signed In
        // 1) Check for first time setup.
        // 2) If there is an unsaved campaign, prompt the user if he wants to create a new campaign 
        //    under the user. Set this as the activeCampaign.
        // 3) If there is no unsaved campaign, load the activeCampaign.
        userCollRef.doc(userId).get()
          .then(doc => {
            if (doc.exists) {
              if (!doc.data().firstTimeSetup) {
                firstTimeSetup(userId);
              }
              if (!doc.data().activeCampaign) {
                dispatch(actions.updActiveCampaign(doc.data().activeCampaign));
              }
            }
          })
          .catch(error => console.log("[authCheck] failed:", error));
        
        // dispatch(updUser(userId.uid));
      } else {
        // Signed Out         
        dispatch(actions.unloadCampaignColl());
        dispatch(actions.unloadCardColl());
        dispatch(actions.unloadViewColl());
      }
    });
  };
};

const firstTimeSetup = (userId) => {
  // This will set up firebase collections for a campaign.
  // This is to be expanded upon in the future.
  const userRef = db.collection("users").doc(userId);
  userRef.set({
    firstTimeSetup: true,
  }, {merge: true})
  .then(response => console.log("[firstTimeSetup] setup success:", response))
  .catch(error => console.log("[firstTimeSetup] firebase error:", error));
};

export const emailSignIn = (email, psw) => {
  return dispatch => {
    fire.auth().signInWithEmailAndPassword(email, psw)
      .then(response => {
        console.log("[emailSignIn] firebase response:", response);
        dispatch(actions.updUser(response.user.uid));
      })
      .catch(error => console.log("[emailSignIn] firebase error:", error.code, error.message));
  };
};

export const emailSignUp = (email, psw) => {
  return dispatch => {
    fire.auth().createUserWithEmailAndPassword(email, psw)
      .then(response => {
        console.log("[emailSignUp] firebase response:", response);
        // IMPLEMENT: SIGN UP PROCEDURES
      })
      .catch(error => console.log("[emailSignUp] firebase error:", error.code, error.message));
  };
};

export const emailSignOut = () => {
  return dispatch => {
    fire.auth().signOut()
      .then(() => {
        console.log("[emailSignout] firebase sign out successful");
        dispatch(actions.updUser(null));
      })
      .catch(error => console.log("[emailSignOut] firebase error:", error));
  };
};

export const fetchUserDataFromServer = (userId) => {
  const userRef = db.collection("users").doc(userId);
  const campaignCollRef = db.collection("users").doc(userId).collection("campaigns");
  return dispatch => {
    // USER: fetch user data here in the future
    // CAMPAIGN: fetch campaign collection
    campaignCollRef.get()
      .then(snapshot => {
        console.log("[fetchUserDataFromServer] loaded", snapshot.size, "campaigns");
        let campaignColl = {};
        snapshot.forEach(campaign => {
          campaignColl = updateObject(campaignColl, {
            [campaign.id]: {
              title: campaign.data().title
            }
          })
        });
        dispatch(actions.loadCampaignColl(campaignColl));
      })
      .catch(error => console.log("[fetchUserDataFromServer] error fetching campaign collection:", error));
    // CAMPAIGN: fetch activeCampaign
    userRef.get()
    .then(doc => {
      if (doc.exists) {
        if (doc.data().activeCampaign) {
          dispatch(actions.updActiveCampaign(doc.data().activeCampaign));
          console.log("[fetchUserDataFromServer] fetched activeCampaign:", doc.data().activeCampaign);
        }
      }
    })
    .catch(error => console.log("[fetchUserDataFromServer] error fetching activeCampaign:", error));
  };
};

export const saveUserDataToServer = () => {
  return dispatch => {

  };
};

export const fetchCampaignDataFromServer = (userId, campaignId) => {
  const campaignRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId);
  const cardCollRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("cards");
  const viewCollRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("views");
  return dispatch => {
    // CAMPAIGN: Campaign data is fetched when fetchUserDataFromServer is called
    // CARD: Fetch card collection
    cardCollRef.get()
      .then(snapshot => {
        console.log("[fetchCampaignDataFromServer] fetched", snapshot.size, "cards")
        let cardColl = {};
        snapshot.forEach(card => {
          cardColl = updateObject(cardColl, {
            [card.id]: card.data()
          });
        });
        dispatch(actions.loadCardColl(cardColl));
      })
      .catch(error => console.log("[fetchCampaignDataFromServer] error fetching cards:", error));
    // VIEW: Fetch view collection
    viewCollRef.get()
    .then(snapshot => {
      console.log("[fetchCampaignDataFromServer] fetched", snapshot.size, "views");
      let viewColl = {};
      snapshot.forEach(view => {
        viewColl = updateObject(viewColl, {
          [view.id]: view.data(),
        });
      });
      dispatch(actions.loadViewColl(viewColl));
    })
    .catch(error => console.log("[fetchCampaignDataFromServer] error fetching views:", error));
    // VIEW: Fetch viewOrder and activeView
    campaignRef.get()
      .then(doc => {
        if (doc.exists) {
          if (doc.data().viewOrder) {
            dispatch(actions.loadViewOrder(doc.data().viewOrder));
            console.log("[fetchCampaignDataFromServer] loaded viewOrder", doc.data().viewOrder);
          }
          if (doc.data().activeView) {
            dispatch(actions.updActiveView(doc.data().activeView));
            console.log("[fetchCampaignDataFromServer] set activeView", doc.data().activeView);
          }
        }
      })
      .catch(error => console.log("[fetchCampaignDataFromServer] error fetching viewOrder and activeView:", error));
  };
};

export const saveCampaignDataToServer = (userId, campaignId, campaignColl, cardColl, cardCreate, cardDelete, viewColl, viewCreate, viewDelete, viewOrder, activeView) => {
  // Saves everything from the campaign to the server
  const userRef = db.collection("users").doc(userId);
  const campaignRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId);
  const cardCollRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("cards");
  const viewCollRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("views");
  return dispatch => {
    let batch = db.batch();
    let newViewOrder = [...viewOrder];

    // CAMPAIGN (batched): Save campaign data
    batch.set(userRef, {activeCampaign: campaignId}, {merge: true});
    if (campaignColl[campaignId].title){
      batch.set(campaignRef, {title: campaignColl[campaignId].title}, {merge: true});
      console.log("[saveCampaignDataToServer] batch campaign:", campaignId);
    }

    // CARD (batched and not batched): Save card data
    cardColl.forEach(cardId => {
      if (cardCreate.includes(cardId)) {
        // Save new cards with no server id
        let dataPackage = cardColl[cardId];
        delete dataPackage.edited;
        // IMPLEMENT: maybe use add with the batch. check what the batch commits responds with
        cardCollRef.add(dataPackage)
          .then(response => {
            console.log("[saveCampaignDataToServer] added card", response.id);
            // create a card using server id and delete card with temp id
            dispatch(actions.addCardToStore(response.id, dataPackage));
            dispatch(actions.deleteCardFromStore(cardId));
            dispatch(actions.dequeueCardCreate(cardId));
          })
          .catch(error => console.log("[saveCampaignDataToServer] error adding card", cardId, ":", error));
      } else {
        // Save cards with server id
        const cardRef = cardCollRef.doc(cardId);
        let dataPackage = cardColl[cardId];
        delete dataPackage.edited;
        batch.set(cardRef, dataPackage, {merge: true});
        console.log("[saveCampaignDataToServer] batch set card:", cardId);
      }
    });

    // CARD (batched): Delete cards from the cardDelete queue
    cardDelete.forEach(cardId => {
      const cardRef = cardCollRef.doc(cardId);
      batch.delete(cardRef);
      console.log("[saveCampaignDataToServer] batch delete card:", cardId);
    });

    // VIEW (batched and not batched): Save view data
    viewColl.forEach(viewId => {
      if (viewCreate.includes(viewId)){
        // Save new views with no server id
        let dataPackage = viewColl[viewId];
        delete dataPackage.edited;
        // IMPLEMENT: maybe use add with the batch. check what the batch commits responds with
        viewCollRef.add(dataPackage)
          .then(response => {
            console.log("[saveCampaignDataToServer] added view", response.id);
            // create a view using server id and delete view with temp id
            dispatch(actions.addViewToStore(response.id, dataPackage));
            dispatch(actions.deleteViewFromStore(viewId));
            dispatch(actions.dequeueViewCreate(viewId));
            // replace the view in viewOrder
            const viewPos = newViewOrder.indexOf(viewId);
            newViewOrder.splice(viewPos, 1, response.id);
          })
          .catch(error => console.log("[saveCampaignDataToServer] error adding view", viewId, ":", error));
      } else {
        // Save views with server id
        const viewRef = viewCollRef.doc(viewId);
        let dataPackage = viewColl[viewId];
        delete dataPackage.edited;
        batch.set(viewRef, dataPackage, {merge: true});
        console.log("[saveCampaignDataToServer] batch set view:", viewId);
      }
    });

    // VIEW (batched): Delete views from the viewDelete queue
    viewDelete.forEach(viewId => {
      const viewRef = viewCollRef.doc(viewId);
      batch.delete(viewRef);
      console.log("[saveCampaignDataToServer] batch delete view:", viewId);
    });

    // VIEW (batched): Save viewOrder and activeView
    batch.set(campaignRef, {viewOrder: newViewOrder}, {merge: true});
    console.log("[saveCampaignDataToServer] batch set viewOrder:", newViewOrder);
    batch.set(campaignRef, {activeView: activeView}, {merge: true});
    console.log("[saveCampaignDataToServer] batch set activeView:", activeView);
    
    // SEND BATCH
    batch.commit()
    .then(response => {
      console.log("[saveCampaignDataToServer] batch commit success:", response);
      // CAMPAIGN: cleanup
      dispatch(actions.resetCampaignEdit(campaignId));
      // CARD: cleanup
      cardColl.forEach(cardId => {
        dispatch(actions.resetCardEdit(cardId));
      });
      dispatch(actions.clearCardDelete());
      // VIEW: cleanup
      viewColl.forEach(viewId => {
        dispatch(actions.resetViewEdit(viewId));
      });
      dispatch(actions.clearViewDelete());
      dispatch(actions.updViewOrder(newViewOrder));
    })
    .catch(error => {
      console.log("[saveCampaignDataToServer] batch commit error:", error);
      // NON-BATCH CLEANUP
      dispatch(actions.updViewOrder(newViewOrder));
    });
  };
};

export const autoSaveCampaignDataToServer = (userId, campaignId, campaignColl, cardColl, cardCreate, cardDelete, viewColl) => {
  // IMPLEMENT: this should only save edited stuff
  const campaignRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId);
  const cardCollRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("cards");
  const viewCollRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("views");
  return dispatch => {
    let batch = db.batch();

    // CAMPAIGN (batched): Save campaign data
    if (campaignColl[campaignId].title){
      batch.set(campaignRef, {title: campaignColl[campaignId].title}, {merge: true});
      console.log("[autoSaveCampaignDataToServer] batch campaign:", campaignId);
    }

    // CARD (not batched): Save edited cards from the cardCreate queue
    // IMPLEMENT: maybe put this in the batch. check what the batch commits responds with
    for (let card in cardCreate) {
      if (cardColl[card] && cardColl[card].edited) {
        let dataPackage = cardColl[card];
        delete dataPackage.edited;
        cardCollRef.add(dataPackage)
          .then(response => {
            console.log("[autoSaveCampaignDataToServer] added card", response.id);
            // create a card using server id and delete card with temp id
            dispatch(actions.addCardToStore(response.id, dataPackage));
            dispatch(actions.deleteCardFromStore(card));
            dispatch(actions.dequeueCardCreate(card));
          })
          .catch(error => console.log("[autoSaveCampaignDataToServer] error adding card", card, ":", error));
      }
    }
    // CARD (batched): Save edited cards not from the cardCreate queue
    for (let card in cardColl) {
      if (cardColl[card].edited) {
        const cardRef = cardCollRef.doc(card);
        let dataPackage = cardColl[card];
        delete dataPackage.edited;
        batch.set(cardRef, dataPackage, {merge: true});
        console.log("[autoSaveCampaignDataToServer] batch set card:", cardColl[card]);
      }
    }
    // CARD (batched): Delete cards from the cardDelete queue
    for (let card in cardDelete) {
      let cardRef = cardCollRef.doc(cardDelete[card]);
      batch.delete(cardRef);
      console.log("[autoSaveCampaignDataToServer] batch delete card:", cardDelete[card])
    }

    // VIEW (batched): Save edited views
    for (let view in viewColl) {
      if (viewColl[view].edited) {
        let viewRef = viewCollRef.doc(view);
        let dataPackage = viewColl[view];
        delete dataPackage.edited;
        batch.set(viewRef, dataPackage, {merge: true});
        console.log("[autoSaveCampaignDataToServer] batch set view:", viewColl[view]);
      }
    }
    
    // SEND BATCH
    batch.commit()
    .then(response => {
      console.log("[autoSaveCampaignDataToServer] batch commit successful:", response);
      // CAMPAIGN: cleanup
      dispatch(actions.resetCampaignEdit(campaignId));
      // CARD: cleanup
      for (let card in cardColl) {
        if (cardColl[card].edited) {
          dispatch(actions.resetCardEdit(card));
        }
      }
      dispatch(actions.clearCardDelete());
      // VIEW: cleanup
    })
    .catch(error => console.log("[autoSaveCampaignDataToServer] batch commit error:", error));
  };
};

export const createCampaignOnServer = (userId) => {
  // IMPLEMENT: This may need to be updated for when a new user saves a campaign
  const campaignCollRef = db.collection("users").doc(userId).collection("campaigns");
  let dataPackage = {
    title: "untitled",
    viewOrder: [],
  };
  return dispatch => {
    campaignCollRef.add(dataPackage)
      .then(response => {
        console.log("[createCampaignOnServer] created campaign", response.id);
        dispatch(actions.addCampaign(response.id, dataPackage));
      })
      .catch(error => console.log("[createCampaignOnServer] error creating campaign:", error));
  };
};