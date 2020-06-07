import * as actionTypes from '../actionTypes';
import fire from '../../shared/fire';

const db = fire.firestore();

export const updView = (id, data) => {
  return {
    type: actionTypes.UPD_VIEW,
    id: id,
    data: data,
  };
};

export const updViewOrder = (data) => {
  return {
    type: actionTypes.UPD_VIEW_ORDER,
    data: data,
  };
};

export const updActiveView = (data) => {
  return {
    type: actionTypes.UPD_ACTIVE_VIEW,
    data: data,
  }
}

export const fetchViews = (userId, campaignId, activeView) => {
  const viewsRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("views");
  let viewOrder = [];

  return dispatch => {
    viewsRef.onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.doc.id === "viewOrder") {
          console.log("[fetchViews] updated viewOrder");
          viewOrder = change.doc.data().viewOrder;
          dispatch(updViewOrder(viewOrder));
          if (!activeView) {
            dispatch(updActiveView(viewOrder[0]));
            console.log("[fetchViews] updated activeView: ", viewOrder[0]);
          }
        } else {
          if (change.type === "added") {
            console.log("[fetchViews] added view:", change.doc.id, change.doc.data());
            dispatch(updView(change.doc.id, change.doc.data()));
          }
          if (change.type === "modified") {
            console.log("[fetchViews] modified view: ", change.doc.data());
            dispatch(updView(change.doc.id, change.doc.data()));
          }
          if (change.type === "removed") {
            console.log("[fetchViews] removed view: ", change.doc.data());
            dispatch(updView(change.doc.id, null));
          }
        }
      });
    });
  };
};

export const addView = (userId, campaignId, viewOrder) => {
  const viewsRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("views");
  const viewOrderRef = viewsRef.doc("viewOrder");
  let dataPackage = { title: "untitled" + viewOrder.length };
  let updatedViewOrder = viewOrder;

  return dispatch => viewsRef.add(dataPackage).then(returnedView => {
    if (updatedViewOrder) {
      updatedViewOrder.push(returnedView.id);
    } else {
      updatedViewOrder = [returnedView.id];
    }
    viewOrderRef.set({viewOrder: updatedViewOrder}).then().catch(error => console.log("[addView] Error: ", error));
  }).catch(error => console.log("[addView] error: ", error));
};

export const removeView = (userId, campaignId, viewOrder, viewId) => {
  const viewsRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("views");
  const viewRef = viewsRef.doc(viewId);
  const viewOrderRef = viewsRef.doc("viewOrder");
  let updatedViewOrder = viewOrder;
  if (updatedViewOrder) {
    updatedViewOrder = updatedViewOrder.filter(view => view != viewId);
  }

  return dispatch => {
    viewRef.delete().then(
      console.log("[removeView] deleted" , viewId)
    ).catch(error => 
      console.log("[removeView] error:", error)
    );
    viewOrderRef.set({viewOrder: updatedViewOrder}).then(
      console.log("[removeView] set viewOrder after deleting")
    ).catch(error => 
      console.log("[removeView] error: ", error)
    );
  };
};

export const onClickView = (userId, campaignId, activeView, viewId) => {
  return dispatch => dispatch(updActiveView(viewId));
};

export const updViewTitle = (userId, campaignId, viewId, newTitle) => {
  const viewRef = db.collection("users").doc(userId).collection("campaigns").doc(campaignId).collection("views").doc(viewId);

  return dispatch => {
    viewRef.set({title: newTitle}, {merge: true}).then(
      console.log("[updViewTitle]", viewId, newTitle)
    ).catch(error => 
      console.log("[updViewTitle] Error: ", error)
    );
  };
};