export const convertToMsg = ({ errorCode }) => {
  switch(errorCode) {
    // config
    case ('auth/auth-domain-config-required'): return 'missing authorization configuration';
    case ('auth/unauthorized-domain'): return 'unauthorized domain';
    case ('auth/operation-not-allowed'): return 'operation not allowed';
    case ('auth/operation-not-supported-in-this-environment'): return 'operation not supported';
    // email / account
    case ('auth/account-exists-with-different-credential'): return 'account for this email already exists';
    case ('auth/email-already-in-use'): return 'email already in use';
    case ('auth/invalid-email'): return 'invalid email';
    // password
    case ('auth/weak-password'): return 'password must be at least 6 characters long';
    case ('auth/wrong-password'): return 'wrong password';
    // user
    case ('auth/user-disabled'): return 'user disabled';
    case ('auth/user-not-found'): return 'user not found';
    // popup
    case ('auth/cancelled-popup-request'): return 'too many sign in popups attempted';
    case ('auth/popup-blocked'): return 'sign in popup blocked';
    case ('auth/popup-closed-by-user'): return 'sign in popup closed';

    default: return 'error code: ' + errorCode;
  }
};
