import {
  applyActionCode,
  checkActionCode,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  FacebookAuthProvider,
  getAdditionalUserInfo,
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
import { actions, clearHistory } from '../redux';
import * as api from '../api/database';

export const auth = getAuth();
// export const isNewUser = getAdditionalUserInfo();
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const getUser = () => auth.currentUser ?? null;
export const getUserId = () => auth.currentUser ? auth.currentUser.uid : null;

export const authListener = ({
  dispatch,
  saveProject,
  projectId,
  projectData,
}) => {
  onAuthStateChanged(auth, user => {
    if (user) {   // User is signed in
      console.log('[authListener] signed in user:', user.uid);
      const userData = {
        userId: user.uid,
        displayName: user.displayName,
        email: user.email,
        emailVerified: user.emailVerified,
        providerId: user.providerId,
        providerData: user.providerData,
      };
      dispatch(actions.user.loadUser({ ...userData }));

      if (saveProject) {
        dispatch(api.save(projectId, projectData, () => {
          dispatch(api.fetchActiveProjectId());
          dispatch(api.fetchProjects());
        }));
      } else {
        dispatch(api.fetchActiveProjectId());
        dispatch(api.fetchProjects());
      }
    } else {      // User is signed out
      console.log('[authListener] signed out');
      dispatch(actions.project.loadIntroProject());
      dispatch(actions.session.loadIntro());
      dispatch(actions.user.initialize());
      dispatch(clearHistory());
    }
  });
};

export const emailSignIn = ({
  email,
  password,
  callback,
  errorCallback,
}) => dispatch => {
  signInWithEmailAndPassword(auth, email, password)
    .then(response => {
      console.log('[emailSignIn] sign in successful:', response);
      if (callback) {
        callback();
      }
    })
    .catch(error => {
      console.log('[emailSignIn] error:', error.message);
      if (errorCallback) {
        errorCallback(error.code);
      }
    });
};

export const emailSignOut = () => {
  signOut(auth)
    .then(response => console.log('[emailSignout] success'))
    .catch(error => console.log('[emailSignOut] error', error));
};

export const googleSignIn = ({
  callback,
  errorCallback,
}) => dispatch => {
  console.log(callback)
  signInWithPopup(auth, googleProvider)
    .then(response => {
      console.log('[googleSignIn] success');
      if (callback) {
        callback();
      }
    })
    .catch(error => {
      console.log('[googleSignIn] error', error);
      if (errorCallback) {
        errorCallback(error.code);
      }
    });
};

// export const facebookSignIn = () => dispatch => {
//   signInWithPopup(auth, facebookProvider)
//     .then(response => console.log('[facebookSignIn] success'))
//     .catch(error => console.log('[facebookSignIn] error', error));
// };

export const emailSignUp = ({
  email,
  password,
  callback,
  errorCallback,
}) => dispatch => {
  createUserWithEmailAndPassword(auth, email, password)
    .then(response => {
      console.log('[emailSignUp] sign up successful:', response);
      sendVerificationToEmail();
      if (callback) {
        callback();
      }
    })
    .catch(error => {
      console.log('[emailSignUp] error:', error);
      if (errorCallback) {
        errorCallback(error.code);
      }
    });
};

export const sendVerificationToEmail = () => dispatch => {
  sendEmailVerification(getUser())
    .then(response => console.log('[sendVerificationToEmail] success', response))
    .catch(error => console.log('[sendVerificationToEmail] error', error));
};

export const sendPasswordResetToEmail = ({
  email,
  callback,
  errorCallback,
}) => dispatch => {
  sendPasswordResetEmail(auth, email)
    .then(response => {
      console.log('[sendPasswordResetToEmail] sent password reset email to:', email, '. ', response);
      if (callback) {
        callback();
      }
    })
    .catch(error => {
      console.log('[sendPasswordResetToEmail] error:', error);
      if (errorCallback) {
        errorCallback(error.code);
      }
    });
};

const handleResetPassword = (actionCode, continueUrl) => {
  verifyPasswordResetCode(auth, actionCode)
    .then(email => {
      // let accountEmail = email;

      // TODO: Show the reset screen with the user's email and ask the user for
      // the new password.
      let newPassword = '...';

      // Save the new password.
      confirmPasswordReset(auth, actionCode, newPassword)
        .then(response => {
          // Password reset has been confirmed and new password updated.
          // TODO: Display a link back to the app, or sign-in the user directly
          // if the page belongs to the same domain as the app:
          // auth.signInWithEmailAndPassword(accountEmail, newPassword);
          // TODO: If a continue URL is available, display a button which on
          // click redirects the user back to the app via continueUrl with
          // additional state determined from that URL's parameters.
        })
        .catch(error => {
          // Error occurred during confirmation. The code might have expired or the
          // password is too weak.
        });
    })
    .catch(error => {
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
    .then(info => {
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
        .catch(error => {
          // Error encountered while sending password reset code.
        });
    })
    .catch(error => {
      // Invalid code.
    });
};

const handleVerifyEmail = (actionCode, continueUrl) => {
  // Try to apply the email verification code.
  applyActionCode(auth, actionCode)
    .then(response => {
      console.log('[handleVerifyEmail] success', response);
      // Email address has been verified.

      // TODO: Display a confirmation message to the user.
      // You could also provide the user with a link back to the app.

      // TODO: If a continue URL is available, display a button which on
      // click redirects the user back to the app via continueUrl with
      // additional state determined from that URL's parameters.
    })
    .catch(error => console.log('[handleVerifyEmail] error', error));
};

export const getParameterByName = (name) => {
  // Sample action handle URL:
  // https://example.com/usermgmt?mode=resetPassword&oobCode=ABC123&apiKey=AIzaSy...&lang=fr
  let value = window.location.href;
  value = value.split(name+"=")[1] ?? '';
  value = value.split('&')[0] ?? '';
  return value;
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
    false,
  );
};
