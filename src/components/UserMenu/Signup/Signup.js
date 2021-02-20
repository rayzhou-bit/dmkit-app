import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './Signup.scss'
import * as actions from '../../../store/actionIndex';
import Backdrop from '../../UI/Backdrop/Backdrop';

const Signup = (props) => {
  const {show, onBackdropClick} = props;

  // STATES
  const [email, setEmail] = useState("");
  const [psw, setPsw] = useState("");

  // STORE SELECTORS

  const emailSignUp = (event) => {
    event.preventDefault();
    actions.sendEmailVerification(email, psw);
  };

  return (
    <>
      <Backdrop show={show} clicked={onBackdropClick} />
      <div id="sign-up-popup" className={show ? "open": "close"}>
        <h1>Sign Up to DM Kit</h1>
        <form id="email-sign-up-form" onSubmit={e => emailSignUp(e)}>
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
          {/* <div className="sign-up-error" style={{display: emailSignInError!=="" ? "block" : "none"}}>{emailSignInError}</div> */}
        </form>
        {/* <button>Sign up with Google</button> */}
        {/* <button>Sign up with Facebook</button> */}
      </div>
    </>
  );
};

export default Signup;