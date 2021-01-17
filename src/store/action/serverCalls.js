import * as actions from '../actionIndex';
import { auth, store } from '../../shared/firebase';
import { updateObject } from '../../shared/utilityFunctions';
import { updActiveCampaign } from './campaign';

export const getUserId = () => auth.currentUser ? auth.currentUser.uid : null;
export const getUserEmail = () => auth.currentUser ? auth.currentUser.email : null;

export const emailSignUp = (email, psw) => {
  auth.createUserWithEmailAndPassword(email, psw)
    .then(resp => {
      console.log("[emailSignUp] sign up successful:", resp);
      // IMPLEMENT: sign up procedures and first time setup
      if (resp.user.uid) {
        const dataPackage = {
          campaignCreateCnt: 0,
          firstTimeSetup: true,
        };
        store.collection("users").doc(resp.user.uid).set(dataPackage);
      }
    })
    .catch(err => console.log("[emailSignUp] error:", err));
};

export const emailSignIn = (email, psw) => {
    auth.signInWithEmailAndPassword(email, psw)
      .then(resp => {
        console.log("[emailSignIn] sign in successful:", resp);
      })
      .catch(err => console.log("[emailSignIn] error:", err));
};

export const emailSignOut = () => {
  auth.signOut()
    .then(resp => {
      console.log("[emailSignout] sign out successful:", resp);
    })
    .catch(err => console.log("[emailSignOut] error:", err));
};

export const switchCampaign = (nextCampId, currCampId, campaignColl, cardColl, viewColl, cardManager, viewManager) => {
  // IMPLEMENT: prompt user if they want to save current campaign. give option to say no
  const userId = getUserId();
  return dispatch => {
    if (currCampId) {
      // Save current campaign.
      dispatch(saveCampaignDataToServer(currCampId, campaignColl, cardColl, viewColl, cardManager, viewManager));
      // Unload current campaign.
      dispatch(unloadCampaign());
    }
    // Update active campaign.
    store.collection("users").doc(userId).set({activeCampaignId: nextCampId})
      .then(resp => {
        dispatch(updActiveCampaign(nextCampId));
        console.log("[switchCampaign] set activeCampaignId from", currCampId, "to", nextCampId);
      }).catch(err => console.log("[switchCampaign] error setting activeCampaignId:", err));
    // Fetch updated active campaign.
    dispatch(fetchCampaignDataFromServer());
  };
};

export const createCampaign = (currCampId, campaignColl, cardColl, viewColl, cardManager, viewManager) => {
  const userId = getUserId();
  const dataPackage = {
    title: "untitled campaign",
    viewOrder: [], activeViewId: null,
    cardCreateCnt: 0, viewCreateCnt: 0,
  };
  return dispatch => {
    // Create a new campaign on the server.
    if (userId) {
      // IMPLMENT: loading start
      let campaignCreateCnt = null;
      store.collection("users").doc(userId).get()
        .then(userData => {
          if (userData.exists) {
            if (userData.data().campaignCreateCnt) {
              campaignCreateCnt = userData.data().campaignCreateCnt;
            } else {
              campaignCreateCnt = 0;
            }
            // IMPLEMENT: check if campaign exists
            const campaignId = "campaign" + campaignCreateCnt;
            store.collection("users").doc(userId).collection("campaigns").doc(campaignId).set(dataPackage)
              .then(resp => {
                // Add campaign to client.
                dispatch(actions.addCampaign(campaignId, dataPackage));
                // Switch to new campaign.
                dispatch(switchCampaign(resp.id, currCampId, campaignColl, cardColl, viewColl, cardManager, viewManager));
                console.log("[createCampaign] added campaign", resp.id);
                // Increment campaignCreateCnt
                store.collection("users").doc(userId).set({campaignCreateCnt: campaignCreateCnt+1}, {merge: true});
                //IMPLEMENT: loading end
              }).catch(err => {
                console.log("[createCampaign] error adding campaign", err);
                //IMPLEMENT: loading end
              });
          }
        }).catch(err => console.log("[createCampaign] error fetching campaignCreateCnt:", err));
    }
  };
};

export const loadInitCampaign = () => {
  return dispatch => {
    dispatch(actions.initCampaignColl());
    dispatch(actions.initCardColl());
    dispatch(actions.initViewColl());
  };
};

export const unloadCampaign = () => {  
  // IMPLEMENT: REWRITE
  return dispatch => {
    dispatch(actions.unloadCardColl());
    dispatch(actions.unloadViewColl());
    dispatch(actions.updActiveCard(null));
    dispatch(actions.clearCardCreate());
    dispatch(actions.clearCardDelete());
    dispatch(actions.clearViewCreate());
    dispatch(actions.clearViewDelete());
  };
};

export const fetchUserDataFromServer = () => {
  return dispatch => {
    dispatch(actions.loadUser(getUserId(), getUserEmail()));
  };
};

const saveUserDataToServer = () => {
  // IMPLEMENT
  return dispatch => {

  };
};

export const fetchCampaignDataFromServer = () => {
  const userId = getUserId();
  let campaignId = null;
  return dispatch => {
    // USER LEVEL: fetch activeCampaignId
    store.collection("users").doc(userId).get()
      .then(userData => {
        if (userData.exists) {
          if (userData.data().activeCampaignId) {
            campaignId = userData.data().activeCampaignId;
            dispatch(actions.updActiveCampaign(campaignId));
            console.log("[fetchCampaignDataFromServer] loaded activeCampaignId")
          }
        }
      }).catch(err => console.log("[fetchCampaignDataFromServer] user level error:", err));
    // CAMPAIGN LEVEL: fetch campaignCollection, viewOrder, activeViewId, cardCreateCnt, viewCreateCnt
    store.collection("users").doc(userId).collection("campaigns").get()
      .then(campaignSnapshot => {
        let campaignColl = {};
        campaignSnapshot.forEach(campaign => {
          campaignColl = updateObject(campaignColl, {[campaign.id]: campaign.data()});
        });
        dispatch(actions.loadCampaignColl(campaignColl));
        console.log("[fetchCampaignDataFromServer] loaded", campaignSnapshot.size, "campaign ids");
      }).catch(err => console.log("[fetchCampaignDataFromServer] campaign level error:", err));
    if (campaignId) {
      // CARD LEVEL: fetch cardCollection
      store.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("cards").get()
        .then(cardSnapshot => {
          let cardColl = {};
          cardSnapshot.forEach(card => {
            cardColl = updateObject(cardColl, {[card.id]: card.data()});
          });
          dispatch(actions.loadCardColl(cardColl));
          console.log("[fetchCampaignDataFromServer] loaded", cardSnapshot.size, "cards");
        }).catch(err => console.log("[fetchCampaignDataFromServer] card level error:", err));
      // VIEW LEVEL: fetch viewCollection
      store.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("views").get()
        .then(viewSnapshot => {
          let viewColl = {};
          viewSnapshot.forEach(view => {
            viewColl = updateObject(viewColl, {[view.id]: view.data()})
          });
          dispatch(actions.loadViewColl(viewColl));
          console.log("[fetchCampaignDataFromServer] loaded", viewSnapshot.size, "views");
        }).catch(err => console.log("[fetchCampaignDataFromServer] view level error:", err));
    }
  };
};

const saveCampaignDataToServer = (campaignId, campaignColl, cardColl, viewColl, cardManager, viewManager) => {
  const userId = getUserId();
  // Saves everything from the campaign to the server
  const campaignRef = store.collection("users").doc(userId).collection("campaigns").doc(campaignId);
  const cardCollRef = store.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("cards");
  const viewCollRef = store.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("views");
  return dispatch => {
    let batch = store.batch();
    let updatedIdViewOrder = [...viewManager.viewOrder];

    // CAMPAIGN (batched): Save campaign data
    if (campaignColl[campaignId] && campaignColl[campaignId].title) {
      batch.set(campaignRef, {title: campaignColl[campaignId].title}, {merge: true});
      console.log("[saveCampaignDataToServer] batch campaign:", campaignId);
    }

    // CARD (batched and not batched): Save card data
    for (let cardId in cardColl) {
      if (cardManager.cardCreate.includes(cardId)) {
        // Save new cards with no server id
        let dataPackage = cardColl[cardId];
        delete dataPackage.edited;
        // IMPLEMENT: maybe use add with the batch. check what the batch commits responds with
        cardCollRef.add(dataPackage)
          .then(resp => {
            // create a card using server id and delete card with temp id
            dispatch(actions.addCard(resp.id, dataPackage));
            dispatch(actions.removeCard(cardId));
            dispatch(actions.dequeueCardCreate(cardId));
            console.log("[saveCampaignDataToServer] added card", resp.id);
          })
          .catch(err => console.log("[saveCampaignDataToServer] error adding card", cardId, ":", err));
      } else {
        // Save cards with server id
        const cardRef = cardCollRef.doc(cardId);
        let dataPackage = cardColl[cardId];
        delete dataPackage.edited;
        batch.set(cardRef, dataPackage, {merge: true});
        console.log("[saveCampaignDataToServer] batch set card:", cardId);
      }
    };

    // CARD (batched): Delete cards from the cardDelete queue
    for (let cardId in cardManager.cardDelete) {
      const cardRef = cardCollRef.doc(cardId);
      batch.delete(cardRef);
      console.log("[saveCampaignDataToServer] batch delete card:", cardId);
    };

    // VIEW (batched and not batched): Save view data
    for (let viewId in viewColl) {
      if (viewManager.viewCreate.includes(viewId)){
        // Save new views with no server id
        let dataPackage = viewColl[viewId];
        delete dataPackage.edited;
        // IMPLEMENT: maybe use add with the batch. check what the batch commits responds with
        viewCollRef.add(dataPackage)
          .then(resp => {
            // create a view using server id and delete view with temp id
            dispatch(actions.addView(resp.id, dataPackage));
            dispatch(actions.removeView(viewId));
            dispatch(actions.dequeueViewCreate(viewId));
            console.log("[saveCampaignDataToServer] added view", resp.id);
            // replace the view in viewOrder
            const viewPos = updatedIdViewOrder.indexOf(viewId);
            console.log(updatedIdViewOrder)
            updatedIdViewOrder.splice(viewPos, 1, resp.id);
            // updatedIdViewOrder.splice(viewPos, 1, 'fuckthis')
            console.log(viewId, resp.id, updatedIdViewOrder, viewPos)
          })
          .catch(err => console.log("[saveCampaignDataToServer] error adding view", viewId, ":", err));
      } else {
        // Save views with server id
        const viewRef = viewCollRef.doc(viewId);
        let dataPackage = viewColl[viewId];
        delete dataPackage.edited;
        batch.set(viewRef, dataPackage, {merge: true});
        console.log("[saveCampaignDataToServer] batch set view:", viewId);
      }
    };

    // VIEW (batched): Delete views from the viewDelete queue
    for (let viewId in viewManager.viewDelete) {
      const viewRef = viewCollRef.doc(viewId);
      batch.delete(viewRef);
      console.log("[saveCampaignDataToServer] batch delete view:", viewId);
    };

    // VIEW (batched): Save viewOrder and activeViewId
    batch.set(campaignRef, {viewOrder: updatedIdViewOrder}, {merge: true});
    console.log("[saveCampaignDataToServer] batch set viewOrder:", updatedIdViewOrder);
    batch.set(campaignRef, {activeViewId: viewManager.activeViewId}, {merge: true});
    console.log("[saveCampaignDataToServer] batch set activeViewId:", viewManager.activeViewId);
    
    // SEND BATCH
    batch.commit()
    .then(resp => {
      console.log("[saveCampaignDataToServer] batch commit success:", resp);
      // CAMPAIGN: cleanup
      dispatch(actions.resetCampaignEdit(campaignId));
      // CARD: cleanup
      for (let cardId in cardColl) {
        dispatch(actions.unsetCardEdit(cardId));
      };
      dispatch(actions.clearCardCreate());
      dispatch(actions.clearCardDelete());
      // VIEW: cleanup
      for (let viewId in viewColl) {
        dispatch(actions.unsetViewEdit(viewId));
      };
      dispatch(actions.clearViewCreate());
      dispatch(actions.clearViewDelete());
    })
    .catch(err => {
      console.log("[saveCampaignDataToServer] batch commit error:", err);
      // NON-BATCH CLEANUP
    });
  };
};

const autoSaveCampaignDataToServer = (userId, campaignId, campaignColl, cardColl, cardCreate, cardDelete, viewColl) => {
  // IMPLEMENT: this should only save edited stuff
  const campaignRef = store.collection("users").doc(userId).collection("campaigns").doc(campaignId);
  const cardCollRef = store.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("cards");
  const viewCollRef = store.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("views");
  return dispatch => {
    let batch = store.batch();

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
          .then(resp => {
            console.log("[autoSaveCampaignDataToServer] added card", resp.id);
            // create a card using server id and delete card with temp id
            dispatch(actions.addCard(resp.id, dataPackage));
            dispatch(actions.removeCard(card));
            dispatch(actions.dequeueCardCreate(card));
          })
          .catch(err => console.log("[autoSaveCampaignDataToServer] error adding card", card, ":", err));
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
    .then(resp => {
      console.log("[autoSaveCampaignDataToServer] batch commit successful:", resp);
      // CAMPAIGN: cleanup
      dispatch(actions.resetCampaignEdit(campaignId));
      // CARD: cleanup
      for (let card in cardColl) {
        if (cardColl[card].edited) {
          dispatch(actions.unsetCardEdit(card));
        }
      }
      dispatch(actions.clearCardDelete());
      // VIEW: cleanup
    })
    .catch(err => console.log("[autoSaveCampaignDataToServer] batch commit error:", err));
  };
};