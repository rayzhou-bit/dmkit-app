import { ActionCreators } from 'redux-undo';
import {
  applyActionCode,
  checkActionCode,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  FacebookAuthProvider,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  verifyPasswordResetCode,
} from '@firebase/auth';

import { auth } from './firebase';
import * as actions from '../actionIndex';
import * as fireactions from '../firestoreIndex';

export const getParameterByName = (name) => {
  // Sample action handle URL:
  // https://example.com/usermgmt?mode=resetPassword&oobCode=ABC123&apiKey=AIzaSy...&lang=fr

  let value = window.location.href;
  if (value) {
    value = value.split(name+"=")[1];
  }
  if (value) {
    value = value.split('&')[0];
  }

  return value;
};

// const auth = getAuth();
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

const getUser = () => (auth.currentUser ? auth.currentUser : null);

export const manageUser = ({
  dispatch,
  introCampaignEdit,
  campaignData,
}) => {
  onAuthStateChanged(auth, (user) => {
    console.log('[Status] loading. Triggered by auth listener.');
    dispatch(actions.setStatus('loading'));
    if (user && user.uid) {
      // Signed in
      console.log('[authListener] signed in user:', user.uid);
      dispatch(actions.loadUser(user));
      // prompt user to save intro campaign
      if (introCampaignEdit) {
        let save = window.confirm(
          'Would you like to save your work as a new campaign?'
        );
        if (!save) {
          dispatch(fireactions.fetchCampaignList());
          dispatch(fireactions.fetchActiveCampaignId());
        } else {
          dispatch(
            fireactions.saveIntroProjectData({
              projectData: campaignData,
              callback: () => {
                dispatch(fireactions.fetchCampaignList());
                dispatch(fireactions.fetchActiveCampaignId());
              },
            })
          );
        }
      } else {
        dispatch(fireactions.fetchCampaignList());
        dispatch(fireactions.fetchActiveCampaignId());
      }
    } else {
      // Signed out
      console.log('[authListener] signed out');
      dispatch(actions.unloadUser());
      dispatch(actions.resetSessionManager());
      dispatch(actions.loadIntroCampaign());
      dispatch(ActionCreators.clearHistory());
    }
  });
};

export const updateDisplayName = (displayName) => {
  const user = getUser();
  return (dispatch) => {
    if (user) {
      user
        .updateProfile({ displayName: displayName })
        .then((resp) => {
          console.log('[updateDisplayName] updated displayName:', resp);
          dispatch(actions.updUserDisplayname(displayName));
        })
        .catch((err) =>
          console.log('[updateDisplayName] error updating displayName:', err)
        );
    }
  };
};

export const emailSignIn = ({
  email,
  password,
  callback,
  errorCallback,
}) => (dispatch) => {
  signInWithEmailAndPassword(auth, email, password)
    .then((response) => {
      console.log('[emailSignIn] sign in successful:', response);
      // dispatch(actions.unsetErrorEmailSignIn());  // TODO REMOVE error handled in local state
      if (callback) {
        callback();
      }
    })
    .catch((error) => {
      console.log('[emailSignIn] error:', error.message);
      // dispatch(actions.setErrorEmailSignIn(err.code));  // TODO REMOVE error handled in local state
      if (errorCallback) {
        errorCallback(error.code);
      }
    });
};

export const emailSignOut = () => {
  return (dispatch) =>  signOut(auth)
    .then(console.log('[emailSignout] sign out successful'))
    .catch((err) => console.log('[emailSignOut] error:', err));
};

export const googleSignIn = () => {
  return (dispatch) => signInWithPopup(auth, googleProvider)
    .then((resp) => {
      console.log('[googleSignIn] sign in successful');
      dispatch(actions.unsetErrorGoogleSignUp());
    })
    .catch((err) => {
      console.log('[googleSignIn] error signing up with google:', err);
      dispatch(actions.setErrorGoogleSignUp(err.code));
    });
};

export const facebookSignIn = () => {
  return (dispatch) =>
    signInWithPopup(auth, facebookProvider)
      .then((resp) => {
        console.log('[facebookSignIn] sign in successful');
        dispatch(actions.unsetErrorFacebookSignUp());
      })
      .catch((err) => {
        console.log('[facebookSignIn] error signing up with google:', err);
        dispatch(actions.setErrorFacebookSignUp(err.code));
      });
};

export const emailSignUp = ({
  email,
  password,
  callback,
  errorCallback,
}) => {
  return (dispatch) => createUserWithEmailAndPassword(auth, email, password)
    .then((response) => {
      console.log('[emailSignUp] sign up successful:', response);
      // dispatch(actions.unsetErrorEmailSignUp());
      sendVerificationToEmail();
      if (callback) {
        callback();
      }
    })
    .catch((error) => {
      console.log('[emailSignUp] error:', error);
      // dispatch(actions.setErrorEmailSignUp(error.code));
      if (errorCallback) {
        errorCallback(error.code);
      }
    });
};

export const sendVerificationToEmail = () => {
  return (dispatch) =>
    sendEmailVerification(auth.currentUser)
      .then((resp) =>
        console.log('[sendVerificationToEmail] sent email verification:', resp)
      )
      .catch((err) => console.log('[sendVerificationToEmail] error:', err));
};

export const sendPasswordResetToEmail = ({
  email,
  callback,
  errorCallback,
}) => {
  return (dispatch) => sendPasswordResetEmail(auth, email)
    .then((response) => {
      console.log('[sendPasswordResetToEmail] sent password reset email to:', email, '. ', response);
      // dispatch(actions.unsetErrorPasswordReset());
      if (callback) {
        callback();
      }
    })
    .catch((error) => {
      console.log('[sendPasswordResetToEmail] error:', error);
      // dispatch(actions.setErrorPasswordReset(err.code));
      if (errorCallback) {
        errorCallback(error.code);
      }
    });
};

export const emailActionHandler = () => {
  // TODO: does this need to be implemented?
  document.addEventListener(
    'DOMContentLoaded',
    () => {
      // Sample action handle URL:
      // https://example.com/usermgmt?mode=resetPassword&oobCode=ABC123&apiKey=AIzaSy...&lang=fr
      const mode = getParameterByName('mode');
      const actionCode = getParameterByName('oobCode');
      const continueUrl = getParameterByName('continueUrl');
      switch (mode) {
        case 'resetPassword':
          return handleResetPassword(actionCode, continueUrl);
        case 'recoverEmail':
          return handleRecoverEmail(actionCode);
        case 'verifyEmail':
          return handleVerifyEmail(actionCode, continueUrl);
        default:
          return console.log('[emailActionHandler] invalid mode:', mode);
      }
    },
    false
  );
};

const handleResetPassword = (actionCode, continueUrl) => {
  verifyPasswordResetCode(auth, actionCode)
    .then((email) => {
      // let accountEmail = email;

      // TODO: Show the reset screen with the user's email and ask the user for
      // the new password.
      let newPassword = '...';

      // Save the new password.
      confirmPasswordReset(auth, actionCode, newPassword)
        .then((resp) => {
          // Password reset has been confirmed and new password updated.
          // TODO: Display a link back to the app, or sign-in the user directly
          // if the page belongs to the same domain as the app:
          // auth.signInWithEmailAndPassword(accountEmail, newPassword);
          // TODO: If a continue URL is available, display a button which on
          // click redirects the user back to the app via continueUrl with
          // additional state determined from that URL's parameters.
        })
        .catch((err) => {
          // Error occurred during confirmation. The code might have expired or the
          // password is too weak.
        });
    })
    .catch((err) => {
      // Invalid or expired action code. Ask user to try to reset the password
      // again.
    });
};

const handleRecoverEmail = (actionCode) => {
  // Localize the UI to the selected language as determined by the lang
  // parameter.
  let restoredEmail = null;
  // Confirm the action code is valid.
  checkActionCode(auth, actionCode)
    .then((info) => {
      // Get the restored email address.
      restoredEmail = info['data']['email'];

      // Revert to the old email.
      return applyActionCode(auth, actionCode);
    })
    .then(() => {
      // Account email reverted to restoredEmail

      // TODO: Display a confirmation message to the user.

      // You might also want to give the user the option to reset their password
      // in case the account was compromised:
      sendPasswordResetEmail(auth, restoredEmail)
        .then(() => {
          // Password reset confirmation sent. Ask user to check their email.
        })
        .catch((err) => {
          // Error encountered while sending password reset code.
        });
    })
    .catch((err) => {
      // Invalid code.
    });
};

const handleVerifyEmail = (actionCode, continueUrl) => {
  // Try to apply the email verification code.
  applyActionCode(auth, actionCode)
    .then((resp) => {
      console.log('[handleVerifyEmail] email verified:', resp);
      // Email address has been verified.

      // TODO: Display a confirmation message to the user.
      // You could also provide the user with a link back to the app.

      // TODO: If a continue URL is available, display a button which on
      // click redirects the user back to the app via continueUrl with
      // additional state determined from that URL's parameters.
    })
    .catch((err) =>
      console.log('[handleVerifyEmail] error verifying email:', err)
    );
};
