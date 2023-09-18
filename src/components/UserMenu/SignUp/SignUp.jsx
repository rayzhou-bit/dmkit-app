import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './SignUp.scss'
import * as fireactions from '../../../store/firestoreIndex';
import Backdrop from '../../UI/Backdrop/Backdrop';

const SignUp = (props) => {
  const {showSignUp, onBackdropClick} = props;
  const dispatch = useDispatch();

  // STATES
  const [email, setEmail] = useState("");
  const [psw, setPsw] = useState("");
  const [inputDisplayName, setInputDisplayName] = useState("");

  // STORE SELECTORS
  const {userId, displayName, emailVerified, emailVerificationRequired} = useSelector(state => state.userData);
  const emailSignUpError = useSelector(state => state.sessionManager.errorEmailSignUp);

  // FUNCTIONS
  const backdropClickHandler = () => {
    switch (screen) {
      case emailSignUpScreen: return onBackdropClick();
      case emailVerifyScreen: break;
      case accountSetupScreen: break;
      default: return onBackdropClick;
    }
  };

  // TODO: check verification periodically?

  const emailSignUpHandler = (event) => {
    event.preventDefault();
    dispatch(fireactions.emailSignUp(email, psw));
  };

  const accountSetupHandler = (event) => {
    event.preventDefault();
    dispatch(fireactions.updateDisplayName(inputDisplayName));
  };

  const emailSignUpScreen = (
    <div className="email-sign-up-screen">
      <form className="sign-up-form" onSubmit={e => emailSignUpHandler(e)}>
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
    </div>
  );

  const emailVerifyScreen = (
    <div className="email-verify-screen">
      <p>Please verify your email by clicking the link in your verification email.</p>
      <button onClick={() => dispatch(fireactions.sendVerificationToEmail())}>Resend Email</button>
    </div>
  );

  const accountSetupScreen = (
    <div className="account-setup-screen">
      <form className="sign-up-form" onSubmit={e => accountSetupHandler(e)}>
        <div className="form-row">
          <label htmlFor="displayName">Display Name</label>
          <input type="text" placeholder="Enter Display Name" name="displayName" required
            value={inputDisplayName} onChange={e => setInputDisplayName(e.target.value)} />
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
      if (!displayName) {
        // Step 3
        show = true;
        screen = accountSetupScreen;
      }
    }
  }

  return (
    <>
      <Backdrop show={show} clicked={() => backdropClickHandler()} />
      <div className={show ? "auth-popup show-popup" : "auth-popup hide-popup"}>
        <h1>DM Kit Sign Up</h1>
        {screen}
      </div>
    </>
  );
};

export default SignUp;