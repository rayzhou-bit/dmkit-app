import * as actionTypes from '../actionTypes';
import fire from '../../shared/firebase';
import { updateObject } from '../../shared/utilityFunctions';
const db = fire.firestore();

// <-----SIMPLE VIEW REDUCER CALLS----->
const loadViewColl = (viewColl) => { return { type: actionTypes.LOAD_VIEW_COLL, viewColl: viewColl }; };
const addView = (view, dataPackage) => { return { type: actionTypes.ADD_VIEW, view: view, dataPackage: dataPackage }; };
const deleteView = (view) => { return { type: actionTypes.DELETE_VIEW, view: view }; };
export const updViewTitle = (view, title) => { return { type: actionTypes.UPD_VIEW_TITLE, view: view, title: title }; };
export const updViewColor = (view, color) => { return { type: actionTypes.UPD_VIEW_COLOR, view: view, color: color }; };

// <-----SIMPLE VIEWMANAGE REDUCER CALLS----->
const loadViewOrder = (viewOrder) => { return { type: actionTypes.LOAD_VIEW_ORDER, viewOrder: viewOrder }; };
const saveEditedView = (view) => { return { type: actionTypes.SAVE_EDITED_VIEW, view: view }; };
const addToViewOrder = (view) => { return { type: actionTypes.ADD_TO_VIEW_ORDER, view: view }; };
const deleteFromViewOrder = (view) => { return { type: actionTypes.DELETE_FROM_VIEW_ORDER, view: view }; };
const queueViewDelete = (view) => { return { type: actionTypes.QUEUE_VIEW_DELETE, view: view }; };
// const dequeueViewDelete = (view) => { return { type: actionTypes.DEQUEUE_VIEW_DELETE, view: view }; };
const clearViewDelete = () => {return { type: actionTypes.CLEAR_VIEW_DELETE }; };
const updActiveView = (view) => { return { type: actionTypes.UPD_ACTIVE_VIEW, view: view }; };

// <-----COMPLEX CALLS----->
export const fetchViewColl = (user, campaign, activeView) => {
  const viewCollRef = db.collection("users").doc(user).collection("campaigns").doc(campaign).collection("views");
  const campaignRef = db.collection("users").doc(user).collection("campaigns").doc(campaign);
  return dispatch => {
    viewCollRef.get()
      .then(snapshot => {
        console.log("[fetchViewColl] firebase success: loaded", snapshot.size, "views");
        let viewColl = {};
        snapshot.forEach(view => {
          viewColl = updateObject(viewColl, {
            [view.id]: view.data()
          });
        });
        dispatch(loadViewColl(viewColl));
      })
      .catch(error => console.log("[fetchViewColl] firebase error:", error));
    campaignRef.get()
      .then(doc => {
        if (doc.exists && doc.data().viewOrder) {
          dispatch(loadViewOrder(doc.data().viewOrder));
          console.log("[fetchViewColl] firebase success: loaded viewOrder", doc.data().viewOrder);
          if (!activeView) {
            dispatch(updActiveView(doc.data().viewOrder[0]));
            console.log("[fetchViewColl] set activeView", doc.data().viewOrder[0]);
          }
        }
      })
      .catch(error => console.log("[fetchViewColl] firebase error:", error));
  };
};

export const saveViews = (user, campaign, viewColl, viewDelete, viewOrder) => {
  const viewCollRef = db.collection("users").doc(user).collection("campaigns").doc(campaign).collection("views");
  const campaignRef = db.collection("users").doc(user).collection("campaigns").doc(campaign);
  return dispatch => {
    let batch = db.batch();
    for (let view in viewColl) {
      if (viewColl[view].edited) {
        let viewRef = viewCollRef.doc(view);
        let dataPackage = viewColl[view];
        delete dataPackage.edited;
        batch.set(viewRef, dataPackage);
        console.log("[saveViews] batch set:", viewColl[view]);
      }
    }
    for (let view in viewDelete) {
      let viewRef = viewCollRef.doc(viewDelete[view]);
      batch.delete(viewRef);
      console.log("[saveViews] batch delete:", viewDelete[view]);
    }
    batch.set(campaignRef, {viewOrder: viewOrder}, {merge: true});
    console.log("[saveViews] batch viewOrder:", viewOrder);
    batch.commit()
      .then(response => {
        console.log("[saveViews] firebase response:", response);
        for (let view in viewColl) {
          if (viewColl[view].edited) {
            dispatch(saveEditedView(view));
          }
        }
        dispatch(clearViewDelete());
      })
      .catch(error => console.log("[saveViews] firebase error:", error));
  };
};

export const setViewCreate = (user, campaign, viewOrder) => {
  const viewCollRef = db.collection("users").doc(user).collection("campaigns").doc(campaign).collection("views");
  const campaignRef = db.collection("users").doc(user).collection("campaigns").doc(campaign);
  let dataPackage = { 
    title: "untitled"
  };
  return dispatch => {
    viewCollRef.add(dataPackage)
      .then(response => {
        const newViewId = response.id;
        console.log("[setViewCreate] firebase success: added view", newViewId);
        dispatch(addView(newViewId, dataPackage));
        // Update viewOrder if adding view is successful
        let newViewOrder = [...viewOrder];
        newViewOrder.push(newViewId);
        campaignRef.set({viewOrder: newViewOrder}, {merge: true})
          .then(response => {
            console.log("[setViewCreate] firebase success: updated viewOrder");
            dispatch(addToViewOrder(newViewId));
          })
          .catch(error => console.log("[setViewCreate] firebase error in updating viewOrder:", error));
      })
      .catch(error => console.log("[setViewCreate] firebase error in adding view:", error));
  };
};

export const setViewDelete = (view) => {
  return dispatch => {
    dispatch(deleteView(view));
    dispatch(queueViewDelete(view));
    dispatch(deleteFromViewOrder(view));
  };
};

export const onClickView = (view) => {
  return dispatch => dispatch(updActiveView(view));
};