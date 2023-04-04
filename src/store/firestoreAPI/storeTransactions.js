import {
  doc,
  addDoc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
} from '@firebase/firestore';

import { auth, db } from './firebase';
import * as actions from '../actionIndex';
import { updateObject } from '../../shared/utilityFunctions';
import { GRID } from '../../shared/constants/grid';

// User contains uid, email, emailVerified (check firebase for more)
const getUser = () => auth.currentUser ? auth.currentUser : null;

const firstTimeSetup = (userId) => {
  return dispatch => {
    if (userId) {
      setDoc(doc(db, "users", userId), { activeCampaignId: null })
        .then(resp => {
          console.log("[firstTimeSetup] success performing first time setup");
          console.log("[Status] idle. Triggered by first time setup completion.");
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
      getDoc(doc(db, "users", userId))
        .then(resp => {
          if (resp.exists) {
            dispatch(actions.updActiveCampaignId(resp.data().activeCampaignId));
            if (!resp.data().activeCampaignId) {
              dispatch(actions.unloadCampaignData());
              console.log("[Status] idle. Triggered by lack of server side activeCampaignId.");
              dispatch(actions.setStatus('idle'));
            };
            console.log("[fetchActiveCampaignId] success loading activeCampaignId", resp.data().activeCampaignId);
          } else dispatch(firstTimeSetup(userId));
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
      getDocs(collection(db, "users", userId, "campaigns"))
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
      getDoc(doc(db, "users", userId, "campaigns", campaignId))
        .then(campaign => {
          if (campaign.exists) {
            campaignData = updateObject(campaignData, campaign.data());
            // CARD data
            getDocs(collection(db, "users", userId, "campaigns", campaignId, "cards"))
              .then(cardSnapshot => {
                let cardCollection = {};
                cardSnapshot.forEach(card => {
                  cardCollection = updateObject(cardCollection, {[card.id]: card.data()});
                });
                campaignData = updateObject(campaignData, {cards: cardCollection});
                // VIEW data
                getDocs(collection(db, "users", userId, "campaigns", campaignId, "views"))
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
                  .catch(err => console.log("[fetchCampaignData] error loading views:", err));
              })
              .catch(err => console.log("[fetchCampaignData] error loading cards:", err));
          } else console.log("[fetchCampaignData] campaign", campaignId, "does not exist for this user");
        })
        .catch(err => console.log("[fetchCampaignData] error loading campaign:", err));
    }
  };
};

export const saveCampaignData = (campaignId, campaignData, followUpHandler) => {
  const user = getUser();
  return dispatch => {
    if (user && campaignId) {
      console.log("[Status] saving. Triggered by save.");
      dispatch(actions.setStatus('saving'));
      const userId = user.uid;
      const batch = db.writeBatch();
      // CAMPAIGN data
      let campaignPackage = {...campaignData};
      delete campaignPackage.cards;
      delete campaignPackage.views;
      batch.set(
        doc(db, "users", userId, "campaigns", campaignId),
        campaignPackage
      );
      // CARD data
      for (let cardId in campaignData.cards) {
        batch.set(
          doc(db, "users", userId, "campaigns", campaignId, "cards", cardId),
          campaignData.cards[cardId]
        );
      }
      // VIEW data
      for (let viewId in campaignData.views) {
        batch.set(
          doc(db, "users", userId, "campaigns", campaignId, "views", viewId),
          campaignData.views[viewId]
        );
      }
      // SAVE DATA (BATCH COMMIT)
      batch.commit()
        .then(resp => {
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
      console.log("[Status] saving. Triggered by intro campaign save.");
      dispatch(actions.setStatus('saving'));
      const userId = user.uid;
      // CAMPAIGN data
      let campaignPackage = {...campaignData};
      delete campaignPackage.cards;
      delete campaignPackage.views;
      addDoc(collection(db, "users", userId, "campaigns"), campaignPackage)
        .then(resp => {
          const campaignId = resp.id;
          if (campaignId) {
            const batch = db.writeBatch();
            // CARD data
            for (let cardId in campaignData.cards) {
              batch.set(
                doc(db, "users", userId, "campaigns", campaignId, "cards", cardId),
                campaignData.cards[cardId]
              );
            }
            // VIEW data
            for (let viewId in campaignData.views) {
              batch.set(
                doc(db, "users", userId, "campaigns", campaignId, "views", viewId),
                campaignData.views[viewId]
              );
            }
            batch.commit()
              .then(resp => {
                updateDoc(doc(db, "users", userId), {
                  activeCampaignId: campaignId,
                })
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
      updateDoc(doc(db, "users", userId), {
        activeCampaignId: campaignId,
      })
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
      addDoc(collection(db, "users", userId, "campaigns"), campaignData)
        .then(resp => {
          const campaignId = resp.id;
          if (campaignId) {
            // create the card
            setDoc(doc(db, "users", userId, "campaigns", campaignId, "cards", "card0"), {
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
            }, {
              merge: true,
            })
              .then(resp => {
                // create the view
                setDoc(doc(db, "users", userId, "campaigns", campaignId, "views", "view0"), {
                  title: "view0",
                  color: "gray",
                }, {
                  merge: true
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

export const copyCampaign = (campaignId, followUpHandler) => {
  // should save before copy
  const user = getUser();
  return dispatch => {
    if (user) {
      const userId = user.uid;
      // fetch CAMPAIGN
      getDoc(doc(db, "users", userId, "campaigns", campaignId))
        .then(campaign => {
          if (campaign.exists) {
            let campaignData = campaign.data();
            campaignData.title = campaignData.title + " (copy)";
            // copy CAMPAIGN
            addDoc(collection(db, "users", userId, "campaigns"), campaignData)
              .then(resp => {
                console.log("[copyCampaign] copied campaign level info");
                const copiedCampaignId = resp.id;
                if (copiedCampaignId) {
                  // fetch CARDS
                  getDocs(collection(db, "users", userId, "campaigns", campaignId, "cards"))
                    .then(cardSnapshot => {
                      // copy CARDS
                      const cardBatch = db.writeBatch();
                      cardSnapshot.forEach(card => {
                        cardBatch.set(
                          doc(db, "users", userId, "campaigns", copiedCampaignId, "cards", card.id),
                          card.data()
                        );
                      });
                      cardBatch.commit()
                        .then(resp => {
                          console.log("[copyCampaign] copied cards");
                          // fetch VIEWS
                          getDocs(collection(db, "users", userId, "campaigns", campaignId, "views"))
                            .then(viewSnapshot => {
                              // copy VIEWS
                              const viewBatch = db.writeBatch();
                              viewSnapshot.forEach(view => {
                                viewBatch.set(
                                  doc(db, "users", userId, "campaigns", copiedCampaignId, "views", view.id),
                                  view.data()
                                );
                              })
                              viewBatch.commit()
                                .then(resp => {
                                  console.log("[copyCampaign] copied views");
                                  // CLEANUP
                                  dispatch(fetchCampaignList());
                                  if (followUpHandler) followUpHandler();
                                })
                                .catch(err => console.log("[copyCampaign] error copying view data"))
                            })
                            .catch(err => console.log("[copyCampaign] error fetching view data"));
                        })
                        .catch(err => console.log("[copyCampaign] error copying card data"))
                    })
                    .catch(err => console.log("[copyCampaign] error fetching card data"))
                }
              })
              .catch(err => console.log("[copyCampaign] error copying campaign data"));
          }
        })
        .catch(err => console.log("[copyCampaign] error fetching campaign data"));
    }
  };
};

export const destroyCampaign = (campaignId, followUpHandler) => {
  const user = getUser();
  return dispatch => {
    if (user && campaignId) {
      const userId = user.uid;
      deleteDoc(doc(db, "users", userId, "campaigns", campaignId))
        .then(resp => {
          dispatch(actions.removeCampaignFromList(campaignId));
          if (followUpHandler) followUpHandler();
          console.log("[destroyCampaign] success deleting campaign", campaignId);
        })
        .catch(err => console.log("[destroyCampaign] error deleting campaign:", err));
    }
  };
};