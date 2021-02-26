import * as actions from '../actionIndex';
import { auth, store } from './firebase';
import { updateObject } from '../../shared/utilityFunctions';

// uid, email, emailVerified
const getUser = () => auth.currentUser ? auth.currentUser : null;

export const updateDisplayName = (displayName) => {
  const user = getUser();
  return dispatch => {
    if (user) {
      user.updateProfile({displayName: displayName})
        .then(resp => {
          console.log("[updateDisplayName] updated displayName:", resp);
          dispatch(actions.updUserDisplayname(displayName));
        })
        .catch(err => console.log("[updateDisplayName] error updating displayName:", err));
    }
  };
};

export const receiveSignInData = () => {
  const user = getUser();
  return dispatch => {
    if (user) {
      const userId = user.uid;
      // User data, activeCampaign
      dispatch(actions.loadUser(user));
      store.collection("users").doc(userId).get()
        .then(userData => {
          if (userData.exists) {
            dispatch(actions.updActiveCampaignId(userData.data().activeCampaignId));
            console.log("[recieveSignInData] set activeCampaignId to", userData.data().activeCampaignId);
          } else {
            dispatch(actions.updActiveCampaignId(null));
            console.log("[recieveSignInData] set activeCampaignId to null");
          }
        }).catch(err => console.log("[receiveSignInData] activeCampaignId error:", err));
      // Campaign Collection
      store.collection("users").doc(userId).collection("campaigns").get()
        .then(campaignSnapshot => {
          let campaignColl = {};
          campaignSnapshot.forEach(campaign => {
            campaignColl = updateObject(campaignColl, {[campaign.id]: campaign.data()});
          });
          dispatch(actions.loadCampaignColl(campaignColl));
          console.log("[recieveSignInData] loaded", campaignSnapshot.size, "campaigns");
        }).catch(err => console.log("[recieveSignInData] campaign collection error:", err));
    }
  };
};

export const loadIntroCampaign = () => {
  return dispatch => {
    dispatch(actions.initDataManager());
    dispatch(actions.initCampaignColl());
    dispatch(actions.initCardColl());
    dispatch(actions.initViewColl());
  };
};

export const unloadCampaign = () => {
  return dispatch => {
    dispatch(actions.unloadCardColl());
    dispatch(actions.unloadViewColl());
    dispatch(actions.updActiveCardId(null));
    dispatch(actions.clearCardDelete());
    dispatch(actions.clearViewDelete());
  };
};

export const createCampaign = (currCampId, campaignColl, cardColl, viewColl, dataManager) => {
  const user = getUser();
  return dispatch => {
    if (user) {
      const userId = user.uid;
      const campaignData = {
        title: "untitled campaign",
        viewOrder: [], activeViewId: null,
        cardCreateCnt: 0, viewCreateCnt: 0,
      };
      // Create a new campaign on the server.
      store.collection("users").doc(userId).collection("campaigns").add(campaignData)
        .then(resp => {
          const campaignId = resp.id;
          if (campaignId) {
            dispatch(actions.addCampaign(campaignId, campaignData));
            console.log("[createCampaign] added campaign:", campaignId);
            dispatch(switchCampaign(campaignId, currCampId, campaignColl, cardColl, viewColl, dataManager));
            dispatch(actions.createView(campaignId, null, 0));
            dispatch(actions.createCard(campaignId, "view0", 0));
            dispatch(actions.updActiveViewId(campaignId, "view0"));
          }
        }).catch(err => console.log("[createCampaign] error adding campaign:", err));
    }
  };
};

export const destroyCampaign = (campaignId) => {
  const user = getUser();
  return dispatch => {
    if (user && campaignId) {
      const userId = user.uid;
      store.collection("users").doc(userId).collection("campaigns").doc(campaignId).delete()
        .then(resp => {
          dispatch(actions.removeCampaign(campaignId));
          console.log("[destroyCampaign] campaign", campaignId, "deleted:", resp);
        }).catch(err => console.log("[destroyCampaign] batch delete error cards:", err));
    }
  };
};

export const switchCampaign = (nextCampId, currCampId, campaignColl, cardColl, viewColl, dataManager) => {
  const user = getUser();
  return dispatch => {
    if (user) {
      const userId = user.uid;
      if (currCampId) {
        // Save current campaign.
        dispatch(sendCampaignData(currCampId, campaignColl, cardColl, viewColl, dataManager));
      }
      // Update active campaign.
      store.collection("users").doc(userId).set({activeCampaignId: nextCampId})
        .then(resp => {
          dispatch(actions.updActiveCampaignId(nextCampId));
          console.log("[switchCampaign] set activeCampaignId from", currCampId, "to", nextCampId);
        }).catch(err => console.log("[switchCampaign] error setting activeCampaignId:", err));
    }
  };
};

export const receiveCampaignData = (campaignId) => {
  const user = getUser();
  return dispatch => {
    if (user && campaignId) {
      const userId = user.uid;
      // CARD LEVEL: fetch cardCollection
      store.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("cards").get()
        .then(cardSnapshot => {
          let cardColl = {};
          cardSnapshot.forEach(card => {
            cardColl = updateObject(cardColl, {[card.id]: card.data()});
          });
          dispatch(actions.loadCardColl(cardColl));
          console.log("[receiveCampaignData] loaded", cardSnapshot.size, "cards");
        }).catch(err => console.log("[receiveCampaignData] card level error:", err));
      // VIEW LEVEL: fetch viewCollection
      store.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("views").get()
        .then(viewSnapshot => {
          let viewColl = {};
          viewSnapshot.forEach(view => {
            viewColl = updateObject(viewColl, {[view.id]: view.data()})
          });
          dispatch(actions.loadViewColl(viewColl));
          console.log("[receiveCampaignData] loaded", viewSnapshot.size, "views");
        }).catch(err => console.log("[receiveCampaignData] view level error:", err));
      dispatch(actions.removeCampaign("introCampaign"));
    }
  };
};

export const sendCampaignData = (campaignId, campaignColl, cardColl, viewColl, dataManager) => {
  const user = getUser();
  return dispatch => {
    if (user && campaignId) {
      const userId = user.uid;
      const campaignRef = store.collection("users").doc(userId).collection("campaigns").doc(campaignId);
      const cardCollRef = store.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("cards");
      const viewCollRef = store.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("views");
      if (campaignColl[campaignId]) {
        const batch = store.batch();
        // CAMPAIGN: batch set campaign data, viewOrder, activeViewId, cardCreateCnt, viewCreateCnt
        batch.set(campaignRef, campaignColl[campaignId], {merge: true});
        console.log("[sendCampaignData] batch set campaign:", campaignId);
        // CARD: batch set card data
        for (let cardId in cardColl) {
          const cardRef = cardCollRef.doc(cardId);
          batch.set(cardRef, cardColl[cardId], {merge: true});
          console.log("[sendCampaignData] batch set card:", cardId);
        }
        // CARD: batch delete cards in the cardDelete queue
        for (let i in dataManager.cardDelete) {
          const cardId = dataManager.cardDelete[i];
          const cardRef = cardCollRef.doc(cardId);
          batch.delete(cardRef);
          console.log("[sendCampaignData] batch delete card:", cardId);
        }
        // VIEW: batch set view data
        for (let viewId in viewColl) {
          const viewRef = viewCollRef.doc(viewId);
          batch.set(viewRef, viewColl[viewId], {merge: true});
          console.log("[sendCampaignData] batch set view:", viewId);
        }
        // VIEW: batch delete views in the viewDelete queue
        for (let i in dataManager.viewDelete) {
          const viewId = dataManager.viewDelete[i];
          const viewRef = viewCollRef.doc(viewId);
          batch.delete(viewRef);
          console.log("[sendCampaignData] batch delete view:", viewId);
        }
        // COMMIT BATCH
        batch.commit()
          .then(resp => {
            console.log("[sendCampaignData] batch commit success:", resp);
            // CLEANUP
            dispatch(actions.clearCardDelete());
            dispatch(actions.clearViewDelete());
            dispatch(actions.clearCardEdit());
            dispatch(actions.clearViewEdit());
            dispatch(actions.unsetCampaignEdit());
          })
          .catch(err => {
            console.log("[sendCampaignData] batch commit error:", err);
            // NON-BATCH CLEANUP
          });
      }
    }
  };
};

export const sendIntroCampaignData = (campaignColl, cardColl, viewColl) => {
  // Saves everything from the campaign edited before sign in to the server as a new campaign
  const user = getUser();
  return dispatch => {
    if (user) {
      const userId = user.uid;
      const oldCampaignId = "introCampaign";
      store.collection("users").doc(userId).collection("campaigns").add(campaignColl[oldCampaignId])
        .then(resp => {
          const newCampaignId = resp.id;
          if (newCampaignId) {
            const cardCollRef = store.collection("users").doc(userId).collection("campaigns").doc(newCampaignId).collection("cards");
            const viewCollRef = store.collection("users").doc(userId).collection("campaigns").doc(newCampaignId).collection("views");
            const batch = store.batch();
            for (let cardId in cardColl) { batch.set(cardCollRef.doc(cardId), cardColl[cardId]); }
            for (let viewId in viewColl) { batch.set(viewCollRef.doc(viewId), viewColl[viewId]); }
            batch.commit()
              .then(resp => {
                console.log("[sendIntroCampaignData] batch commit new campaign success:", resp);
                // CLEANUP
                dispatch(actions.addCampaign(newCampaignId, campaignColl[oldCampaignId]));
                dispatch(actions.removeCampaign(oldCampaignId));
                dispatch(actions.unsetCampaignEdit());
                // Update active campaign
                store.collection("users").doc(userId).set({activeCampaignId: newCampaignId})
                .then(resp => {
                  dispatch(actions.updActiveCampaignId(newCampaignId));
                  console.log("[sendIntroCampaignData] set activeCampaignId to", newCampaignId);
                }).catch(err => console.log("[sendIntroCampaignData] error setting activeCampaignId:", err));
              }).catch(err => console.log("[sendIntroCampaignData] batch commit new campaign error:", err));
          }
        }).catch(err => console.log("[sendIntroCampaignData] error creating campaign to save to:", err));
    }
  };
};

export const autoSaveCampaignData = (campaignId, campaignColl, cardColl, viewColl, dataManager) => {
  const user = getUser();
  return dispatch => {
    if (user && campaignId) {
      const userId = user.uid;
      const campaignRef = store.collection("users").doc(userId).collection("campaigns").doc(campaignId);
      const cardCollRef = store.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("cards");
      const viewCollRef = store.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("views");
      if (campaignColl[campaignId]) {
        const batch = store.batch();
        // CAMPAIGN: batch set campaign data, viewOrder, activeViewId, cardCreateCnt, viewCreateCnt
        batch.set(campaignRef, campaignColl[campaignId], {merge: true});
        console.log("[autoSaveCampaignData] batch set campaign:", campaignId);
        // CARD: batch edit cards in the cardEdit queue
        for (let i in dataManager.cardEdit) {
          const cardId = dataManager.cardEdit[i];
          const cardRef = cardCollRef.doc(cardId);
          batch.set(cardRef, cardColl[cardId], {merge: true});
          console.log("[autoSaveCampaignData] batch set card:", cardId);
        }
        // CARD: batch delete cards in the cardDelete queue
        for (let i in dataManager.cardDelete) {
          const cardId = dataManager.cardDelete[i];
          const cardRef = cardCollRef.doc(cardId);
          batch.delete(cardRef);
          console.log("[autoSaveCampaignData] batch delete card:", cardId);
        }
        // VIEW: batch edit views in the viewEdit queue
        for (let i in dataManager.viewEdit) {
          const viewId = dataManager.viewEdit[i];
          const viewRef = viewCollRef.doc(viewId);
          batch.set(viewRef, viewColl[viewId], {merge: true});
          console.log("[autoSaveCampaignData] batch set view:", viewId);
        }
        // VIEW: batch delete views in the viewDelete queue
        for (let i in dataManager.viewDelete) {
          const viewId = dataManager.viewDelete[i];
          const viewRef = viewCollRef.doc(viewId);
          batch.delete(viewRef);
          console.log("[autoSaveCampaignData] batch delete view:", viewId);
        }
        // COMMIT BATCH
        batch.commit()
          .then(resp => {
            console.log("[autoSaveCampaignData] batch commit success:", resp);
            // CLEANUP
            dispatch(actions.clearCardDelete());
            dispatch(actions.clearViewDelete());
            dispatch(actions.clearCardEdit());
            dispatch(actions.clearViewEdit());
            dispatch(actions.unsetCampaignEdit());
          })
          .catch(err => {
            console.log("[autoSaveCampaignData] batch commit error:", err);
            // NON-BATCH CLEANUP
          });
      }
    }
  };
};