import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './SignUp.scss'
import * as actions from '../../../store/actionIndex';
import Backdrop from '../../UI/Backdrop/Backdrop';

const SignUp = (props) => {
  const {showSignUp, onBackdropClick} = props;
  const dispatch = useDispatch();

  // STATES
  const [email, setEmail] = useState("");
  const [psw, setPsw] = useState("");
  const [displayName, setDisplayName] = useState("");

  // STORE SELECTORS
  const userId = useSelector(state => state.user.userId);
  const emailVerified = useSelector(state => state.user.emailVerified);
  const emailVerificationRequired = useSelector(state => state.user.emailVerificationRequired);
  const userDisplayName = useSelector(state => state.user.displayName);
  const emailSignUpError = useSelector(state => state.dataManager.errorEmailSignUp);

  // FUNCTIONS
  const backdropClickHandler = () => {
    switch (screen) {
      case emailSignUpScreen: return onBackdropClick;
      case emailVerifyScreen: break;
      case accountSetupScreen: break;
      default: return onBackdropClick;
    }
  };

  const emailSignUpHandler = (event) => {
    event.preventDefault();
    dispatch(actions.emailSignUp(email, psw, dispatch));
  };

  const accountSetupHandler = (event) => {
    event.preventDefault();
    dispatch(actions.updateDisplayName(displayName));
  };

  const emailSignUpScreen = (
    <div id="email-sign-up-screen">
      <form id="email-sign-up-form" className="sign-up-form" onSubmit={e => emailSignUpHandler(e)}>
        <div className="form-row">
          <label htmlFor="email">Email</label>
          <input type="email" placeholder="Enter Email" name="email" required
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-row">
          <label htmlFor="psw">Password</label>
          <input type="password" placeholder="Enter Password" name="psw" required 
            value={psw} onChange={e => setPsw(e.target.value)} />
        </div>
        <button type="submit">Sign Up</button>
        <div className="sign-up-error" style={{display: emailSignUpError!=="" ? "block" : "none"}}>{emailSignUpError}</div>
      </form>
      <button>Sign up with Google</button>
      {/* <button>Sign up with Facebook</button> */}
    </div>
  );

  const emailVerifyScreen = (
    <div id="email-verify-screen" >
      <p>Please verify your email by clicking the link in your verification email.</p>
      <button onClick={() => actions.sendEmailVerification()}>Resend Email</button>
    </div>
  );

  const accountSetupScreen = (
    <div id="account-setup-screen" >
      <form id="account-setup-form" className="sign-up-form" onSubmit={e => accountSetupHandler(e)}>
        <div className="form-row">
          <label htmlFor="displayName">Display Name</label>
          <input type="text" placeholder="Enter Display Name" name="displayName" required
            value={displayName} onChange={e => setDisplayName(e.target.value)} />
        </div>
        <button type="submit">Finish Sign Up</button>
      </form>
    </div>
  );

  let show = false;
  let screen = null;
  if (!userId) {
    if (showSignUp) {
      // Step 1
      show = true;
      screen = emailSignUpScreen;
    }
  } else {
    if (emailVerificationRequired && !emailVerified) {
      // Step 2
      show = true;
      screen = emailVerifyScreen;
    } else {
      if (!userDisplayName) {
        // Step 3
        show = true;
        screen = accountSetupScreen;
      }
    }
  }

  return (
    <>
      <Backdrop show={show} clicked={() => backdropClickHandler()} />
      <div id="auth-popup" className={show ? "open": "close"}>
        <h1>DM Kit Sign Up</h1>
        {screen}
      </div>
    </>
  );
};

export default SignUp;