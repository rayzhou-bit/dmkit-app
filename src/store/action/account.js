import * as actionTypes from '../actionTypes';
import fire from '../../shared/firebase';
import { updateObject } from '../../shared/utilityFunctions';
const db = fire.firestore();

export const authCheck = (user) => {
  // this observes user changes
  return dispatch => {
    fire.auth().onAuthStateChanged(user => {
      
    });
  };
};

export const emailSignIn = (email, psw) => {
  return dispatch => {
    fire.auth().signInWithEmailAndPassword(email, psw)
      .then(user => {
        console.log(user)
      })
      .catch(error => console.log("[emailSignIn] firebase error:", error.code, error.message));
  };
};

export const emailSignUp = (email, psw) => {
  return dispatch => {
    fire.auth().createUserWithEmailAndPassword(email, psw)
      .then(user => {

      })
      .catch(error => console.log("[emailSignUp] firebase error:", error.code, error.message));
  };
};