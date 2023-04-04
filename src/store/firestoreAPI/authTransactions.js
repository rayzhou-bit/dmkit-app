import { 
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from '@firebase/auth';
import { ActionCreators } from 'redux-undo';

import { auth } from './firebase';
import * as actions from '../actionIndex';
import * as fireactions from '../firestoreIndex';
import { getParameterByName } from '../../shared/utilityFunctions';

// const auth = getAuth();
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

const getUser = () => auth.currentUser ? auth.currentUser : null;

export const manageUser = ({
  dispatch,
  introCampaignEdit,
  campaignData,
}) => {
  auth.onAuthStateChanged(user => {
    console.log("[Status] loading. Triggered by auth listener.");
    dispatch(actions.setStatus('loading'));
    if (user && user.uid) {
      // Signed in
      console.log("[authListener] signed in user:", user.uid);
      dispatch(actions.loadUser(user));
      // prompt user to save intro campaign
      if (introCampaignEdit) {
        let save = window.confirm("Would you like to save your work as a new campaign?");
        if (!save) {
          dispatch(fireactions.fetchCampaignList());
          dispatch(fireactions.fetchActiveCampaignId());
        } else {
          dispatch(fireactions.saveIntroCampaignData(campaignData,
            () => {
              dispatch(fireactions.fetchCampaignList());
              dispatch(fireactions.fetchActiveCampaignId());
            }
          ));
        }
      } else {
        dispatch(fireactions.fetchCampaignList());
        dispatch(fireactions.fetchActiveCampaignId());
      }
    } else {
      // Signed out
      console.log("[authListener] signed out");
      dispatch(actions.unloadUser());
      dispatch(actions.resetSessionManager());
      dispatch(actions.loadIntroCampaign());
      dispatch(ActionCreators.clearHistory());
    }
  });
};

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

export const emailSignIn = (email, psw, followUpHandler) => {
  return dispatch => auth.signInWithEmailAndPassword(email, psw)
    .then(resp => {
      console.log("[emailSignIn] sign in successful");
      dispatch(actions.unsetErrorEmailSignIn());
      if (followUpHandler) followUpHandler();
    })
    .catch(err => {
      console.log("[emailSignIn] error:", err.message);
      dispatch(actions.setErrorEmailSignIn(err.code));
    });
};

export const emailSignOut = () => {
  return dispatch => auth.signOut()
    .then(console.log("[emailSignout] sign out successful"))
    .catch(err => console.log("[emailSignOut] error:", err));
};

export const googleSignIn = () => {
  return dispatch => auth.signInWithPopup(googleProvider)
    .then(resp => {
      console.log("[googleSignIn] sign in successful");
      dispatch(actions.unsetErrorGoogleSignUp());
    })
    .catch(err => {
      console.log("[googleSignIn] error signing up with google:", err);
      dispatch(actions.setErrorGoogleSignUp(err.code));
    });
};

export const facebookSignIn = () => {
  return dispatch => auth.signInWithPopup(facebookProvider)
    .then(resp => {
      console.log("[facebookSignIn] sign in successful");
      dispatch(actions.unsetErrorFacebookSignUp());
    })
    .catch(err => {
      console.log("[facebookSignIn] error signing up with google:", err);
      dispatch(actions.setErrorFacebookSignUp(err.code));
    });
};

export const emailSignUp = (email, psw) => {
  return dispatch => auth.createUserWithEmailAndPassword(email, psw)
    .then(resp => {
      console.log("[emailSignUp] sign up successful:", resp);
      dispatch(actions.unsetErrorEmailSignUp());
      sendEmailVerification();
    })
    .catch(err => {
      console.log("[emailSignUp] error:", err);
      dispatch(actions.setErrorEmailSignUp(err.code));
    });
};

export const sendEmailVerification = () => {
  const actionCodeSettings = {
    url: process.env.REACT_APP_CONFIRMATION_EMAIL_REDIRECT,
  };
  return dispatch => auth.currentUser.sendEmailVerification(actionCodeSettings)
    .then(resp => console.log("[sendEmailVerification] sent email verification:", resp))
    .catch(err => console.log("[sendEmailVerification] error:", err));
};

export const sendPasswordResetEmail = (email) => {
  return dispatch => auth.sendPasswordResetEmail(email)
    .then(resp => {
      console.log("[sendPasswordResetEmail] sent password reset email to:", email);
      dispatch(actions.unsetErrorPasswordReset());
    })
    .catch(err => {
      console.log("[sendPasswordResetEmail] error:", err);
      dispatch(actions.setErrorPasswordReset(err.code));
    });
};

export const emailActionHandler = () => {
  // TODO: does this need to be implemented?
  document.addEventListener('DOMContentLoaded', () => {
    // Sample action handle URL:
    // https://example.com/usermgmt?mode=resetPassword&oobCode=ABC123&apiKey=AIzaSy...&lang=fr
    const mode = getParameterByName('mode');
    const actionCode = getParameterByName('oobCode');
    const continueUrl = getParameterByName('continueUrl');
    switch (mode) {
      case 'resetPassword': return handleResetPassword(actionCode, continueUrl);
      case 'recoverEmail': return handleRecoverEmail(actionCode);
      case 'verifyEmail': return handleVerifyEmail(actionCode, continueUrl);
      default: return console.log("[emailActionHandler] invalid mode:", mode);
    }
  }, false);
};

const handleResetPassword = (actionCode, continueUrl) => {
  auth.verifyPasswordResetCode(actionCode)
    .then(email => {
      // let accountEmail = email;

      // TODO: Show the reset screen with the user's email and ask the user for
      // the new password.
      let newPassword = "...";

      // Save the new password.
      auth.confirmPasswordReset(actionCode, newPassword)
        .then(resp => {
          // Password reset has been confirmed and new password updated.

          // TODO: Display a link back to the app, or sign-in the user directly
          // if the page belongs to the same domain as the app:
          // auth.signInWithEmailAndPassword(accountEmail, newPassword);

          // TODO: If a continue URL is available, display a button which on
          // click redirects the user back to the app via continueUrl with
          // additional state determined from that URL's parameters.
        })
        .catch(err => {
          // Error occurred during confirmation. The code might have expired or the
          // password is too weak.
        });
    })
    .catch(err => {
      // Invalid or expired action code. Ask user to try to reset the password
      // again.
  });
};

const handleRecoverEmail = (actionCode) => {
  // Localize the UI to the selected language as determined by the lang
  // parameter.
  let restoredEmail = null;
  // Confirm the action code is valid.
  auth.checkActionCode(actionCode)
    .then(info => {
      // Get the restored email address.
      restoredEmail = info['data']['email'];

      // Revert to the old email.
      return auth.applyActionCode(actionCode);
    })
    .then(() => {
      // Account email reverted to restoredEmail

      // TODO: Display a confirmation message to the user.

      // You might also want to give the user the option to reset their password
      // in case the account was compromised:
      auth.sendPasswordResetEmail(restoredEmail)
        .then(() => {
          // Password reset confirmation sent. Ask user to check their email.
        })
        .catch(err => {
          // Error encountered while sending password reset code.
        });
    })
    .catch(err => {
      // Invalid code.
  });
};

const handleVerifyEmail = (actionCode, continueUrl) => {
  // Try to apply the email verification code.
  auth.applyActionCode(actionCode)
    .then(resp => {
      console.log("[handleVerifyEmail] email verified:", resp);
      // Email address has been verified.

      // TODO: Display a confirmation message to the user.
      // You could also provide the user with a link back to the app.

      // TODO: If a continue URL is available, display a button which on
      // click redirects the user back to the app via continueUrl with
      // additional state determined from that URL's parameters.
    })
    .catch(err => console.log("[handleVerifyEmail] error verifying email:", err));
};