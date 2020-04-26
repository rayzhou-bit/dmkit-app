import * as actionTypes from './actionTypes';
import fire from '../shared/fire';

export const savePOS = (e, data) => {
  let db = fire.firestore();
  db.collection("position").doc("testId").set({
    x: data.x,
    y: data.y,
  }).then(response => {
    console.log(response);
  }).catch(error => {
    console.log('ERROR ' + error);
  });

  return {
    type: actionTypes.SAVE_POS,
    position: {
      x: data.x,
      y: data.y,
    },
  }
};

export const loadPOS = () => {
  let db = fire.firestore();
  let dbData = null;
  db.collection("position").doc("testId").get().then(response => {
    if(response.exists) {
      dbData = response.data();
    }
  }).catch(error => {
    console.log('ERROR ' + error);
  });
  console.log(dbData)
  
  return {
    type: actionTypes.LOAD_POS,
    position: {
      x: dbData.x,
      y: dbData.y,
    },
  }
};