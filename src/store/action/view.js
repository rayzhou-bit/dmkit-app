import * as actionTypes from '../actionTypes';
import fire from '../../shared/fire';
const db = fire.firestore();

// <-----REDUCER CALLS----->
const updViewTitle = (view, title) => { return { type: actionTypes.UPD_VIEW_TITLE, view: view, title: title }; };
const updViewOrder = (data) => { return { type: actionTypes.UPD_VIEW_ORDER, data: data }; };
const updViewEdited = (view, edited) => { return { type: actionTypes.UPD_VIEW_EDITED, view: view, edited: edited }; };
const queueViewDelete = (view) => { return { type: actionTypes.QUEUE_VIEW_DELETE, view: view }; };
const clearViewDelete = () => {return { type: actionTypes.CLEAR_VIEW_DELETE }; };
const updActiveView = (data) => { return { type: actionTypes.UPD_ACTIVE_VIEW, data: data }; };
// <-----REDUCER CALLS----->

export const fetchViews = (userId, campaignId, activeView) => {
  const viewsRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("views");
  const campaignRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId);
  return dispatch => {
    viewsRef.get()
      .then(snapshot => {
        snapshot.forEach(view => {
          let title = view.data().title ? view.data().title : "untitled";
          dispatch(updViewTitle(view.id, title));
          console.log("[fetchViews] firebase fetched view:", view.id);
        });
      })
      .catch(error => console.log("[fetchViews] firebase error:", error));
    campaignRef.get()
      .then(doc => {
        if (doc.exists && doc.data().viewOrder) {
          dispatch(updViewOrder(doc.data().viewOrder));
          console.log("[fetchViews] firebase updated viewOrder:", doc.data().viewOrder);
          if (!activeView) {
            dispatch(updActiveView(doc.data().viewOrder[0]));
            console.log("[fetchViews] updated activeView:", doc.data().viewOrder[0]);
          }
        }
      })
      .catch(error => console.log("[fetchViews] firebase error:", error));
  };
};

export const saveEditedViewData = (userId, campaignId, views, viewOrder, viewDelete) => {
  const viewsRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("views");
  const campaignRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId);
  return dispatch => {
    let batch = db.batch();
    for (let view in views) {
      if (views[view].edited) {
        let viewRef = viewsRef.doc(view);
        let dataPackage = views[view];
        delete dataPackage.edited;
        batch.set(viewRef, dataPackage);
        console.log("[saveEditedViewData] batched edit:", view);
      }
    }
    for (let view in viewDelete) {
      let viewRef = viewsRef.doc(view);
      batch.delete(viewRef);
      console.log("[saveEditedViewData] batched delete:", view);
    }
    batch.set(campaignRef, {viewOrder: viewOrder}, {merge: true});
    console.log("[saveEditedViewData] batched viewOrder:", viewOrder);
    batch.commit()
      .then(response => {
        console.log("[saveEditedViewData] firebase response:", response);
        for (let view in views) {
          if (views[view].edited) {
            dispatch(updViewEdited(view, false));
          }
        }
        dispatch(clearViewDelete());
      })
      .catch(error => console.log("[saveEditedViewData] firebase error:", error));
  };
};

export const createView = (userId, campaignId, viewOrder) => {
  const viewsRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("views");
  let dataPackage = { title: "untitled" + viewOrder.length };

  return dispatch => {
    viewsRef.add(dataPackage)
      .then(response => {
        console.log("[createView] firebase added view:", response.id);
        dispatch(updViewTitle(response.id, "untitled" + viewOrder.length));
        dispatch(updViewEdited(response.id, true));
        console.log("[createView] added view:", response.id);
        let newViewOrder = viewOrder;
        newViewOrder.push(response.id);
        dispatch(updViewOrder(newViewOrder));
      })
      .catch(error => console.log("[createView] firebase error:", error));
  };
};

export const removeView = (userId, campaignId, viewOrder, viewId) => {
  return dispatch => {
    let newViewOrder = [...viewOrder].filter(x => {return x !== viewId});
    dispatch(updViewTitle(viewId, null));
    dispatch(updViewOrder(newViewOrder));
    dispatch(queueViewDelete(viewId));
    console.log("[removeView] removed view:", viewId);
  };
};

export const saveViewTitle = (userId, campaignId, viewId, newTitle) => {
  return dispatch => {
    dispatch(updViewTitle(viewId, newTitle));
    dispatch(updViewEdited(viewId, true));
    console.log("[saveViewData] updated view:", viewId);
  };
};

export const onClickView = (userId, campaignId, activeView, viewId) => {
  return dispatch => dispatch(updActiveView(viewId));
};