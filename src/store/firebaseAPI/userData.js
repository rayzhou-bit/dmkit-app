import React from 'react';
import { useSelector } from 'react-redux';
import * as actions from '../actionIndex';
import { auth, store } from './firebase';
import { updateObject } from '../../shared/utilityFunctions';
import { GRID } from '../../shared/constants/grid';

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

export const createCampaign = (currCampId, campaignColl, cardColl, viewColl, dataManager) => {
  const user = getUser();
  return dispatch => {
    if (user) {
      const userId = user.uid;
      const campaignData = {
        title: "untitled campaign",
        viewOrder: ["view0"], activeViewId: "view0",
        cardCreateCnt: 1, viewCreateCnt: 1,
      };
      // create a campaign with 1 card and 1 view
      store.collection("users").doc(userId).collection("campaigns").add(campaignData)
        .then(resp => {
          const campaignId = resp.id;
          if (campaignId) {
            // create the card
            store.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("cards").doc("card0").set({
              views: {
                view0: {
                  pos: {x: 3*GRID.size, y: 3*GRID.size},
                  size: {width: 8*GRID.size, height: 10*GRID.size},
                  cardType: "card",
                },
              },
              title: "card0",
              color: "gray",
              content: {text: ""},
            })
              .then(resp => {
                // create the view
                store.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("views").doc("view0").set({
                  title: "view0",
                  color: "gray",
                })
                  .then(resp => {
                    console.log("[createCampaign] added campaign:", campaignId);
                    dispatch(actions.addCampaign(campaignId, campaignData));
                    dispatch(switchCampaign(campaignId, currCampId, campaignColl, cardColl, viewColl, dataManager));
                  }).catch(err => console.log("[createCampaign] error creating view"));
              }).catch(err => console.log("[createCampaign] error creating card"));
          }
        }).catch(err => console.log("[createCampaign] error adding campaign:", err));
    }
  };
};

export const destroyCampaign = (campaignId, activeCampaignId) => {
  const user = getUser();
  return dispatch => {
    if (user && campaignId) {
      const userId = user.uid;
      store.collection("users").doc(userId).collection("campaigns").doc(campaignId).delete()
        .then(resp => {
          dispatch(actions.removeCampaign(campaignId));
          console.log("[destroyCampaign] campaign", campaignId, "deleted:", resp);
        }).catch(err => console.log("[destroyCampaign] batch delete error cards:", err));
      if (campaignId === activeCampaignId) {
        store.collection("users").doc(userId).set({activeCampaignId: null})
          .then(resp => {
            dispatch(actions.updActiveCampaignId(null));
            dispatch(actions.unloadCampaignData());
            console.log("[destroyCampaign] set activeCampaignId to null");
          }).catch(err => console.log("[destroyCampaign] error setting activeCampaignId"));
      }
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
        dispatch(saveCampaignData(currCampId, campaignColl, cardColl, viewColl, dataManager));
      }
      // Update active campaign.
      store.collection("users").doc(userId).set({activeCampaignId: nextCampId})
        .then(resp => {
          dispatch(actions.updActiveCampaignId(nextCampId));
          //unload here?
          console.log("[switchCampaign] set activeCampaignId from", currCampId, "to", nextCampId);
        }).catch(err => console.log("[switchCampaign] error setting activeCampaignId:", err));
    }
  };
};

const cleanUpDataManager = () => {
  return dispatch => {
    dispatch(actions.clearCardDelete());
    dispatch(actions.clearViewDelete());
    dispatch(actions.clearCardEdit());
    dispatch(actions.clearViewEdit());
    dispatch(actions.unsetCampaignEdit());
  };
};

export const loadCampaignData = (campaignId) => {
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
          console.log("[loadCampaignData] loaded", cardSnapshot.size, "cards");
        }).catch(err => console.log("[loadCampaignData] card level error:", err));
      // VIEW LEVEL: fetch viewCollection
      store.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("views").get()
        .then(viewSnapshot => {
          let viewColl = {};
          viewSnapshot.forEach(view => {
            viewColl = updateObject(viewColl, {[view.id]: view.data()})
          });
          dispatch(actions.loadViewColl(viewColl));
          console.log("[loadCampaignData] loaded", viewSnapshot.size, "views");
        }).catch(err => console.log("[loadCampaignData] view level error:", err));
      dispatch(actions.removeCampaign("introCampaign"));
    }
  };
};

export const unloadCampaignData = () => {
  return dispatch => {
    dispatch(actions.unloadCardColl());
    dispatch(actions.unloadViewColl());
    dispatch(actions.updActiveCardId(null));
    dispatch(actions.clearCardDelete());
    dispatch(actions.clearViewDelete());
  };
};

export const saveCampaignData = (campaignId, campaignColl, cardColl, viewColl, dataManager) => {
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
        console.log("[saveCampaignData] batch set campaign:", campaignId);
        // CARD: batch set card data
        let count = 0;
        for (let cardId in cardColl) {
          const cardRef = cardCollRef.doc(cardId);
          batch.set(cardRef, cardColl[cardId]);
          count++;
        }
        console.log("[saveCampaignData] batch set", count, "cards");
        // VIEW: batch set view data
        count = 0;
        for (let viewId in viewColl) {
          const viewRef = viewCollRef.doc(viewId);
          batch.set(viewRef, viewColl[viewId]);
          count++;
        }
        console.log("[saveCampaignData] batch set", count, "views");
        // COMMIT BATCH
        batch.commit()
          .then(resp => {
            console.log("[saveCampaignData] batch commit success:", resp);
            // CLEANUP
            cleanUpDataManager();
          })
          .catch(err => {
            console.log("[saveCampaignData] batch commit error:", err);
            // NON-BATCH CLEANUP
          });
      }
    }
  };
};

// export const saveCampaignData = (postSaveFunc, postSaveArgs) => {
//   const user = getUser();
//   const activeCampaignId = useSelector(state => state.dataManager.activeCampaignId);
//   const campaignColl = useSelector(state => state.campaignColl);
//   const cardColl = useSelector(state => state.cardColl);
//   const viewColl = useSelector(state => state.viewColl);
//   return dispatch => {
//     if (user && activeCampaignId && campaignColl[activeCampaignId]) {
//       const userId = user.uid;
//       const campaignRef = store.collection("users").doc(userId).collection("campaigns").doc(activeCampaignId);
//       const cardCollRef = store.collection("users").doc(userId).collection("campaigns").doc(activeCampaignId).collection("cards");
//       const viewCollRef = store.collection("users").doc(userId).collection("campaigns").doc(activeCampaignId).collection("views");
//       const batch = store.batch();
//       // CAMPAIGN: batch set campaign data, viewOrder, activeViewId, cardCreateCnt, viewCreateCnt
//       batch.set(campaignRef, campaignColl[activeCampaignId], {merge: true});
//       console.log("[saveCampaignData] batch set campaign:", activeCampaignId);
//       // CARD: batch set card data
//       let count = 0;
//       for (let cardId in cardColl) {
//         const cardRef = cardCollRef.doc(cardId);
//         batch.set(cardRef, cardColl[cardId]);
//         count++;
//       }
//       console.log("[saveCampaignData] batch set", count, "cards");
//       // VIEW: batch set view data
//       count = 0;
//       for (let viewId in viewColl) {
//         const viewRef = viewCollRef.doc(viewId);
//         batch.set(viewRef, viewColl[viewId]);
//         count++;
//       }
//       console.log("[saveCampaignData] batch set", count, "views");
//       // COMMIT BATCH
//         batch.commit()
//           .then(resp => {
//             console.log("[saveCampaignData] batch commit success:", resp);
//             // CLEANUP
//             cleanUpDataManager();
//             // FOLLOW UP FUNCTION
//             if (postSaveFunc) { postSaveFunc(postSaveArgs); }
//           })
//           .catch(err => {
//             console.log("[saveCampaignData] batch commit error:", err);
//             // NON-BATCH CLEANUP
//           });
//     }
//   }
// }

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
          batch.set(cardRef, cardColl[cardId]);
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
          batch.set(viewRef, viewColl[viewId]);
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
            cleanUpDataManager();
          })
          .catch(err => {
            console.log("[autoSaveCampaignData] batch commit error:", err);
            // NON-BATCH CLEANUP
          });
      }
    }
  };
};

export const initializeIntroCampaign = () => {
  return dispatch => {
    dispatch(actions.initDataManager());
    dispatch(actions.initCampaignColl());
    dispatch(actions.initCardColl());
    dispatch(actions.initViewColl());
  };
};

export const removeIntroCampaign = (activeCampaignId) => {
  return dispatch => {
    dispatch(actions.removeCampaign("introCampaign"));
    if (activeCampaignId === "introCampaign") {
      dispatch(actions.unloadCampaignData());
    }
  };
};

export const saveIntroCampaignData = (campaignColl, cardColl, viewColl) => {
  // Saves everything from the campaign edited before sign in to the server as a new campaign
  const user = getUser();
  return dispatch => {
    if (user) {
      const userId = user.uid;
      store.collection("users").doc(userId).collection("campaigns").add(campaignColl["introCampaign"])
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
                console.log("[saveIntroCampaignData] batch commit new campaign success:", resp);
                // CLEANUP
                dispatch(actions.removeCampaign("introCampaign"));
                cleanUpDataManager();
                // Update active campaign
                store.collection("users").doc(userId).set({activeCampaignId: newCampaignId})
                  .then(resp => {
                    dispatch(actions.updActiveCampaignId(newCampaignId));
                    console.log("[saveIntroCampaignData] set activeCampaignId to", newCampaignId);
                  }).catch(err => console.log("[saveIntroCampaignData] error setting activeCampaignId:", err));
              }).catch(err => console.log("[saveIntroCampaignData] batch commit new campaign error:", err));
          }
        }).catch(err => console.log("[saveIntroCampaignData] error creating campaign to save to:", err));
    }
  };
};