import * as actions from '../actionIndex';
import { auth, store } from '../../shared/firebase';
import { updateObject } from '../../shared/utilityFunctions';
import { updActiveCampaign } from './campaign';

export const initAuthCheck = () => {
  const userId = authUserId();
  return dispatch => {
    if (userId) {
      console.log("[initAuthCheck] signed in");
      dispatch(fetchUserDataFromServer());
      dispatch(unloadCampaign());
      dispatch(fetchCampaignDataFromServer(userId));
    } else {
      console.log("[initAuthCheck] not signed in");
      dispatch(loadInitCampaign());
    }
  }
};

export const emailSignUp = (email, psw) => {
  return dispatch => {
    auth.createUserWithEmailAndPassword(email, psw)
      .then(resp => {
        console.log("[emailSignUp] sign up successful:", resp);
        // IMPLEMENT: sign up procedures and first time setup
        const userId = resp.user.uid;
        store.collection("users").doc(userId).set({firstTimeSetup: true});
      })
      .catch(err => console.log("[emailSignUp] error:", err));
  };
};

export const emailSignIn = (email, psw) => {
  return dispatch => {
    auth.signInWithEmailAndPassword(email, psw)
      .then(resp => {
        console.log("[emailSignIn] sign in successful:", resp);
        if (resp.user.uid) {
          const userId = resp.user.uid;
          dispatch(actions.loadUser(resp.user.uid, resp.user.email));
          dispatch(unloadCampaign());
          dispatch(fetchCampaignDataFromServer(userId));
        }
      })
      .catch(err => console.log("[emailSignIn] error:", err));
  };
};

export const emailSignOut = () => {
  return dispatch => {
    auth.signOut()
      .then(resp => {
        console.log("[emailSignout] sign out successful:", resp);
        dispatch(actions.unloadUser());
        dispatch(actions.unloadCampaignColl());
        dispatch(loadInitCampaign());  // This doubles as a campaign unload.
      })
      .catch(err => console.log("[emailSignOut] error:", err));
  };
};

export const switchCampaign = (nextCampId, currCampId, campaignColl, cardColl, viewColl, cardManage, viewManage) => {
  // IMPLEMENT: prompt user if they want to save current campaign. give option to say no
  const userId = authUserId();
  return dispatch => {
    if (currCampId) {
      // Save current campaign.
      dispatch(saveCampaignDataToServer(userId, currCampId, campaignColl, cardColl, viewColl, cardManage, viewManage));
      // Unload current campaign.
      dispatch(unloadCampaign());
    }
    // Update active campaign.
    store.collection("users").doc(userId).set({activeCampaign: nextCampId})
      .then(resp => {
        dispatch(updActiveCampaign(nextCampId));
        console.log("[switchCampaign] set activeCampaign from", currCampId, "to", nextCampId);
      }).catch(err => console.log("[switchCampaign] error setting activeCampaign:", err));
    // Fetch updated active campaign.
    dispatch(fetchCampaignDataFromServer(userId));
  };
};

export const createCampaign = (currCampId, campaignColl, cardColl, viewColl, cardManage, viewManage) => {
  const userId = authUserId();
  const dataPackage = {
    title: "untitled",
    viewOrder: [],
  };
  return dispatch => {
    // Create a new campaign on the server.
    if (userId) {
      store.collection("users").doc(userId).collection("campaigns").add(dataPackage)
        .then(resp => {
          // Add campaign to client.
          dispatch(actions.addCampaign(resp.id, dataPackage));
          // Switch to new campaign.
          dispatch(switchCampaign(resp.id, currCampId, campaignColl, cardColl, viewColl, cardManage, viewManage));
          console.log("[addCampaign] added campaign", resp.id);
        }).catch(err => console.log("[addCampaign] error adding campaign", err));
    }
  };
};

const authUserId = () => {  // DO NOT EXPORT
  let userId = null;
  auth.onAuthStateChanged(resp => userId = (resp && resp.uid) ? resp.uid : null);
  console.log("[authUserId] retrieved user id:", userId);
  return userId;
};

const loadInitCampaign = () => {
  return dispatch => {
    dispatch(actions.initCardColl());
    dispatch(actions.initViewColl());
    dispatch(actions.initCardManage());
    dispatch(actions.initViewManage());
  };
};

const unloadCampaign = () => {  
  return dispatch => {
    dispatch(actions.unloadCardColl());
    dispatch(actions.unloadViewColl());
    dispatch(actions.updActiveCard(null));
    dispatch(actions.clearCardCreate());
    dispatch(actions.clearCardDelete());
    dispatch(actions.unloadViewOrder());
    dispatch(actions.updActiveView(null));
    dispatch(actions.clearViewCreate());
    dispatch(actions.clearViewDelete());
  };
};

const fetchUserDataFromServer = () => {  // DO NOT EXPORT
  return dispatch => {
    auth.onAuthStateChanged(resp => {
      dispatch(actions.loadUser(resp.user.uid, resp.user.email))
    });
  };
};

const saveUserDataToServer = () => {
  // IMPLEMENT
  return dispatch => {

  };
};

const fetchCampaignDataFromServer = (userId) => {  // DO NOT EXPORT
  let campaignId = null;
  return dispatch => {
    // USER LEVEL: fetch activeCampaign
    store.collection("users").doc(userId).get()
      .then(userData => {
        if (userData.exists) {
          if (userData.data().activeCampaign) {
            campaignId = userData.data().activeCampaign;
            dispatch(actions.updActiveCampaign(campaignId));
            console.log("[fetchCampaignDataFromServer] loaded activeCampaign")
          }
        }
      }).catch(err => console.log("[fetchCampaignDataFromServer] user level error:", err));
    // CAMPAIGN LEVEL: fetch campaignCollection, viewOrder, activeView
    store.collection("users").doc(userId).collection("campaigns").get()
      .then(campaignSnapshot => {
        let campaignColl = {};
        campaignSnapshot.forEach(campaign => {
          campaignColl = updateObject(campaignColl, {
            [campaign.id]: {title: campaign.data().title}
          });
          if (campaign.id === campaignId) {
            if (campaign.data().viewOrder) {
              dispatch(actions.loadViewOrder(campaign.data().viewOrder));
              console.log("[fetchCampaignDataFromServer] loaded viewOrder:", campaign.data().viewOrder);
            }
            if (campaign.data().activeView) {
              dispatch(actions.updActiveView(campaign.data().activeView));
              console.log("[fetchCampaignDataFromServer] loaded activeView:", campaign.data().activeView);
            }
          }
        });
        dispatch(actions.loadCampaignColl);
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

const saveCampaignDataToServer = (userId, campaignId, campaignColl, cardColl, viewColl, cardManage, viewManage) => {
  // Saves everything from the campaign to the server
  const campaignRef = store.collection("users").doc(userId).collection("campaigns").doc(campaignId);
  const cardCollRef = store.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("cards");
  const viewCollRef = store.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("views");
  return dispatch => {
    let batch = store.batch();
    let newViewOrder = [...viewManage.viewOrder];

    // CAMPAIGN (batched): Save campaign data
    if (campaignColl[campaignId].title){
      batch.set(campaignRef, {title: campaignColl[campaignId].title}, {merge: true});
      console.log("[saveCampaignDataToServer] batch campaign:", campaignId);
    }

    // CARD (batched and not batched): Save card data
    cardColl.forEach(cardId => {
      if (cardManage.cardCreate.includes(cardId)) {
        // Save new cards with no server id
        let dataPackage = cardColl[cardId];
        delete dataPackage.edited;
        // IMPLEMENT: maybe use add with the batch. check what the batch commits responds with
        cardCollRef.add(dataPackage)
          .then(resp => {
            // create a card using server id and delete card with temp id
            dispatch(actions.addCardToStore(resp.id, dataPackage));
            dispatch(actions.deleteCardFromStore(cardId));
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
    });

    // CARD (batched): Delete cards from the cardDelete queue
    cardManage.cardDelete.forEach(cardId => {
      const cardRef = cardCollRef.doc(cardId);
      batch.delete(cardRef);
      console.log("[saveCampaignDataToServer] batch delete card:", cardId);
    });

    // VIEW (batched and not batched): Save view data
    viewColl.forEach(viewId => {
      if (viewManage.viewCreate.includes(viewId)){
        // Save new views with no server id
        let dataPackage = viewColl[viewId];
        delete dataPackage.edited;
        // IMPLEMENT: maybe use add with the batch. check what the batch commits responds with
        viewCollRef.add(dataPackage)
          .then(resp => {
            // create a view using server id and delete view with temp id
            dispatch(actions.addViewToStore(resp.id, dataPackage));
            dispatch(actions.deleteViewFromStore(viewId));
            dispatch(actions.dequeueViewCreate(viewId));
            console.log("[saveCampaignDataToServer] added view", resp.id);
            // replace the view in viewOrder
            const viewPos = newViewOrder.indexOf(viewId);
            newViewOrder.splice(viewPos, 1, resp.id);
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
    });

    // VIEW (batched): Delete views from the viewDelete queue
    viewManage.viewDelete.forEach(viewId => {
      const viewRef = viewCollRef.doc(viewId);
      batch.delete(viewRef);
      console.log("[saveCampaignDataToServer] batch delete view:", viewId);
    });

    // VIEW (batched): Save viewOrder and activeView
    batch.set(campaignRef, {viewOrder: newViewOrder}, {merge: true});
    console.log("[saveCampaignDataToServer] batch set viewOrder:", newViewOrder);
    batch.set(campaignRef, {activeView: viewManage.activeView}, {merge: true});
    console.log("[saveCampaignDataToServer] batch set activeView:", viewManage.activeView);
    
    // SEND BATCH
    batch.commit()
    .then(resp => {
      console.log("[saveCampaignDataToServer] batch commit success:", resp);
      // CAMPAIGN: cleanup
      dispatch(actions.resetCampaignEdit(campaignId));
      // CARD: cleanup
      cardColl.forEach(cardId => {
        dispatch(actions.resetCardEdit(cardId));
      });
      dispatch(actions.clearCardCreate());
      dispatch(actions.clearCardDelete());
      // VIEW: cleanup
      viewColl.forEach(viewId => {
        dispatch(actions.resetViewEdit(viewId));
      });
      dispatch(actions.clearViewCreate());
      dispatch(actions.clearViewDelete());
      dispatch(actions.updViewOrder(newViewOrder));
    })
    .catch(err => {
      console.log("[saveCampaignDataToServer] batch commit error:", err);
      // NON-BATCH CLEANUP
      dispatch(actions.updViewOrder(newViewOrder));
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
            dispatch(actions.addCardToStore(resp.id, dataPackage));
            dispatch(actions.deleteCardFromStore(card));
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
          dispatch(actions.resetCardEdit(card));
        }
      }
      dispatch(actions.clearCardDelete());
      // VIEW: cleanup
    })
    .catch(err => console.log("[autoSaveCampaignDataToServer] batch commit error:", err));
  };
};