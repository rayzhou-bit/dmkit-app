import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './SignIn.scss';
import * as fireactions from '../../../store/firestoreIndex';

const SignIn = props => {
  const {setShowSignUp, setShowUserDropdown} = props;
  const dispatch = useDispatch();

  // STATES
  const [email, setEmail] = useState("");
  const [psw, setPsw] = useState("");

  // STORE SELECTORS
  const userId = useSelector(state => state.userData.userId);
  const campaignData = useSelector (state => state.campaignData);
  const activeCampaignId = useSelector(state => state.sessionManager.activeCampaignId);
  const emailSignInError = useSelector(state => state.sessionManager.errorEmailSignIn);
  const googleSignInError = useSelector(state => state.sessionManager.errorGoogleSignIn);
  // TODO: implement facebook sign in

  // TODO change sign in errors to local useState by passing handler to sign in

  // FUNCTIONS
  const emailSignIn = (event) => { 
    event.preventDefault(); 
    fireactions.emailSignIn(email, psw, dispatch);
  };
  const googleSignIn = (event) => { 
    event.preventDefault(); 
    fireactions.googleSignIn(dispatch);
  };
  const emailSignOut = (event) => { 
    event.preventDefault(); 
    dispatch(fireactions.saveCampaignData(activeCampaignId, campaignData, 
      fireactions.emailSignOut()
    ));
    setShowUserDropdown(false);
  };
  
  // On sign in or sign out
  useEffect(() => {
    if (userId) {
      setEmail("");
      setPsw("");
      setShowUserDropdown(false);
    }
  }, [userId, setEmail, setPsw, setShowUserDropdown]);

  const signedInContainer = (
    <div id="sign-in-dropdown">
      <form id="email-sign-in-form" onSubmit={e => emailSignIn(e)}>
        <h1>Login</h1>
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
        <button type="submit">Log In</button>
        <div className="sign-in-error" style={{display: emailSignInError!=="" ? "block" : "none"}}>{emailSignInError}</div>
        <div className="sign-up-button" onClick={()=>{setShowSignUp(true); setShowUserDropdown(false);}}>Don't have an account? <br/> Sign up now</div>
      </form>
      <div className="divider" />
      <div id="other-provider-sign-in">
        <button onClick={e => googleSignIn(e)}>Sign In with Google</button>
        <div className="sign-in-error" style={{display: googleSignInError!=="" ? "block" : "none"}}>{googleSignInError}</div>
      </div>
    </div>
  );

  const signedOutContainer = (
    <div id="sign-out" onClick={e => emailSignOut(e)}>Sign Out</div>
  );

  return (userId ? signedInContainer : signedOutContainer);
};

export default SignIn;