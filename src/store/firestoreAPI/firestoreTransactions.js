import { auth, store } from './firebase';

import * as actions from '../actionIndex';
import { updateObject } from '../../shared/utilityFunctions';
import { GRID } from '../../shared/constants/grid';

// User contains uid, email, emailVerified (check firebase for more)
const getUser = () => auth.currentUser ? auth.currentUser : null;

const firstTimeSetup = (userId) => {
  return dispatch => {
    if (userId) {
      store.collection("users").doc(userId).set({activeCampaignId: null})
        .then(resp => {
          console.log("[firstTimeSetup] success performing first time setup");
          dispatch(actions.setStatus('idle'));
        })
        .catch(err => console.log("[firstTimeSetup] error performing first time setup:", err));
    }
  }
};

export const fetchActiveCampaignId = () => {
  const user = getUser();
  return dispatch => {
    if (user) {
      const userId = user.uid;
      store.collection("users").doc(userId).get()
        .then(resp => {
          if (resp.exists) {
            dispatch(actions.updActiveCampaignId(resp.data().activeCampaignId));
            if (!resp.data().activeCampaignId) dispatch(actions.setStatus('idle'));
            console.log("[fetchActiveCampaignId] success loading activeCampaignId", resp.data().activeCampaignId);
          } else {
            dispatch(firstTimeSetup(userId));
          }
        })
        .catch(err => console.log("[fetchActiveCampaignId] error loading activeCampaignId:", err));
    }
  };
};

export const fetchCampaignList = () => {
  const user = getUser();
  return dispatch => {
    if (user) {
      const userId = user.uid;
      store.collection("users").doc(userId).collection("campaigns").get()
        .then(campaignSnapshot => {
          let campaignList = {};
          campaignSnapshot.forEach(campaign => {
            campaignList = updateObject(campaignList, {[campaign.id]: campaign.data().title});
          });
          dispatch(actions.loadCampaignList(campaignList));
          console.log("[loadCampaignList] success loading campaignList");
        })
        .catch(err => console.log("[loadCampaignList] error loading campaignList:", err));
    }
  };
};

export const fetchCampaignData = (campaignId, followUpHandler) => {
  const user = getUser();
  return dispatch => {
    if (user && campaignId) {
      const userId = user.uid;
      let campaignData = {};
      // CAMPAIGN data
      store.collection("users").doc(userId).collection("campaigns").doc(campaignId).get()
        .then(doc => {
          if (doc.exists) {
            campaignData = updateObject(campaignData, doc.data());
            // CARD data
            store.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("cards").get()
              .then(cardSnapshot => {
                let cardCollection = {};
                cardSnapshot.forEach(card => {
                  cardCollection = updateObject(cardCollection, {[card.id]: card.data()});
                });
                campaignData = updateObject(campaignData, {cards: cardCollection});
                // VIEW data
                store.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("views").get()
                  .then(viewSnapshot => {
                    let viewCollection = {};
                    viewSnapshot.forEach(view => {
                      viewCollection = updateObject(viewCollection, {[view.id]: view.data()})
                    });
                    campaignData = updateObject(campaignData, {views: viewCollection});
                    // LOAD DATA
                    dispatch(actions.loadCampaignData(campaignData));
                    if (followUpHandler) followUpHandler();
                    console.log("[fetchCampaignData] success loading campaign");
                  })
                  .catch(err => console.log("[fetchCampaignData] error loading views:", err))
              })
              .catch(err => console.log("[fetchCampaignData] error loading cards:", err));
          } else {
            console.log("[fetchCampaignData] campaign", campaignId, "does not exist for this user");
          }
        })
        .catch(err => console.log("[fetchCampaignData] error loading campaign:", err));
    }
  };
};

export const saveCampaignData = (campaignId, campaignData, followUpHandler) => {
  const user = getUser();
  return dispatch => {
    if (user && campaignId) {
      dispatch(actions.setStatus('saving'));
      const userId = user.uid;
      const batch = store.batch();
      // CAMPAIGN data
      let campaignPackage = {...campaignData};
      delete campaignPackage.cards;
      delete campaignPackage.views;
      batch.set(
        store.collection("users").doc(userId).collection("campaigns").doc(campaignId),
        campaignPackage
      );
      // CARD data
      for (let cardId in campaignData.cards) {
        batch.set(
          store.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("cards").doc(cardId),
          campaignData.cards[cardId]
        );
      }
      // VIEW data
      for (let viewId in campaignData.views) {
        batch.set(
          store.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("views").doc(viewId),
          campaignData.views[viewId]
        );
      }
      // SAVE DATA (BATCH COMMIT)
      batch.commit()
        .then (resp => {
          dispatch(actions.setCampaignEdit(false));
          if (followUpHandler) followUpHandler();
          console.log("[saveActiveCampaignData] success saving campaign");
        })
        .catch(err => {
          console.log("[saveActiveCampaignData] error saving campaign:", err);
        });
    }
  }
};

export const saveIntroCampaignData = (campaignData, followUpHandler) => {
  const user = getUser();
  return dispatch => {
    if (user) {
      dispatch(actions.setStatus('saving'));
      const userId = user.uid;
      // CAMPAIGN data
      let campaignPackage = {...campaignData};
      delete campaignPackage.cards;
      delete campaignPackage.views;
      store.collection("users").doc(userId).collection("campaigns").add(campaignPackage)
        .then(resp => {
          const campaignId = resp.id;
          if (campaignId) {
            const batch = store.batch();
            // CARD data
            for (let cardId in campaignData.cards) {
              batch.set(
                store.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("cards").doc(cardId),
                campaignData.cards[cardId]
              );
            }
            // VIEW data
            for (let viewId in campaignData.views) {
              batch.set(
                store.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("views").doc(viewId),
                campaignData.views[viewId]
              );
            }
            batch.commit()
              .then(resp => {
                store.collection("users").doc(userId).set({activeCampaignId: campaignId})
                  .then(resp => {
                    dispatch(actions.setCampaignEdit(false));
                    if (followUpHandler) followUpHandler();
                    console.log("[saveIntroCampaignData] success saving intro campaign");
                  })
                  .catch(err => {
                    console.log("[saveIntroCampaignData] error saving intro campaign (setting activeCampaignId):", err)
                  });
              })
              .catch(err => {
                console.log("[saveIntroCampaignData] error saving intro campaign (batching cards and views):", err)
              });
          }
        })
        .catch(err => {
          console.log("[saveIntroCampaignData] error saving intro campaign (creating new campaign):", err)
        });
    }
  };
};

export const switchCampaign = (campaignId, followUpHandler) => {
  // Note: this does not save data to the server
  const user = getUser();
  return dispatch => {
    if (user) {
      const userId = user.uid;
      store.collection("users").doc(userId).set({activeCampaignId: campaignId})
        .then(resp => {
          dispatch(actions.updActiveCampaignId(campaignId));
          if (followUpHandler) followUpHandler();
          console.log("[switchCampaign] success loading activeCampaignId", campaignId);
        })
        .catch(err => console.log("[switchCampaign] error loading activeCampaignId:", err))
    }
  };
};

export const createCampaign = (followUpHandler) => {
  const user = getUser();
  return dispatch => {
    if (user) {
      const userId = user.uid;
      const campaignData = {
        title: "untitled campaign",
        activeCardId: null, activeViewId: "view0",
        viewOrder: ["view0"], 
        cardCreateCnt: 1, viewCreateCnt: 1,
      };
      // create the campaign
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
                    dispatch(actions.addCampaignToList(campaignId, "untitled campaign"));
                    if (followUpHandler) followUpHandler();
                    console.log("[createCampaign] added campaign:", campaignId);
                  })
                  .catch(err => console.log("[createCampaign] error creating view:", err));
              })
              .catch(err => console.log("[createCampaign] error creating card:", err));
          }
        })
        .catch(err => console.log("[createCampaign] error adding campaign:", err));

    }
  };
};

export const destroyCampaign = (campaignId, followUpHandler) => {
  const user = getUser();
  return dispatch => {
    if (user && campaignId) {
      const userId = user.uid;
      store.collection("users").doc(userId).collection("campaigns").doc(campaignId).delete()
        .then(resp => {
          dispatch(actions.removeCampaignFromList(campaignId));
          if (followUpHandler) followUpHandler();
          console.log("[destroyCampaign] success deleting campaign", campaignId);
        })
        .catch(err => console.log("[destroyCampaign] error deleting campaign:", err));
    }
  };
};